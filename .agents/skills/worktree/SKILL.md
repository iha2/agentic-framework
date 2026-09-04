---
name: worktree
description: Set up or manage worktrees for a methodology-style repo; use when the user wants the opinionated bare-repo plus sibling-worktree pattern, needs help creating or repairing worktrees and flat branch names, or wants guidance on the Worktrunk workflow used with the Agentic Engineering Framework methodology.
---

# Worktree

Requires `git` + `worktrunk` (`wt`). Methodology requires worktrees (bare + siblings); Worktrunk optional at methodology level but **required for this skill**.

## Startup

1. Read `AGENTS.md` (worktree/branch/docs/tracking).
2. Methodology refs: `methodology.md`, `docs/worktree-setup.md`; cheat sheet `docs/wt-cheat-sheet.md` when needed.
3. Intent: new setup | manage | repair/cleanup | guidance-only.
4. Inspect: branch, `git worktree list`, bare+sibling layout?, Worktrunk installed?
5. Prefer existing stable layout — MUST NOT “upgrade” unless user wants it.

## Purpose

Establish/operate bare-repo + sibling worktrees with flat branch names; one active deliverable/doc effort ↔ one branch ↔ one worktree. Translate human asks (“review PR 193”, “create deliverable worktree”) into `wt` commands.

## Modes

| Mode | Outcome |
| --- | --- |
| A New setup | `.bare/`, integration worktree (`main`/`dev`), sibling effort worktrees, naming convention |
| B Manage | add/list/prune/remove/switch; day-to-day `wt` |
| C Repair | stale records, missing dirs, abandoned branches, name mismatches |
| D Guidance | commands/recommendations without FS changes |

## Core rules

1. Inspect before change. 2. Prefer non-destructive. 3. Remove worktree/branch only on clear user intent. 4. Flat branch names with sibling worktrees. 5. Keep integration worktree clean — not default feature home. 6. Use Worktrunk via this skill. 7. Explain tradeoffs before reshaping a stable alternate layout.

## Required layout

```text
repo-container/
├── .bare/
├── dev/
├── proposal-role-management-options/
├── feature-rbac/
└── deliverable-proj-142-role-management-ui/
```

One active deliverable → one worktree (multi-agent → coordinate inside it). Competing implementations → separate deliverables/worktrees.

**Branches:** prefer `feature-rbac`, `deliverable-proj-142-…`. Avoid `feature/rbac`, `deliverable/PROJ-…` (slashes fight sibling dirs).

## Commands

```bash
wt -C .bare list
wt -C .bare switch --create feature-rbac
wt -C .bare switch proposal-role-management-options
wt -C .bare switch pr:193
wt -C .bare remove feature-rbac
```

Plain `git worktree` only for conceptual background or low-level debug.

## Safety

Before create/modify: base branch, branch name, target dir exists?, effort type, declared integration branch. Before cleanup: unmerged/uncommitted work?, branch still needed?, stale vs active?

## Recovery

Stop bad path → return to proposal/feature/SPEC → repair same worktree or abandon intentionally → fresh sibling for corrected approach.

Worktrunk carries ignored local files needed to run in the new worktree — expected ergonomics.

## Escalate

Layout conflicts with methodology; cleanup would delete/orphan work; unclear base; naming policy vs team practice; Worktrunk missing while using this skill.
