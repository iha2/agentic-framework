/**
 * Example ESLint flat config fragment for TypeScript/JavaScript repos.
 * Merge into your real eslint.config.mjs (or import and spread).
 *
 * Complements (does NOT replace) tools/invisible_unicode_lint/lint_invisible_unicode.py:
 * no-irregular-whitespace does not catch Unicode tag letters (U+E0000–U+E007F) or
 * full bidi / smuggling coverage across markdown and config files.
 */
export default [
  {
    linterOptions: {
      reportUnusedDisableDirectives: true,
    },
    rules: {
      // Built-in: odd whitespace / line terminators in JS/TS source.
      "no-irregular-whitespace": "error",
    },
  },
];
