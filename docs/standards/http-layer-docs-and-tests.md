---
last_updated_at: 2026-05-25
---

# HTTP layer documentation and tests

Governs OpenAPI documentation, error-path tests, and iteration patterns for HTTP endpoints.

## OpenAPI documentation

`@bp.doc(...)` is canonical for every response shape a route may emit — APIFlask builds the `/docs` OpenAPI spec from it; clients infer error contracts from declared responses.

### Document 422 (and every other emitted status)

Every route that can `apiflask.abort(HTTPStatus.UNPROCESSABLE_ENTITY.value, ...)` MUST declare 422 in `@bp.doc(responses=...)`. Use `HTTPStatus.UNPROCESSABLE_ENTITY.phrase` for `description`. Undeclared error codes are omitted from OpenAPI; clients need every emitable status.

### Desired

```python
@bp.doc(
    summary="Create a new pipeline",
    description=ROUTE_OPENAPI_DESCRIPTION,
    security=["BearerAuth"],
    responses={
        HTTPStatus.CREATED.value: {
            "description": HTTPStatus.CREATED.phrase,
            "content": {"application/json": {"schema": PipelineCreateResponseSchema}},
        },
        HTTPStatus.UNPROCESSABLE_ENTITY.value: {
            "description": HTTPStatus.UNPROCESSABLE_ENTITY.phrase,
        },
        HTTPStatus.UNAUTHORIZED.value: {
            "description": HTTPStatus.UNAUTHORIZED.phrase,
            "content": {"application/json": {"schema": AuthenticationErrorSchema}},
        },
        HTTPStatus.FORBIDDEN.value: {
            "description": HTTPStatus.FORBIDDEN.phrase,
            "content": {"application/json": {"schema": AuthorizationErrorSchema}},
        },
        HTTPStatus.INTERNAL_SERVER_ERROR.value: {
            "description": HTTPStatus.INTERNAL_SERVER_ERROR.phrase,
            "content": {"application/json": {"schema": InternalServerErrorResponseSchema}},
        },
    },
)
```

### Not desired

```python
@bp.doc(responses={200: {...}})  # wrong: route emits 422 but it's missing from docs
```

### Route description and permissions trailer

Each endpoint defines module-level `ROUTE_OPENAPI_DESCRIPTION: Final[str]` ending with `generate_openapi_permissions_trailer(ROUTE_REQUIRED_PERMISSIONS)` so `/docs` lists required permissions. View functions MUST NOT carry docstrings — summary/description come from `@bp.doc`; a Python docstring duplicates content APIFlask does not surface (http-layer-guide.md §Endpoint Module).

### Desired

```python
ROUTE_OPENAPI_DESCRIPTION: Final[str] = f"""
Create a new pipeline.

Any special considerations when creating pipelines.
---
{generate_openapi_permissions_trailer(ROUTE_REQUIRED_PERMISSIONS)}
"""

@bp.route("", methods=["POST"])
...
def create_pipeline_view(json_data: PipelineCreateJSONInput) -> PipelineCreateResponse:
    # DO NOT provide a function docstring; rely on @bp.doc summary= and description=
    ...
```

### Exercise new endpoints via `/docs`

Before marking a PR ready, exercise each new endpoint via the documented local API docs URL (commonly `<LOCAL_API_BASE_URL>/docs`). A successful response proves registration, `@require_permissions`, and data-layer reachability — integration failures unit tests may miss. Not a substitute for automated tests; catches misconfigurations (seed permissions, route registration, DB) faster than review alone.

## Error-path tests

Error-path HTTP tests MUST lock the no-leak invariant. Status-only tests pass while bodies leak internals. Pattern: mock the service exception with internal markers (paths, sproc names, schema fields); assert each marker absent from the body; assert canonical shape (`message == HTTPStatus.<STATUS>.phrase`; `detail` only safe fields); name the test `_without_leaking_internals`.

### Desired

```python
def test_get_report_generation_error_returns_500_without_leaking_internals(
    test_app_for_http_layer, auth_headers,
):
    underlying_message = "renderer crashed; diagnostic_marker=raw_backend_detail"
    with patch("http_api.v1.report.report_get.run_report", autospec=True) as mock_run:
        mock_run.side_effect = ReportGenerationError(underlying_message)
        response = test_app_for_http_layer.test_client().get("/v1/report/foo?...", headers=auth_headers)

    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    body_text = response.data.decode("utf-8")
    assert underlying_message not in body_text
    assert "renderer crashed" not in body_text
    assert "raw_backend_detail" not in body_text

    body = response.get_json()
    assert body["message"] == HTTPStatus.INTERNAL_SERVER_ERROR.phrase
    assert body["detail"] == {"error": "Report generation failed"}
```

### Not desired

```python
def test_get_report_generation_error_returns_500(client, mocker):
    mocker.patch("svc.report.run", side_effect=ReportGenerationError("..."))
    response = client.get("/v1/report/foo")
    assert response.status_code == 500  # wrong: status-only; body may leak
```

Deeper mocking/fixtures/naming: see the python-testing standard.

## Iteration patterns

When iterating a filtered collection, extract the filter as a named intermediate; iterate that. Inlined `continue` guards obscure intent — named filtered collections keep the loop on action.

### Desired

```python
publically_viewable_accounts = filter(
    lambda item: item.username not in settings.hidden_account_usernames,
    account_items,
)
for public_account in publically_viewable_accounts:
    ...
```

### Not desired

```python
for account in api_accounts:
    if account.username in settings.hidden_account_usernames:
        continue  # wrong: guard inside the loop body obscures intent
    ...
```

Prefer long descriptive names over short ones — small keystroke cost; large readability gain for humans and agents.
