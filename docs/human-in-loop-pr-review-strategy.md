# Human-in-the-Loop PR Review Strategy for AI-Assisted Code

Compressed 2026-09 for token reduction; full prior text in Git history before this change.

## Canonical sources

| Topic | Location |
| --- | --- |
| Two-axis PR review (Standards + Spec) | [`.agents/skills/pr-review/`](../.agents/skills/pr-review/) |
| Author-side hygiene before review | [`docs/methodology/self-review.md`](methodology/self-review.md) |
| Packaging evidence and reviewer guide | [`docs/methodology/pr-creation.md`](methodology/pr-creation.md) |
| Methodology entry | [`methodology.md`](../methodology.md) |
| Optional graph triage utility | [`docs/code-review-graph.md`](code-review-graph.md) |

## Invariants (MUST / SHOULD)

| Rule | Level |
| --- | --- |
| Humans keep final approval and merge authority; agents prepare, check, and surface risk only | MUST |
| No implementation from an ad hoc prompt alone — start from a documented implementation contract (merged approved spec, approved feature/architecture doc, or sufficiently detailed tracker bug/task) | MUST |
| No human review without contract, evidence, and reviewer guidance | MUST |
| `pr-builder` packages context; `pr-review` grades against contract, evidence, and repo standards | MUST |
| Broad agent diffs MUST pass a decomposition gate tied to the approved review shape; if none was approved, return to spec update/approval | MUST |
| Bugs/simple tasks MAY use a fast path when the tracker record is a sufficient contract | SHOULD |
| Features/broad deliverables REQUIRE the spec reviewed, approved, and merged before implementation | MUST |
| Stacks MUST create coherent review units — not dozens of tiny PRs from one unreviewable change | SHOULD |
| Advisory risk/shape labels inform routing; they are not merge authority | MUST |
| Large exceptions (unsplitable oversized PRs) MUST be rare, explained, and consented before full review | MUST |

## Review tiers

| Tier | When | Human bar |
| --- | --- | --- |
| Automated | Docs-only, formatting, approved policy dep patches, mechanical/generated with strong evidence | Lighter human review; **not** auto-merge or unattended approval |
| Standard | Normal app/service logic | Passing checks, `pr-review` first pass, complete evidence, **one human approval** |
| Critical | Prod incident, data loss, security, external contracts, broad blast radius | Named owner/CODEOWNER, stronger evidence/regression, extra reviewer/domain lead when needed |
| Large exception | Exceeds review budget, cannot reasonably split | Explicit why-not-split, reviewer consent, review map, deepest-attention files, stronger runtime evidence |

## Ready / merge gates (compact)

**Ready for review:** required checks (or documented failure), no unresolved critical agent findings, evidence + reviewer guide, recommended tier, stack map when applicable, decomposition rationale for broad diffs.

**Before merge:** required human approvals for tier, no unresolved critical/important comments, up-to-date base/merge-queue validation, rollback/monitoring notes when operational risk exists.
