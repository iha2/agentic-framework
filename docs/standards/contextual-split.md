# Standards contextual split

Split map and maintenance rules. Human-oriented; `index.yaml` is the machine-readable load index.

## Why split standards

Monolithic standards force unrelated rules into agent context, inflate human scan cost, and collide edits. Goal: **contextual loading** — schema work loads schema rules, not auth or OpenAPI tests unless needed. Reviewers cite the specific standard.

Line-count thresholds:

- **<400 lines** preferred — fits alongside code, tests, specs, command output.
- **≤500 lines** acceptable if cohesive and further split harms discovery.
- **>600 lines** SHOULD block review unless split or exception accepted.

Split by **work area** — no `part-1`/`part-2`. Name by context: schemas, authorization, migrations, templates, logging, hooks.

## Provenance requirement

Splitting MUST NOT remove hard references. Normative standards keep citations to PR comments, precedent files, or established sources (docs-hygiene; review precedent). Rule text lives in files below.

## HTTP layer

- `http-layer.md` — routes, naming, tiers, lookups, blueprints, decorator order.
- `http-layer-schemas-and-responses.md` — request/response schemas, dataclass pairing, optional/enum/domain fields.
- `http-layer-errors-and-auth.md` — status codes, envelopes, exception translation, auth, permissions, seed verification.
- `http-layer-docs-and-tests.md` — OpenAPI docs, `/docs`, error-path tests, endpoint iteration.

## Database

- `database.md` — naming, PKs, FKs, uniques, indexes.
- `database-sproc-shape.md` — `app_*` signatures, param order, `@DbErrorMsg`, result rows.
- `database-sproc-errors.md` — parent lookup, `@@ROWCOUNT`, `@ErrorMessage`, catch mapping.
- `database-migrations-and-modernization.md` — V/R migration policy, tombstones, modernization, perf workflow.
- `database-testing.md` — tSQLt commentary, behavior refs, `KNOWNBUG_`, expectations, `DropClass`, naming.

## Data layer

- `data-layer.md` — wrapper purpose, layout, exceptions, boundary, `SprocArguments`.
- `data-layer-exec-sproc.md` — `exec_sproc`, `callproc` order, outputs, ID coercion, return codes.
- `data-layer-results.md` — `SprocReturnCode`, `TypedDict`s, column validation, multiple result sets.
- `data-layer-errors.md` — wrapper/generic errors, substring disambiguation, unexpected codes.
- `data-layer-templates.md` — canonical wrapper templates.
- `data-layer-utilities.md` — platform quirks, shared utilities.

## Service layer

- `service-layer.md` — boundary, composition, error classes, sproc translation.
- `service-layer-data-and-exceptions.md` — dataclasses, results, exception text, docstrings, replace semantics.
- `service-layer-modules-and-cli.md` — layout, lookups, guide docs, Click over services.

## Reports

- `reports.md` — one-document architecture, legacy parity, registry/style, timeouts, PDF determinism.
- `report-test-strategy.md` — test budget, data-coverage selection, no env gates, functional vs load, coverage ownership.

## Frontend

- `frontend.md` — hooks, admin CRUD slices, RTK mutations, cache, groups, composite IDs, schema tests.
- `frontend-forms-ui.md` — forms, modals, dropdowns, JS/TS idioms, theme, permissions, Storybook, tests.

## Cross-cutting standards

- `code-structure.md` — file size, splitting, cohesion, discoverable skills, slop, compute-once.
- `ci-workflows.md` — triggers, permissions, cache warmers, deploy, prek.
- `ci-llm-conformance-workflows.md` — LLM secrets, settings-first prompts, `display_report`, conformance.
- `docs-hygiene.md` — voice, examples, MCP refs, DB refs, links, cleanup, banned identifiers.
- `docs-hygiene-reference-structure.md` — exclusions, citations, section order.
- `logging-observability.md` — logger setup, init order, log keys, request context, deploy.
- `logging-runtime-behavior.md` — completion logs, cold start, header sanitization, local render, profiling.
- `python-testing.md` — layout, naming, display tests, integration, `db` marker.
- `python-testing-http-behavior.md` — no-leak tests, migration skip, behavior checks, consolidation.
- `tooling-lint-format.md` — mypy, yamlfmt, ruff, banned imports.
- `tooling-hooks-and-formatters.md` — prek/pre-commit, mdformat, taplo.

## Process, security, and operations

- `pr-process.md` — title scopes, one change per PR, legacy evidence, no cruft, CVE titles.
- `security.md` — scoped secrets, min permissions, CVE titles, `lodash` ban, audit docs.
- `deployment.md` — WSGI handler, serverless bundle, Flask coupling, Terraform boundary.
- `settings.md` — `Settings`, `get_settings`, lazy reads, adding settings, testing contract.

## Maintenance rules

New rules → file an agent loads for the task. Cross-context: normative text in most specific file; cross-ref only for discovery. At ~400 lines, split by task area, artifact type, or review question — not page count. After add/move/rename: update `index.yaml` (file, triggering paths/activities, purpose).
