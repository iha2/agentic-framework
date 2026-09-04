---
last_updated_at: 2026-05-25
---

# Deployment

Stack-specific baseline: Python backend packaged/deployed to AWS Lambda via Serverless. Covers vendored WSGI handler (Flask→Lambda event), artifact build sequence, three-way coupling (artifact config, Serverless handler, Flask entrypoint), Serverless vs Terraform boundary. Applies to `backend/serverless.yml`, `backend/justfile` (`serverless-bundle-dist`), `backend/package.json`, `backend/vendor/serverless-wsgi/`.

Canonical in-code reference: `docs/standards/deployment.md`.

## Lambda packaging — vendored WSGI handler

Lambda requires `lambda_handler(event, context)`; Flask lacks one natively — WSGI adapter bridges. Project vendors `serverless-wsgi` at `backend/vendor/serverless-wsgi/` (not npm plugin) — escape incompatibilities among `serverless-wsgi` plugin, Serverless v3, `uv` (backend-lambda-deployment-guide.md; vendor/serverless-wsgi/).

Files: `wsgi_handler.py`, `serverless_wsgi.py` — sole copies. MUST NOT re-add `serverless-wsgi` npm plugin to `backend/package.json` — Serverless framework only (backend/package.json).

Updates: in-place under `backend/vendor/serverless-wsgi/` — no npm plugin dependency.

## Artifact build sequence

`serverless-bundle-dist` in `backend/justfile` — five ordered steps (justfile:serverless-bundle-dist; backend-lambda-deployment-guide.md):

1. Remove `dist/`; install prod deps via `uv pip install --requirement requirements.txt --target dist`.
1. Copy `src/*` → `dist/`.
1. Copy `vendor/serverless-wsgi/serverless_wsgi.py`, `wsgi_handler.py` → `dist/`.
1. Emit `.serverless-wsgi` JSON into `dist/` with `app` = Flask entrypoint expression.
1. Zip `dist/` → artifact filename in `serverless.yml` `package.artifact:`.

Omitting any step breaks artifact: missing vendor → no handler; missing `.serverless-wsgi` → no Flask app; zip/name mismatch → wrong upload.

### Desired ✅

```just
serverless-bundle-dist:
    @echo "Removing any pre-existing dist directory..."
    rm -rf dist
    @echo "Creating requirements.txt file from uv.lock..."
    uv export --format requirements.txt --no-dev --output-file requirements.txt --locked --no-hashes --no-editable
    @echo "Installing production dependencies into dist directory..."
    uv pip install --requirement requirements.txt --target dist
    @echo "Removing requirements.txt file..."
    rm requirements.txt
    @echo "Copying source code into dist directory..."
    cp -r src/* dist/
    @echo "Copying WSGI <--> AWS Lambda handler files into dist directory..."
    cp vendor/serverless-wsgi/serverless_wsgi.py dist/
    cp vendor/serverless-wsgi/wsgi_handler.py dist/
    echo '{"app":"http_app_entrypoint.app"}' > dist/.serverless-wsgi # the 'app' here MUST match the 'app' in the serverless.yml file
    @echo "Zipping dist directory into backend-api.zip..."
    cd dist && zip -r ../backend-api.zip . # this MUST match the artifact name in the serverless.yml file
```

### Three-way coupling — renaming the Flask entrypoint

Three values MUST stay synchronized (justfile:serverless-bundle-dist; serverless.yml:handler):

- `app` in `.serverless-wsgi` JSON from justfile (`"http_app_entrypoint.app"`)
- `handler:` in `serverless.yml` (`wsgi_handler.handler` — fixed; vendored entrypoint, not Flask module)
- Flask module + `app` attribute (`backend/src/http_app_entrypoint.py` exporting `app`)

`handler:` always `wsgi_handler.handler` — stable on Flask renames; reads `.serverless-wsgi` at runtime. Rename changes JSON `app` key + module filename — update justfile emit in same commit.

## Serverless vs Terraform scope boundary

Serverless: Lambda create/update + artifact upload only. VPC, IAM, networking, security groups — Terraform (separate repo). `serverless.yml` MUST NOT contain `resources:` or infrastructure blocks (backend-lambda-deployment-guide.md §Serverless; serverless.yml).

Baseline: no `resources:` block. References VPC SG/subnet IDs via env vars (deploy workflow runtime injection) — does not declare/modify those resources. `resources:` would drift against Terraform.

Infra changes → Terraform, not `serverless.yml`. Integration: `.github/workflows/backend-serverless-deploy.yml` — assumes AWS role, injects env vars; does not create infra (backend-serverless-deploy.yml).

## Related standards

- ci-workflows.md — `backend-serverless-deploy.yml` triggers, permissions, `push:` + `workflow_dispatch:` + `concurrency:`.
