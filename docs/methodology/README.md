# Methodology sections

This directory contains the focused sections behind the [Agentic Software Delivery Methodology overview](../../methodology.md). Execution steps assume **engineering-led shaping** (architecture, specifications, curated standards) and **agent-accelerated** implementation, testing, PR packaging, and preparatory review—under **skilled human oversight** and merge approval unless your repo’s `AGENTS.md` documents a narrower or wider split.

Read in workflow order:

1. [Project Document](./project.md)
2. [Architecture](./architecture.md)
3. [Proposals](./proposals.md)
4. [Features and Project Milestones](./features-and-milestones.md)
5. [Specifications](./specifications.md)
6. [Spec-Driven Development](./spec-driven-development.md)
7. [Deterministic Quality Gates and Conformance](./deterministic-quality.md)
8. [Code Generation](./code-generation.md)
9. [Testing and Validation](./testing-and-validation.md)
10. [PR Creation](./pr-creation.md)
11. [Self-Review](./self-review.md)
12. [Human Review and Merge](../human-in-loop-pr-review-strategy.md)

**Related (outside this folder):** [Code quality notes](../code-quality/README.md) — invisible Unicode / deterministic linting guide for humans.

Use only the sections relevant to the current work. Small fixes may start at specifications; larger capabilities usually start with project, architecture, proposal, or feature context.

Each section includes a `Relevant Skills` table that explains which skills apply and how they improve process efficiency.

## Skill Map

| Stage | Primary skills |
| ----- | -------------- |
| Project orientation | `feature-doc-builder`, `architecture-doc-builder`, `proposal-builder`, `miro-mcp` |
| Architecture direction | `architecture-doc-builder`, `proposal-builder`, `spec-builder`, `miro-mcp` |
| Proposals and decisions | `proposal-builder`, `feature-doc-builder`, `architecture-doc-builder`, `miro-mcp` |
| Features and project milestones | `feature-doc-builder`, `architecture-doc-builder`, `spec-builder`, `confluence` |
| Deliverable specifications | `spec-builder`, `spec-driven`, `jira-api` |
| Post-greenlight implementation | `spec-driven`, `handoff`, `qa-testing`, `pr-builder`, `pr-review` |
| Deterministic quality gates and standards conformance | `standard-builder`, `conformance`, `doc-check`, `invisible-unicode-lint`, `qa-testing` |
| Code generation | `worktree`, `conformance`, `psql`, `sqlcmd` |
| Testing and validation | `qa-testing`, `pr-review`, `conformance`, `psql`, `sqlcmd` |
| PR creation | `pr-builder`, `gh-stack`, `qa-testing` |
| Preparatory review | `pr-review`, `qa-testing`, `pr-builder`, `conformance` |
| Human review and merge | `pr-review`, `gh-stack`, `doc-check` |

`miro-mcp` applies when **Miro MCP** is enabled and boards support proposals or architecture visuals; it is optional for repos that do not use Miro.
