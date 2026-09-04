# Cache-Augmented Generation for Standards-Driven Agentic Development

Date: 2026-05-23  
Status: revised decision document  

Compressed 2026-09 for token reduction; full prior text (and earlier research archive) in Git history before this change. Extended research corpus was already removed 2026-08-22.

## Decision

**Vertex AI Gemini `cachedContents` is the cleanest documented hosted named-cache option** for standards/spec CAG: create/list/get/update/delete lifecycle with TTL and metadata.

Cursor, Codex/OpenAI, Anthropic, Z.AI/GLM, and local runtimes have useful cache-related capabilities, but they do **not** provide an equivalent named document-cache control plane for standards/spec profiles.

## Conclusions (MUST / SHOULD)

| Conclusion | Level |
| --- | --- |
| Cursor has no documented user-facing named model-cache API; context selection (`AGENTS.md`, rules, `@file`, index) is not CAG | MUST treat as fact |
| Cursor cannot inject a Vertex `cachedContent` handle into its own model calls | MUST |
| OpenAI/Codex/Anthropic/Z.AI prompt or automatic caching ≠ named standards/spec cache lifecycle | SHOULD |
| Prefer Vertex AI (GCP project, IAM, region, audit) over a personal Gemini API key for enterprise CAG | SHOULD |
| Day-1: Cursor context hygiene (short `AGENTS.md`, scoped rules, standards as separate docs, deterministic context packs) | MUST for immediate gain |
| Day-N: Vertex CAG **sidecar** for plan/review/ask; Cursor remains the edit IDE | SHOULD for standards-heavy reasoning |
| Full custom harness that calls Vertex on every turn only if sidecar proves cost/latency wins | SHOULD gate on measurement |
| `zazz-*` / `.zazz/` identifiers in historical notes describe an external harness experiment, not this repo’s required layout | MUST |

## Capability snapshot

| Option | Named cache lifecycle |
| --- | --- |
| Cursor / Codex / OpenAI API / Anthropic / Z.AI | No (or not documented) |
| Vertex Gemini `cachedContents` | Yes |
| Local vLLM/SGLang | Runtime prefix/KV only |

## Recommended next step

Build the smallest Vertex sidecar (context profile → warm cache → plan/review/ask), compare Cursor alone vs context pack vs sidecar, measure cached tokens/latency/cost/quality. Expand to a full harness only if the sidecar wins.
