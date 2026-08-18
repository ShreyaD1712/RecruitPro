from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# -------------------------
# Create Experience Level
# -------------------------


class ExperienceLevelCreate(BaseModel):

    LevelName: str = Field(
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
# Update Experience Level
# -------------------------


class ExperienceLevelUpdate(BaseModel):

    LevelName: str = Field(
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
# Experience Level Response
# -------------------------


class ExperienceLevelResponse(BaseModel):

    ExperienceLevelId: int

    LevelName: str

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
# Experience Level List Response
# -------------------------


class ExperienceLevelListResponse(BaseModel):

    total_records: int

    page: int

    page_size: int

    data: list[ExperienceLevelResponse]
