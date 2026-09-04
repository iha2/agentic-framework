---
last_updated_at: 2026-05-25
---

# Logging and observability

Structured key/value logs via one `structlog` pipeline (bridged to stdlib). Exactly one access line per HTTP request —
`"request completed"` — with full bound context. Handlers emit business events/errors only. Context binds in
`@before_request` so error logs still carry `request.*`, `account.*`, `aws.lambda.*`, `deploy.*`. Voice:
[docs-hygiene.md](./docs-hygiene.md).

`configure_logging()` in `logging_config.py`: colored console when `environment == "local"`, else JSON. App code uses
`get_logger(__name__)` only.

```text
startup → configure_logging → structlog + stdlib ProcessorFormatter
per request → @before_request (clear + bind deploy/request/lambda + g.request_start_time)
           → handler
           → @after_request (bind response.*; info access log if not local)
```

## Logger acquisition

MUST use `get_logger(__name__)` at module scope. MUST NOT call `structlog.get_logger` or `logging.getLogger` in app
code (sole stdlib exception: `logging_config.py` with `# noqa: TID251`).

### Desired ✅

```python
from logging_config import get_logger
logger = get_logger(__name__)
```

## Initialization order at entrypoints

`settings.py` is lazy — `configure_logging()` MUST run before settings/app imports so env-parse errors are logged.

| Entrypoint | File | Logging call |
| --- | --- | --- |
| Lambda / `flask run` | `src/http_app_entrypoint.py` | `configure_logging()` before `create_app` import |
| CLI scripts | `scripts/*.py` | `configure_logging()` before app imports |
| Module `__main__` | `src/svc/...` | `get_logger` auto-configures — no explicit call |
| Tests | `tests/conftest.py` | `configure_logging(environment="test")` first |

### Desired ✅

```python
# tests/conftest.py — first lines
from logging_config import configure_logging
configure_logging(environment="test")

# scripts/some_script.py
from logging_config import configure_logging
configure_logging()
# then app imports
```

## Log-key naming and reserved namespaces

Build keys with `to_log_key(*segments)`. Business code MUST NOT overload reserved namespaces:

| Namespace | Bound by | Examples |
| --- | --- | --- |
| `deploy.*` | `build_deploy_info_log_ctx` | `git_sha`, `environment`, `timestamp` |
| `http.request.*` | `build_log_ctx_from_request` | `method`, `path`, `body_size`, headers, query |
| `http.response.*` | `build_log_ctx_from_response` | `status_code`, `content_length`, `duration_ms` |
| `aws.lambda.*` | `build_log_ctx_from_aws_lambda_context` | `request_id`, `cold_start` |
| `account.*` | auth code after identity | `external_id`, `username` |

### Desired ✅

```python
structlog.contextvars.bind_contextvars(**{
    to_log_key("ticket", "id"): ticket_id,
    to_log_key("ticket", "audit_number"): audit_number,
})
```

## Context binding in `@before_request`, not `@after_request`

`@after_request` does not fire on all error paths. Bind deploy/request/lambda in `_before_request`; response in
`_after_request`. Order: `clear_contextvars` → deploy → request → optional Lambda (`getattr` defensively) →
`g.request_start_time`. Account binds in auth code once identity exists. MUST use
`structlog.contextvars.bind_contextvars`, never `logger.bind`.

### Desired ✅

```python
@app.before_request
def _before_request() -> None:
    structlog.contextvars.clear_contextvars()
    structlog.contextvars.bind_contextvars(**build_deploy_info_log_ctx(...))
    structlog.contextvars.bind_contextvars(**build_log_ctx_from_request(request))
    aws_lambda_context = request.environ.get("serverless.context")
    if aws_lambda_context is not None:
        structlog.contextvars.bind_contextvars(
            **build_log_ctx_from_aws_lambda_context(AWSLambdaLogContext(...)))
    g.request_start_time = time.perf_counter()
```

### Not desired ❌

```python
@app.after_request
def _after_request(response):
    structlog.contextvars.bind_contextvars(**build_log_ctx_from_request(request))
    return response  # error logs before this lack request context
```

## Deploy context on every request

Every structured log MUST carry `deploy.git_sha`, `deploy.environment`, `deploy.timestamp` from `Settings`, rebound
each request in `_before_request`. Local fills `"local"` + UTC timestamp; else `GITHUB_SHA` / `DEPLOYED_TIMESTAMP`.

### Desired ✅

```python
def build_deploy_info_log_ctx(*, git_sha: str, environment: str, deployed_timestamp: str) -> LogContext:
    return {
        to_log_key("deploy", "git_sha"): git_sha,
        to_log_key("deploy", "environment"): environment,
        to_log_key("deploy", "timestamp"): deployed_timestamp,
    }
```

## Related standards

- HTTP layer guide — routing, decorators, error mapping.
- Backend entrypoint initialization guide — settings/import order logging relies on.
