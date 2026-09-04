---
name: feature-doc-builder
description: Help a user create, draft, refine, or update a long-lived feature document for a product capability; use when the user wants to define or improve feature purpose, current state, feature roadmap increments, related project milestone context, and feature-level direction before or alongside deliverable specification.
---

# Feature Doc Builder

Long-lived feature requirements (product/system). Not SPECs/tasks. Governance: `docs/methodology/invariants.md`, `docs/agent-execution-discipline.md`. Pair `architecture-doc-builder` for technical shape.

## Startup

1. `AGENTS.md` → docs root/tracking/conventions. 2. Mode: new | evolve | transcript. 3. Standards index + existing feature/roadmap/milestone refs. 4. Stay feature-scoped.

## Mission / audience

Why it exists; value; live vs remaining; roadmap increments; related project milestones (timeline context, not feature-owned containers). Primary: product/owner/stakeholders. Secondary: onboarding, SPEC agents.

## Artifacts

- `<DOCS_ROOT>/features/{feature-key}.md` — `<DOCS_ROOT>` from `AGENTS.md` (MUST NOT assume literal `docs/`).
- User-provided path is sacrosanct (normalize docs root only). MUST NOT invent slug from title/domain.
- Update `features/index.yaml` on create/material revision.

## Boundaries

**Does:** purpose/value/current state; success criteria + increment outcomes; behavior/flows; roadmap; live/planned/proposed/deferred; transcript ingest; SPEC handoff.  
**Does not:** deliverable ACs; execution tasking; replace `proposal-builder`; implement.  
Chain: `proposal-builder` → **this** → `spec-builder` (+ architecture).

## Modes

| Mode | Behavior |
| --- | --- |
| A Live | Why, current state, increments |
| B Transcript | Summarize → intent/states → OQs → draft |
| C Revise | Refresh state/statuses/flows; keep long-lived intent |
| D Dev | May edit this SKILL.md; else read-only |

Ask; distinguish current vs planned; draft early. Starters: new doc; post-ship increment refresh; transcript → draft.

## Dialogue principles

Problem/value first; feature level only; current state mandatory; live/planned/proposed/deferred; increments = meaningful value (milestones = multi-feature timeline); push back on impl detail → standards/SPECs; transcripts = evidence. Every sentence MUST earn place — MUST NOT pad/repeat/generic scenarios.

## Required inputs

Name+key; explicit path if given; problem; justification; who affected; current + desired state; concepts; roadmap (or first-pass). Missing → mark assumptions. Path conflict later → halt before create/move/rename.

## Standards

`features/index.yaml` (overlap); `standards/index.yaml` only when shaping the feature. Cite; product in feature doc; coding → standards; execution → SPECs.

## Content

Title/summary; current+next increment; intro/problem; why; current state; success criteria; concepts; flows; roadmap table; increment detail + outcomes; risks/non-goals; OQs; handoff notes.

**Current state** = what the app does today after latest completed increment.

**Each increment (all three):** (1) timeline note (milestone/window/`TBD` — MUST NOT invent project dates); (2) one-sentence capability unlock; (3) candidate deliverables list. On ship: refresh current-state; mark complete.

**Milestones:** feature owns purpose/state/increments/capabilities/success criteria; MAY link milestones; MUST NOT own names/dates/membership/order.

Large features: per-increment `##` sections; cross-cutting outside them. Feature success informs but does not replace deliverable ACs.

## Section order

Title → Summary → Current/next + milestones + services → Intro → Why → Concepts → Flows → Roadmap overview → Increment details → Current-state summary → Planned evolution → OQs.

## Facilitator bank

Value; current pain/gaps; domain nouns/actors; flows; smallest first increment + BE/FE/cross + shared milestones; SPEC slices for handoff.

## Naming

Flat `{feature-key}.md` + index. User path wins. Split only ~700–800+ lines: `{feature-key}/` with `0-feature-summary.md` TOC + numbered sections.

## Triggers / handoff / quality

Draft on generate/write/create; refresh on “increment N complete.” Handoff: key/path, increment, milestone, state, outcomes, flows, constraints, likely slices → informs `spec-builder`. Quality: explicit why; accurate state; clear concepts/flows; meaningful increments (timeline+capability+deliverables); milestones referenced not redefined; clear handoff without impl collapse.
