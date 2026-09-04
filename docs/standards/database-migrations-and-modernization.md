---
last_updated_at: 2026-05-25
---

# Database migrations and modernization

Governs migration edit policy, repeatable migrations, sproc tombstones, modernization sequencing, and performance tuning workflow.

## Migrations

Under `backend/database/sql_migrations/`. Repeatable (`R__*.sql`): current replaceable-object definitions (sprocs, tests, views, seed) — re-run each schema rebuild. Versioned (`V__*.sql`): one-time schema changes, Flyway checksum-tracked. Distinction drives editing rules.

### Versioned migrations are write-once historical records

Applied `V__*.sql` is fixed-point history — ran exactly once. MUST NOT edit for cosmetic fixes (comment typos, whitespace, prose). Correction cost and checksum implications outweigh zero functional benefit. Exception: typo in SQL **identifier** with functional impact — bug, not cosmetic; fix via follow-up versioned migration (review precedent).

### Not desired ❌

```sql
-- Editing V00039 purely to fix comment typo "LegacyStausCode" → "LegacyStatusCode"
-- wrong: V__ migrations are one-time records; comment typos have no functional impact
```

### Repeatable migrations are perpetually-current documentation

`R__*.sql` re-runs every build — current object state. Rename/delete/behavior change: every `R__` mentioning the object by name MUST update in same PR. Stale references mislead and survive every rebuild as authoritative. Example: rename `dbo.app_ValidateCustomerSegmentHierarchy` → move sproc file and matching tests together.

Deletion PR checklist: grep all `R__*` for deleted object name; update each match. Motivation comments rooted in removed code: delete, don't rewrite (review precedent).

### Sproc tombstones describe only what was removed

Deleted sproc → tombstone: `DROP PROCEDURE IF EXISTS` + comment on what was removed, why, and replacement (if any). Comment scope limited to those three — MUST NOT comment on objects *not* removed in this change; git history holds surrounding context (review precedent; `R__dbo.app_ValidateUnpostedTicket.sql`).

### Desired ✅

```sql
-- Tombstone: superseded by legacy_ValidateTicket trigger.
-- Validation now inline on Ticket INSERT/UPDATE.
drop procedure if exists dbo.app_ValidateUnpostedTicket;
```

### Not desired ❌

```sql
-- The granular app_Validate* sprocs remain available for standalone use.
-- wrong: self-contradictory — this file IS an app_Validate* being dropped
drop procedure if exists dbo.app_ValidateUnpostedTicket;
```

## Modernization strategy

Twenty-year legacy schema; business logic in many sprocs; no legacy tests; no systemic format/lint (database-modernization-approach.md). Incremental approach:

1. **Test first** — before behavior change, add tests confirming current behavior including bugs. `KNOWNBUG_` prefix asserts buggy behavior so test passes ([database-testing.md](./database-testing.md)).
2. **Lint/format on encounter** — ignore file lists all DB objects; on change, remove from ignore, lint, format, commit.
3. **Refactor with confidence** — tests + lint clean → tweak logic safely; `KNOWNBUG_` fails when bug actually fixed → rename and re-assert correct behavior.

Same gradualism for naming/structure: auto-generated FK names and pre-convention indexes not renamed automatically — surface to human; rename only when willing to update every sproc/test pattern-matching old name in same PR ([database.md](./database.md#foreign-key-renames-must-propagate-to-sprocs-and-tests-in-the-same-pr)).

## Performance tuning workflow

Index gaps, plan regressions, measured before/after: use `backend/scripts/db-snapshot.py` before experimental local DB changes.

Workflow: snapshot → apply change (index, sproc rewrite, column type) → measure → restore (undo) or delete snapshot (keep change). Restore overwrites live DB and removes other snapshots — clean rollback to pre-experiment state.

**Local development only.** MUST NOT run against shared/staging/production-equivalent DB — `restore`/`delete` destructive without secondary confirmation; assumes isolated disposable dev DB at `$DB_URL`.

### Desired ✅

```shell
uv run --directory backend scripts/db-snapshot.py create my-perf-snapshot
# apply experimental change, measure
uv run --directory backend scripts/db-snapshot.py restore my-perf-snapshot   # undo
# or: delete my-perf-snapshot  # keep change
```

Subcommands: `list`. Requires SQL Server at `$DB_URL` — `just be-db-start` first.
