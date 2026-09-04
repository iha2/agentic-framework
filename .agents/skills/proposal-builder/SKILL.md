---
name: proposal-builder
description: Help one or more stakeholders create, draft, refine, or update a proposal for a feature, deliverable, or technical direction; use when the user wants to explore an idea, compare options, weigh tradeoffs, and improve a proposal before committing to a feature document or SPEC.
---

# Proposal Builder

Facilitator + scribe for exploratory, non-authoritative proposals before feature doc / SPEC. Does not implement or author Feature Requirements / final SPEC unless asked to switch roles.

## Startup

1. Read `AGENTS.md` (docs root, tracking, conventions).
2. Mode: live dialogue | multi-human | transcript ingest.
3. Load standards index; note standards that constrain approaches.
4. Push alternatives, tradeoffs, decision-ready recommendation.

## Artifacts

- Primary: `<DOCS_ROOT>/proposals/{proposal-slug}.md` (or external doc + Git pointer with title/URL/owner/status/handoff).
- Handoff → `feature-doc-builder` and/or `spec-builder` on approval.

Scope: feature | deliverable | joint. Authoritative contracts remain Feature Requirements Document and deliverable SPEC.

## Modes

| Mode | Behavior |
| --- | --- |
| A Live (default) | Q&A; draft early; iterate |
| B Multi-human | Capture positions, agreement/dissent, owners; no false consensus |
| C Transcript | Summarize → extract alternatives/risks/OQs → draft → gap questions |
| D Zoom (if integrated) | Live scribe; one labeled chat question at a time; else fall back to C+A |

## Required inputs

Scope type; subject + IDs; problem/opportunity; why now; decision horizon. Missing → continue; mark assumptions.

## Standards integration

Cite applicable standards per approach (alignment, exceptions, implications). MUST NOT paste standards verbatim.

## Proposal contents (required)

1. Context/problem 2. Scope/non-goals 3. Business justification 4. Technical justification 5. Value/outcomes 6. Alternatives (≥1 vs recommendation) 7. Tradeoffs 8. Standards/constraints 9. Risks/mitigations 10. Dependencies/sequencing 11. Recommendation 12. Decision checklist 13. Open questions 14. Discussion log (esp. multi-human) 15. Sign-off + next-phase handoff

## Dialogue principles

Focus first → ask don't assume → ≥2 viable approaches when possible → surface cost/complexity/risk/timeline/maintainability/impact → standards-aware → record dissent → draft early.

### Facilitator bank (condensed)

- Pain/opportunity; who/how often; measurable outcome
- Business vs technical value
- ≥2 approaches; lowest-cost acceptable; highest-confidence
- Gains/losses; failure modes; assumptions
- Constraining standards; exceptions needed
- Missing evidence; blockers; decide-now vs defer

## Placement

`<DOCS_ROOT>/proposals/` only — not `features/` or `deliverables/`. Capture feature key / deliverable code in title, metadata, handoff.

## Triggers

Draft: “generate/draft/write/create proposal.”  
Approved / move to feature or SPEC → finalize + handoff package: approved scope, recommendation, chosen vs rejected approaches, constraints/standards, risks for next doc, OQs, suggested next-phase focus. Handoff informs; does not replace feature doc/SPEC.

## Quality bar

Unambiguous scope; explicit business+technical rationale; meaningful alternatives when feasible; concrete tradeoffs/risks; standards addressed; justified recommendation; explicit OQs/disagreements.

## Guardrails

MUST NOT present opinions as facts; erase dissent; skip alternatives unless directed+documented; jump to implementation planning; claim Zoom live capability without integration.
