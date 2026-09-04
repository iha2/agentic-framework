# PR Review — User Guide

Two-axis PR/branch/diff review via parallel sub-agents. Details: `SKILL.md`. Governance: [`docs/methodology/invariants.md`](../../../docs/methodology/invariants.md).

| Axis | Catches |
| --- | --- |
| **Standards** | Coding standards, test patterns, architecture conventions |
| **Spec** | Faithfulness to SPEC / issue / stated intent |

Also flags agentic clutter: low-value/duplicate tests; mock-heavy tests; unrealistic permutations; redundant helpers/parallel impls; speculative abstractions; noisy comments/format churn/broad rewrites; duplicated runtime computation.

Actor: `pr-builder` drafts PR text; **pr-review** inspects code/tests/evidence/standards (author draft or others' PRs). **MUST NOT** approve, merge, mark ready, or replace human judgment.

## Layout

```text
.agents/skills/pr-review/
  SKILL.md              # Orchestrator
  README.md             # This guide
  code-review-graph.md  # Optional graph context
  shared-rules.md       # Scope, sizing, output, boundaries
  standards-axis.md     # Standards brief
  spec-axis.md          # Spec brief
```

Orchestrator: pin base → optional graph → governing context → spec tier → parallel dispatch → aggregate. Keep modules discoverable; past ~400 lines split by task; past ~600 blocking before approval. Entry = orchestration only.

## When To Use

Author-side draft cleanup; pre-ready Owner review; large agent-assisted PR orientation; second pass on risk/test quality; stack branch pre-submit/post-rebase; separate real issues from agentic clutter.

### Starter prompts (one-liners)

- Current branch vs `dev`: standards, test quality, agentic slop.
- PR #N: findings to send to author.
- Backend/DB change: load `standards/index.yaml`; missed realistic edges.

## Context Loading

1. `AGENTS.md` (docs root, integration branch, conventions)
2. Target (diff / branch / PR / stack)
3. Pin `git merge-base` so both axes share one reference
4. File count: **>10** (or user ask) → `code-review-graph.md`; else skip
5. SPEC / PR body / ticket / ACs + tier
6. Match standards via `index.yaml`
7. Dispatch with respective briefs

## Optional Graph Utility

[`code-review-graph`](https://github.com/tirth8205/code-review-graph) for blast radius, callers/dependents, flows, test signals, lower-token context.

- ≤10 files: load only if requested.
- ≥11: load; if unavailable, recommend install/config or continue without.
- Agent workflow in `code-review-graph.md`; human install/troubleshoot in `docs/code-review-graph.md` when present.
- Prefer minimal CLI/MCP; do not install upstream companion skills/hooks unless user asks.
- Graph = advisory; verify against diff/source/tests/standards/SPEC.

```bash
git diff $MERGE_BASE...HEAD --name-only | wc -l
```

## Spec Tiers

| Tier | Spec source | Behavior |
| --- | --- | --- |
| 1 Full | SPEC/PRD/detailed issue + ACs | Full methodology |
| 2 Lightweight | PR body / brief issue / intent | Lower confidence |
| 3 None | Nothing usable | Reduced or skip; residual risk |

## Customizing Guidance

Repo policy → `<DOCS_ROOT>/standards/`, not this skill. Index by path/language/service/activity. Examples: FE patterns, a11y, API envelopes, authz/tenant, migration safety, fixtures, logging/metrics, generated artifacts. Skill = how to review; standards = what this repo expects.

## Test Philosophy

Stronger evidence, not more tests. Ask: prove ACs? realistic edges? share setup/parametrization? existing coverage enough? observable behavior vs private mechanics? fail on cared-about bugs? Flag under-testing **and** clutter (incl. unreasonable preconditions).

## Improving The Skill

Repo-specific → standards first. Cross-repo → generic skill: severity → `shared-rules.md`; loading/dispatch → `SKILL.md`; standards/test heuristics → `standards-axis.md`; Spec checks → `spec-axis.md`. Keep axis briefs substance; orchestrator = flow.

## Output

Separate **Standards Review** / **Spec Review** headings — no cross-axis merge/rerank. Each finding: copy-paste block starting with `[boulder|rock|pebble|sand]`, `file:line`, one-line problem, why (standard/SPEC), remediation. Only boulder/rock block; either axis blocks. Overlap at same `file:line` noted. End: per-axis counts, verdict, residual risk.
