# Features and Project Milestones

Feature requirements docs describe durable product capabilities. Project milestones organize delivery expectations on a timeline. Deliverables are bounded implementation slices that may attach to a feature (product context) and a project milestone (stakeholder planning).

| Concept | Centricity | Role |
| --- | --- | --- |
| Feature | Functionality | What capability exists, why it matters, how it evolves via roadmap increments |
| Project milestone | Time | When stakeholders expect meaningful outcomes; may mix features, bugs, chores, tech investment |
| Deliverable | Execution | Bounded slice that can contribute to a feature and land in a milestone |

## Feature Requirements Documents

Use when a capability evolves across multiple deliverables, releases, or workflows.

Recommended contents: purpose/user value, current state, target capability, journeys/workflows, feature roadmap increments, related milestones, success criteria, key decisions/proposal links, architecture links, open questions.

## Feature Roadmap Increments

Capability-oriented steps in a feature’s evolution — not the authoritative project timeline. Name: intended outcome, candidate/known deliverables, excluded work, feature-level success criteria, dependencies/sequencing.

Use increments for feature narrative sequencing; use project milestones for dates, windows, stakeholder commitments, and cross-feature groupings.

## Project Milestones

Project-scoped planning containers. Name or expose: planned dates/window, included deliverables (multi-feature OK), stakeholder outcome, excluded/deferred scope, release/acceptance criteria, dependencies.

When Jira/GitHub Projects/another tracker is canonical for milestone records and assignment, feature docs link to it — do not duplicate the schedule. Core rule: projects have milestones; deliverables are assigned to them for timeline communication.

## Time-Boxed Deliverables

Each deliverable gets a specification and fits one worktree unless the team intentionally uses a stacked lane. Good deliverables: clear outcome, verifiable ACs, bounded scope, reviewable PR. If not independently testable/reviewable, split or return uncertainty to proposal/feature/architecture.

## Storage

Durable feature/milestone history lives in the declared durable surface (`<DOCS_ROOT>/features/`, optional `<DOCS_ROOT>/roadmap/`, or wiki/tracker per `AGENTS.md`). Active specs under `<DOCS_ROOT>/specifications/`; run logs/QA/handoffs under `<DOCS_ROOT>/execution/` or declared tracker. Promote durable feature/roadmap/milestone updates when shipped behavior changes.

## Relevant Skills

| Skill | Role |
| --- | --- |
| `feature-doc-builder` | Feature requirements + roadmap increments |
| `proposal-builder` | Resolve uncertainty before roadmap hardens wrong |
| `architecture-doc-builder` | Multi-deliverable / multi-service design depth |
| `spec-builder` | Slice deliverables into executable specs |
| `jira-api` / `confluence` / board integration | When repo-declared |

## Related

[Specifications](./specifications.md) · [Code Generation](./code-generation.md) · [Testing](./testing-and-validation.md)
