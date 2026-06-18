# `AGENTS.md` template (minimal routing)

Use a **small** repo-root `AGENTS.md`: **routing and gates only**. Put rules, conventions, and long policy in **`docs/standards/`** (via `index.yaml`), **methodology docs**, and **tool configs**—not in this file.

---

## Copy this into repo root as `AGENTS.md`

```markdown
# Agents

## Docs root

`AGENTIC_DOCS_ROOT=<SET_REPO_RELATIVE_DOCS_ROOT>` (repo-relative only; never absolute.)

Typical values: `docs` or `.agentic`.

## Standards (required)

1. Open `<DOCS_ROOT>/standards/index.yaml`.
2. Load **only** standards whose `applies_to.paths` and `applies_to.activities` match the task.
3. Do not load the full standards library by default.

## Features (when used)

If `<DOCS_ROOT>/features/index.yaml` exists, load only feature files that apply to the current task.

## Methodology and discipline

- Methodology index: `<DOCS_ROOT>/methodology/README.md` (or `methodology.md` at repo root when that is your entry).
- Execution discipline: `<DOCS_ROOT>/agent-execution-discipline.md` (path may differ; adjust once per repo).

## Tooling and hooks (required discovery)

Resolve commands from **repo-declared** config—do not invent tools:

- Hooks: `.pre-commit-config.yaml` (and service-level hook configs if your standards index points to them).
- Package scripts: `package.json`, `pyproject.toml`, `justfile`, `Makefile`—**only** when referenced by a loaded standard or by the commands section below.

## Commands (fill in or point)

List the **narrow** commands agents should run for this repo (or write `see <DOCS_ROOT>/standards/...` if a standard owns the command table):

```text
<TEST_COMMAND>
<LINT_COMMAND>
```

## Agent vs human (one line each)

- **Agents (default):** implement, verify, open/update draft PRs, run **preparatory review** (automated review + in-scope fixes while draft).
- **Humans:** spec/feature approval, standards exceptions, merge approval, production promotion, escalations.

## Tracker / coordination (one line each)

`Tracking: <Jira|ADO|GitHub Issues|none> — <how IDs appear in PRs or deliverables>.`

`Coordination: <harness isolation|lock service|serialize hot files>.`

## Optional pointers (keep to one line each if present)

`Integration branch: <name>` · `Deliverables: <ignored|committed|tracker> @ <path pattern>` · `Worktrees: <see docs/worktree-setup.md or N/A>`
```

---

## What stays **out** of `AGENTS.md`

Do not paste full standards, proposal playbooks, SharePoint/Miro policy, or worktree tutorials here. Put them in:

| Topic | Where it belongs |
| ----- | ---------------- |
| Coding / testing / HTTP / DB rules | `docs/standards/*.md` + `index.yaml` |
| Proposals, architecture, features, specs flow | `docs/methodology/` and `<DOCS_ROOT>/` tree |
| Hook naming, formatters, prek/pre-commit | `docs/standards/tooling-hooks-and-formatters.md` (and your hook YAML) |
| Invisible Unicode / smuggling gate | `docs/standards/agent-context-text-hygiene.md` + `tools/invisible_unicode_lint/` |
| Long execution / review policy | `docs/agent-execution-discipline.md`, `docs/human-in-loop-pr-review-strategy.md` |

---

## Template maintainer checklist

- [ ] Replace `<SET_REPO_RELATIVE_DOCS_ROOT>` and command placeholders.
- [ ] Confirm `standards/index.yaml` paths match this repo’s layout.
- [ ] Keep this file under **~40 lines** in the copied `AGENTS.md`; grow **indexes and standards**, not this router.
