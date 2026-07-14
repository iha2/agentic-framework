# Graphify Setup Kit

Portable package to install Graphify local configuration on a **new computer** or for a **new user** on a consumer repo (reference: **global-services**). No Git conflicts — deployed files are gitignored in the target repo.

**Canonical docs:** [docs/graphify/](../../docs/graphify/README.md) in **agentic-sdlc-framework**.

**Full onboarding:** [docs/graphify/new-computer-setup.md](../../docs/graphify/new-computer-setup.md) — install, daily workflow, HTML, stats.

## Contents

```
tooling/graphify-setup-kit/
├── install.sh              # macOS / Linux
├── install.ps1             # Windows PowerShell
├── install.cmd             # Windows CMD launcher
├── MANIFEST.md
├── README.md
├── required/               # Always copied
│   ├── .graphifyignore
│   └── .cursor/rules/graphify.mdc
├── optional/               # --optional
│   └── scripts/graphify-savings-report.cjs
└── docs/                   # --docs (bundled copies)
    ├── graphify-guide.md
    ├── graphify-new-computer-setup.md
    └── graphify-agent-setup-prompt.md
```

## Vendor into your machine

```bash
rsync -avc /path/to/agentic-sdlc-framework/tooling/graphify-setup-kit/ \
  ~/Documents/Projects/graphify-setup-kit/
```

## Quick start (new computer)

### 1. Copy kit to new machine

Copy this folder (USB, zip, scp, or rsync from agentic-sdlc-framework).

### 2. Install Graphify CLI

```bash
uv tool install graphifyy    # macOS/Linux
pip install graphifyy      # Windows
graphify --help
```

### 3. Clone repo + install deps

```bash
git clone <repo-url> ~/Documents/Projects/global-services
cd global-services && pnpm install
```

### 4. Run installer (full new-user setup)

**macOS / Linux:**

```bash
cd /path/to/graphify-setup-kit
chmod +x install.sh
./install.sh --optional --docs --build --verify ../global-services
```

**Windows:**

```powershell
cd C:\path\to\graphify-setup-kit
.\install.ps1 -Optional -Docs -Build -Verify ..\global-services
```

### 5. Generate reports & HTML (first time)

```bash
cd global-services
node scripts/graphify-savings-report.cjs
GRAPHIFY_VIZ_NODE_LIMIT=12000 graphify cluster-only . --no-label
graphify tree
graphify export callflow-html
```

Open in browser: `reports/graphify/latest-report.html`, `graphify-out/GRAPH_TREE.html`.

### 6. Open in Cursor

Agent rule: `.cursor/rules/graphify.mdc`.

## Install script options

| Flag | `install.sh` | `install.ps1` | Description |
|---|---|---|---|
| Target | `-t`, `--target` | `-Target` | Repo root (default: `../global-services`) |
| Optional | `-o`, `--optional` | `-Optional` | Savings report script |
| Docs | `-d`, `--docs` | `-Docs` | Copy guides to `private/graphify-docs/` |
| Build | `-b`, `--build` | `-Build` | `graphify update .` |
| Verify | `-v`, `--verify` | `-Verify` | Query + benchmark |
| Force | `-f`, `--force` | `-Force` | Overwrite existing |
| Dry run | `-n`, `--dry-run` | `-DryRun` | Preview only |

## What gets deployed

| File | Required? |
|---|---|
| `.graphifyignore` | Yes |
| `.cursor/rules/graphify.mdc` | Yes |
| `scripts/graphify-savings-report.cjs` | Optional (`--optional`) |

**Never copied:** `graphify-out/`, `reports/` — build on each machine.

## After install

See [docs/graphify/new-computer-setup.md](../../docs/graphify/new-computer-setup.md) for:

- Daily workflow
- GRAPH_REPORT.md walkthrough
- Token benchmarks + savings HTML
- All HTML visualizations
- First-week checklist

## References

- Framework docs: [docs/graphify/](../../docs/graphify/README.md)
- Jira: [SKUNK-438](https://sbd-appsvcs-ebiz.atlassian.net/browse/SKUNK-438)
- Upstream: https://github.com/safishamsi/graphify
- Reference consumer: global-services `docs/misc/graphify-local.md`
