# Using gh-stack with a Single Worktree Lane

One long-lived worktree = one agent lane / deliverable workspace. One stack inside it = multiple review branches. One branch = one review unit (commits, not a remembered file list). Prefer over two worktrees when branches are tightly related — `gh stack rebase --upstack` carries lower updates forward.

## Model

```text
worktree = one directory / one index / one checked-out branch at a time
stack    = branches you navigate inside that directory
```

```bash
cd <container-root>/<integration-worktree>
git worktree add ../feature-next-report-lane -b feature-next-report-svc-1 <integration-branch>
cd ../feature-next-report-lane
gh stack init --base <integration-branch> --adopt feature-next-report-svc-1
gh stack add feature-next-report-svc-2
# same dir; now on svc-2. Navigate: bottom / top / up / down
```

Same branch cannot be checked out in two worktrees — fine; lane branches are unique.

## When Branch 2 sees Branch 1

Only when Branch 1 commits are in Branch 2 history. New Branch 1 commits after Branch 2 exists are invisible until rebase:

```bash
gh stack bottom
# edit + commit Branch 1
gh stack rebase --upstack
gh stack top
```

```text
Local lower-branch change → rebase --upstack
Remote / integration / PR state / Branch 1 merged → sync, then verify upper diff
```

`sync` = fetch, FF trunk, cascade rebase, push, sync PR state. Post-merge:

```bash
gh stack top && gh stack sync && gh stack view --json
git diff --name-only <integration-branch>...HEAD   # upper should be upper-only files
```

## File ownership is manual

gh-stack tracks ordered stack + bases + metadata — **not** which files “belong” where. Commits define ownership. Wrong-branch fix: save/commit current → navigate down → stage only correct paths → commit → `rebase --upstack` → return. Mixed tree → `git add -p` or path-specific add.

## Setup

```bash
gh extension install github/gh-stack
# https://github.github.com/gh-stack/reference/cli/
```

Stacked PRs may need repo feature access; lane model still useful with manual bases if unavailable. Skill path: `.agents/skills/gh-stack`.

## Recommended workflow

```bash
git worktree add ../feature-<slug>-lane -b feature-<slug>-svc-1 <integration-branch>
cd ../feature-<slug>-lane
gh stack init --base <integration-branch> --adopt feature-<slug>-svc-1
gh stack add feature-<slug>-svc-2

gh stack bottom   # data layer → commit
gh stack top      # consumer → commit
# after lower changes: bottom → commit → rebase --upstack → top
gh stack push && gh stack submit --auto --draft && gh stack view --json
# after lower merges: top → sync → verify diff
```

Agents: non-interactive only (`init --adopt`, `add`, `sync`, `submit --auto`, `view --json`).

## Report migration boundaries (example)

**Branch 1:** `app_` sproc, helpers, Python binding, return-code map, tSQLt/binding tests.  
**Branch 2:** service, document, renderers, CLI, fixtures/tests.  
Seam = typed binding. New column/RowType → Branch 1 then rebase up.

## Scenarios (abbrev)

1. **Clean bottom-up** — bottom: stage/commit Branch 1 paths; top: Branch 2 paths.
2. **Mixed edits** — on Branch 1 stage only Branch 1 paths; leave rest uncommitted; top then commit Branch 2. Same file both → `git add -p`.
3. **Need Branch 1 while on 2** — commit or stash Branch 2 → bottom → commit contract → `rebase --upstack` → top → stash pop → adjust.
4. **Wrong branch commit (latest, unpushed)** — top: `git reset --soft HEAD~1` → `restore --staged .` → bottom: commit Branch 1 files → `rebase --upstack` → top: commit remainder. If pushed/not tip: inspect `git log` + `view --json` before rebase-i/corrective commit.
5. **Branch 1 merged** — `sync` then `git diff --name-only <integration>...HEAD`; pause if lower-owned paths remain.
6. **What each PR contains** — bottom: `diff … <integration>...HEAD`; top: `diff … <lower-branch>...HEAD`. Clean upper: no hits under lower-owned globs.

## When not

Two agents concurrent on different branches → separate worktrees (one checkout/index). One agent, one deliverable → single-lane stack default.
