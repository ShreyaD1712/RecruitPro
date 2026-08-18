from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# -------------------------
# Create Skill
# -------------------------
class SkillCreate(BaseModel):

    SkillName: str = Field(..., min_length=1, max_length=150)

    Description: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    IsActive: bool = True


# -------------------------
# Update Skill
# -------------------------
class SkillUpdate(BaseModel):

    SkillName: str = Field(..., min_length=1, max_length=150)

    Description: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    IsActive: bool = True


# -------------------------
# Skill Response
# -------------------------
class SkillResponse(BaseModel):

    SkillId: int

    SkillName: str

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
# Skill List Response
# -------------------------
class SkillListResponse(BaseModel):

    total_records: int

    page: int

    page_size: int

    data: list[SkillResponse]
