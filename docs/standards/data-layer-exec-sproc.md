---
last_updated_at: 2026-05-25
---

# Data layer exec_sproc

Governs `exec_sproc` signatures, `callproc` tuple ordering, output parameters, ID coercion, return-code dispatch.

## exec_sproc — signature, callproc tuple, return-code handling

### Signature is keyword-only

Three keyword-only args; returns rows, single row, or `None` by sproc shape. `testing=True` only in test suite (data-layer-guide.md §exec_sproc). Present on all wrappers including write sprocs without column validation — uniform call-site signature (app_UpdateVendor.py:90).

```python
def exec_sproc(
    *,
    sproc_args: SprocArguments,
    connection: pymssql.Connection,
    testing: bool = False,
) -> list[SprocDataResultReturnRow]:  # or SprocDataResultReturnRow, or None
    ...
```

Source: app_GetAllLinks.py:69-74; app_InsertProduct.py:93-98; app_UpdateVendor.py:86-91.

### Alphabetical callproc tuple matching SQL parameter declaration

`pymssql.callproc` binds positionally. Python tuple follows SQL parameter **alphabetical order**; inline comments name each SQL parameter. New sprocs: alphabetical SQL; Python tuple derived artifact matching exactly (review precedent).

Legacy non-alphabetical SQL (e.g. `app_CreateUnpostedTicketBulk`: `@ImportFileName, @ImportFileDescription`) — Python tuple matches SQL declaration order; `# TODO:` for re-alphabetization (app_CreateUnpostedTicketBulk.py:122-133).

#### Desired ✅

```python
with connection.cursor() as cursor:
    # Params in alphabetical order:
    # @AccountId, @ErrorMessage (OUTPUT), @GrantedById, @RoleName
    result_params = cursor.callproc(
        SPROC_NAME,
        (
            str(sproc_args.AccountId),
            pymssql.output(str, None),     # @ErrorMessage OUTPUT
            str(sproc_args.GrantedById),
            sproc_args.RoleName,
        ),
    )
```

Source: app_AddAccountRole.py:71-82.

#### Not desired ❌

```python
cursor.callproc(
    SPROC_NAME,
    (
        sproc_args.Username,               # Not desired: @U before @E breaks the
        pymssql.output(str, None),         # alphabetical match with the SQL signature
        str(sproc_args.AccountId),
        str(sproc_args.GrantedById),
        sproc_args.RoleName,
    ),
)
```

### `@ErrorMessage OUTPUT` is always `pymssql.output(str, None)` at the correct position

Applies to sprocs declaring `@ErrorMessage varchar(...) OUTPUT`. Legacy `legacy_*` without this pattern omit the slot (legacy_UpdateDataProvider.py; legacy_ListVendor.py).

Every such sproc gets `pymssql.output(str, None)` at `@ErrorMessage`'s alphabetical slot. Omitting shifts subsequent args left — next value binds `@ErrorMessage`, last parameter unbound; no exception — silent corruption (review precedent; app_GetAllLinks.py:88-92).

To read message after call:

```python
result_params = cursor.callproc(SPROC_NAME, (...))
error_message_output = cast(str | None, result_params[0])
```

Source: app_InsertProduct.py:120-128. Unused: prefix `_` or omit (app_AddAccountRole.py:84-85).

#### Desired ✅

```python
cursor.callproc(
    SPROC_NAME,
    (
        pymssql.output(str, None),         # @ErrorMessage OUTPUT
        sproc_args.Username,               # @Username
    ),
)
```

Source: app_GetAllLinks.py:86-93.

#### Not desired ❌

```python
cursor.callproc(
    SPROC_NAME,
    (
        sproc_args.Username,               # Not desired: @ErrorMessage OUTPUT slot omitted;
                                           # @Username silently binds to @ErrorMessage,
                                           # and is unavailable from the SQL parameter list.
    ),
)
```

### Convert integer IDs to `str` before passing them in the tuple

Wrappers cast integer IDs (`str(sproc_args.VendorID)`, `str(sproc_args.lDataProviderID)`) — convention for required integer IDs (app_UpdateVendor.py:125; data-layer-sproc-examples.md). UUIDs also stringified (`str(sproc_args.AccountId)`, app_AddAccountRole.py:75).

```python
cursor.callproc(
    SPROC_NAME,
    (
        pymssql.output(str, None),         # @ErrorMessage OUTPUT — index 0
        sproc_args.VendorDescription,
        str(sproc_args.VendorID),         # Required — always convert to str
        sproc_args.VendorName,
        sproc_args.Username,
    ),
)
```

### Return-code dispatch is a flat `if / elif / else` chain

Post-`callproc`: read `cursor.returnvalue` → `return_code` (or `sql_sproc_return_value` in older modules). Single chain: SUCCESS first, specific errors as `elif`, mandatory final `else` → `UnexpectedStoredProcedureCallError` (data-layer-guide.md §Return Code Handling; app_InsertProduct.py:130-160).

`else` mandatory — unrecognized code = sproc drift (app_GetAllLinks.py:104-107).

Read sprocs: `NO_ROWS_FOUND`/`NO_RESULTS` → empty list, not error (app_GetAllLinks.py:101-103; legacy_ListVendor.py). Write sprocs: zero-rows codes → raise — expected entity missing (app_UpdateVendor.py:137-138; legacy_UpdateDataProvider.py).

#### Desired ✅

```python
return_code = cursor.returnvalue

if return_code == SprocReturnCode.SUCCESS:
    pass

elif return_code == SprocReturnCode.NO_ROWS_FOUND:
    return []

else:
    raise UnexpectedStoredProcedureCallError(f"Return code not expected: {return_code}")
```

Source: app_GetAllLinks.py:94-107.
