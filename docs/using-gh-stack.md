# Using gh-stack with a Single Worktree Lane

Compressed 2026-09 for token reduction; full prior text in Git history before this change.

## Canonical sources

| Topic | Location |
| --- | --- |
| gh-stack skill (procedure) | [`.agents/skills/gh-stack/SKILL.md`](../.agents/skills/gh-stack/SKILL.md) |
| Single-worktree stacked lane | [`.agents/skills/gh-stack/references/single-worktree-lane.md`](../.agents/skills/gh-stack/references/single-worktree-lane.md) |
| Worktree layout | [`docs/worktree-setup.md`](worktree-setup.md), [`.agents/skills/worktree/`](../.agents/skills/worktree/) |

## Invariants (MUST / SHOULD)

| Rule | Level |
| --- | --- |
| One worktree = one agent lane / deliverable workspace | SHOULD |
| One stack inside that worktree = multiple review branches for the same deliverable | SHOULD |
| One branch = one review unit (commits), not a remembered file list | MUST |
| Worktree has one checked-out branch at a time; `gh stack` navigates the stack in-place | MUST |
| After editing a lower stack branch, rebase upstack so upper branches see new commits (`gh stack rebase --upstack`) | MUST |
| Prefer one stacked lane over multiple worktrees when branches are tightly related | SHOULD |
| Do not check out the same branch in two worktrees at once | MUST (Git constraint) |
