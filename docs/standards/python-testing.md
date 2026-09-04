---
last_updated_at: 2026-06-10
---

# Python testing

Organization, naming, unit vs integration, `db` marker, and exact-message assertions for the backend. Voice:
[docs-hygiene.md](./docs-hygiene.md).

## Why each test exists

Every test MUST carry a docstring (even a one-liner restating the name). Quirky rationale goes in a comment beneath.

### Desired ✅

```python
def test_create_account_prevents_duplicates_account_with_same_email(...) -> None:
    """Test that creating an account fails with expected error when the same email is used."""
    ...

def test_batch_validation_rejects_mixed_movement_types() -> None:
    """Confirm that batch validation rejects mixed movement types"""
    # legacy Desktop exports mix MovementType="H" header rows with transactions
    ...
```

## Test layout and naming

Mirror production under `backend/tests/`:

```
backend/tests/
├── conftest.py
├── data/sprocs/test_<sproc>.py
├── svc/test_<module>.py          # + reports/, tickets/ trees
└── http_api/v1/<resource>/test_<endpoint>.py
```

Service tests: banner comment per function; happy-path unit then integration. HTTP tests: nested `TestX` classes
(success, errors, validation, authorization). Names encode assertion: `test_<action>_<condition>_returns_<status>`
(HTTP); `test_<function>_<behavior>` (service/data).

### Desired ✅

```python
# ── get_all_links ──
def test_get_all_links_returns_list_of_links(...) -> None: ...

@pytest.mark.db
def test_get_all_links_integration(transactional_db_connection: Connection) -> None: ...

class TestSwapLinkDataProviderMappingErrors:
    def test_source_junction_missing_returns_404(...): ...
    def test_duplicate_target_returns_409(...): ...
```

## Unit tests for display and data-shaping

Transform/format logic MUST be unit-tested with constructed rows — MUST NOT use `@pytest.mark.db` when no DB behavior
is exercised.

### Desired ✅

```python
def test_groups_locations_by_state():
    rows = [Row(state="TX", ...), Row(state="OK", ...), Row(state="TX", ...)]
    assert len(build_document(rows).sections["TX"].rows) == 2
```

### Not desired ❌

```python
@pytest.mark.db
@pytest.mark.parametrize("display_state", DISPLAY_STATES)
def test_grouping_per_state(transactional_db_connection, display_state):
    insert_locations(transactional_db_connection, ...)
```

Service unit tests: `dud_connection_factory` + `patch(...exec_sproc)`; assert forwarded sproc args. Prefer row-factory
fixtures that default a typical row.

```python
def test_insert_link_passes_sproc_arguments(dud_connection_factory) -> None:
    with dud_connection_factory() as connection, patch(
        "svc.links.app_InsertLink.exec_sproc", autospec=True,
    ) as mock_exec_sproc:
        mock_exec_sproc.return_value = {"LinkID": 1}
        insert_link(data=MINIMAL_INSERT_DATA, connection=connection)
    assert mock_exec_sproc.call_args.kwargs["sproc_args"].LinkName == MINIMAL_INSERT_DATA.link_name
```

## Happy-path integration test per service-layer PR

Every service-layer PR MUST include ≥1 integration test on the real DB (`transactional_db_connection` or equivalent).
Unit-only coverage is insufficient to merge. Edge cases stay unit-scoped.

### Desired ✅

```python
@pytest.mark.db
def test_insert_link_integration(transactional_db_connection: Connection) -> None:
    """Inserts a Link; transactional fixture rolls back — no cleanup."""
    result_id = insert_link(
        data=InsertLinkData(link_name="IntTstLnk", link_description="..."),
        connection=transactional_db_connection,
    )
    assert isinstance(result_id, int) and result_id > 0
```

### Not desired ❌

```python
def test_create_link_calls_sproc(mocker):
    mock_exec = mocker.patch("data.sprocs.app_InsertLink.exec_sproc")
    svc.links.create_link(...)
    mock_exec.assert_called_once()
```

## The `db` marker — actual DB-state only

`@pytest.mark.db` ONLY when the scenario needs real DB rows (sproc mapping, `NO_ROWS_FOUND`, join shape, pymssql
coercion). Misuse inflates integration runs; omission leaks DB tests into the unit suite.

### Desired ✅

```python
@pytest.mark.db
def test_get_all_links_integration(transactional_db_connection: Connection) -> None:
    result = get_all_links(connection=transactional_db_connection)
    if not result:
        pytest.skip("No Links found in test database")
    assert all(isinstance(link, Link) and link.id > 0 for link in result)
```

### Not desired ❌

```python
@pytest.mark.db
@pytest.mark.parametrize("display_state", DISPLAY_STATES)
def test_grouping_per_state(transactional_db_connection, display_state): ...
```

Wide parametrize over the same SQL path belongs in unit tests. Convergence/fixture-matrix tests that pin full
sproc→service round-trips are legitimate `-m db` use.

## Assert the exact message, not a menu of alternatives

MUST assert the real output string. MUST NOT or-chain alternative messages.

### Desired ✅

```python
assert result.exit_code != 0
assert "No customer group found with ID 999999999" in result.output
```

### Not desired ❌

```python
assert (
    "InvalidCustomerSegment" in result.output
    or "999999999" in result.output
    or "no rows" in result.output.lower()
)
```

## Related standards

- [http-layer.md](./http-layer.md) — response-body / error-mapping contracts for route tests
- [data-layer.md](./data-layer.md) — sproc tests under `backend/tests/data/sprocs/`
- [service-layer.md](./service-layer.md) — drives `backend/tests/svc/` layout
- [reports.md](./reports.md) — report-specific test rules
- [database.md](./database.md) — migration discipline for no-skip-on-missing-migration
- [python-testing-http-behavior.md](./python-testing-http-behavior.md) — HTTP no-leak, skips, consolidation
