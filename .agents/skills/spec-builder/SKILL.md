---
name: spec-builder
description: Help a user create, draft, refine, or update the content of a deliverable specification for a bounded feature, component, bug fix, refactor, or milestone slice; use when the user wants to author the specification contract, acceptance criteria, test strategy, review shape, templates, or implementation prompt, not implement the solution. For post-greenlight implementation lifecycle, steering, QA/PR feedback, and change-log protocol, use spec-driven.
---

# Spec Builder Skill

Agent procedure. User guide: `README.md`.

## Operating model

| Rule | Norm |
| --- | --- |
| Mapping | `one deliverable = one deliverable specification` |
| Topology | Worktree/branch/PR MAY hold one deliverable, many, or a single-lane stack |
| Contract | SPEC MUST be complete (intent, decisions, scope, review shape, ACs, tests, sequence, skeletons, halt, DoD, prompt) |
| Execution doc | MUST NOT exist separately |
| Run log | Append-only when needed; repo-declared storage only — MUST NOT invent under `execution/` |
| Shared run log | Milestone/stack SHOULD share one log with per-spec/branch sections |
| Tracker | Board/external tracker = shared execution surface across agents/sessions when Owner uses it |

### Team integration (MUST)

Agents MAY commit/push feature branches when SPEC says so. MUST NEVER merge to integration; SPECs MUST NOT instruct merge. All integration via human PR. Wording: "submit a PR to `{{ integration-branch }}`" / "after the PR lands". Capture integration branch at intake — NEVER assume `dev`/`main`/`master`/`trunk`.

### Bundled methodology

Philosophy changes → read `references/spec-driven-development-methodology.md`. Repo methodology is context only — MUST NOT be a hard dependency. Post-greenlight → `spec-driven`. Stacked commands → `gh-stack` if installed; else bundled summary + Owner flag.

## Required sections (1–14)

Presence load-bearing; numbering not. N/A → state explicitly.

1. **Capability** — one paragraph.
2. **Required reading** — section-pinned citations; NEVER restate verbatim.
3. **Invariants** — load-bearing; restate in PR bodies.
4. **Scope and review shape** — path list, strict directory, out-of-scope, approved shape.
5. **Decisions** — why-over-alternative; typically 3–8.
6. **Agent implementation rules** — integration, commit/push, scope, autonomy, cwd, run-log, halt.
7. **Acceptance criteria** — numbered, testable; each cites verifying evidence.
8. **Test Strategy** — high-signal names/assertions/reference data; MUST precede execution; smallest meaningful set.
9. **TDD entry + Prescriptive Execution Sequence** — first failing test; phase order + non-test skeletons.
10. **Definition of Done** — binary; unchecked → user, not self-marked.
11. **Open Questions** — resolve before code; log in run log.
12. **Run Log Protocol** — pointer, append rules, sections, session-start.
13. **Agent Implementation Prompt** — paste-ready bootstrap.
14. **Implementation And Review Change Log** — final; new SPECs MAY say "No changes recorded."

**Run log inventory:** Standards · OQ Resolutions · Phase Completions · QA/Rework · Deviations · Manual Evidence · Issues · Verifier report. Recovery: fresh agent + SPEC + run log + `git log`.

## Role

Interactive Owner dialogue → deliverable SPEC. MUST NOT produce a separate execution doc. MUST NOT implement product code.

## Delivery topology

Confirm or propose simplest fit. Review shape MUST be set before impl. Wrong mid-flight → stop; Owner + in-place update + change-log — MUST NOT invent split/stack after coding starts.

| Topology | When |
| --- | --- |
| Single-deliverable branch | Default small/medium |
| Milestone branch | Ordered multi-spec, one PR, shared run log |
| Sibling branches | Independent PRs |
| Stacked review lane | Dependent reviews; **one** lane worktree via `gh-stack` |

MUST NEVER model a stack as multiple stacked worktrees. One worktree = one agent lane; one stack = multiple review branches; one branch = one review unit (commits). Flag stacked-for-milestone/sibling once; continue if reaffirmed.

## Startup sequence

1. Confirm topology.
2. Load `regular-branch-workflow.md` + `regular-specification-template.md` **or** `stacked-branch-workflow.md` + `stacked-specification-template.md`.
3. Read methodology reference.
4. Read project orientation if present.
5. Stacked → `gh-stack` or bundled summary + Owner flag.
6. Resolve `DOCS_ROOT` — MUST NOT assume literal `docs/`.
7. Read `<DOCS_ROOT>/standards/index.yaml`; load only matching standards.
8. Resolve docs operating model (tracked/ignored/mirrored/promoted; execution surface).
9. Calibrate against existing specs under `<DOCS_ROOT>/specifications/`.
10. Dialogue: one bounded deliverable/spec at a time; keep shared milestone/stack visible.

## Interaction

Draft → present → redirect → revise. MUST NOT rubber-stamp "finished" SPECs. Short clarifying Qs only when underspecified. Owner wins on contradiction with codebase inference.

## Intake — must-state before near-final

Interview 1–4 at a time; prefer propose-default + confirm. MUST NOT silently guess critical gaps. Before near-final, MUST be able to state:

| Item | Content |
| --- | --- |
| Deliverable boundary | What this SPEC owns |
| Feature/milestone context | Or N/A |
| Topology + review artifact | single / milestone / sibling / stacked + PR shape |
| Decomposition rationale | Why; rejected alternatives |
| Integration branch + merge policy | Confirmed; human PR only |
| Run-log + docs model + tracking | Paths; tracked\|ignored\|mirrored\|promoted; board/Jira/other |
| Coordination | Lead-only or lead+subagents; conflict serialization |
| Scope / contracts / ACs / ref data | In/out; APIs/CLI/schemas; testable outcomes; fixtures |
| Standards + OQs | Via `index.yaml`; blockers |

Unknown → interview or Open Questions. MUST NOT write an impl prompt that invites coding while unresolved.

## Repo conventions (MUST)

| Concern | Rule |
| --- | --- |
| Integration worktree | Read-only except sync |
| Spec location | `<DOCS_ROOT>/specifications/{slug}.md` unless policy differs |
| External specs | Declared surface + stable ID |
| Run log | Declared surface; prefer `<DOCS_ROOT>/execution/` on disk |
| Stacked lane | One worktree + `gh-stack` |
| Standards | Gated by `index.yaml`; prescribe; implementor re-verifies |
| Branch scope | Diff vs `{{ integration-branch }}` |
| Review shape | Before impl; change needs Owner + update + change-log |
| No direct merges | Commit/push OK; human PR only |
| Manual evidence | Durable paths — MUST NEVER rely on `/tmp/` for surviving evidence |

## Content rules

**ACs:** TDD-grade — enough to write a test without re-asking. Reject vague. Prefer status codes, fixture equality, named cases.

**Reference data:** MUST name source (legacy baseline · synthetic/Owner golden · cite locked fixtures).

**Test strategy:** Contract not quota. Implementers MAY adapt names/helpers; MUST NOT weaken/delete/move coverage without Owner + update + change-log. Each test: which AC/risk? meaningful fail? already covered? observable boundary? proportional setup? Prefer integrated contracts, matrices, focused regressions, existing fixtures. Avoid mock-only calls, duplicate happy-paths, opaque snapshots, private-call coupling, padding. Note intentional omissions. Low-signal tests found by QA → SPEC quality issue → Owner + update + change-log.

**Order (MUST):** Capability → ACs → edges → compact tests → TDD entry → execution. MUST NOT write execution first and retrofit ACs.

**Skeletons:** Starting shapes; load-bearing on signatures/fields/errors; bodies MAY adapt.

**Autonomy:** Label **Hard** (scope, contracts, invariants, standards, ACs, halt, data-safety, compatibility) vs **Adaptive** (bodies, helpers, test org) vs **Discovery budget**. Contract-changing deviations need Owner + update + change-log.

**Agent rules section:** Centralize integration, commit/push (one green commit default; waypoint only at green recovery; push on completion/handoff), scope verify, cwd, run-log, tracking/companions, lead/subagent, serialization, fresh QA, hard vs adaptive, halt. Prompt SHOULD point here — MUST NOT re-copy every rule.

**Halt (minimum):** (1) unresolved OQ before code; (2) same test fails 3×; (3) format fails beyond 2 obvious iterations; (4) out-of-scope file in diff; (5) need outside strict directory; (6) unprescribed applicable standard; (7) named reference data unavailable.

**DoD (binary):** Reading + standards · OQs resolved · scoped tests green · manual evidence · format 0 · diff matches Scope · ACs verified · run-log current · verifier all-pass · PR links SPEC/tracker + AC evidence.

**Prompt:** Immediately before Change Log. MUST name worktree + SPEC; run-log; tracking + companions; prior specs; lead/subagent model; fresh QA; non-negotiables; order; verifier verbatim; deliverable. Tracking MUST be conditional — MUST NOT imply live Jira without real integration.

**Change Log:** Final. After greenlight, accepted contract changes update body in place; entry = timestamp, source, sections, rationale, verification impact. Body = current contract; log = audit only.

**Diagram:** Mermaid recommended for multi-actor; **required** for stacked lower→upper contracts; skip trivial one-liners.

**Decisions:** MUST answer why-over-alternative. Keep OUT: status fields; verbatim standards; speculative futures; execution state (→ run log).

## Quality bar

Bounded scope + non-goals + strict directory · TDD ACs + named ref data · high-signal tests · decisions with alternatives · sequence + skeletons · ACs before execution · review shape before execution · centralized rules · tracking + lead/subagent + QA · halt + binary DoD · paste-ready prompt · section-cited reading · prescribed standards · stacked: concrete seam · ownership · diagram when appropriate.

## Stacked mode

**Use:** internal review boundaries; lower contract before upper; related deliverables as focused stack. **MUST NOT:** whole milestone → one PR (use milestone); independents → siblings; parallelism alone. Stack MUST be approved in SPEC before impl.

**Runtime:** Ordered reviews; continuous rebases (`gh stack rebase --upstack`); manual branch ownership (`git add -p`); upstack on mid-flight lower shifts. SPEC MUST describe lower→upper seam.

**Pre-present:** concrete seam symbols · per-branch ACs · real `git diff` paths · decisions with alternatives.
