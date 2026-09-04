---
last_updated_at: 2026-05-25
---

# Security

Stack-specific baseline for GitHub Actions + npm frontend deps. Covers workflow secret/privilege scope, CVE-remediation PR identity, residual audit docs, and direct-dependency risk reduction. Other CI/package managers: replace examples; keep the same requirements.

## Workflow secrets are workflow-scoped

Every LLM-invoking workflow MUST consume a secret named for that workflow. MUST NOT reuse a sibling workflow's key. Naming: `LLM_API_KEY_CONFORMANCE_WORKFLOW`, `LLM_API_KEY_REVIEWER`, etc.

Sequence for new LLM workflows: provision key ticket → set GitHub secret → merge workflow. MUST NOT merge a workflow referencing an unprovisioned secret or point at an existing secret as placeholder.

### Desired

```yaml
# conformance.yml
llm_api_key: ${{ secrets.LLM_API_KEY_CONFORMANCE_WORKFLOW }}
# reviewer.yml
llm_api_key: ${{ secrets.LLM_API_KEY_REVIEWER }}
```

### Not desired

```yaml
api_key: ${{ secrets.SHARED_LLM_API_KEY }}
```

## Explicit minimum-privilege `permissions:`

Every `.github/workflows/` file MUST declare `permissions:` (top-level or per-job). MUST NOT rely on implicit default `GITHUB_TOKEN` scope. Annotate non-obvious scopes with a one-line why.

Observed scopes: path-filtered checks → `contents: read` + `pull-requests: read`; OIDC deploy → `id-token: write` + `contents: read`; PR-opening LLM jobs → job-level `contents: write`, `pull-requests: write`, `id-token: write`.

### Desired

```yaml
# frontend-checks.yml — dorny/paths-filter requires read
permissions:
  contents: read
  pull-requests: read

# backend-serverless-deploy.yml
permissions:
  id-token: write # OIDC / AWS
  contents: read  # checkout

# conformance.yml — job-level for PR-opening
jobs:
  conform:
    permissions:
      contents: write
      pull-requests: write
      id-token: write
```

### Not desired

```yaml
# no permissions: block
name: "[backend] Format, lint, test"
on:
  pull_request:
    branches: [dev]
```

## CVE-remediation PRs put the CVE in the title

Form: `[<scope>] <CVE-ID>: <human description>` after the usual `[FE]`/`[BE]`/`[CI]`/`[DB]` label. Title-level CVE enables PR-list grep and audit.

### Desired

```text
[FE] CVE-2025-59471: bump Next.js to 16.2.0 and remove direct lodash
```

### Not desired

```text
[FE] Bump Next.js and remove lodash
```

## Vet new dependencies before adding

Before adding any library, verify all three — failure of any needs explicit PR sign-off:

1. **Actively maintained** — recent releases; ~1y+ since last publish → presume dead.
2. **Current** — latest major; peers that accept current majors (no peer-pin to CVE-vulnerable majors).
3. **Liberal commercial license** — MIT/BSD/Apache-2.0 OK; GPL/AGPL/SSPL/source-available/restricted → explicit approval.

```bash
npm view <pkg> time.modified version license peerDependencies
npm audit --package-lock-only
# Python: PyPI last release + license; uv tree for transitive drag
```

Negative example: `@react-pdf-viewer` (stale, peer-pinned vulnerable `pdfjs-dist`) — prefer zero-dep/native when sufficient.

## Frontend: no direct `lodash`

`frontend/package.json` MUST NOT list `lodash` under `dependencies`. Prefer native replacements (`array[array.length - 1]` for `last`, etc.). Transitive lodash via third parties is out of scope. MUST NOT add direct dep "because it's already in the lockfile."

```bash
cd frontend && npm ls lodash --omit=dev  # expect: no production lodash
```

### Desired

```ts
const last = array[array.length - 1];
```

### Not desired

```ts
import last from "lodash/last";
const value = last(array);
```

## Document residual `npm audit` warnings

Security-remediation PRs MUST include `## Security follow-up context from audit`. For each remaining moderate+ `npm audit --omit=dev` warning, record in order: (1) advisory ID, (2) reachability via `npm ls`, (3) exploit condition, (4) runtime instantiation here, (5) deferral decision (block vs defer). Pair with `## Verification` listing commands run (`test:ci`, `build`, targeted `npm ls`).

### Desired

```markdown
## Security follow-up context from audit

### `ajv` GHSA-2g4f-4pwh-qvx6 (moderate)
- Reachability: `@mui/x-data-grid-pro -> ... -> ajv`
- Exploit condition: Ajv with `$data` enabled.
- Runtime analysis: options equivalent to `{ allErrors: true, useDefaults: true }`; `$data` off.
- Decision: Defer; non-exploitable.

## Verification
- `npm run test:ci` — pass
- `npm run build` — pass
- `npm ls lodash --omit=dev` — no production lodash
```

### Not desired

```markdown
## Notes
A couple of audit warnings remain but they're transitive — merging anyway.
```

## Related standards

- ci-workflows.md — workflow structure, path filters, caching
- pr-process.md — title/body/verification conventions
