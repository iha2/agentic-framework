# Graphify Guide — complete reference

Complete reference for using [Graphify](https://github.com/safishamsi/graphify) with consumer repos in the **Agentic SDLC** program. The canonical adoption path is documented in this framework; **global-services** is the reference implementation.

**Related docs (this framework):**

- [README.md](./README.md) — adoption entry point
- [new-computer-setup.md](./new-computer-setup.md) — **start here** for new computer + new user (install, HTML, stats)
- [tooling/graphify-setup-kit/](../../tooling/graphify-setup-kit/README.md) — portable package + `install.sh` / `install.ps1`
- [agent-setup-prompt.md](./agent-setup-prompt.md) — copy-paste agent prompt

---

## Table of contents

1. [New user quickstart](#new-user-quickstart)
2. [What Graphify does](#what-graphify-does)
3. [How it fits global-services](#how-it-fits-global-services)
4. [Setup kit (recommended)](#setup-kit-recommended)
5. [File locations](#file-locations)
6. [Scan scope](#scan-scope)
7. [Installation (summary)](#installation-summary)
8. [Building and updating the graph](#building-and-updating-the-graph)
9. [Querying the graph](#querying-the-graph)
10. [Agent workflow (Cursor)](#agent-workflow-cursor)
11. [Reports, HTML, and statistics](#reports-html-and-statistics)
12. [Token savings and benchmarks](#token-savings-and-benchmarks)
13. [Maintenance checklist](#maintenance-checklist)
14. [Troubleshooting](#troubleshooting)
15. [Graphify vs CodeGraph](#graphify-vs-codegraph)
16. [CLI quick reference](#cli-quick-reference)

---

## New user quickstart

**Never used Graphify?** Follow this 10-minute path:

1. **Install** — [new-computer-setup.md](./new-computer-setup.md) Part 3 (setup kit)
2. **Verify** — `graphify query "places proxy cache"` returns nodes
3. **Read** — open `graphify-out/GRAPH_REPORT.md` (summary + suggested questions)
4. **Stats** — `graphify benchmark graphify-out/graph.json`
5. **HTML** — `graphify tree` then open `graphify-out/GRAPH_TREE.html` in browser
6. **Daily** — after `git pull`: `graphify update .`; before exploring: `graphify query "..."`

**New computer?** Copy `graphify-setup-kit/` to the machine, run `install.sh` or `install.ps1` with `-Optional -Build -Verify`.

---

## What Graphify does

Graphify parses source files with **tree-sitter** (AST extraction) and optionally uses an LLM for docs, images, and community labeling. It stores the result as a **persistent knowledge graph** (`graph.json`) you can query weeks later without re-reading the whole repo.

Each edge is tagged:

| Tag | Meaning |
|---|---|
| `EXTRACTED` | Found directly in source (imports, calls, contains, etc.) |
| `INFERRED` | Model-reasoned connection — verify before trusting |
| `AMBIGUOUS` | Low-confidence inference |

**Primary benefit:** agents get a small subgraph (symbols, file paths, line numbers, call edges) instead of reading hundreds of files or running many grep passes.

---

## How it fits global-services

This monorepo uses Graphify for the **product-id program** surfaces only:

| Path | Included |
|---|---|
| `services/ocr/` | Yes |
| `services/places-proxy/` | Yes |
| `services/product-id/` | Yes |
| `web/` (product-id-ops, etc.) | Yes |
| GPR, organization-manager, `@gls/*` packages | No (out of scope) |

The repo root remains the scan root so `graphify-out/` stays at the monorepo root and Cursor rules work from a single checkout.

**Design choice:** Graphify artifacts are **gitignored**. Each developer builds their own graph locally. Consumer repos keep a minimal pointer doc (e.g. `docs/misc/graphify-local.md`). Full docs and the setup kit live in **agentic-sdlc-framework** (`docs/graphify/`, `tooling/graphify-setup-kit/`) or are vendored to `~/Documents/Projects/graphify-setup-kit/`.

---

## Setup kit (recommended)

Portable package for new machines — no manual scp, no Git conflicts:

```
tooling/graphify-setup-kit/   # in agentic-sdlc-framework (or vendored copy)
├── install.sh                          # macOS / Linux
├── install.ps1                         # Windows PowerShell
├── install.cmd                         # Windows CMD launcher
├── required/                           # .graphifyignore, .cursor/rules/graphify.mdc
├── optional/scripts/                   # graphify-savings-report.cjs
└── docs/                               # Bundled guide copies
```

```bash
# macOS / Linux — from framework checkout or vendored kit
uv tool install graphifyy
cd /path/to/agentic-sdlc-framework/tooling/graphify-setup-kit
chmod +x install.sh
./install.sh --optional --build --verify ../global-services
```

```powershell
# Windows
pip install graphifyy
cd $env:USERPROFILE\Documents\Projects\graphify-setup-kit
.\install.ps1 -Optional -Build -Verify ..\global-services
```

| Flag | Purpose |
|---|---|
| `--optional` | Copy savings report script |
| `--build` | Run `graphify update .` |
| `--verify` | Sample query + benchmark |
| `--docs` | Copy reference docs to `private/graphify-docs/` |
| `--force` | Overwrite existing config |
| `--dry-run` | Preview without writing |

See [tooling/graphify-setup-kit/MANIFEST.md](../../tooling/graphify-setup-kit/MANIFEST.md) for required vs optional files.

---

## File locations

### Inside the repo (local, gitignored)

```
global-services/
├── graphify-out/                    # Built graph (main output)
│   ├── graph.json                   # Knowledge graph (~10 MB)
│   ├── GRAPH_REPORT.md              # Architecture report
│   ├── manifest.json                # Indexed file manifest
│   ├── cache/                       # Incremental update cache
│   ├── global-services-callflow.html
│   └── GRAPH_TREE.html              # Optional tree viz
├── .graphifyignore                  # Scan scope rules
├── .cursor/rules/graphify.mdc       # Cursor agent rule
├── reports/graphify/                # Savings benchmark history
│   ├── history.ndjson
│   ├── latest-report.md
│   └── latest-report.html
└── scripts/graphify-savings-report.cjs  # Optional savings helper
```

### On your machine (upstream install)

| Location | Purpose |
|---|---|
| `graphify` CLI (via `uv tool` / `pipx`) | `query`, `path`, `explain`, `update`, `benchmark`, etc. |
| `~/.claude/skills/graphify/` (if installed) | Claude Code skill |

### Outside the repo (personal / portable)

| Path | Purpose |
|---|---|
| `~/Documents/Projects/graphify-setup-kit/` or framework `tooling/graphify-setup-kit/` | Portable install package |
| `docs/graphify/guide.md` (this framework) | This document |
| `docs/graphify/new-computer-setup.md` | New machine setup |
| `docs/graphify/agent-setup-prompt.md` | Agent prompt |

### Committed in Git

| Path | Purpose |
|---|---|
| `docs/misc/graphify-local.md` | Short pointer — gitignored paths + setup kit quick start |

---

## Scan scope

The `.graphifyignore` file at the repo root limits indexing. When present, Graphify uses it instead of `.gitignore` for the scan root.

**Allowed trees:**

- `services/ocr/`
- `services/places-proxy/`
- `services/product-id/`
- `web/` (entire tree)

**Always excluded:** `node_modules/`, `dist/`, `build/`, `.next/`, `coverage/`, `.env*`, `graphify-out/`, etc.

To change scope, edit `.graphifyignore` and run `graphify update .`.

---

## Installation (summary)

**Recommended:** [tooling/graphify-setup-kit](../../tooling/graphify-setup-kit/README.md) — `./install.sh --optional --build --verify ../global-services`

**Manual:** [new-computer-setup.md](./new-computer-setup.md)

```bash
# 1. Install CLI (Python 3.10+)
uv tool install graphifyy

# 2. Deploy config (setup kit)
cd ~/Documents/Projects/graphify-setup-kit
./install.sh -o -b -v ../global-services

# Or manually: copy .graphifyignore + .cursor/rules/graphify.mdc, then:
cd ~/Documents/Projects/global-services
graphify update .
```

> PyPI package is temporarily named **`graphifyy`**; the CLI command is still `graphify`.

---

## Building and updating the graph

### Initial build

```bash
cd global-services
graphify update .
```

Creates `graphify-out/graph.json`, `GRAPH_REPORT.md`, and `cache/`.

### After code changes

```bash
graphify update .
```

Code-only updates are **AST-only — no LLM API cost**. Only changed files are re-extracted (SHA256 cache).

### Force rebuild (after large deletions)

```bash
graphify update . --force
# or: GRAPHIFY_FORCE=1 graphify update .
```

### Check if graph is stale

```bash
git rev-parse HEAD
# Compare to "Built from commit" in graphify-out/GRAPH_REPORT.md
```

### Optional: auto-sync

```bash
# Background file watcher
graphify watch .

# Rebuild on every git commit
graphify hook install
```

---

## Querying the graph

Run from repo root. Default graph path: `graphify-out/graph.json`.

### `query` — explore by question

Breadth-first traversal from seed nodes matching your question.

```bash
graphify query "how does product-id enqueue OCR jobs"
graphify query "places proxy cache aside" --budget 1500
graphify query "GPI catalog ingest" --dfs
```

**Output:** nodes (symbol, file path, line, community) and edges with relation + provenance.

### `path` — dependency between two symbols

```bash
graphify path "retryOrEnqueueOcrJob" "process_scan"
graphify path "placesClientMiddleware" "GooglePlacesClient"
```

Use specific symbol names; vague terms like `"product-id"` may be ambiguous.

### `explain` — neighborhood of a concept

```bash
graphify explain "placesClientMiddleware"
graphify explain "GpiIngestTriggerRequest"
```

### `affected` — blast radius (reverse traversal)

```bash
graphify affected "resolveApiKey" --depth 3
graphify affected "process_scan" --relation calls
```

---

## Agent workflow (Cursor)

The file `.cursor/rules/graphify.mdc` enforces this workflow for Cursor agents:

1. **Before** `Read`, `Grep`, `Glob`, or shell exploration → run `graphify query`, `path`, or `explain`.
2. Use graph output to identify **which files and lines** to open.
3. After code edits → `graphify update .` to refresh the graph.

**Exceptions** — use Read/Grep directly only when:

- Graphify has already oriented you and you need specific lines, or
- `graphify-out/graph.json` does not exist yet (run `graphify update .` first).

**Navigation aids:**

- `graphify-out/wiki/index.md` — if built with `--wiki`
- `graphify-out/GRAPH_REPORT.md` — broad architecture review, community hubs, suggested questions

---

## Reports, HTML, and statistics

All report outputs are **local and gitignored**. See [new-computer-setup.md § Part 6](./new-computer-setup.md#part-6--reports-statistics--html-complete-guide) for the full new-user walkthrough.

### Output inventory

| Output | How to generate | Open with |
|---|---|---|
| `graphify-out/GRAPH_REPORT.md` | Auto on `graphify update .` | Editor |
| `graphify-out/graph.json` | Auto on `graphify update .` | `graphify query` (not hand-edited) |
| Terminal benchmark | `graphify benchmark graphify-out/graph.json` | Terminal |
| `reports/graphify/latest-report.md` | `node scripts/graphify-savings-report.cjs` | Editor |
| `reports/graphify/latest-report.html` | Same script | Browser (`open` / `start`) |
| `reports/graphify/history.ndjson` | Same script (appended) | Editor / scripts |
| `graphify-out/graph.html` | `GRAPHIFY_VIZ_NODE_LIMIT=12000 graphify cluster-only . --no-label` | Browser |
| `graphify-out/GRAPH_TREE.html` | `graphify tree` | Browser |
| `graphify-out/global-services-callflow.html` | `graphify export callflow-html` | Browser |

### GRAPH_REPORT.md — what to read

| Section | Purpose |
|---|---|
| Corpus Check | Files/words indexed — confirms scope is large enough |
| Summary | Nodes, edges, EXTRACTED vs INFERRED breakdown |
| Graph Freshness | Built commit — compare to `git rev-parse HEAD` |
| Community Hubs | Clustered code areas — navigation entry points |
| Suggested Questions | High-value questions this graph can answer |
| Knowledge Gaps | Isolated nodes, thin communities |

### Token benchmark (quick stats)

```bash
graphify benchmark graphify-out/graph.json
```

Prints corpus size, node/edge counts, avg query tokens, and **reduction ratio** (e.g. 80.7x).

### Savings report (history + HTML)

Requires `scripts/graphify-savings-report.cjs` (from setup kit `--optional`):

```bash
node scripts/graphify-savings-report.cjs
# Optional pricing: GRAPHIFY_PRICE_INPUT_PER_MTOK=3
```

Writes `latest-report.md`, `latest-report.html`, appends `history.ndjson`.

### HTML visualizations

```bash
# Interactive cluster graph (raise node limit for large scoped graph)
GRAPHIFY_VIZ_NODE_LIMIT=12000 graphify cluster-only . --no-label

# Collapsible D3 file/symbol tree
graphify tree

# Mermaid call-flow architecture diagram
graphify export callflow-html
```

**Windows:** `$env:GRAPHIFY_VIZ_NODE_LIMIT = "12000"` before `cluster-only`; `start graphify-out\GRAPH_TREE.html` to open.

### Optional automation

```bash
graphify watch .           # rebuild on file save (background)
graphify hook install      # rebuild on git commit
graphify hook status
```

---

## Token savings and benchmarks

Benchmarks compare **naive full-corpus read** (all indexed files as context) vs **average Graphify subgraph** for fixed sample questions.

### Current scoped graph (Jul 2026, reference machine)

| Metric | Value |
|---|---|
| Files indexed | ~1,493 |
| Corpus (naive) | ~476K words → **635K tokens** |
| Graph | **9,530 nodes**, **19,854 edges** |
| Avg query context | **~7,876 tokens** |
| Reduction | **~80.7x** |
| Est. saved per exploration | **~$1.88** (illustrative $3/1M input tokens) |

### Savings timeline since activation (Jun 15, 2026)

| Date | Reduction | Saved/query (est.) |
|---|---|---|
| 2026-06-15 (activation) | 41.6x | $1.57 |
| 2026-06-16 | 85.8x | $1.50 |
| 2026-06-25 | 89.8x | $1.59 |
| 2026-07-13 | 80.7x | $1.88 |

### Savings report details

The optional script parses `graphify benchmark` output and records:

| Field | Meaning |
|---|---|
| `corpus_tokens` | Naive full-corpus token estimate |
| `avg_query_tokens` | Average subgraph size for sample questions |
| `reduction_ratio` | `corpus_tokens ÷ avg_query_tokens` |
| `usd_saved_per_query_estimate` | Illustrative $ saved (default $3/1M input tokens) |

```bash
# Append to history + write HTML
node scripts/graphify-savings-report.cjs

# Preview without saving
node scripts/graphify-savings-report.cjs --no-save

# Custom graph path
node scripts/graphify-savings-report.cjs --graph path/to/graph.json
```

**Caveats:** estimates cover **input context tokens** only — not output, reasoning, or tool-call overhead. No automatic query counter exists; multiply per-query savings by your daily agent exploration count for rough totals.

---

## Maintenance checklist

| When | Action |
|---|---|
| After `git pull` with code changes | `graphify update .` |
| After editing scoped services | `graphify update .` |
| Weekly (optional) | `graphify benchmark` + `node scripts/graphify-savings-report.cjs` |
| Monthly (optional) | Regenerate HTML: `cluster-only`, `tree`, `export callflow-html` |
| After changing scan scope | Edit `.graphifyignore`, then `graphify update . --force` |
| New team member | Run [tooling/graphify-setup-kit/install.sh](../../tooling/graphify-setup-kit/README.md) or follow [new-computer-setup.md](./new-computer-setup.md) |

---

## Troubleshooting

### `graphify: command not found`

```bash
uv tool install graphifyy
# Ensure ~/.local/bin or pipx bin is on PATH
```

### `No node matching 'X' found`

- Try a more specific symbol name (function/class name, not service name).
- Run `graphify update .` — graph may be stale or symbol not indexed.
- Check `.graphifyignore` — file may be out of scope.

### `No path found between 'A' and 'B'`

- Names may be ambiguous — use exact symbol names from `graphify query`.
- No direct graph path exists (e.g. HTTP boundary between services).
- Try `graphify query` with both concepts instead.

### Graph has fewer nodes after update

```bash
graphify update . --force
```

### Agent ignores Graphify

- Confirm `.cursor/rules/graphify.mdc` exists.
- Reopen Cursor workspace from repo root.
- Run `graphify cursor install` or copy rule from reference machine.

### Accidentally staged gitignored files

```bash
git status
# graphify-out/, .graphifyignore, .cursor/rules/graphify.mdc must NOT appear
# If they do: git reset HEAD <file> — do not commit them
```

### HTML viz truncated (default 5000 node limit)

```bash
GRAPHIFY_VIZ_NODE_LIMIT=12000 graphify cluster-only . --no-label
```

Windows: `$env:GRAPHIFY_VIZ_NODE_LIMIT = "12000"`

### Savings report script missing

```bash
cd ~/Documents/Projects/graphify-setup-kit
./install.sh --optional --force ../global-services
```

### Cannot open HTML on Windows

```powershell
start graphify-out\GRAPH_TREE.html
start reports\graphify\latest-report.html
```

---

## Graphify vs CodeGraph

| | Graphify (this repo) | CodeGraph |
|---|---|---|
| Integration | CLI + Cursor rule | MCP server |
| Corpus | Code + docs + PDFs + images | Code only |
| Storage | `graphify-out/graph.json` | `.codegraph/` SQLite |
| Query | `graphify query/path/explain` | `codegraph_explore` MCP tool |
| Clustering report | `GRAPH_REPORT.md` | No |

**Recommendation for global-services:** stay with Graphify — already scoped, gitignored, and aligned with docs + code in one graph.

---

## CLI quick reference

| Command | Purpose |
|---|---|
| `graphify update .` | Re-extract and update graph (AST-only for code) |
| `graphify query "..."` | BFS subgraph for a question |
| `graphify path "A" "B"` | Shortest dependency path |
| `graphify explain "X"` | Node + neighbors |
| `graphify affected "X"` | Reverse blast radius |
| `graphify benchmark graphify-out/graph.json` | Token savings metrics |
| `graphify watch .` | Auto-sync on file changes |
| `graphify hook install` | Post-commit rebuild |
| `graphify cursor install` | Write Cursor rule |
| `graphify cluster-only . --no-label` | Regenerate GRAPH_REPORT + graph.html |
| `graphify tree` | D3 collapsible tree HTML |
| `graphify export callflow-html` | Call-flow architecture HTML |
| `node scripts/graphify-savings-report.cjs` | Benchmark history + HTML report |

Full help: `graphify --help`

---

## References

- Upstream: https://github.com/safishamsi/graphify
- Repo pointer: `global-services/docs/misc/graphify-local.md`
- Setup kit: [tooling/graphify-setup-kit/](../../tooling/graphify-setup-kit/README.md)
- Jira story: [SKUNK-438](https://sbd-appsvcs-ebiz.atlassian.net/browse/SKUNK-438) (Graphify multi-machine setup documentation)
- New machine setup: [new-computer-setup.md](./new-computer-setup.md)
- Agent prompt: [agent-setup-prompt.md](./agent-setup-prompt.md)
