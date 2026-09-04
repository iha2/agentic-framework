# graphify reference: full build pipeline

Load for full `/graphify` build (not query/update/add/watch alone). Subs: `INPUT_PATH`, `IS_DIRECTED`, `SPEC_PATH`, `LABELS_DICT`, `DEEP_MODE`. After Step 1: `$(cat graphify-out/.graphify_python)` not `python3`.

Siblings: `github-and-merge.md`, `transcribe.md`, `extraction-spec.md`, `exports.md`, `update.md`, `query.md`, `add-watch.md`, `hooks.md`.

## Entry gates

| Condition | Action |
| --- | --- |
| `/graphify --help` \| `-h` alone | Print SKILL.md `## Usage` verbatim; halt (no detect, no `.`) |
| `graphify-out/graph.json` exists **and** NL codebase Q **and** not rebuild (`--update`/`--cluster-only`/bare path\|URL) | Skip Steps 1–5 → `graphify query` (`query.md`). No detect/corpus/narrow |
| No path | Use `.`; do not ask |
| `https://github.com/` \| `http://github.com/` | Step 0 first |
| Steps | In order; do not skip |

### Step 0 — GitHub / multi-path merge

`https://github.com/...` URL(s) or several local folders → `github-and-merge.md`. Plain local path: skip.

### Step 1 — Ensure installed

```bash
PYTHON=""
GRAPHIFY_BIN=$(which graphify 2>/dev/null)
if [ -z "$PYTHON" ] && command -v uv >/dev/null 2>&1; then
    _UV_PY=$(uv tool run --from graphifyy python -c "import sys; print(sys.executable)" 2>/dev/null)
    if [ -n "$_UV_PY" ]; then PYTHON="$_UV_PY"; fi
fi
if [ -z "$PYTHON" ] && [ -n "$GRAPHIFY_BIN" ]; then
    _SHEBANG=$(head -1 "$GRAPHIFY_BIN" | tr -d '#!')
    case "$_SHEBANG" in
        *[!a-zA-Z0-9/_.@-]*) ;;
        *) "$_SHEBANG" -c "import graphify" 2>/dev/null && PYTHON="$_SHEBANG" ;;
    esac
fi
if [ -z "$PYTHON" ]; then PYTHON="python3"; fi
if ! "$PYTHON" -c "import graphify" 2>/dev/null; then
    if command -v uv >/dev/null 2>&1; then
        uv tool install --upgrade graphifyy -q 2>&1 | tail -3
        _UV_PY=$(uv tool run --from graphifyy python -c "import sys; print(sys.executable)" 2>/dev/null)
        if [ -n "$_UV_PY" ]; then PYTHON="$_UV_PY"; fi
    else
        "$PYTHON" -m pip install graphifyy -q 2>/dev/null \
          || "$PYTHON" -m pip install graphifyy -q --break-system-packages 2>&1 | tail -3
    fi
fi
mkdir -p graphify-out
"$PYTHON" -c "import sys; open('graphify-out/.graphify_python', 'w', encoding='utf-8').write(sys.executable)"
echo "$(cd INPUT_PATH && pwd)" > graphify-out/.graphify_root
```

On success: print nothing → Step 2. Resolve: uv tool → shebang → `python3`; install via uv/pip if import fails.

### Step 2 — Detect

```bash
$(cat graphify-out/.graphify_python) -c "
import json
from graphify.detect import detect
from pathlib import Path
result = detect(Path('INPUT_PATH'))
Path('graphify-out/.graphify_detect.json').write_text(json.dumps(result, ensure_ascii=False), encoding=\"utf-8\")
print(f'Detected {result[\"total_files\"]} files')
"
```

Do **not** cat JSON. Summarize (omit zero categories):

```
Corpus: X files · ~Y words
  code:     N files (.py .ts .go ...)
  docs:     N files (.md .txt ...)
  papers:   N files (.pdf ...)
  images:   N files
  video:    N files (.mp4 .mp3 ...)
```

| Detect result | Action |
| --- | --- |
| `total_files` = 0 | Halt: "No supported files found in [path]." |
| `skipped_sensitive` non-empty | Report count + names (#2106) |
| `total_words` > 2e6 **or** `total_files` > 500 | Warn; rank top-5 first-level dirs; wait — unless all `(root)` → suggest `--no-cluster`, proceed |
| else | Step 2.5 if video else Step 3 |

**Large-corpus dir rank:** `scan_root` from detect JSON → concat categories → drop `scan_root/graphify-out/` → first path component (`(root)` if none) → top 5 by count → ask subfolder.

### Step 2.5 — Video/audio

Skip if zero `video`. Else → `transcribe.md`; transcripts = docs in Step 3.

### Step 3 — Extract

Track `--mode deep` → `DEEP_MODE=true` for every B2 subagent.

| Track | Cost | When |
| --- | --- | --- |
| Part A AST | Free, deterministic | Code |
| Part B semantic | Tokens / LLM | Docs, papers, images |

**API keys (MUST):** Never ask; never block. AST needs none. Code-only → Part A + empty semantic → Part C. Semantic: Gemini **iff** `GEMINI_API_KEY`/`GOOGLE_API_KEY` → `extract_corpus_parallel(..., backend="gemini")` (default `gemini-3-flash-preview`; override `GRAPHIFY_GEMINI_MODEL`/`--model`). Else host agent = LLM. Do **not** read `ANTHROPIC_API_KEY`/`OPENAI_API_KEY`. Unset Gemini: one tip (`pip install 'graphifyy[gemini]'`), continue. CLI host without subagents: code-only empty semantic; docs/papers/images → Gemini or inline — never prompt Anthropic.

**MUST** run Part A and Part B in parallel (same message).

#### Part A — AST

```bash
$(cat graphify-out/.graphify_python) -c "
import sys, json
from graphify.extract import collect_files, extract
from pathlib import Path
import json

code_files = []
detect = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding=\"utf-8\"))
for f in detect.get('files', {}).get('code', []):
    code_files.extend(collect_files(Path(f)) if Path(f).is_dir() else [Path(f)])

if code_files:
    result = extract(code_files, cache_root=Path('INPUT_PATH'))
    Path('graphify-out/.graphify_ast.json').write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding=\"utf-8\")
    print(f'AST: {len(result[\"nodes\"])} nodes, {len(result[\"edges\"])} edges')
else:
    Path('graphify-out/.graphify_ast.json').write_text(json.dumps({'nodes':[],'edges':[],'input_tokens':0,'output_tokens':0}, ensure_ascii=False), encoding=\"utf-8\")
    print('No code files - skipping AST extraction')
"
```

#### Part B — Semantic

**Code-only fast path:** zero docs/papers/images → empty semantic, skip to Part C:

```bash
$(cat graphify-out/.graphify_python) -c "
import json
from pathlib import Path
Path('graphify-out/.graphify_semantic.json').write_text(json.dumps({'nodes':[],'edges':[],'hyperedges':[],'input_tokens':0,'output_tokens':0}), encoding='utf-8')
"
```

**MUST** use Agent/Task tool — serial self-read forbidden.

Timing: `ceil(uncached_non_code / 22)` agents; ~45s × ceil(agents/parallel_limit); print `Semantic extraction: ~N files → X agents, estimated ~Ys`.

**B0 — Cache.** `SPEC_PATH` = absolute `references/extraction-spec.md` (B0+B3; stamps cache #1939). Categories: `document`/`paper`/`image` (#1392).

```bash
$(cat graphify-out/.graphify_python) -c "
import json
from graphify.cache import check_semantic_cache
from pathlib import Path

detect = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding=\"utf-8\"))
all_files = [f for cat in ('document', 'paper', 'image') for f in detect['files'].get(cat, [])]
cached_nodes, cached_edges, cached_hyperedges, uncached = check_semantic_cache(all_files, root='INPUT_PATH', prompt_file='SPEC_PATH')
if cached_nodes or cached_edges or cached_hyperedges:
    Path('graphify-out/.graphify_cached.json').write_text(json.dumps({'nodes': cached_nodes, 'edges': cached_edges, 'hyperedges': cached_hyperedges}, ensure_ascii=False), encoding=\"utf-8\")
else:
    Path('graphify-out/.graphify_cached.json').unlink(missing_ok=True)
Path('graphify-out/.graphify_uncached.txt').write_text('\n'.join(uncached), encoding=\"utf-8\")
print(f'Cache: {len(all_files)-len(uncached)} files hit, {len(uncached)} files need extraction')
"
```

Dispatch uncached only. All cached → Part C.

**B1 — Chunks:** 20–25 files; one image/chunk; group by directory.

**B2 — Dispatch all Tasks in one message:**

```
Task(description="Your task is to perform the following. Follow the instructions below exactly.\n\n<agent-instructions>\n[extraction prompt, with FILE_LIST, CHUNK_NUM, TOTAL_CHUNKS, DEEP_MODE substituted]\n</agent-instructions>\n\nExecute this now. Output ONLY the structured JSON response.")
```

Each chunk → `graphify-out/.graphify_chunk_NN.json`. `CHUNK_PATH` absolute; `PROJECT_ROOT=$(pwd)` (cwd, not `.graphify_root` #1392). Load `extraction-spec.md` only when ≥1 doc/paper/image chunk; substitute placeholders verbatim.

**B3 — Collect / cache / merge**

| Chunk outcome | Action |
| --- | --- |
| File + valid JSON (`nodes`,`edges`) | Include; cache |
| Missing file | Warn read-only/Explore; do not silent-skip |
| Invalid JSON / fail | Warn; skip chunk; do not abort |
| >½ failed/missing | Halt; re-run with `subagent_type="general-purpose"` |

After each Agent: write real `usage` tokens into chunk JSON. Then:

```bash
$(cat graphify-out/.graphify_python) -c "
import json, glob
from pathlib import Path

chunks = sorted(glob.glob('graphify-out/.graphify_chunk_*.json'))
all_nodes, all_edges, all_hyperedges = [], [], []
total_in, total_out = 0, 0
for c in chunks:
    d = json.loads(Path(c).read_text(encoding=\"utf-8\"))
    all_nodes += d.get('nodes', [])
    all_edges += d.get('edges', [])
    all_hyperedges += d.get('hyperedges', [])
    total_in += d.get('input_tokens', 0)
    total_out += d.get('output_tokens', 0)
Path('graphify-out/.graphify_semantic_new.json').write_text(json.dumps({
    'nodes': all_nodes, 'edges': all_edges, 'hyperedges': all_hyperedges,
    'input_tokens': total_in, 'output_tokens': total_out,
}, indent=2, ensure_ascii=False), encoding=\"utf-8\")
print(f'Merged {len(chunks)} chunks: {total_in:,} in / {total_out:,} out tokens')
"
```

```bash
$(cat graphify-out/.graphify_python) -c "
import json
from graphify.cache import save_semantic_cache
from pathlib import Path

new = json.loads(Path('graphify-out/.graphify_semantic_new.json').read_text(encoding=\"utf-8\")) if Path('graphify-out/.graphify_semantic_new.json').exists() else {'nodes':[],'edges':[],'hyperedges':[]}
uncached = [line for line in Path('graphify-out/.graphify_uncached.txt').read_text(encoding=\"utf-8\").splitlines() if line]
saved = save_semantic_cache(new.get('nodes', []), new.get('edges', []), new.get('hyperedges', []), root='INPUT_PATH', allowed_source_files=uncached, prompt_file='SPEC_PATH')
print(f'Cached {saved} files')
"
```

```bash
$(cat graphify-out/.graphify_python) -c "
import json
from pathlib import Path

cached = json.loads(Path('graphify-out/.graphify_cached.json').read_text(encoding=\"utf-8\")) if Path('graphify-out/.graphify_cached.json').exists() else {'nodes':[],'edges':[],'hyperedges':[]}
new = json.loads(Path('graphify-out/.graphify_semantic_new.json').read_text(encoding=\"utf-8\")) if Path('graphify-out/.graphify_semantic_new.json').exists() else {'nodes':[],'edges':[],'hyperedges':[]}

all_nodes = cached['nodes'] + new.get('nodes', [])
all_edges = cached['edges'] + new.get('edges', [])
all_hyperedges = cached.get('hyperedges', []) + new.get('hyperedges', [])
seen = set()
deduped = []
for n in all_nodes:
    if n['id'] not in seen:
        seen.add(n['id'])
        deduped.append(n)

merged = {
    'nodes': deduped,
    'edges': all_edges,
    'hyperedges': all_hyperedges,
    'input_tokens': new.get('input_tokens', 0),
    'output_tokens': new.get('output_tokens', 0),
}
Path('graphify-out/.graphify_semantic.json').write_text(json.dumps(merged, indent=2, ensure_ascii=False), encoding=\"utf-8\")
print(f'Extraction complete - {len(deduped)} nodes, {len(all_edges)} edges ({len(cached[\"nodes\"])} from cache, {len(new.get(\"nodes\",[]))} new)')
"
```

`rm -f graphify-out/.graphify_cached.json graphify-out/.graphify_uncached.txt graphify-out/.graphify_semantic_new.json`

#### Part C — Merge AST + semantic

```bash
$(cat graphify-out/.graphify_python) -c "
import sys, json
from pathlib import Path

ast = json.loads(Path('graphify-out/.graphify_ast.json').read_text(encoding=\"utf-8\"))
sem = json.loads(Path('graphify-out/.graphify_semantic.json').read_text(encoding=\"utf-8\"))

seen = {n['id'] for n in ast['nodes']}
merged_nodes = list(ast['nodes'])
for n in sem['nodes']:
    if n['id'] not in seen:
        merged_nodes.append(n)
        seen.add(n['id'])

merged_edges = ast['edges'] + sem['edges']
merged_hyperedges = sem.get('hyperedges', [])
merged = {
    'nodes': merged_nodes,
    'edges': merged_edges,
    'hyperedges': merged_hyperedges,
    'input_tokens': sem.get('input_tokens', 0),
    'output_tokens': sem.get('output_tokens', 0),
}
Path('graphify-out/.graphify_extract.json').write_text(json.dumps(merged, indent=2, ensure_ascii=False), encoding=\"utf-8\")
print(f'Merged: {len(merged_nodes)} nodes, {len(merged_edges)} edges ({len(ast[\"nodes\"])} AST + {len(sem[\"nodes\"])} semantic)')
"
```

### Step 4 — Build / cluster / analyze

`IS_DIRECTED=True` iff `--directed`; else `False`. Do not leave literal `IS_DIRECTED`.

```bash
mkdir -p graphify-out
$(cat graphify-out/.graphify_python) -c "
import sys, json
from graphify.build import build_from_json
from graphify.cluster import cluster, score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from graphify.export import to_json
from pathlib import Path

extraction = json.loads(Path('graphify-out/.graphify_extract.json').read_text(encoding=\"utf-8\"))
detection  = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding=\"utf-8\"))

G = build_from_json(extraction, root='INPUT_PATH', directed=IS_DIRECTED)
if G.number_of_nodes() == 0:
    print('ERROR: Graph is empty - extraction produced no nodes.')
    print('Possible causes: all files were skipped, binary-only corpus, or extraction failed.')
    raise SystemExit(1)
communities = cluster(G)
cohesion = score_all(G, communities)
tokens = {'input': extraction.get('input_tokens', 0), 'output': extraction.get('output_tokens', 0)}
gods = god_nodes(G)
surprises = surprising_connections(G, communities)
labels = {cid: 'Community ' + str(cid) for cid in communities}
questions = suggest_questions(G, communities, labels)

wrote = to_json(G, communities, 'graphify-out/graph.json')
if not wrote:
    print('ERROR: refused to shrink graphify-out/graph.json (existing graph has more nodes; #479).')
    print('If this shrink is intentional (you deleted files), re-run a full build with --force.')
    raise SystemExit(1)
report = generate(G, communities, cohesion, labels, gods, surprises, detection, tokens, 'INPUT_PATH', suggested_questions=questions)
Path('graphify-out/GRAPH_REPORT.md').write_text(report, encoding=\"utf-8\")
analysis = {
    'communities': {str(k): v for k, v in communities.items()},
    'cohesion': {str(k): v for k, v in cohesion.items()},
    'gods': gods,
    'surprises': surprises,
    'questions': questions,
}
Path('graphify-out/.graphify_analysis.json').write_text(json.dumps(analysis, indent=2, ensure_ascii=False), encoding=\"utf-8\")
print(f'Graph: {G.number_of_nodes()} nodes, {G.number_of_edges()} edges, {len(communities)} communities')
"
```

Empty graph → halt. `root=` matches `--update` (#1361). Export before report; shrink-guard before report/sidecar (#1392).

### Step 4.5 — Health check (read-only; never abort)

```bash
$(cat graphify-out/.graphify_python) -c "
import json
from pathlib import Path
from graphify.diagnostics import diagnose_extraction, format_diagnostic_report

extraction = json.loads(Path('graphify-out/.graphify_extract.json').read_text(encoding=\"utf-8\"))
summary = diagnose_extraction(extraction, directed=IS_DIRECTED, root='INPUT_PATH')
print(format_diagnostic_report(summary))
flags = [f'{summary[k]} {label}' for k, label in (
    ('dangling_endpoint_edges', 'dangling-endpoint edges'),
    ('missing_endpoint_edges', 'missing-endpoint edges'),
    ('self_loop_edges', 'self-loop edges'),
    ('directed_same_endpoint_collapsed_edges', 'collapsed (directed) edges'),
    ('undirected_same_endpoint_collapsed_edges', 'collapsed (undirected) edges'),
) if summary.get(k, 0)]
print('GRAPH HEALTH WARNING: ' + '; '.join(flags) + ' - graph may be incomplete/corrupt.' if flags else 'Graph health: OK (no dangling/missing/collapsed edges).')
"
```

`GRAPH HEALTH WARNING` → surface in final summary (Honesty Rules).

### Step 5 — Label communities

From `.graphify_analysis.json`: 2–5 word name per community. Then:

```bash
$(cat graphify-out/.graphify_python) -c "
import sys, json
from graphify.build import build_from_json
from graphify.cluster import score_all
from graphify.analyze import god_nodes, surprising_connections, suggest_questions
from graphify.report import generate
from graphify.export import to_json
from pathlib import Path

extraction = json.loads(Path('graphify-out/.graphify_extract.json').read_text(encoding=\"utf-8\"))
detection  = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding=\"utf-8\"))
analysis   = json.loads(Path('graphify-out/.graphify_analysis.json').read_text(encoding=\"utf-8\"))

G = build_from_json(extraction, root='INPUT_PATH', directed=IS_DIRECTED)
communities = {int(k): v for k, v in analysis['communities'].items()}
cohesion = {int(k): v for k, v in analysis['cohesion'].items()}
tokens = {'input': extraction.get('input_tokens', 0), 'output': extraction.get('output_tokens', 0)}
labels = LABELS_DICT
questions = suggest_questions(G, communities, labels)

report = generate(G, communities, cohesion, labels, analysis['gods'], analysis['surprises'], detection, tokens, 'INPUT_PATH', suggested_questions=questions)
Path('graphify-out/GRAPH_REPORT.md').write_text(report, encoding=\"utf-8\")
Path('graphify-out/.graphify_labels.json').write_text(json.dumps({str(k): v for k, v in labels.items()}, ensure_ascii=False), encoding=\"utf-8\")
wrote = to_json(G, communities, 'graphify-out/graph.json', community_labels=labels)
if not wrote:
    print('ERROR: refused to shrink graphify-out/graph.json (existing graph has more nodes; #479).')
    print('If this shrink is intentional (you deleted files), re-run a full build with --force.')
print('Report updated with community labels')
"
```

Replace `LABELS_DICT` (e.g. `{0: "Attention Mechanism", 1: "Training Pipeline"}`). Re-export carries `community_name` (#2490); do not force past shrink-guard.

### Step 6 — Obsidian (opt-in) + HTML

HTML always unless `--no-viz`. Obsidian **only** if `--obsidian` (`--obsidian-dir` → `--dir`; else `graphify-out/obsidian`).

```bash
graphify export obsidian
# or: graphify export obsidian --dir ~/vaults/my-project
graphify export html  # aggregates if >5000 nodes
# or: graphify export html --no-viz
```

### Steps 6b–8 — Flag exports

Only if `--wiki` / `--neo4j`|`--neo4j-push` / `--falkordb`|`--falkordb-push` / `--svg` / `--graphml` / `--mcp`, or token benchmark when `total_words` > 5000 → `exports.md`. Wiki **before** Step 9 (needs `.graphify_labels.json`).

### Step 9 — Manifest, cost, cleanup, report

```bash
$(cat graphify-out/.graphify_python) -c "
import json
from pathlib import Path
from datetime import datetime, timezone
from graphify.detect import save_manifest
from graphify.cli import _stamped_manifest_files

detect = json.loads(Path('graphify-out/.graphify_detect.json').read_text(encoding=\"utf-8\"))
extract = json.loads(Path('graphify-out/.graphify_extract.json').read_text(encoding=\"utf-8\"))
# --update: all_files=full corpus, files=changed; full rebuild: files only.
# Stamp semantic (doc/paper/image) only if extract produced output (#2015);
# code always stamped. clear_semantic = dispatched - stamped (#1948).
# scan_corpus = raw full corpus (#1908). root= portable keys (#1417).
_corpus = detect.get('all_files') or detect['files']
_manifest_files = _stamped_manifest_files(_corpus, extract, Path('INPUT_PATH'))
_sem_types = ('document', 'paper', 'image')
_dispatched = {f for t, fl in detect['files'].items() if t in _sem_types for f in fl}
_stamped = {f for fl in _manifest_files.values() for f in fl}
_cleared = _dispatched - _stamped
_scan = {f for fl in _corpus.values() for f in fl}
save_manifest(_manifest_files, root='INPUT_PATH', scan_corpus=_scan, clear_semantic=_cleared or None)

input_tok = extract.get('input_tokens', 0)
output_tok = extract.get('output_tokens', 0)
cost_path = Path('graphify-out/cost.json')
cost = json.loads(cost_path.read_text(encoding=\"utf-8\")) if cost_path.exists() else {'runs': [], 'total_input_tokens': 0, 'total_output_tokens': 0}
cost['runs'].append({'date': datetime.now(timezone.utc).isoformat(), 'input_tokens': input_tok, 'output_tokens': output_tok, 'files': detect.get('total_files', 0)})
cost['total_input_tokens'] += input_tok
cost['total_output_tokens'] += output_tok
cost_path.write_text(json.dumps(cost, indent=2, ensure_ascii=False), encoding=\"utf-8\")
print(f'This run: {input_tok:,} input tokens, {output_tok:,} output tokens')
print(f'All time: {cost[\"total_input_tokens\"]:,} input, {cost[\"total_output_tokens\"]:,} output ({len(cost[\"runs\"])} runs)')
"
rm -f graphify-out/.graphify_detect.json graphify-out/.graphify_extract.json graphify-out/.graphify_ast.json graphify-out/.graphify_semantic.json graphify-out/.graphify_analysis.json
find graphify-out -maxdepth 1 -name '.graphify_chunk_*.json' -delete 2>/dev/null
rm -f graphify-out/.needs_update 2>/dev/null || true
```

`INPUT_PATH` = Steps 4–5. **User summary** (omit obsidian unless flagged):

```
Graph complete. Outputs in PATH_TO_DIR/graphify-out/

  graph.html            - interactive graph, open in browser
  GRAPH_REPORT.md       - audit report
  graph.json            - raw graph data
  obsidian/             - Obsidian vault (only if --obsidian was given)
```

Optional: https://github.com/sponsors/safishamsi

Paste from `GRAPH_REPORT.md` only: God Nodes, Surprising Connections, Suggested Questions. Offer explore: pick cross-community/surprising Q → "Want me to trace it?" On yes → `/graphify query`; end with follow-up.

## Interpreter guard (subcommands)

Before `--update` / `--cluster-only` / `query` / `path` / `explain` / `add`, if `.graphify_python` missing:

```bash
if [ ! -f graphify-out/.graphify_python ]; then
    GRAPHIFY_BIN=$(which graphify 2>/dev/null)
    if [ -n "$GRAPHIFY_BIN" ]; then
        PYTHON=$(head -1 "$GRAPHIFY_BIN" | tr -d '#!')
        case "$PYTHON" in *[!a-zA-Z0-9/_.@-]*) PYTHON="python3" ;; esac
    else
        PYTHON="python3"
    fi
    mkdir -p graphify-out
    "$PYTHON" -c "import sys; open('graphify-out/.graphify_python', 'w', encoding='utf-8').write(sys.executable)"
fi
```
