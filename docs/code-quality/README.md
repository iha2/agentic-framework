# Code quality and deterministic checks

Human-oriented notes on **linting**, **deterministic gates**, and **specific risks** in agentic workflows (how text and config enter repos and agent context). For the methodology’s overall quality bar, start at [Deterministic quality gates](../methodology/deterministic-quality.md).

| Document | Audience | Purpose |
| -------- | -------- | ------- |
| [Invisible text prompt injection, linting benefits, and repo tooling](./invisible-text-prompt-injection-and-linting.md) | Leads, reviewers, implementers | One place: why deterministic linting matters, invisible Unicode / smuggling threat, mechanisms, and what this repository ships (`tools/invisible_unicode_lint/`, hooks, complementary ESLint/Ruff notes). |

Security governance that is **not** primarily about linting (e.g. skills/MCP supply chain) stays under [docs/security/](../security/README.md).
