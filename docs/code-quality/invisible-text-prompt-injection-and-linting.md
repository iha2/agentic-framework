---
last_updated_at: 2026-06-20
---

# Invisible text prompt injection, linting benefits, and deterministic checks

This is the **canonical** note for this repository on (1) **why deterministic linting** matters in agentic delivery, (2) **invisible (Unicode) text prompt injection** / smuggling, and (3) **what we ship** to reduce risk. It replaces the former split between `docs/linting-benefits-and-invisible-prompt-injection.md` and `docs/security/invisible-prompt-injection-and-linting.md` so content is not duplicated across paths.

**How to use this page**

- Skim **§1–2** for stakeholder framing (linting value + why this risk is “lint-shaped”).
- Use **§3–6** for threat detail, Unicode mechanisms, and **concrete repo tooling** (scanner, JSON, pre-commit, ESLint/Ruff).
- **§7** lists what this gate does *not* replace.

For **governance** of skills, rules, MCP, hooks, and dependencies (supply chain in agent instructions), see the human playbook [Human guidelines: supply chain risk in agent instructions](../security/agent-instruction-supply-chain-human-guidelines.md) under `docs/security/`.

---

## 1. What we mean by “linting” here

**Linting** means **machine-checked rules** that run the same way for every contributor: locally (editor, pre-commit), in CI, and optionally in the agent harness. Linters enforce **style**, **correctness-shaped conventions**, and—where relevant—**security hygiene**, without relying on a human to remember every check on every line.

This is different from **probabilistic review** (for example, an LLM summarizing a diff). Both have a place; this document emphasizes **deterministic** checks because they are **repeatable, attributable, and cheap to run at scale**.

### 1.1 Benefits of linting for product teams

1. **Fast, early feedback** — Problems surface before code review or merge; review stays focused on design and product risk instead of nits.
2. **Consistent baseline across repos** — Shared configs and methodology assets encode a **minimum bar** and improve onboarding.
3. **Lower variance in agentic workflows** — The same rules apply whether the change came from a person or an agent; failures are actionable (“fix the lint”).
4. **Defensible evidence** — CI logs and hook output support audits and retrospectives.
5. **Composable with other practices** — Linting does not replace tests, threat modeling, or access control; it automates checks that are boring, exacting, and easy to skip under pressure.

Where this sits in the methodology: [Deterministic quality gates](../methodology/deterministic-quality.md).

---

## 2. Why invisible-text prompt injection is a lint-shaped problem

**Invisible prompt injection** (often implemented with **Unicode smuggling**: zero-width characters, bidirectional controls, or “tag letters” that encode readable text invisibly) targets the **gap between what humans see** and **what machines read**.

In agentic delivery, **markdown, skills, YAML, JSON, specs, and even comments in TypeScript or Python** are not “just prose.” They become **context** for tools and models. If that text contains hidden instructions, the failure mode is not a syntax error—it is **misinterpreted intent**, **policy bypass**, or **unsafe tool use**.

That makes a slice of the risk a good match for **deterministic text scanning**:

- Checks are **precise** (specific codepoint ranges and UTF-8 validity), not subjective.
- Cost is **low** compared to manual smuggling review on every change.
- Outcome is **binary** at merge time: pass or fail, with file/line/column for fixes.

---

## 3. Threat summary

Humans read rendered text; language models and tools consume **logical character sequences**. Attackers exploit that gap by inserting codepoints that are invisible, reorder display without changing logical order, or encode readable ASCII using the **Unicode tag characters** block so that a `.md` file or skill reads as benign to a reviewer while still containing machine-intelligible instructions.

Typical goals include **tool misuse** (exfiltration, destructive commands), **policy bypass** (“ignore prior instructions”), and **repository tampering**. The attack surface is any **unvetted text** checked into the repo that agents load as context: markdown, skill files, prompts, CSV, YAML, and source comments.

This gate is **not** a substitute for **trust boundaries**, **least-privilege tool access**, or **human review** of high-risk changes. It is a **cheap deterministic filter** for high-yield smuggling **primitives** before those files merge.

---

## 4. Mechanisms (high level)

### Unicode tag letters (U+E0000–U+E007F)

Each ASCII code unit `c` can be mirrored as `U+E0000 + ord(c)`, producing a string that is usually invisible in editors yet reconstructs to English (or code-like tokens) for a tokenizer. In plain documentation and most source files, these codepoints have **no legitimate role**.

### Zero-width and format characters

Sequences of U+200B (zero-width space), U+200C / U+200D (joiners), and mid-file U+FEFF (treated as zero-width no-break space) are used to hide payloads, split tokens, or encode bits invisibly.

### Bidirectional controls (U+202A–U+202E, U+2066–U+2069, related marks)

These change **display order** vs **logical order** (“Trojan Source” class confusion). Reviewers see one story; parsers and models see another.

---

## 5. What this repository ships

**Normative gate requirements** for this framework are also summarized in **`docs/standards/agent-context-text-hygiene.md`** (see **`docs/standards/index.yaml`** for when agents should load it). The following subsections match that standard and stay aligned with the shipped tool paths.

### 5.1 Primary gate: invisible Unicode scanner

Location: `tools/invisible_unicode_lint/` — see **`lint_invisible_unicode.py`** and `tools/invisible_unicode_lint/README.md` for run instructions; **`.pre-commit-config.yaml`** registers the hook. A **TypeScript** implementation of the same logic may live under `tools/invisible_unicode_lint/src/` for Node-first product repos.

Properties:

- **Deterministic**: codepoint ranges loaded from JSON; no models or network.
- **UTF-8 strict read**: invalid encoding fails the check.
- **Line and column** diagnostics for each hit.

Rules and scanned extensions are data-driven in **`tools/invisible_unicode_lint/patterns.default.json`**. Extend coverage by editing that file and following `.agents/skills/invisible-unicode-lint/SKILL.md`.

### 5.2 Pre-commit integration

`.pre-commit-config.yaml` registers a `local` hook that runs the scanner on staged files whose extensions match the JSON configuration. Use standard `pre-commit` or org-standard `prek` against the same YAML. Keep the hook `files:` regex aligned with the `extensions` array in `patterns.default.json`.

### 5.3 ESLint (TypeScript / JavaScript) — partial, complementary

Core ESLint rule **`no-irregular-whitespace`** catches some ambiguous whitespace and unusual line terminators in JS/TS sources. It does **not** replace the Unicode scanner: it does not cover the Unicode tag block, full bidi control set, or markdown / YAML / skills.

An **example** flat config fragment lives at `tooling/eslint.invisible-unicode.example.mjs` for product repos that already use ESLint; copy and merge into your real `eslint.config.*`.

### 5.4 Ruff / markdownlint

**Ruff** does not ship a first-class “invisible Unicode smuggling” rule family comparable to the tag-letter block; continue using Ruff for Python quality, and rely on **`lint_invisible_unicode.py`** (or your vendored equivalent) for smuggling codepoints across `.py` and other text extensions listed in the JSON.

**markdownlint** focuses on markdown structure and style, not security Unicode. Keep using it for docs hygiene where applicable.

---

## 6. Operational guidance

1. **Fail closed on hits**: treat findings like merge-blocking lint unless you have a documented exception path.
2. **Prefer rejection over silent stripping** for high-risk categories: stripping can concatenate tokens or leave ambiguous normalizations; blocking forces an explicit human fix.
3. **Normalize at trust boundaries** if you must ingest external text: convert to known-safe profiles, log rejections, and never feed unchecked blobs directly into agent system prompts.
4. **Evolve rules via JSON + skill**: follow `.agents/skills/invisible-unicode-lint/SKILL.md` when extending `patterns.default.json` so new ranges stay reviewed and documented.

---

## 7. What this gate does *not* replace

- **Semantic** prompt injection using only visible natural language.
- **Authorization**, **secret hygiene**, **sandboxing**, and **least-privilege tool** policies.
- **Supply chain** in skills, rules, MCP, hooks, and dependencies — see [Human guidelines: supply chain risk in agent instructions](../security/agent-instruction-supply-chain-human-guidelines.md).
- **Human judgment** on product intent, architecture, and merge risk.

Treat invisible-text scanning as a **narrow, strong filter** at the boundary where **untrusted or mixed-trust text** enters the repo and later becomes **agent context**.

---

## 8. References

- Unicode Standard (code charts) for blocks cited in `patterns.default.json`.
- Nicholas Boucher and Ross Anderson, *Trojan Source: Invisible Vulnerabilities* — bidi control risks in source code review.
- Maintainer skill: `.agents/skills/invisible-unicode-lint/SKILL.md`.
- [Tooling index](../../tooling/README.md) (ESLint example fragment).
