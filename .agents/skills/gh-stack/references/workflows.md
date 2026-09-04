# gh-stack reference: workflows and tutorials

Load for end-to-end examples. Agent MUST/MUST NOT rules and command contract live in `../SKILL.md`. Lane methodology: `single-worktree-lane.md` (do not duplicate that model here).

## End-to-end: create a stack

```bash
gh stack init -p feat auth
git add auth.go && git commit -m "Add auth middleware"
# more commits on same branch as needed
gh stack add api-routes          # suffix only when prefix set
git add api.go && git commit -m "Add API routes"
gh stack add frontend
git add frontend.go && git commit -m "Add frontend dashboard"
gh stack submit --auto --draft
gh stack view --json
```

Shortcut: `gh stack add -Am "message" branch-name` stages/commits/creates in one step — useful for single-commit layers; bypasses deliberate staging.

## Mid-stack changes (critical for agents)

Put changes on the branch where they belong; then rebase upstack.

```bash
# On feat/frontend but need an API change:
gh stack down                    # or: gh stack checkout feat/api-routes
# edit + commit on the correct branch
git add users_api.go && git commit -m "Add get-user endpoint"
gh stack rebase --upstack
gh stack top                     # resume upper work
```

Wrong branch → wrong PR diffs. After lower commits, upper branches inherit only via rebase.

## Modify mid-stack + push

```bash
gh stack bottom                  # or checkout by branch / PR number
# edit + commit
gh stack rebase --upstack
gh stack push
```

## Routine sync / squash-merge recovery

```bash
gh stack sync                    # fetch, rebase, push, sync PR state
gh stack view --json
```

After squash-merge, `sync` detects and uses `git rebase --onto`. Conflict → restores pre-rebase state, exit 3.

## Rebase conflicts (agent)

1. `gh stack rebase` (or continue after `sync` conflict)
2. Exit 3 → parse stderr for paths → resolve markers → `git add <files>`
3. `gh stack rebase --continue` (repeat on further conflicts)
4. Unable → `gh stack rebase --abort`

## Parsing `--json`

```bash
output=$(gh stack view --json)
echo "$output" | jq '[.branches[] | select(.needsRebase == true)] | length'
echo "$output" | jq -r '.branches[] | select(.pr.state == "OPEN") | .pr.url'
echo "$output" | jq -r '.branches[] | select(.isMerged == true) | .name'
echo "$output" | jq -r '.currentBranch'
echo "$output" | jq '[.branches[] | .isMerged] | all'
```

## Restructure (remove / reorder / rename)

```bash
gh stack unstack
git branch -m old-branch-1 new-branch-1   # structural edits
gh stack init --base main --adopt new-branch-1 new-branch-2 new-branch-3
```
