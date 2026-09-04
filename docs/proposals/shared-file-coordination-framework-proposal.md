# Proposal: Shared-File Coordination in the Agentic Engineering Framework Methodology

## Status

Draft

## Scope

Methodology-level proposal

## Context and Problem Statement

Methodology expects agents/subagents to reason about parallel execution, file ownership, overlapping-file risk:

- where repos declare shared-file coordination
- how execution agents choose project board locks, Switchman, harness-native coordination, or serialization
- how to prevent guessing, over-inference, inconsistent coordination

Need clarity first, not premature abstraction — execution environments differ; many repos use no external locking.

## Scope and Non-Goals

**In scope:** methodology approach; `AGENTS.md` vs skill placement; future tooling roadmap.

**Out of scope:** live file-locking integration; Switchman protocol pre-tool; agents discovering undeclared coordination tools.

## Business Justification

- Fewer collisions/rework with parallel agents.
- Single maintainer declaration point.
- Practical adoption without project board or external tools.

## Technical Justification

- Execution behavior MUST be deterministic and auditable.
- Coordination policy = repo workflow config, not secret/runtime env.
- Varies by harness/repo/adoption; clear boundary prevents invented locking from incidental clues.

## Alternatives Considered

### Option A: `AGENTS.md` only

Declare coordination in `AGENTS.md`; spec/execution contract references when relevant.

**Pros:** obvious SoT; human-reviewable; works with board/Switchman/none; minimal complexity.

**Cons:** policy without implementation; tool detail may outgrow short section.

### Option B: Dedicated skill now

New skill resolves/applies coordination mechanism.

**Pros:** centralized instructions; future adapters; less duplication across workflow skills.

**Cons:** premature without integrations; over-design; indirection for maintainers/agents.

### Option C: Environment variables

Env vars select board/Switchman/harness-native.

**Pros:** automation-readable; CI convenience.

**Cons:** poor human visibility; doc drift; weak auditability; ill-suited to workflow policy.

## Tradeoff Analysis

Simplicity vs future modularity. Immediate needs: single policy locus; explicit behavior without external tools; no guessing → **`AGENTS.md`**. Separate skill attractive later with real implementation; until then it restates policy better kept in-repo.

## Standards and Constraints Analysis

Aligns with methodology:

- `AGENTS.md` = SoT for docs root, tracking, workflow
- specs capture execution guidance, not invent policy
- agents follow repo-declared policy, not infer infrastructure

## Risks and Mitigations

**`AGENTS.md` bloat** → short policy section; tool detail in companion/future skills.

**Undeclared policy** → default explicit: silent `AGENTS.md` ⇒ no external locking; harness-native coordination; serialize overlapping-file work.

**Divergent implementations** → coordination skill only when ≥1 real path justifies abstraction beyond policy.

## Dependencies and Sequencing

Near-term: `AGENTS.md` template supports coordination declaration.

Future: integration skills/adapters per mechanism.

## Recommendation

Two-layer model:

1. **`AGENTS.md`** — short repo policy: model, when it applies, fallback.
2. **Deliverable spec** — execution guidance: serialization hotspots, safe parallel streams, non-overlapping steps, phase sequencing.
3. **Implementation agent** — applies policy + spec sequencing.

**Default:** silent `AGENTS.md` ⇒ no external locking; harness-native coordination; serialize overlapping-file work without guaranteed isolation.

**Future:** dedicated skill when real implementation surface exists; draft-only until concrete mechanism beyond policy.

## Proposed Future Skill Direction

Name: `shared-file-coordination`. Companion utility for execution agents; applies declared policy via tool adapters.

Maturity: (1) draft, not implemented; (2) board locking adapter; (3) Switchman when protocol defined; (4) optional harness adapters for explicit coordination APIs.

## Discussion Log / Notable Arguments

- Avoid coordination maze of hierarchy/fallbacks.
- Env vars poor primary policy source.
- Execution agents need clarity over flexibility.
- Many repos: no external tool — default MUST be explicit/safe.
- Switchman skill valuable when real enough to justify abstraction.

## Decision Checklist

- Require `Shared-file coordination` section in repo `AGENTS.md`?
- Add draft `shared-file-coordination` skill to roadmap without implementation?

## Open Questions

- Generic vs tool-specific skill naming?
- Normalize coordination vocabulary across tools?
- Skill: execution only vs lightweight `AGENTS.md` policy validation?

## Sign-off Outcome and Next-Phase Handoff

If approved:

1. Keep `AGENTS.md` concise, policy-only.
2. Specs express sequencing consequences.
3. Optionally draft roadmap skill when formalizing integration work.
