from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# -------------------------
# Create Employment Type
# -------------------------


class EmploymentTypeCreate(BaseModel):

    EmploymentTypeName: str = Field(
        ...,
        min_length=1,
        max_length=150,
    )

    Description: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    IsActive: bool = True


# -------------------------
# Update Employment Type
# -------------------------


class EmploymentTypeUpdate(BaseModel):

    EmploymentTypeName: str = Field(
        ...,
        min_length=1,
        max_length=150,
    )

    Description: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    IsActive: bool = True


# -------------------------
# Employment Type Response
# -------------------------


class EmploymentTypeResponse(BaseModel):

    EmploymentTypeId: int

    EmploymentTypeName: str

    CompanyId: int

    Description: Optional[str] = None

    IsActive: bool

    CreatedOn: Optional[datetime] = None

    CreatedBy: Optional[int] = None

    UpdatedOn: Optional[datetime] = None

    UpdatedBy: Optional[int] = None

    class Config:
        from_attributes = True


# -------------------------
# Employment Type List Response
# -------------------------


class EmploymentTypeListResponse(BaseModel):

    total_records: int

    page: int

    page_size: int

    data: list[EmploymentTypeResponse]
