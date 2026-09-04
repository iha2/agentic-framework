<!--
  TEMPLATE — Stacked Deliverable Specification (spec-builder)
  Copy to: <DOCS_ROOT>/specifications/<slug>.md
  Storage per repo operating model. Replace {{ ... }}; delete this comment when filling.
  No universal stack-size cap — each PR reviewable. Stacked review = SPEC-time choice; MUST NOT retrofit after coding starts.
-->

# {{ Deliverable Name }} — Stacked Deliverable Specification

> Per-branch sequencing/ACs/prompts here; execution state in declared run log/external record.

**Worktree / lane:** `{{ lane-worktree }}`
**Feature:** {{ feature-name-or-N/A }}
**Milestone:** {{ milestone-name-or-N/A }}
**Deliverable(s):** {{ deliverable-name-list }}
**Specification storage:** {{ <DOCS_ROOT>/specifications/<slug>.md; tracked | ignored | mirrored/promoted }}
**Run log:** {{ `<DOCS_ROOT>/execution/<lane-slug>-run-log.md`, board/tracker, or N/A }}
**Execution record sharing:** {{ local ignored | board centralized | external tracker }}
**Execution tracking:** {{ local | board/tracker IDs | Jira | other }}
**Implementation coordination:** {{ lead only | lead + subagents by branch/phase/task }}
**Companion skills:** `gh-stack`; {{ `jira-api` / board skill / guidance / none }}
**Integration branch:** `{{ integration-branch }}` (confirmed with Owner)
**Merge policy:** PR review required for every PR in the stack
**Approved review shape:** bounded stacked review lane
**Decomposition rationale:** {{ why stacked vs one PR / milestone / siblings }}

---

## 0. Stacked-Branch Model

### Why This Is Stacked

{{ Why dependent PRs beat milestone/sibling; name dependency/review boundary. }}

Approved before impl. Shape changes (add/remove/split/collapse/large exception) → halt; revise with Owner sign-off.

### Worktree Topology

One worktree lane for all stack branches — MUST NOT one worktree per branch.

| Branch | Role | Review dependency |
| --- | --- | --- |
| `{{ lower-branch }}` | {{ purpose }} | Base for next PR |
| `{{ upper-branch }}` | {{ purpose }} | Depends on `{{ lower-branch }}` |

### Rebase Rule

Upper rebases upstack until lower lands via human review; then rebase on `origin/{{ integration-branch }}` and verify lower commits drop from upper diff.

`gh stack` MUST be non-interactive: named args to `init`/`add`/`checkout`; `view --json`; `submit --auto` [`--draft`]; `--remote` or `pushDefault`; `rerere.enabled true` before setup.

---

## 1. Required Reading

- `{{ AGENTS.md or orientation }}` — {{ sections }}
- `{{ feature document or N/A }}` — {{ sections }}
- `{{ architecture document or N/A }}` — {{ sections }}
- `{{ standards index and standards }}` — {{ sections }}
- `{{ prior specification or N/A }}` — {{ sections }}

---

## 2. Cross-Branch Contract

{{ Concrete contract lower exposes to upper: symbols, API, schema, data, events, files, or behavior. Load-bearing seam. }}

### Contract Invariants

- **Invariant 1:** {{ invariant }}
- **Invariant 2:** {{ invariant }}

### Contract Change Rule

Upper needs lower-contract change, or any branch needs different review shape → halt; revise with Owner sign-off.

---

## 3. Branch: `{{ lower-branch }}`

### Capability

{{ What the lower branch delivers on its own. }}

### Scope

| Path | New / Modified | Reason |
| --- | --- | --- |
| `{{ path }}` | {{ New / Modified }} | {{ reason }} |

### Acceptance Criteria

- **AC1** — {{ testable criterion }}. Verified by: {{ test/command/evidence }}.
- **AC2** — {{ testable criterion }}. Verified by: {{ test/command/evidence }}.

### Test Strategy

**Value:** prove AC/invariant/contract/edge/regression/risk; compact matrices; reuse existing; MUST NOT pad. **Contract:** intent/data/edges before impl; MUST NOT weaken to pass; material change → Owner + in-place + §9.

- `test_{{ name }}` — verifies {{ AC# / contract / regression }} + edges {{ cases }} asserting {{ observable }}.
- Existing reused: {{ path/name or N/A }} — {{ rationale }}.

### Execution Sequence

1. {{ first failing test or verification entry }}
2. {{ implementation phase }}
3. {{ verification phase }}

---

## 4. Branch: `{{ upper-branch }}`

### Capability

{{ What the upper branch delivers using the lower-branch contract. }}

### Scope

| Path | New / Modified | Reason |
| --- | --- | --- |
| `{{ path }}` | {{ New / Modified }} | {{ reason }} |

### Acceptance Criteria

- **AC1** — {{ testable criterion }}. Verified by: {{ test/command/evidence }}.
- **AC2** — No drift across lower-branch-owned scope. Verified by:
  `git diff origin/{{ lower-branch }}...HEAD -- {{ lower owned paths }}` while stacked,
  and `git diff origin/{{ integration-branch }}...HEAD -- {{ lower owned paths }}` after lower lands.

### Test Strategy

**Value:** prove AC/invariant/contract/edge/regression/risk; compact matrices; reuse existing; MUST NOT pad. **Contract:** intent/data/edges before impl; MUST NOT weaken to pass; material change → Owner + in-place + §9.

- `test_{{ name }}` — verifies {{ AC# / contract / regression }} + edges {{ cases }} asserting {{ observable }}.
- Existing reused: {{ path/name or N/A }} — {{ rationale }}.

### Execution Sequence

1. {{ first failing test or verification entry }}
2. {{ implementation phase }}
3. {{ verification phase }}

---

## 5. Cross-Branch Acceptance Bar

Landed PRs together satisfy every per-branch AC and preserve cross-branch contract. Every stack PR needs human sign-off before merge.

---

## 6. Agent Implementation Rules

- Commit/push stack branches when instructed; MUST NOT merge to `{{ integration-branch }}`.
- Draft PRs first → author-side review → ready for formal review.
- §0 stack shape fixed unless Owner sign-off + in-place SPEC + §9.
- Standards lookup before code; commits scoped per branch ownership.
- Halt: unresolved OQs, repeated test fail, scope drift, missing ref data, contract change.
- Update run log/external after phases/QA when used.
- Tracking: {{ local | board/tracker | Jira | other }}; companion {{ `jira-api` / board skill / guidance / N/A }}.
- Board: progress/notes/locks/evidence via integration; Jira via `jira-api` (no live assume).
- Subagents: lead owns stack/checkouts/serialization/integration/evidence/tracker/PR-ready; subagents return files/commands/evidence/risks/OQs only for delegated slices.
- Single lane; serialize overlapping files — MUST NOT overwrite.

### Delegation Map

| Branch / phase / task | Owner | Allowed scope | Required evidence |
| --- | --- | --- | --- |
| {{ branch/phase/task }} | {{ lead | subagent role }} | {{ paths/boundary }} | {{ tests/checks/output }} |

### Independent QA / Verification Agents

Fresh-context QA for {{ functionality | performance | hygiene | security | a11y | standards | stack no-drift | N/A }}. Read SPEC + run log/tracker + evidence + focused code only. MUST NOT modify code; PASS/FAIL + evidence + rework.

---

## 7. Definition Of Done

- [ ] Required reading completed
- [ ] Open questions resolved
- [ ] Lower-branch ACs verified
- [ ] Upper-branch ACs verified
- [ ] No-drift verification passed
- [ ] Stack shape still matches §0
- [ ] Applicable standards verified
- [ ] Run-log/tracker current per branch/task (incl. subagent outcomes)
- [ ] Draft PRs created; author-side automated review addressed
- [ ] Formal PR review ready
- [ ] Human sign-off for every PR before merge

---

## 8. Implementation Prompt

```text
SPEC: {{ specification path or external record }}
Lane: {{ lane-worktree }}
Integration: {{ integration-branch }}
Run log: {{ path, board/tracker, or N/A }}
Tracking: {{ local | board/tracker | Jira | other }}
Coordination: {{ lead only | lead + subagents }}
Skills: `gh-stack`; {{ `jira-api` / board skill / guidance / none }}

Read SPEC then run log. Confirm §0 stack shape before code — else Owner sign-off + SPEC update.
Non-interactive gh-stack. Draft PRs → author review → ready. MUST NOT merge to integration; human sign-off per PR.

TRACKING: board → status/notes/subagent/locks/evidence; Jira → `jira-api` (no live assume); other → repo workflow; local → run log + PR evidence.

LEAD/SUBAGENTS: single lane. Lead owns stack, checkouts, rebase/upstack, scope, serialization, integration, evidence, tracker, PR-ready. Subagents only §6 slices; return files/commands/evidence/risks/OQs. Serialize overlapping files. No subagents → lead runs phases; log that.

QA: fresh-context for §6 dimensions; read-only; contract changes → Change Log protocol.
```

---

## 9. Implementation And Review Change Log

Contract-changing feedback → update affected sections in place. This section = audit trail; body = current contract.

No changes recorded. Delete this line when adding the first change-log entry.

### {{ YYYY-MM-DD HH:MM TZ }} — {{ Short Change Title }}

**Source.** {{ Owner steering, QA/UAT, PR review, implementation-discovered bug, or other. }}

**Changed Sections.** {{ e.g. [§2 Cross-Branch Contract](#2-cross-branch-contract) }}

**Rationale.** {{ Why needed. }}

**Summary.** {{ Short summary of in-place edits. }}

**Verification Impact.** {{ Stack rebase, no-drift, tests, manual checks, or re-verification. }}

*End of stacked deliverable specification.*
