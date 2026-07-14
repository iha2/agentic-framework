# Graphify — code knowledge graph for agentic delivery

[Graphify](https://github.com/safishamsi/graphify) builds a **queryable knowledge graph** from source code (and optionally docs). Agents explore the codebase structurally — `graphify query`, `path`, and `explain` — instead of brute-forcing grep and full-file reads across large monorepos.

This framework ships **canonical documentation** and a **portable setup kit** so consumer repos can adopt Graphify without Git conflicts. Graphify artifacts stay **local and gitignored** on each machine; only pointers and tooling live in Git.

**Reference adoption:** [global-services](https://github.com/Customer-Engagement-Digital-Technology/global-services) (product-id program) — Jira [SKUNK-438](https://sbd-appsvcs-ebiz.atlassian.net/browse/SKUNK-438).

---

## Start here

| Audience | Document |
| --- | --- |
| **New user / new computer** | [new-computer-setup.md](./new-computer-setup.md) — install, verify, daily workflow, HTML, stats |
| **Complete reference** | [guide.md](./guide.md) — querying, scope, benchmarks, troubleshooting |
| **Cursor agent setup** | [agent-setup-prompt.md](./agent-setup-prompt.md) — copy-paste prompt for automated setup |
| **Portable install package** | [tooling/graphify-setup-kit/](../../tooling/graphify-setup-kit/README.md) — `install.sh`, `install.ps1`, `install.cmd` |

---

## Quick setup (consumer repo)

### 1. Vendor the setup kit

Copy the kit from this framework into your machine or sync into the consumer repo's tooling area:

```bash
# One-time: copy kit to your Projects folder (or vendor into consumer repo)
rsync -avc /path/to/agentic-sdlc-framework/tooling/graphify-setup-kit/ \
  ~/Documents/Projects/graphify-setup-kit/
```

Or reference it directly from a cloned `agentic-sdlc-framework` checkout.

### 2. Install CLI

```bash
uv tool install graphifyy          # macOS / Linux (Python 3.10+)
# Windows: pip install graphifyy
graphify --help
```

> PyPI package is temporarily named **`graphifyy`**; the CLI command is **`graphify`**.

### 3. Run installer against target repo

```bash
cd ~/Documents/Projects/graphify-setup-kit   # or framework tooling path
chmod +x install.sh
./install.sh --optional --docs --build --verify ../global-services
```

**Windows:**

```powershell
.\install.ps1 -Optional -Docs -Build -Verify ..\global-services
```

| Flag | Purpose |
| --- | --- |
| `--optional` | Copy savings report script |
| `--docs` | Copy guides to `private/graphify-docs/` in target |
| `--build` | Run `graphify update .` |
| `--verify` | Sample query + benchmark |

### 4. Reports and HTML (first time)

```bash
cd global-services   # or your target repo root

graphify benchmark graphify-out/graph.json
node scripts/graphify-savings-report.cjs                # needs --optional
GRAPHIFY_VIZ_NODE_LIMIT=12000 graphify cluster-only . --no-label
graphify tree
graphify export callflow-html
```

Open `graphify-out/GRAPH_REPORT.md`, `reports/graphify/latest-report.html`, and `graphify-out/GRAPH_TREE.html` in a browser.

---

## What gets deployed (local only)

The setup kit copies **gitignored** files into the consumer repo:

| File | Required | Purpose |
| --- | --- | --- |
| `.graphifyignore` | Yes | Scan scope (which trees to index) |
| `.cursor/rules/graphify.mdc` | Yes | Cursor agent must query graph before grep/Read |
| `scripts/graphify-savings-report.cjs` | Optional | Benchmark history → `reports/graphify/` |

**Never copy:** `graphify-out/`, `reports/` — build on each machine with `graphify update .`.

Consumer repos should add matching `.gitignore` entries. See [global-services `docs/misc/graphify-local.md`](https://github.com/Customer-Engagement-Digital-Technology/global-services/blob/main/docs/misc/graphify-local.md) for the reference pattern.

---

## Agent workflow (Cursor)

The deployed rule `.cursor/rules/graphify.mdc` requires agents to:

1. Run `graphify query`, `path`, or `explain` **before** `Read`, `Grep`, `Glob`, or shell exploration.
2. Use graph output to pick specific files and line numbers.
3. Run `graphify update .` after modifying scoped code.

This aligns with [agent execution discipline](../agent-execution-discipline.md) — bounded, evidence-based exploration instead of unbounded corpus reads.

---

## Token savings (reference, Jul 2026)

Scoped **global-services** product-id program graph (illustrative):

| Metric | Value |
| --- | --- |
| Files indexed | ~1,493 |
| Corpus (naive) | ~635K tokens |
| Avg query context | ~7,876 tokens |
| Reduction | **~80.7x** |
| Est. saved per exploration | **~$1.88** (illustrative $3/1M input tokens) |

Run `graphify benchmark graphify-out/graph.json` on your machine for local numbers.

---

## Daily commands

```bash
graphify update .                              # after git pull or code edits
graphify query "how does product-id call OCR"  # explore
graphify benchmark graphify-out/graph.json     # stats
```

---

## Framework layout

```text
docs/graphify/
├── README.md                 # This file — adoption entry point
├── guide.md                  # Complete reference
├── new-computer-setup.md     # New machine + new user onboarding
└── agent-setup-prompt.md     # Copy-paste Cursor agent prompt

tooling/graphify-setup-kit/
├── install.sh / install.ps1 / install.cmd
├── required/                 # .graphifyignore, .cursor/rules/graphify.mdc
├── optional/scripts/         # graphify-savings-report.cjs
└── docs/                     # Kit-bundled copies of guides
```

---

## References

- Upstream Graphify: https://github.com/safishamsi/graphify
- Jira: [SKUNK-438](https://sbd-appsvcs-ebiz.atlassian.net/browse/SKUNK-438)
- Reference consumer: global-services `docs/misc/graphify-local.md`
