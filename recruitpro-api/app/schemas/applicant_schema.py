from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from decimal import Decimal


# ==================================================
# CREATE APPLICANT
# ==================================================
class ApplicantCreate(BaseModel):
    FirstName: str = Field(..., min_length=1, max_length=100)
    LastName: str = Field(..., min_length=1, max_length=100)
    Email: str = Field(..., min_length=1, max_length=150)
    MobileNo: str = Field(..., min_length=1, max_length=20)
    DOB: Optional[date] = None
    Gender: Optional[str] = Field(default=None, max_length=20)
    CurrentCity: Optional[str] = Field(default=None, max_length=100)
    CurrentCompany: Optional[str] = Field(default=None, max_length=150)
    CurrentCTC: Optional[Decimal] = Field(default=None, ge=0)
    ExpectedCTC: Optional[Decimal] = Field(default=None, ge=0)
    NoticePeriod: Optional[str] = Field(default=None, max_length=50)
    LinkedInUrl: Optional[str] = Field(default=None, max_length=255)


# ==================================================
# UPDATE APPLICANT
# ==================================================
class ApplicantUpdate(BaseModel):
    FirstName: str = Field(..., min_length=1, max_length=100)
    LastName: str = Field(..., min_length=1, max_length=100)
    Email: str = Field(..., min_length=1, max_length=150)
    MobileNo: str = Field(..., min_length=1, max_length=20)
    DOB: Optional[date] = None
    Gender: Optional[str] = Field(default=None, max_length=20)
    CurrentCity: Optional[str] = Field(default=None, max_length=100)
    CurrentCompany: Optional[str] = Field(default=None, max_length=150)
    CurrentCTC: Optional[Decimal] = Field(default=None, ge=0)
    ExpectedCTC: Optional[Decimal] = Field(default=None, ge=0)
    NoticePeriod: Optional[str] = Field(default=None, max_length=50)
    LinkedInUrl: Optional[str] = Field(default=None, max_length=255)


# ==================================================
# APPLICANT RESPONSE
# ==================================================
class ApplicantResponse(BaseModel):
    ApplicantId: int
    CompanyId: int
    # --------------------------------------------------
    # Personal Information
    # --------------------------------------------------
    FirstName: str
    LastName: str
    Email: str
    MobileNo: str
    DOB: Optional[date] = None
    Gender: Optional[str] = None
    CurrentCity: Optional[str] = None
    # --------------------------------------------------
    # Professional Information
    # --------------------------------------------------
    CurrentCompany: Optional[str] = None
    CurrentCTC: Optional[Decimal] = None
    ExpectedCTC: Optional[Decimal] = None
    NoticePeriod: Optional[str] = None
    LinkedInUrl: Optional[str] = None
    # --------------------------------------------------
    # Audit Information
    # --------------------------------------------------
    CreatedOn: Optional[datetime] = None
    CreatedBy: Optional[int] = None
    UpdatedOn: Optional[datetime] = None
    UpdatedBy: Optional[int] = None

    class Config:
        from_attributes = True


# ==================================================
# APPLICANT LIST RESPONSE
# ==================================================
class ApplicantListResponse(BaseModel):
    total_records: int
    page: int
    page_size: int
    data: list[ApplicantResponse]


# ==================================================
# APPLICATION RESPONSE
# ==================================================
# Application is a separate module.
# Status belongs here, NOT in Applicant.
class ApplicationResponse(BaseModel):
    ApplicationId: int
    CompanyId: int
    ApplicantId: int
    JobOpeningId: int
    AppliedDate: datetime
    CurrentStatus: str
    Remarks: Optional[str] = None
    CreatedOn: Optional[datetime] = None
    CreatedBy: Optional[int] = None
    UpdatedOn: Optional[datetime] = None
    UpdatedBy: Optional[int] = None
    # --------------------------------------------------
    # Display Information
    # --------------------------------------------------
    JobTitle: Optional[str] = None
    DepartmentName: Optional[str] = None
    DesignationName: Optional[str] = None

    class Config:
        from_attributes = True
