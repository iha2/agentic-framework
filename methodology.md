# Agentic Software Delivery Methodology

Methodology entry point. Governance invariants: [`docs/methodology/invariants.md`](docs/methodology/invariants.md). Detailed sections: [`docs/methodology/`](docs/methodology/).

## Scope

Applies to software products, web experiences, microservices, data platforms, and internal enterprise systems requiring repeatable, reviewable delivery with explicit engineering ownership and agent execution under contract.

## Progression

```text
project.md
  -> architecture.md
  -> proposals/
  -> features/ (roadmap increments) and project milestones
  -> specifications/
  -> spec-driven implementation (post-greenlight)
  -> deterministic quality gates
  -> standards conformance maintenance
  -> code generation (agents)
  -> testing and validation (agents)
  -> PR packaging and preparatory audit (agents)
  -> merge review and approval (engineers)
  -> durable docs updated
```

Small fixes may start at specifications. Uncertain direction starts with proposals. Long-lived capabilities need feature and architecture context before slicing deliverables.

## Section guide

| Section | Purpose |
| ------- | ------- |
| [Project document](docs/methodology/project.md) | `project.md` and top-level orientation. |
| [Architecture](docs/methodology/architecture.md) | Technical shape and decisions. |
| [Proposals](docs/methodology/proposals.md) | Durable decisions under uncertainty. |
| [Features and project milestones](docs/methodology/features-and-milestones.md) | Feature requirements, roadmap increments, milestones. |
| [Specifications](docs/methodology/specifications.md) | Deliverable specs as agent contracts. |
| [Spec-driven development](docs/methodology/spec-driven-development.md) | Post-greenlight lifecycle, contract updates, signoff. |
| [Deterministic quality gates](docs/methodology/deterministic-quality.md) | Linters, CI, conformance, agent text checks. |
| [Code generation](docs/methodology/code-generation.md) | Agent implementation and worktrees. |
| [Testing and validation](docs/methodology/testing-and-validation.md) | Evidence and QA loops. |
| [PR creation](docs/methodology/pr-creation.md) | Draft-first PRs and stacks. |
| [Preparatory review](docs/methodology/self-review.md) | Automated tightening on draft PRs. |
| [Human review and merge](docs/human-in-loop-pr-review-strategy.md) | Human tiers, approval, merge. |

## Document model

See [`invariants.md`](docs/methodology/invariants.md) for `<DOCS_ROOT>/` layout and stakeholder vs agent-reference surfaces.

## Skills

Shared skills under [`.agents/skills/`](.agents/skills/):

| Workflow | Skill |
| -------- | ----- |
| Proposal exploration | `proposal-builder` |
| Feature requirements | `feature-doc-builder` |
| Architecture docs | `architecture-doc-builder` |
| Deliverable specifications | `spec-builder` |
| Post-greenlight implementation | `spec-driven` |
| Session handoff | `handoff` |
| Implementation verification | `qa-testing` |
| PR packaging | `pr-builder` |
| Preparatory audit | `pr-review` |
| Stacked PR workflow | `gh-stack` |
| Worktree setup | `worktree` |
| Standard creation | `standard-builder` |
| Standards conformance | `conformance` |
| Documentation checks | `doc-check` |
| Invisible Unicode lint | `invisible-unicode-lint` |
| Confluence (when declared) | `confluence` |

Utilities (`jira-api`, `miro-mcp`, `psql`, `sqlcmd`) apply when the repo declares those systems.

## Canonical copy

This repository is the canonical source for methodology, standards, and bundled skills. Consumer repos vendor or sync; intent stays centralized here.
