---
last_updated_at: 2026-05-25
---

# HTTP layer

Translates HTTP ↔ typed service I/O, maps errors to status responses, enforces `@require_permissions`. One endpoint per file; route-specific dataclasses/schemas alongside the view. Binding on `backend/src/http_api/`.

## Directory layout

```text
src/http_api/
├── app.py, auth_decorators.py, jwt.py, util.py
└── v1/
    ├── account/   # __init__.py blueprint + account_*.py endpoints + shared.py
    ├── auth/, health/, lookups/, ticket/, ...
    └── shared/    # CALLER_BARRED_DEFAULT_NONE, errors.py
```

One shared blueprint per resource `__init__.py`; endpoint modules attach routes. Files: `<resource>_<action>.py`; views suffix `_view`; inputs `*QueryInput` / `*HeadersInput` / `*JSONInput`. Shared tiers: app-wide under `http_api/`; version-wide under `v1/shared/`; resource-wide in `<resource>/shared.py`; route-specific stays in endpoint file.

### Lookup endpoints

Under `v1/lookups/`: no pagination; slim model (`id`/`name`/`code`); filter-only (no sort/page). Naming: `Lookup<Entity>`, `ListLookup<Entity>sQueryInput`, `ListLookup<Entity>sResponse`, `list_lookup_<entity>s_view()`.

#### Desired

```python
@dataclass
class LookupLocation:
    id: int
    name: str
    code: str | None

@dataclass
class ListLookupLocationsQueryInput:
    data_provider_id: int | None
    pipeline_id: int | None
    customer_segment_id: int | None

@dataclass
class ListLookupLocationsResponse:
    data: list[LookupLocation]
    total_count: int

@bp.route("/location", methods=["GET"])
@bp.input(ListLookupLocationsQueryInputSchema, location="query")
@bp.doc(...)
@require_permissions(*ROUTE_REQUIRED_PERMISSIONS)
@bp.output(ListLookupLocationsResponseSchema)
def list_lookup_locations_view(query_data: ListLookupLocationsQueryInput) -> ListLookupLocationsResponse: ...
```

### Bugsnag routes

`v1/bugsnag/` exercises monitoring only — MUST NOT use as REST pattern. Mounted only when `settings.bugsnag_testing_endpoints_enabled`.

## Blueprints

Exactly one `APIBlueprint` per resource `__init__.py`. Import endpoint modules below `bp` with `# noqa: F401` to avoid circular imports. App factory registers each blueprint individually.

### Desired

```python
bp = APIBlueprint("foobar", __name__, url_prefix="/v1/foobar")
from http_api.v1.foobar import foobar_create, foobar_list  # noqa: F401
```

## Decorator order

Canonical: `@bp.route` → `@bp.input` (if any) → `@bp.doc` → `@require_permissions` → `@bp.output` (final). Wrong order breaks OpenAPI/middleware assembly. POST: `@bp.input(..., location="json")` between route and doc; GET list: `location="query"` (and headers when needed).

### Desired

```python
@bp.route("", methods=["GET"])
@bp.doc(summary="List links", description=ROUTE_OPENAPI_DESCRIPTION, security=["BearerAuth"], responses={...})
@require_permissions(*ROUTE_REQUIRED_PERMISSIONS)
@bp.output(LinkListResponseSchema)
def list_links_view() -> LinkListResponse: ...
```

### Not desired

```python
@bp.route("", methods=["GET"])
@bp.output(LinkListResponseSchema)  # before @bp.doc / @require_permissions
@bp.doc(...)
@require_permissions(*ROUTE_REQUIRED_PERMISSIONS)
def list_links_view(): ...
```

### POST endpoint — Desired

```python
ROUTE_REQUIRED_PERMISSIONS: Final[set[PermissionName]] = {LOGIN, PIPELINE_CREATE}
ROUTE_OPENAPI_DESCRIPTION: Final[str] = f"""
Create a new pipeline. Successful response is 201 with the new pipeline ID.
---
{generate_openapi_permissions_trailer(ROUTE_REQUIRED_PERMISSIONS)}
"""

@bp.route("", methods=["POST"])
@bp.input(PipelineCreateJSONInputSchema, location="json")
@bp.doc(summary="Create a new pipeline", description=ROUTE_OPENAPI_DESCRIPTION,
        security=["BearerAuth"], responses={...})
@require_permissions(*ROUTE_REQUIRED_PERMISSIONS)
@bp.output(PipelineCreateResponseSchema, status_code=HTTPStatus.CREATED.value)
def create_pipeline_view(json_data: PipelineCreateJSONInput) -> PipelineCreateResponse: ...
```

## Related standards

- http-layer-schemas-and-responses.md / http-layer-errors-and-auth.md / http-layer-docs-and-tests.md
- http-layer-guide.md — directory/naming scaffolding
- service-layer + python-testing — adjacent layers
