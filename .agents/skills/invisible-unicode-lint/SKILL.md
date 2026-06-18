---
name: invisible-unicode-lint
description: Extend, verify, or roll out the deterministic invisible-Unicode / Trojan Source style linter (tools/invisible_unicode_lint). Use when improving patterns.default.json, wiring pre-commit or CI, reconciling ESLint no-irregular-whitespace with the Python scanner, or documenting new smuggling codepoint ranges for markdown, Python, TypeScript, and other text extensions.
---

# Invisible Unicode lint (evolution skill)

## Authority

**Normative requirements** live in **`docs/standards/agent-context-text-hygiene.md`**. Discover applicability via **`docs/standards/index.yaml`**; do not bypass that index to chase ad-hoc doc paths.

This skill holds **procedural** steps for editing the scanner and JSON. Anything that contradicts the standard is wrong.

## What you are changing

This repository ships a **non-AI**, **deterministic** scanner under `tools/invisible_unicode_lint/`, driven by `patterns.default.json`, with entry point `lint_invisible_unicode.py` (unless the repo documents a wrapper).

## How to add a new rule range

1. **Evidence** — Cite a Unicode chart block, CVE-style writeup, or internal red-team note in the PR that changes `patterns.default.json`.
2. **False positive scan** — Run `python3 tools/invisible_unicode_lint/lint_invisible_unicode.py .` on a large downstream clone before merging aggressive ranges.
3. **JSON change** — Append a rule object:

   ```json
   {
     "id": "kebab-case-id",
     "start": 917504,
     "end": 917631,
     "title": "Short human title",
     "detail": "Why this is blocked in agent-facing text.",
     "allow_only_at_file_start": false
   }
   ```

   Use decimal integers for `start` / `end` (JSON has no `0x` literals).

4. **Optional BOM-style behavior** — Set `"allow_only_at_file_start": true` only when the codepoint is acceptable as the first character (UTF-8 BOM) but never inline.

5. **Hook alignment** — If new extensions are added to the `extensions` array, mirror them in `.pre-commit-config.yaml` `files:` regex (hook conventions are also governed by `docs/standards/tooling-hooks-and-formatters.md`, per the agent-context standard).

6. **Tests** — Add or extend a focused `unittest` case in `tools/invisible_unicode_lint/test_lint_invisible_unicode.py` that builds a string in memory (avoid committing smuggling samples as tracked fixtures).

7. **Documentation** — Follow **Evolving rules** in `docs/standards/agent-context-text-hygiene.md` (change log, optional narrative update).

## When NOT to add a rule

- **Legitimate locale text** in user-facing translations may use bidi isolates in rare cases. This methodology repo is English-first agent docs; product repos with RTL locales may need `exclude_path_substrings` or narrower `extensions`.
- **Over-broad “all Cf category”** bans break valid scripts and emoji joiners; prefer explicit ranges backed by abuse evidence.

## Downstream adoption checklist

1. Vendor `tools/invisible_unicode_lint/` (or subtree) into the product repo.
2. Register the same `local` hook (or `prek` equivalent) per the agent-context standard and `tooling-hooks-and-formatters`.
3. Add CI that runs the scanner and tests (copy from this repo’s `.github/workflows/invisible-unicode-lint.yml` when present).
4. Complementary ESLint — only as described in the **agent-context** standard (fragment path is listed there).

## Verification commands

```bash
python3 tools/invisible_unicode_lint/lint_invisible_unicode.py .
python3 -m unittest discover -s tools/invisible_unicode_lint -p 'test_*.py' -v
pre-commit run invisible-unicode-lint --all-files
```

## Boundaries

- This linter cannot detect **semantic** prompt injection that uses only visible characters.
- It does not replace secret scanning, dependency review, tool sandboxing, or supply-chain governance (the latter is outside this skill; use the standards index to load governance docs when the task requires them).
