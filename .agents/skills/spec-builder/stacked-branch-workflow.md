# Stacked Branch Workflow (spec-builder)

Use only when specification-time review decides the artifact needs multiple dependent PRs.

Stacked work = **multiple branches inside one lane worktree** via `gh-stack`. Do not create stacked worktrees — that topology is unmanageable past two worktrees.

Not for PR-time cleanup of an oversized implementation. If coding has started and a stack seems necessary: stop for Owner sign-off, update affected specification sections in place, and record the change in the Implementation And Review Change Log before continuing.

Agents may push stack branches and create/update PRs when instructed; they never merge to the confirmed integration branch. Lower branches reach integration only after human review and land.

Prefer the `gh-stack` skill for commands. If unavailable, use this summary and ask the Owner to review command details before implementation.

Mental model:

- **One worktree** = one isolated agent lane (usually one deliverable; may hold multiple when intentionally stacked).
- **One stack** = multiple review branches for the same deliverable or tightly related group.
- **One branch** = one review unit (commits, not a remembered file list).
- One working directory, one index, one checked-out branch. `gh stack bottom/top/up/down` are checkouts in that directory.

See SKILL.md "Stacked mode — additional concerns" for why/how. This file is workflow only.

## Naming and location

- **Stacked specification**: `<DOCS_ROOT>/specifications/<slug>.md` unless the repo declares otherwise. Operating model decides tracked/ignored/mirrored/promoted.
- **Lane worktree**: flat conventional name, usually matching deliverable/branch slug.
- **Branch names**: flat `gh-stack` names; avoid `/` so names map to sibling worktree dirs/tooling.
- **Run log**: per repo storage policy; sections per branch/deliverable when useful.

No separate execution document. Branch phases, ACs, halt conditions, and prompts live in the stacked specification and run log.

## Required specification contents beyond the quality bar

`stacked-specification-template.md` enforces these — fill it; do not reinvent sections.

1. **Stacked-branch model** — why stacked, rebase rule, single-lane topology, why separate PR review, rejected alternatives.
2. **End-to-end execution flow** — sequence + slice-ownership diagrams; where the seam falls.
3. **Per-branch scope, decisions, ACs** — one section per branch; each numbers its own ACs.
4. **No-drift AC for upper branches** — upper branch must not modify lower-owned files.
5. **Integration & shared concerns** — locked public symbols across the seam, data shape, decimal/rounding, fixture ownership, case matrix.
6. **Cross-branch acceptance bar** — stacked PRs together satisfy all per-branch ACs plus seam/no-drift.

## Workflow

1. Confirm `<slug>` (kebab-case; worktree, branches, specification, run log).
2. Confirm stacked review is needed. One PR → milestone branch. Independent PRs → siblings.
3. Resolve specification path or external record.
4. Read `references/spec-driven-development-methodology.md`.
5. Read `gh-stack` skill if present (single-worktree-lane ref + non-interactive rules).
6. Read a project-local prior stacked specification if the Owner points to one.
7. If no `gh-stack` skill, continue with this summary; flag command details for Owner review.
8. Read `<DOCS_ROOT>/standards/index.yaml` from the lane worktree; load only relevant standards.
9. Copy `stacked-specification-template.md` and fill placeholders with the Owner.
10. Iterate until the seam contract is concrete — vague seams cause expensive upstack propagation.
11. Run the SKILL.md calibration check before presenting.

## gh-stack rules to preserve in specifications

Carry these non-interactive rules into commands/prompts:

- Always name branches for `gh stack init`, `add`, and `checkout`.
- Always `gh stack view --json` (plain `view` opens a TUI).
- Always `gh stack submit --auto` for PRs; add `--draft` when desired.
- Use `--remote origin` for `push`/`submit`/`sync`/`link`/`checkout` with multiple remotes, or set `remote.pushDefault origin`.
- `git config rerere.enabled true` before stack setup.
- Prefer `git add` / `git commit` over `gh stack add -Am` for deliberate ownership.
- After lower-branch changes with upper branches present: navigate down, commit, `gh stack rebase --upstack`, navigate back up.
- Local lower change → `gh stack rebase --upstack`. Routine remote/integration/PR sync (esp. after lower PR merges) → `gh stack sync`.
- Rebase exit 3: resolve markers, stage, `gh stack rebase --continue`; abort with `--abort` if unsafe.

## Rebase rule

State explicitly in the specification:

An upper branch rebases upstack from its lower branch until the lower PR lands on the integration branch via human review. After land, the upper rebases on `origin/{{ integration-branch }}`. Never squash-rebase an upper onto the integration branch while stacked — that absorbs lower commits into the upper PR and breaks the no-drift AC.

Branch 2 sees Branch 1 as of last create/base/rebase onto Branch 1. After new Branch 1 commits: `gh stack rebase --upstack`. After Branch 1 lands: `gh stack sync`, then verify Branch 2's remaining diff against the integration branch.

`gh-stack` tracks branch order and PR relationships, not file ownership. Be on the intended branch and stage intended paths/hunks before committing.
