---
last_updated_at: 2026-06-20
---

# Invisible text prompt injection, linting benefits, and deterministic checks

**Canonical** repo note on (1) **deterministic linting** in agentic delivery, (2) **invisible (Unicode) prompt injection** / smuggling, (3) **shipped mitigations**. Supersedes split docs under `docs/linting-benefits-*` and `docs/security/invisible-prompt-*`.

**Use:** §1–2 stakeholder framing; §3–6 threat, Unicode mechanisms, repo tooling; §7 out-of-scope. Supply-chain governance for skills/rules/MCP/hooks: [Human guidelines: supply chain risk in agent instructions](../security/agent-instruction-supply-chain-human-guidelines.md).

---

## 1. What we mean by “linting” here

**Linting** = **machine-checked rules** run identically locally (editor, pre-commit), CI, and optionally the agent harness — style, correctness-shaped conventions, security hygiene — without human recall per line.

Distinct from **probabilistic review** (LLM diff summary). This doc emphasizes **deterministic** checks: **repeatable, attributable, cheap at scale**.

### 1.1 Benefits for product teams

1. **Early feedback** — defects pre-review; review focuses design/product risk.
2. **Consistent baseline** — shared configs encode minimum bar; faster onboarding.
3. **Lower agent variance** — same rules for human/agent changes; failures actionable.
4. **Audit evidence** — CI/hook logs support retrospectives.
5. **Composable** — complements tests, threat modeling, access control; automates exacting checks skipped under pressure.

Methodology: [Deterministic quality gates](../methodology/deterministic-quality.md).

---

## 2. Why invisible-text prompt injection is lint-shaped

**Invisible prompt injection** (Unicode smuggling: zero-width chars, bidi controls, tag letters encoding readable text invisibly) exploits **human-visible vs machine-read** divergence.

In agentic delivery, **markdown, skills, YAML, JSON, specs, source comments** become **agent context**. Hidden instructions yield **misinterpreted intent**, **policy bypass**, **unsafe tool use** — not syntax errors.

Fit for **deterministic text scanning**: precise codepoint/UTF-8 checks; low cost vs manual smuggling review; binary merge outcome with file/line/column.

---

## 3. Threat summary

Models/tools consume **logical character sequences**; humans read rendered text. Attackers insert invisible/reordering/ tag-encoded payloads so benign review coexists with machine-intelligible instructions.

Goals: **tool misuse** (exfiltration, destructive commands), **policy bypass**, **repo tampering**. Surface: unvetted text agents load — markdown, skills, prompts, CSV, YAML, comments.

Gate is **not** substitute for **trust boundaries**, **least-privilege tools**, **human review** — a **cheap filter** for smuggling **primitives** pre-merge.

---

## 4. Mechanisms (high level)

### Unicode tag letters (U+E0000–U+E007F)

ASCII `c` → `U+E0000 + ord(c)`; invisible in editors, reconstructs for tokenizers. No legitimate role in plain docs/source.

### Zero-width and format characters

U+200B, U+200C/U+200D, mid-file U+FEFF — hide payloads, split tokens, encode bits.

### Bidirectional controls (U+202A–U+202E, U+2066–U+2069)

Display vs logical order divergence (“Trojan Source”); reviewers see one narrative, parsers another.

---

## 5. What this repository ships

Normative requirements also in **`docs/standards/agent-context-text-hygiene.md`** (`docs/standards/index.yaml` for agent routing).

### 5.1 Primary gate: invisible Unicode scanner

`tools/invisible_unicode_lint/` — **`lint_invisible_unicode.py`**, README, **`.pre-commit-config.yaml`**. Optional TS twin under `tools/invisible_unicode_lint/src/`.

- **Deterministic** JSON codepoint ranges; no models/network.
- **UTF-8 strict**; invalid encoding fails.
- **Line/column** diagnostics.

Rules/extensions: **`patterns.default.json`**. Extend via `.agents/skills/invisible-unicode-lint/SKILL.md`.

### 5.2 Pre-commit integration

Local hook on staged files matching JSON extensions. `pre-commit` or org `prek`; align hook `files:` regex with JSON `extensions`.

### 5.3 ESLint (TS/JS) — partial

**`no-irregular-whitespace`** catches some ambiguous whitespace; **does not** cover tag block, full bidi set, markdown/YAML/skills. Example: `tooling/eslint.invisible-unicode.example.mjs`.

### 5.4 Ruff / markdownlint

Ruff lacks comparable smuggling rules — use Ruff for Python quality + **`lint_invisible_unicode.py`** for smuggling codepoints. markdownlint: structure/style, not security Unicode.

---

## 6. Operational guidance

1. **Fail closed** on hits — merge-blocking unless documented exception.
2. **Reject over strip** for high-risk categories — stripping may concatenate tokens; blocking forces explicit fix.
3. **Normalize at trust boundaries** for external text — safe profiles, log rejections; no unchecked blobs in system prompts.
4. **Evolve via JSON + skill** — `.agents/skills/invisible-unicode-lint/SKILL.md` when extending `patterns.default.json`.

---

## 7. What this gate does *not* replace

- **Semantic** prompt injection (visible prose only).
- **Authorization**, **secrets**, **sandboxing**, **least-privilege tools**.
- **Supply chain** in skills/rules/MCP/hooks/deps — [Human guidelines](../security/agent-instruction-supply-chain-human-guidelines.md).
- **Human judgment** on intent, architecture, merge risk.

Treat scanning as **narrow strong filter** where **mixed-trust text** enters repo and becomes **agent context**.

---

## 8. References

- Unicode Standard (blocks in `patterns.default.json`).
- Boucher & Anderson, *Trojan Source* — bidi review risk.
- `.agents/skills/invisible-unicode-lint/SKILL.md`.
- [Tooling index](../../tooling/README.md).
