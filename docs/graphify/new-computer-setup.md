# Graphify — New Computer & New User Guide

Compressed 2026-09 for token reduction; full prior text in Git history before this change.

Companion: [guide.md](./guide.md) · [tooling/graphify-setup-kit/](../../tooling/graphify-setup-kit/README.md) · [agent-setup-prompt.md](./agent-setup-prompt.md)

~5–10 min with kit (+ 5–15 min first `graphify update .`). PyPI: **`graphifyy`** · CLI: **`graphify`**.

## Prerequisites

Python 3.10+, Git, Cursor (recommended), Node/pnpm if building the consumer monorepo. Setup kit from `agentic-sdlc-framework/tooling/graphify-setup-kit/` (or vendored `~/Documents/Projects/graphify-setup-kit/`).

**Never commit:** `graphify-out/`, `.graphifyignore`, `.cursor/rules/graphify.mdc`, `reports/graphify/` (build/copy per machine).

## Setup steps

1. **Copy kit** to the new machine (`~/Documents/Projects/graphify-setup-kit/` or `%USERPROFILE%\Documents\Projects\graphify-setup-kit\`).

2. **Install CLI**
   - macOS/Linux: `uv tool install graphifyy` (ensure `~/.local/bin` on PATH)
   - Windows: `pip install graphifyy` (or pipx); fix Scripts PATH if needed

3. **Clone / open consumer repo** (e.g. global-services) and install deps (`pnpm install` if applicable).

4. **Run installer** from the kit against the repo:
   ```bash
   # macOS/Linux
   cd ~/Documents/Projects/graphify-setup-kit
   chmod +x install.sh
   ./install.sh --optional --docs --build --verify ../global-services
   ```
   ```powershell
   # Windows
   cd $env:USERPROFILE\Documents\Projects\graphify-setup-kit
   .\install.ps1 -Optional -Docs -Build -Verify ..\global-services
   ```
   Flags: `--optional` savings script · `--docs` · `--build` · `--verify` · `--force` · `--dry-run`.  
   Manual fallback: copy `.graphifyignore` + `.cursor/rules/graphify.mdc`, then `graphify update .`.

5. **Open repo as Cursor workspace root** (rule: `.cursor/rules/graphify.mdc`).

6. **Verify**
   | Check | Pass |
   | --- | --- |
   | `graphify --help` | Help prints |
   | `.graphifyignore` + graphify Cursor rule exist | Present |
   | `graphify-out/graph.json` | Exists |
   | `graphify query "places proxy Google Places" --budget 1200` | Relevant nodes |
   | `graphify benchmark graphify-out/graph.json` | Large reduction (≈50x+) |
   | `git status` | No graphify artifacts staged |

7. **Daily**
   - After pull/edits: `graphify update .`
   - Before explore: `graphify query "…"` / `path` / `explain`
   - Optional: `node scripts/graphify-savings-report.cjs`; HTML via `graphify tree`, `GRAPHIFY_VIZ_NODE_LIMIT=12000 graphify cluster-only . --no-label`, `graphify export callflow-html`

## Copy vs rebuild

| Artifact | Action |
| --- | --- |
| Setup kit, `.graphifyignore`, Cursor rule, savings script | Copy via kit |
| `graphify-out/`, reports, HTML | **Rebuild** on each machine |

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `command not found` | Reinstall CLI; fix PATH |
| Empty/wrong graph | Run from repo root; check `.graphifyignore`; `graphify update .` |
| Agent ignores Graphify | Reopen workspace; confirm rule file |
| Truncated HTML | `GRAPHIFY_VIZ_NODE_LIMIT=12000` |
| Staged gitignored files | `git reset HEAD <file>` — do not commit |
| PowerShell blocks `install.ps1` | `install.cmd` or `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
