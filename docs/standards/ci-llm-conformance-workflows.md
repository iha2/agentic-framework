---
last_updated_at: 2026-05-25
---

# CI LLM and conformance workflows

Governs LLM-invoking GitHub Actions workflows and incremental conformance automation.

## LLM-invoking workflows — workflow-scoped API keys

Each LLM workflow consumes its own dedicated API key secret. Shared keys destroy per-workflow cost attribution, prevent anomaly detection, and broaden leak blast radius. New workflow: provision fresh key and set secret **before** merge — MUST NOT reuse another workflow's key "temporarily."

Secret names follow workflow-scoped convention — `api_key: ${{ secrets.<NAME> }}` identifies usage bucket from name alone.

### Desired ✅

```yaml
# conformance.yml
- uses: llm-provider/example-action@v1
  with:
    llm_api_key: ${{ secrets.LLM_API_KEY_CONFORMANCE_WORKFLOW }}

# reviewer.yml
- uses: llm-provider/example-action@v1
  with:
    llm_api_key: ${{ secrets.LLM_API_KEY_REVIEWER }}
```

### Not desired ❌

```yaml
- uses: llm-provider/example-action@v1
  with:
    llm_api_key: ${{ secrets.SHARED_LLM_API_KEY }}  # wrong: hides spend, broadens blast radius
```

Pairing: `conformance.yml` → `LLM_API_KEY_CONFORMANCE_WORKFLOW`; `reviewer.yml` → `LLM_API_KEY_REVIEWER` (conformance.yml:40; reviewer.yml:51).

## LLM-invoking workflows — "settings first, then prompt" layout

LLM workflows have larger blast radius (write access, secrets, auto-PR). YAML MUST answer triggers, privileges, inputs without scrolling past prompt. Configuration (inputs, permissions, action parameters) **above** prompt block; prompt **last**.

Fixed-set inputs: `choice` type, not free `string`. Enable `display_report: true` so run summary surfaces LLM actions without raw-log digging.

### Desired ✅

```yaml
name: Conformance
on:
  workflow_dispatch:
    inputs:
      guide-path:
        type: choice
        options: [backend/docs/http-layer-guide.md, ...]
      file:
        required: false
        type: string
jobs:
  conform:
    permissions:
      contents: write
      pull-requests: write
      id-token: write
    steps:
      - uses: actions/checkout@v6
      - uses: llm-provider/example-action@v1
        with:
          llm_api_key: ${{ secrets.LLM_API_KEY_CONFORMANCE_WORKFLOW }}
          display_report: true
          prompt: |-
            <prompt content here, LAST>
```

### Not desired ❌

```yaml
steps:
  - uses: llm-provider/example-action@v1
    with:
      prompt: | ...
  - name: configure
    ...
```

Reference layout: `conformance.yml` — `name:` → `on:` + typed `inputs:` → `jobs` + `permissions:` → setup → action with `display_report: true`, `prompt:` last.

## Incremental conformance — `/conformance` skill + workflow

Prescriptive standards deliver value only when codebase conforms incrementally. Bulk rewrite is unreviewable; one small isolated change per invocation is tractable. Mechanism: `.agents/skills/conformance/` + `.github/workflows/conformance.yml`.

Skill: guide path → ONE small topically isolated change. Does NOT commit — commit blurb in temp file. `--auto` skips interactive selection for agents/CI.

```text
/conformance <guide>           # interactive
/conformance <guide> --auto    # agent / CI
/conformance <guide> --file <target>
```

CI: `workflow_dispatch` with `choice` `guide-path`, optional `file`. Permissions `contents: write`, `pull-requests: write`, `id-token: write`. Prompt: list open `conformance`-labeled PRs, skip covered candidates, run `/conformance ... --auto`, open PR on `conformance/<short-kebab-description>`, title `[BE] Conformance: ...` (conformance.yml; review precedent).

### Desired ✅

```yaml
on:
  workflow_dispatch:
    inputs:
      guide-path:
        type: choice
        options: [backend/docs/http-layer-guide.md, ...]
steps:
  - uses: llm-provider/example-action@v1
    with:
      llm_api_key: ${{ secrets.LLM_API_KEY_CONFORMANCE_WORKFLOW }}
      display_report: true
      prompt: |-
        gh pr list --label conformance --state open ...
        /conformance ${{ inputs.guide-path }} --auto ...
        Create PR: branch conformance/<short-kebab>, label conformance
```

New guide under `docs/standards/` or `backend/docs/`: add to `guide-path` enum in `conformance.yml`.

### Coordinating concurrent conformance runs

Prompt first step: enumerate open `conformance` PRs; skip files already addressed. All candidates covered → stop, report no new change needed (conformance.yml prompt block).

Resulting PRs: title `[BE] Conformance: <file path + guide>`; body `## WHY`, `## WHAT`, `**File updated**:`, `## Note` linking Actions run (conformance.yml prompt block).
