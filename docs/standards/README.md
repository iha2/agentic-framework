# Standards Baseline

Starting point for teams adopting the Agentic Engineering Framework methodology.

Not universal corporate policy — a **baseline for AI-assisted product development**: concrete for humans/agents in implementation, QA, and review; incomplete until the org adds stack, risk, and governance. Template for building a standards library.

## What This Baseline Is

- **Generic methodology standards** — reusable: code structure, docs/spec hygiene, PR process, agent routing.
- **Stack-specific baseline examples** — detail for a stack (Python testing, React admin UI, SQL Server sprocs, GitHub Actions, AWS Lambda, Serverless).

Adopters MUST NOT treat stack examples as universal. Keep when matching; replace when not; preserve concrete guidance, halt conditions, and review evidence.

## Why Standards Matter

Agents SHOULD NOT infer expectations from scattered code, old PR comments, or private habits. Standards give shared reference for structure, test proof, API/service/data/security/logging/deployment review, pre-merge evidence, and halt conditions. Less repeated explanation; better review; more trustworthy agent output.

## How To Use This Directory

Start with [index.yaml](index.yaml) — agents load the smallest applicable set via `applies_to`.

1. Keep generic methodology standards that fit the workflow.
2. Keep stack examples only when architecture/stack match.
3. Replace non-applicable examples with equivalents for your languages, frameworks, DB, infra, review.
4. Add corporate security, privacy, compliance, accessibility, release rules.
5. Add stack-specific standards for actual languages, frameworks, databases, cloud, deploy systems.
6. Keep discoverable via `index.yaml`.

## Prompt For Drafting Repo-Specific Standards

Use with `standard-builder` — reviewable draft, not automatic policy:

```text
Use $standard-builder to inspect this repository and draft stack-specific engineering standards for team review.

Context:
- This repo is a <monorepo / service repo / frontend app / backend service>.
- The area to inspect is <repo-relative path or service name>.
- The target stack is <language, framework, runtime, database, test runner, CI/deploy tools>, if known.
- Requested standards: <architecture / microservice design / API patterns / unit testing / integration testing /
  API testing and mocking / data access / observability / deployment / other>.

Please:
1. Inspect representative source, tests, config, and docs before drafting.
2. Infer observed patterns from repo-relative examples; do not invent rules without evidence.
3. Separate observed patterns, recommended standards, and open questions.
4. Propose a decomposed set when one large standard would mix unrelated contexts.
5. Include concrete desired/not-desired examples with neutral repo-relative paths.
6. Include halt conditions and required review evidence per standard.
7. Note inconsistencies and ask the team to choose direction.
8. Suggest `docs/standards/index.yaml` entries for agent routing.
9. Run a sensitive-reference scan before finalizing.
```

## Baseline, Not Final Policy

Technology-specific files (Python testing, frontend, HTTP, DB, sprocs, CI, deploy, observability) are worked examples of agent-facing specificity, not a mandatory stack. For other stacks, create equivalents.

## What To Add For Your Organization

Local standards SHOULD cover business/risk profile: security/privacy/compliance; a11y/UX bars; observability/incident/rollback; dependency/license/supply-chain; API compatibility/versioning; DB migration/retention; ownership/review tiers/approvers; required merge evidence.

Goal: explicit, findable decisions — not a large rulebook.

## Maintenance Rules

- Concise, prescriptive; concrete Desired/Not-desired; repo-relative paths.
- No company names, personal paths, restricted project names, local machine refs.
- Neutralize extracted customer/branch names, line fossils, review breadcrumbs before external publish.
- Update `index.yaml` on add/rename/split/remove; remove obsolete guidance.
- Evolve with product: repeated review issues → small standards updates.
