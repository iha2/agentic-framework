---
last_updated_at: 2026-05-25
---

# Database

Governs SQL Server objects under `backend/database/sql_migrations/` — naming, constraints, indexes, sprocs, migrations, tSQLt. Brownfield legacy schema; net-new follows conventions; legacy modernized incrementally (see database-guide.md, database-modernization-approach.md).

## Overview

Net-new sprocs: `app_` prefix in Flyway repeatable `R__dbo.app_<Name>.sql`. `legacy_` reserved for ported legacy names.

### Desired ✅

```sql
create or alter procedure dbo.app_ListReturnAddress
    @ErrorMessage varchar(500) = null output,
    @Username varchar(128) = 'FIXTHIS'
as begin ... end
go
```

### Not desired ❌

```sql
create or alter procedure dbo.legacy_ListReturnAddress  -- net-new MUST NOT use legacy_
```

## Object naming

Tables/columns: singular PascalCase, no separators (`MyTable`, `MyColumn`). PK: `<TableName>ID` (both letters caps). FK columns match parent PK name. PK constraint: `<TableName>_PK`. FK constraint: `FK_<ParentTable>$<ChildTable>` (dollar separator for catch-block pattern match). Auto-generated `FK__…` names unacceptable for new constraints; rename existing only when explicitly directed (coordinate sproc/test string matches).

### Desired ✅

```sql
alter table CustomerSegmentPipeline
add constraint FK_CustomerSegment$CustomerSegmentPipeline
foreign key (CustomerSegmentID) references CustomerSegment (CustomerSegmentID);
```

### Not desired ❌

```sql
FK__DataProvi__LinkI__1C873BEC
```

### Unique constraints (alternate keys)

`AK_<Table>_<Col(s)>` — documents alternate key + accelerates filters. Compound: `AK_InvoiceLine_InvoiceID_ControlCode`. Names omitting columns unacceptable (error messages localize via constraint name).

### Not desired ❌

```sql
constraint AK_Location unique (LocationName)  -- which column?
constraint AKInvoiceLineInvoiceIDControlCode unique (...)  -- no separators
```

## Constraints

### Declarative UNIQUE, never CREATE UNIQUE INDEX

Uniqueness via `ALTER TABLE … ADD CONSTRAINT … UNIQUE` (or inline CREATE TABLE). MUST NOT use `CREATE UNIQUE INDEX` for business uniqueness (loses FK-target eligibility + table-level intent). Naming: `AK_<Table>_<Cols>` (not legacy `UQ_`).

### Desired ✅

```sql
alter table DataProvider
add constraint AK_DataProvider_DataProviderName unique (DataProviderName);
drop index if exists IX_DataProvider_DataProviderName on DataProvider;
```

### Not desired ❌

```sql
create unique index IX_Accounts_Email on Accounts (Email);
```

### Unique index exception — tolerated legacy duplicates

Filtered unique index ONLY when forward uniqueness required but fixed legacy duplicates cannot be cleaned; `WHERE` names exceptions explicitly.

### Desired ✅

```sql
create unique index AK_Product_ProductName on dbo.Product(ProductName)
where ProductName <> 'a' and ProductName <> 'CCB' and ProductName <> 'CRUDE' and ProductName <> 'TCS';
```

### FK renames propagate in same PR

Sprocs map FK violations via `@DbErrorMsg like '%<FK name>%'`; tSQLt applies/removes by name. Rename without updating matches → silent fallthrough to `gcDatabaseError`. Checklist: grep sprocs, tests, Python error maps; ship rename + all string updates atomically.

### Desired ✅

```sql
-- same PR: migration rename + catch-block update
else if @DbErrorMsg like '%FK_CustomerSegmentPipeline$CustomerSegment%'
    select @ErrorMessage = 'Invalid Customer Segment Pipeline ID.'
```

### Not desired ❌

```sql
-- rename ships; catch block still matches old name
```

## Related standards

- data-layer — Python wrappers / `SprocArguments` / callproc order
- http-layer-guide.md — maps `@ReturnCode` / `@ErrorMessage` to HTTP
- database-sproc-errors.md — FK name pattern matching in catch blocks
