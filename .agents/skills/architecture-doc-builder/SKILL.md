---
name: architecture-doc-builder
description: >-
  Help a user create, draft, refine, or update a long-lived architecture document for a feature or subsystem; use when
  the user wants to define or improve system design, module placement, per-milestone sequence diagrams, data model
  vision, and technical open questions. Can be project-level or paired with a feature requirements document; does
  not replace feature-doc-builder.
---

# Architecture Doc Builder

Long-lived technical system shape. Not SPECs, product definition, or task plans. Governance: `docs/methodology/invariants.md`, `docs/agent-execution-discipline.md`.

## Startup

1. `AGENTS.md`. 2. Scope: project vs feature — feature-level MUST have paired feature doc else halt → `feature-doc-builder`. 3. Mode: new | evolve | convert. 4. Standards + existing architecture docs. 5. Stay architecture-scoped.

## Mission / audience

Module layout; per-milestone system/sequence diagrams; data-model vision; cross-cutting (permissions, errors, OpenAPI, settings, deploy, IAM); technical OQs. Primary: lead/architect. Secondary: onboarding, SPEC agents.

## Artifacts

| Kind | Path |
| --- | --- |
| Project | `<DOCS_ROOT>/architecture/project-architecture.md` |
| Feature | `<DOCS_ROOT>/architecture/{feature-key}-architecture.md` |
| Index | `architecture/index.yaml` |

Flat `architecture/` by default.

## Boundaries

**Does:** placement + rationale; per-milestone diagrams; cross-cutting; data vision; technical OQs; ingest proposal/transcript; SPEC handoff.  
**Does not:** deliverable ACs/tasks; replace feature/proposal builders; implement; restate product content.  
Chain: proposal → feature-doc → **this** → spec-builder.

## Pairing / mirror

Feature-level: same `{feature-key}` as feature doc; cross-link both ways. Project-level: paired with `project.md` — services/modules/stores/boundaries/integrations; no invented feature milestone model.

**Feature owns:** purpose, milestone list (names/order/dates/capabilities/deliverables), permission catalog (concept), product flows/OQs.  
**Architecture owns:** design, placement, diagrams, data vision, technical cross-cutting/OQs.

Mirror: read feature milestone overview first; exact same names/order; MUST NOT add/rename/reorder or record target dates here; need change → feature doc first. Each milestone = own `##`; no interleaving; cross-cutting outside; prefer links over duplication.

## Modes

| Mode | Behavior |
| --- | --- |
| A Live | Design dialogue; verify assertions in code |
| B Ingest | Shape → current/future → OQs → draft |
| C Revise | Diff vs latest milestone; refresh diagrams/OQs |
| D Dev | May edit this SKILL.md; else read-only |

## Dialogue principles

Feature-level: read paired feature doc first. Verify paths before asserting. Architecture level only. One system diagram + per-use-case sequences per milestone (no mega cumulative except optional summary). Push back on SPEC/standards collapse. Proposals = evidence. Every sentence/diagram MUST earn place — MUST NOT pad/impossible/generic-every-route/repeat cross-cutting.

## Required inputs

Scope; feature key+path (feature-level); milestone list from feature doc; codebase state; placement plan; use cases needing sequences; data vision if persistence later; cross-cutting list. Missing → mark assumptions.

## Standards / content

Indexes for overlap; feature/project pairing; cite standards (coding → standards; execution → SPECs). Content: title+scope+link; summary; module placement (final; earlier = subsets); cross-cutting; per-milestone diagrams + end-state; OQs tagged by milestone; references. Label current/in-progress/planned/vision.

## Section order

Title → Summary → Module placement → Cross-cutting → Milestone 1…N → OQs → References.

## Facilitator bank

Placement/why/packages/imports; per-milestone end-state deltas; sequences (happy+alt); cross-cutting; data/MVP schema; OQs blocking vs deferrable.

## Triggers / handoff / quality

Draft on generate/write/create; refresh on “milestone N complete.” Handoff: scope/paths, milestone, modules, sequences, cross-cutting, data expectations, blocking OQs → informs `spec-builder`. Quality: clear scope; paired without product duplication; milestones mirror exactly; no dates; explicit placement; accurate diagrams; cross-cutting once; tagged OQs; clear handoff.
