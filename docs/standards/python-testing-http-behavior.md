---
last_updated_at: 2026-05-25
---

# Python testing HTTP and behavior checks

HTTP error-path tests, migration-skip discipline, concrete behavior checks, and consolidation. Voice:
[docs-hygiene.md](./docs-hygiene.md). Complements [http-layer.md](./http-layer.md) and
[python-testing.md](./python-testing.md).

## HTTP route error-path tests — assert no internal leak

Error-path HTTP tests MUST lock the no-leak invariant (status-only tests miss body leaks).

1. Mock service exception with internal markers in the message.
1. Assert each marker absent from the response body.
1. Assert canonical shape: `message == HTTPStatus.<STATUS>.phrase`; `detail` only safe fields.
1. Name ending `_without_leaking_internals`.

### Desired ✅

```python
def test_get_report_generation_error_returns_500_without_leaking_internals(client, mocker):
    mocker.patch("svc.report.run", side_effect=ReportGenerationError(
        "renderer crashed; diagnostic_marker=raw_backend_detail"))
    response = client.get("/v1/report/foo")
    body = response.get_json()
    assert response.status_code == 500
    assert "renderer crashed" not in str(body) and "raw_backend_detail" not in str(body)
    assert body["message"] == HTTPStatus.INTERNAL_SERVER_ERROR.phrase
    assert body["detail"] == {"error": "Report generation failed"}
```
### Not desired ❌

```python
def test_get_report_generation_error_returns_500(client, mocker):
    mocker.patch("svc.report.run", side_effect=ReportGenerationError("..."))
    assert client.get("/v1/report/foo").status_code == 500
```

Apply to every 4xx/5xx mapping path (PDF and JSON). For 422 with structured `detail`, assert status + envelope; when
message text could leak (esp. 500), assert absence explicitly.

```python
def test_create_link_name_conflict_returns_422(...) -> None:
    with patch("svc.links.insert_link", autospec=True) as mock_insert:
        mock_insert.side_effect = LinkNameInUseError("Link Name is already in use")
        response = test_app_for_http_layer.test_client().post("/v1/link", headers=auth_headers, json=valid_body)
    assert response.status_code == HTTPStatus.UNPROCESSABLE_ENTITY
    data = response.get_json()
    assert data["message"] == HTTPStatus.UNPROCESSABLE_ENTITY.phrase
    assert "link_name" in data["detail"]["locations"]["json"]
```

## Migration discipline — no skip-on-missing-migration commits

MUST NOT commit skips for `"sproc is not yet deployed"` (or equivalent). Remediate: hold the test until migration
lands, or unit-mock until integration can run. Empty-table skips (`"No Links found in test database"`) remain OK.

### Desired ✅

```python
@pytest.mark.db
def test_create_link_inserts_row(transactional_db_connection):
    # Sproc deployed; test runs
    ...
```

### Not desired ❌

```python
@pytest.mark.db
@pytest.mark.skip(reason="the sproc is not yet deployed to the test database")
def test_create_link_inserts_row(transactional_db_connection): ...
```

PR check: no `@pytest.mark.skip` / `pytest.skip(...)` gating missing migrations. Stale schema → pull, migrate, regenerate
— do not paper over with skip.

## Test concrete behaviors, not abstract properties

Tests MUST exercise public interfaces with realistic inputs and assert observable outputs (return, exception, side
effect). MUST NOT rely on source introspection, AST, or mock call-ordering as the sole proof. Synthetic inputs that
bypass caller validation protect nothing — match entry point to the consuming boundary.

## Prefer fewer, multi-scenario tests over many single-case tests

Consolidate when setup is identical and cases vary only by input/expected output (e.g. error-mapping matrices). Separate
functions when setup genuinely differs.

### Desired ✅

```python
@pytest.mark.parametrize(
    ("sproc_error", "expected_exception"),
    [
        (SomeSprocError("not found"), EntityNotFoundError),
        (SomeSprocError("duplicate"), EntityConflictError),
        (SomeSprocError("invalid ref"), InvalidReferenceError),
    ],
    ids=["not-found", "duplicate", "invalid-ref"],
)
def test_create_entity_translates_sproc_errors(dud_connection_factory, sproc_error, expected_exception):
    with dud_connection_factory() as conn, patch(
        "svc.entity.app_InsertEntity.exec_sproc", autospec=True, side_effect=sproc_error,
    ):
        with pytest.raises(expected_exception):
            create_entity(data=VALID_DATA, connection=conn)
```

### Not desired ❌

```python
def test_create_entity_not_found_error(dud_connection_factory): ...  # identical setup
def test_create_entity_duplicate_error(dud_connection_factory): ...
def test_create_entity_invalid_ref_error(dud_connection_factory): ...
```

## Every test must justify its existence

If a test cannot fail under a plausible behavior-preserving refactor, remove it. Names and bodies MUST agree.

| Anti-pattern | Signal | Remedy |
| --- | --- | --- |
| Source-text introspection | `inspect.getsource`, AST/regex on bodies | Sandbox + observable consequence, or delete |
| Framework/type tautology | frozen dataclass assign, `required=True` schema, Enum self-eq | Delete; rely on types/framework |
| Naming dishonesty | Name promises X, body asserts Y | Re-verify name + assertion together |
| Trivial assertions | `is not None`, `len >= 0`, redundant `isinstance` | Strengthen or delete |

### Desired ✅

```python
def test_run_report_does_not_write_files(tmp_path: Path, monkeypatch):
    monkeypatch.chdir(tmp_path)
    run_report(report_request, db_connection=dud_connection_factory(...))
    assert list(tmp_path.iterdir()) == []
```

### Not desired ❌

```python
def test_run_report_does_not_write_files():
    src = inspect.getsource(run_report)
    assert not re.search(r"\bopen\s*\(", src)
```
