# Spec Builder — User Guide

Draft deliverable specifications via **spec-builder**. Procedure: `SKILL.md`.

## Rules

```text
one deliverable = one deliverable specification
a worktree / branch / PR may contain one deliverable, multiple deliverables, or a single-lane stack
```

Interactive dialogue → self-contained SPEC (review shape, ACs, sequence, DoD, halt, run-log, implementation prompt, Change Log). No separate execution doc. Does **not** implement product code.

**Integration:** agents MAY commit/push feature branches when the SPEC says so; MUST NEVER merge to the integration branch. Wording: "submit a PR to `{{ integration-branch }}`" / "after the PR lands" — not agent merge.

## When

Bounded deliverable before impl · milestone multi-spec one PR · sibling PRs · stacked lane (`gh-stack`) · post-approval contract updates.

## Topologies

| Topology | Shape |
| --- | --- |
| Single-deliverable branch | One deliverable, one SPEC, one PR |
| Milestone branch | Ordered specs, one worktree/branch/PR, shared run log |
| Sibling branches | Independent PRs; no stack |
| Stacked review lane | Dependent PRs in **one** lane worktree via `gh-stack` |

MUST NOT create stacked worktrees. Review shape is SPEC-time; mid-flight change → Owner sign-off + in-place update + Change Log.

## Invoke

`/spec-builder` or `@.agents/skills/spec-builder/SKILL.md` + deliverable/milestone description.

State when known: topology · slug(s) · review artifact · decomposition rationale · tracking system · lead vs subagents · conflict/QA model. Skill interviews gaps in small batches; MUST NOT leave implementors guessing DoD evidence.

## Paths

| Artifact | Default |
| --- | --- |
| SPEC | `<DOCS_ROOT>/specifications/<slug>.md` (tracked/ignored/mirrored/promoted per repo) |
| Milestone SPECs | `<DOCS_ROOT>/specifications/<milestone>-spec-<n>-<slug>.md` or Owner pattern |
| Run log | `<DOCS_ROOT>/execution/<slug>-run-log.md` (or shared milestone/lane file); board/Jira when declared |
| External SPEC | Stable ID linked from PR + prompt |

## Ready before start

Rough deliverable · intended review shape · tracking surface · lead/subagent model · ordered-file risks · QA dimensions · constraints · source docs.

## After approval

Implement from SPEC + run log. Post-greenlight contract changes → `spec-driven` (in-place body + Change Log; progress in run log).

## Operating model history

2026-07: dropped separate execution doc; SPEC is the contract, run log is progress. Normative procedure: `SKILL.md`.
