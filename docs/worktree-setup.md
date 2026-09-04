# Worktree Setup (Agentic Engineering Framework)

Compressed 2026-09 for token reduction; full prior text in Git history before this change.

## Canonical source

Procedure and conversion steps: [`.agents/skills/worktree/SKILL.md`](../.agents/skills/worktree/SKILL.md)  
Quick commands: [`docs/wt-cheat-sheet.md`](wt-cheat-sheet.md)  
Stacked lane exception: [`.agents/skills/gh-stack/references/single-worktree-lane.md`](../.agents/skills/gh-stack/references/single-worktree-lane.md)

Background: [Git worktree](https://git-scm.com/docs/git-worktree), [Worktrunk](https://worktrunk.dev/worktrunk/).

## Required layout

```text
repo-container/
├── .bare/
├── <integration-branch>/    # e.g. dev/ or main/
├── feature-or-deliverable-a/
├── feature-or-deliverable-b/
└── docs-or-proposal-branch/
```

## Invariants (MUST / SHOULD)

| Rule | Level |
| --- | --- |
| Use bare-repo container + sibling worktrees (methodology-required) | MUST |
| Container is not itself the active checkout; `.bare/` is the shared Git dir | MUST |
| One active deliverable/doc effort → one worktree (normal case) | MUST |
| Flat branch names only — no `/` in branch names (maps to sibling dir) | MUST |
| Merges via PRs — do not locally merge features into the integration worktree | MUST |
| Keep integration worktree clean; not for day-to-day feature implementation | MUST |
| Stacked branch lane in one worktree is the deliberate exception | SHOULD |
| Competing implementations → separate deliverables/worktrees | SHOULD |
| Prefer Worktrunk (`wt`) as convenience CLI over raw `git worktree` | SHOULD |
