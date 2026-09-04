---
last_updated_at: 2026-05-25
---

# CI workflows

Governs `.github/workflows/`: path-filtered checks, privileges/secrets, cache warmers, prek invocation, LLM workflow structure.

## Overview

Path-filtered per service — no mega-workflow. Checks: `pull_request` → `dev` only (never raw `push:` on feature branches). Deploys: `push:` to `dev`/`stage`. Caches seeded from `dev` via `cache-warmers.yml`.

```text
.github/workflows/
├── backend-checks.yml / frontend-checks.yml / common-checks.yml
├── *-serverless-deploy.yml
├── cache-warmers.yml
├── conformance.yml / claude.yml   # LLM
└── prepare-release.yml
```

## Triggers — `pull_request` against `dev`

Check workflows: `pull_request: branches: [dev]` + `paths:` including service tree **and** the workflow file itself. Raw `push:` on feature branches MUST NOT gate checks (leaves PR status inconsistent after unrelated follow-ups). Checks do not run on `dev → stage` or feature branches without an open PR.

Trade-off: docs-only follow-up still re-runs full layer suite — PR status always reflects tip. `cache-warmers.yml` keeps re-runs fast.

### Desired ✅

```yaml
on:
  pull_request:
    branches: [dev]
    paths: ["backend/**", ".github/workflows/backend-*.yml"]
```

### Not desired ❌

```yaml
on:
  push:
    branches: ["feature/*"]
```

### Deploy workflows

`push:` to `dev`/`stage` + `workflow_dispatch:`. `concurrency:` group `${{ github.workflow }}-${{ github.ref }}`, `cancel-in-progress: false`.

```yaml
on:
  push: { branches: [dev, stage] }
  workflow_dispatch:
permissions:
  id-token: write
  contents: read
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: false
```

## Workflow permissions

Every workflow MUST declare explicit `permissions:`. MUST NOT omit (default `GITHUB_TOKEN` overpermissive). Path-filter reads: `contents`+`pull-requests` read. OIDC deploy: +`id-token: write`. LLM PR-openers: job-level write trio. Annotate non-obvious scopes.

### Desired ✅

```yaml
permissions:
  contents: read
  pull-requests: read
```

### Not desired ❌

```yaml
# no permissions block
```

## Caching — `cache-warmers.yml` mirrors every PR-gated cache

PR branches restore caches only from own branch or base. Checks do not run on `dev`, so without a seeder every PR starts cold. `cache-warmers.yml` runs on push to `dev` and MUST mirror each `actions/cache` / `setup-*` `cache:` key (same lockfile/OS/tool inputs). New cache in a check workflow → matching warmer job same PR.

### Desired ✅

```yaml
on: { push: { branches: [dev] } }
jobs:
  warm-backend-prek:
    steps:
      - uses: astral-sh/setup-uv@v7
        with: { enable-cache: true, cache-dependency-glob: "backend/uv.lock" }
      - uses: j178/prek-action@v2
        with: { install-only: true, extra-args: "--directory backend" }
```

### Not desired ❌

```yaml
# cache in backend-checks.yml with no mirror in cache-warmers.yml
```

## prek action — v2 discipline

Use `j178/prek-action@v2`. Implicit `--all-files` ONLY when no `extra-args:`. When `extra-args:` present, MUST pass `--all-files` explicitly — else silent skip (green without linting). When `--directory <path>` present, omit `--all-files` (mutually exclusive). Downgrades from v2 need justification in-file.

### Desired ✅

```yaml
# whole-repo
extra-args: "--all-files --config .pre-commit-config.yaml"
# directory scope
extra-args: "--directory backend"
```

### Not desired ❌

```yaml
extra-args: --some-other-flag   # missing --all-files
```

## Related standards

- security.md — permissions + secrets
- tooling-lint-format.md — local prek
