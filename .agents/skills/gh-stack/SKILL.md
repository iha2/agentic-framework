---
name: gh-stack
description: >
  Manage stacked branches and pull requests with the gh-stack GitHub CLI extension.
  Use when the user wants to create, push, rebase, sync, navigate, or view stacks of
  dependent PRs. Triggers on tasks involving stacked diffs, dependent pull requests,
  branch chains, or incremental code review workflows.
---

# gh-stack

Stacked branches/PRs: ordered branches rooted on trunk; each PR base = branch below. Bottom = closest to trunk; top = furthest.

```
main
 └── feat/auth-layer     → PR #1 (base: main)               — bottom
  └── feat/api-endpoints → PR #2 (base: feat/auth-layer)
   └── feat/frontend     → PR #3 (base: feat/api-endpoints) — top
```

Lane methodology: `references/single-worktree-lane.md`. Tutorials: `references/workflows.md`. This file = agent rules + command contract + failures.

## Prerequisites

`gh` v2.0+ authenticated; `gh extension install github/gh-stack`. Ref: https://github.github.com/gh-stack/reference/cli/

```bash
git config rerere.enabled true
git config remote.pushDefault origin   # if multiple remotes
```

## Agent rules (MUST — non-interactive)

Missing flags that would prompt → hang forever.

1. MUST supply branch names to `init`, `add`, `checkout`.
2. With prefix: MUST pass suffix only to `add` (`add auth` + prefix `feat` → `feat/auth`).
3. MUST `--auto` with `submit`.
4. MUST `--json` with `view`.
5. MUST `--remote` when multiple remotes (or set `pushDefault`).
6. MUST avoid shared-across-stacks branches (exit 6); checkout non-shared first.
7. SHOULD plan layers by dependency before `init`.
8. SHOULD prefer deliberate `git add`/`commit`; `-Am` MUST NOT be default.
9. Mid-stack fix: lower branch → commit → `rebase --upstack` → return.
10. External tools: `link` with ≥2 branches or PR numbers.

### MUST NOT (hang triggers)

| Forbidden | Instead |
| --- | --- |
| `view` / `view --short` | `view --json` |
| `submit` without `--auto` | `submit --auto` |
| `init` without branches | `init … <branches…>` |
| `add` without name | `add <suffix-or-name>` |
| `checkout` without arg | `checkout <pr\|branch>` |
| `checkout <pr>` if local composition conflicts | `unstack` then retry |

## Structure

Each branch = discrete reviewable unit. Code depending on X → same branch as X or higher. Prefer `-p` prefix + suffixes to `add`. New branch when concern/audience changes or PR large. One stack = one story. Trivial incidentals MAY stay. Lane model: `references/single-worktree-lane.md`.

## Quick reference

| Task | Command |
| --- | --- |
| Create | `gh stack init -p feat auth` |
| Adopt | `gh stack init --adopt a b` |
| Custom trunk | `gh stack init --base develop a` |
| Add | `gh stack add api-routes` |
| Push / submit | `push` / `submit --auto` [`--draft`] |
| Sync / rebase | `sync` / `rebase` [`--upstack`] [`--continue`/`--abort`] |
| View / nav | `view --json` / `up` `down` `top` `bottom` |
| Checkout / tear down | `checkout 42` / `unstack` [`--local`] |
| External | `link a b […]` |

## Command contract

**init** `[ -b base | -a adopt | -p prefix ] <branches…>` — creates missing from trunk; checks out last; enables rerere.

**add** `<branch>` — MUST be on topmost (else exit 5 → `top`). `-m` required with `-A`/`-u`; `-A`/`-u` mutually exclusive. Empty after init: `add -Am` commits on current.

**push** — atomic `--force-with-lease --atomic`; no PRs.

**submit** — MUST `--auto`. Creates missing PRs (base = first non-merged ancestor); links Stack; exit 9 if stacks unavailable (no prompt). Titles: single commit → subject/body; multi → humanized branch.

**link** — API stack without local tracking; args bottom→top; `--base`/`--draft`/`--remote`.

**sync** — fetch → FF trunk → cascade rebase (conflict → restore + exit 3) → push → sync PR state.

**rebase** — `--downstack`/`--upstack`; `--continue`/`--abort`; merged PRs via `--onto`. Conflicts: edit → `git add` → `--continue` or `--abort`.

**view** — MUST `--json` (`trunk`, `prefix`, `currentBranch`, `branches[]` with pr metadata).

**checkout / unstack** — `checkout <pr>` may hit unbypassable interactive conflict if local composition differs → `unstack` first. Branch-name checkout = local only. `unstack` then `init --adopt` to restructure.

## Output / exits

Status → stderr; data → stdout. Exits: 0 ok; 1 generic; 2 not in stack; 3 rebase conflict; 4 API; 5 bad args; 6 disambiguation; 7 rebase in progress; 8 locked (~5s retry); 9 stacks unavailable.

## Limitations

Linear only; exit 6 unbypassable; multi-remote needs `--remote`; CLI merge unsupported; no custom title on submit → `gh pr edit` after.
