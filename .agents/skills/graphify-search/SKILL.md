---
name: graphify-search
description: >-
  Search, explore, or answer questions about the agentic-framework repo
  (methodology, skills, docs, tooling). Use BEFORE any Grep/Glob/Read-based
  exploration. Prefer the graphify knowledge graph; fall back to raw file reads
  only when the graph cannot answer.
---

# graphify-search

How to look things up in this repo. The order is fixed: **refresh → query graphify → fall back to raw reads only if needed**.

## Automatic refresh on every prompt

A Cursor `beforeSubmitPrompt` hook (`.cursor/hooks/graphify-refresh.sh`) runs
`graphify update .` before each user prompt. That keeps `graphify-out/` current
for code/AST changes at no API cost.

You still must refresh manually when:

- You edited files **mid-session** after the last prompt hook fired
- The hook was skipped / reported failure
- `graphify-out/graph.json` is missing

```bash
graphify update .
```

## Step 1 — Prefer the live graph

Assume the prompt hook already refreshed. If any of the manual-refresh cases
above apply, run `graphify update .` first.

## Step 2 — Ask graphify first (primary, cheap)

Prefer these over reading files:

```bash
graphify query "<natural-language question>"   # broad context (BFS)
graphify query "<question>" --dfs               # trace one path (DFS)
graphify path "<A>" "<B>"                       # how two things connect
graphify explain "<concept or symbol>"          # what a node is + neighbors
```

If `graphify-out/wiki/index.md` exists, navigate it instead of reading raw
files. Use `graphify-out/GRAPH_REPORT.md` for a broad architecture overview.

## Step 3 — Fall back to raw reads ONLY if graphify is insufficient

Use Grep / Glob / Read only when step 2 does not answer the question — nothing
relevant, low confidence, missing node, or you need exact lines to edit/debug.

Scope reads tightly (specific file/symbol), not whole directories.

## Build the graph (first time, or full rebuild)

```
/graphify .
```

Or headless AST refresh:

```bash
graphify update .
```

Corpus scope is controlled by `.graphifyignore`.

## Rules of thumb

- Never start with Grep/Read for "where/how/what connects" questions — start with `graphify query`.
- Trust the prompt hook for freshness; re-run `graphify update .` after mid-session edits.
- Treat raw file reads as the expensive fallback, not the default.
