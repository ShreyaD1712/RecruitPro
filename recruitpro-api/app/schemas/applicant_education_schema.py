from pydantic import BaseModel, Field
from typing import Optional


# ==================================================
# CREATE APPLICANT EDUCATION
# ==================================================
class ApplicantEducationCreate(BaseModel):
    ApplicantId: int
    Degree: str = Field(..., min_length=1, max_length=100)
    Institute: str = Field(..., min_length=1, max_length=150)
    University: str = Field(..., min_length=1, max_length=150)
    PassingYear: int = Field(..., ge=1900, le=2100)
    Percentage: float = Field(..., ge=0, le=100)


# ==================================================
# UPDATE APPLICANT EDUCATION
# ==================================================
class ApplicantEducationUpdate(BaseModel):
    Degree: str = Field(..., min_length=1, max_length=100)
    Institute: str = Field(..., min_length=1, max_length=150)
    University: str = Field(..., min_length=1, max_length=150)
    PassingYear: int = Field(..., ge=1900, le=2100)
    Percentage: float = Field(..., ge=0, le=100)


# ==================================================
# RESPONSE
# ==================================================
class ApplicantEducationResponse(BaseModel):
    EducationId: int
    CompanyId: int
    ApplicantId: int
    Degree: str
    Institute: str
    University: str
    PassingYear: int
    Percentage: float

    class Config:
        from_attributes = True
