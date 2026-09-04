---
last_updated_at: 2026-05-25
---

# PR process

Governs PR titles, scope, legacy-replacement evidence, no transitional cruft, CVE title form, and root-only monorepo hygiene (direnv/env/yamlfmt).

## PR titles — bracketed scope labels

Every PR title MUST begin with one or more bracketed labels from `.github/pull_request_template.md` (source of truth):

- `BE` / `FE` / `DB` / `CI` / `agent` / `DOC`

Cross-cutting: combine with `+` and **no spaces** inside brackets — `[BE+DB]`, never `[BE + DB]` or `[BE] + [DB]`. Sole exception: auto release PRs titled `Staging Release <YYYYMMDD>-<n>`.

### Desired ✅

```text
[BE] Fix password hashing on second use
[BE+FE] Add password reset flow end-to-end
[BE+DB] Add soft-delete to user accounts
```

### Not desired ❌

```text
Fix password hashing on second use
[BE] + [DB] Add soft-delete
[BE + DB] Add soft-delete
```

## One logical change per PR

One feature, fix, refactor, or migration per PR. Incidental fixes and drive-bys → separate PR (or isolated commit). Multi-layer labels (`[BE+DB+FE]`) declare real cross-cutting coupling, not bundled unrelated work. Unrelated fixes inside a feature → own commit for clean revert/blame.

### Desired ✅

```text
[FE] Fix Redux userSlice login reducer
[BE+FE] Add RBAC role-permission matrix UI
```

### Not desired ❌

```text
[BE+FE] Add RBAC matrix UI + fix userSlice + reformat lints
[BE+FE+DB] Add RBAC UI + unrelated seed migration
```

## Legacy-replacement — screenshot + demo GIF

PRs replacing a legacy screen MUST put the legacy screenshot in **WHY** and a GIF/recording of the new UI in **Demo** (template sections). Self-contained; reviewer MUST NOT need the tracker ticket for visual context.

### Desired ✅

```markdown
### WHY
Legacy screen:
![legacy](./.images/legacy-customer-segment-create.png)

### Demo
![new](./.images/new-customer-segment-create.gif)
```

### Not desired ❌

```markdown
### WHY
Adds the Create Customer Segment modal.
```

## No transitional cruft on merge

Migration-only types/params/interfaces with no post-merge value MUST be removed in the same PR. Prop/type refactors MUST update every consuming `*.stories.tsx` in that PR.

### Desired ✅

```tsx
type Props = { roles: Role[]; onChange: (next: Role[]) => void };
export function RolePermissionMatrix({ roles, onChange }: Props) { ... }
// stories updated in SAME PR
```

### Not desired ❌

```tsx
export interface RolePermissionMatrixProps { legacyRoles: TRole[]; }
export function RolePermissionMatrix(_props: RolePermissionMatrixProps) { ... }
```

## CVE remediation titles

Form: `[<scope>] <CVE-ID>: <human description>`. Full supply-chain rules: `security.md`. This doc owns title shape only.

### Desired ✅

```text
[FE] CVE-2025-59471: bump Next.js to 16.2.0 and remove direct lodash
```

### Not desired ❌

```text
[FE] Bump Next.js and remove lodash
```

## Monorepo / repo hygiene

Env + YAML formatting owned at repo root. Broader CI: `ci-workflows.md`; lint tools: `tooling-lint-format.md`.

### Root-only direnv / `.env`

`.envrc` + `.env` at root only (`dotenv_if_exists .env`). MUST NOT merge service-level `.envrc`/`.env` (remove if reintroduced from old branches).

#### Desired ✅

```text
example-app/
├── .envrc
├── .env
├── backend/     # no .envrc, no .env
└── frontend/
```

#### Not desired ❌

```text
backend/.envrc   # service-level
```

### Root-only `yamlfmt`

Root `.yamlfmt.yaml` + root `.pre-commit-config.yaml` registers pinned `google/yamlfmt`; exclude `*.yaml`/`*.yml` from `end-of-file-fixer` so hooks do not fight. Cross-service tooling belongs at root; service-local yamlfmt → coverage drift.

#### Desired ✅

```yaml
# root .pre-commit-config.yaml
- id: end-of-file-fixer
  exclude: '\.(yaml|yml)$'
- repo: https://github.com/google/yamlfmt
  rev: v0.21.0
  hooks: [{ id: yamlfmt }]
```

#### Not desired ❌

```yaml
# backend/.pre-commit-config.yaml — yamlfmt service-local
# or root end-of-file-fixer without yaml exclude (prek loop)
```

## Related standards

- security.md — CVE remediation + dependency hygiene
- tooling-lint-format.md — prek/mdformat/ruff
- ci-workflows.md — path filters / workflow ordering
- docs-hygiene.md — `[DOC]` PR conventions
