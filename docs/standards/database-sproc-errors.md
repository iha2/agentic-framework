---
last_updated_at: 2026-06-08
---

# Database stored procedure errors

Sproc lookup resolution, `@@ROWCOUNT`, case-specific `@ErrorMessage`, catch-block dispatch, and NULL `@ReturnCode`
guards. Voice: [docs-hygiene.md](./docs-hygiene.md).

## External-ID resolution at the top of the body

Sprocs accepting `uniqueidentifier` external IDs MUST resolve to internal int IDs at body top. NULL resolution MUST
return `gcNoRowsFound` with a case-specific `@ErrorMessage` naming the failed lookup. Each external-ID param gets its
own block and message.

### Desired ✅

```sql
declare @AccountInternalId int = (
    select id from dbo.account where external_id = @AccountId);
if @AccountInternalId is null
begin
    select @ReturnCode = ErrorID from dbo.Error where ErrorCode = 'gcNoRowsFound';
    set @ErrorMessage = 'Account not found for external_id ' + cast(@AccountId as varchar(36));
    return @ReturnCode;
end
-- Repeat per lookup (Role, GrantedBy, …) with distinct @ErrorMessage text
```

### Not desired ❌

```sql
update AccountRole set ...
where AccountID = (select AccountID from Account where ExternalID = @AccountId)
return @gcOK  -- silent no-op on unknown @AccountId

select @ErrorMessage = 'Not found'  -- generic across all lookup paths
```

## Case-specific `@ErrorMessage` per lookup path

Distinct strings per path even when return code matches. Catch-block messages MUST name the constraint/column that
fired; generic prefixes ONLY as fallback when no known name matches.

### Desired ✅

```sql
if @DbErrorMsg like '%FK_CalculationMethod$CustomerSegment%' or @DbErrorMsg like '%CalculationMethod%'
    select @ErrorMessage = 'Invalid Calculation Method ID.'
else if @DbErrorMsg like '%FK_CustomerSegmentType$CustomerSegment%' or @DbErrorMsg like '%CustomerSegmentType%'
    select @ErrorMessage = 'Invalid Customer Segment Type ID.'
else
    select @ErrorMessage = 'Foreign key constraint violation: ' + @DbErrorMsg
```

## `@@ROWCOUNT` check on every UPDATE

Capture `@@ROWCOUNT` immediately after UPDATE. Zero rows → `gcNoRowsFound` + descriptive message. Initialize
`@ReturnCode` to `gcOK` **before** `BEGIN TRY`. No exceptions.

### Desired ✅

```sql
select @ReturnCode = ErrorID from Error where ErrorCode = 'gcOK'
begin try
    update Link set LinkName = isnull(@LinkName, LinkName), ... where LinkID = @LinkID
    select @RowsAffected = @@ROWCOUNT
    if @RowsAffected = 0
    begin
        select @ReturnCode = ErrorID from Error where ErrorCode = 'gcNoRowsFound'
        select @ErrorMessage = 'No Link found with ID: ' + cast(@LinkID as varchar(10))
    end
end try
begin catch
    -- error_number() dispatch
end catch
return @ReturnCode
```

### Not desired ❌

```sql
update Link set ... where LinkID = @LinkID
return @ReturnCode  -- no @@ROWCOUNT; gcOK on zero rows
```

## Catch-block error-code dispatch

`if/else if/else` on `error_number()`, then refine `@ErrorMessage` via `@DbErrorMsg` patterns:

| `error_number()` | Code |
| --- | --- |
| 2627, 2601 | `gcDuplicateData` |
| 547 | `gcNoParentRecord` (never bare `gcDatabaseError`) |
| 8152, 2628 | `gcStringTooLong` |
| else | `gcDatabaseError` |

### Desired ✅

```sql
begin catch
    select @DbErrorMsg = error_message()
    if error_number() in (2627, 2601)
    begin
        select @ReturnCode = ErrorID from Error where ErrorCode = 'gcDuplicateData'
        if @DbErrorMsg like '%CustomerSegmentCode%'
            select @ErrorMessage = 'Customer Segment Code is already in use.'
        else
            select @ErrorMessage = 'Duplicate data: ' + @DbErrorMsg
    end
    else if error_number() = 547
    begin
        select @ReturnCode = ErrorID from Error where ErrorCode = 'gcNoParentRecord'
        -- FK-specific messages; else fallback with @DbErrorMsg
    end
    else if error_number() in (8152, 2628)
        select @ReturnCode = ErrorID from Error where ErrorCode = 'gcStringTooLong'
    else
    begin
        select @ReturnCode = ErrorID from Error where ErrorCode = 'gcDatabaseError'
        select @ErrorMessage = 'Database error: ' + @DbErrorMsg
    end
end catch
```

### Not desired ❌

```sql
begin catch
    select @ReturnCode = ErrorID from Error where ErrorCode = 'gcDatabaseError'
    -- FK violations lose gcNoParentRecord
end catch
```

## Guard against NULL `@ReturnCode` from a missing `dbo.Error` row

**No code path may RETURN a NULL `@ReturnCode`.**

| Sproc shape | Enforcement |
| --- | --- |
| Read/report (no TRY/CATCH) | Resolve every returnable code at proc entry into locals; `raiserror(..., 16, 1)` if missing |
| Write (TRY/CATCH) | Per-branch ad-hoc lookup next to paired `@ErrorMessage` (foundational seed rows) |

### Desired ✅

```sql
-- Read/report: eager resolve at entry
select @Ok = ErrorID from dbo.Error where ErrorCode = 'gcOK';
if @Ok is null raiserror ('Missing Error table row: gcOK', 16, 1);
select @NoRowsFound = ErrorID from dbo.Error where ErrorCode = 'gcNoRowsFound';
if @NoRowsFound is null raiserror ('Missing Error table row: gcNoRowsFound', 16, 1);
if @@rowcount = 0 return @NoRowsFound;
return @Ok;
```

### Not desired ❌

```sql
-- Read sproc: ad-hoc after heavy query → NULL if seed missing
if @@rowcount = 0
    select @ReturnCode = ErrorID from dbo.Error where ErrorCode = 'gcNoRowsFound';
else
    select @ReturnCode = ErrorID from dbo.Error where ErrorCode = 'gcOK';
return @ReturnCode;
```
