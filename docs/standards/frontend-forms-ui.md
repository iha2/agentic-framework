---
last_updated_at: 2026-06-06
---

# Frontend forms and UI hygiene

Forms, option sets, JS/TS idioms, theme styling, permissions, Storybook, frontend tests.

## Forms and modals

### Required fields marked from first render

MUI `TextField` (equivalents) for required fields MUST include `required` — asterisk on initial render, not post-submit only.

#### Desired ✅

```tsx
<TextField label="Name" required value={name} onChange={onChange} />
```

#### Not desired ❌

```tsx
<TextField label="Name" value={name} onChange={onChange} />
```

#### Wrapped controls: pass `required` to the inner TextField

`Autocomplete` `renderInput`, `DatePicker` `slotProps.textField`, etc. — `required` MUST reach inner `TextField`. RHF `Controller` `rules={{ required }}` validates only; no asterisk.

##### Desired ✅

```tsx
renderInput={(params) => (
  <TextField {...params} label="Customer Segment" required
    error={!!errors.qualityBankId} helperText={errors.qualityBankId?.message} />
)}
// DatePicker: slotProps={{ textField: { required: true, error, helperText } }}
```

##### Not desired ❌

```tsx
renderInput={(params) => <TextField {...params} label="Customer Segment" />}
// RHF rules.required alone — no asterisk
```

### Shared `CloseModalButton`

Admin modals under `frontend/src/components/admin/` MUST use `<CloseModalButton handleClose={handleClose} />`. MUST NOT reimplement `IconButton` + `CloseIcon`.

#### Desired ✅

```tsx
import CloseModalButton from "@/components/Buttons/CloseModalButton";
<CloseModalButton handleClose={handleClose} />
```

#### Not desired ❌

```tsx
<IconButton onClick={handleClose} sx={{ position: "absolute", top: 8, right: 8 }}>
  <CloseIcon />
</IconButton>
```

### Searchable dropdowns for bounded queryable values

Enumerable queryable table → searchable dropdown `{id}: {name}` via RTK Query; filter used values. MUST NOT use free-text numeric ID fields.

#### Desired ✅

```tsx
<Autocomplete
  options={availableDataProviders.filter((dp) => !alreadyMapped.has(dp.id))}
  getOptionLabel={(dp) => `${dp.id}: ${dp.name}`}
  value={selectedDp}
  onChange={(_, v) => setSelectedDp(v)}
  renderInput={(params) => <TextField {...params} label="Mapping ID" required />}
/>
```

#### Not desired ❌

```tsx
<TextField label="Mapping ID" type="number" value={mappingId}
  onChange={(e) => setMappingId(Number(e.target.value))} />
```

### Shared typed modules for fixed option sets

Recurring enumerables (Month, Year, …) MUST live in `frontend/src/models/` with typed `value` + `label`. MUST NOT re-inline literals.

#### Desired ✅

```ts
// frontend/src/models/Month.ts
export interface SelectOption<T> { value: T; label: string; }
export const MONTH_OPTIONS: SelectOption<number>[] = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
];
```

#### Not desired ❌

```tsx
<Select>
  <MenuItem value={1}>January</MenuItem>
  <MenuItem value={2}>February</MenuItem>
</Select>
```

## JavaScript and TypeScript idioms

### `??` for empty-array API fallbacks

Absent/unloaded API fields → empty array MUST use `??`, not `||`. Prefer `??` when only meaningful falsy = absence.

#### Desired ✅

```ts
rows={data?.data ?? []}
```

#### Not desired ❌

```ts
rows={data?.data || []}
```

### Time-dependent bounds at parse time

Zod/module schemas with current date/time — when UI samples clock elsewhere — MUST move bound into `.refine()` at parse time. MUST NOT freeze `new Date().getFullYear()` at module load.

#### Desired ✅

```ts
accountingPeriodYear: z
  .number({ error: "Year is required" })
  .int("Year must be a whole number")
  .min(1900, "Enter a valid year")
  .refine(
    (v) => v <= new Date().getFullYear() + 1,
    "Year cannot be more than one year in the future",
  ),
```

#### Not desired ❌

```ts
const currentYear = new Date().getFullYear();
export const ReportParametersSchema = z.object({
  accountingPeriodYear: z.number().min(1900).max(currentYear + 1, "..."),
});
```

## Styling

### Theme tokens, not hardcoded colors

MUI theme tokens (`useTheme()`, theme-aware `sx`). Hardcoded literals ONLY when theme cannot represent color, with inline why.

#### Desired ✅

```tsx
sx={{ color: "primary.main", backgroundColor: "background.paper", borderColor: "divider" }}
```

#### Not desired ❌

```tsx
sx={{ color: "#1976d2", backgroundColor: "#fff" }}
```

## Authorization in the UI

### `EnumPermissions` only

Permissions via `EnumPermissions` (`frontend/src/models/enums/EnumPermissions.ts`). MUST NOT use string literals in components, tests, selectors, hooks. Selectors in `src/slices/userSlice.ts` as `has<Entity><Action>Permissions` (frontend-admin-crud-guide.md §Permissions).

#### Desired ✅

```ts
import EnumPermissions from "@/models/enums/EnumPermissions";
export const hasReadPermissions = (state: RootState) =>
  state.user.permissions.includes(EnumPermissions.READ);
```

#### Not desired ❌

```ts
const canLogIn = userPermissions.includes("login");
```

## Hygiene

### No transitional scaffolding on merge

Migration-only types/params with no post-merge value MUST be removed same PR. Update consumers (stories); delete bridge.

#### Desired ✅

```tsx
export interface RolePermissionMatrixProps {
  permissionGroups: PermissionGroup[];
  roles: Role[];
}
```

#### Not desired ❌

```tsx
export interface RolePermissionMatrixProps { /* legacy */ }
export type TRole = string; // old Storybook only
export const RolePermissionMatrix: FC<NewProps> = (_props) => { ... };
```

### Storybook stories travel with refactors

Prop/type refactors MUST update each `*.stories.tsx` same PR: (1) refactor props/types, (2) update stories, (3) delete bridge-only types.

## Frontend testing

Response-schema adds/changes MUST include matching tests in corresponding `.test.ts` same PR (shape, required, optional, coercion). Pre-existing uncovered schemas out of scope; only touched schemas need tests.
