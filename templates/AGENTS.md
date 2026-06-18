# AGENTS.md example template (agent-native, human-governed)

This file is a starter for a repo-level **`AGENTS.md`** in a project that follows the **Agentic Software Delivery Methodology**. In that model, **agents are the default executors** of implementation, tests, PR packaging, and preparatory review; **humans govern** product intent, specifications and features, **engineering standards**, risk, and **merge approval**.

`AGENTS.md` is the **source of truth** for how agents resolve the docs root, load standards, use trackers, coordinate parallel work, and respect branch and review policy.

Copy to the repository root as `AGENTS.md`, then replace placeholders. The goal is a **lean** file that routes agents to indexes and discipline docs instead of duplicating standards.

## How to use this template

1. Copy to the repo root as `AGENTS.md`.
2. Declare the repo-relative methodology docs root.
3. Replace placeholder sections or remove what does not apply.
4. Keep methodology-required routing:
   - docs-root declaration
   - path to `<DOCS_ROOT>/standards/index.yaml` and selective loading rules
   - path to `<DOCS_ROOT>/features/index.yaml` when used
   - deliverables policy
   - tracking / issue-management declaration
   - shared-file coordination policy
   - worktree / branch policy
   - link to agent execution discipline plus repo overrides
5. State explicitly **what agents must execute by default** (implement, test, PR, self-review) and **what requires human action** (spec approval, standards exceptions, merge).

## What a real `AGENTS.md` must contain

For repos using this methodology:

- methodology **docs-root** rule
- path to `<DOCS_ROOT>/standards/index.yaml` and “read index first, load only relevant standards”
- path to `<DOCS_ROOT>/features/index.yaml` when feature docs exist
- **proposal** storage policy — including **public vetting** surfaces (GitHub, SharePoint, **Miro**) plus Git **pointers** under `<DOCS_ROOT>/proposals/` when the narrative lives outside the repo
- **project and architecture** dual-storage policy — authoritative SharePoint (or similar) vs **in-repo `project.md` and `architecture/` markdown** for agents; who syncs and which surface counts for approval
- policy for `<DOCS_ROOT>/deliverables/` (ignored, committed, or tracker-backed)
- **work-tracking** system for tickets / PR context
- **shared-file coordination** for parallel agent work
- worktree / branch expectations
- link to **agent execution discipline** and any repo overrides
- **Governance**: who approves specs, who may merge, when human review is mandatory vs agent-only preparatory review

Without these, agents miss constraints or overload context.

## Best practices

- Keep `AGENTS.md` short: routing and policy, not a full standards paste.
- Point to `standards/index.yaml` and feature indexes instead of restating them.
- Be explicit about **tracker** (Jira, Azure DevOps, etc.) vs Git-only execution records.
- Be explicit about **coordination** (harness isolation, external lock service, or serialize overlapping files).
- List the **commands** agents should actually run for test/lint in this repo.
- When you vendor the **invisible Unicode** gate from the methodology repository (`tools/invisible_unicode_lint/`), list `python3 tools/invisible_unicode_lint/lint_invisible_unicode.py .` (or your wrapper) alongside other lint commands; see `docs/code-quality/invisible-text-prompt-injection-and-linting.md`.

## Purpose (example boilerplate)

This repository uses the **Agentic Software Delivery Methodology** for long-lived product docs, **agent-executable** specifications, and selective standards loading.

Agents start here for:

- docs-root discovery
- standards and feature loading
- worktree and deliverable conventions
- **default execution responsibilities** (implement, verify, PR, self-review) versus **human-only gates**

## Docs root

`Methodology docs root: <SET_REPO_RELATIVE_DOCS_ROOT>`

or

`Methodology docs root: resolve from AGENTIC_DOCS_ROOT (must be a repo-relative path)`

Recommended values:

- `docs` at the repo or monorepo root
- `.agentic` when methodology files live in a dedicated directory

Rules:

- The docs root is **repo-relative**, never absolute.
- `project.md`, proposals (or pointers), `features/`, and `standards/` live under `<DOCS_ROOT>/`.
- If you use an env var, document it in this file; prefer **`AGENTIC_DOCS_ROOT`** for consistency across SBD Customer Engagement repos.

## Proposals (public vetting + Git pointers)

When **non-technical stakeholders** must read, comment on, or approve proposals **without** using the repo, keep the **working and vetted proposal** in a broadly accessible system:

- **GitHub** — e.g. Issues with templates, Discussions, Wiki, or docs sites linked from the repo.
- **SharePoint** — pages, document libraries, Word-based review, PowerPoint briefings, or exported **HTML/PDF** for circulation.
- **Miro** — boards for workshops, option comparison, flows, and early architecture sketches; requires **Miro MCP** in Cursor. Declare default **board URLs**, frames for “proposals in flight” vs “approved”, and pointer file naming in this repo. Use the **`miro-mcp`** skill for agent behavior.

In the repository, use `<DOCS_ROOT>/proposals/` for **stable Git-tracked pointers**, not necessarily the full prose. Each pointer should include at minimum:

- title, owner, status (draft / in review / approved / superseded)
- link to the GitHub, SharePoint, or **Miro** artifact (board URL; add `moveToWidget` deep link when one frame is normative)
- optional short summary or excerpt for agent context (keep within policy; do not paste restricted content twice if policy forbids it)

Agents should treat the **pointer + linked artifact** as the proposal surface unless this file says the full text lives only in Git.

## Project and architecture (SharePoint authoritative, repo markdown for agents)

Many teams keep **authoritative** project narrative and architecture visuals in **SharePoint** (Word, PowerPoint, HTML exports, PDF) for portfolio and leadership audiences.

For **agent-native** work, also maintain in the repo:

- `<DOCS_ROOT>/project.md` — agent-loadable project orientation (scope, users, capabilities, assumptions).
- `<DOCS_ROOT>/architecture/` — markdown architecture notes, diagrams-as-text, ADR-style files, or links to rendered diagrams.

Declare explicitly in this file:

1. **Authoritative for approval** — SharePoint only, Git only, or both (and which wins on conflict).
2. **Sync rule** — e.g. “repo markdown updated within N business days of SharePoint major revision” or “repo updated before agents start a new deliverable in this area.”
3. **Owner** — role or team responsible for alignment so agents do not silently follow stale markdown.

Optional: link **Miro** architecture frames here when diagrams are authoritative for a subsystem; otherwise keep Miro to proposals and link from `architecture/*.md` only.

## Standards loading rules

Authoritative index: `<DOCS_ROOT>/standards/index.yaml`

Required behavior:

1. Read the index before creating, modifying, reviewing, or validating code.
2. Match standards by `applies_to.paths` and `applies_to.activities`.
3. Load only what applies to the current task.
4. Do not load the entire library by default.
5. Load companion documents when a loaded standard references them.

On conflicts: follow the standard; else the newest intentional project pattern; else ask a human—do not guess.

## Feature context rules

Feature index: `<DOCS_ROOT>/features/index.yaml`

Use feature requirements when the task touches product behavior, roadmap, milestones, or stakeholder intent. Load only relevant feature files.

## Deliverables policy

Deliverable docs live under `<DOCS_ROOT>/deliverables/` unless your policy says otherwise.

Declare whether SPECs are:

- local ignored execution artifacts
- intentionally committed
- mirrored or referenced in an **external tracker** (Jira, Azure DevOps, etc.)

`standards/` and `features/` are normally long-lived tracked docs. Agents must not infer deliverable storage mode from directory shape alone.

## Tracking system policy

Declare the system of record for PR-facing work items.

Cover:

- tracker in use (Jira, Azure DevOps, GitHub Issues, none, etc.)
- authoritative ID or URL for PR and SPEC linkage
- deliverable folder layout: flat slug vs **issue-key subdirectory** (e.g. `deliverables/PROJ-123/…`)
- what to do when a ticket URL is unknown at draft time

Examples:

- `Tracking: Jira project PROJ; deliverables under <DOCS_ROOT>/deliverables/PROJ-*/; PR title includes PROJ-nnn.`
- `Tracking: Azure DevOps; work item URL in PR body; flat deliverable slugs under <DOCS_ROOT>/deliverables/.`
- `Tracking: none; Git branch name and SPEC file path are the traceability surface.`

## Shared-file coordination policy

State how parallel agents avoid clobbering each other.

Examples:

- `Coordination: harness-native isolation; serialize if two agents touch the same file set.`
- `Coordination: external lock service <NAME> when declared; else serialize.`
- `Coordination: no external locks; serialize overlapping hot files.`

## Worktree policy

Defaults:

- one active deliverable per worktree
- one branch per worktree
- worktree directory name aligned with branch or deliverable slug when practical

Project-specific rules:

- <ADD_BRANCH_BASE_RULE>
- <ADD_ENV_COPY_RULES_IF_ANY>
- <ADD_MERGE_POLICY>

## Agent execution discipline

This repo follows the **Agentic Software Delivery** execution discipline:

- `docs/agent-execution-discipline.md` (or the path your monorepo declares)

Repo-specific overrides:

- Integration branch: `<ADD_INTEGRATION_BRANCH>`
- Execution records: `<ADD_EXECUTION_RECORD_POLICY>`
- Stack / PR policy: `<ADD_STACK_POLICY_OR_N/A>`
- Known integration-branch exceptions: `<ADD_EXCEPTIONS_OR_NONE>`

Preferred commands:

```bash
# Example — replace with repo-real commands:
<ENV_WRAPPER> <TEST_COMMAND> ...
<ENV_WRAPPER> <LINT_COMMAND> ...
```

## Project-specific constraints

Add languages, forbidden paths, secrets handling, required test commands, deployment notes—anything agents must not learn only from chat.

## Quick links

- Agent execution discipline: `docs/agent-execution-discipline.md`
- Standards index: `<DOCS_ROOT>/standards/index.yaml`
- Features index: `<DOCS_ROOT>/features/index.yaml`
- Proposals pointers: `<DOCS_ROOT>/proposals/`
- Project reference: `<DOCS_ROOT>/project.md`
- Architecture reference: `<DOCS_ROOT>/architecture/`
- Deliverables: `<DOCS_ROOT>/deliverables/`

## Maintainer checklist

- Placeholders removed
- Paths exist
- Worktree and branch rules match reality
- Proposal pointers and SharePoint/GitHub links are explicit
- **Project/architecture** authoritative surface and **repo sync** owner are explicit
- **Agent vs human** responsibilities are explicit (especially merge and spec approval)
- Command examples are current
