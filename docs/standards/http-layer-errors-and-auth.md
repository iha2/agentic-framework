---
last_updated_at: 2026-05-25
---

# HTTP layer errors and auth

Status codes, error envelopes, authentication, authorization, and permission seed-data verification. Voice:
[docs-hygiene.md](./docs-hygiene.md).

## Status codes

### 422 for all validation failures

Every route MUST return `422 UNPROCESSABLE_ENTITY` for validation (schema or manual `apiflask.abort`). MUST NOT return
400 for validation (`VALIDATION_ERROR_STATUS_CODE` in `v1/__init__.py`).

### Desired ✅

```python
apiflask.abort(
    HTTPStatus.UNPROCESSABLE_ENTITY.value,
    message=HTTPStatus.UNPROCESSABLE_ENTITY.phrase,
    detail={"json": {"name": ["already in use"]}},
)
```

### Not desired ❌

```python
apiflask.abort(400, message="Bad Request", detail={...})
```

### 204 for empty-result GET, 404 for unknown resource

Successful empty-result GET → `204 NO_CONTENT` (and in `@bp.doc(responses=...)`). `404` ONLY for unknown resource (ID
miss, registry miss). Mutation success with no body also uses 204.

### Desired ✅

```python
except NoDataForReportError:
    return Response(status=HTTPStatus.NO_CONTENT.value)
```

### Not desired ❌

```python
if not result.rows:
    apiflask.abort(HTTPStatus.NOT_FOUND.value, ...)
```

## Error responses

`message` is always an HTTPStatus phrase; field/dev text lives in structured `detail`.

### `message=HTTPStatus.X.phrase`; never leak `str(exc)`

MUST use `message=HTTPStatus.<NAME>.phrase`. MUST NOT put `str(exc)` in `message=` or public `detail` — use
`logger.exception(...)`.

Canonical shapes:

- 422: `detail={"json": {"<field>": ["<message>"]}}`
- 404: `detail={"<entity>": "<dev-facing message>"}`
- 500: `detail={"error": "<safe generic>"}` + `logger.exception(exc)`

### Desired ✅

```python
except svc.report.ReportGenerationError as exc:
    logger.exception(exc)
    apiflask.abort(
        HTTPStatus.INTERNAL_SERVER_ERROR.value,
        message=HTTPStatus.INTERNAL_SERVER_ERROR.phrase,
        detail={"error": "Report generation failed"},
    )
```

### Not desired ❌

```python
except svc.report.ReportGenerationError as exc:
    apiflask.abort(..., message=str(exc), detail={"error": str(exc)})
```

### Wrap field-keyed detail under `"json"`

Field-keyed `detail` MUST nest under `"json"`. Generic `{"error": "..."}` MUST NOT.

### Desired ✅

```python
apiflask.abort(..., detail={"json": {"roles": ["unknown role"]}})
```

### Not desired ❌

```python
apiflask.abort(..., detail={"roles": str(e)})
```

### Translating "unknown resource" exceptions

`message=HTTPStatus.NOT_FOUND.phrase`; exception text in `detail` keyed by entity — not in `message`.

### Desired ✅

```python
except UnknownReportError:
    abort(HTTPStatus.NOT_FOUND.value, message=HTTPStatus.NOT_FOUND.phrase,
          detail={"report_name": f"Unknown report: {report_name}"})
```

### Not desired ❌

```python
except UnknownReportError as exc:
    apiflask.abort(HTTPStatus.NOT_FOUND.value, message=str(exc))
```

## Authentication and permissions

`require_permissions()` for JWT + permissions; rare any-auth: `@jwt_required()`. Unless called out, every route
requires ≥ `login` ([http-layer-guide.md](./http-layer-guide.md)).

### `ROUTE_REQUIRED_PERMISSIONS` and decorator placement

Module-level `ROUTE_REQUIRED_PERMISSIONS: Final[set[PermissionName]]` from `svc.permission` constants — MUST NOT use
bare strings. `@require_permissions` between `@bp.doc` and `@bp.output`.

### Desired ✅

```python
ROUTE_REQUIRED_PERMISSIONS: Final[set[PermissionName]] = {LOGIN, PIPELINE_CREATE}

@bp.route("", methods=["POST"])
@bp.input(PipelineCreateJSONInputSchema)
@bp.doc(...)
@require_permissions(*ROUTE_REQUIRED_PERMISSIONS)
@bp.output(PipelineCreateResponseSchema, status_code=HTTPStatus.CREATED.value)
def create_pipeline_view(json_data: PipelineCreateJSONInput) -> PipelineCreateResponse: ...
```

### Not desired ❌

```python
@require_permissions("pipeline.create")
def create_pipeline_view(...): ...
```

### Permission names

`<entity>.<verb>` lowercase singular entity (`account`, `dataprovider`); verbs `create|read|update|delete` as needed.
Sole exception: bare `login`. Python constant: screaming-snake from string (`account.read` → `ACCOUNT_READ`),
alphabetized in `svc/permission.py` and seed SQL.

### Desired ✅

```python
ACCOUNT_CREATE: Final[PermissionName] = PermissionName("account.create")
ACCOUNT_READ: Final[PermissionName] = PermissionName("account.read")
LOGIN: Final[PermissionName] = PermissionName("login")
```

### Wiring a new `@require_permissions` endpoint end-to-end

Same PR MUST:

1. Declare constant in `svc/permission.py` (+ `ALL_PERMISSIONS`), alphabetized.
1. Use in `ROUTE_REQUIRED_PERMISSIONS` — no bare strings.
1. Seed row in `R__seed_permissions.sql` (alphabetized MERGE values).
1. Bust Flyway checksum on `R__seed_roles.sql` via `-- Last re-run trigger:` comment so admin grant-all re-runs.

### Desired ✅

```python
# permission.py + route ROUTE_REQUIRED_PERMISSIONS as above
```

```sql
-- R__seed_permissions.sql
('pipeline.create', 'Can create new pipelines'),
-- R__seed_roles.sql
-- Last re-run trigger: 2026-05-25 — added pipeline.{create,read,update}.
```

### Not desired ❌

```python
@require_permissions("pipeline.create")  # no seed / no roles checksum bust
```
