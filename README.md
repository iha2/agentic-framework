<img width="1600" height="900" alt="methodology-heptagon-project-goals-for-light-slides" src="https://github.com/user-attachments/assets/95f14be9-cd17-416f-ae05-da8f88fdc3e5" /># Agentic Software Delivery

**Agentic Software Delivery Methodology** — **engineering-led** delivery for software products, global web experiences, microservices, data-backed services, platforms, and internal enterprise applications. **Architecture**, **approved specifications**, and **curated standards** define *how* systems are shaped; **agents** accelerate bounded implementation and verification under **skilled engineer oversight**—not improvised “vibe coding.”

## How this model is different

In this methodology, **agents are a first-class execution engine**, not a side chat. The normal path assumes **agents run much of the mechanical workstream**: implementation, tests and quality gates, iteration on failures, PR packaging, evidence assembly, and **preparatory review**—all **inside contracts** set by engineers and product leadership. **Talented engineers stay central**: they own and refine **architecture**, **specifications**, and **standards**; they judge tradeoffs and edge cases; they decide when agent output is acceptable; they exercise **merge and release approval** (and deeper review when risk requires it). **Curated standards** and **skills** are deliberate **guardrails** and repeatable playbooks, not optional hints.

If you removed agents from the loop, you would **rebalance roles and throughput**; if you removed **specs, standards, and architecture discipline**, you would get speed without safety—this methodology assumes **both** professional rigor **and** agent acceleration.

This repository holds the **canonical methodology**, the **standards library**, and **agent skills** under `.agents/skills/`. Downstream repos vendor or sync these assets; upstream intent stays here.

**Primary adoption context:** Stanley Black & Decker, Customer Engagement — corporate IT engineering teams standardizing agentic delivery across repositories.

## Executive overview

The hard problem is not typing code faster—it is building the **right** thing under a **coherent architecture**, keeping changes **reviewable**, making **evidence** credible, and preserving **knowledge** after merge—while **agents handle much of the mechanical work** inside approved specifications and standards.

This methodology provides:

- **Engineer-led shaping:** architecture, specifications, and standards define intent, structure, and quality bars before and during delivery.
- **Agent-accelerated execution:** bounded implementation, test runs, PR packaging, and preparatory review run against those contracts.
- **Human judgment where it matters:** tradeoffs, exceptions, risk acceptance, and merge/release approval stay with people—especially senior engineers and accountable owners.
- **Clearer intent before execution:** `project.md`, proposals, architecture, feature requirements, feature roadmap increments, and project milestones preserve *why* before agents implement. *(See **Stakeholder-facing vs agent-reference docs** below for the SBD Customer Engagement pattern: proposals and formal project/architecture artifacts in GitHub or SharePoint, with Git-tracked markdown in the repo for agents.)*
- **Executable contracts:** deliverable specifications scope agent work with acceptance criteria, tests, standards pointers, and halt conditions.
- **Deterministic + probabilistic quality:** linters, CI, and conformance PRs reduce variance; agent review skills tighten feedback before humans look.
- **Parallel execution:** worktrees isolate agent lanes.
- **Durable knowledge:** shipped work updates docs so decisions do not live only in chats or tickets.

Workflows are **Git-native**: docs, code, evidence, and merge flow through branches and pull requests. Skills operationalize repeatable agent steps across runtimes.

<img width="1600" height="900" alt="methodology-heptagon-project-goals-for-light-slides" src="https://github.com/user-attachments/assets/a815c5d4-5e7a-416f-b5f2-ef6117b07a90" />


## Quick links

- [Methodology overview](methodology.md)
- [Methodology sections](docs/methodology/README.md)
- [Standards baseline](docs/standards/README.md)
- [Standards index](docs/standards/index.yaml)
- [`AGENTS.md` example template](templates/AGENTS.md)
- [Worktree setup](docs/worktree-setup.md)
- [Agent execution discipline](docs/agent-execution-discipline.md)
- [Worktrunk cheat sheet](docs/wt-cheat-sheet.md)
- [GH-stack guide](docs/using-gh-stack.md)
- [Human-in-the-loop PR review strategy](docs/human-in-loop-pr-review-strategy.md)
- [Code review graph guidance](docs/code-review-graph.md)
- [Invisible text prompt injection, linting, and deterministic checks](docs/code-quality/invisible-text-prompt-injection-and-linting.md) — Unicode smuggling gate and rationale (`docs/code-quality/`)
- [Human guidelines: agent instruction supply chain (for reviewers)](docs/security/agent-instruction-supply-chain-human-guidelines.md)
- [Graphify code knowledge graph](docs/graphify/README.md) — setup kit, new-computer guide, agent workflow (SKUNK-438)

## Workflow

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
  -> PR packaging and preparatory review (agents)
  -> merge review and approval (engineers)
```

Read [methodology.md](methodology.md) first, then [docs/methodology/README.md](docs/methodology/README.md) for the section you need.

## Document model

Each repo declares its methodology docs root in `AGENTS.md`, usually `docs/` or `.agentic/`. If the root is resolved from an environment variable, standardize on **`AGENTIC_DOCS_ROOT`** (repo-relative only), e.g. `docs`, `.agentic`, or `packages/platform-docs`.

```text
<DOCS_ROOT>/
├── project.md
├── standards/
├── proposals/
├── features/
├── architecture/
├── specifications/
└── execution/
```

For the full progression, see [methodology.md](methodology.md).

### Stakeholder-facing vs agent-reference docs (SBD Customer Engagement)

Many corporate programs need **non-technical stakeholders** to read, comment on, and approve direction **outside** the repo. A practical pattern is:

- **Proposals** — Maintain the **vetting copy** where stakeholders already work: for example **GitHub** (issues, discussions, wiki, or linked docs), **SharePoint** (pages, document libraries, review workflows), and/or **Miro** (boards for options, flows, and workshops). Use `<DOCS_ROOT>/proposals/` in Git for **stable pointers**: title, owner, status, summary, link to the public artifact, and revision or “last reviewed” metadata so agents and engineers have a single place to resolve “where is the current proposal?” Default Miro links and board conventions belong in **pointer files or `project.md`**, not in a long `AGENTS.md`.
- **Project and architecture** — Keep **authoritative** narrative and visuals for humans in **SharePoint** (Word, PowerPoint, exported HTML or PDF, etc.) for portfolio reviews, steering committees, and shared drives. Maintain **`project.md`** and **`architecture/`** markdown in the repo as the **agent-reference** view: concise, structured, and loadable in context. Record which surface is authoritative for sign-off and who keeps the repo copy aligned in **`project.md`** (or a governance doc); use a **minimal `AGENTS.md`** to point there instead of restating the policy.

Standards, specifications, features, and execution records can stay Git-first as today; the split above mainly affects **early funnel** artifacts that need broad visibility.

### Mutable execution workspace (`execution/`)

SBD repos use **`<DOCS_ROOT>/execution/`** for mutable, usually gitignored working artifacts during delivery — **not** `ephemeral/` (that name is used in other methodology variants). Typical contents:

- run logs and phase progress
- `handoff` notes (`*-HANDOFF-*.md`)
- QA scratch findings and recovery notes
- temporary evidence paths before promotion to PR or durable docs

Declare the exact policy in `AGENTS.md`; external trackers (Jira, Azure DevOps, etc.) may replace or mirror on-disk execution records.

## Repository layout

```text
.agents/skills/     shared agent skills (AI-tool agnostic)
docs/               methodology guides and supporting docs
docs/graphify/      Graphify adoption docs (setup kit, guides, agent prompt)
docs/standards/     reusable engineering standards
templates/          example files for adopting repos
tooling/            copy-into-repo tooling fragments (Graphify setup kit, ESLint examples)
methodology.md      methodology overview and section index
docs/methodology/   focused methodology sections
```

## Methodology library

| Stage | Document |
| ----- | -------- |
| Executive overview | [methodology.md](methodology.md) |
| Project orientation | [docs/methodology/project.md](docs/methodology/project.md) |
| Architecture | [docs/methodology/architecture.md](docs/methodology/architecture.md) |
| Proposals | [docs/methodology/proposals.md](docs/methodology/proposals.md) |
| Features and project milestones | [docs/methodology/features-and-milestones.md](docs/methodology/features-and-milestones.md) |
| Specifications | [docs/methodology/specifications.md](docs/methodology/specifications.md) |
| Spec-driven development | [docs/methodology/spec-driven-development.md](docs/methodology/spec-driven-development.md) |
| Deterministic quality and conformance | [docs/methodology/deterministic-quality.md](docs/methodology/deterministic-quality.md) |
| Code generation | [docs/methodology/code-generation.md](docs/methodology/code-generation.md) |
| Testing and validation | [docs/methodology/testing-and-validation.md](docs/methodology/testing-and-validation.md) |
| PR creation | [docs/methodology/pr-creation.md](docs/methodology/pr-creation.md) |
| Preparatory review | [docs/methodology/self-review.md](docs/methodology/self-review.md) |
| Human review and merge | [docs/human-in-loop-pr-review-strategy.md](docs/human-in-loop-pr-review-strategy.md) |

## Standards library

Start with [docs/standards/README.md](docs/standards/README.md) and the machine index [docs/standards/index.yaml](docs/standards/index.yaml).

Standards are **templates for agent-executable rules**—not universal corporate policy. Teams keep methodology-wide expectations, swap stack examples that do not fit, and add security, privacy, compliance, accessibility, release, ownership, and evidence rules. **Humans own the standard set; agents apply it.**

| Area | Standards |
| ---- | --------- |
| Core structure and docs | [code-structure.md](docs/standards/code-structure.md), [contextual-split.md](docs/standards/contextual-split.md), [docs-hygiene.md](docs/standards/docs-hygiene.md), [docs-hygiene-reference-structure.md](docs/standards/docs-hygiene-reference-structure.md), [spec-hygiene.md](docs/standards/spec-hygiene.md), [pr-process.md](docs/standards/pr-process.md) |
| HTTP/API layer | [http-layer.md](docs/standards/http-layer.md), [http-layer-guide.md](docs/standards/http-layer-guide.md), [http-layer-schemas-and-responses.md](docs/standards/http-layer-schemas-and-responses.md), [http-layer-errors-and-auth.md](docs/standards/http-layer-errors-and-auth.md), [http-layer-docs-and-tests.md](docs/standards/http-layer-docs-and-tests.md) |
| Service layer | [service-layer.md](docs/standards/service-layer.md), [service-layer-guide.md](docs/standards/service-layer-guide.md), [service-layer-data-and-exceptions.md](docs/standards/service-layer-data-and-exceptions.md), [service-layer-modules-and-cli.md](docs/standards/service-layer-modules-and-cli.md) |
| Data layer | [data-layer.md](docs/standards/data-layer.md), [data-layer-guide.md](docs/standards/data-layer-guide.md), [data-layer-exec-sproc.md](docs/standards/data-layer-exec-sproc.md), [data-layer-results.md](docs/standards/data-layer-results.md), [data-layer-errors.md](docs/standards/data-layer-errors.md), [data-layer-templates.md](docs/standards/data-layer-templates.md), [data-layer-utilities.md](docs/standards/data-layer-utilities.md), [data-layer-sproc-examples.md](docs/standards/data-layer-sproc-examples.md) |
| Database | [database.md](docs/standards/database.md), [database-guide.md](docs/standards/database-guide.md), [database-sproc-shape.md](docs/standards/database-sproc-shape.md), [database-sproc-errors.md](docs/standards/database-sproc-errors.md), [database-migrations-and-modernization.md](docs/standards/database-migrations-and-modernization.md), [database-modernization-approach.md](docs/standards/database-modernization-approach.md), [database-testing.md](docs/standards/database-testing.md), [database-testing-guide.md](docs/standards/database-testing-guide.md) |
| Frontend | [frontend.md](docs/standards/frontend.md), [frontend-admin-crud-guide.md](docs/standards/frontend-admin-crud-guide.md), [frontend-forms-ui.md](docs/standards/frontend-forms-ui.md), [frontend-hook-design.md](docs/standards/frontend-hook-design.md) |
| Testing and reports | [python-testing.md](docs/standards/python-testing.md), [python-testing-guide.md](docs/standards/python-testing-guide.md), [python-testing-http-behavior.md](docs/standards/python-testing-http-behavior.md), [report-test-strategy.md](docs/standards/report-test-strategy.md), [reports.md](docs/standards/reports.md) |
| Operations, tooling, security | [ci-workflows.md](docs/standards/ci-workflows.md), [ci-llm-conformance-workflows.md](docs/standards/ci-llm-conformance-workflows.md), [deployment.md](docs/standards/deployment.md), [backend-entrypoint-initialization-guide.md](docs/standards/backend-entrypoint-initialization-guide.md), [backend-lambda-deployment-guide.md](docs/standards/backend-lambda-deployment-guide.md), [logging-observability.md](docs/standards/logging-observability.md), [logging-runtime-behavior.md](docs/standards/logging-runtime-behavior.md), [settings.md](docs/standards/settings.md), [security.md](docs/standards/security.md), [tooling-hooks-and-formatters.md](docs/standards/tooling-hooks-and-formatters.md), [tooling-lint-format.md](docs/standards/tooling-lint-format.md) |

## Skill inventory

Skills encode **how agents do the work**. Customize them per stack and tracker; anchor behavior to `AGENTS.md` and standards.

### Interactive skills

| Skill | Purpose |
| ----- | ------- |
| `proposal-builder` | Proposal discussions and decision-ready drafts. |
| `feature-doc-builder` | Long-lived feature requirements (historical skill name). |
| `architecture-doc-builder` | Project- and feature-level architecture documents. |
| `spec-builder` | Bounded deliverable specifications and execution guidance. |
| `spec-driven` | Post-greenlight lifecycle: contract updates, change log, QA/PR feedback, signoff. |
| `standard-builder` | Draft repo-specific standards from codebase inspection. |
| `miro-mcp` | Miro boards via MCP: diagrams, board docs, tables; read context for proposals and architecture when MCP is enabled. |

### Execution and verification skills

| Skill | Purpose |
| ----- | ------- |
| `qa-testing` | Agent-run verification against requirements, standards, tests, and evidence. |
| `pr-review` | Automated preparatory PR or diff review before merge review. |

### Delivery and infrastructure skills

| Skill | Purpose |
| ----- | ------- |
| `pr-builder` | Agent-driven draft-first PR packaging. |
| `gh-stack` | Stacked branches and dependent PRs. |
| `worktree` | Worktree setup and Worktrunk-oriented workflows. |
| `handoff` | Platform-neutral HANDOFF notes under `<DOCS_ROOT>/execution/` for session transfer. |
| `jira-api` | Draft companion for Jira-centric repos (when implemented). |
| `confluence` | Placeholder workflow for Confluence-backed durable docs and completed specs. |
| `conformance` | Focused standards-alignment change with PR-ready evidence. |
| `doc-check` | Documentation formatting and consistency checks. |
| `psql` | Safe PostgreSQL diagnostic guidance. |
| `sqlcmd` | Safe SQL Server diagnostic guidance. |

## Setup and prerequisites

- **Git** — branches, worktrees, commits, diffs, PRs.
- **Git hosting / PR tooling** — GitHub, GitLab, Bitbucket, or equivalent.
- **`gh`** — recommended on GitHub; `gh auth login`.
- **Worktrunk** — recommended with the `worktree` skill.
- **`gh-stack`** — optional stacked PR lanes.
- **Agent runtime** — Cursor, Claude, Codex, Warp, or equivalent (required for the model as written).
- **Project toolchain** — languages, tests, databases, local env for the repo.
- **External tracker** (optional) — Jira, Azure DevOps, etc., for traceability; otherwise Git + `<DOCS_ROOT>/execution/`.
- **Miro MCP** (optional) — when proposals or architecture use **Miro** boards; enable Miro in Cursor MCP settings and declare default board URLs and pointer rules in `AGENTS.md`. Use the **`miro-mcp`** skill for agent behavior.

```bash
gh auth login
gh extension install github/gh-stack
```

Vendor skills into `.agents/skills/` or point your runtime at that directory.

## Getting started

1. Read [methodology.md](methodology.md).
2. Copy [templates/AGENTS.md](templates/AGENTS.md) to the repo root and declare agent vs human responsibilities for that project.
3. Install Git, agents, Worktrunk (if used), `gh`, `gh-stack`, and project tools.
4. Read [docs/worktree-setup.md](docs/worktree-setup.md) when using the worktree model.
5. Sync selected skills from `.agents/skills/`.

## Artifact storage

Git remains the system of record for **methodology**, **standards**, **skills**, **specifications** (when on disk), **features**, and **agent-reference** markdown. **Execution routing** (docs root, standards index, tool discovery, agent vs human gates) belongs in a **minimal** `AGENTS.md`; deeper policy belongs in **standards** and **methodology** files. Default mutable workspace: `<DOCS_ROOT>/execution/` (often gitignored).

For **proposals** and **formal project/architecture** packages, the authoritative or stakeholder-vetted version may live on **GitHub**, **SharePoint**, and/or **Miro**; the repo then holds **pointers** and/or **markdown summaries** for agents—see the subsection *Stakeholder-facing vs agent-reference docs* above and [templates/AGENTS.md](templates/AGENTS.md). Use the **`miro-mcp`** skill when boards are part of that story and Miro MCP is enabled.

## Propagation

```bash
rsync -avc /path/to/agentic-framework/methodology.md /path/to/consumer-repo/methodology.md
rsync -avc --delete /path/to/agentic-framework/.agents/skills/ /path/to/consumer-repo/.agents/skills/
rsync -avc --delete /path/to/agentic-framework/docs/ /path/to/consumer-repo/docs/
```

## Changelog

### 2026-07-14 — Graphify setup documentation and tooling kit

Added [docs/graphify/](docs/graphify/README.md) (complete guide, new-computer setup, agent prompt) and [tooling/graphify-setup-kit/](tooling/graphify-setup-kit/README.md) (portable `install.sh` / `install.ps1` / `install.cmd` for consumer repos). Reference adoption: global-services product-id program; Jira SKUNK-438.

### 2026-07-07 — Spec-driven lifecycle and Zazz-aligned skills (SBD-adapted)

Added **`spec-driven`** post-greenlight lifecycle, refreshed **`spec-builder`** and **`feature-doc-builder`**, introduced **project milestones vs feature roadmap increments**, and added **`handoff`** and **`confluence`** skills. Execution workspace remains **`<DOCS_ROOT>/execution/`**.

### 2026-06-19 — Miro skill and stakeholder boards

Documented **Miro** as an optional stakeholder surface for proposals and architecture; added **`.agents/skills/miro-mcp/`** (skill + README) and wired references in the root README (including setup prerequisites).

### 2026-06-19 — Stakeholder-facing proposals and dual project/architecture storage

Documented the **SBD Customer Engagement** pattern: proposals vetted on **GitHub** and/or **SharePoint**; Git-tracked **pointers** under `<DOCS_ROOT>/proposals/`; authoritative project/architecture in **SharePoint** (Office/PDF/HTML) with **`project.md`** and **`architecture/`** markdown in-repo as **agent-reference**, with explicit sync ownership in `AGENTS.md`.

### 2026-06-18 — Engineering-led delivery with agent acceleration

Documented that delivery execution (implement, test, PR, preparatory review) is **agent-default**; humans govern intent, standards, and merge. Rebranded to **Agentic Software Delivery Methodology** / **Agentic Engineering Framework**; aligned entry docs with SBD Customer Engagement adoption; removed third-party board integration from the maintained skill set; standardized on `methodology.md` and `AGENTIC_DOCS_ROOT` / `.agentic` path examples.

### 2026-06-18 — Public methodology and standards refresh

Focused workflow sections; consolidated QA under `qa-testing`; added database diagnostic utility skills.

### 2026-05-24 — Execution artifact location refresh

Default mutable execution directory: `<DOCS_ROOT>/execution/`.

### 2026-05-23 — Methodology and skill alignment refresh

Feature and architecture locations, draft-first PRs, stacked PR lanes, tracker-optional specifications.

## License

See [LICENSE](LICENSE).
