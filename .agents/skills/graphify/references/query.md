# graphify reference: query, path, explain

Load for corpus Qs on existing graph, or `/graphify path` / `explain`. Prefer CLI; else NetworkX on `graphify-out/graph.json`.

| Mode | Flag | Use |
| --- | --- | --- |
| BFS (default) | _(none)_ | Broad neighborhood |
| DFS | `--dfs` | Dependency / reachability chain |

```bash
$(cat graphify-out/.graphify_python) -c "
from pathlib import Path
if not Path('graphify-out/graph.json').exists():
    print('ERROR: No graph found. Run /graphify <path> first to build the graph.')
    raise SystemExit(1)
"
```

Missing graph → halt; tell user to build.

### Step 0 — Constrained query expansion (REQUIRED)

Matcher = case-folded substring + IDF only (no stemming/synonyms/cross-lang in binary). Expand against **graph labels**; never invent tokens:

```bash
$(cat graphify-out/.graphify_python) -c "
import json, re
from pathlib import Path
data = json.loads(Path('graphify-out/graph.json').read_text(encoding='utf-8'))
vocab = set()
for n in data['nodes']:
    for c in re.findall(r'[^\W\d_]+', n.get('label','') or '', re.UNICODE):
        parts = re.findall(r'[A-Z]+(?=[A-Z][a-z])|[A-Z]?[a-z]+|[A-Z]+', c) or [c]
        for p in parts:
            t = p.lower()
            if 3 <= len(t) <= 30: vocab.add(t)
Path('graphify-out/.vocab.txt').write_text('\n'.join(sorted(vocab)), encoding='utf-8')
print(f'vocab: {len(vocab)} tokens')
"
```

Pick **≤12** tokens from `.vocab.txt` matching intent. MUST: listed tokens only; skip concepts with no vocab hit; zero matches → empty list, tell user, **halt**. Cross-lang/morphology only if target form exists in vocab. Print:

```
Query expanded to (from graph vocab, N tokens): [token1, token2, ...]
```

Empty → stop.

### Step 1 — Traversal

`QUESTION` = space-joined expanded tokens. Keep original user text for `save-result` only.

```bash
graphify query "QUESTION"
# or: graphify query "QUESTION" --dfs --budget 3000
```

**No CLI:** match 1–3 start nodes → BFS depth 3 / DFS depth 6 → answer **only** from subgraph; quote `source_location`; never invent edges.

```bash
$(cat graphify-out/.graphify_python) -c "
import sys, json
from networkx.readwrite import json_graph
import networkx as nx
from pathlib import Path

data = json.loads(Path('graphify-out/graph.json').read_text(encoding='utf-8'))
G = json_graph.node_link_graph(data, edges='links')
question, mode, token_budget = 'QUESTION', 'MODE', BUDGET  # bfs|dfs; default budget 2000
terms = [t.lower() for t in question.split() if len(t) >= 3]
scored = sorted(((sum(1 for t in terms if t in ndata.get('label','').lower()), nid)
                 for nid, ndata in G.nodes(data=True)), reverse=True)
start_nodes = [nid for s, nid in scored if s > 0][:3]
if not start_nodes:
    print('No matching nodes found for query terms:', terms); sys.exit(0)

subgraph_nodes, subgraph_edges = set(), []
if mode == 'dfs':
    visited, stack = set(), [(n, 0) for n in reversed(start_nodes)]
    while stack:
        node, depth = stack.pop()
        if node in visited or depth > 6: continue
        visited.add(node); subgraph_nodes.add(node)
        for neighbor in G.neighbors(node):
            if neighbor not in visited:
                stack.append((neighbor, depth + 1)); subgraph_edges.append((node, neighbor))
else:
    frontier = set(start_nodes); subgraph_nodes = set(start_nodes)
    for _ in range(3):
        next_frontier = set()
        for n in frontier:
            for neighbor in G.neighbors(n):
                if neighbor not in subgraph_nodes:
                    next_frontier.add(neighbor); subgraph_edges.append((n, neighbor))
        subgraph_nodes.update(next_frontier); frontier = next_frontier

char_budget = token_budget * 4
def relevance(nid):
    return sum(1 for t in terms if t in G.nodes[nid].get('label','').lower())
lines = [f'Traversal: {mode.upper()} | Start: {[G.nodes[n].get(\"label\",n) for n in start_nodes]} | {len(subgraph_nodes)} nodes']
for nid in sorted(subgraph_nodes, key=relevance, reverse=True):
    d = G.nodes[nid]
    lines.append(f'  NODE {d.get(\"label\", nid)} [src={d.get(\"source_file\",\"\")} loc={d.get(\"source_location\",\"\")}]')
for u, v in subgraph_edges:
    if u in subgraph_nodes and v in subgraph_nodes:
        _raw = G[u][v]; d = next(iter(_raw.values()), {}) if isinstance(G, nx.MultiGraph) else _raw
        lines.append(f'  EDGE {G.nodes[u].get(\"label\",u)} --{d.get(\"relation\",\"\")} [{d.get(\"confidence\",\"\")}]--> {G.nodes[v].get(\"label\",v)}')
output = '\n'.join(lines)
print(output if len(output) <= char_budget else output[:char_budget] + f'\n... (truncated at ~{token_budget} token budget - use --budget N for more)')
"
```

```bash
$(cat graphify-out/.graphify_python) -m graphify save-result --question "ORIGINAL_QUESTION" --answer "ANSWER" --type query --nodes NODE1 NODE2
```

Include expanded-token trace in `--answer`. Optional `--outcome useful|dead_end|corrected` [`--correction "..."`]. Session start: `graphify reflect --if-stale` → read `graphify-out/reflections/LESSONS.md`.

---

## For /graphify path

```bash
graphify path "NODE_A" "NODE_B"
```

```bash
$(cat graphify-out/.graphify_python) -c "
import json, sys
import networkx as nx
from networkx.readwrite import json_graph
from pathlib import Path

data = json.loads(Path('graphify-out/graph.json').read_text(encoding='utf-8'))
G = json_graph.node_link_graph(data, edges='links')
a_term, b_term = 'NODE_A', 'NODE_B'

def find_node(term):
    term = term.lower()
    scored = sorted(
        [(sum(1 for w in term.split() if w in G.nodes[n].get('label','').lower()), n) for n in G.nodes()],
        reverse=True)
    return scored[0][1] if scored and scored[0][0] > 0 else None

src, tgt = find_node(a_term), find_node(b_term)
if not src or not tgt:
    print(f'Could not find nodes matching: {a_term!r} or {b_term!r}'); sys.exit(0)
try:
    path = nx.shortest_path(G, src, tgt)
    print(f'Shortest path ({len(path)-1} hops):')
    for i, nid in enumerate(path):
        label = G.nodes[nid].get('label', nid)
        if i < len(path) - 1:
            _raw = G[nid][path[i+1]]; edge = next(iter(_raw.values()), {}) if isinstance(G, nx.MultiGraph) else _raw
            print(f'  {label} --{edge.get(\"relation\",\"\")}--> [{edge.get(\"confidence\",\"\")}]')
        else: print(f'  {label}')
except nx.NetworkXNoPath:
    print(f'No path found between {a_term!r} and {b_term!r}')
except nx.NodeNotFound as e:
    print(f'Node not found: {e}')
"
```

Explain hops. Then `save-result --type path_query --question "Path from NODE_A to NODE_B" --answer "ANSWER" --nodes NODE_A NODE_B`.

---

## For /graphify explain

```bash
graphify explain "NODE_NAME"
```

```bash
$(cat graphify-out/.graphify_python) -c "
import json, sys
import networkx as nx
from networkx.readwrite import json_graph
from pathlib import Path

data = json.loads(Path('graphify-out/graph.json').read_text(encoding='utf-8'))
G = json_graph.node_link_graph(data, edges='links')
term_lower = 'NODE_NAME'.lower()
scored = sorted(
    [(sum(1 for w in term_lower.split() if w in G.nodes[n].get('label','').lower()), n) for n in G.nodes()],
    reverse=True)
if not scored or scored[0][0] == 0:
    print(f'No node matching {term_lower!r}'); sys.exit(0)
nid = scored[0][1]; data_n = G.nodes[nid]
print(f'NODE: {data_n.get(\"label\", nid)}')
print(f'  source: {data_n.get(\"source_file\",\"unknown\")}')
print(f'  type: {data_n.get(\"file_type\",\"unknown\")}')
print(f'  degree: {G.degree(nid)}')
print()
print('CONNECTIONS:')
for neighbor in G.neighbors(nid):
    _raw = G[nid][neighbor]; edge = next(iter(_raw.values()), {}) if isinstance(G, nx.MultiGraph) else _raw
    print(f'  --{edge.get(\"relation\",\"\")}--> {G.nodes[neighbor].get(\"label\", neighbor)} [{edge.get(\"confidence\",\"\")}] ({G.nodes[neighbor].get(\"source_file\", \"\")})')
"
```

3–5 sentences + citations. Then `save-result --type explain --question "Explain NODE_NAME" --answer "ANSWER" --nodes NODE_NAME`.
