# Graphify setup prompt (copy-paste to agent)

Copy everything inside the fenced block below and paste it into Cursor (or another coding agent) on the **new computer**.

**Faster alternative:** use the setup kit script instead of an agent:

```bash
cd ~/Documents/Projects/graphify-setup-kit
./install.sh --optional --build --verify ../global-services
```

See [graphify-setup-kit/README.md](./graphify-setup-kit/README.md).

---

```
Set up Graphify for the global-services monorepo on this machine. Follow every step below. Run commands yourself — do not just describe what to do.

## Context

- Repo path: ~/Documents/Projects/global-services (clone here if missing)
- Graphify is LOCAL-ONLY — all artifacts are gitignored; nothing Graphify-related should be committed
- Scan scope: services/ocr, services/places-proxy, services/product-id, and all of web/
- Reference docs (if present on this machine): ~/Documents/Projects/graphify-guide.md, graphify-new-computer-setup.md
- Setup kit (preferred if present): ~/Documents/Projects/graphify-setup-kit/install.sh

## Goals

1. Install Graphify CLI
2. Ensure repo is cloned and dependencies installed
3. Create/copy required local config files
4. Build the knowledge graph
5. Verify with queries and benchmark
6. Confirm no Graphify files are staged for git commit

## Step 1 — Install Graphify CLI

```bash
uv tool install graphifyy
# fallback if uv unavailable: pipx install graphifyy
graphify --help
```

If `graphify` is not on PATH, fix PATH and retry before continuing.

## Step 2 — Repo setup

```bash
cd ~/Documents/Projects/global-services
# If repo missing: git clone <repo-url> ~/Documents/Projects/global-services
pnpm install
```

Confirm we are at monorepo root (package.json, services/, web/ exist).

## Step 3 — Deploy local config files

**If setup kit exists**, run:

```bash
cd ~/Documents/Projects/graphify-setup-kit
chmod +x install.sh
./install.sh --optional ../global-services
```

**Otherwise**, create these files manually:

### 3a. `.graphifyignore` (repo root)

```
# Graphify scan scope: product-id program surfaces only
/*
!services/
!web/

services/*
!services/ocr/
!services/places-proxy/
!services/product-id/

node_modules/
.pnpm-store/
.turbo/
.next/
.nuxt/
dist/
build/
out/
coverage/
.nyc_output/
*.tsbuildinfo
.git/
graphify-out/
.husky/_/

.env
.env.*
```

### 3b. `.cursor/rules/graphify.mdc`

```
---
description: graphify knowledge graph context
alwaysApply: true
---

This project has a graphify knowledge graph at graphify-out/. The scan scope is limited by repo-root `.graphifyignore` to `services/ocr`, `services/places-proxy`, `services/product-id`, and all of `web/` (see that file for exclusions such as `node_modules/`).

**MANDATORY: Before using Read, Grep, Glob, or Bash to explore the codebase, you MUST run graphify first:**
- `graphify query "<question>"` — scoped subgraph for any codebase or architecture question
- `graphify path "<A>" "<B>"` — dependency path between two symbols
- `graphify explain "<concept>"` — all nodes related to a concept

This applies to YOU and to every subagent you spawn. Include this rule explicitly in every subagent prompt that involves code exploration. Do not skip graphify because files are "already known" or because you are executing a plan — the graph surfaces cross-file dependencies and INFERRED edges that grep and Read cannot find.

Only use Read/Grep/Glob directly when:
1. graphify has already oriented you and you need to modify or debug specific lines
2. `graphify-out/graph.json` does not exist yet

- If `graphify-out/wiki/index.md` exists, navigate it instead of reading raw files
- Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review when query/path/explain do not surface enough context
- After modifying code files, run `graphify update .` to keep the graph current (AST-only, no API cost)
```

Create `.cursor/rules/` directory if needed.

Do NOT copy `graphify-out/` from another machine — build fresh on this machine.

## Step 4 — Build the graph

```bash
cd ~/Documents/Projects/global-services
graphify update .
```

Wait for completion. Expect `graphify-out/graph.json`, `GRAPH_REPORT.md`, `manifest.json`, and `cache/`.

## Step 5 — Verify

Run all checks and report results:

```bash
# Graph exists
test -f graphify-out/graph.json && echo "PASS: graph.json"

# Sample query — places-proxy
graphify query "places proxy Google Places client" --budget 1200

# Sample query — OCR / product-id
graphify query "OCR job pipeline product-id" --budget 1500

# Benchmark
graphify benchmark graphify-out/graph.json

# No accidental git commits
git status
```

**Pass criteria:**
- `graphify-out/graph.json` exists with thousands of nodes (expect ~8K–10K)
- Queries return nodes under services/places-proxy, services/product-id, services/ocr, and/or web/
- Benchmark shows 50x+ token reduction
- `git status` does NOT show graphify-out/, .graphifyignore, or .cursor/rules/graphify.mdc as files to commit

## Step 6 — Optional extras (reports & HTML)

If setup kit was run with `--optional`, the savings script is present. After `graphify update .` succeeds:

```bash
cd ~/Documents/Projects/global-services
node scripts/graphify-savings-report.cjs
GRAPHIFY_VIZ_NODE_LIMIT=12000 graphify cluster-only . --no-label
graphify tree
graphify export callflow-html
open reports/graphify/latest-report.html graphify-out/GRAPH_TREE.html
```

See `~/Documents/Projects/graphify-new-computer-setup.md` Part 6 for full details on each output.

## Rules

- NEVER commit graphify-out/, .graphifyignore, .cursor/rules/graphify.mdc, or reports/
- NEVER copy stale graphify-out/ from another machine
- If any step fails, diagnose and fix before moving on
- After setup, tell me: node count, benchmark reduction ratio, and whether git status is clean

## Output format

When done, report:

1. **Status** — success or what failed
2. **Graph stats** — nodes, edges, corpus size from benchmark
3. **Benchmark** — reduction ratio and avg query tokens
4. **Sample query** — one example output (brief)
5. **Git safety** — confirm no Graphify files to commit
6. **Next steps** — run `graphify update .` after git pull or code edits
```

---

## Shorter version (minimal prompt)

Use this if you want a compact prompt:

```
Set up Graphify on this machine for ~/Documents/Projects/global-services.

1. `uv tool install graphifyy` and verify `graphify --help`
2. `cd ~/Documents/Projects/global-services && pnpm install`
3. Create `.graphifyignore` (scope: services/ocr, places-proxy, product-id, web/) and `.cursor/rules/graphify.mdc` (agents must run graphify query/path/explain before grep/Read)
4. `graphify update .` from repo root — do NOT copy graphify-out from elsewhere
5. Verify: `graphify query "places proxy cache"`, `graphify benchmark graphify-out/graph.json`, `git status` (no graphify files to commit)

Report node count, benchmark reduction, and pass/fail. Fix any errors yourself. Never commit gitignored Graphify files.
```

---

## Tips

- **Fastest path:** `graphify-setup-kit/install.sh -o -b -v` — no agent needed.
- Run the prompt in **Agent mode** on the new computer with the global-services folder open (or let the agent clone it).
- If you have the reference machine handy, copy the whole `graphify-setup-kit/` folder instead of recreating files.
- After setup, run `graphify update .` whenever you `git pull` or change scoped code.
