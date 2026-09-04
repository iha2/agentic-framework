---
last_updated_at: 2026-06-15
---

# Spec hygiene

Governs deliverable specifications under `docs/specifications/` — portable, verifiable, reviewable. Covers path/link portability, link-don't-inline, unmerged-work references, and content-quality bar for authors and reviewers.

General markdown conventions (RFC-2119 voice, Desired/Not-desired, relative paths, cleanup discipline, no working-doc identifiers in code): [docs-hygiene.md](./docs-hygiene.md), [docs-hygiene-reference-structure.md](./docs-hygiene-reference-structure.md). This standard adds spec-specific rules only.

## Specifications are often uncommitted

A spec is the contract for one deliverable — committed at `docs/specifications/{slug}.md`, on a feature branch, or in an external tracker. All are normal. Treat specs as portable reference any reviewer or agent may open from any worktree/branch, before or after merge. Nothing MAY depend on one machine's layout or a file existing only in the author's checkout.

## Paths are repository-relative, never absolute

Every path — prose, markdown links, required-reading lists, agent prompts — MUST be repository-relative. Absolute machine paths and sibling-checkout climbs MUST NOT appear; they resolve only for the author and encode one checkout layout.

### Desired ✅

```markdown
Open `docs/standards/index.yaml` and load only the standards whose
`applies_to` matches this deliverable's file list.
```

### Not desired ❌

```markdown
Open `<absolute-checkout-path>/docs/standards/index.yaml`
and load only the matching standards.
```

## Link to standards and prior specifications; do not inline them

Reference standards, prior specs, and code patterns by relative link and section number. MUST NOT paste content inline — copies drift when originals change and bloat context beyond review capacity. State the one constraint needed; link to the section.

Superseded specs: link as historical context; do not copy forward to "stand alone."

### Desired ✅

```markdown
### Required reading

- [reporting-m3-d1-frontend-pdf-slice-SPEC.md §4 Decisions](./reporting-m3-d1-frontend-pdf-slice-SPEC.md) —
  page-slug vs apiSlug split this deliverable reuses.
- [frontend.md](../standards/frontend.md) — RTK Query placement and response-schema discipline.
```

### Not desired ❌

```markdown
### 1.d Pathfinder pattern — INLINED (this SPEC stands alone)

The prior PR shipped the viewer + hook + state-machine + registry...
<!-- hundreds of lines pasted forward; drifts from source -->
```

## Reference unmerged work by relative path, annotated

Legitimate dependency on not-yet-merged files: repository-relative path it will have post-merge, annotated not-yet-merged with PR number. MUST NOT point at another worktree's absolute path.

### Desired ✅

```markdown
Follow the iterated standards at `docs/standards/` (not yet merged to the
integration branch; tracked in PR 1234).
```

### Not desired ❌

```markdown
Follow the iterated standards at `../sibling-worktree/docs/standards/`.
```

## Acceptance criteria are testable from the criterion alone

Each criterion MUST be detailed enough to write a test without re-asking the author, and MUST name the verifying test or command. Restating the goal ("the page works") gives implementers and reviewers nothing actionable.

### Desired ✅

```markdown
The report URL keys off the api slug when the registry entry supplies one,
otherwise the page slug, and appends query extras after the three core
keys in insertion order. Verified by slug-precedence and extras-ordering
cases in `tests/unit/api/v1/reports.test.ts`.
```

### Not desired ❌

```markdown
The report endpoint works correctly for both report modes.
```

## Test plan is high-signal and proportional

Prove acceptance criteria and realistic edge cases with the smallest meaningful set — not a coverage quota. Table-driven matrices when cases share one behavior boundary; one integrated test over several collaborator-only checks. Intentional omissions: one-line rationale so omission reads as decision, not gap.

### Desired ✅

```markdown
- One table-driven case per registry entry asserting menu href + enabled
  state — new report adds a row, not a copied block.
- Extras-ordering asserted once against two-key input; single-key implied.
```

### Not desired ❌

```markdown
- Test the by-month link renders.
- Test the YTD link renders.
- Test the by-month link is enabled.
- Test the YTD link is enabled.
```

## Decisions carry a rationale; rejected alternatives only when weighed

Each decision states choice and one-line reason. Record rejected alternatives only when actually weighed; no strawmen. Neutral description without "because" is incomplete.

### Desired ✅

```markdown
**Decision.** Distinguish reports with a registry query extra on a shared backend route, not two routes.
**Why.** Backend already exposes one route for both period modes; splitting on the frontend forks code with no contract benefit.
**Rejected alternative.** Two frontend endpoints — duplicates fetch path for no observable difference.
```

### Not desired ❌

```markdown
**Decision.** Use a registry query extra to distinguish the reports.
```

## Scope and exclusions are explicit

Name changed files (path + new/modified + reason), allowed diff directory, explicit out-of-scope list. Speculative future work is in scope or out — never "we might want to" asides. Status fields and verbatim standards copies do not belong; workflow state lives in tracker, standards are cited.

## What this standard does not contain

- Reviewer checklist — per [docs-hygiene-reference-structure.md §What standards docs do not contain](./docs-hygiene-reference-structure.md); standard states rules, reviewer applies them.
- Required spec sections — belongs to spec-authoring workflow; this governs quality/portability of whatever sections exist.
- General markdown conventions — [docs-hygiene.md](./docs-hygiene.md), [docs-hygiene-reference-structure.md](./docs-hygiene-reference-structure.md).

## Related standards

- [docs-hygiene.md](./docs-hygiene.md) — voice, paired examples, cross-linking, working-doc identifiers.
- [docs-hygiene-reference-structure.md](./docs-hygiene-reference-structure.md) — citations, section ordering, exclusions.
- [pr-process.md](./pr-process.md) — one logical change per PR; scope discipline specs encode.
