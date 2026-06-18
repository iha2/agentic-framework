---
name: doc-check
description: Run or choose repository-local formatting, linting, and consistency checks for markdown, text, and documentation files before committing. Use when documentation files changed, standards docs were edited, or the user asks to verify docs formatting.
---

# Document Check

Run documentation checks using the repository’s **declared** tooling. Do not install or invent formatters when the repo already defines them.

## Authority

1. Read **`docs/standards/index.yaml`** and load **only** standards whose `applies_to.paths` and `applies_to.activities` match the files you are about to check or format.
2. Read **`AGENTS.md`** (and `README.md` / contributing docs **only when** those files are the repo’s documented source for doc-tool commands). Prefer standards and `AGENTS.md` over guessing paths.

Do not chase a long list of config filenames unless a **loaded standard** or **`AGENTS.md`** explicitly tells you to open them.

## Workflow

1. Identify changed files with `git status --short` and, when needed, `git diff --name-only`.
2. Load applicable standards from **`docs/standards/index.yaml`** (see Authority).
3. Run the verification or formatting commands **required by those standards** and any **explicit** commands in `AGENTS.md` for the same task. When a loaded standard references hook configuration, use the hook file paths **named in that standard** (for example root `.pre-commit-config.yaml` when `tooling-hooks-and-formatters.md` applies).
4. Prefer the **narrowest** command scope (`pre-commit run --files …`, scoped `npm run …`) when the loaded standards or `AGENTS.md` allow it.
5. Include text-like collateral (YAML, TOML) when a loaded standard says to treat it as part of the same pass.
6. If a formatter modifies files, rerun the same check once to verify stability.
7. Report commands, results, and any files changed by formatting.

## Boundaries

- Do not run all-docs or all-files checks by default when a file-scoped command exists.
- Do not touch unrelated formatting churn.
- If the repo uses a virtual-branch or stacked-diff tool, identify which changed files belong to the current unit of work before running broad fixers.
- If no standard matches and `AGENTS.md` names no doc commands, perform a **manual** pass only for lightweight hygiene: broken links, stale paths, private local paths, merge markers, trailing whitespace, and missing final newline.
