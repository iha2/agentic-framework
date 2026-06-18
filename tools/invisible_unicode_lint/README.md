# Invisible Unicode lint

Deterministic guard against **invisible prompt injection** and related **Unicode smuggling** in text that agents or humans treat as instructions (markdown, skills, Python, TypeScript, YAML, JSON, and similar).

Requires **Python 3.8+** (stdlib only).

## Run locally

From the repository root:

```bash
python3 tools/invisible_unicode_lint/lint_invisible_unicode.py .
```

Scan specific paths:

```bash
python3 tools/invisible_unicode_lint/lint_invisible_unicode.py docs README.md
```

## Configuration

Rules and scanned extensions live in `patterns.default.json` in this directory. Downstream repos may vendor this folder and point `--patterns` at a forked JSON file; keep hook `files:` regex in `.pre-commit-config.yaml` aligned with the `extensions` list.

## Tests

```bash
python3 -m unittest discover -s tools/invisible_unicode_lint -p 'test_*.py' -v
```

## See also

- [Invisible text prompt injection, linting benefits, and deterministic checks](../../docs/code-quality/invisible-text-prompt-injection-and-linting.md)
- [Skill: evolve the linter](../../.agents/skills/invisible-unicode-lint/SKILL.md)
