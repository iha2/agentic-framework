---
last_updated_at: 2026-05-25
---

# HTTP layer schemas and responses

Governs HTTP input schemas, dataclass pairing, optional fields, response schemas, and response sourcing.

## Schemas and dataclass pairing

In route files, each marshmallow `Schema` MUST sit immediately below the `@dataclass` it serializes. MUST NOT group all dataclasses then all schemas.

### Desired

```python
@dataclass
class CreateAccountInput:
    username: str
    roles: list[RoleName]

class CreateAccountInputSchema(apiflask.schemas.Schema):
    username = apiflask.fields.String(required=True)
    roles = apiflask.fields.List(
        apiflask.fields.String(validate=validate.OneOf([r.value for r in RoleName])),
        required=True,
    )
    @post_load
    def make_input(self, data: Mapping[str, Any], **_: Any) -> CreateAccountInput:
        return CreateAccountInput(
            username=data["username"],
            roles=cast(list[RoleName], data["roles"]),
        )
```

### Input dataclass naming

JSON body: `<Resource>CreateJSONInput` / `<Resource>UpdateJSONInput` + `Schema` suffix. Reject `*PayloadInput` or inverted `Update<Resource>Input`. Query/headers: `*QueryInput` / `*HeadersInput`.

### Domain-typed fields

Dataclass fields MUST use domain types (`list[RoleName]`), not `list[str]`. Schema validates via `OneOf`; `@post_load` `cast`s. Service trusts typed params — MUST NOT re-validate caller intent at every layer.

### Desired

```python
@dataclass
class CreateAccountInput:
    roles: list[RoleName]
```

### Not desired

```python
@dataclass
class CreateAccountInput:
    roles: list[str]
```

### Cast, don't re-comprehend

Validated list fields → single `cast` in `@post_load`. MUST NOT re-loop with `[PermissionName(p) for p in ...]`. Custom field only when cast pattern repeats enough to justify reuse.

### Desired

```python
permissions=cast(list[PermissionName], data["permissions"]),
```

### Not desired

```python
permissions=[PermissionName(p) for p in data["permissions"]],
```

### Trust the Schema in `@post_load`

Use `data["field"]` direct subscript. MUST NOT defensive `.get()`. Optional fields: declare on Schema with `load_default=...` so the key always exists.

### Desired

```python
return UpdateAccountInput(roles=data["roles"], email=data["email"])
```

### Not desired

```python
roles=data.get("roles", []), email=data.get("email")
```

## Optional fields and nullability

Omit-allowed, null-forbidden (dataclass still gets `None`): `load_default=CALLER_BARRED_DEFAULT_NONE`, `allow_none=False` (`http_api.v1.shared`). Explicit null allowed (clear nullable column): `load_default=None`, `allow_none=True`. Update schemas for NOT NULL columns MUST use CALLER_BARRED form — `allow_none=True` on NOT NULL lies in OpenAPI.

### Desired

```python
filter_id = apiflask.fields.Integer(
    required=False, load_default=CALLER_BARRED_DEFAULT_NONE, allow_none=False,
    metadata={"description": "Filter by ID; omit to return all"},
)
```

### Not desired

```python
# NOT NULL column update field
name = apiflask.fields.String(required=False, load_default=None, allow_none=True)
```

### Enum constraints

Validator is sole source of truth (`validate.OneOf` / `fields.Enum`). MUST NOT duplicate `metadata={"enum": [...]}`. Prefer `Literal` + `OneOf` over new Enum unless domain type already exists in `types_.py`.

### Desired

```python
flag = apiflask.fields.String(
    required=True, validate=validate.OneOf(["Y", "N"]),
    metadata={"description": "...", "example": "Y"},
)
```

### Not desired

```python
flag = apiflask.fields.String(
    required=True, validate=validate.OneOf(["Y", "N"]),
    metadata={"description": "...", "example": "Y", "enum": ["Y", "N"]},
)
```

## Response schemas

Every response field MUST carry `metadata={"description": "..."}`.

### Desired

```python
id = apiflask.fields.Integer(required=True, metadata={"description": "Unique identifier for the link."})
```

### Not desired

```python
id = apiflask.fields.Integer(required=True)
```

### List response shape

Lists: top-level `data` array. Aggregates under sibling `aggregates` with dedicated dataclass/schema. No aggregates → `{"data": [...]}` only.

### Sourcing response fields

Build responses from service return values. MUST NOT copy inbound request fields into responses.

### Desired

```python
all_roles = svc.role.list_all_roles(connection=connection)
response_roles = [{"name": r.name, "display_name": r.display_name} for r in all_roles]
```

### Not desired

```python
response_roles = [{"name": r, "display_name": r} for r in data["roles"]]
```

### CRUD update — validate → write → fetch → serialize

After commit, re-read via `get_X()` and serialize. MUST NOT assemble response by mixing inputs with lookups. `get_X()` returns canonical shape including related collections by default.
