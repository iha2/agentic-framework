---
name: standard-builder
description: Help a user create, draft, refine, or update engineering standards by inspecting an existing codebase for stack-specific patterns, architecture boundaries, tests, mocking, API behavior, service design, and review evidence; use when the user asks to infer standards from a repo, codify existing team patterns, tailor the methodology standards library to an organization, split standards by domain, or draft standards such as TypeScript Express microservice patterns, API testing and mocking, unit/integration testing, frontend conventions, data access, CI, deployment, or observability.
---

# Standards Builder

Turn codebase practice into reviewable standards for the Agentic Engineering Framework. Output: a draft standard or small decomposed set for human review and adoption.

## Core Rule

Infer from evidence, not vibes. Inspect representative files, tests, config, docs, and recent diffs. Separate:

- **Observed pattern**: what the codebase consistently does.
- **Recommended standard**: what the team should make normative.
- **Open question**: needs human confirmation (inconsistent, risky, or ambiguous).

Do not elevate every habit. Prefer patterns that improve clarity, reviewability, testability, security, reliability, or agent execution.

## Intake

1. Identify repo/service/package/bounded area.
2. Identify standard type (microservice design, unit/integration/API testing & mocking, errors, data access, CI, deploy, logging, frontend, etc.).
3. Infer stack/architecture from code, config, and docs — do not assume.
4. If broad, propose a decomposed set instead of one giant doc.

Example (TypeScript Express microservice):

- `microservice-structure.md` — layout, boundaries, config, DI
- `microservice-api.md` — routes, validation, envelopes, errors, auth
- `microservice-testing-unit.md` — boundaries, builders, mocks, assertions
- `microservice-testing-api.md` — API tests, clients, mocking, error paths
- `microservice-observability.md` — logging keys, correlation IDs, metrics, health

## Evidence Collection

Use `rg` and repo-native tools. Collect enough to prove the pattern; do not read the whole repo by default.

Look for: docs (`README`, `AGENTS.md`, `docs/`, ADRs); package/config (`package.json`, `tsconfig`, eslint, vitest/jest/playwright, docker, CI); source layout (services, routes, middleware, clients, repos, workers); tests (unit/integration/API/contract, fixtures, mocks, builders, snapshots); runtime seams (env, logging, DI, auth, DB, queues, outbound HTTP); review evidence (PR templates, CI checks, test commands, coverage/smoke expectations).

Cite repo-relative paths and concise identifiers. Avoid personal paths, machine details, restricted names, and line-number fossils (e.g. `services/billing/src/routes/invoices.ts`).

## Pattern Analysis

For each candidate rule:

1. **Evidence**: 2–5 repo-relative examples
2. **Consistency**: consistent, emerging, mixed, or one-off
3. **Purpose**: why it matters for implementation, tests, review, or ops
4. **Blast radius**: paths and activities
5. **Counterexamples**: legacy, exceptions, or unresolved
6. **Review evidence**: what a PR must prove
7. **Halt condition**: when an agent must stop and ask

Promote only when purpose is clear and evidence is strong. If mixed, write an open question or migration note.

## Standard Shape

Agent-usable drafts:

- title + short scope
- stack-specific baseline note when assumptions apply
- `applies_to` guidance for `docs/standards/index.yaml`
- prescriptive rules with desired / not-desired examples
- halt conditions
- required review evidence
- related standards

Decompose by work context — unit-testing standards must not also carry route design, deploy, and logging unless inseparable.

## Drafting Rules

- Keep useful specificity; neutralize private names with repo-relative examples.
- Label stack-specific guidance as a replaceable baseline.
- Use RFC-2119 (`MUST`, `MUST NOT`, `SHOULD`) when the repo's docs style does.
- Include desired/not-desired examples that clarify behavior.
- Verification commands only when repo-native and discovered.
- Update index entries when creating or splitting standards.
- For public/shared standards, run a sensitive-reference scan before finishing.

## Halt Conditions

Stop and ask when:

- two incompatible patterns and no docs name the intended direction
- the standard would require broad migration or deprecating live behavior
- security, privacy, compliance, a11y, or production deploy policy lacks org guidance
- examples contain restricted names that cannot be safely neutralized
- tests/CI evidence cannot be identified for a proposed requirement

## Output

Return: standards drafted/updated (repo-relative paths); evidence inspected by path/area; open questions; `index.yaml` updates needed/applied; verification and sensitive-reference scans.

For a first draft, create the smallest useful standard or decomposed set — do not over-edit unrelated standards.
