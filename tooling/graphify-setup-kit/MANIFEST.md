# Graphify setup kit — file manifest

Portable package to deploy Graphify local configuration to **global-services** (or another checkout).

| Script | Platform |
|---|---|
| `install.sh` | macOS, Linux, Git Bash |
| `install.ps1` | Windows PowerShell 5.1+ |
| `install.cmd` | Windows CMD (wraps `install.ps1`) |

## Required (copied by default)

| Kit path | Deployed to | Purpose |
|---|---|---|
| `required/.graphifyignore` | `<target>/.graphifyignore` | Limits indexing to product-id program surfaces |
| `required/.cursor/rules/graphify.mdc` | `<target>/.cursor/rules/graphify.mdc` | Cursor agent must query graph before grep/Read |

## Optional (`--optional`)

| Kit path | Deployed to | Purpose |
|---|---|---|
| `optional/scripts/graphify-savings-report.cjs` | `<target>/scripts/graphify-savings-report.cjs` | Benchmark history → `reports/graphify/` |

## Reference docs (`--docs`)

Copied to `<target>/private/graphify-docs/` (gitignored personal folder if present):

| Kit path | Purpose |
|---|---|
| `docs/graphify-guide.md` | Complete Graphify reference |
| `docs/graphify-new-computer-setup.md` | New machine setup guide |
| `docs/graphify-agent-setup-prompt.md` | Copy-paste agent prompt |

## Never included (build on each machine)

| Path | Why |
|---|---|
| `graphify-out/` | Stale if copied; run `graphify update .` locally |
| `reports/graphify/` | Machine-specific benchmark history |
| `.husky/post-commit` | Run `graphify hook install` locally if wanted |

## Git safety

All deployed files except docs under `private/` match **global-services `.gitignore`** — they must not be committed.
