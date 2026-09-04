# Deliverable Specification Methodology Reference

Portable spec-builder summary of the Agentic Software Delivery Methodology. Repo-local methodology docs and `AGENTS.md` remain source of truth when stricter.

## Core Mapping

```text
one deliverable = one deliverable specification
```

Flexible: where deliverables live during implementation/review:

```text
a worktree / branch / PR may contain one deliverable, multiple deliverables, or a
single-lane stack of branches
```

A worktree usually has one active deliverable. Exception: stacked branch lane — one worktree holds multiple dependent deliverables/review branches when intentionally stacked with `gh-stack`.

For features/deliverables, decomposition is part of specification approval. The specification defines whether work is one PR, one milestone PR, sibling PRs, a bounded stacked review lane, or a large exception — before implementation. PR-time review verifies that shape; it does not invent a new split/stack after coding starts.

## Document Locations

When committed to Git:

```text
<DOCS_ROOT>/specifications/
```

Filenames need not end in `SPEC` (directory already names the type).

Specifications may live in a project board or declared external tracker when repo policy says they are not committed. Then the implementation prompt and PR body identify the stable external record.

Related long-lived docs:

- `<DOCS_ROOT>/features/` — feature requirements
- `<DOCS_ROOT>/architecture/` — architecture (`project-architecture.md` or `{feature-key}-architecture.md`)
- `<DOCS_ROOT>/standards/` — standards

## What A Specification Does

Executable contract for one deliverable: capability/scope; approved review shape and decomposition rationale; required reading; invariants; decisions/rationale; acceptance criteria; test strategy; execution sequence; halt conditions; definition of done; implementation prompt; Implementation And Review Change Log; execution tracking and lead/subagent coordination.

Distinguish hard constraints from adaptive guidance. Constrain outcomes, contracts, and boundaries without over-prescribing every internal move.

After greenlight, accepted steering/review feedback updates affected sections in place. The final Implementation And Review Change Log records timestamp, source, changed sections, rationale, summary, and verification impact — audit trail, not a second requirements source.

## Run Logs

Use when the effort needs append-only history: open-question answers, phase progress, deviations, manual evidence, recovery, verifier output.

Not inherently a committed Git document — store per repo policy (ignored local, committed support artifact, board/tracker, or combination). Repos without board/tracker may use `<DOCS_ROOT>/execution/` exclusively. When board/tracker is declared, it is the centralized execution record across worktrees/sessions. When Jira or another tracker is declared, the specification names the stable issue/task reference and which companion skill or repo guidance the implementation prompt should use.

## Review Topologies

Use the simplest topology that matches the intended review artifact:

- **Single-deliverable branch**: one deliverable, one specification, one branch/PR
- **Milestone branch**: multiple ordered deliverables/specs in one worktree/branch, one PR
- **Sibling branches**: independently reviewable branches/PRs
- **Stacked review lane**: dependent branches in one worktree via `gh-stack`

Do not force one worktree per deliverable. Do keep one deliverable per specification. Record the review shape in the specification before implementation. If implementation reveals the shape is wrong: stop for Owner sign-off, update sections in place, record in the Implementation And Review Change Log.

## Stacked Branches

`gh-stack` is the methodology stack tool. Use when dependent PRs are easier to review/sequence than one combined branch. Each PR still needs human sign-off.

Useful when: lower-layer contract should be reviewed before upper-layer behavior; one logical change has meaningful internal review boundaries; related deliverables are clearer as dependent PRs.

Avoid when siblings or one milestone PR would be clearer.

Stacking is a specification-time choice. Do not retrofit an oversized implementation into a stack during cleanup unless the specification is revised and approved first.

Do not enforce universal file/line/branch caps. Optimize for human reviewability: focused purpose, clear dependency, concrete ACs, PR body that explains what to review.

## Human Review

Agents may commit/push feature branches when instructed; they must not merge directly into the integration branch. Integration happens through human PR review.

Strong flow: (1) draft PR → (2) author-side automated agent review + address feedback → (3) mark ready → (4) formal automated agent review → (5) human sign-off before merge. For stacks, apply to every PR.

## Change Rule

If implementation, QA, UAT, or PR review changes the contract or approved review shape, update affected specification sections with Owner sign-off and record in the Implementation And Review Change Log. Do not hide contract changes only in commits, PR comments, or run-log entries.
