---
last_updated_at: 2026-05-25
---

# Settings

Governs `backend/src/settings.py` — env vars parsed into a typed contract. Covers `Settings` shape, `get_settings()` caching, single-site env reads, and injectable testing. Configuration MUST go through `get_settings()`; direct `os.environ` reads outside `settings.py` violate this contract (settings.py).

## The `Settings` dataclass

Plain `@dataclass` (not frozen); fields carry all runtime configuration. Lowercase `snake_case` names with Python types; optionals use `str | None`, `bool`, `Path`, `field(default_factory=...)` (settings.py#L16-L34).

Fields needing explanation: inline comment above the declaration (see `hidden_account_usernames` — comma-delimited env format and business reason; settings.py#L29-L32).

`__all__ = ["Settings", "get_settings"]` — only exports the application needs (settings.py#L13-L14).

### Desired ✅

```python
from dataclasses import dataclass, field
from datetime import timedelta
from pathlib import Path

from types_ import MSSQLConnectionArgs


@dataclass
class Settings:
    environment: str
    git_sha: str
    deployed_timestamp: str
    jwt_secret_key: str
    jwt_access_token_expiration: timedelta
    hash_algorithms: list[str]
    db_conn_args: MSSQLConnectionArgs
    frontend_allowed_origins: list[str]
    # Some accounts, set via comma-delimited list ('name1,name2,name3'), are
    # flagged as special and should not be returned in API responses
    # or interacted with through the HTTP layer.
    hidden_account_usernames: list[str] = field(default_factory=list)
    bugsnag_api_key: str | None = None
    bugsnag_testing_endpoints_enabled: bool = False
    profiling_enabled: bool = False
    profiling_output_dir: Path = Path("scratch/profiles")
```

Source: settings.py#L16-L34

## `get_settings()` is the single entry point

All env reads centralized in `get_settings()`. Application code calls it; MUST NOT import `os`/`environs` for configuration. `@cache` memoizes after first call — env parsed once per process (settings.py#L37-L40).

Uses `environs.Env()`: `env.read_env(verbose=True)` plus typed accessors (`env.str`, `env.bool`, `env.list`, `env.timedelta`, `env.path`). CI-only vars (`GITHUB_SHA`, `DEPLOYED_TIMESTAMP`) fall back to `os.environ[...]` inside `get_settings()` only (settings.py#L44-L79).

Importing `settings.py` has **no side effects** — no `Env()`, no `.env` read, no `os.environ` access until first `get_settings()` call. Enables `configure_logging()` before settings parse so env errors log through the configured pipeline (backend-entrypoint-initialization-guide.md §Settings Module Design).

### Desired ✅

```python
@cache
def get_settings() -> Settings:
    """Parse environment variables and return application settings.

    All env var parsing happens here, not at import time. Results are cached.
    """
    env = Env()
    env.read_env(verbose=True)
    environment = env.str("ENVIRONMENT")
    if environment == "local":
        git_sha = "local"
        deployed_timestamp = datetime.now(UTC).isoformat()
    else:
        git_sha = os.environ["GITHUB_SHA"]
        deployed_timestamp = os.environ["DEPLOYED_TIMESTAMP"]
    return Settings(environment=environment, git_sha=git_sha, ...)
```

Source: settings.py#L37-L79

## Adding a new setting

Three steps:

1. **Field on `Settings`** — most specific type (`str`, `bool`, `Path`, `list[str]`, `timedelta`, domain types from `types_.py`). Safe defaults as keyword args; required fields positional. Inline comment if non-obvious.
2. **Parse in `get_settings()`** — matching `env.*` accessor; `default=...` for optional; `env.parser_for(...)` for non-trivial transforms (e.g. MSSQL connection string).
3. **Never parse env vars elsewhere** — no module-level `os.environ`, top-of-file `Env()`, or import-time reads in any file including `settings.py`.

(settings.py#L37-L79; backend-entrypoint-initialization-guide.md §Adding New Configuration)

## Lazy evaluation

Import-time side effects are structural: module-level `get_settings()` or `Env()` would trigger env reads on every importer — blocking import before environment is configured. `@cache` and zero module-level logic enable safe import order in `http_app_entrypoint.py` and `tests/conftest.py` (settings.py#L1-L14; backend-entrypoint-initialization-guide.md §Why Import Order Matters).

Call `get_settings()` at point of use; after first call, `@cache` returns the constructed object without re-reading env.

## Testing contract

Tests avoid `get_settings()`. `tests/conftest.py` constructs `Settings` directly as session-scoped `test_settings`; fixtures receive it as a parameter (tests/conftest.py#L30-L44).

```python
@pytest.fixture(scope="session")
def test_settings(mssql_test_connection_args: MSSQLConnectionArgs) -> Settings:
    return Settings(
        environment="test",
        git_sha="test",
        deployed_timestamp="test",
        jwt_secret_key="test",
        jwt_access_token_expiration=datetime.timedelta(hours=1),
        hash_algorithms=["argon2"],
        db_conn_args=mssql_test_connection_args,
        frontend_allowed_origins=[],
    )
```

Source: tests/conftest.py#L30-L44

`conftest.py` calls `configure_logging(environment="test")` before application imports — explicit because test settings are hand-built, not from env vars (tests/conftest.py#L1-L4; backend-entrypoint-initialization-guide.md §Test Suite).

Direct `Settings` construction keeps tests fast, deterministic, and `.env`-free.

## Related standards

- Logging and observability — entrypoint initialization order, `configure_logging()` interaction.
- Backend entrypoint initialization guide — import-order context across all five entrypoints.
