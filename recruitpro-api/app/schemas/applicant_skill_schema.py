from pydantic import BaseModel, Field
from typing import Optional
from decimal import Decimal


# ==================================================
# CREATE APPLICANT SKILL
# ==================================================
class ApplicantSkillCreate(BaseModel):
    ApplicantId: int = Field(..., gt=0)
    SkillId: int = Field(..., gt=0)
    ExperienceInYears: Optional[Decimal] = Field(default=None, ge=0, le=999.9)


# ==================================================
# UPDATE APPLICANT SKILL
# ==================================================
class ApplicantSkillUpdate(BaseModel):
    SkillId: int = Field(..., gt=0)
    ExperienceInYears: Optional[Decimal] = Field(default=None, ge=0, le=999.9)


# ==================================================
# APPLICANT SKILL RESPONSE
# ==================================================
class ApplicantSkillResponse(BaseModel):
    ApplicantSkillId: int
    CompanyId: int
    ApplicantId: int
    SkillId: int
    ExperienceInYears: Optional[Decimal] = None
    # --------------------------------------------------
    # DISPLAY INFORMATION
    # --------------------------------------------------
    SkillName: Optional[str] = None

    class Config:
        from_attributes = True


# ==================================================
# APPLICANT SKILL LIST RESPONSE
# ==================================================
class ApplicantSkillListResponse(BaseModel):
    total_records: int
    page: int
    page_size: int
    data: list[ApplicantSkillResponse]
