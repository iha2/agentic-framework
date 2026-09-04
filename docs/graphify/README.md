# Graphify — code knowledge graph for agentic delivery

Setup package for Graphify on a new machine, or use upstream: [Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify) (Claude Code, Codex, OpenCode, Cursor, Gemini, etc.).

## Simplest setup (recommended)

1. Unzip the setup kit.
2. Open Cursor; start a new agent in the project directory.
3. Attach `graphify-setup-kit/` in chat.
4. Ask: “Set up Graphify in this *project name*.”
5. The agent uses docs/prompt/install scripts; paste errors back if it fails.

Kit: [tooling/graphify-setup-kit/](../../tooling/graphify-setup-kit/README.md). Manual steps below.

---

[Graphify](https://github.com/Graphify-Labs/graphify) builds a **queryable knowledge graph** from source (and optionally docs). Agents explore via `graphify query` / `path` / `explain` instead of brute-force grep and full-file reads.

This framework ships **canonical docs** and a **portable setup kit**. Graphify artifacts stay **local and gitignored**; only pointers and tooling live in Git.

**Reference adoption:** [global-services](https://github.com/Customer-Engagement-Digital-Technology/global-services) (product-id) — Jira [SKUNK-438](https://sbd-appsvcs-ebiz.atlassian.net/browse/SKUNK-438).

---

## Start here

| Audience | Document |
| --- | --- |
| New user / machine | [new-computer-setup.md](./new-computer-setup.md) |
| Complete reference | [guide.md](./guide.md) |
| Cursor agent setup | [agent-setup-prompt.md](./agent-setup-prompt.md) |
| Portable install | [tooling/graphify-setup-kit/](../../tooling/graphify-setup-kit/README.md) |

---

## Quick setup (consumer repo)

### 1. Vendor the kit

```bash
rsync -avc /path/to/agentic-sdlc-framework/tooling/graphify-setup-kit/ \
  ~/Documents/Projects/graphify-setup-kit/
```

Or reference a cloned framework checkout.

### 2. Install CLI

```bash
uv tool install graphifyy          # macOS / Linux (Python 3.10+)
# Windows: pip install graphifyy
graphify --help
```

> PyPI package is temporarily **`graphifyy`**; CLI command is **`graphify`**.

### 3. Install against target repo

```bash
cd ~/Documents/Projects/graphify-setup-kit
chmod +x install.sh
./install.sh --optional --docs --build --verify ../global-services
```

**Windows:** `.\install.ps1 -Optional -Docs -Build -Verify ..\global-services`

| Flag | Purpose |
| --- | --- |
| `--optional` | Savings report script |
| `--docs` | Guides → `private/graphify-docs/` |
| `--build` | `graphify update .` |
| `--verify` | Sample query + benchmark |

### 4. Reports and HTML (first time)

```bash
cd global-services
graphify benchmark graphify-out/graph.json
node scripts/graphify-savings-report.cjs                # needs --optional
GRAPHIFY_VIZ_NODE_LIMIT=12000 graphify cluster-only . --no-label
graphify tree
graphify export callflow-html
```

Open `graphify-out/GRAPH_REPORT.md`, `reports/graphify/latest-report.html`, `graphify-out/GRAPH_TREE.html`.

---

## What gets deployed (local only)

| File | Required | Purpose |
| --- | --- | --- |
| `.graphifyignore` | Yes | Scan scope |
| `.cursor/rules/graphify.mdc` | Yes | Query graph before grep/Read |
| `scripts/graphify-savings-report.cjs` | Optional | Benchmark → `reports/graphify/` |

**Never copy** `graphify-out/` or `reports/` — build per machine with `graphify update .`.

Add matching `.gitignore` entries. Reference: [global-services `docs/misc/graphify-local.md`](https://github.com/Customer-Engagement-Digital-Technology/global-services/blob/main/docs/misc/graphify-local.md).

---

## Agent workflow (Cursor)

`.cursor/rules/graphify.mdc` requires:

1. `graphify query` / `path` / `explain` **before** Read/Grep/Glob/shell exploration.
2. Use graph output to pick files/lines.
3. `graphify update .` after modifying scoped code.

Aligns with [agent execution discipline](../agent-execution-discipline.md).

---

## Token savings (reference, Jul 2026)

Scoped global-services product-id graph (illustrative): ~1,493 files; ~635K corpus tokens; ~7,876 avg query context; **~80.7x** reduction; **~$1.88** saved/exploration (illustrative $3/1M). Run `graphify benchmark graphify-out/graph.json` locally.

---

## Daily commands

```bash
graphify update .                              # after pull or edits
graphify query "how does product-id call OCR"
graphify benchmark graphify-out/graph.json
```

---

## Framework layout

```text
docs/graphify/          README, guide.md, new-computer-setup.md, agent-setup-prompt.md
tooling/graphify-setup-kit/
  install.sh|ps1|cmd, required/, optional/scripts/, docs/
```

---

## References

- Upstream: https://github.com/Graphify-Labs/graphify
- Jira: [SKUNK-438](https://sbd-appsvcs-ebiz.atlassian.net/browse/SKUNK-438)
- Consumer: global-services `docs/misc/graphify-local.md`
