<img width="1600" height="900" alt="methodology-heptagon-project-goals-for-light-slides" src="https://github.com/user-attachments/assets/95f14be9-cd17-416f-ae05-da8f88fdc3e5" />

# Agentic Software Delivery

Contract-governed delivery framework: human principals set architecture, specifications, and standards; autonomous agents execute bounded workstreams under those contracts. Canonical source for methodology, standards library, and `.agents/skills/`. Consumer repos vendor or sync upstream.

Primary adoption context: Stanley Black & Decker, Customer Engagement — corporate IT engineering teams.

Governance model (read once): [`docs/methodology/invariants.md`](docs/methodology/invariants.md)

## Documentation architecture

Two corpora share one mental model: **this repo** is the canonical framework library; **consumer repos** hold product docs under `<DOCS_ROOT>` (declared in `AGENTS.md` / `AGENTIC_DOCS_ROOT`).

```text
┌─────────────────────────────────────────────────────────────────┐
│  Framework repo (this tree) — vendored / synced upstream        │
│                                                                 │
│  methodology.md          entry + progression index              │
│  docs/methodology/       lifecycle sections + invariants.md     │
│  docs/standards/         engineering baseline + index.yaml      │
│  docs/agent-execution-discipline.md   agent operating rules     │
│  docs/{graphify,security,code-quality}/   supporting domains    │
│  .agents/skills/         workflow procedures (SKILL.md)         │
│  templates/AGENTS.md     consumer router stub                   │
└──────────────────────────────┬──────────────────────────────────┘
                               │ sync / rsync
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│  Consumer <DOCS_ROOT>/     product knowledge agents execute on  │
│                                                                 │
│  project.md                                                     │
│  architecture/                                                  │
│  proposals/                                                     │
│  features/                                                      │
│  specifications/           deliverable contracts                │
│  execution/                run logs (often gitignored)          │
│  standards/                repo copy or overlay of baseline     │
└─────────────────────────────────────────────────────────────────┘
```

### Layers (authority order)

| Layer | Location | Role |
| --- | --- | --- |
| Governance invariants | [`docs/methodology/invariants.md`](docs/methodology/invariants.md) | Human vs agent authority; `<DOCS_ROOT>` topology; operating constraints. Other docs link here — MUST NOT restate. |
| Methodology | [`methodology.md`](methodology.md) → [`docs/methodology/`](docs/methodology/) | Delivery progression (project → architecture → proposals → features → specs → SDD → gates → PR → human merge). |
| Standards | [`docs/standards/`](docs/standards/) + [`index.yaml`](docs/standards/index.yaml) | Stack and process norms. Agents load the **smallest** matching set via `applies_to` paths/activities. Voice: [`docs-hygiene.md`](docs/standards/docs-hygiene.md). |
| Execution discipline | [`docs/agent-execution-discipline.md`](docs/agent-execution-discipline.md) | Default agent operating rules; consumer `AGENTS.md` only states overrides. |
| Skills | [`.agents/skills/`](.agents/skills/) | Procedure for a workflow (spec-builder, spec-driven, pr-builder, …). Cite methodology/standards; MUST NOT fork governance prose. |
| Consumer product docs | `<DOCS_ROOT>/` in each product repo | Project, architecture, features, specifications, run logs — the contracts agents implement against. |
| Supporting domains | `docs/graphify/`, `docs/security/`, `docs/code-quality/`, worktree/gh-stack stubs | Adoption and risk guides; stubs point at skills or Git history where compressed. |

### Delivery document chain

```text
project.md → architecture/ → proposals/ → features/ → specifications/
    → (spec-driven impl) → gates / conformance → draft PR + preparatory audit → human merge
```

Entry point is scope-dependent: small fixes may start at specifications; uncertain direction at proposals. Full section map: [`methodology.md`](methodology.md).

### Agent load path (runtime)

1. `AGENTS.md` — router: `DOCS_ROOT`, integration branch, command wrappers, links to discipline + standards index.
2. Governing specification under `<DOCS_ROOT>/specifications/` (plus feature/architecture citations).
3. `standards/index.yaml` → only applicable standard files.
4. Matching skill `SKILL.md` (+ templates/references on demand).
5. Run log / tracker under declared execution surface.

Token-density policy for this corpus: [`docs/methodology/token-compression-plan.md`](docs/methodology/token-compression-plan.md).

## Entry points

| Need | Document |
| --- | --- |
| Methodology overview | [`methodology.md`](methodology.md) |
| Section index | [`docs/methodology/README.md`](docs/methodology/README.md) |
| Governance lattice | [`docs/methodology/invariants.md`](docs/methodology/invariants.md) |
| Standards baseline | [`docs/standards/README.md`](docs/standards/README.md) |
| Standards machine index | [`docs/standards/index.yaml`](docs/standards/index.yaml) |
| Repo agent router template | [`templates/AGENTS.md`](templates/AGENTS.md) |
| Execution discipline | [`docs/agent-execution-discipline.md`](docs/agent-execution-discipline.md) |
| Human merge review | [`docs/human-in-loop-pr-review-strategy.md`](docs/human-in-loop-pr-review-strategy.md) |
| Worktrees | [`docs/worktree-setup.md`](docs/worktree-setup.md) · [`docs/wt-cheat-sheet.md`](docs/wt-cheat-sheet.md) |
| Stacked PRs | [`docs/using-gh-stack.md`](docs/using-gh-stack.md) |
| Graphify | [`docs/graphify/README.md`](docs/graphify/README.md) |
| Token compression registry | [`docs/methodology/token-compression-plan.md`](docs/methodology/token-compression-plan.md) |

## Repository layout

```text
.agents/skills/     shared agent skills (workflow procedures)
docs/               methodology, standards, supporting domains
docs/methodology/   lifecycle sections + invariants
docs/standards/     engineering standards + index.yaml
docs/graphify/      Graphify adoption (canonical)
docs/security/      agent-instruction supply-chain guidance
docs/code-quality/  invisible-text / prompt-injection linting
templates/          adoption templates (AGENTS.md)
tooling/            portable kit fragments (Graphify setup kit)
methodology.md      overview and section index
```

## Getting started

1. Read [`methodology.md`](methodology.md) and [`docs/methodology/invariants.md`](docs/methodology/invariants.md).
2. Copy [`templates/AGENTS.md`](templates/AGENTS.md) to repo root; set `AGENTIC_DOCS_ROOT`.
3. Install Git, agent runtime, `gh`, optional Worktrunk / `gh-stack`, and project toolchain.
4. Sync selected skills from `.agents/skills/`.

## Propagation

```bash
rsync -avc /path/to/agentic-framework/methodology.md /path/to/consumer-repo/methodology.md
rsync -avc --delete /path/to/agentic-framework/.agents/skills/ /path/to/consumer-repo/.agents/skills/
rsync -avc --delete /path/to/agentic-framework/docs/ /path/to/consumer-repo/docs/
```

## Changelog (recent)

- **2026-09-03** — README documentation architecture (framework vs `<DOCS_ROOT>`, layers, agent load path); corpus densified ~50% tokens.
- **2026-08-22** — Token compression pass: `invariants.md`, slim README, research archive removed, kit doc stubs.
- **2026-07-14** — Graphify setup docs and tooling kit.
- **2026-07-07** — `spec-driven` lifecycle; Zazz-aligned skills (SBD-adapted).
- **2026-06-19** — Miro skill; stakeholder-facing proposal pattern.
- **2026-06-18** — Engineering-led delivery model; `AGENTIC_DOCS_ROOT` convention.

See Git history for earlier entries.

## License

See [LICENSE](LICENSE).
