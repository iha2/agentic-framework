# Shared Review Rules

Apply to both Standards and Spec axes. Each sub-agent receives this file with axis-specific guidance.

## Diff Scope Discipline

Findings target only code added or modified in the PR diff. Untouched pre-existing code is out of scope even if it violates a standard. If adjacent pre-existing code provides context (e.g. new code copies a bad neighbor pattern), note the pattern but frame the ask around the new code.

When a finding spans new and pre-existing code, state which part is in-scope (new) vs context-only (pre-existing). Do not ask authors to fix code they did not touch — that is a separate cleanup.

The integration branch is always green. Every PR targets it (`dev` in the example repo); CI blocks merge unless tests pass — so the integration branch cannot carry a pre-existing test failure. A failing test on the PR branch was introduced here (failing test directly, or shared dependency: fixture, import, config, sproc). Do not dismiss as "pre-existing"/"unrelated" without proving this branch did not cause it. Downstream promotion branches (`stage` / `prod`) are never feature-PR review scope.

## Review Priorities — Finding Sizing

Lead with actionable findings, not a summary. Tag **every** finding with the team's geological sizing. Tags encode severity, importance, impact, and blast radius; a finding either **must be fixed** (blocks approval) or is **author's discretion**. Largest → smallest:

- **`[boulder]`** — critical: data loss, security vulnerability, production outage, or broken core flow; large blast radius. **Must fix for approval.**
- **`[rock]`** — significant defect or standards violation: unmet AC, clear regression, unsafe migration, broken contract, missing required auth/authz, or serious test gap. **Must fix for approval.** (Expected-to-be-addressed = rock, not pebble.)
- **`[pebble]`** — recommended improvement (clarity, maintainability, edge-case, scope, reviewability). **Optional — author's discretion.** Does not block.
- **`[sand]`** — style/formatting only. Does not block.

**Approval:** any open `[boulder]` or `[rock]` ⇒ **not approvable**. `[pebble]`/`[sand]` never block.

**Sizing spans axes — escalate when one finding hits more than one.** Size by combined blast radius, not the most lenient lens. When the standards-correct fix is also the more efficient/simpler one, the finding is rarely a `[pebble]` and often a `[boulder]` — strategy is wrong, not a line. Say so explicitly; raise early before structure settles.

Only include findings with a concrete remediation path. Avoid vague "consider refactoring" unless the code creates a real review/maintenance problem. Prefer silence over low-confidence `[sand]`.

## Security, Data, And Operations

Escalate when the diff touches:

- authn/authz, tenant/project boundaries, secrets
- persistence, migrations, destructive actions, idempotency, transactions
- external API contracts, webhooks, background jobs, queues, scheduled work
- logging, metrics, error reporting, operational recovery
- generated artifacts, schema files, lockfiles, large fixture changes

Review both code and tests. A passing happy path is not enough.

## Output Format

1. Findings first, sized largest → smallest.
2. Open questions or assumptions.
3. Brief summary after findings — approval verdict from tags (not approvable while any `[boulder]`/`[rock]` open).
4. Verification performed or not.

**Emit every finding as its own copy-paste-able code block.** **Each block MUST start with the size tag**, then `file:line`, one-line problem, why (cite standard when policy-based), and concrete fix:

```text
[rock] backend/src/foo/bar.py:42 — <one-line problem statement>
Why: <impact + which standard it violates; cite the index.yaml entry / standard filename>
Fix: <concrete suggested change>
```

- Size tag is always the first token — no prose before it.
- Self-contained blocks (no "same as above").
- One finding per block.

Each finding: leading size tag, concise title, file/line when available, why it matters, suggested remediation.

If no findings, say so clearly; mention residual risk or tests not run.

## Boundaries

- Do not approve or merge.
- Do not rewrite the PR unless the user asks for fixes.
- Do not block on missing context if the diff can still be reviewed honestly; state the assumption.
- Do not pad with style nits; prefer silence over low-confidence criticism.
- Do not require more tests by default — require better evidence where current evidence does not prove behavior.
