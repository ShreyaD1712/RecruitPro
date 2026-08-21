from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ==================================================
# CREATE APPLICATION
# ==================================================
class ApplicationCreate(BaseModel):
    ApplicantId: int = Field(..., gt=0)
    JobOpeningId: int = Field(..., gt=0)
    CurrentStatus: str = Field(default="Applied", min_length=1, max_length=50)
    Remarks: Optional[str] = None


# ==================================================
# UPDATE APPLICATION
# ==================================================
class ApplicationUpdate(BaseModel):
    ApplicantId: int = Field(..., gt=0)
    JobOpeningId: int = Field(..., gt=0)
    CurrentStatus: str = Field(..., min_length=1, max_length=50)
    Remarks: Optional[str] = None


# ==================================================
# APPLICATION RESPONSE
# ==================================================
class ApplicationResponse(BaseModel):
    ApplicationId: int
    CompanyId: int
    # --------------------------------------------------
    # APPLICATION INFORMATION
    # --------------------------------------------------
    ApplicantId: int
    JobOpeningId: int
    AppliedDate: datetime
    CurrentStatus: str
    Remarks: Optional[str] = None
    # --------------------------------------------------
    # AUDIT INFORMATION
    # --------------------------------------------------
    CreatedOn: Optional[datetime] = None
    CreatedBy: Optional[int] = None
    UpdatedOn: Optional[datetime] = None
    UpdatedBy: Optional[int] = None
    # --------------------------------------------------
    # APPLICANT DISPLAY INFORMATION
    # --------------------------------------------------
    ApplicantName: Optional[str] = None
    ApplicantEmail: Optional[str] = None
    ApplicantMobile: Optional[str] = None
    # --------------------------------------------------
    # JOB OPENING DISPLAY INFORMATION
    # --------------------------------------------------
    JobTitle: Optional[str] = None
    DepartmentName: Optional[str] = None

    class Config:
        from_attributes = True


# ==================================================
# APPLICATION LIST RESPONSE
# ==================================================
class ApplicationListResponse(BaseModel):
    total_records: int
    page: int
    page_size: int
    data: list[ApplicationResponse]
