---
name: pr-builder
description: Help an agent create, draft, refine, or update a pull request title and body from the current changes and verification evidence, with draft PR creation as the default methodology workflow.
---

# PR Builder

Draft-first PR title/body from diff + verification. Packages for `pr-review`/humans. MUST NOT approve, mark ready for Owner, or merge. Governance: `docs/methodology/invariants.md`, `docs/agent-execution-discipline.md`, `docs/methodology/pr-creation.md`. This drafts; `pr-review` inspects code.

## Startup

1. `AGENTS.md` + PR templates/conventions. 2. Primary tracker (deliverable/Jira/Avaza/other). 3. Governing links (work item; SPEC/bug-fix/external; feature/proposal if material). 4. Diff, commits, verification. 5. Single vs GH-stack (position/parent/dependents). 6. Separate facts vs assumptions. 7. Missing critical governor → short ask before finalize. 8. Draft default.

## Mission

Explain: governor/SPEC; what/why; verification; ACs auto vs manual; automated test pass state; why draft (or ready if Owner said); risks; stack map.

## Required inputs

Diff; commits; work-item ID/link; SPEC/tracker when methodology; ACs/scenarios; test commands+results; manual steps; domain checks when relevant; stack map; risks/migrations/flags/rollout. Derive from repo when possible. MUST NOT invent verification. Missing authoritative ID → ask.

## Draft handling

Draft = default until Owner/user says ready. State draft near top; title marker only if repo expects; list blockers; author-side checklist. Ready only when Owner said so. Skill may list gaps; MUST NOT convert draft→ready alone.

## Tracking / clarification

Detect via `AGENTS.md` + path/key conventions; prefer declared system; lead with primary work item. Ask minimal missing fact (ID/URL, which SPEC, manual steps) — MUST NOT broad open-ended or invent ticket IDs from branch unless `AGENTS.md` authorizes. Can't answer → neutral draft + mark field; MUST NOT invent.

## Workflow

1. Template: `.github/pull_request_template.md` | `PULL_REQUEST_TEMPLATE.md` | dirs | fallback `.agents/skills/pr-builder/PR-TEMPLATE.md`.  
2. Tracker + top links. 3. Ask missing ID. 4. Read diff for behavior. 5. SPEC/`qa-testing`/ticket when present. 6. Structure: context/links; why; functional summary; draft status+author checklist (or ready); stack map; reviewer notes; AC checklist; verification; manual/UAT↔ACs; domain checks if material; risks/rollout. 7. Concise title+body matching template.

## Template precedence

Repo `.github/` first (preserve headings/order/tone; fold skill value inside). Else skill `PR-TEMPLATE.md`. Extra section only if critical context has no home.

## Content rules

- Authoritative links first; one primary + needed supporting.
- Shipped behavior + review scope — not play-by-play/file inventory.
- Hotspots only when review/risk-relevant; scope = change under review.
- Omit inapplicable sections; no generic follow-ups unless affecting review/merge/draft.
- Only tests actually run; map ACs auto vs manual.
- Call out schema/migrations/flags/ops risk.
- Reviewer notes: checklist; what to inspect/test; SPEC AC validation; tests+pass; standards already checked; remaining manual/UAT; domain if needed; scope boundary.
- MUST NOT imply agent PR content replaces Owner approval/merge or ready unless Owner said so.
- Stacked: compact stack map + lower/middle/upper.

## Preferred structure (no stronger template)

1 Context 2 Why 3 Functional overview 4 Draft status + author checklist 5 Stack map 6 Reviewer notes 7 Verification 8 Risks/rollout 9 Demo

## Reviewer notes

Specific enough to validate ACs without reverse-engineering. Prefer checklist. Include: SPEC AC/scenario list; setup/steps/expected; flags/data/env; automated coverage+pass; test-quality prompt; standards checked; remaining manual/UAT; domain if material; focus checklist (SPEC, meaningful tests, scope, maintainability). Compress `qa-testing` evidence; group ACs when auto coverage solid.

## Title

Outcome not mechanism. Ticket prefix only if convention. Draft marker only if expected. Prefer `Add role management UI for RBAC milestone 2`; avoid `Updates` / `Fix stuff`.

## Quality bar

Reviewer can answer: governor/SPEC? why? functional change? how to validate ACs? draft→ready gaps? stack/deps? review focus? in-scope risks/rollout?
