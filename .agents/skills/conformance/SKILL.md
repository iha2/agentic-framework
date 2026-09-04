---
name: conformance
description: Identify and apply a small, PR-sized code or documentation change that brings a bounded area of a repo into conformance with a named standard, guide, or convention document, then verify and prepare PR-ready evidence. Use when the user wants standards-driven maintenance, legacy-code cleanup, drift prevention, an automated or on-demand conformance pass, a ready-for-review conformance PR, a focused conformance fix, or an incremental cleanup against standards for a specific package, service, module, file, or docs area.
---

# Conformance

Apply one small, topically isolated change that brings a bounded repo area into conformance with a named standard. Suitable for a focused PR; prevents drift from adopted standards.

Standards are the authority. Inspect legacy code for drift; do not invent rules. If the rule is missing, recommend creating/updating a standard before broad cleanup.

Stay language- and stack-agnostic. Discover the repo's standards, manifests, scripts, CI, and local instructions; use diagnostics and tests that apply to the bounded area.

Operating model (strong gates + tests): localized pass → safe fix → verify → self-review → fix in-scope findings → ready-for-review PR. Treat like an automated dependency-update PR: routine, bounded, evidence-backed.

## Autonomy Modes

- **Ready PR**: Automated pass/PR requested and safety envelope strong — fix, required checks, self-review, in-scope fixes, ready-for-review PR.
- **Patch**: No PR tooling or local-only — apply, verify, return PR-ready evidence.
- **Triage**: Unclear standard/scope/tests/behavior — list candidates; ask before editing.

## Workflow

1. Identify governing standard and bounded area (prefer explicit section + path/package/service/module/file list).
2. If only a standard is given, use index/`applies_to` for a conservative area; if several plausible, present 2–4 options.
3. Read the guide/standard: structure, naming, tests, mocking, evidence, forbidden shapes, halt conditions, path patterns.
4. Discover language/framework/runtime/package manager/test runner/diagnostics from repo files — no default-stack assumptions.
5. Discover files inside the area; avoid unrelated packages, generated/vendored code, broad formatting churn.
6. Confirm autonomy mode and safety: existing tests, deterministic gates, behavior preservation, automated-PR policy.
7. Check overlapping in-flight PRs/tasks when metadata exists; avoid duplicate fixes.
8. List candidates: location, violated section, size estimate, verification command, risk.
9. Select one PR-sized change — smallest clear improvement; no unrelated cleanup.
10. Apply only that change.
11. Run the narrowest formatter/linter/type/doc/test command; broaden only for shared files or standard-required validation.
12. Run self-review when available; fix findings within the same standard, area, and risk envelope; leave wider items as follow-ups.
13. Summarize change, satisfied rule, verification, self-review, remaining candidates. Package ready-for-review PR when requested and allowed; draft only if policy requires draft-first or evidence is incomplete.

## Selection Rules

- Keep under ~100 changed lines unless the user approves a broader sweep.
- Do not mix renaming, restructuring, formatting, and behavior changes unless inseparable.
- Do not invent rules; cite the standard section the fix satisfies. Judgment may flag risk; the fix must cite authority.
- Preserve behavior unless the standard requires change.
- Prefer deterministic enforcement: formatter, linter, type checker, schema/a11y/doc checker, or tests.
- Missing deterministic tooling is a standards gap — do not replace evidence requirements with intuition.
- Keep reviewable: one theme, clear evidence, short follow-up list.
- More autonomy only when tests/gates cover affected behavior; otherwise shrink scope, clarify residual risk, or stop for direction.
- Prefer repeated localized passes over one sweeping cleanup.
- If every candidate is ambiguous or high risk, present 2–4 options and ask.

## Ready PR Criteria

Ready-for-review only when all are true:

- one named standard + one bounded area
- required checks pass or have explained non-blocking failures
- no unresolved in-scope self-review findings
- PR body cites standard section, files, verification, self-review, residual risk
- merge still requires human approval

Otherwise: draft PR, local patch, or triage output.

## Output

Return: changed files; standard section/rule; verification commands/results; self-review commands/findings/fixes; remaining candidates; PR-ready drift-prevention summary; ready-for-review title/body when PR prep was requested.
