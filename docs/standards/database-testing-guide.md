# TSQLT Database testing patterns

Tests MUST carry commentary emphasizing *why* — future refactors judge whether the *why* still holds before removal.

## Per-test headers

Title banner per test procedure. Straightforward: title line suffices:

```sql
-- =============================================================================
-- 'R' value returns valid
-- =============================================================================
create or alter procedure test_app_ValidateMovementType.[test_R_ReturnsValid]
```

Non-obvious: explanatory block after title:

```sql
-- =============================================================================
-- Missing hierarchy level auto-passes
-- =============================================================================
-- Incomplete CustomerSegment hierarchy: missing level → cross-level JOIN
-- produces no rows; check silently passes (matches trigger 5-table JOIN).
-- =============================================================================
create or alter procedure
test_app_ValidateCustomerSegmentHierarchy.[test_MissingHierarchyLevel_AutoPasses]
```

## When to add "why" commentary

Add when:

1. **Tradeoff or known limitation** — e.g. cross-field validation (Stage 4) runs only when field-level passes; two-round validation needed for combined errors.
2. **Execution order or dependencies** — named stages/phases/behavioral wording (what runs before what, under which conditions). MUST NOT cite line numbers — see [Stable references](#stable-references-in-comments).
3. **Optional vs required fields** — e.g. `PriorDetailCode` only optional among 19 parameters; NULL valid unlike required fields.
4. **Testing patterns/workarounds** — e.g. `@Testing=1` for nested `INSERT EXEC` limitation (error 8164).

## Stable references in comments

Tie scenarios to **behavior** (what, order, conditions) — not **source locations** (line numbers, "lines X–Y"). Line numbers drift; brittle coupling fails refactors.

**Prefer:** concept/branch names ("PipelineLocation check when both IDs non-NULL"); phased logic ("Hierarchy Phase 1") without `(lines …)`; section banners without implementation line ranges.

**Avoid:** "See trigger lines 133–172", `Section (lines 12–18)`.

## KNOWNBUG tests

`KNOWNBUG_` prefix documents unfixed legacy bugs. Assert **actual** buggy behavior (test passes); commentary states **correct** behavior.

Value: documents bug and trigger; prevents accidental "fix"; fails when bug genuinely fixed.

```sql
-- KNOWN BUG: checks DataProviderMappingID instead of DataProviderID →
-- gcInvalidDataProvider (3) not gcNoRowsFound (1).
create or alter procedure
test_ListPipeline.[test_KNOWNBUG_DataProviderWithNoPipelinesReturnsInvalidDataProvider]
```

Complex bugs: root-cause analysis in body. Name describes **actual** behavior, not expected:

```sql
[test_KNOWNBUG_DataProviderWithNoPipelinesReturnsInvalidDataProvider]  -- good
[test_KNOWNBUG_DataProviderWithNoPipelinesReturnsNoRowsFound]            -- bad: would fail
```

## Test naming

### Procedure names

Descriptive scenario: `[test_NullValue_ReturnsErrorAndReturnCode1]`, `[test_CrossFieldValidation_LocationNotOnPipeline_ReturnsError]`. Multi-step "why" in name when appropriate: `[test_TwoRoundValidation_FieldErrorThenCrossFieldError]`.

### File names

ALWAYS shadow tested object with `Tests` suffix:

`stored-procedure/app_SomethingSomething.sql` → `tests/app_SomethingSomethingTests.sql`
