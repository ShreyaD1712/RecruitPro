from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# -------------------------
# Create Job Category
# -------------------------


class JobCategoryCreate(BaseModel):

    CategoryName: str = Field(..., min_length=1, max_length=150)

    Description: Optional[str] = Field(default=None, max_length=500)

    IsActive: bool = True


# -------------------------
# Update Job Category
# -------------------------


class JobCategoryUpdate(BaseModel):

    CategoryName: str = Field(..., min_length=1, max_length=150)

    Description: Optional[str] = Field(default=None, max_length=500)

    IsActive: bool = True


# -------------------------
# Job Category Response
# -------------------------


class JobCategoryResponse(BaseModel):

    JobCategoryId: int

    CategoryName: str

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
# Job Category List Response
# -------------------------


class JobCategoryListResponse(BaseModel):

    total_records: int

    page: int

    page_size: int

    data: list[JobCategoryResponse]
