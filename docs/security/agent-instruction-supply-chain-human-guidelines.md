---
last_updated_at: 2026-06-20
audience: humans
---

# Human guidelines: supply chain risk in agent instructions

**Audience:** engineering leads, security reviewers, platform owners approving/auditing Cursor, IDE agents, or similar configuration.

**Purpose:** **Human playbook** — not agent-ingestion guidance — for risk that **malicious/compromised** skills, rules, MCP servers, hooks, or dependencies alter agent reads/executes while appearing legitimate via package, fork, or dependency update.

Invisible Unicode/smuggling: [Invisible text prompt injection, linting benefits, and deterministic checks](../code-quality/invisible-text-prompt-injection-and-linting.md). This note covers **trusted-looking configuration/dependencies** altering agent behavior.

---

## 1. What you are protecting

Treat as **software supply chain**, not informal docs:

| Asset class | Typical locations |
| ----------- | ----------------- |
| Agent skills / methodology packs | `.agents/skills/`, vendored `tools/`, internal packages |
| Cursor / IDE rules | `.cursor/rules/`, `AGENTS.md`, org rule bundles |
| MCP server definitions | project/user MCP config, checked-in descriptors |
| Hooks / automations | Cursor hooks, git hooks, CI agent context steps |
| Deps affecting agent context | prompt generators, skill loaders, LLM wrappers |

**Risk:** attacker/compromised upstream changes **agent instructions or tool permissions** without traditional AppSec-tracked runtime code changes.

---

## 2. What “catching” this means in practice

No scanner proves **intent**. Combine:

1. **Governance** — who may change agent-facing assets; who approves.
2. **Change control** — visible, attributable modifications reviewed like production code.
3. **Technical guardrails** — CI/policy block unexpected changes, unpinned drift, disallowed patterns.
4. **Least privilege** — poisoned instructions MUST NOT expose full secrets/tools.

All four required; any one alone is brittle.

---

## 3. Governance checklist (humans own this)

Named ownership (roles, not “the team”):

- [ ] **Owner of record** for org agent rules, skills, MCP allowlists (platform + security + lead engineer).
- [ ] **Approval path** for new MCP server, external config URL, agent-event hook.
- [ ] **Personal vs org policy** — e.g. CI/release agents use checked-in profile X only; local experiments stay local.
- [ ] **Onboarding** — `.cursor/`, `.agents/`, MCP JSON changes are **security-relevant**, not private tweaks.

---

## 4. Pull-request review: what humans should look for

PRs touching agent instructions or delivery path:

- [ ] **Provenance** — source: internal repo, tagged release, unknown fork?
- [ ] **Scope creep** — “doc fix” adding MCP, hooks, skills, broadened tool permissions?
- [ ] **Secrets** — no keys/tokens/private URLs in rules/skills.
- [ ] **Exfiltration shape** — fetch arbitrary URLs, clone unknown repos, post outward without allowlist?
- [ ] **Dependency deltas** — consistent lockfile; unexpected transitive packages; typosquats.
- [ ] **External contributor PRs** — skill/MCP changes = **privileged review** (security + platform).

Cannot answer “why safe?” in plain language → **do not merge**.

---

## 5. Technical controls your org can implement

Adapt to stack.

### 5.1 Code ownership and mandatory review

- **`CODEOWNERS`** on `.cursor/`, `.agents/`, MCP config, hooks, agent-affecting lockfiles.
- **Two-person** rules for high-risk repos if policy requires.

### 5.2 Pinning and reproducibility

- **Commit lockfiles**; CI fails on lockfile drift.
- **Pin vendored methodology/skills** to commit/tag/internal version; record in-repo (`VENDOR_REVISION`, release notes).
- Submodules/subtrees: CI verifies **expected revision**.

### 5.3 CI jobs catching “unexpected” change

| Job | Catches |
| --- | ------- |
| Approved skill manifest (path + checksum) | Unauthorized skill files |
| Allowlisted MCP/hook config directories | Odd-path drops |
| MCP URL policy (e.g. approved `https://` hosts) | Open-ended endpoints |
| Forbidden patterns (raw cred env names, disallowed schemes) | Common foot-guns |
| Dependency review/audit | Vulnerable/suspicious packages |

Flags **policy violations/drift**, not intent — reliably automatable.

### 5.4 MCP and tool surface

- Separate credentials per server where possible.
- **Allowlist** tools/servers per environment.
- **Revocation path** — disable one MCP without blocking all agent use.

### 5.5 Runtime blast-radius limits

- Read-only agents MUST NOT run write+secrets scope.
- Secrets in approved stores, not repo text — any branch.

---

## 6. Operational cadence (beyond PR review)

- **Quarterly/semiannual inventory:** active MCP, hooks, org rule packs; remove unused.
- **Post-incident:** trace active skills/rules/MCP; update playbook on gaps.
- **Vendor changes:** Cursor/MCP/platform release notes for **default permission** shifts.

---

## 7. Relationship to other defenses

| Topic | Read |
| ----- | ---- |
| Hidden Unicode; linting rationale | [Invisible text prompt injection](../code-quality/invisible-text-prompt-injection-and-linting.md) |
| Deterministic quality gates | [../methodology/deterministic-quality.md](../methodology/deterministic-quality.md) |
| Invisible-Unicode rule extension | `.agents/skills/invisible-unicode-lint/SKILL.md` |

---

## 8. What this document does not promise

- Not legal, vendor risk, or procurement for SaaS.
- Not **semantic** prompt injection in already-trusted prose (separate content-trust problem).
- Assumes org **governs** agents; fully local/ungoverned ⇒ individual habits only.

---

## 9. Summary

**Catch** supply-chain abuse by treating agent instruction files/packages as **privileged configuration**: **owned, reviewed, pinned, drift-scanned, least-privilege.** Automation supports humans; does not replace **accountability** for what agents read and do.
