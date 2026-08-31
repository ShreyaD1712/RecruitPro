from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ==================================================
# CREATE INTERVIEW
# ==================================================
class InterviewCreate(BaseModel):
    ApplicationId: int = Field(..., gt=0)
    InterviewRoundId: int = Field(..., gt=0)
    InterviewerId: int = Field(..., gt=0)
    InterviewDate: datetime
    InterviewMode: Optional[str] = Field(default=None, max_length=50)
    Status: Optional[str] = Field(default="Scheduled", max_length=50)


# ==================================================
# UPDATE INTERVIEW
# ==================================================
class InterviewUpdate(BaseModel):
    ApplicationId: int = Field(..., gt=0)
    InterviewRoundId: int = Field(..., gt=0)
    InterviewerId: int = Field(..., gt=0)
    InterviewDate: datetime
    InterviewMode: Optional[str] = Field(default=None, max_length=50)
    Status: Optional[str] = Field(default=None, max_length=50)


# ==================================================
# INTERVIEW RESPONSE
# ==================================================
class InterviewResponse(BaseModel):
    InterviewId: int
    CompanyId: int

    # --------------------------------------------------
    # INTERVIEW INFORMATION
    # --------------------------------------------------
    ApplicationId: int
    InterviewRoundId: int
    InterviewerId: int
    InterviewDate: datetime
    InterviewMode: Optional[str] = None
    Status: Optional[str] = None

    # --------------------------------------------------
    # AUDIT INFORMATION
    # --------------------------------------------------
    CreatedOn: Optional[datetime] = None
    CreatedBy: Optional[int] = None
    UpdatedOn: Optional[datetime] = None
    UpdatedBy: Optional[int] = None

    # --------------------------------------------------
    # DISPLAY INFORMATION
    # --------------------------------------------------
    ApplicantName: Optional[str] = None
    JobTitle: Optional[str] = None
    DepartmentName: Optional[str] = None
    InterviewRoundName: Optional[str] = None
    InterviewerName: Optional[str] = None

    class Config:
        from_attributes = True


# ==================================================
# INTERVIEW LIST RESPONSE
# ==================================================
class InterviewListResponse(BaseModel):
    total_records: int
    page: int
    page_size: int
    data: list[InterviewResponse]
