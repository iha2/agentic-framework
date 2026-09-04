---
name: psql
description: Run PostgreSQL diagnostics safely from an agent shell. Use before invoking psql directly when the task needs schema inspection, read-only data checks, query or function/procedure profiling, EXPLAIN analysis, pg_stat_statements investigation, auto_explain guidance, or PostgreSQL quoting/env handling.
---

# psql

Prefer repo recipes (`just db-shell`, `make db-test`, migrations, seeds, integration tests) when they exist.

## Safety

- Prefer test/dev/disposable DB. MUST NOT run write/destructive diagnostics against production.
- Load connection from repo env — MUST NOT hardcode credentials/hosts.
- Read-only unless user/recipe requires writes.
- `-X` (ignore `~/.psqlrc`); `-v ON_ERROR_STOP=1` for scripts.
- Redact secrets/PII. Short `statement_timeout` unless workflow says otherwise.

## Invocation

```bash
PGPASSWORD="$DB_PASSWORD" psql -X -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  -v ON_ERROR_STOP=1 -c "select version();"
# or
psql -X "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "select current_database(), current_user;"
# scalars: -A -t ; spreadsheets: --csv
```

## Command shape

- `-c`: one SQL **or** one meta-command (not mixed); repeat `-c` or use stdin.
- Prefer `-f file.sql` over shell redirect (line numbers).
- `-1` + `ON_ERROR_STOP=1` for all-or-nothing multi-step.
- `-w` only when credentials already supplied.
- Variables: `:'name'` literals, `:"name"` identifiers — MUST NOT concat untrusted into SQL.

## Timing / EXPLAIN

`\timing on` = rough wall-clock only. Optimization → `EXPLAIN`.

```bash
# estimate
psql -X "$DATABASE_URL" -v ON_ERROR_STOP=1 \
  -c "explain (verbose, settings) select * from public.example_table where id = 42;"
# actual
-c "explain (analyze, buffers, settings, wal, summary) select * from public.example_table where id = 42;"
# lower overhead
-c "explain (analyze, buffers, timing off, summary) select * from public.example_table;"
# JSON
-A -t -c "explain (analyze, buffers, settings, format json) ..."
```

**Warning:** `EXPLAIN ANALYZE` executes. For DML/CTAS/`EXECUTE`, wrap `BEGIN` … `ROLLBACK` unless intentional write.

## Functions / procedures

`select fn(...)` vs `call proc(...)`. Profile writes inside `BEGIN`/`ROLLBACK`. Outer EXPLAIN often one node — for body: `auto_explain` + `log_nested_statements`, `track_functions` + `pg_stat_user_functions`, or `pg_stat_statements`.

## pg_stat_statements

MUST NOT create/reset in shared envs unless allowed.

```bash
# availability
-c "select extversion from pg_extension where extname = 'pg_stat_statements';"
# top by total / mean time — order by total_exec_time or mean_exec_time; limit 10
```

Reset (disposable/approved only): `select pg_stat_statements_reset(0, 0, 0);`

## auto_explain

Needs privileges; has overhead. Session shape for isolated test DB:

```sql
load 'auto_explain';
set auto_explain.log_min_duration = '250ms';
set auto_explain.log_analyze = true;
set auto_explain.log_buffers = true;
set auto_explain.log_wal = true;
set auto_explain.log_timing = off;
set auto_explain.log_nested_statements = on;
set auto_explain.log_format = 'json';
```

`log_timing = off` when timing distorts; nest only when targeting function internals.

## Activity / locks

`pg_stat_activity` (non-idle) for running queries; join `pg_locks` for blocked↔blocking pairs (standard granted/not-granted lock join).

## Schema

Meta: `\dt`, `\d+`, `\df+` one per `-c`. Scriptable: `information_schema.columns` / catalogs with `-A -F $'\t'`.

## Output

Report command shape, env class, summary, profiling method (`\timing` / EXPLAIN / pg_stat_statements / auto_explain / stats views), and uncertainty about target DB.
