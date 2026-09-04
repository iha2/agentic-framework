<img width="1600" height="900" alt="methodology-heptagon-project-goals-for-light-slides" src="https://github.com/user-attachments/assets/95f14be9-cd17-416f-ae05-da8f88fdc3e5" />

# Agentic Software Delivery

Contract-governed delivery framework: human principals set architecture, specifications, and standards; autonomous agents execute bounded workstreams under those contracts. Canonical source for methodology, standards library, and `.agents/skills/`. Consumer repos vendor or sync upstream.

Primary adoption context: Stanley Black & Decker, Customer Engagement — corporate IT engineering teams.

Governance model (read once): [`docs/methodology/invariants.md`](docs/methodology/invariants.md)

## Entry points

| Need | Document |
| --- | --- |
| Methodology overview | [`methodology.md`](methodology.md) |
| Section index | [`docs/methodology/README.md`](docs/methodology/README.md) |
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
.agents/skills/     shared agent skills
docs/               methodology, standards, supporting docs
docs/graphify/      Graphify adoption (canonical)
docs/standards/     engineering standards + index.yaml
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

- **2026-08-22** — Token compression pass: `invariants.md`, slim README, research archive removed, kit doc stubs.
- **2026-07-14** — Graphify setup docs and tooling kit.
- **2026-07-07** — `spec-driven` lifecycle; Zazz-aligned skills (SBD-adapted).
- **2026-06-19** — Miro skill; stakeholder-facing proposal pattern.
- **2026-06-18** — Engineering-led delivery model; `AGENTIC_DOCS_ROOT` convention.

See Git history for earlier entries.

## License

See [LICENSE](LICENSE).
