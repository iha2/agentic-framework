---
last_updated_at: 2026-06-21
---

# Agent context text hygiene (invisible Unicode gate)

This standard governs the **deterministic invisible-Unicode / smuggling scanner** for text that agents and tools typically load from the repository (skills, methodology markdown, templates, and the scanner’s own configuration).

It does **not** cover semantic prompt injection, MCP configuration, or supply-chain governance of agent instructions.

## Normative requirements

1. **Scanner** — The reference implementation lives under `tools/invisible_unicode_lint/`. Rules and scanned extensions are defined in `tools/invisible_unicode_lint/patterns.default.json`. The entry point in this repository is `lint_invisible_unicode.py` unless the repo documents a supported wrapper.

2. **UTF-8** — Text inputs must be valid UTF-8; invalid encoding is a **failure** (same behavior as the scanner’s strict read).

3. **Pre-commit** — When this repository’s root `.pre-commit-config.yaml` registers the `invisible-unicode-lint` hook, keep the hook `files:` regex aligned with the `extensions` list in `patterns.default.json`. General hook naming, `prek`, and formatter conventions are governed by **`docs/standards/tooling-hooks-and-formatters.md`**; do not duplicate those rules here.

4. **Complementary ESLint** — For JavaScript/TypeScript only, enable `no-irregular-whitespace` where ESLint is used. The example fragment is `tooling/eslint.invisible-unicode.example.mjs`. ESLint does **not** replace this scanner for markdown, YAML, skills, or Unicode tag letters.

5. **Verification** — Before merge, run the scanner on the working tree or on changed files the hook would include. Typical commands (adapt to repo):

   ```bash
   python3 tools/invisible_unicode_lint/lint_invisible_unicode.py .
   python3 -m unittest discover -s tools/invisible_unicode_lint -p 'test_*.py' -v
   ```

   When pre-commit is available: `pre-commit run invisible-unicode-lint --files <paths>`.

## Evolving rules

When adding or changing a codepoint range in `patterns.default.json`:

- Attach evidence (Unicode chart reference, internal writeup, or CVE-style note) in the same PR.
- Add or extend a **unit test** that builds the payload in memory (do not commit smuggling samples as tracked fixtures unless they live in an excluded path).
- Append a row to the **Change log** table below.
- For stakeholder-facing narrative (threat overview, linting benefits), update **one** background document: `docs/code-quality/invisible-text-prompt-injection-and-linting.md`. Do not scatter duplicate threat writeups across skills or multiple standards.

## Change log

| Date | Change |
| ---- | ------ |
| 2026-06-21 | Initial standard extracted for agent routing; scanner paths as in methodology repo. |

## Further reading (non-normative)

- `docs/code-quality/invisible-text-prompt-injection-and-linting.md` — stakeholder and technical background for this gate.
- `docs/security/agent-instruction-supply-chain-human-guidelines.md` — human playbook for skills, rules, MCP, and dependencies (load when the task is governance-heavy, not for day-to-day scanner edits).
