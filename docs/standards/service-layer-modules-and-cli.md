---
last_updated_at: 2026-05-25
---

# Service layer modules and CLI scripts

Module layout, lookup helpers, guide docs, CLI scripts over service code.

## Subdirectory layout

One domain per flat module (`pipelines.py` = Pipeline CRUD only). Subdirectory when: multiple ops per domain; shared types/errors (`shared.py`, `errors.py`); per-op files warranted (service-layer-guide.md §Subdirectories).

`tickets/errors.py` → `TicketsServiceError` (tickets/errors.py:1). `lookups/shared.py` → `ListLookupsPageResult` (service-layer-guide.md §Subdirectory-Level).

Reports — one subdirectory per report, one file per concern:

```text
svc/reports/vendor_summary/
├── service.py     # run_report() — entry; sproc + document
├── document.py    # dataclasses, REPORT_VARIANTS, errors
├── formatting.py  # format-agnostic helpers
├── markdown.py    # Markdown renderer
└── pdf.py         # PDF renderer
```

Only `service.py` is external; CLI imports `run_report` + renderers from siblings (generate-report.py:30; vendor_summary/service.py:1).

## Lookups pattern

`backend/src/svc/lookups/` — dropdown views (service-layer-guide.md §Lookups): `Lookup<Entity>` dataclass; slim `id`/`name`/`code`; no pagination; hierarchical filters as needed. `ListLookupsPageResult` in `shared.py` is canonical return.

## Documenting new modules in the guide

New `backend/src/svc/` module → update `service-layer-guide.md` tree same PR (review precedent).

## CLI scripts

`backend/scripts/` — service consumers, not parallel SQL path. CLI/HTTP share service interior; `str(exc)` asymmetry is intentional.

### Thin Click wrappers over service calls

Parse args, `db.connect(...)`, call services, render. MUST NOT raw SQL, `cursor.execute("SELECT ...")`, or `callproc(...)` on business tables (review precedent; manage-account.py:14). Only direct cursor: `db_check(...)` / `SELECT 1` (manage-account.py:40).

#### Desired

```python
@click.command()
def list_accounts_cmd() -> None:
    settings = get_settings()
    with db.connect(settings.db_conn_args) as connection:
        for a in list_accounts(connection=connection):
            click.echo(f"{a.external_id} {a.username}")
```

#### Not desired

```python
@click.command()
def list_accounts_cmd() -> None:
    with db.connect(...) as connection:
        with connection.cursor() as cursor:
            cursor.execute("SELECT ExternalID, Username FROM Account")  # wrong
            ...
```

### Parse domain types at the CLI seam

`ParamType` subclasses → typed domain values. Ref: `manage-account.py:51,80` (`RoleNameType`, etc.).

### CLI exception handling — surface `str(exc)`

Pass `str(exc)`: `raise click.ClickException(str(exc)) from exc` or `click.echo(f"Error: {exc}", err=True)` + `sys.exit(1)` (generate-report.py:240; manage-account.py:349). HTTP uses `HTTPStatus.X.phrase` + `detail` — service text MUST NOT reach public `message` (review precedent).

#### Desired

```python
try:
    document = run_report(...)
except (VendorSummaryServiceError, NoDataForReportError) as exc:
    raise click.ClickException(str(exc)) from exc
```

#### Not desired

```python
except UnknownReportError:
    click.echo("Error: Not Found", err=True)  # wrong: hides service text
    sys.exit(1)
```

Service exceptions MUST be developer-meaningful ([service-layer-data-and-exceptions.md](./service-layer-data-and-exceptions.md#exception-messages); reports/vendor_summary/service.py:47).

### CLI script structure

`backend/scripts/` flat (`db-query-mcp/` excepted). Order: shebang, docstring, `svc.*`, `ParamType`s, Click defs, `cli()` (manage-account.py:1). Invoke via `withenv` for env load; document in `--help` (generate-report.py:60).

```bash
scripts/withenv ../.env uv run python scripts/manage-account.py account list
```
