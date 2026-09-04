# Agent Execution Discipline

Default operating guide for agents executing, verifying, reviewing, or packaging work under the Agentic Software Delivery Methodology. Governance invariants: [`docs/methodology/invariants.md`](methodology/invariants.md).

Repo `AGENTS.md` MUST link here and declare only repo-specific overrides: integration branch, command wrappers, tracker, execution-record location, human-only gates.

## First-read rule

At session start, read in order:

1. repo `AGENTS.md`
2. approved deliverable specification or assigned work item
3. current run log or declared execution record (when used)
4. standards and feature/architecture docs matched via indexes

Do not load every indexed document by default.

## Worktree discipline

Active execution uses an isolated worktree.

- Integration-branch worktree is read-only except sync.
- Create or switch to the deliverable worktree before edits.
- Confirm path and branch before edits, tests, commits, or pushes.
- One active deliverable per worktree; one lane per GH-stack review when stacked.
- Do not create extra worktrees unless user, repo policy, or worktree guide requires it.

## Scope discipline

The worktree contains the whole repo; the task is scoped to the branch diff and approved contract.

Before broad edits, linters, or auto-fixes:

```bash
git diff <integration-branch> --stat
```

- Do not modify files outside approved scope.
- Investigate failures in unmodified files for shared-dependency changes.
- Do not label failures "pre-existing" without evidence.
- Stacked branches: scope fixes to the current slice only.

## Integration branch health

Treat test failures as caused by the active branch until proven otherwise. Known integration-branch exceptions MUST be documented in `AGENTS.md`.

## Concurrent human work

Unexpected file changes are normal. Ask whether a human edited; work with concurrent changes; never revert others' changes unless explicitly asked.

## Command shape discipline

Use stable, repo-declared command shapes. Do not invent tools or flags. Resolve commands from `AGENTS.md`, loaded standards, hook config, and package manifests.

## Standards loading

1. Open `<DOCS_ROOT>/standards/index.yaml`.
2. Load ONLY standards whose `applies_to.paths` and `applies_to.activities` match the task.
3. Do not load the full standards library by default.

## Verification discipline

- Run tests and linters declared by the specification and loaded standards.
- Capture evidence paths the specification requires.
- Halt on unmet acceptance criteria or undeclared scope expansion.

## PR discipline

- Default: draft PRs.
- `pr-builder` packages; `pr-review` performs preparatory audit.
- Do not mark ready for review or merge unless explicitly authorized.

## Documentation discipline

Update durable docs when shipped work changes product, architecture, or standards. Run logs and handoffs follow repo execution policy under `<DOCS_ROOT>/execution/`.

## Escalation

Stop and ask when: specification ambiguity, standards conflict, scope exceeds contract, merge/release decision required, or destructive action without explicit approval.
