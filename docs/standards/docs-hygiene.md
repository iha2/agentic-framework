---
last_updated_at: 2026-05-25
---

# Docs hygiene

Voice, example structure, MCP/table references, linking, cleanup, forbidden content for standards and agent guides. Audience: authors of prescriptive markdown for agents/reviewers.

Agents load via `docs/standards/index.yaml` `applies_to`; each file self-contained. Humans scan headings; cite Desired/Not-desired in review. Cite durable evidence (sibling standard, repo path, public issue/PR, "review precedent"). Public standards MUST NOT require restricted PRs, repos, worktrees, or machine-specific paths.

## Voice

RFC-2119 uppercase for every directive: `MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT`, `ONLY USE`. Weak forms (`We will`, `Usually`, `Generally`) MUST NOT appear in requirements. Active voice: "Use X" / "Do not use Y." Name exceptions concretely.

### Desired ✅

```markdown
## Directive: Enforce Uniqueness via Declarative Constraints

Standard: Always use `ALTER TABLE … ADD CONSTRAINT … UNIQUE` to enforce column uniqueness.
Restriction: Never use `CREATE UNIQUE INDEX`.
Rationale: Constraints document intent, are ANSI-compliant, and support FKs where unique indexes may not.
```

### Not desired ❌

```markdown
## Uniqueness in tables

We will normally use `ALTER TABLE … ADD CONSTRAINT … UNIQUE`. Try not to use `CREATE UNIQUE INDEX`.
```

(Source: review precedent.)

## Paired Desired and Not-desired examples

Every prescriptive directive MUST include Desired ✅ and Not-desired ❌. Not-desired MUST be real — public review snippet, pre-fix history, rejected code — source as trailing comment in block. No real Not-desired → omit block; MUST NOT fabricate.

### Desired ✅

````markdown
### Naming Convention: Unique Constraints

Use prefix `UQ_` followed by the table name and columns.

**Good**

```sql
ALTER TABLE Accounts
ADD CONSTRAINT UQ_Accounts_Email UNIQUE (Email);
```

**Bad**

```sql
CREATE UNIQUE INDEX IX_Accounts_Email ON Accounts (Email);
```
````

### Not desired ❌

```markdown
### Naming Convention: Unique Constraints

Use prefix `UQ_` followed by the table name and columns.
```

(Source: review precedent.)

Not-desired source priority: (1) public review "change X → Y", (2) pre-fix blob, (3) live rejected code on integration branch.

## References to MCP servers and their tools

Name MCP servers/tools in backticks. Connectivity checks MUST name tool + fallback.

### Desired ✅

```markdown
Use the `ping` tool exposed by the `sqlserver` MCP server to determine if you have access.
If you do not have access, stop and request it as input for the table(s) being modified.
```

### Not desired ❌

```markdown
Use the MCP server to verify access.
```

(Source: review precedent.)

## References to database tables

Table lookups MUST include copy-pasteable `SELECT` with exact columns. Inline value mappings ([database-sproc-errors.md](./database-sproc-errors.md)).

### Desired ✅

````markdown
Look up the error code in `dbo.Error` via the `sqlserver` MCP server:

```sql
select ErrorID, ErrorCode, ErrorMessage from dbo.Error
```

Common situations:

- Unique Index violations: SQLServer error_number 2627, 2601 → `gcDuplicateData`
- Foreign Key violations: SQLServer error_number 547 → `gcNoParentRecord`
````

### Not desired ❌

```markdown
Look up the error in the Error table.
```

(Source: review precedent.)

## Cross-document linking

Markdown outside `CLAUDE.md` MUST cross-reference via relative-path links. `@include` no-op outside `CLAUDE.md`.

### Desired ✅

```markdown
See [docs/standards/database-guide.md](../standards/database-guide.md) for the canonical patterns.
```

### Not desired ❌

```markdown
@include docs/standards/database-guide.md
```

(Source: review precedent.)

## Cleanup discipline

Migration/sproc/schema guides MUST separate cleanup from feature work — cleanup in its own PR.

### Desired ✅

```markdown
Any cleanup of <thing> MUST be done in a separate PR. Do not assume cleanup should happen as part of this operation.
```

### Not desired ❌

```markdown
Clean up old <thing> when you're done.
```

(Source: review precedent.)

## Test case lists in guides

Numbered test-case lists (`1. Test X`) MUST NOT appear in standards/guides. Use prose, headings, bullets (review precedent; `docs/standards/database-testing-guide.md`).

### Desired ✅

```markdown
### Test cases

- Verifies that `gcNoParentRecord` is returned on a missing FK target.
- Verifies that `gcDuplicateData` is returned on a unique-index violation.
- Verifies that `gcOK` is returned on a clean insert.
```

### Not desired ❌

```markdown
### Test cases

1. Verifies that `gcNoParentRecord` is returned on a missing FK target.
2. Verifies that `gcDuplicateData` is returned on a unique-index violation.
3. Verifies that `gcOK` is returned on a clean insert.
```

(Source: review precedent.)

## Working-doc identifiers do not appear in committed files

`SPEC`, `INVARIANT`, `D-N`, `AC-N`, `OQ-N`, `PR-finding` MUST NOT appear in committed code, tests, docstrings, comments, Postman descriptions, or `docs/standards/`. Belong in locally-ignored `docs/execution/`. `docs/architecture/`, `docs/features/` may retain; `docs/execution/` references freely.

### Desired ✅

```python
def _validate_params(report_name, params):
    """Defensive gate for non-public callers; primary type validation runs upstream in the route handler."""
```

### Not desired ❌

```python
def _validate_params(report_name, params):
    """Defensive gate (INVARIANT 1). See SPEC AC-3."""
```

(Source: review precedent.)

Excluded outside `docs/architecture/`/`docs/features/`: `SPEC`+id, `INVARIANT`+num, `D-`/`AC-`/`OQ-`+digit, `PR-finding`+id. Sweep docstrings, comments, test names, Postman before commit.

## Related standards

- [pr-process.md](./pr-process.md) — one logical change per PR; cleanup cross-link.
- [tooling-lint-format.md](./tooling-lint-format.md) — markdown lint/format.
- Other `docs/standards/` files = empirical reference this hygiene governs.
