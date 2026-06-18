---
last_updated_at: 2026-06-20
audience: humans
---

# Human guidelines: supply chain risk in agent instructions

**Audience:** engineering leads, security reviewers, platform owners, and anyone who **approves or audits** how Cursor, IDE agents, or similar systems are configured in a repository or organization.

**Purpose:** This document is **not** machine-ingestion guidance for agents. It is a **human playbook** for reducing risk that **malicious or compromised** skills, rules, MCP servers, hooks, or dependencies change what an agent reads or executes—while the change **looks legitimate** because it arrived through a package, fork, or routine dependency update.

For **invisible Unicode** and similar **text smuggling** in files agents read, see [Invisible text prompt injection, linting benefits, and deterministic checks](../code-quality/invisible-text-prompt-injection-and-linting.md). This note addresses a **different** class of risk: **trusted-looking configuration and dependencies** that alter agent behavior.

---

## 1. What you are protecting

Treat the following as **part of the software supply chain**, not as informal documentation:

| Asset class | Typical locations (examples) |
| ----------- | ---------------------------- |
| Agent skills and methodology packs | `.agents/skills/`, vendored `tools/` trees, internal packages |
| Cursor / IDE rules | `.cursor/rules/`, `AGENTS.md`, org rule bundles |
| MCP server definitions | MCP config under project or user scope, checked-in descriptors |
| Hooks and automations | Cursor hooks, git hooks, CI “agent” steps that alter context |
| Dependencies that affect agent context | Packages that generate prompts, load skills, or wrap LLM calls |

**Risk in one sentence:** an attacker (or a compromised upstream) changes **what the agent is told or what tools it may call**, without changing application runtime code in the way your traditional AppSec review usually tracks.

---

## 2. What “catching” this means in practice

You will not get a single scanner that proves **intent**. You **catch** supply-chain issues by combining:

1. **Governance** — who may change agent-facing assets, and who must approve.
2. **Change control** — every modification is visible, attributable, and reviewed like production code.
3. **Technical guardrails** — CI and repo policy block **unexpected** changes, **unpinned** drift, and **disallowed** patterns.
4. **Least privilege** — even if instructions are poisoned, **secrets and tools** are not fully exposed.

Use all four; any one alone is brittle.

---

## 3. Governance checklist (humans own this)

Assign clear ownership (names or roles, not “the team”):

- [ ] **Owner of record** for org-wide agent rules, skills, and MCP allowlists (usually platform or security partnering with a lead engineer).
- [ ] **Approval path** for adding a **new** MCP server, external URL in config, or new hook that runs on agent events.
- [ ] **Policy** for personal vs org config: e.g. “CI and release agents use **only** repo-checked-in profile X; personal experiments stay local.”
- [ ] **Onboarding** so engineers know: changing `.cursor/`, `.agents/`, or MCP JSON is a **security-relevant** change, not a private tweak.

---

## 4. Pull-request review: what humans should look for

When a PR touches agent instructions or their delivery path, reviewers should explicitly check:

- [ ] **Provenance** — Where did new files or packages come from? Internal repo, tagged release, or unknown fork?
- [ ] **Scope creep** — Does a “doc fix” also add MCP servers, hooks, new skills, or broadened tool permissions?
- [ ] **Secrets** — No API keys, tokens, or private URLs pasted into rules or skills (even “for debugging”).
- [ ] **Network exfiltration shape** — New instructions to fetch arbitrary URLs, clone unknown repos, or post data outward without an approved allowlist.
- [ ] **Dependency deltas** — Lockfile present and consistent; unexpected transitive packages; new maintainer or typosquat names.
- [ ] **Fork / contributor PRs** — Treat skill and MCP changes from **external contributors** like **privileged code review** (security + platform), not a single-line rubber stamp.

If the PR cannot answer “why is this safe?” in plain language, **do not merge** until it can.

---

## 5. Technical controls your org can implement

These are **examples** for engineering and security to implement; adapt to your stack.

### 5.1 Code ownership and mandatory review

- Use **`CODEOWNERS`** (or equivalent) on paths such as `.cursor/`, `.agents/`, MCP config, hook definitions, and any `package.json` / lockfile that affects agent pipelines.
- Require **two-person** rules for high-risk repos if policy demands it (e.g. security engineer + code owner).

### 5.2 Pinning and reproducibility

- **Commit lockfiles** for Node (and other ecosystems you use); CI fails if install would change the lockfile.
- **Pin vendored methodology** or shared skills to a **specific commit, tag, or internal package version**; record that pin in-repo (e.g. `VENDOR_REVISION` or release notes).
- For git submodules or subtrees: CI verifies the **expected revision** matches documentation.

### 5.3 CI jobs that catch “unexpected” change

| Job idea | What it helps catch |
| -------- | -------------------- |
| **Manifest of approved skill files** (path + checksum) updated only in reviewed PRs | Unauthorized new or altered skill files |
| **Allowlist of directories** where MCP or hook config may live | Files dropped in odd paths |
| **Regex / policy checks** on MCP URLs (e.g. only `https://` to approved hosts) | Casual or malicious open-ended endpoints |
| **Forbidden patterns** (e.g. raw credentials env var names, `cursor://` where disallowed) | Common foot-guns |
| **Dependency review / audit** on PRs | Known-vulnerable or suspicious packages (traditional supply chain) |

These jobs flag **policy violations and drift**, not moral intent—but that is what you can automate reliably.

### 5.4 MCP and tool surface

- **Separate credentials per MCP server** where possible; avoid one API key shared across unrelated servers.
- **Allowlist tools and servers** per environment (dev vs CI vs prod agents).
- **Revocation path:** document how to disable one MCP server in an emergency without blocking all agent use.

### 5.5 Runtime blast-radius limits

- Agents that only need read access should not run with **write + secrets** scope “just in case.”
- **Secrets** live in approved secret stores, not in repo text—even in “internal” branches.

---

## 6. Operational cadence (beyond PR review)

Humans should schedule:

- **Quarterly (or semiannual) inventory:** list active MCP servers, hooks, and org rule packs; remove unused entries.
- **Post-incident review:** any security event involving an agent → trace which skills, rules, and MCP config were active; update this playbook if a gap appears.
- **Vendor change awareness:** when Cursor, MCP providers, or internal agent platforms ship behavior changes, re-read release notes for **default permission** shifts.

---

## 7. Relationship to other defenses

| Topic | Where to read more |
| ----- | ------------------ |
| Hidden Unicode / smuggling in text; linting rationale | [Invisible text prompt injection, linting benefits, and deterministic checks](../code-quality/invisible-text-prompt-injection-and-linting.md) |
| Methodology: deterministic quality gates | [../methodology/deterministic-quality.md](../methodology/deterministic-quality.md) |
| Extending the invisible-Unicode rule set | `.agents/skills/invisible-unicode-lint/SKILL.md` (for maintainers of that linter) |

---

## 8. What this document does not promise

- It does not replace **legal**, **vendor risk**, or **enterprise procurement** processes for SaaS.
- It does not catch **semantic** prompt injection that uses only benign-looking prose in a file you already trust for content (that is a separate content-trust problem).
- It assumes your organization **wants** to govern agents; if agents are fully local and ungoverned, only the individual user can apply these habits.

---

## 9. Summary

**Catch** supply-chain abuse in agent instructions by treating those files and packages as **privileged configuration**: **owned, reviewed, pinned, scanned for drift, and run with least privilege.** Automation supports humans; it does not replace **explicit accountability** for what agents are allowed to read and do.
