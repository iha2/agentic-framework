---
# Standards Axis — Sub-Agent Brief

Review for standards conformance, correctness bugs, test value, agentic slop, and redundant computation: **does this repo's code match how this repo expects code to be written?**

Follow with `shared-rules.md` (diff scope, sizing taxonomy, output format, boundaries).

## Standards-Driven Review

Load `<DOCS_ROOT>/standards/` via `index.yaml`:

- Match changed files by path/language/service/feature/activity (`applies_to`).
- Read only relevant standards; cite when finding depends on repo policy.
- Check SPEC did not omit a standard that should have been prescribed.
- Tests follow repo patterns, fixtures, data-safety, evidence rules.
- Distinguish violations from optional cleanup.

Missing/stale/uncovered index → residual risk; do not invent policy. Explicit standards win over general judgment.

## Test Quality

Repo testing standards (via index) are authoritative; checklist supplements. When present (e.g. `python-testing.md`), cite named sections — greppable hooks beat paraphrase:

- `@pytest.mark.db` on display-only tests with no real DB rows.
- Committed skip for missing/undeployed migration (empty-fixture-table skip is allowed carve-out).
- HTTP error-path asserting only status — missing no-leak assertions / `_without_leaking_internals`.
- `inspect.getsource` / AST / regex on module bodies instead of behavior.

Quote the standard section so authors see policy, not opinion.

**Value over volume** — every test costs CI/maintenance. Flag count without confidence.

**High-value:** proves AC/invariant/contract/edge/regression/named risk; fails on bugs reviewers care about; public interfaces + realistic inputs; stable-boundary assertions; reuse fixtures/patterns; consolidate shared-setup matrices; cover realistic boundaries (invalid/empty/minmax/authz/tenant/missing/order/TZ/idempotency/concurrency) when risk applies.

**Low-value (flag):** duplicate stronger nearby coverage; mock-only collaborator asserts; private-helper/call-order/temporary-structure coupling; churny snapshots without readable asserts; abstract properties (source introspection, type tautologies, framework guarantees); synthetic inputs bypassing real validation; unreasonable preconditions (e.g. update without required ID); coverage padding; excessive layer duplication; N near-identical single-scenario tests → parametrize.

Wording: redundant with `X`; mock plumbing vs behavior at `X`; table-drive repeated fixture worlds; parametrize shared setup + varied outcomes.

## Agentic Slop And Redundancy

Prefer code-structure standard under `standards/` (e.g. `code-structure.md`) for file-size, splitting, slop, duplicated runtime work. Else use fallbacks below and note missing standard as residual risk.

Flag: duplicated helpers/constants/fixtures/types; one-call wrappers; generic utility names; defensive branches for impossible states without contract/test; narrating comments; unrelated rewrite/format/import churn; parallel implementations; dead compat/unused options/speculative extension; broad catch / swallowed context / inconsistent error shapes. State why it matters (noise, maintenance, bug, pattern divergence).

## File Size And Discoverability

Cite code-structure standard when present. Else for every added/modified file (code/tests/scripts/config/agent markdown):

- **>400 lines** → `[pebble]`: split or document intentional cohesion.
- **>600 lines** → `[rock]`: not approvable until split or accepted exception.

Include measured count + natural split points. Large test-harness data files → `[pebble]` only.

## Redundant Computation

Cite compute-once guidance when present. Else: duplicated **runtime** work ≠ duplicated code. Flag one request evaluating the same expensive source twice (query/view/function/proc/API/large scan). Prefer **compute once, return many**.

Often large: standards + perf (escalate per Finding Sizing); may reach `[boulder]` on hot paths; remedy is strategy (where data produced / contract shape), raise early; common blind spot when work is split across layers/agents.

Name the repeated operation, each execution site, and the single-execution shape serving all consumers.

### Cross-Axis Note

Strategy-level redundant computation may imply methodology/design divergence from SPEC decisions — note for orchestrator / Spec axis.
