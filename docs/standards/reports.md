---
last_updated_at: 2026-06-10
---

# Reports

Governs report subsystem: `backend/src/svc/reports/` (registry, orchestrator, per-report service/document/renderer), CLI (`backend/scripts/generate-report.py`), HTTP routes (`backend/src/http_api/v1/report/`), tests (`backend/tests/svc/reports/`).

Report-unique rules only. Also load [service-layer.md](./service-layer.md), [python-testing.md](./python-testing.md), [http-layer.md](./http-layer.md) for touched files.

## Architecture: one document, many renders

Vertical slice: registry → `run_report()` → per-report service → document builder → renderer(s). Service produces one canonical document dict; JSON + PDF consume same document. Document builders pure Python — no DB, no rounding — unit test without DB. Renderer re-derivation = compute-once violation ([code-structure.md](./code-structure.md#compute-once-return-many)).

## Legacy parity is the contract

Migrated reports match legacy Access references row-for-row:

- **Line order load-bearing.** Rendered order matches legacy exactly. Ordering signals — SP `SortOrder`, document tiebreaks — part of verified contract. MUST NOT remove/simplify ordering without full parity re-evidence; encodings can collide in data (e.g. sort key encoding month not year collides YTD across years) (review precedent).
- **Rounding ROUND_HALF_UP everywhere.** Access `RoundToNearest()` rounds halves away from zero. Python default banker's (`ROUND_HALF_EVEN`) forbidden in formatters; unit tests MUST include midpoint divergent case (e.g. `4.385`).
- **Convergence byte-equal.** One JSON fixture per reference case; DB-backed convergence asserts byte equality (matrix in [python-testing.md](./python-testing.md#unit-tests-for-display-and-data-shaping-logic)). Formatting may differ from legacy PDF; values/ordering may not.

## Registry and style contract

Renderers receive style as required second argument — no hidden defaults in renderer modules. Orchestrator passes registry `default_pdf_style`; registry = single production style declaration. Single-layout reports register explicit `"default"`, ignore argument (review precedent; follow-up).

## Report query timeouts

Report generation completion-critical — slow report must still finish. Standard request-path uses short `timeout_seconds`; report paths MUST NOT share it.

- Every execution path (CLI, HTTP, workers) uses report-scoped query timeout >> request default. CLI `_REPORT_QUERY_TIMEOUT_SECONDS` in `scripts/generate-report.py` canonical. Default connection factory on report path = bug even if current reports finish inside default — override exists for heaviest groups (review precedent).
- Worst-case target ~15 s. Exceeding = fix at source (SP tuning, DB resources) — never timeout-kill query. Completion > latency.
- MUST NOT trim timeout toward observed worst case. Headroom catches hangs, not performance target (review precedent).

## Report tests

General rules: [python-testing.md](./python-testing.md). Report-specific below.

Measure durations via real CLI (`scripts/generate-report.py`) — full chain, actual PDFs — not pytest timings (fixture setup, transaction, collection).

### PDF byte assertions require ReportLab invariant mode

ReportLab embeds per-call timestamp/document ID — renders never byte-equal by default. `render(doc) != render(doc, style="other")` proves nothing (same-style renders also differ); `render(doc) == render(doc)` fails. Pin: `reportlab.rl_config.invariant = 1` before byte comparison (review precedent).

#### Desired

```python
def test_api_default_renders_lite_grid(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(reportlab.rl_config, "invariant", 1, raising=False)
    result = run_report(...)
    assert result.pdf_bytes == render_report_pdf(result.document, pdf_style="lite-grid")
    assert result.pdf_bytes != render_report_pdf(result.document, pdf_style="ruled")
```

#### Not desired

```python
# Proves nothing: the embedded timestamp/ID makes ANY two renders differ,
# so this passes even if both calls produce the same layout.
assert render_report_pdf(doc) != render_report_pdf(doc, pdf_style="ruled")
```

### Shared case-matrix modules

Shared parametrize data → plain data module beside tests (e.g. `cases.py`), not copy-pasted per file, not smuggled into `conftest.py`. Not a test file — scoped `exclude` on `name-tests-test` in `backend/.pre-commit-config.yaml`; exact path, not pattern pre-authorizing future helpers.

## Related standards

- [service-layer.md](./service-layer.md) — general service rules + display-lookup carve-out for report metadata
- [python-testing.md](./python-testing.md) — layout, naming, db-marker, fixture-matrix convergence
- [http-layer.md](./http-layer.md) — report endpoint conventions
- [code-structure.md](./code-structure.md) — compute-once, file-size rules for report modules
