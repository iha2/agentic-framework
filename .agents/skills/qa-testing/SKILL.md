---
name: qa-testing
description: Verify a completed change, deliverable, pull request, or local diff against its requirements, acceptance criteria, tests, and project standards. Use when the user wants rigorous QA evidence, test-quality review, rework findings, frontend or backend verification, API collection checks, accessibility checks, performance/security spot checks, or reviewer-ready validation notes.
---

# QA Testing

## Startup Sequence

1. Read `AGENTS.md` (or equivalent): docs root, standards index, target branch, test commands, env rules, review workflow.
2. Identify the verification target: spec, issue, PR, branch diff, task list, or stated acceptance criteria.
3. Load only standards relevant to changed files/activities (`<DOCS_ROOT>/standards/index.yaml` when present).
4. Map the surface to lenses: general, API/service, data/persistence, frontend/UI, CLI/batch, performance, security, migration/deployment, documentation.
5. Run the QA loop with a bug-finding mindset. Passing tests are insufficient unless they prove ACs and realistic risks.

Prefer repo-local tooling. Do not install global tools unless the repo requires it or the user approves.

## Verification Loop

1. Read requirements enough to list every AC, non-goal, required test, and owner-signoff item.
2. Inspect the diff and blast radius (shared contracts) before broad tests.
3. Verify each AC with evidence: tests, commands, API samples, screenshots, a11y reports, logs, or owner signoff.
4. Review test quality — prove behavior, not count.
5. Run required tests first; add risk-relevant adjacent tests for shared behavior, migrations, security, compatibility, or journeys.
6. Record failures as rework findings: repro, expected vs actual, files, violated criterion/standard.
7. Re-run the smallest meaningful check after each fix; broaden before final signoff if shared behavior changed.
8. Produce concise reviewer-ready evidence, residual risks, and checks not run.

## Test Quality Bar

Require tests that protect a public contract, AC, regression, invariant, realistic edge case, or named risk. Prefer compact behavior-level tests.

Flag tests that:

- assert framework/type tautologies or source structure instead of product behavior
- over-mock so real integration bugs cannot fail
- duplicate stronger nearby coverage
- couple to private helpers, incidental call order, temporary markup, or brittle snapshots
- use unrealistic inputs callers cannot send
- omit assertions for bodies, errors, authz, persistence, or side effects
- skip migration/fixture/env failures that should be fixed or documented
- build broad fixture worlds when a smaller table-driven matrix would suffice

Weak specified test plans are requirements gaps — ask the owner to approve a stronger contract; do not silently accept easier tests.

## Verification Lenses

Use only matching lenses.

### API And Service

- Contracts: status codes, error envelopes, auth/authz, idempotency, pagination/sort/filter, compatibility.
- Exercise real boundaries: HTTP/RPC/message handler/service function/public SDK.
- Prefer repo-pinned collection runners (`npx newman run …`, `npx @hoppscotch/cli test …`); pin versions when the repo does not.
- Capture representative request/response/assertion evidence; never leak secrets.

### Data And Persistence

- Schema, migrations, seeds, constraints, compatibility, rollback/forward-only policy, transactions, integrity.
- Prefer test DBs or isolated fixtures for destructive checks.
- Confirm migrations/generated artifacts match source-of-truth policy.
- Edge cases: missing rows, duplicates, nullability, cross-tenant isolation, time zones, concurrency, retry/idempotency.

### Frontend And UX

- Browser-boundary journeys when UI matters.
- Loading, empty, error, permission, validation, optimistic-update, refresh, navigation.
- A11y basics: keyboard, focus, labels/names, contrast-sensitive states, announcements, reduced-motion when relevant.
- Responsive viewports and screenshots when layout/interaction is in ACs.
- Owner signoff for subjective visual/copy/interaction requirements.

### CLI, Batch, And Background Work

- Exit codes, stdout/stderr shape, idempotency, dry-run, config/env, paths, retries, partial failure, cleanup.
- Prefer temp/fixture inputs over live data.
- Include exact command and relevant output in evidence.

### Performance, Security, And Operations

- Performance only against explicit thresholds or realistic risk; capture method, data size, timing, env.
- When touched: secrets, permission scope, injection, path traversal, SSRF, unsafe deserialization, CVE/deps, audit logs, PII exposure.
- Logging/metrics must be operationally useful without sensitive values.

## Rework Findings

Each failure must be self-contained for a fresh implementer:

- title and severity
- violated AC, standard, or risk
- exact repro steps or command
- expected vs actual
- relevant files / likely fix area
- evidence captured
- suggested post-repair verification

Separate confirmed failures from residual risks. Do not inflate uncertainty into a finding or bury it in a pass summary.

## Final Evidence

Return: pass/fail recommendation; AC matrix; tests/checks with commands and results; manual/owner signoff; test-quality assessment; standards and security/performance notes; rework findings; residual risks and checks not run.

Update PR/verification artifacts via the repo's PR workflow or `pr-builder` when available.
