# Graphify — New Computer & New User Guide

Complete onboarding for a **new machine** and **new team member** using Graphify with consumer repos (reference: **global-services**). Covers install, daily use, reports, HTML visualizations, and token statistics.

**Companion docs (agentic-sdlc-framework):**

| Doc | When to use |
|---|---|
| [guide.md](./guide.md) | Full reference — querying, troubleshooting, CLI |
| [tooling/graphify-setup-kit/](../../tooling/graphify-setup-kit/README.md) | Portable install package (`install.sh` / `install.ps1`) |
| [agent-setup-prompt.md](./agent-setup-prompt.md) | Let a Cursor agent run setup for you |

**Time required:** ~5–10 minutes with setup kit (+ 5–15 min for first `graphify update .`).

---

## Part 1 — New user primer

### What is Graphify?

Graphify builds a **knowledge graph** of your codebase — functions, classes, imports, call edges — stored locally in `graphify-out/graph.json`. You (and Cursor agents) query it instead of reading hundreds of files.

### Why we use it on global-services

| Without Graphify | With Graphify |
|---|---|
| Many grep passes across ~1,500 files | One `graphify query "..."` → ~20–200 relevant nodes |
| ~635K tokens to "read everything" | ~8K tokens per exploration (**~80x smaller**) |
| Easy to miss cross-service links (OCR ↔ product-id ↔ ops UI) | Bridge nodes and call paths surfaced in graph |

### What gets indexed (scan scope)

Only the **product-id program** — not the whole monorepo:

- `services/ocr/`
- `services/places-proxy/`
- `services/product-id/`
- `web/` (product-id-ops, etc.)

### What stays local (never in Git)

| Path | You build/copy per machine |
|---|---|
| `graphify-out/` | **Build** with `graphify update .` |
| `.graphifyignore` | **Copy** from setup kit |
| `.cursor/rules/graphify.mdc` | **Copy** from setup kit |
| `reports/graphify/` | **Generate** with savings script |
| `scripts/graphify-savings-report.cjs` | **Copy** from setup kit (optional) |

---

## Part 2 — Prerequisites

| Requirement | macOS / Linux | Windows |
|---|---|---|
| **Python 3.10+** | `uv tool install graphifyy` or `pipx install graphifyy` | `pip install graphifyy` or `pipx install graphifyy` |
| **Node.js 24 + pnpm** | For monorepo | Same |
| **Git** | Clone access to global-services | Same |
| **Cursor** (recommended) | Agent rule auto-applies | Same |
| **Setup kit** | Vendor from `agentic-sdlc-framework/tooling/graphify-setup-kit/` or `~/Documents/Projects/graphify-setup-kit/` |

---

## Part 3 — Install on a new computer

### Method A — Setup kit (recommended)

#### A.1 Copy the kit

Copy the entire folder from **agentic-sdlc-framework** `tooling/graphify-setup-kit/` to the new machine (USB, zip, scp, rsync):

```
/path/to/agentic-sdlc-framework/tooling/graphify-setup-kit/   # source
~/Documents/Projects/graphify-setup-kit/                      # vendored copy (macOS/Linux)
%USERPROFILE%\Documents\Projects\graphify-setup-kit\          # vendored copy (Windows)
```

#### A.2 Install CLI + clone repo

**macOS / Linux:**

```bash
uv tool install graphifyy
graphify --help

cd ~/Documents/Projects
git clone <global-services-repo-url> global-services
cd global-services && pnpm install
```

**Windows (PowerShell):**

```powershell
pip install graphifyy
graphify --help

cd $env:USERPROFILE\Documents\Projects
git clone <global-services-repo-url> global-services
cd global-services; pnpm install
```

**PATH fix if `graphify` not found:**

- macOS/Linux: add `~/.local/bin` to PATH
- Windows: add `%APPDATA%\Python\Python313\Scripts` (adjust version)

> PyPI package: **`graphifyy`**. CLI command: **`graphify`**.

#### A.3 Run installer

**macOS / Linux:**

```bash
cd ~/Documents/Projects/graphify-setup-kit
chmod +x install.sh
./install.sh --dry-run ../global-services                    # preview
./install.sh --optional --docs --build --verify ../global-services   # full
```

**Windows:**

```powershell
cd $env:USERPROFILE\Documents\Projects\graphify-setup-kit
.\install.ps1 -DryRun ..\global-services
.\install.ps1 -Optional -Docs -Build -Verify ..\global-services
```

| Flag | Effect |
|---|---|
| `--optional` / `-Optional` | Copy savings report script |
| `--docs` / `-Docs` | Copy guides to `private/graphify-docs/` |
| `--build` / `-Build` | Run `graphify update .` |
| `--verify` / `-Verify` | Sample query + benchmark |
| `--force` / `-Force` | Overwrite existing config |

#### A.4 Open in Cursor

Open the `global-services` folder as workspace root. Agent rule: `.cursor/rules/graphify.mdc`.

---

### Method B — Manual (no kit)

See [guide.md](./guide.md) or copy `.graphifyignore` + `.cursor/rules/graphify.mdc` via scp from a teammate, then:

```bash
cd global-services
graphify update .
```

---

## Part 4 — Verify setup (acceptance checklist)

Run every item before relying on Graphify daily.

| # | Check | Command | Pass criteria |
|---|---|---|---|
| 1 | CLI works | `graphify --help` | Help text prints |
| 2 | Config present | `ls .graphifyignore .cursor/rules/graphify.mdc` | Both exist |
| 3 | Graph built | `test -f graphify-out/graph.json` (or `Test-Path` on Windows) | File exists |
| 4 | Query works | `graphify query "places proxy Google Places" --budget 1200` | Nodes under `services/places-proxy/` |
| 5 | Cross-service | `graphify query "OCR job pipeline" --budget 1500` | Nodes in product-id / ocr / web |
| 6 | Benchmark | `graphify benchmark graphify-out/graph.json` | **50x+** reduction |
| 7 | Git safe | `git status` | No graphify files to commit |
| 8 | Cursor agent | Ask architecture question in agent chat | Agent runs `graphify query` first |

**Expected benchmark ballpark** (scoped graph, Jul 2026 reference):

- ~8,000–10,000 nodes, ~15,000–20,000 edges
- ~80x token reduction vs naive full read
- ~$1.50–$2.00 saved per exploration (illustrative pricing)

---

## Part 5 — Daily workflow (new user)

### Every day

| When | What to do |
|---|---|
| Start of session | `git pull` then `graphify update .` if code changed |
| Exploring unfamiliar code | `graphify query "how does X work"` before opening files |
| Tracing a call chain | `graphify path "functionA" "functionB"` |
| After your code edits | `graphify update .` (AST-only, no API cost) |
| Using Cursor agent | Let it query graph first — rule enforces this |

### Example session

```bash
cd ~/Documents/Projects/global-services

# 1. Refresh graph after pull
git pull
graphify update .

# 2. Explore before reading files
graphify query "GPI catalog ingest trigger" --budget 2000

# 3. Open only the files/lines the graph returned
# 4. After editing code
graphify update .
```

### What agents do (Cursor)

The rule at `.cursor/rules/graphify.mdc` requires agents to:

1. Run `graphify query`, `path`, or `explain` **before** grep/Read/Glob
2. Use graph output to pick specific files and line numbers
3. Run `graphify update .` after modifying code

---

## Part 6 — Reports, statistics & HTML (complete guide)

All outputs are **local and gitignored**. Safe to generate anytime.

### 6.1 Architecture report — `GRAPH_REPORT.md`

**Created automatically** on every `graphify update .`.

**Location:** `graphify-out/GRAPH_REPORT.md`

**What's inside:**

| Section | Use it to |
|---|---|
| **Corpus Check** | See how many files/words are indexed |
| **Summary** | Node/edge counts, EXTRACTED vs INFERRED % |
| **Graph Freshness** | Compare built commit vs `git rev-parse HEAD` |
| **Community Hubs** | Navigate clustered areas of the codebase |
| **Suggested Questions** | Questions the graph is uniquely good at answering |
| **Knowledge Gaps** | Isolated nodes, thin communities — possible missing edges |

**When to read:** onboarding, architecture reviews, finding cross-service bridge nodes.

```bash
# Check if graph is stale
git rev-parse HEAD
grep "Built from commit" graphify-out/GRAPH_REPORT.md
```

---

### 6.2 Token benchmark (terminal stats)

**Command:**

```bash
graphify benchmark graphify-out/graph.json
```

**macOS / Linux / Windows — same command.**

**Sample output:**

```
Corpus:          476,500 words → ~635,333 tokens (naive)
Graph:           9,530 nodes, 19,854 edges
Avg query cost:  ~7,876 tokens
Reduction:       80.7x fewer tokens per query
```

**When to run:** after first setup, after large refactors, weekly spot-check.

**Caveats:** input-token estimates only — not output/reasoning/tool calls.

---

### 6.3 Savings report (history + HTML)

Tracks benchmarks over time. Requires the optional script from setup kit.

**Install script (if missing):**

```bash
# Re-run kit with --optional, or copy manually
./install.sh --optional ../global-services
```

**Generate report:**

```bash
cd global-services
node scripts/graphify-savings-report.cjs
```

**Outputs:**

| File | Format | Purpose |
|---|---|---|
| `reports/graphify/latest-report.md` | Markdown | Human-readable summary |
| `reports/graphify/latest-report.html` | HTML | **Open in browser** — formatted tables |
| `reports/graphify/history.ndjson` | JSON lines | One row per run — trend over time |

**Open HTML report:**

```bash
# macOS
open reports/graphify/latest-report.html

# Linux
xdg-open reports/graphify/latest-report.html

# Windows
start reports\graphify\latest-report.html
```

**Optional env var** (illustrative pricing):

```bash
export GRAPHIFY_PRICE_INPUT_PER_MTOK=3    # macOS/Linux
$env:GRAPHIFY_PRICE_INPUT_PER_MTOK = "3"   # Windows PowerShell
node scripts/graphify-savings-report.cjs
```

**Dry run (no save):**

```bash
node scripts/graphify-savings-report.cjs --no-save
```

---

### 6.4 HTML visualizations

Three different HTML outputs — each serves a different purpose.

#### A. Interactive cluster graph — `graph.html`

**Best for:** exploring communities and connections visually.

```bash
# Default limit is 5000 nodes — our scoped graph is larger
GRAPHIFY_VIZ_NODE_LIMIT=12000 graphify cluster-only . --no-label
```

**Windows PowerShell:**

```powershell
$env:GRAPHIFY_VIZ_NODE_LIMIT = "12000"
graphify cluster-only . --no-label
```

**Output:** `graphify-out/graph.html` (if generated; may also update `GRAPH_REPORT.md`)

**Open:**

```bash
open graphify-out/graph.html          # macOS
start graphify-out\graph.html         # Windows
```

**Skip LLM community naming** (faster, no API): `--no-label` flag above.

**With LLM labels** (slower, needs API key): omit `--no-label` or run `graphify label .`

---

#### B. Collapsible file tree — `GRAPH_TREE.html`

**Best for:** browsing repo structure and symbol hierarchy.

```bash
graphify tree
```

**Output:** `graphify-out/GRAPH_TREE.html`

```bash
open graphify-out/GRAPH_TREE.html     # macOS
start graphify-out\GRAPH_TREE.html    # Windows
```

---

#### C. Call-flow diagram — `global-services-callflow.html`

**Best for:** architecture diagrams, cross-service call flows.

```bash
graphify export callflow-html
```

**Output:** `graphify-out/global-services-callflow.html` (Mermaid-based, interactive)

```bash
open graphify-out/global-services-callflow.html
```

---

### 6.5 HTML & stats — recommended first-time sequence

Run once after initial setup to familiarize yourself with outputs:

```bash
cd global-services

# 1. Architecture markdown (already exists after update)
less graphify-out/GRAPH_REPORT.md    # or open in editor

# 2. Terminal benchmark
graphify benchmark graphify-out/graph.json

# 3. Savings report (needs optional script)
node scripts/graphify-savings-report.cjs
open reports/graphify/latest-report.html

# 4. HTML visualizations
GRAPHIFY_VIZ_NODE_LIMIT=12000 graphify cluster-only . --no-label
graphify tree
graphify export callflow-html

# 5. Open all HTML
open graphify-out/graph.html graphify-out/GRAPH_TREE.html graphify-out/global-services-callflow.html
```

**Windows:** replace `open` with `start`, use `$env:GRAPHIFY_VIZ_NODE_LIMIT = "12000"` before `cluster-only`.

---

### 6.6 Optional automation

| Command | What it does |
|---|---|
| `graphify watch .` | Background — rebuilds graph on file save |
| `graphify hook install` | Rebuilds graph after every `git commit` |
| `graphify hook status` | Check if hooks are installed |

Hooks write to gitignored `.husky/post-commit` — safe, local only.

---

## Part 7 — Copy vs rebuild reference

| Artifact | Copy from teammate? | Build on new machine? |
|---|---|---|
| `graphify-setup-kit/` | **Yes** — whole folder | — |
| `.graphifyignore` | Via kit or scp | — |
| `.cursor/rules/graphify.mdc` | Via kit or scp | — |
| `scripts/graphify-savings-report.cjs` | Via kit `--optional` | — |
| `graphify-out/` | **Never** | `graphify update .` |
| `reports/graphify/` | **Never** | `node scripts/graphify-savings-report.cjs` |
| HTML files | **Never** | `cluster-only`, `tree`, `export callflow-html` |

---

## Part 8 — Troubleshooting

| Problem | Fix |
|---|---|
| `graphify: command not found` | Install CLI; fix PATH |
| Graph empty / missing nodes | Run from repo root; check `.graphifyignore` |
| Query returns wrong area | Use specific symbol names; run `graphify update .` |
| Agent ignores Graphify | Reopen workspace; confirm `.cursor/rules/graphify.mdc` |
| HTML viz truncated | Set `GRAPHIFY_VIZ_NODE_LIMIT=12000` |
| Savings script fails | Ensure `graphify` on PATH and `graph.json` exists |
| Accidentally staged graphify files | `git reset HEAD <file>` — do not commit |
| PowerShell blocks install.ps1 | Use `install.cmd` or `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |

---

## Part 9 — First-week checklist (new user)

- [ ] Completed Part 3 install (kit or manual)
- [ ] Passed Part 4 acceptance checklist
- [ ] Ran `graphify query` at least once manually
- [ ] Read `graphify-out/GRAPH_REPORT.md` summary section
- [ ] Ran `graphify benchmark` and noted your reduction ratio
- [ ] Generated savings report + opened `latest-report.html`
- [ ] Generated at least one HTML viz (`tree` or `callflow-html`)
- [ ] Confirmed Cursor agent uses graphify before grep
- [ ] Know to run `graphify update .` after `git pull`
- [ ] Know Graphify files must never be committed

---

## Quick copy-paste

**macOS / Linux (full new machine):**

```bash
uv tool install graphifyy
git clone <repo-url> ~/Documents/Projects/global-services
cd ~/Documents/Projects/global-services && pnpm install
cd ~/Documents/Projects/graphify-setup-kit && chmod +x install.sh
./install.sh -o -d -b -v ../global-services
node ../global-services/scripts/graphify-savings-report.cjs  # if -o used; run from repo root instead:
cd ../global-services && node scripts/graphify-savings-report.cjs
GRAPHIFY_VIZ_NODE_LIMIT=12000 graphify cluster-only . --no-label
graphify tree && graphify export callflow-html
```

**Windows (full new machine):**

```powershell
pip install graphifyy
git clone <repo-url> $env:USERPROFILE\Documents\Projects\global-services
cd $env:USERPROFILE\Documents\Projects\global-services; pnpm install
cd $env:USERPROFILE\Documents\Projects\graphify-setup-kit
.\install.ps1 -Optional -Docs -Build -Verify ..\global-services
cd ..\global-services
node scripts\graphify-savings-report.cjs
$env:GRAPHIFY_VIZ_NODE_LIMIT = "12000"; graphify cluster-only . --no-label
graphify tree; graphify export callflow-html
start reports\graphify\latest-report.html
```

---

## References

- [guide.md](./guide.md) — complete reference
- [tooling/graphify-setup-kit/README.md](../../tooling/graphify-setup-kit/README.md) — install scripts
- [agent-setup-prompt.md](./agent-setup-prompt.md) — agent-driven setup
- `global-services/docs/misc/graphify-local.md` — in-repo pointer (reference consumer)
- https://github.com/safishamsi/graphify
- Jira: [SKUNK-438](https://sbd-appsvcs-ebiz.atlassian.net/browse/SKUNK-438)
