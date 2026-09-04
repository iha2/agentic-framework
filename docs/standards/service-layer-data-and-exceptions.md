---
last_updated_at: 2026-05-25
---

# Service layer data and exceptions

Governs service-layer dataclasses, result shapes, exception text, helper docstrings, and replace-semantics naming.

## Data classes

`Update*Data` → `@dataclass(frozen=True)`. `Insert*Data` → plain `@dataclass` (mutable assembly). Domain-result dataclasses (`Link`, `Ticket`, …) → plain `@dataclass`; types: UTC `datetime`, `Decimal`, `NewType` IDs from `types_.py`, `Literal["Y", "N"]` for char flags.

### Desired

```python
@dataclass(frozen=True)
class UpdateLinkData:
    """PATCH — only non-None fields written."""
    link_name: str | None = None
    link_description: str | None = None

@dataclass
class InsertLinkData:
    link_name: str
    link_description: str
```

### Not desired

```python
@dataclass
class UpdateLinkData:  # MUST be frozen=True
    name: str
```

### Legacy column asymmetries — annotate at assignment

When a row-mapper reads a legacy/asymmetric column name (e.g. `UpdateBy` vs `UpdatedOn`), the assignment line MUST carry an inline comment naming the asymmetry — not a dataclass docstring or module note.

#### Desired

```python
updated_by=row["UpdateBy"],  # DB column is "UpdateBy" (not "UpdatedBy") — legacy
updated_on=row["UpdatedOn"].replace(tzinfo=UTC),
```

#### Not desired

```python
updated_by=row["UpdateBy"],  # silent asymmetry
```

### Domain types from `types_.py`

Service signatures MUST accept/return domain types (`AccountExternalID`, `RoleName`, …), not raw `str`/`int`/`UUID`. HTTP/CLI parse at the seam. Residual format checks the type cannot enforce (e.g. `ROLE_NAME_PATTERN`) MAY stay as defense-in-depth. Full annotations required (`mypy --strict`).

#### Desired

```python
def create_role(*, name: RoleName, display_name: str,
                permission_names: list[PermissionName],
                connection: pymssql.Connection) -> Role: ...
```

## Exception messages

Service exception text is developer/log/CLI-facing: include entity ID, failing field, expected state. HTTP MUST NOT put `str(exc)` in public `message` — use `HTTPStatus.<NAME>.phrase`; service text may appear in structured `detail` when safe (see http-layer.md). Routes: `logger.exception(exc)`; CLI: `click.echo(f"Error: {exc}", err=True)`.

### Desired

```python
class UnknownReportError(ValueError):
    def __init__(self, report_name: str) -> None:
        super().__init__(f"Unknown report: {report_name}")
```

### Not desired

```python
class UnknownReportError(ValueError):
    def __init__(self) -> None:
        super().__init__("Not Found")
```

## Internal-helper docstrings

`_` helpers / module-private functions: short docstring for WHY (constraint or non-obvious duty). MUST NOT restate body/signature. Public entry points MAY keep Args/Returns/Raises for route/CLI consumers.

### Desired

```python
def _validate_params(...) -> None:
    """Defensive gate for non-public callers; primary validation is upstream."""
```

### Not desired

```python
def _validate_params(report_name, params):
    """Validate the params dict... Iterates over expected keys... Args: ..."""
```

## Naming and replace-semantics

Function name (+ first docstring sentence) MUST make replace vs amend vs partial-update predictable. Prefer `update_account_roles` + "Atomically replace an account's role set." over ambiguous `set_account_roles`.

### Desired

```python
def update_account_roles(...) -> list[RoleListItem]:
    """Atomically replace an account's role set."""
```

### Not desired

```python
def set_account_roles(...):  # ambiguous replace-vs-amend
    ...
```

### PATCH-vs-replace at dataclass level

PATCH sprocs → `Update*Data` fields `... | None = None` + docstring states PATCH. Signature conventions: explicit `connection: pymssql.Connection` (no `g`/thread-local); keyword-only `data:` after `*,`; no JSON pre-serialization in service; audit `username` defaults to `"FIXTHIS"` until wired.
