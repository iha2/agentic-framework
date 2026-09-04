# `repo-wt` Worktree and Worktrunk Cheat Sheet

Compressed 2026-09 for token reduction; full prior text in Git history before this change.

Canonical procedure: [`.agents/skills/worktree/SKILL.md`](../.agents/skills/worktree/SKILL.md) · layout: [`docs/worktree-setup.md`](worktree-setup.md)

## Layout

```text
repo-wt/
├── .bare/
├── dev/
└── <feature-or-pr-worktrees>/
```

From container: `wt -C .bare <cmd>` · From worktree: `wt -C ../.bare <cmd>`  
Local ignores: `.bare/info/exclude` (do not edit committed `.gitignore` for machine-local files).

## Commands

| Action | Command |
| --- | --- |
| List | `wt -C .bare list` |
| Switch to `dev` | `wt -C .bare switch dev` |
| Switch to default/integration | `wt -C .bare switch ^` |
| Switch existing | `wt -C .bare switch <branch>` |
| Create from `dev` | `wt -C .bare switch --create <branch> --base dev` |
| Remove | `wt -C .bare remove <branch>` |
| Force-remove | `wt -C .bare remove <branch> -D` |
| Update `dev` | `git -C ~/work/repo-wt/dev pull origin dev` |
| Review PR | `wt -C .bare switch pr:<n>` |
| Stacked create | `wt -C .bare switch --create <upper> --base <lower>` |

## MUST / SHOULD

| Rule | Level |
| --- | --- |
| One feature/PR → one sibling worktree (unless stacked lane) | MUST |
| Keep `dev` current before creating new worktrees | SHOULD |
| Prefer `wt` over raw `git worktree` for create/switch/remove | SHOULD |
| After stacked lower-branch edits, rebase/update upper branches before push | MUST |
| Use `--force-with-lease` (not bare `--force`) when rewriting published stack tips | MUST |
