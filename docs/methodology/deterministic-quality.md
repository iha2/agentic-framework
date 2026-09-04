# Deterministic Quality Gates

AI agents are probabilistic. Linters, formatters, type checkers, a11y checks, schema validators, doc linters, and test runners are deterministic enough to make review safer and cheaper. Automate every quality rule expressible in tooling; reserve agents/humans for judgment, architecture, intent, and ambiguous failures.

They do not replace tests, QA, or human review — they shrink the surface subjective review must cover.

## Baseline Expectations

Every adopting repo SHOULD document stack-appropriate checks:

| Gate | Cover |
| --- | --- |
| Formatter | Commands, config, when auto-fix is allowed |
| Linter/static analysis | Rules, ownership, suppressions, fail conditions |
| Type/schema | TS/mypy/OpenAPI/JSON Schema/SQL lint (or equivalent) |
| Tests | Unit, integration, API, browser, DB, smoke commands |
| Accessibility | Automated frontend checks + named manual gaps |
| Documentation | Markdown/link/TOC/YAML checks; sensitive-reference scans |
| Agent-context text hygiene | Invisible Unicode / smuggling scans on markdown, skills, prompts, YAML/JSON, comments — see [invisible-text doc](../code-quality/invisible-text-prompt-injection-and-linting.md); starter under `tools/invisible_unicode_lint/`. Supply-chain playbook (separate): [agent-instruction guidelines](../security/agent-instruction-supply-chain-human-guidelines.md) |
| CI | Which checks block merge vs advisory |

`AGENTS.md`, standards index, and specs MUST point agents at these commands. A standard that cannot name a verification command MUST explain why it is manual.

## Ongoing Standards Conformance

Use the `conformance` skill against a named standard section and a bounded area → small PR-sized fix. Prefer a stream of localized, evidence-backed, human-approved PRs over one large cleanup. Do not mix with unrelated feature work. If the governing rule cannot be named, pause and update/create the standard first.

## Stack Examples (baselines, not universal)

- JS/TS: ESLint (+ plugins); consider type-aware linting; Prettier for format, linters for quality
- Frontend: automated a11y (e.g. axe-core) + human evaluation (W3C WAI: tools alone cannot prove conformance)
- Docs-heavy: markdownlint (+ YAML); add invisible-Unicode gate for agent-loaded text
- Replace examples with the repo’s real tools (Ruff/mypy, gofmt/staticcheck, Clippy, etc.)

## Agent Workflow

1. Read instructions/standards before editing
2. Run narrowest relevant local checks early
3. Run required verification before packaging a PR; include results in evidence
4. Auto-format/safe lint fixes only when standards allow
5. MUST NOT silence rules, loosen types, skip a11y, or weaken CI to pass
6. Conformance: one standard + one area; leave other drift as follow-ups; humans still approve/merge

## Standards And Specs

Distinguish tooling-enforced, test-verified, human-review, and owner-signoff rules. Specs SHOULD name applicable commands. Missing tooling for an important bar → record the gap and required manual evidence.

## Halt Conditions

Stop and ask when: governing standard/area unclear; evidence insufficient for hands-off conformance; required deterministic command missing; rule conflicts with product behavior; broad/permanent suppressions proposed; scope would explode; a11y tools pass but UI still risky; formatter would rewrite unrelated files; CI vs local disagree unexplained.

## Related

[Invisible text / linting](../code-quality/invisible-text-prompt-injection-and-linting.md) · [Supply-chain guidelines](../security/agent-instruction-supply-chain-human-guidelines.md) · [Code Generation](./code-generation.md) · [Testing](./testing-and-validation.md) · [Self-Review](./self-review.md) · [Standards](../standards/README.md)
