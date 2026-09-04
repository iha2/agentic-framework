---
last_updated_at: 2026-05-25
---

# Data layer wrapper templates

Canonical sproc wrapper shapes. Start here; adjust params, return codes, TypedDict.

## Row-returning GET (`@ErrorMessage OUTPUT`)

```python
"""Wrapper for `app_GetAllLinks`."""
from dataclasses import dataclass
from datetime import datetime
from enum import IntEnum
from typing import Final, TypedDict, cast
from uuid import UUID
import pymssql
from data.sprocs import UnexpectedStoredProcedureCallError
from data.sprocs.util import validate_column_names

SPROC_NAME: Final[str] = "app_GetAllLinks"

class SprocReturnCode(IntEnum):
    SUCCESS = 0       # gcOK
    NO_ROWS_FOUND = 1 # gcNoRowsFound

@dataclass
class SprocArguments:
    Username: str = "FIXTHIS"
    # @ErrorMessage: OUTPUT — not in SprocArguments; wrapper raises

class SprocDataResultReturnRow(TypedDict):
    LinkID: int
    LinkName: str
    LinkDescription: str
    CreatedBy: str
    CreatedOn: datetime
    UpdateBy: str
    UpdatedOn: datetime
    Timestamp: bytes
    msrepl_tran_version: UUID

SPROC_RETURN_ROW_COLUMN_NAMES: Final[tuple[str, ...]] = tuple(
    SprocDataResultReturnRow.__annotations__.keys()
)

def exec_sproc(*, sproc_args: SprocArguments, connection: pymssql.Connection,
               testing: bool = False) -> list[SprocDataResultReturnRow]:
    with connection.cursor() as cursor:
        cursor.callproc(SPROC_NAME, (pymssql.output(str, None), sproc_args.Username))
        rc = cursor.returnvalue
        if rc == SprocReturnCode.SUCCESS:
            pass
        elif rc == SprocReturnCode.NO_ROWS_FOUND:
            return []
        else:
            raise UnexpectedStoredProcedureCallError(f"Return code not expected: {rc}")
        cols = tuple(c[0] for c in (cursor.description or ()))
        validate_column_names(stored_procedure_name=SPROC_NAME,
            expected_column_names=SPROC_RETURN_ROW_COLUMN_NAMES,
            actual_column_names=cols, testing=testing)
        rows = cursor.fetchall()
        assert rows is not None
        return [cast(SprocDataResultReturnRow, dict(zip(SPROC_RETURN_ROW_COLUMN_NAMES, r, strict=True)))
                for r in rows]
```

## INSERT with entity error decoding

```python
"""Wrapper for `app_InsertProduct`."""
from dataclasses import dataclass
from enum import IntEnum
from typing import ClassVar, Final, TypedDict, cast
import pymssql
from data.sprocs import (
    DatabaseErrorReturnCodeError, StoredProcedureCallError, UnexpectedStoredProcedureCallError,
)
from data.sprocs.util import validate_column_names

SPROC_NAME: Final[str] = "app_InsertProduct"

class ProductNameInUseError(StoredProcedureCallError):
    ERROR_MESSAGE: ClassVar[str] = "Product Name is already in use."
class ProductDuplicateDataError(StoredProcedureCallError):
    ERROR_MESSAGE: ClassVar[str] = "One or more of the unique fields is already in use by another Product."
class ProductNameTooLongError(StoredProcedureCallError):
    ERROR_MESSAGE: ClassVar[str] = "Product Name exceeds maximum length."
class ProductDescriptionTooLongError(StoredProcedureCallError):
    ERROR_MESSAGE: ClassVar[str] = "Product Description exceeds maximum length."
class ProductGenericFieldTooLongError(StoredProcedureCallError):
    ERROR_MESSAGE: ClassVar[str] = (
        "One or more text fields exceed their maximum length. Check: Product Name, Product Description."
    )

class SprocReturnCode(IntEnum):
    """ErrorIDs from dbo.Error."""
    SUCCESS = 0          # gcOK
    DATABASE_ERROR = 14  # gcDatabaseError
    DUPLICATE_DATA = 15  # gcDuplicateData
    STRING_TOO_LONG = 49 # gcStringTooLong

@dataclass
class SprocArguments:
    ProductDescription: str
    ProductName: str
    Username: str = "FIXTHIS"
    # @ErrorMessage: OUTPUT in exec_sproc

class SprocDataResultReturnRow(TypedDict):
    ProductID: int  # success only; errors via RETURN + @ErrorMessage

SPROC_RETURN_ROW_COLUMN_NAMES: Final[tuple[str, ...]] = tuple(
    SprocDataResultReturnRow.__annotations__.keys()
)

def exec_sproc(*, sproc_args: SprocArguments, connection: pymssql.Connection,
               testing: bool = False) -> SprocDataResultReturnRow:
    with connection.cursor() as cursor:
        # callproc args alphabetical: @ErrorMessage, @ProductDescription, @ProductName, @Username
        result_params = cursor.callproc(
            SPROC_NAME,
            (pymssql.output(str, None), sproc_args.ProductDescription,
             sproc_args.ProductName, sproc_args.Username),
        )
        rc = cursor.returnvalue
        err = cast(str | None, result_params[1])
        if rc == SprocReturnCode.SUCCESS:
            pass
        elif rc == SprocReturnCode.DUPLICATE_DATA:
            if err is None:
                raise UnexpectedStoredProcedureCallError("duplicate data but no error message")
            if "Product Name is already in use" in err:
                raise ProductNameInUseError()
            raise ProductDuplicateDataError()
        elif rc == SprocReturnCode.STRING_TOO_LONG:
            if err is None:
                raise UnexpectedStoredProcedureCallError("string too long but no error message")
            if "Product Name exceeds maximum length" in err:
                raise ProductNameTooLongError()
            if "Product Description exceeds maximum length" in err:
                raise ProductDescriptionTooLongError()
            raise ProductGenericFieldTooLongError()
        elif rc == SprocReturnCode.DATABASE_ERROR:
            raise DatabaseErrorReturnCodeError()
        else:
            raise UnexpectedStoredProcedureCallError(f"Return code not expected: {rc}")
        cols = tuple(c[0] for c in (cursor.description or ()))
        validate_column_names(stored_procedure_name=SPROC_NAME,
            expected_column_names=SPROC_RETURN_ROW_COLUMN_NAMES,
            actual_column_names=cols, testing=testing)
        row = cursor.fetchone()
        if row is None:
            raise UnexpectedStoredProcedureCallError("no result when result set expected")
        return cast(SprocDataResultReturnRow, dict(zip(SPROC_RETURN_ROW_COLUMN_NAMES, row, strict=True)))
```

Test brittle substring matches when changed. Source: `app_InsertProduct.py`.

## UPDATE with no result set (PATCH)

`exec_sproc` → `None`; success returns immediately; no column validation/fetch.

```python
def exec_sproc(*, sproc_args: SprocArguments, connection: pymssql.Connection,
               testing: bool = False) -> None:
    """PATCH — only non-null params updated. No result set."""
    with connection.cursor() as cursor:
        result_params = cursor.callproc(
            SPROC_NAME,
            (pymssql.output(str, None), sproc_args.VendorDescription,
             str(sproc_args.VendorID), sproc_args.VendorName, sproc_args.Username),
        )
        rc = cursor.returnvalue
        err = cast(str | None, result_params[0])
        if rc == SprocReturnCode.SUCCESS:
            return
        if rc == SprocReturnCode.NO_ROWS_FOUND:
            raise VendorNotFoundError(error_message=err)
        # … duplicate-data / string-too-long as INSERT …
        if rc == SprocReturnCode.DATABASE_ERROR:
            raise DatabaseErrorReturnCodeError()
        raise UnexpectedStoredProcedureCallError(f"Return code not expected: {rc}")
```

Source: `app_UpdateVendor.py`.
