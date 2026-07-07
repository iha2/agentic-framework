# Agentic Software Delivery Methodology

This document is the **methodology entry point** for the **Agentic Software Delivery Methodology** in this repository (`agentic-framework` on GitHub). Detailed sections live under [`docs/methodology/`](docs/methodology/).

## Engineering-led delivery with agent acceleration

This methodology is for teams where **talented engineers and architects stay in charge of how systems are built**—**architecture** and **specifications** set shape and behavior, **curated standards** and **skills** provide **guardrails** and repeatable practice, and **deterministic gates** keep quality objective. **Agents** then take on much of the **mechanical** work: implementation against approved specs, tests and quality gates, iteration on failures, PR packaging, evidence assembly, and **preparatory review** (`pr-review`, `qa-testing`, related skills) **within those contracts**. That is **not** “vibe coding”; it is **disciplined execution** with tooling.

**Engineers and accountable owners** remain responsible for:

- **Product and scope** — intent, prioritization, and what “done” means for the customer or business.
- **Architecture and cross-cutting design** — boundaries, interfaces, non-functional requirements, and evolution of the system shape.
- **Specifications and features** — authoring, refining, and **approving** contracts agents execute against.
- **Standards** — defining, evolving, and granting **exceptions** to engineering rules agents must follow.
- **Risk and sign-off** — merge approval, production promotion, and selective deep review when policy requires it.

Without capable agents and AI tooling, you would **rebalance throughput and roles**; without strong **specs, standards, and architecture discipline**, speed would outrun safety. This methodology assumes **both**.

## Scope

The same document model applies to **software products, global web experiences, microservices, data platforms, and internal enterprise systems**—anywhere you want **repeatable, reviewable** delivery with **clear engineering ownership** and **agent acceleration** inside that guardrail.

## Executive overview

Agents can implement and verify quickly. The hard part is keeping **architecture coherent**, **specifications trustworthy**, **standards real**, and **evidence** credible—so **engineering judgment** survives merge, not just diffs.

This methodology provides a path from intent to **reviewer-approved** merge:

- Durable docs capture product context, **architecture**, decisions, features, and **standards agents enforce**.
- **Deliverable specifications** are the execution contracts for bounded agent work.
- **Deterministic gates** (linters, types, CI, conformance) constrain probabilistic work.
- **Agent skills** encode repeatable implementation, verification, PR packaging, and preparatory review steps.
- **Engineers and owners** approve specifications, own standards and architecture tradeoffs, and **merge** when quality and risk criteria are met.

## Progression

```text
project.md
  -> architecture.md
  -> proposals/
  -> features/ and milestones
  -> specifications/
  -> spec-driven implementation (post-greenlight)
  -> deterministic quality gates
  -> standards conformance maintenance
  -> code generation (agents)
  -> testing and validation (agents)
  -> PR packaging and preparatory review (agents)
  -> merge review and approval (engineers)
  -> durable docs updated
```

Not every change needs every step. Small fixes may start at a specification. Uncertain direction starts with a **proposal**. Long-lived capabilities need **feature** and **architecture** context before slicing deliverables.

## Section guide

| Section | Purpose |
| ------- | ------- |
| [Project document](docs/methodology/project.md) | `project.md` and top-level orientation. |
| [Architecture](docs/methodology/architecture.md) | Technical shape and decisions. |
| [Proposals](docs/methodology/proposals.md) | Durable decisions under uncertainty. |
| [Features and project milestones](docs/methodology/features-and-milestones.md) | Feature requirements, roadmap increments, and project milestones. |
| [Specifications](docs/methodology/specifications.md) | Deliverable specs as agent contracts. |
| [Spec-driven development](docs/methodology/spec-driven-development.md) | Post-greenlight lifecycle, contract updates, and signoff. |
| [Deterministic quality gates](docs/methodology/deterministic-quality.md) | Linters, CI, conformance, agent-facing text checks (including invisible Unicode). |
| [Code generation](docs/methodology/code-generation.md) | Agent implementation and worktrees. |
| [Testing and validation](docs/methodology/testing-and-validation.md) | Evidence and QA loops. |
| [PR creation](docs/methodology/pr-creation.md) | Draft-first PRs and stacks. |
| [Preparatory review](docs/methodology/self-review.md) | Automated tightening on draft PRs before human merge review. |
| [Human review and merge](docs/human-in-loop-pr-review-strategy.md) | Human tiers, approval, merge. |

## Core document model

Project-first layout under `<DOCS_ROOT>/`:

- `project.md` — purpose, users, capabilities, assumptions.
- `architecture/` — technical shape and system decisions.
- `proposals/` — decisions when the path is uncertain.
- `features/` — long-lived capabilities and feature roadmap increments.
- `specifications/` — bounded deliverable contracts **agents execute**.
- `execution/` — mutable run logs, QA, handoffs (when on disk).
- `standards/` — **rules humans own and agents apply**.

Declare the docs root in `AGENTS.md`, commonly `docs/` or `.agentic/`. If using an environment variable for the root, use **`AGENTIC_DOCS_ROOT`** (repo-relative path only).

```text
<DOCS_ROOT>/
├── project.md
├── architecture/
├── proposals/
├── features/
├── specifications/
├── execution/
└── standards/
```

## Operating principles

1. Durable knowledge lives in versioned docs, not only chats or ad-hoc tasks.
2. Specifications are the **contracts** for agent-executed work.
3. Deterministic tools enforce every rule they can express reliably.
4. Conformance keeps existing code aligned through small, agent-prepared PRs.
5. Acceptance criteria and evidence are required for convergence.
6. **Agents execute** inside approved contracts; **engineering owners** own scope, standards interpretation, architecture fit, ambiguity resolution, and merge approval.
7. Active implementation uses **isolated worktrees**.
8. **Draft PRs** are the default packaging surface for agent work.
9. **Preparatory automated review** runs before reviewers are asked for merge approval.
10. Durable docs update when shipped work changes product, architecture, or standards.

## Skills

Shared skills under [`.agents/skills/`](.agents/skills/) encode agent workflows:

| Workflow | Skill |
| -------- | ----- |
| Proposal exploration | `proposal-builder` |
| Feature requirements | `feature-doc-builder` |
| Architecture docs | `architecture-doc-builder` |
| Deliverable specifications | `spec-builder` |
| Post-greenlight implementation | `spec-driven` |
| Implementation verification | `qa-testing` |
| PR packaging | `pr-builder` |
| Preparatory review (automated) | `pr-review` |
| Stacked PR workflow | `gh-stack` |
| Worktree setup | `worktree` |
| Standard creation | `standard-builder` |
| Standards conformance | `conformance` |
| Documentation checks | `doc-check` |
| Invisible Unicode / smuggling lint (extend rules) | `invisible-unicode-lint` |

Utilities such as `jira-api`, `miro-mcp`, `psql`, and `sqlcmd` apply when the repo uses those systems.

## Authority gates

**Agents** may draft docs, implement, run tests and linters, prepare PRs, and perform **preparatory review** when the **governing specification**, **architecture constraints**, and **repo policy** allow.

**Engineers and accountable humans** retain:

- approval of proposals, features, architecture, and specifications  
- standards ownership and exceptions  
- resolution of ambiguity, engineering tradeoffs, and subjective product judgment  
- **merge and release approval** (and mandatory human review when declared in policy)

## Storage modes

**Git-native** by default for methodology text, standards, skills, specifications (when on disk), features, and execution pointers.

**Stakeholder-facing vs agent-reference (recommended for SBD Customer Engagement)**

- **Proposals** — Vetted and shared with **non-technical stakeholders** using tools they can access without cloning a repo: e.g. **GitHub** (issues, discussions, wiki, rendered docs), **SharePoint** (libraries, pages, review flows), and/or **Miro** (workshop boards, option diagrams, architecture sketches). Keep under `<DOCS_ROOT>/proposals/` in Git **pointer files** (or a small index) so every agent and engineer resolves the same canonical link, status, and owner. The pointer is the crosswalk between “where humans discuss” and “where code lives.” When using Miro, follow the **`miro-mcp`** skill; declare default board URLs and pointer conventions in **`project.md`** or proposal index files—not by duplicating long policy in `AGENTS.md`. A minimal `AGENTS.md` may use **one line** to point at those files.
- **Project and architecture** — **Authoritative** packages for governance and stakeholders often live in **SharePoint** as Word, PowerPoint, HTML, or PDF. Maintain **`project.md`** and markdown under **`architecture/`** in the repo as the **agent-reference** layer: structured, diffable, and easy to load into agent context. Record (1) which surface is authoritative for **approval**, (2) how often the repo copy must be refreshed from SharePoint, and (3) who owns that sync in **`project.md`** (or a short governance doc under `<DOCS_ROOT>/`); keep **`AGENTS.md`** to a **pointer** if you use the minimal template.

External systems for execution-only records remain allowed when policy and stable lookup paths are declared in **standards**, **`project.md`**, or **`AGENTS.md` as a single-line reference**—not by pasting full runbooks into `AGENTS.md`.

## Canonical copy

This repository is the **canonical source** for the Agentic Software Delivery Methodology, standards library, and bundled skills. Consumer repos vendor or sync; methodology intent stays centralized here.
