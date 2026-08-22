# Methodology invariants

Canonical governance model for the Agentic Software Delivery Methodology. Other documents MUST reference this file instead of restating it.

## Governance lattice

| Role | Retains |
| --- | --- |
| Human principals | Product intent, architecture, specification approval, standards ownership and exceptions, ambiguity resolution, merge and release gates |
| Autonomous agents | Bounded implementation, verification, draft PR packaging, evidence assembly, preparatory audit within approved contracts |

Agents are the default execution substrate—not an auxiliary chat. Throughput without specification and standards discipline is out of scope for this framework.

## Document topology

Repos declare `<DOCS_ROOT>` in `AGENTS.md` (typically `docs/` or `.agentic/`; env: `AGENTIC_DOCS_ROOT`, repo-relative only).

```text
<DOCS_ROOT>/
├── project.md
├── architecture/
├── proposals/
├── features/
├── specifications/
├── execution/          # mutable run artifacts; often gitignored
└── standards/
```

## Delivery progression

```text
project → architecture → proposals → features/milestones → specifications
→ spec-driven implementation → deterministic gates → conformance
→ agent implementation → verification → draft PR + preparatory audit → human merge
```

Not every change traverses the full chain. Scope determines entry point.

## Stakeholder vs agent-reference surfaces (optional)

When non-technical stakeholders operate outside Git:

- **Proposals** — vetted copy on GitHub, SharePoint, and/or Miro; Git holds pointer files under `proposals/` (title, owner, status, canonical URL).
- **Project and architecture** — authoritative packages may live in SharePoint; `project.md` and `architecture/` markdown remain the agent-reference layer. Record sync ownership in `project.md`.

`AGENTS.md` carries one-line pointers only—not full policy.

## Operating constraints

1. Durable knowledge lives in versioned docs, not chat transcripts.
2. Deliverable specifications are execution contracts.
3. Deterministic tooling expresses every rule it can enforce reliably.
4. Conformance PRs align legacy code through small, evidence-backed changes.
5. Acceptance criteria and verification evidence are mandatory for convergence.
6. Active implementation uses isolated worktrees.
7. Draft PRs are the default packaging surface.
8. Preparatory audit precedes human merge review.
9. Shipped work updates durable docs when product, architecture, or standards change.

## Authority gates

Agents MAY draft docs, implement, run tests and linters, prepare PRs, and perform preparatory audit when the governing specification and repo policy permit.

Humans MUST approve proposals, features, architecture, and specifications; own standards exceptions; and approve merge and release.
