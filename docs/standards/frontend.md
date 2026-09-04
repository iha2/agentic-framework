---
last_updated_at: 2026-06-06
---

# Frontend

React/Next.js: hook shapes, admin CRUD vertical slice, RTK Query, forms/modals, TypeScript idioms, theme tokens, UI auth, refactor hygiene, response-schema test pairing. Axes: sync selector vs async fetch; end-to-end admin entity build. Voice: [docs-hygiene.md](./docs-hygiene.md).

## Admin CRUD vertical slice

Backend `/v1/admin/<entity>`; frontend `/admin/<entity-slug>`; permissions `<entity>.{create,read,update}`; sidebar gated by `account.read`, actions by entity permissions.

```text
src/
├── api/v1/<entity>.ts
├── api/v1/responseSchemas/<entity>.ts
├── components/admin/<entity>/   # <Entity>Admin, Create/Update modals
├── pages/admin/<entity-slug>/index.tsx
└── schemas/<entity>.ts          # form validation
```

List page + create/update modals: `react-hook-form`, `zod`, RTK Query mutations.

## Hook design

Flat returns — no wrapper arrays — matching comparable in-repo hooks.

### Naming

Describe return value, not preconditions. Prefer `useUser` (caller checks `loggedIn`) over `useLoggedUser`.

### Sync hooks (selectors)

Read Redux; return values directly.

#### Desired ✅

```typescript
const useUser = (): RootState["user"] =>
  useSelector((state: RootState) => state.user);
```

### Async hooks (data-fetching)

RTK Query shape `{ data, error, isLoading, ... }` + domain fields on same object.

#### Desired ✅

```typescript
type TListAllTicketsReturn = {
  data: TTicketItem[];
  error: FetchBaseQueryError | SerializedError | undefined;
  isLoading: boolean;
  totalCount: number;
  totalTicketVolume: number;
};
const { data: allTickets, isLoading } = useListAllTickets(params);
```

### Single-flight for lazy triggers

`useLazyXxxQuery` wrappers MUST track latest in-flight by ref; discard stale resolutions. `reset()` MUST abort in-flight; unmount MUST abort and revoke owned URLs/Blobs.

#### Desired ✅

```typescript
const inFlightRef = useRef<{ abort: () => void } | null>(null);
const trigger = useCallback(async (args: TReportFetchArgs) => {
  inFlightRef.current?.abort();
  const pending = triggerEndpoint(args);
  inFlightRef.current = pending;
  const result = await pending;
  if (inFlightRef.current !== pending) return;
  inFlightRef.current = null;
  if (result.data) { /* set blob/URL */ }
}, [triggerEndpoint]);
const reset = useCallback(() => {
  inFlightRef.current?.abort();
  inFlightRef.current = null;
}, []);
useEffect(() => () => { inFlightRef.current?.abort(); }, []);
```

#### Not desired ❌

```typescript
const trigger = useCallback(async (args) => {
  const result = await triggerEndpoint(args);
  if (result.data) { /* set blob — races prior call */ }
}, [triggerEndpoint]);
```

## Admin CRUD patterns

### Per-entity setup

1. Permissions + selectors (`EnumPermissions.ts`, `userSlice.ts`).
1. Cache tag in `EnumCacheTagType` + `apiSlice.tagTypes`.
1. Zod response schemas under `responseSchemas/` with `z.preprocess(snakeCaseToCamelCaseKeys, …)`.
1. API client: `injectEndpoints`, `providesTags`/`invalidatesTags`, `camelCaseToSnakeCaseKeys` on bodies.
1. Form schemas: `Create*` (required) / `Update*` (all optional).
1. Page + components (pattern off Users).
1. Enable slug in `TEMPORARY_AVAILABLE` (`appConfig.ts`).

### API client shape

#### Desired ✅

```typescript
export const <entity>ApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    list<Entity>s: builder.query({
      providesTags: [EnumCacheTagType.<ENTITY>],
      query: (params) => ({ method: "GET", url: `/admin/<entity>?${queryString}` }),
      transformResponse: (r) => <Entity>ListResponseSchema.parse(r),
    }),
    create<Entity>: builder.mutation({
      invalidatesTags: [EnumCacheTagType.<ENTITY>],
      query: (data) => ({
        body: camelCaseToSnakeCaseKeys(data), method: "POST", url: "/admin/<entity>",
      }),
      transformResponse: (r) => <Entity>Schema.parse(r),
    }),
    update<Entity>: builder.mutation({
      invalidatesTags: [EnumCacheTagType.<ENTITY>],
      query: ({ id, ...payload }) => ({
        body: camelCaseToSnakeCaseKeys(payload), method: "PATCH",
        url: `/admin/<entity>/${id}`,
      }),
      transformResponse: (r) => <Entity>Schema.parse(r),
    }),
  }),
});
```

## RTK Query

### Mutation side effects inside `onSubmit`

Side effects (close dialog, toast, parent state) MUST live in `onSubmit` `try/catch` with `.unwrap()`. MUST NOT `setState`/`dispatch` in render during child render.

#### Desired ✅

```tsx
const onSubmit = async (data: TCreateAccountData) => {
  try {
    await createAccount(data).unwrap();
    setMessage("User created successfully");
    handleClose();
  } catch (err) {
    setMessage(convertObjectToString((err as { data?: { detail?: unknown } })?.data?.detail) || UNKNOW_ERROR);
    handleClose();
  }
};
```

#### Not desired ❌

```tsx
if (isSuccess) { parentSetState(result); }
if (error) { setLocalError(error); }
```

### Cache-tag invalidation, not hand-rolled optimistic state

Mutations changing GET results MUST use `invalidatesTags`. MUST NOT maintain parallel `keptOnScreen`/`displayedRows` mirrors.

#### Desired ✅

```ts
swapLinkDataProviderMapping: builder.mutation({
  invalidatesTags: [EnumCacheTagType.LINK],
  query: ({ linkId, mappingId, newMappingId }) => ({
    body: camelCaseToSnakeCaseKeys({ mappingId, newMappingId }),
    method: "PATCH",
    url: `/admin/link/${linkId}/data-provider-mappings/swap`,
  }),
  transformResponse: (r) => LinkDataProviderMappingSchema.parse(r),
}),
```

#### Not desired ❌

```ts
const [keptOnScreen, setKeptOnScreen] = useState<Row[]>([]);
setKeptOnScreen(prev => prev.map(r => r.id === edited ? { ...r, mappingId: next } : r));
// (no invalidatesTags)
```

### Multi-row group ops: `Promise.allSettled`

Per-row fan-out MUST use `Promise.allSettled`, not `Promise.all` — partial success reconcilable.

#### Desired ✅

```ts
const results = await Promise.allSettled(
  group.map((p) => patchMapping({ providerId: p.id, newMappingId }).unwrap()),
);
const succeeded = group.filter((_, i) => results[i].status === "fulfilled");
```

#### Not desired ❌

```ts
const results = await Promise.all(group.map((p) => patchMapping(...).unwrap()));
```

### Composite row IDs regenerate on identity change

Composite `id` (e.g. `${mappingId}-${dataProviderId}`) — key component change MUST regenerate `id`.

#### Desired ✅

```ts
const updatedRow = {
  ...oldRow,
  dataProviderMappingId: newMappingId,
  id: `${newMappingId}-${oldRow.dataProviderId}`,
};
```

#### Not desired ❌

```ts
const updatedRow = { ...oldRow, dataProviderMappingId: newMappingId }; // stale id → ghost row
```

### Response schemas have tests in the same PR

New response schemas MUST ship tests in matching test file same PR. Pre-existing uncovered schemas out of scope.

## Related standards

- Legacy `frontend-hook-design.md`, `frontend-admin-crud-guide.md`, `frontend-pr-conventions.md` — read-only inputs.
