---
last_review_sha: 0d2b5358692b73cd4224096ab2cb7e0f4b5ee161
---

# HTTP Layer Design Guide

APIFlask HTTP API patterns: small files owning schemas, route logic, and OpenAPI docs. Voice:
[docs-hygiene.md](./docs-hygiene.md).

## HTTP layer responsibilities

| Concern | Ownership |
| --- | --- |
| Request deserialization | `@bp.input()` + schemas → typed `*QueryInput` / `*JSONInput` / etc. |
| Response serialization | `@bp.output()` + response schemas |
| Error → HTTP | Domain/service errors → standardized HTTP errors |
| OpenAPI | Marshmallow schemas + APIFlask autogen |
| AuthN / AuthZ | Only authenticated (and authorized) callers reach the service layer |

## Directory structure

```
src/http_api/
├── __init__.py
├── app.py                    # Flask application factory
├── auth_decorators.py
├── jwt.py
├── util.py
└── v1/
    ├── account/              # blueprint + per-action modules + shared.py
    ├── auth/
    ├── bugsnag/              # NOT idiomatic REST — see Bugsnag
    ├── health/
    ├── lookups/              # Lookup<Entity> dropdown views
    ├── ticket/
    └── shared/               # version-wide schemas (e.g. errors.py)
```

One endpoint file per action unless an exception is documented. Resource dirs: `account/`, `auth/`, `health/`, etc.

## Lookup endpoints

Constrained dropdown views: **no pagination**, slim fields (`id`/`name`/`code`), hierarchical filtering only.

| Artifact | Pattern |
| --- | --- |
| Type | `LookupPipeline` (not `Pipeline`) |
| Query | `ListLookupPipelinesQuery` |
| Response | `ListLookupPipelinesResponse` |
| View | `list_lookup_pipelines_view()` |

## Security

Use `require_permissions()` (`src/http_api/auth_decorators.py`) for JWT + permission checks. Rare
any-authenticated cases: `@jwt_required()`. Tokens from `/v1/auth/login` (requires `login`). Example requiring
`login` + `account.create`: `src/http_api/v1/account/account_create.py`.

Unless explicitly called out, every route MUST require at least `login`. Public routes (e.g. `/v1/health/healthz`) are
exceptional.

## Naming conventions

| Item | Pattern |
| --- | --- |
| Endpoint file | `<resource>_<action>.py` (`account_list.py`) |
| View | `*_view` (`list_foobar_view`) |
| Inputs | `*QueryInput`, `*HeadersInput`, `*JSONInput` |

One endpoint + its schemas/dataclasses per file unless documented otherwise.

## Shared resources tiers

| Tier | Location | Contents |
| --- | --- | --- |
| App-wide | `http_api/` | `auth_decorators.py`, `util.py` |
| Version-wide | `http_api/v1/shared/` | Multi-resource schemas only (e.g. `errors.py`) |
| Resource | `http_api/v1/<resource>/shared.py` | Shared within one resource |
| Route | endpoint file | Single-endpoint dataclasses/schemas |

## Blueprint organization

### Resource `__init__.py`

```python
# http_api/v1/foobar/__init__.py
from apiflask import APIBlueprint

bp = APIBlueprint("foobar", __name__, url_prefix="/v1/foobar")

from http_api.v1.foobar import (  # noqa: F401 — after bp to avoid circular imports
    foobar_create,
    foobar_list,
)
```

### Endpoint module (list GET)

Schemas follow the dataclass they describe. `# RSN0001` / `# RSN0002` → `docs/reasons-catalog/`. No view docstrings —
use `@bp.doc()`.

```python
# http_api/v1/foobar/foobar_list.py — pattern excerpt
ROUTE_REQUIRED_PERMISSIONS: Final[set[PermissionName]] = {LOGIN}
ROUTE_OPENAPI_DESCRIPTION: Final[str] = f"""
List foobars.
---
{generate_openapi_permissions_trailer(ROUTE_REQUIRED_PERMISSIONS)}
"""

@bp.route("", methods=["GET"])  # type: ignore[type-var] # RSN0001
@bp.input(FoobarListQueryInputSchema, location="query")
@bp.input(FoobarListHeadersInputSchema, location="headers")
@bp.doc(summary="List foobars with pagination", description=ROUTE_OPENAPI_DESCRIPTION,
        security=["BearerAuth"], responses={...})  # type: ignore[arg-type] # RSN0002
@require_permissions(*ROUTE_REQUIRED_PERMISSIONS)
@bp.output(FoobarListResponseSchema)
def list_foobar_view(
    query_data: FoobarListQueryInput,
    headers_data: FoobarListHeadersInput,
) -> FoobarListResponse: ...
```

List response: top-level `data` array. Optional `aggregates` via dedicated `*Aggregates` dataclass/schema. Without
aggregates: `{ "data": [...] }` only.

### Create (POST)

JSON body via `*JSONInput`; `@bp.output(..., status_code=HTTPStatus.CREATED.value)`. Same decorator/permissions/doc
pattern as list.

### Application registration

```python
# http_api/app.py
app.register_blueprint(foobar_bp)  # /v1/foobar/*
```

## Error handling

```python
apiflask.abort(HTTPStatus.BAD_REQUEST.value, HTTPStatus.BAD_REQUEST.phrase,
               detail={"field": "error details"})
```

## Schema organization

Use `apiflask.schemas.Schema` + explicit `apiflask.fields.*`. Keep shapes in the endpoint module unless shared (then
appropriate `shared.py`).

## Schema quirks

### Optional: omit OK, null NOT OK

Use `CALLER_BARRED_DEFAULT_NONE` (`allow_none=False`). `load_default=None` advertises null in OpenAPI.

```python
filter_id = apiflask.fields.Integer(
    required=False, load_default=CALLER_BARRED_DEFAULT_NONE, allow_none=False,
    metadata={"description": "Filter by ID; omit to return all"},
)
```

### Optional: omit and null OK

```python
optional_code = apiflask.fields.String(
    required=False, load_default=None, allow_none=True,
    metadata={"description": "Optional code; omit or send null to clear"},
)
```

### Enum constraints: validators, not metadata

APIFlask emits OpenAPI `enum` from `validate.OneOf` / `apiflask.fields.Enum`. MUST NOT duplicate
`metadata={"enum": [...]}`. Prefer `Literal` + `validate.OneOf` over new Enum classes unless a domain type already
exists in `src/backend/types_.py`.

```python
# Good
flag = apiflask.fields.String(required=True, validate=validate.OneOf(["Y", "N"]),
                              metadata={"description": "...", "example": "Y"})
# Bad — redundant metadata enum
flag = apiflask.fields.String(..., metadata={..., "enum": ["Y", "N"]})
```

## Bugsnag

`src/http_api/v1/bugsnag/` routes are for monitoring debug only — MUST NOT be used as REST convention references.
Blueprint mounts only when a special env var is set.
