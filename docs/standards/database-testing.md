---
last_updated_at: 2026-05-25
---

# Database testing

Governs tSQLt test commentary, behavior references, `KNOWNBUG_` tests, expectation naming, `DropClass` usage, and test-file naming.

## Database testing

tSQLt for stored-procedure tests. Test files shadow covered objects: `backend/database/sql_migrations/stored-procedure/app_SomethingSomething.sql` → `backend/database/sql_migrations/tests/app_SomethingSomethingTests.sql` (database-testing-guide.md §File names).

### Tests carry "why" commentary

Commentary explains *why* behavior matters — without it, refactors cannot judge relevance (database-testing-guide.md).

Straightforward: single-line title banner:

```sql
-- =============================================================================
-- 'R' value returns valid
-- =============================================================================
create or alter procedure
test_app_ValidateMovementType.[test_R_ReturnsValid]
```

Non-obvious behavior: banner plus explanatory block:

```sql
-- =============================================================================
-- Missing hierarchy level auto-passes
-- =============================================================================
-- Edge case: incomplete CustomerSegment hierarchy. Missing level → cross-level
-- JOIN produces no rows; check silently passes (matches trigger 5-table JOIN).
-- =============================================================================
create or alter procedure
test_app_ValidateCustomerSegmentHierarchy.[test_MissingHierarchyLevel_AutoPasses]
```

Add "why" for: tradeoffs/known limitations, execution order/dependencies, optional vs required fields, testing patterns/workarounds (e.g. `@Testing=1` for nested `INSERT EXEC` / error 8164) (database-testing-guide.md §When to add "why" commentary).

### References to behavior, not to line numbers

Describe scenarios by behavior — what trigger/sproc does, order, conditions — never source locations. Line numbers drift on edit. Prefer concept names, branch labels, phased-logic terms over `(see trigger lines 133–172)` (database-testing-guide.md §Stable references in comments).

### `KNOWNBUG_` tests

`KNOWNBUG_` prefix marks legacy bugs not yet fixable that MUST NOT change accidentally. Assert *actual* buggy behavior (test passes); commentary states *correct* behavior. Delivers: bug record, guard against inadvertent "fix", ready-made test that fails when genuinely fixed (database-testing-guide.md §KNOWNBUG tests).

### Desired ✅

```sql
-- KNOWN BUG: sproc checks "DataProviderMappingID = @lDataProviderID"
-- instead of "DataProviderID = @lDataProviderID" → gcInvalidDataProvider (3)
-- not gcNoRowsFound (1) when valid DataProvider has no pipelines.
create or alter procedure
test_ListPipeline.[test_KNOWNBUG_DataProviderWithNoPipelinesReturnsInvalidDataProvider]
```

Test name describes what *actually* happens — `[test_KNOWNBUG_...ReturnsInvalidDataProvider]` correct; `[test_KNOWNBUG_...ReturnsNoRowsFound]` wrong (asserts behavior sproc does not produce).

### Test naming

Procedure names spell input shape and expected outcome: `[test_NullValue_ReturnsErrorAndReturnCode1]`, `[test_CrossFieldValidation_LocationNotOnPipeline_ReturnsError]`. Fold multi-step/order-sensitive "why" into name: `[test_TwoRoundValidation_FieldErrorThenCrossFieldError]` (database-testing-guide.md §Test naming).

### Test expectations track sproc error codes in the same commit

Sproc error-code change (e.g. FK violation `gcDatabaseError` → `gcNoParentRecord`) MUST update tSQLt expected `ErrorID` in the same commit. Stale expectation inverts test purpose.

### Desired ✅

```sql
exec tSQLt.AssertEquals @Expected = @gcNoParentRecord_ErrorID, @Actual = @ReturnCode
```

### Not desired ❌

```sql
exec tSQLt.AssertEquals @Expected = 14, @Actual = @ReturnCode  -- wrong: sproc now returns gcNoParentRecord
```

### `tSQLt.DropClass` is already idempotent

`exec tSQLt.DropClass '<schema>'` is no-op when schema absent. MUST NOT wrap in existence guard — redundant, misreads tSQLt API.

### Desired ✅

```sql
exec tSQLt.DropClass 'test_app_ValidateUnpostedTicket';
```

### Not desired ❌

```sql
if schema_id('test_app_ValidateUnpostedTicket') is not null
    exec tSQLt.DropClass 'test_app_ValidateUnpostedTicket';
```

### Test files shadow the sproc file name

Sproc file name + `Tests` suffix: `R__dbo.app_UpdateLink.sql` → `R__app_UpdateLinkTests.sql`. Mechanical transformation finds tests without grep (database-testing-guide.md §File names).

```sql
-- backend/database/sql_migrations/tests/R__app_UpdateLinkTests.sql
exec tSQLt.NewTestClass 'test_app_UpdateLink';
go

create or alter procedure test_app_UpdateLink.[test_UpdateLinkName_Success]
as
begin
    exec tSQLt.FakeTable 'dbo', 'Link';
    exec tSQLt.FakeTable 'dbo', 'Error';
    insert into dbo.Error (ErrorID, ErrorCode) values (0, 'gcOK'), (15, 'gcDuplicateData'), ...;
    -- arrange, act, assert ...
end
go
```
