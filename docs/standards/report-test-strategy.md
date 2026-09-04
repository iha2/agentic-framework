---
last_updated_at: 2026-06-13
---

# Report test strategy

Governs **test battery sizing/selection** for migrated reports: which cases run, how many, aggregate speed. Applies to `backend/tests/svc/reports/`, `backend/tests/data/sprocs/test_app_Report*.py`, `backend/database/sql_migrations/tests/` for report sprocs.

Report subsystem is large (dozens of reports × SQL/DB-wrapper/document batteries). Per-test time cap does not bound suite — many reports × "few seconds" = unusable. Rules keep each report's batteries **functionally complete, collectively fast**.

Also load [python-testing.md](./python-testing.md) (layout/markers) and [reports.md](./reports.md) (report specifics).

## Budget is per-report-aggregate, not per-test

`≤ 10 s` per-test cap necessary but insufficient. Binding constraint: **total** DB-touching battery runtime per layer. Size the *set*: a report's DB-wrapper battery (`data/sprocs`, real SP) should complete in seconds — cost paid once per report × dozens of reports.

Slow battery → **fewer/smaller inputs** (next section) — never larger per-test timeout; never hide cost behind a gate.

## Choose a minimal, data-coverage-driven input set

Unit = **data-shape coverage**, not one test per rule. Fewest `(report, CustomerSegment, year, month)` inputs whose **data** exercises every functional variation (all-zero rows, negatives/credit memos, current-vs-prior true-ups, YTD/period supersets, name truncation, empty windows, multi-result-set shape, ordering). Union must be complete; prefer small/fast cases for unique variation.

Inputs not limited to legacy fixtures — any DB CustomerSegment/period is candidate. Scan data to learn variation carriers; cover union. State **dimension → case mapping** for reviewer verification.

### Desired

```text
# 2 always-on cases, union covers every variation, ~2.5 s total
Segment A — negatives, prior-period netting, YTD-only vendors, name truncation, 3 result sets
Segment B — all-zero rows, current/prior split, penny parity
```

### Not desired

```text
# 5 cases "to be safe": 3 add no new variation, double runtime, more fixtures
Segment A, Segment B, Segment C, Segment D, Segment E
```

## No environment-variable gates

Committed test runs by default or does not exist. MUST NOT hide cases behind opt-in env var (e.g. `RUN_ALL=1`) — gated coverage skips CI, invisible to reviewers. Worth keeping → run every time; not worth → delete. Non-test reference data → reference artifact, not skipped/gated test.

## Keep functional batteries purely functional — load and latency live elsewhere

Functional batteries (SQL rules, DB-wrapper, document/JSON) assert **correctness** only — no load/latency assertions; no heavy case "also checking performance." Separate tracks:

| Testing type | Where | When |
| --- | --- | --- |
| **Load testing** | DB performance-tuning sessions | tuning query/SP/TVF plans |
| **Latency & load-performance** | **API layer** | **after** DB query tuning |
| **Functional / correctness** | every layer | always; no load/latency assertions |

Slow functional case → smaller input or perf track — not widened functional test.

## Don't re-prove the same fact at multiple layers

Each layer proves what only it can:

- **SQL rules (tSQLt)** — SP behavior on seeded data: result-set shape, ordering, return codes. Real-SP error paths here → higher layers skip DB round-trips for same facts.
- **DB wrapper (`data/sprocs`)** — Python binding walks real SP result sets, maps return codes, value parity vs oracle. Value-parity via binding = one round-trip for wiring + values.
- **Document / JSON (`svc/reports`)** — pure-Python shaping (totals, footer math, ordering, formatting) unit-tested with synthetic rows (no DB); DB-backed convergence adds real-mapping coverage only, not builder re-run.

## Related standards

- [python-testing.md](./python-testing.md) — layout, `db` marker, fixture-matrix convergence
- [reports.md](./reports.md) — legacy-parity contract, PDF byte determinism, shared `cases.py`
- [database-testing.md](./database-testing.md) — tSQLt conventions for SQL-rules layer
