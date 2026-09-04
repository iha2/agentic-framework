# Code Review Graph (methodology PR review)

Compressed 2026-09 for token reduction; full prior text in Git history before this change.

## Canonical sources

| Topic | Location |
| --- | --- |
| PR review orchestrator | [`.agents/skills/pr-review/`](../.agents/skills/pr-review/) |
| Graph utility workflow (methodology-local) | [`.agents/skills/pr-review/code-review-graph.md`](../.agents/skills/pr-review/code-review-graph.md) |
| Upstream tool | [github.com/tirth8205/code-review-graph](https://github.com/tirth8205/code-review-graph) · [PyPI](https://pypi.org/project/code-review-graph/) |

## Policy (MUST / SHOULD)

| Rule | Level |
| --- | --- |
| Graph output is advisory triage — not review truth or merge authority | MUST |
| Do not replace pinned git diff, governing spec/issue, standards, or human judgment | MUST |
| Default: CLI first; optional MCP follow-up; **no** upstream companion skills, hooks, or graph-first rule injection | MUST |
| Useful ideas from upstream → summarize into `.agents/skills/pr-review/code-review-graph.md`, do not vendor upstream skills | SHOULD |
| Prefer graph context when changed-file count is large (≈10+) or shared/critical paths | SHOULD |
| Verify stock risk scores, test-gap counts, token-savings %, and any readiness signal against source | MUST |
