---
last_updated_at: 2026-06-10
---

# Service layer

Python `backend/src/svc/` (and `backend/scripts/`): business logic, domain validation, composite ops. No Flask globals,
HTTP, JSON serialization, or connection construction — callers pass connections and consume typed returns. Voice:
[docs-hygiene.md](./docs-hygiene.md).

Sits between `http_api/` and `data/sprocs/`. Composes sproc wrappers; translates sproc-return-code exceptions to
service-typed exceptions. When a PR adds a top-level `svc/` module, update this tree in the same PR:

```text
src/svc/
├── account.py, data_providers.py, links.py, locations.py, permission.py, …
├── lookups/          # slim dropdown views
├── reports/<name>/   # service.py, document.py, formatting, markdown, pdf
└── tickets/          # errors.py + per-operation modules
```

## Composition over raw SQL

Services MUST invoke `data/sprocs/` wrappers. MUST NOT assemble raw SQL, `cursor.execute` against business tables, or
`callproc` directly. Multi-sproc ops compose inside one connection/transaction.

### Desired ✅

```python
def update_account_roles(account_external_id, role_names, connection) -> list[RoleListItem]:
    try:
        app_ClearAccountRoles.exec_sproc(
            sproc_args=app_ClearAccountRoles.SprocArguments(AccountId=account_external_id),
            connection=connection,
        )
    except app_ClearAccountRoles.AccountNotFoundForClearError as e:
        raise AccountNotFoundError(...) from e
    for role_name in role_names:
        try:
            app_AddAccountRole.exec_sproc(...)
        except app_AddAccountRole.AccountRoleNotFoundError as e:
            raise RoleNotFoundError(str(role_name)) from e
```

Source: `backend/src/svc/account.py`.

### Not desired ❌

```python
def update_account_roles(*, account_external_id, role_names, connection):
    with connection.cursor() as cursor:
        cursor.execute("DELETE FROM AccountRole WHERE AccountID = ...")
        for r in role_names:
            cursor.execute("INSERT INTO AccountRole ...")
```

### Closing the post-sproc lookup

Enrichment display lookups with no sproc MAY run on the same connection cursor **after** sproc domain work (or a
read-only pre-sproc display/existence check that doubles as invalid-key detection). Keep SQL inline with a one-line
carve-out comment — MUST NOT collect into a `queries` module. Net-new business-table reads still need their own sproc.

### Do not re-derive what the sproc already computed

MUST NOT re-query/re-sproc to recover a shape the first sproc discarded. Fix in the data layer: additional result sets
from the same working set
([data-layer.md](./data-layer.md#multiple-result-sets--compute-once-return-many)).

## Error classes

Error classes live at file top (after imports/constants), grouped before functions. New errors join that group.

### Desired ✅

```python
class LinkServiceError(Exception): ...
class LinkNotFoundError(LinkServiceError): ...
class LinkNameInUseError(LinkServiceError): ...

@dataclass
class Link: ...

def get_all_links(...) -> list[Link]: ...
```

### Not desired ❌

```python
def create_link(...): ...
class LinkDataProviderConflictError(Exception): ...  # after function bodies
```

### Service-error base per module

Each top-level module defines `<Entity>ServiceError(Exception)`; all domain errors inherit it.

### Field-too-long: parameterized error

Prefer one parameterized class (`field_name: str`) over per-field subclasses. Existing per-field classes are
compatibility leftovers; new modules MUST start parameterized.

#### Desired ✅

```python
class FieldTooLongError(Exception):
    def __init__(self, *, field_name: str) -> None:
        super().__init__(f"{field_name} exceeds maximum length")
        self.field_name = field_name
```

#### Not desired ❌

```python
class NoteMemoFieldTooLongError(Exception): ...
class AddressFieldTooLongError(Exception): ...
```

### Dead error classes

Unreachable error classes MUST be removed, or annotated with the condition that makes them live.

### Annotate when DB compat blocks fine-grained errors

When a generic error exists due to SQL Server compat level, say so in the docstring with a date stamp.

#### Desired ✅

```python
class LinkDuplicateDataError(LinkServiceError):
    """Raised when a unique constraint is violated but we cannot determine which field."""
    # As of 2026/03/03, deployed DB compat is 120 — cannot specify which column duplicated
    pass
```

### Translate every sproc exception at the call site

Catch each wrapper exception explicitly; re-raise service-typed with `str(exc)` and `from exc`. Catch
`UnexpectedStoredProcedureCallError` / `StoredProcedureCallError` last → `<Entity>ServiceError`.

#### Desired ✅

```python
try:
    result = app_InsertLink.exec_sproc(sproc_args=sproc_args, connection=connection)
except app_InsertLink.LinkNameInUseError as exc:
    raise LinkNameInUseError(str(exc)) from exc
except app_InsertLink.LinkDuplicateDataError as exc:
    raise LinkDuplicateDataError(str(exc)) from exc
except (UnexpectedStoredProcedureCallError, StoredProcedureCallError) as exc:
    raise LinkServiceError(str(exc)) from exc
```

## Related standards

- HTTP layer — primary consumer; response-envelope vs `detail` split.
- Data layer — sproc-wrapper conventions composed here.
- [Reports](./reports.md) — report subtree rules on top of this document.
- Python testing — service test placement and fixtures.
- Legacy `service-layer-guide.md` / `service-layer-pr-conventions.md` — read-only inputs.
