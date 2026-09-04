---
last_review_sha: 468bb0335df5338d4d02447fcd256bb165019219
---

> **Stack-specific baseline example; superseded by [`frontend.md`](frontend.md).** Follow `frontend.md` on conflict; adapt paths to adopting repo structure.

# Admin Data Endpoints

Architecture and patterns for admin CRUD interfaces — core database entities under Admin sidebar.

## Overview

Consistent pattern:

- **Backend URL**: `/v1/admin/<entity>` (e.g. `/v1/admin/data-provider`)
- **Frontend route**: `/admin/<entity-slug>` (e.g. `/admin/modify-data-providers`)
- **Permissions**: entity-specific (`dataprovider.create`, `.read`, `.update`)
- **Access**: sidebar by `account.read`; actions by entity permissions

## File Structure

Per entity:

```
src/
├── api/v1/admin/
│   ├── <entity>.ts
│   └── responseSchemas/<entity>.ts
├── components/admin/<entity>/
│   ├── <Entity>Admin.tsx
│   ├── Create<Entity>Modal.tsx
│   └── Update<Entity>Modal.tsx
├── pages/admin/<entity-slug>/index.tsx
└── schemas/<entity>.ts
```

### Current Entities

| Entity       | Route Slug              | API Path                  | Status                   |
| ------------ | ----------------------- | ------------------------- | ------------------------ |
| DataProvider | `modify-data-providers` | `/v1/admin/data-provider` | Scaffolded, awaiting API |

## Adding a New Admin Data Entity

### 1. Permissions

`src/models/enums/EnumPermissions.ts`:

```typescript
<ENTITY>_CREATE = "<entity>.create",
<ENTITY>_READ = "<entity>.read",
<ENTITY>_UPDATE = "<entity>.update",
```

`src/slices/userSlice.ts` — selectors `has<Entity>ReadPermissions`, etc.

### 2. Cache Tag

`src/api/v1/index.ts` — `EnumCacheTagType.<ENTITY>` in enum and `tagTypes`.

### 3. Response Schemas

`src/api/v1/admin/responseSchemas/<entity>.ts`:

```typescript
export const <Entity>Schema = z.preprocess(snakeCaseToCamelCaseKeys, z.object({ id: z.string(), ... }));
export const <Entity>ListResponseSchema = z.preprocess(snakeCaseToCamelCaseKeys, z.object({
  items: z.array(<Entity>Schema),
  nextPageToken: z.string().nullable(),
  totalCount: z.number(),
}));
```

### 4. API Client

`src/api/v1/admin/<entity>.ts` — RTK Query slice with `list`, `create`, `update`; `providesTags`/`invalidatesTags`; `camelCaseToSnakeCaseKeys` on bodies; Zod `transformResponse`.

### 5. Form Schemas

`src/schemas/<entity>.ts` — `Create<Entity>Schema` (required fields), `Update<Entity>Schema` (all optional).

### 6. Page and Components

Page at `src/pages/admin/<entity-slug>/index.tsx`; components in `src/components/admin/<entity>/`. Reference: `UsersAdmin.tsx`, `CreateUserModal.tsx`, `UpdateUserModal.tsx`.

### 7. Enable in Sidebar

Add route slug to `TEMPORARY_AVAILABLE` in `src/constants/appConfig.ts`.

## DataProvider: Completing the Implementation

Scaffolded; awaiting backend API. Search `TODO` in:

| File | What to Add |
| --- | --- |
| `responseSchemas/dataProvider.ts` | Entity fields in schema |
| `schemas/dataProvider.ts` | Form fields; remove `_placeholder` |
| `DataProvidersAdmin.tsx` | Table columns |
| `Create/UpdateDataProviderModal.tsx` | Form inputs; Update maps form → payload |

### Expected API Contract

**List** `GET /v1/admin/data-provider` → `{ items, next_page_token, total_count }`. **Create** `POST` — snake_case body, entity response. **Update** `PATCH /:id` — partial snake_case, entity response.

### Completion steps

1. Get API shape from backend
2. Update schemas (remove placeholders)
3. Table columns + modal fields
4. Update `onSubmit` payload mapping in Update modal
5. Test full CRUD

## Reference Files

Users admin: `src/api/v1/account.ts`, `responseSchemas/account.ts`, `schemas/account.ts`, `UsersAdmin.tsx`, `CreateUserModal.tsx`, `UpdateUserModal.tsx`.
