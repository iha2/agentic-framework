---
last_updated_at: 2026-05-25
---

# Data Layer

Python + SQL Server via `pymssql.callproc`. `backend/src/data/sprocs/` = one wrapper module per sproc — sole seam between Python and sprocs. ORM/Postgres/other stacks: replace with equivalent seam rules.

## Overview

Each wrapper exposes: `SPROC_NAME`, `SprocArguments`, `SprocReturnCode`, `exec_sproc(...)`, optional `SprocDataResultReturnRow` + `SPROC_RETURN_ROW_COLUMN_NAMES`, wrapper-local `StoredProcedureCallError` subclasses. Service builds `SprocArguments`, calls `exec_sproc`. MUST NOT call `cursor.execute`/`callproc` for sprocs from `svc/`.

```text
backend/src/data/sprocs/
├── __init__.py   # shared exceptions + __all__
├── util.py       # validate_column_names
├── app_*.py      # one module per sproc
└── …
```

Shared exceptions: `StoredProcedureCallError` (base + `ERROR_MESSAGE` ClassVar), `DatabaseErrorReturnCodeError`, `MismatchedColumnsError`, `UnexpectedStoredProcedureCallError`. Entity-specific subclasses when business-distinct.

## Service / data boundary

All sproc access through wrappers. Multi-sproc transactions: compose `exec_sproc` on a shared connection — MUST NOT drop to raw SQL.

### Desired ✅

```python
from data.sprocs import app_CreateRole
sproc_args = app_CreateRole.SprocArguments(Name=name, DisplayName=display_name, Description=description)
app_CreateRole.exec_sproc(sproc_args=sproc_args, connection=connection)
```

### Not desired ❌

```python
cursor.execute("INSERT INTO Role (Name) VALUES (%s)", (name,))
```

## SprocArguments

### Mirror SQL parameter surface in full

Every declared SQL parameter → dataclass field. MUST NOT omit and hardcode inside `exec_sproc` (hides API). MUST NOT invent undeclared fields. Exception: `@ErrorMessage OUTPUT` handled via `pymssql.output(str, None)` — document omission with a comment.

#### Desired ✅

```python
@dataclass
class SprocArguments:
    ProductDescription: str
    ProductName: str
    Username: str = "FIXTHIS"
    # @ErrorMessage: OUTPUT in exec_sproc
```

#### Not desired ❌

```python
@dataclass
class SprocArguments:
    ProductDescription: str  # ProductName hardcoded in exec_sproc
```

### Qualified PascalCase matching SQL

Field names MUST match SQL exactly. `app_*`: qualified PascalCase (`AccountId`, `VendorID`). `legacy_*`: Hungarian (`lDataProviderID`) + `# noqa: N815`; docstring MUST include IMPORTANT fidelity note. Bare `id` forbidden when multiple entities in scope.

#### Desired ✅

```python
@dataclass
class SprocArguments:
    AccountId: UUID
    GrantedById: UUID
    RoleName: str

# legacy
@dataclass
class SprocArguments:
    """IMPORTANT: names MUST match SQL including Hungarian; # noqa: N815."""
    lDataProviderID: int | Literal[-1] = -1  # noqa: N815
```

#### Not desired ❌

```python
@dataclass
class SprocArguments:
    id: str  # ambiguous
    granter: str
```

### No-arg sprocs still define empty `SprocArguments`

```python
@dataclass
class SprocArguments:
    pass
```

### `CHAR(1)` flags → `Literal["Y", "N"]`

Not Python `bool`. Pass through callproc without conversion.

### Document hardcoded/omitted params

Commented-out field or one-line note so the dataclass still shows the full SQL signature.
