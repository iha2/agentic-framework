# PR Builder — User Guide

Draft-first PR title/body for human-in-the-loop review. Does **not** review code, approve, merge, or mark ready for the Owner.

## Produces

Title · concise body · governing context (deliverable/ticket/SPEC/tracker) near top · verification summary · AC-tied reviewer checklist · auto vs manual split · UAT when warranted · domain checks only when material · **draft by default** (ready language only on Owner confirm) · stack map for GH-stack · risks/rollout only when review-relevant.

## When

Open/refresh draft PR · author/reviewer package · `qa-testing` evidence → PR text · repo templates · functional summary over file inventory.

## Have ready

Diff/branch · commits · work-item ID · governing SPEC/tracker · test results · manual notes · domain verification if material.

## Example prompts

```text
Use pr-builder. Draft PR title/body from current branch with testing and manual notes.
```

```text
Use pr-builder. Prepare draft PR from diff, SPEC, stack context, and test evidence.
```

```text
Use pr-builder. Fill the repo PR template accurately from repository state.
```

## Output bar

Governing context first · why/what functionally · draft status + remaining · stack map when stacked · reviewer checklist + AC validation · automated suite status + “are tests meaningful?” · standards already checked · manual/UAT still needed · scope/code-quality reminder. No invented verification.

## Governing context

Inspect `AGENTS.md`, repo PR templates, deliverable/branch/ticket refs. Ask for authoritative ID/URL if missing — MUST NOT guess Jira/Avaza keys from branch names.

When clear: primary link first; SPEC/tracker links when part of review contract; extras only if material.

## Template

Prefer repo-native (`.github/pull_request_template.md` / `PULL_REQUEST_TEMPLATE.md` / dir variants): preserve headings; weave PR Builder fields in. Else [`PR-TEMPLATE.md`](./PR-TEMPLATE.md). Teams MAY copy that file to `.github/`.

Fallback focuses on why · functional what · draft/ready gate · stack · AC validation · auto vs manual · UAT · domain checks · scope/quality. Omit irrelevant optional sections; no file-by-file inventory or out-of-scope backlog.

## Notes

No invented tests · SPEC/tracker as AC source · avoid re-asking humans to redo well-covered automation · final ready/approve/merge remain human.
