# Specifications

Deliverable specifications are the execution contracts for bounded work. They translate durable project, feature, architecture, and standards context into one implementable slice.

## Purpose

A specification should let a fresh agent or contributor implement the deliverable without reconstructing intent from chat history. It is not the permanent product narrative; durable product knowledge belongs in `project.md`, feature requirements documents, architecture, and standards.

The specification body should read as the current implementation contract. After
greenlight, accepted steering or review feedback that changes the contract updates the
affected sections in place and records the audit trail in the final `Implementation And
Review Change Log`. The post-greenlight lifecycle lives in [Spec-Driven
Development](./spec-driven-development.md).

## Required Contents

- Deliverable title and ownership context
- Source context and required reading
- Scope and exclusions
- Approved review shape and decomposition rationale
- Acceptance criteria
- Test strategy and required evidence
- Agent implementation rules, including lead/subagent coordination and tracking system
- Implementation guidance, including important sequencing
- Standards that must be loaded
- Halt conditions
- Owner signoff requirements
- Run log or execution-record location
- Paste-ready implementation prompt
- Implementation And Review Change Log

## Acceptance Criteria

Acceptance criteria must be testable from the criterion itself. Each criterion should name the behavior, boundary, expected result, and verification method.

Weak:

```text
The dashboard works correctly.
```

Strong:

```text
When the API returns no records, the dashboard renders the empty state with no table rows and no error banner. Verified by the empty-result component test and one browser check.
```

## Storage

During implementation, local deliverable specifications live under
`<DOCS_ROOT>/specifications/`. The repo's operating model decides whether that
directory is tracked, ignored, mirrored to a project board or Jira, or promoted after
merge to another durable surface declared in `AGENTS.md`.

After implementation is complete and the PR lands, the repo may promote the final
current specification to the declared durable completed-spec surface:
`<DOCS_ROOT>/specifications/` or another knowledge base or tracker-backed archive.
Completed specs should keep the final `Implementation And Review Change Log` and link
the implementation PR, merge commit, feature, project milestone, roadmap, and
architecture context when available.

## Execution Records

Mutable run logs, QA findings, handoff notes, recovery notes, and scratch evidence
belong under `<DOCS_ROOT>/execution/` or in the repo-declared external execution
system. Do not bury execution state in specifications, long-lived feature docs,
architecture, roadmap, or completed-spec documents.

The specification should name the execution-record surface and tracking system: local
run log only, project board or external tracker, Jira, or another tracker. If
implementation may use subagents, the spec should name the lead agent's
responsibilities, delegation boundaries, file areas that require ordered work, and any
fresh-context QA passes expected.

## Relevant Skills

| Skill | How it helps efficiency |
| ----- | ----------------------- |
| `spec-builder` | Produces bounded execution contracts with scope, acceptance criteria, test strategy, implementation guidance, tracking model, implementation prompt, standards, and halt conditions. |
| `spec-driven` | Applies the approved specification after greenlight, including in-place contract updates and the Implementation And Review Change Log. |
| `feature-doc-builder` | Supplies durable feature, roadmap-increment, and related project milestone context so the specification does not need to restate long-lived product narrative. |
| `architecture-doc-builder` | Supplies design decisions and sequencing constraints that keep implementation aligned with intended system shape. |
| `jira-api` | Provides Jira-backed context for issue scope and acceptance criteria when the repo uses Jira. |
| Companion board/tracker integration (repo-configured) | Creates or synchronizes board-backed deliverables and specification paths when the repo uses a project board or external tracker. |
| `doc-check` | Verifies specification hygiene and formatting before the contract is treated as ready. |

## Related Sections

- [Code Generation](./code-generation.md)
- [Spec-Driven Development](./spec-driven-development.md)
- [Testing and Validation](./testing-and-validation.md)
- [PR Creation](./pr-creation.md)
