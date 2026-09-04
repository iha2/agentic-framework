---
name: pr-review
description: Review a pull request, branch, or local diff along two independent axes — Standards (does the code follow documented coding standards?) and Spec (does the code match what was asked for?) — using parallel sub-agents; use when the user wants draft-PR self-review, reviewer-side PR feedback, standards-guided findings, or review readiness assessment.
---

# PR Review

Two independent axes via parallel sub-agents, then aggregate. **MUST NOT** approve, merge, mark ready, or replace human judgment. Companion briefs: `shared-rules.md`, `standards-axis.md`, `spec-axis.md`; optional `code-review-graph.md`. Governance: [`docs/methodology/invariants.md`](../../../docs/methodology/invariants.md), [`docs/agent-execution-discipline.md`](../../../docs/agent-execution-discipline.md). Actor split: `pr-builder` drafts PR text; this inspects code/tests/evidence/standards.

| Axis | Question |
| --- | --- |
| **Standards** | Conforms to coding standards, test patterns, architecture conventions? |
| **Spec** | Faithfully implements originating SPEC / issue / stated intent? |

Separate reporting prevents masking (right standards + wrong thing = Spec fail; right intent + broken conventions = Standards fail).

## Startup

### 1. Repo Context + Standards Discovery

Read `AGENTS.md` / `CLAUDE.md` for review workflow, docs root, standards, target branch, tracking.

**Standards index** — first hit wins:

1. Docs root from `AGENTS.md`/`CLAUDE.md` → `<docs-root>/standards/index.yaml`
2. `ZAZZ_DOCS_ROOT` (legacy)
3. `docs/standards/index.yaml`
4. Else ask: standards path, or run without standards-driven review?

No standards → Standards axis still runs on general judgment; note residual risk.

**Integration branch:** `AGENTS.md` → else `dev` / `main` / `master` → else ask.

### 2. Target

PR URL/number | current draft vs integration | other author's branch | stack/dependent PR | local diff pre-PR.

### 3. Pin Comparison Base

User's fixed point (SHA/branch/tag/`main`/`HEAD~N`) passes through. If unspecified, ask and **halt** until set.

```bash
MERGE_BASE=$(git merge-base <fixed-point> HEAD)
```

Both sub-agents **MUST** use this base: `git diff $MERGE_BASE...HEAD`, `git log $MERGE_BASE..HEAD --oneline`, `--name-only`, file count.

### 4. Size + Graph Context

If changed files **> 10** or user asked for graph/blast-radius/token-efficient review → load `code-review-graph.md` and follow it. Else ≤10 and no ask → do not load; record `Graph context: not requested - N changed files`. Capture concise graph summary for both axes when loaded. Do not block ordinary review on optional utility unless user requested it.

### 5. Governing Context

**Standards:** load index → match paths/activities via `applies_to` → read matched files only → note machine-enforced configs (eslint/prettier/tsconfig/editorconfig) — do not re-check tooling.

**Spec** (search order): PR-linked SPEC/external record; `<DOCS_ROOT>/specifications/` match; issue refs in commits; user path arg; `docs/`/`specs/` PRD; PR body/work item as lightweight substitute.

### 6. Spec Tier

| Tier | Meaning |
| --- | --- |
| 1 Full | Deliverable SPEC / PRD / detailed issue with ACs → full methodology checks |
| 2 Lightweight | PR body / brief issue / stated intent → lower-confidence findings |
| 3 None | Confirmed absent → reduced Spec mode or skip if no usable context |

If none found, ask. Thin PR + no spec → skip Spec axis; residual risk.

### 7. Preamble

One confirmation (not interview):

```
**Review preamble — please confirm or correct:**
- **Target**: … against `<integration>` (merge base: `<sha>`)
- **Standards**: N matched from `<index>` | none — general judgment
- **Spec**: <tier> — <source> | skip
- **Graph context**: …
- **Changed files**: N across <areas>
Proceed, or adjust?
```

Unambiguous invocation may compress to one line then dispatch. On correction that changes tier → re-confirm.

### 8. Dispatch

One message, two parallel `general-purpose` Agent calls. Load `shared-rules.md` (both), `standards-axis.md` / `spec-axis.md` (respective).

**Standards prompt:** pinned base/diff/commits/files; graph summary if any; matched standards contents; full `shared-rules` + `standards-axis`; exclusive focus: standards, quality, test value, agentic slop, redundant computation — **not** Spec.

**Spec prompt:** same pin + graph; spec contents + tier; `shared-rules` + `spec-axis`; exclusive focus: compliance, scope drift, AC coverage, methodology — **not** Standards/test-pattern quality.

Tier-3 skip → Standards only; note in aggregation.

### 9. Aggregate

Separate headings. **MUST NOT** merge/rerank across axes. Same `file:line` on both = important overlap signal, not duplicate — note it; do not dedupe across axes.

```markdown
## Standards Review
[…]
## Spec Review
[…] | Skipped — residual risk: …
## Cross-Axis Overlap
[…]  <!-- omit if none -->
## Summary
- Standards: N (boulders/rocks/pebbles/sand)
- Spec: N (…) | skipped
- Verdict: Approvable | Not approvable — N blocking
- Residual risk: …
```

**Approval:** any open `[boulder]`/`[rock]` on **either** axis → **not approvable**. `[pebble]`/`[sand]` never block.

Run targeted tests/static checks only when necessary; prefer before dispatch; if not run, state in residual risk.
