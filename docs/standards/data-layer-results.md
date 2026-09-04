---
last_updated_at: 2026-05-25
---

# Data layer results

Governs sproc return-code enums, row TypedDicts, column validation, and multiple result sets.

## SprocReturnCode

### Enumerate every handled code; annotate SQL ErrorCode

`IntEnum` with one member per expected return code. Inline comment names `dbo.Error` code (`gcOK`, `gcNoRowsFound`, …).

```python
class SprocReturnCode(IntEnum):
    """Return codes for `app_InsertProduct`. Values = ErrorIDs from dbo.Error."""
    SUCCESS = 0          # gcOK
    DATABASE_ERROR = 14  # gcDatabaseError
    DUPLICATE_DATA = 15  # gcDuplicateData
    STRING_TOO_LONG = 49 # gcStringTooLong
```

### Docstring: purpose + source-of-truth only

At most two short paragraphs. MUST NOT embed discovery SQL, runtime trivia, or authoring scaffolding — those stay in PR notes.

#### Desired ✅

```python
class SprocReturnCode(IntEnum):
    """Return codes for `app_UpdateVendor`.

    Values are ErrorIDs from the ERROR table in the database.
    """
    SUCCESS = 0; NO_ROWS_FOUND = 1; DATABASE_ERROR = 14  # … gc* comments
```

#### Not desired ❌

```python
class SprocReturnCode(IntEnum):
    """… confirmed via: SELECT ErrorID, ErrorCode FROM dbo.Error WHERE … Note: sproc looks up…"""
```

## Result rows

### `SprocDataResultReturnRow` + derived column names

One `TypedDict` field per SELECT column (SQL order). Derive `SPROC_RETURN_ROW_COLUMN_NAMES` from `__annotations__.keys()`. Illegal identifiers → functional `TypedDict(...)` form.

```python
class SprocDataResultReturnRow(TypedDict):
    LinkID: int
    LinkName: str
    # …
SPROC_RETURN_ROW_COLUMN_NAMES: Final[tuple[str, ...]] = tuple(
    SprocDataResultReturnRow.__annotations__.keys()
)
```

### Validate then `dict(zip(..., strict=True))`

After success-path dispatch: read `cursor.description` → `validate_column_names` → fetch. `testing=True` raises `MismatchedColumnsError`; production logs. After `fetchall`: `assert result is not None`. After `fetchone`: `if result is None: raise UnexpectedStoredProcedureCallError(...)`.

```python
validate_column_names(...)
rows = cursor.fetchall(); assert rows is not None
return [cast(SprocDataResultReturnRow, dict(zip(SPROC_RETURN_ROW_COLUMN_NAMES, r, strict=True))) for r in rows]
```

Single-row INSERT:

```python
row = cursor.fetchone()
if row is None:
    raise UnexpectedStoredProcedureCallError("no result when result set expected")
return cast(SprocDataResultReturnRow, dict(zip(SPROC_RETURN_ROW_COLUMN_NAMES, row, strict=True)))
```

## Multiple result sets — compute once, return many

When two shapes share one expensive computation, the sproc MUST emit both result sets in one execution; wrapper reads both. MUST NOT re-run the source from the service/second query/second sproc. `#temp` dies when the procedure returns — reuse only via extra SELECT inside same call.

Wrapper: `fetchall`/`fetchone` → `cursor.nextset()` → TypedDict + `*_COLUMN_NAMES` per set → validate → return dataclass/tuple. Gate optional sets on params; emit additive SELECTs after return-code/`@@ROWCOUNT` logic. Verify `cursor.returnvalue` timing — some drivers populate it only after all sets drained; restructure if stale.

### Desired ✅

```python
@dataclass
class SprocResult:
    rows: list[SprocDataResultReturnRow]
    breakdown_rows: list[SprocBreakdownRow] | None

# after first fetch:
breakdown_rows = None
if cursor.nextset():
    validate_column_names(..., expected_column_names=SPROC_BREAKDOWN_COLUMN_NAMES, ...)
    breakdown_rows = [cast(SprocBreakdownRow, dict(zip(SPROC_BREAKDOWN_COLUMN_NAMES, r, strict=True)))
                      for r in (cursor.fetchall() or [])]
return SprocResult(rows=results, breakdown_rows=breakdown_rows)
```

### Not desired ❌

```python
rows = app_SomeReport.exec_sproc(...)
cursor.execute("SELECT ... FROM dbo.fn2_ExpensiveSource(...)")  # re-runs source
```
