# Spec-Driven Development

Lifecycle after a deliverable specification is greenlit. The spec remains the current implementation contract while agents implement, verify, absorb Owner steering, respond to QA/PR feedback, and prepare for human signoff.

Authoring before greenlight: [Specifications](./specifications.md). This section starts once the contract is approved.

## Lifecycle

```text
spec creation → Owner greenlight → AC/TDD loop
  → Owner steering / QA/UAT / PR feedback
  → in-place spec updates when contract changes
  → Implementation And Review Change Log entry
  → rework + re-verify → draft PR + self-review
  → human signoff + merge → promote completed spec if policy requires
```

Steering/review feedback may arrive mid-implementation. Accepted contract changes update affected sections in place so the body always reads as current truth.

## Current Contract And Change Log

Update in place when accepted feedback changes scope, ACs, test strategy, sequence, public behavior, UX, API/schema/validation, branch topology, or bug-fix contract.

Final `Implementation And Review Change Log` is audit trail only (timestamp, source, section links, rationale, edit summary, verification impact) — not a second requirements source.

## Execution Records

Append-only run log / declared execution system — not the long-lived spec body. Include open-question resolutions, phase progress, failed attempts worth remembering, deviations, evidence locations, QA/rework, handoffs, subagent outcomes. Follow `AGENTS.md` for `<DOCS_ROOT>/execution/` vs tracker layout.

## Lead Agent And Worktree

One active worktree or stacked lane for the approved review artifact. Lead owns: scope vs current spec, phase/task order, file-conflict serialization, delegated-work integration, evidence↔AC mapping, run-log updates, PR-ready output.

Subagents: bounded phases/tasks/tests/docs/QA when allowed; serialize overlapping file work. Return changed files, commands, evidence, risks, questions. If no subagents, lead does the work and records that.

## AC/TDD Loop

1. Read approved spec + references; verify applicable standards
2. Resolve open questions before editing
3. Start at specified TDD entry / strongest narrow verification
4. Implement smallest coherent slice; run named checks; record evidence
5. Repeat until every current AC has evidence

Passing tests are insufficient if they do not prove the ACs.

## Fresh-Context QA

Independent QA/verifiers SHOULD use fresh context. Dimensions may include functionality/ACs, test quality, performance, hygiene, standards, security, a11y, stacked no-drift. QA does not modify code; returns PASS/FAIL with evidence. Contract-changing findings use in-place spec + change-log protocol; implementation-only findings stay in run log/tracker/PR.

## Draft PR Feedback

Draft PRs are part of the loop. Contract-changing feedback → update spec sections, change-log entry, execution record, re-verify ACs. Non-contract feedback stays in PR thread / run log / commits.

## Completed-Spec Promotion

After merge, follow declared storage mode. Promote final current spec (with change log + PR/merge links) to durable location when required. Do not promote run logs, scratch, failed attempts, or transient QA into the durable archive.

## Relevant Skills

| Skill | Role |
| --- | --- |
| `spec-driven` | Post-greenlight lifecycle + contract-change protocol |
| `spec-builder` | Greenlit spec, prompt, tracking, change-log section |
| `qa-testing` | Fresh-context verification |
| `pr-builder` / `pr-review` | Package and grade draft PRs |
| `gh-stack` | Stacked review shape |
| `handoff` | Resume context under execution/ |
| `jira-api` / `confluence` / board integration | When repo-declared |

## Related

[Specifications](./specifications.md) · [Code Generation](./code-generation.md) · [Testing](./testing-and-validation.md) · [PR Creation](./pr-creation.md) · [Self-Review](./self-review.md)
