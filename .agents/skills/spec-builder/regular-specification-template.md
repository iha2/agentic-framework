<!--
  TEMPLATE — Regular / Non-Stacked Deliverable Specification (spec-builder)
  Copy to: <DOCS_ROOT>/specifications/<slug>.md
  Rule: one deliverable = one specification. SPEC = full contract (no separate execution doc).
  Replace {{ ... }}; resolve <!-- TBD: ... -->; delete this comment when filling.
-->

# {{ Deliverable Name }} — Deliverable Specification

**Worktree / branch:** `{{ worktree-name }}`
**Feature:** {{ feature-name }}
**Milestone:** {{ milestone-name-or-N/A }}
**Deliverable:** {{ deliverable-name }}
**Delivery topology:** {{ single-deliverable branch | milestone branch | sibling branch }}
**Review artifact:** {{ one PR for this specification | one milestone PR with sibling specifications | separate sibling PR }}
**Approved review shape:** {{ one PR | milestone PR | sibling PRs | large exception }}
**Decomposition rationale:** {{ why this review shape; alternatives rejected }}
**Integration branch:** `{{ integration-branch }}` (confirmed with Owner)
**Merge policy:** PR review required — agents commit/push feature branches only
**Drafted:** {{ YYYY-MM-DD }}
**Shared run log:** {{ `<DOCS_ROOT>/execution/<slug>-run-log.md`, board/tracker, or N/A }} ({{ section-name }})
**Execution tracking:** {{ local run log | board/tracker IDs | Jira | other }}
**Implementation coordination:** {{ lead only | lead + subagents by phase/task }}
**Companion skills:** {{ `jira-api` / board skill / repo guidance / N/A }}

---

## 0. Capability

{{ One concise paragraph: what this deliverable does. Bounded. Concrete. }}

---

## 1. Required Reading For The Implementor

Section-pinned only. Read this SPEC end to end first.

### 1.a This Specification

Read this specification end to end first.

### 1.b Feature / Milestone Context

- `{{ <DOCS_ROOT>/features/path.md }}` — read {{ section numbers }}.
- `{{ <DOCS_ROOT>/architecture/path.md }}` — read {{ section numbers }}.

### 1.c Prior Specifications In This Delivery Effort

<!-- Same milestone prior SPECs only; else N/A. -->

- `{{ <DOCS_ROOT>/specifications/prior-spec.md }}` — read {{ sections }}.

### 1.d Standards

Per `<DOCS_ROOT>/standards/index.yaml`:

| Standard | What it governs here |
| --- | --- |
| `<DOCS_ROOT>/standards/{{ standard.md }}` | {{ scope }} |

**Before code:** re-run lookup vs §3 file list; missing applicable standard → halt for Owner.

### 1.e Existing Code References

- `{{ path/to/reference.py }}` — {{ pattern to mirror }}.
- `{{ path/to/test_reference.py }}` — {{ test pattern to mirror }}.

### 1.f Project Orientation

- `{{ AGENTS.md / orientation }}` — branch scope, command shape, local verification, safety.

---

## 2. Invariants

Load-bearing; hold verbatim. Restate in PR body when useful.

### INVARIANT 1 — {{ title }}

{{ invariant text }}

### INVARIANT 2 — {{ title }}

{{ invariant text }}

---

## 3. Scope

### Approved Review Shape

Approved for {{ one PR | one milestone PR | sibling PRs | large exception }}. Implementation MUST follow; shape changes → Owner sign-off, in-place SPEC update, §13 entry.

**Rationale.** {{ Why this review unit; name rejected alternatives. }}

**Review units owned by this specification.**

- {{ one PR / milestone slice / sibling PR name }} — {{ purpose, AC boundary, evidence boundary }}

### Strict Scope Constraint

{{ Every file modification lives under ... }} Outside scope → halt for Owner.

### In Scope

| Path | New / Modified | Reason |
| --- | --- | --- |
| `{{ path/to/file.py }}` | {{ New / Modified }} | {{ reason }} |

### Out Of Scope

- {{ out-of-scope item }}
- {{ out-of-scope item }}

---

## 4. Decisions

Each answers "why this over the obvious alternative?"

### D-1 — {{ decision title }}

**Decision.** {{ what was chosen }}

**Why.** {{ rationale, including rejected alternative }}

### D-2 — {{ decision title }}

**Decision.** {{ what was chosen }}

**Why.** {{ rationale, including rejected alternative }}

---

## 5. Agent Implementation Rules

Apply throughout. Spec-specific halts may add; MUST NOT duplicate.

### Team Integration

Commit/push feature branch only. MUST NOT merge to `{{ integration-branch }}` — human PR review.

### Command Working Directory

```bash
cd backend
scripts/withenv ../.env uv run pytest {{ tests/path }} -q
scripts/withenv ../.env just {{ recipe }}
just format
```

### Commit And Push

One coherent green commit after DoD + verifier. Waypoints only at green recovery. MUST NOT commit red tests or half-refactors. Push after complete commit or explicit handoff.

### Scope Verification

Single-SPEC: `git diff {{ integration-branch }} --stat` = §3 (unless Owner-approved §13). Milestone: verify this slice via commits/path list/Owner base — full branch may include sibling SPECs.

### Autonomy Boundaries

**Hard:** §3 scope + review shape; §2 invariants; public contracts/UX: {{ list }}; §1.d standards; §6 ACs; halt below.

**Adaptive:** helpers, syntax, test org, skeletons, internals — when local evidence supports and hard constraints hold. Log deviations. Contract-changing → Owner, in-place SPEC, §13.

### Run Log

{{ path, board/tracker, or N/A }}. Append after OQs, phases, deviations, evidence, QA, rework, load-bearing issues.

### Execution Tracking

{{ local | board/tracker | Jira | other }}

- **Authoritative record:** {{ run log / board IDs / Jira / other }}
- **Required updates:** {{ status, notes, subagent progress, evidence, locks, or N/A }}
- **Companion skill:** {{ `jira-api` / board skill / guidance / N/A }}
- **Fallback:** {{ when tracker unavailable }}

### Lead / Subagent Coordination

{{ lead only | lead + subagents }}. Single named worktree. Lead owns scope, serialization, integration, evidence, run-log/tracker, PR-ready. Subagents: delegated slices only; return evidence + changed files. Serialize overlapping ownership — MUST NOT overwrite.

| Phase / task | Owner | Allowed scope | Required evidence |
| --- | --- | --- | --- |
| {{ phase/task }} | {{ lead | subagent role }} | {{ paths/boundary }} | {{ tests/checks/output }} |

### Independent QA / Verification Agents

Fresh-context QA for {{ functionality | performance | hygiene | security | a11y | standards | N/A }} when available. Read SPEC + run log/tracker + evidence + focused code only. MUST NOT modify code; return PASS/FAIL + evidence + rework.

### Halt Conditions

Stop for Owner if: (1) unresolved §10 OQ before code; (2) same test fails 3×; (3) format/verify fails beyond 2 obvious iterations; (4) file outside §3; (5) need outside strict scope; (6) applicable standard missing from §1.d; (7) reference data/service unavailable; (8) deviation changes scope/contract/ACs/review topology/invariant.

---

## 6. Acceptance Criteria

- **AC1** — {{ title }}. {{ what must be true }}. Verified by: {{ test or command }}.
- **AC2** — {{ title }}. {{ what must be true }}. Verified by: {{ test or command }}.
- **AC3** — Type / lint / formatting clean. Verified by: `{{ command }}`.
- **AC4** — Scope clean. Verified by: {{ `git diff {{ integration-branch }} --stat` or milestone slice inspection }}.

---

## 7. Test Strategy

**Value:** each automated test proves an AC, invariant, public contract, realistic edge, regression, or named risk. Compact matrices; MUST NOT pad — cite existing coverage instead.

**Contract:** intent, reference data, edges, verification layer before impl. Mechanics adaptive; MUST NOT weaken coverage to pass. Material changes → Owner, in-place SPEC, §13.

Reference data:

- {{ source }} — {{ how used }}.

Automated tests:

- `test_{{ name }}` — verifies {{ AC# / invariant / contract / regression }} + edges {{ cases }} asserting {{ observable }}.
- `test_{{ name }}` — verifies {{ AC# / invariant / contract / regression }} + edges {{ cases }} asserting {{ observable }}.

Existing coverage reused:

- {{ path/name or N/A }} — already proves {{ AC# / behavior }}; no new test because {{ rationale }}.

Manual verification:

- {{ check or N/A }}.

---

## 8. TDD Entry Point + Prescriptive Execution Sequence

Derived from §6–§7. MUST NOT change contract by editing only this section — revise ACs/decisions first.

### TDD Entry Point

```python
def test_{{ first_test_name }}() -> None:
    """{{ Why this test exists. }}"""
    ...
```

### Prescriptive Execution Sequence

Follow unless verified safer order; log meaningful deviations.

**Phase 1: {{ phase title }}**

1.1. {{ step }}
1.2. Run: `{{ command }}`. Expect {{ result }}.

**Phase 2: {{ phase title }}**

2.1. {{ step }}
2.2. Run: `{{ command }}`. Expect {{ result }}.

### Skeleton: `{{ path/to/new_file.py }}`

```python
{{ skeleton code }}
```

---

## 9. Definition Of Done

- [ ] §1 reading + standards-index verification done
- [ ] §10 OQs resolved with Owner and logged
- [ ] Scoped tests green: `{{ command }}`
- [ ] Manual verification: {{ command/path or N/A }}
- [ ] `{{ format/check command }}` exits 0
- [ ] Scope = §3 files for this slice
- [ ] PR shape matches §3 approved review shape
- [ ] AC1–ACn verified with evidence
- [ ] Run-log/tracker current (incl. subagent outcomes if used)
- [ ] Verifier sub-agent all-pass
- [ ] PR draft links SPEC + AC verification

---

## 10. Open Questions

Resolve before code; log answers in run log.

- **OQ-1** — {{ question }}

---

## 11. Run Log Protocol

{{ path, board/tracker, or N/A }}

Disk default: `<DOCS_ROOT>/execution/` (usually untracked). Board/Jira/other MAY host shared records — keep stable IDs; live Jira only if repo declares. Append only; MUST NOT rewrite prior entries.

Required sections: Standards Verification; OQ Resolutions; Phase Completions; Deviations; Manual Evidence Locations; QA Findings & Rework; Issues & Recoveries; Verifier Sub-Agent Report.

Session start: (1) read SPEC; (2) read full run log (+ prior SPEC sections on milestone); (3) next phase from latest Phase Completion; (4) resolve OQs; (5) implement.

---

## 12. Agent Implementation Prompt

```text
Worktree: {{ absolute-worktree-path }}
Implement: {{ deliverable-name }}
SPEC: {{ specification path or external record }}
Run log: {{ path, board/tracker, or N/A }}
Tracking: {{ local | board/tracker | Jira | other }}
Coordination: {{ lead only | lead + subagents }}
Companion skills: {{ `jira-api` / board skill / guidance / N/A }}

Read SPEC end-to-end, then full run log (+ prior SPEC/run-log on milestone).

TRACKING: board → status/notes/subagent/locks/evidence via declared skill; Jira → `jira-api` with Owner/repo context (no live assume); other → repo workflow; local → run log + PR evidence.

LEAD/SUBAGENTS: single named worktree. Lead owns scope, serialization, integration, evidence, tracker, PR-ready. Subagents only §5 phases — return files, commands, evidence, risks, OQs; lead reconciles. Serialize overlapping files. No subagents → lead does phases; log that.

QA: fresh-context for §5 dimensions when available; read-only; contract-changing findings → Change Log protocol.

NON-NEGOTIABLE: follow §5; resolve all OQs before code; standards via index.yaml; every AC evidenced.

ORDER: read → OQs → §6/§7 then §8 TDD → confirm §3 review shape → phases → DoD §9 → verifier → PR-ready. MUST NOT merge to `{{ integration-branch }}`.

VERIFIER (after DoD green): fresh agent — "Verify {{ deliverable-name }} in {{ absolute-worktree-path }}. Read SPEC {{ path }} and run log {{ ... }}. Per AC run cited test/command; cross-check run-log deviations/QA vs code; scope command from SPEC. MUST NOT modify code/run log. PASS/FAIL per AC + evidence." Done only on all-pass.
```

---

## 13. Implementation And Review Change Log

Contract-changing feedback → update affected sections in place. This section = audit trail; body = current contract.

No changes recorded. Delete this line when adding the first change-log entry.

### {{ YYYY-MM-DD HH:MM TZ }} — {{ Short Change Title }}

**Source.** {{ Owner steering, QA/UAT, PR review, implementation-discovered bug, or other. }}

**Changed Sections.** {{ e.g. [§6 Acceptance Criteria](#6-acceptance-criteria) }}

**Rationale.** {{ Why needed. }}

**Summary.** {{ Short summary of in-place edits. }}

**Verification Impact.** {{ Tests, manual checks, or re-verification required. }}

---

*End of specification. Implement from this SPEC + run log; no separate execution document.*
