# Graphify Guide — complete reference

Canonical Graphify reference for Agentic SDLC consumer repos (reference adoption: **global-services**). Densified 2026-09 for token reduction; fuller narrative in Git history before this change.

**Related:** [README.md](./README.md) · [new-computer-setup.md](./new-computer-setup.md) · [tooling/graphify-setup-kit/](../../tooling/graphify-setup-kit/README.md) · [agent-setup-prompt.md](./agent-setup-prompt.md) · [`.agents/skills/graphify/`](../../.agents/skills/graphify/)

## Quickstart

1. Install kit: [new-computer-setup.md](./new-computer-setup.md) or `./install.sh --optional --build --verify <repo>`
2. Verify: `graphify query "places proxy cache"` returns nodes
3. Read `graphify-out/GRAPH_REPORT.md`; run `graphify benchmark graphify-out/graph.json`
4. HTML: `graphify tree` → open `graphify-out/GRAPH_TREE.html`
5. Daily: after `git pull` / edits → `graphify update .`; before explore → `graphify query "..."`

## What it does

Tree-sitter AST extraction (+ optional LLM for docs/images/labels) → persistent `graphify-out/graph.json`. Agents get a small subgraph instead of mass grep/reads.

| Edge tag | Meaning |
| --- | --- |
| `EXTRACTED` | From source (imports, calls, contains) |
| `INFERRED` | Model-reasoned — verify before trust |
| `AMBIGUOUS` | Low-confidence inference |

Artifacts are **gitignored**; each developer builds locally. PyPI package temporarily **`graphifyy`**; CLI is **`graphify`**.

## Scope (global-services reference)

| Included | Excluded |
| --- | --- |
| `services/ocr/`, `services/places-proxy/`, `services/product-id/`, `web/` | GPR, organization-manager, `@gls/*` |

Scan root = monorepo root so `graphify-out/` and Cursor rules stay one checkout. Scope via `.graphifyignore` (overrides `.gitignore` when present).

## Setup kit

```bash
uv tool install graphifyy
cd /path/to/agentic-sdlc-framework/tooling/graphify-setup-kit
./install.sh --optional --build --verify ../global-services
# Windows: pip install graphifyy; .\install.ps1 -Optional -Build -Verify ..\global-services
```

Flags: `--optional` (savings script), `--build`, `--verify`, `--docs`, `--force`, `--dry-run`.

### Local outputs (gitignored)

```
graphify-out/{graph.json,GRAPH_REPORT.md,manifest.json,cache/,*.html}
.graphifyignore
.cursor/rules/graphify.mdc
reports/graphify/{history.ndjson,latest-report.md,latest-report.html}
scripts/graphify-savings-report.cjs   # optional
```

## Build / update

```bash
graphify update .              # AST-only for code; incremental SHA256 cache
graphify update . --force      # after large deletions / scope changes
graphify watch .               # optional live rebuild
graphify hook install          # optional post-commit rebuild
```

Stale check: compare `git rev-parse HEAD` to “Built from commit” in `GRAPH_REPORT.md`.

## Query

```bash
graphify query "how does product-id enqueue OCR jobs"
graphify query "places proxy cache" --budget 1500
graphify query "GPI catalog ingest" --dfs
graphify path "symbolA" "symbolB"
graphify explain "placesClientMiddleware"
graphify affected "resolveApiKey" --depth 3
```

## Agent workflow (Cursor)

`.cursor/rules/graphify.mdc`:

1. Before Read/Grep/Glob/shell explore → `graphify query` / `path` / `explain`
2. Open only returned files/lines
3. After code edits → `graphify update .`

Exceptions: already oriented and need exact lines; or `graph.json` missing (build first). Prefer `graphify-out/wiki/index.md` if present; `GRAPH_REPORT.md` for broad review.

## Reports / HTML / stats

| Output | Command |
| --- | --- |
| `GRAPH_REPORT.md` / `graph.json` | `graphify update .` |
| Terminal benchmark | `graphify benchmark graphify-out/graph.json` |
| Savings history + HTML | `node scripts/graphify-savings-report.cjs` |
| Cluster HTML | `GRAPHIFY_VIZ_NODE_LIMIT=12000 graphify cluster-only . --no-label` |
| Tree HTML | `graphify tree` |
| Call-flow HTML | `graphify export callflow-html` |

Reference ballpark (Jul 2026 scoped graph): ~1.5k files, ~635k naive tokens → ~8k avg query (~80x). Estimates are **input** context only.

## Maintenance

| When | Action |
| --- | --- |
| After pull / scoped edits | `graphify update .` |
| Scope change | Edit `.graphifyignore` → `graphify update . --force` |
| Weekly optional | `benchmark` + savings script |
| New teammate | setup kit or [new-computer-setup.md](./new-computer-setup.md) |

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `command not found` | `uv tool install graphifyy`; fix PATH (`~/.local/bin`) |
| No matching node | Exact symbol name; refresh graph; check `.graphifyignore` |
| No path | Ambiguous names or HTTP boundary — use `query` |
| Fewer nodes after update | `graphify update . --force` |
| Agent ignores Graphify | Confirm rule file; reopen from repo root; `graphify cursor install` |
| Staged gitignored files | `git reset HEAD <file>` — never commit |
| Truncated HTML viz | `GRAPHIFY_VIZ_NODE_LIMIT=12000` |

## Graphify vs CodeGraph

Prefer Graphify here (CLI + Cursor rule, code+docs, `graph.json`). CodeGraph is a separate MCP/SQLite tool — not the default for this program.

## CLI quick reference

| Command | Purpose |
| --- | --- |
| `graphify update .` | Rebuild/update graph |
| `graphify query "..."` | BFS subgraph |
| `graphify path "A" "B"` | Dependency path |
| `graphify explain "X"` | Node + neighbors |
| `graphify affected "X"` | Reverse blast radius |
| `graphify benchmark …` | Token metrics |
| `graphify watch .` / `hook install` | Auto-sync |
| `graphify cursor install` | Write Cursor rule |
| `graphify cluster-only . --no-label` | Report + graph.html |
| `graphify tree` / `export callflow-html` | HTML viz |

Full help: `graphify --help` · Upstream: https://github.com/safishamsi/graphify
