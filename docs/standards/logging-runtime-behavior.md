---
last_updated_at: 2026-05-25
---

# Logging runtime behavior

Governs request completion logging, cold-start signal, header sanitization, local rendering, route business logs, and local profiling.

## The "request completed" log line

`_after_request` emits exactly one `logger.info(HTTP_REQUEST_COMPLETED_LOG_MESSAGE)` per request. Module-level `Final[str]` constant in `app.py` — application access log with full bound context (deploy, request, Lambda, response); queryable by stable message string.

```python
# Stable log message. Do not change without updating docs that cite it.
HTTP_REQUEST_COMPLETED_LOG_MESSAGE: Final[str] = "request completed"
```

Gated on `settings.environment != "local"` — Flask dev server already access-logs; double-logging is redundant.

Response context bound before emission in `try/except` — warning on failure, response not crashed. Duration: `round((time.perf_counter() - g.request_start_time) * 1000)` as `http.response.duration_ms`; `getattr(g, "request_start_time", None)` guard when `_before_request` skipped (app.py#L210-L212).

Route handlers MUST NOT emit access-log lines — single end-of-request emission is the access log; route-level calls reserved for business events or errors.

### Desired ✅

```python
HTTP_REQUEST_COMPLETED_LOG_MESSAGE: Final[str] = "request completed"

@app.after_request
def _after_request(response: Response) -> Response:
    try:
        response_duration_ms: int | None = None
        if getattr(g, "request_start_time", None) is not None:
            response_duration_ms = round((time.perf_counter() - g.request_start_time) * 1000)
        structlog.contextvars.bind_contextvars(
            **build_log_ctx_from_response(response=response, response_duration_ms=response_duration_ms)
        )
    except Exception:
        logger.warning("Error building response log context", exc_info=True)
    if settings.environment != "local":
        logger.info(HTTP_REQUEST_COMPLETED_LOG_MESSAGE)
    return response
```

Source: app.py#L200-L226

### Not desired ❌

```python
@bp.route("", methods=["GET"])
def list_links_view():
    logger.info("GET /v1/link served")  # wrong: duplicates end-of-request access log
    return ...
```

## Lambda cold-start signal

`_AWS_LAMBDA_COLD_START: bool = True` at module load — one-shot cold-start signal. `_before_request` reads it for `aws.lambda.cold_start`, then sets `False` (app.py#L43-L53; app.py#L180-L193).

**Only** `_before_request` mutates this variable. Comment at declaration is the invariant source of truth; add mutators → update comment (app.py#L43-L53).

### Desired ✅

```python
_AWS_LAMBDA_COLD_START: bool = True

@app.before_request
def _before_request() -> None:
    global _AWS_LAMBDA_COLD_START
    aws_lambda_context = request.environ.get("serverless.context")
    if aws_lambda_context is not None:
        _ctx_pre_bind = AWSLambdaLogContext(
            request_id=str(getattr(aws_lambda_context, "aws_request_id", "")),
            cold_start=_AWS_LAMBDA_COLD_START,
        )
        structlog.contextvars.bind_contextvars(**build_log_ctx_from_aws_lambda_context(_ctx_pre_bind))
    _AWS_LAMBDA_COLD_START = False
```

Source: app.py#L43-L193

## Sensitive headers are sanitized

`build_log_ctx_from_request` replaces values in `SANITIZED_HEADERS_LOWERCASE` with `"*******"`. Default: `frozenset({"authorization", "cookie"})`. `sanitized_headers` **replaces** default — `{"x-api-key"}` alone drops Authorization/Cookie sanitization (http_api/util.py#L117-L143).

Extend with superset including defaults:

### Desired ✅

```python
custom_sanitized = SANITIZED_HEADERS_LOWERCASE | {"x-api-key"}
log_ctx = build_log_ctx_from_request(request, sanitized_headers=custom_sanitized)
```

Source: http_api/util.py#L113-L143

## Local vs deployed rendering

`configure_logging()` selects final processors by `environment`. Local: `ConsoleRenderer(colors=True)`; deployed: `JSONRenderer()` after `format_exc_info` and `dict_tracebacks` (logging_config.py#L31-L48).

Shared processors both modes: `merge_contextvars`, `add_log_level`, `add_logger_name`, `TimeStamper(fmt="iso", utc=True)`, `StackInfoRenderer`, `UnicodeDecoder` (logging_config.py#L23-L29).

Stdlib third-party logs via `ProcessorFormatter` with `foreign_pre_chain=shared_processors` — same shape and context keys as application logs (logging_config.py#L61-L67).

### Desired ✅

```python
if is_local:
    final_processors = [..., structlog.dev.ConsoleRenderer(colors=True)]
else:
    final_processors = [..., structlog.processors.format_exc_info,
                        structlog.processors.dict_tracebacks,
                        structlog.processors.JSONRenderer()]
```

Source: logging_config.py#L33-L48

## Route handlers log business events, not access lines

`"request completed"` is the access log. Route/service code logs:

- business events worth permanent record (`"ticket validated"`, `"link created"`)
- errors/exceptions, ideally `exc_info=True`

MUST NOT log "entered handler" / "served GET /v1/link" or every successful 200 — already in access log.

Business logs: contextvars supply request/account/deploy context; add only event-specific keys.

### Desired ✅

```python
logger.info(
    "ticket validation rejected",
    **{
        to_log_key("ticket", "id"): ticket_id,
        to_log_key("ticket", "rejection_reason"): reason,
    },
)
```

## Flask request profiling (local dev only)

Off by default; MUST NOT enable in deployed environments — cProfile files accumulate and overhead is unacceptable (settings.py#L32-L33; app.py#L151-L153).

| Env var                | Default              | Purpose                          |
| ---------------------- | -------------------- | -------------------------------- |
| `PROFILING_ENABLED`    | `False`              | Enables profiler middleware      |
| `PROFILING_OUTPUT_DIR` | `./scratch/profiles` | One cProfile file per request    |

When enabled, `create_app()` wraps `app.wsgi_app` with Werkzeug `ProfilerMiddleware`; output dir MUST exist (app.py#L151-L153).

### Desired ✅

```shell
PROFILING_ENABLED=True just be-web
```

Source: backend-profiling-guide.md
