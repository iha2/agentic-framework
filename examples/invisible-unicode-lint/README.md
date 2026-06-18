# Example: invisible Unicode in agent-facing files

This folder is documentation only. **Do not** commit real smuggling payloads into the main tree; they would fail `lint_invisible_unicode.py` and the pre-commit hook.

To **reproduce** the class of issue locally (for training or tool validation):

1. Read `docs/code-quality/invisible-text-prompt-injection-and-linting.md`.
2. In a scratch file outside the repo (or in a git-ignored path), append tag letters or zero-width characters and run:

   ```bash
   python3 tools/invisible_unicode_lint/lint_invisible_unicode.py /path/to/scratch.md
   ```

3. Confirm the linter prints `file:line:col:` diagnostics and exits non-zero.

The unit tests under `tools/invisible_unicode_lint/` build malicious strings **in memory** so the canonical repo stays clean while still verifying detection logic.
