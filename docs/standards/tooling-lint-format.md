---
last_updated_at: 2026-05-25
---

# Tooling, lint, and format

Python/TypeScript monorepo toolchain: ruff, mypy, `google/yamlfmt`, `prek` (not stock `pre-commit`; configs keep
`.pre-commit-config.yaml` name). Replace tool names for other stacks; keep placement, pinning, and evidence rules.
Voice: [docs-hygiene.md](./docs-hygiene.md).

```text
.pre-commit-config.yaml   # root: yamlfmt, mdformat, trailing-whitespace, check-yaml, …
.yamlfmt.yaml             # root only
backend/pyproject.toml + .pre-commit-config.yaml   # ruff, mypy, taplo, shellcheck, sqlfluff
frontend/.pre-commit-config.yaml                   # biome, tsc
```

Cross-service tools at root; service-scoped tools in that service. Service-level copy of a repo-wide tool is a smell.

## mypy configuration

### Prefer `types-*` stubs over `[[tool.mypy.overrides]]`

Before an override, check PyPI for `types-<lib>`; install as dev dep. Uncommented `ignore_missing_imports = true`
MUST NOT be used when stubs exist. Necessary overrides MUST carry an inline reason comment.

#### Desired ✅

```toml
[dependency-groups]
dev = [
  "types-Flask-Cors>=6.0.0.20250809,<7",
  "types-passlib>=1.7.7.20260211,<2",
  "types-reportlab>=4.4.10.20260408,<5",
]
# no [[tool.mypy.overrides]] when stubs cover usage

[[tool.mypy.overrides]]  # only when necessary
module = "some.lib"
ignore_missing_imports = true
# types-somelib covers HTTP client only; async transport has no stubs yet.
```

#### Not desired ❌

```toml
[[tool.mypy.overrides]]
module = "reportlab"
ignore_missing_imports = true  # types-reportlab exists — add stub, delete override
```

### Run mypy via local hook, not isolated prek hook

Backend uses `repo: local` → `uv run mypy .` so `types-*` stay synced with `pyproject.toml`. Same pattern for tools with
stubs/plugins (e.g. sqlfluff).

#### Desired ✅

```yaml
- repo: local
  hooks:
    - id: mypy
      name: "[backend] typecheck with mypy"
      entry: "uv run mypy ."
      language: system
      pass_filenames: false
```

## yamlfmt and YAML hooks

### `.yamlfmt.yaml` at repo root only

Root `.pre-commit-config.yaml` registers pinned `google/yamlfmt`. MUST NOT add service-level `.yamlfmt.yaml` or
service-level yamlfmt hooks.

#### Desired ✅

```yaml
# .pre-commit-config.yaml (root)
- repo: https://github.com/google/yamlfmt
  rev: v0.21.0
  hooks:
    - id: yamlfmt
```

#### Not desired ❌

```yaml
# backend/.pre-commit-config.yaml — yamlfmt at service level leaves root/frontend uncovered
- repo: https://github.com/google/yamlfmt
  rev: v0.21.0
  hooks:
    - id: yamlfmt
```

### Exclude YAML from `end-of-file-fixer`

yamlfmt owns YAML trailing newlines (`eof_newline: true`). Exclude `*.yaml|*.yml` from `end-of-file-fixer` or hooks
fight. Exclude intentional non-strict YAML (e.g. `frontend/serverless.yml`) from `check-yaml` with a why-comment.

#### Desired ✅

```yaml
- id: end-of-file-fixer
  exclude: '\.(yaml|yml)$' # yamlfmt manages this
- id: check-yaml
  exclude: "frontend/serverless\\.yml"  # CloudFormation extensions
```

## ruff

### Lint rule selection and per-file ignores

Pin ruff in `pyproject.toml` to the same version as the pre-commit hook; bump both in one commit. Each
`select`/`ignore` line MUST comment the family/rule + docs link (or permanent reason / `TODO: enable`). Per-file
ignores MUST name why.

#### Desired ✅

```toml
[tool.ruff.lint]
select = [
  "B",  # flake8-bugbear: https://docs.astral.sh/ruff/rules/#flake8-bugbear-b
  "I",  # isort: https://docs.astral.sh/ruff/rules/#isort-i
]
ignore = [
  "SIM108", # ternaries harder to read than if-else
  "S101",   # assert useful with mypy strict; tests skip -O
  "S603",   # TODO: enable
]
[tool.ruff.lint.per-file-ignores]
"tests/**/test_*.py" = ["PLR2004"]  # magic values common in tests
"scripts/*.py" = ["INP001", "T201", "T203"]  # standalone scripts
```

### Banned imports

`[tool.ruff.lint.flake8-tidy-imports.banned-api]` blocks call sites; `.msg` MUST name the replacement.

#### Desired ✅

```toml
[tool.ruff.lint.flake8-tidy-imports.banned-api]
"logging.getLogger".msg = "Use logging_config.get_logger instead"
```

### Aliased and unaliased imports stay in separate `from` blocks

`combine-as-imports = false` (default). Merging aliased + unaliased triggers `I001`; `ruff --fix` re-splits. Do not
flip `combine-as-imports = true` in a feature PR.

#### Desired ✅

```python
from svc.reports.vendor_summary import service
from svc.reports.vendor_summary import (pdf as asm_pdf,)
```

#### Not desired ❌

```python
from svc.reports.vendor_summary import (service, pdf as asm_pdf,)
```

### `ruff-format` and `ruff-check` both run in pre-commit

Same pinned `ruff-pre-commit` rev as `ruff==…` / `sqlfluff==…` in `[dependency-groups].dev` (comment: must match hook
version).

#### Desired ✅

```yaml
- repo: https://github.com/astral-sh/ruff-pre-commit
  rev: v0.15.2
  hooks:
    - id: ruff-format
    - id: ruff-check
      args: ["--fix"]
```

```toml
"ruff==0.15.2",     # must match pre-commit hook version
"sqlfluff==4.0.4",  # must match pre-commit hook version
```

## Related standards

- [pr-process.md](./pr-process.md) — hooks vs review process
- [ci-workflows.md](./ci-workflows.md) — CI re-runs the same hooks
- [docs-hygiene.md](./docs-hygiene.md) — markdown conventions / `mdformat`
