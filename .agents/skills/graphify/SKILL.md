---
name: graphify
description: "Use for any question about a codebase, its architecture, file relationships, or project content — especially when graphify-out/ exists, where the question should be treated as a graphify query first. Turns any input (code, docs, papers, images, videos) into a persistent knowledge graph with god nodes, community detection, and query/path/explain tools."
---

# /graphify

Build a navigable knowledge graph (communities, EXTRACTED/INFERRED/AMBIGUOUS audit) → HTML, GraphRAG JSON, `GRAPH_REPORT.md`.

## Usage

Print this block verbatim on `/graphify --help` / `-h` alone; then stop (no detect, no default `.`).

| Invocation | Effect |
| --- | --- |
| `/graphify` \| `/graphify <path>` | Full pipeline on `.` or path |
| `/graphify https://github.com/<owner>/<repo>` [`--branch <b>`] | Clone then build |
| `/graphify <url1> <url2> ...` | Clone each; merge cross-repo graph |
| `--mode deep` | Richer INFERRED edges |
| `--update` | Re-extract new/changed only → `references/update.md` |
| `--directed` | DiGraph (source→target) |
| `--whisper-model <name>` | Whisper model for transcription |
| `--cluster-only` | Recluster existing graph → `references/update.md` |
| `--no-viz` | Skip HTML |
| `--html` | No-op (HTML default) |
| `--svg` / `--graphml` | Extra exports |
| `--neo4j` / `--neo4j-push <bolt>` | Cypher file / push Neo4j |
| `--falkordb` / `--falkordb-push <url>` | Cypher file / push FalkorDB |
| `--mcp` | MCP stdio server |
| `--watch` | Auto-rebuild on code changes → `references/add-watch.md` |
| `--wiki` | Agent wiki (`index.md` + per-community) |
| `--obsidian` [`--obsidian-dir <path>`] | Obsidian vault (default `graphify-out/obsidian`) |
| `/graphify add <url>` [`--author`/`--contributor`] | Fetch URL → `./raw`, update graph |
| `/graphify query "<q>"` [`--dfs`] [`--budget N`] | BFS (default) / DFS / token cap |
| `/graphify path "A" "B"` | Shortest path |
| `/graphify explain "X"` | Node neighborhood explanation |

## What You Must Do When Invoked

1. **`--help`/`-h` alone** → print `## Usage` above verbatim; halt.
2. **Fast path:** if `graphify-out/graph.json` exists (CWD-relative) **and** request is a NL codebase question **and** not `--update` / `--cluster-only` / bare path|URL rebuild → skip Steps 1–5; run `graphify query "<question>"` per `## For /graphify query`. No detect, no corpus check, no narrow ask.
3. Default path = `.` if omitted. Do not ask for a path.
4. `https://github.com/` / `http://github.com/` → Step 0 first, then resolved local path.
5. Follow steps in order. Do not skip.

| Step | Action | Detail |
| --- | --- | --- |
| 0 | GitHub / multi-path merge | Only URLs or several folders → `references/github-and-merge.md` |
| 1–9 | Install → detect → extract → build → label → export → manifest | **`references/build.md`** (scripts + halt rules). Subs: `INPUT_PATH`, `IS_DIRECTED`, `SPEC_PATH`, `LABELS_DICT`, `DEEP_MODE`. After Step 1 use `$(cat graphify-out/.graphify_python)`. |
| 2.5 | Video/audio | If any video → `references/transcribe.md` before extract |
| 3B | Semantic subagent prompt | `references/extraction-spec.md` (docs/papers/images only) |
| 6b–8 | Wiki / Neo4j / FalkorDB / SVG / GraphML / MCP / benchmark | Flag-gated → `references/exports.md`; wiki **before** Step 9 cleanup |

**Normative (build):** never prompt for API keys; never block on missing keys. AST needs none. Semantic uses Gemini only if `GEMINI_API_KEY`/`GOOGLE_API_KEY` set; else host agent. Do **not** read `ANTHROPIC_API_KEY`/`OPENAI_API_KEY`. Code-only → empty semantic JSON then Part C. MUST parallelize AST + semantic; MUST use Agent/Task for semantic chunks (no serial self-read). Empty graph / shrink-guard (`#479`) → halt as in `build.md`. Surface graph-health warnings; do not abort.

## Interpreter guard (subcommands)

Before `--update`, `--cluster-only`, `query`, `path`, `explain`, `add`: if `graphify-out/.graphify_python` missing, re-resolve (see `references/build.md` Step 1 / guard block).

## For --update and --cluster-only

→ `references/update.md`

## For /graphify query

If `graphify-out/graph.json` exists and user asks about the corpus, answer from the graph (do not rebuild):

```bash
graphify query "<question>"
```

MUST expand question against graph vocab before traversal. CLI preferred; else NetworkX fallback on `graph.json`. Answer only from graph output; quote `source_location` when citing. Vocab expansion, BFS/DFS, `--budget`, fallback, `save-result`, path/explain → **`references/query.md`**.

## For /graphify add and --watch

→ `references/add-watch.md`

## For commit hook / AGENTS.md

→ `references/hooks.md`

## Honesty Rules

- Never invent an edge; if unsure → AMBIGUOUS.
- Never skip the corpus-size warning.
- Always show token cost in the report.
- Never hide cohesion behind symbols — show the raw number.
- Never run HTML viz on >5,000 nodes without warning the user.
