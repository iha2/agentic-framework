# `AGENTS.md` template (minimal router)

Repo-root `AGENTS.md` is routing and gates only. Policy belongs in `docs/standards/` (via `index.yaml`), methodology docs, and tool configs.

Governance invariants (consumer repos): link to vendored `docs/methodology/invariants.md` when using this framework.

---

## Copy into repo root as `AGENTS.md`

```markdown
# Agents

## Docs root

`AGENTIC_DOCS_ROOT=<SET_REPO_RELATIVE_DOCS_ROOT>` (repo-relative only; never absolute.)

## Standards (required)

1. Open `<DOCS_ROOT>/standards/index.yaml`.
2. Load ONLY standards whose `applies_to.paths` and `applies_to.activities` match the task.

## Features (when used)

If `<DOCS_ROOT>/features/index.yaml` exists, load only applicable feature files.

## Methodology

- Index: `<DOCS_ROOT>/methodology/README.md` (or repo-root `methodology.md`).
- Discipline: `<DOCS_ROOT>/agent-execution-discipline.md`.
- Invariants: `<DOCS_ROOT>/methodology/invariants.md`.

## Tooling

Resolve commands from repo config (`.pre-commit-config.yaml`, manifests referenced by loaded standards)—do not invent tools.

## Commands

```text
<TEST_COMMAND>
<LINT_COMMAND>
```

## Roles

- **Agents:** implement, verify, draft PRs, preparatory audit.
- **Humans:** spec approval, standards exceptions, merge/release.

## Tracker / coordination

`Tracking: <system> — <ID convention in PRs>.`
`Coordination: <harness isolation|lock service|serialize hot files>.`

## Optional

`Integration branch: <name>` · `Deliverables: <path>` · `Worktrees: <doc path>`
```

---

## Out of scope for `AGENTS.md`

| Topic | Location |
| ----- | -------- |
| Coding rules | `docs/standards/*.md` + `index.yaml` |
| Methodology flow | `docs/methodology/` |
| Hooks / formatters | `docs/standards/tooling-hooks-and-formatters.md` |
| Unicode smuggling gate | `docs/standards/agent-context-text-hygiene.md` |
| Review policy | `docs/agent-execution-discipline.md`, `docs/human-in-loop-pr-review-strategy.md` |

Keep copied `AGENTS.md` under ~40 lines.
