---
last_updated_at: 2026-06-10
---

# Code structure

File size, contextual splitting, cohesion, discoverable skills, duplicated code/runtime work. Applies to source, tests, scripts, standards, agent guides.

## File-size thresholds

Authored files MUST stay reviewable and loadable with task context.

- **<400 lines** preferred.
- **>400 lines** SHOULD split; cohesive exception → PR note, pebble review.
- **>600 lines** MUST split unless reviewer exception.
- Large test data MAY exceed; SHOULD flag pebble maintenance cost.

Same for code, tests, scripts, config, standards, `SKILL.md`, companions.

## Function-complexity thresholds

Radon grades (`uvx radon cc <file> -s`) as signal (review precedent):

- **A–B (≤10)** preferred.
- **C (11–20)** SHOULD split; exception → comment + pebble review.
- **D+ (21+)** or ~100 lines MUST split unless exception.
- `# noqa: PLR0912`/`PLR0915` needs justification; reviewer may still request split.

Split from return value — extract independent steps; deep nesting → extract inner loops. Precedent: `_build_ytd_extras` D(23)→A(2) orchestrator + five helpers; byte-equal fixtures.

### Desired ✅

```text
docs/standards/data-layer-results.md
docs/standards/data-layer-errors.md
docs/standards/data-layer-templates.md
```

### Not desired ❌

```text
docs/standards/data-layer-guide.md  # legacy oversized guide
```

## Split by work context

Split by load reason — MUST NOT by page count or `part-1`/`part-2` ([docs-hygiene.md](./docs-hygiene.md#how-agents-consume-these-docs)). Boundaries: layer, task type, artifact, consumer need.

### Desired ✅

```text
frontend.md
frontend-forms-ui.md
```

## Skills are incrementally discoverable

`SKILL.md` MUST route/activate only; checklists, recipes, axes → companions loaded on demand.

### Desired ✅

```text
.agents/skills/pr-review/SKILL.md
.agents/skills/pr-review/standards-axis.md
```

## Avoid agentic slop

Code SHOULD express domain intent, not agent-generated structure. Flag: duplicated helpers/types; one-call abstractions; generic names; impossible-state branches; narrating/removed-code comments; unrelated churn; parallel implementations; dead compat paths; broad catch; generated assets in git beside regenerator.

## Compute once, return many

One expensive source → one execution, all required shapes. MUST NOT re-query/re-call because earlier layer discarded intermediate result ([data-layer-results.md](./data-layer-results.md#multiple-result-sets--compute-once-return-many)).

## Preserve provenance when moving rules

Moved rules MUST keep hard references; MUST NOT become uncited prose (docs-hygiene-reference-structure.md).

### Desired ✅

```markdown
HTTP routes return 422 for validation.
```

### Not desired ❌

```markdown
HTTP routes should probably use 422 for validation.
```
