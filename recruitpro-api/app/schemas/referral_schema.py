from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ==================================================
# CREATE REFERRAL
# ==================================================
class ReferralCreate(BaseModel):
    ApplicationId: int = Field(..., gt=0)
    ApplicantId: int = Field(..., gt=0)

    # NULL means application was not referred
    ReferrerUserId: Optional[int] = Field(default=None, gt=0)

    Remarks: Optional[str] = Field(default=None, max_length=500)


# ==================================================
# UPDATE REFERRAL
# ==================================================
class ReferralUpdate(BaseModel):
    ApplicationId: int = Field(..., gt=0)
    ApplicantId: int = Field(..., gt=0)

    # NULL means not referred
    ReferrerUserId: Optional[int] = Field(default=None, gt=0)

    Remarks: Optional[str] = Field(default=None, max_length=500)


# ==================================================
# REFERRAL RESPONSE
# ==================================================
class ReferralResponse(BaseModel):
    ReferralId: int
    CompanyId: int

    # --------------------------------------------------
    # REFERRAL INFORMATION
    # --------------------------------------------------
    ApplicationId: int
    ApplicantId: int
    ReferrerUserId: Optional[int] = None
    ReferralDate: Optional[datetime] = None
    Remarks: Optional[str] = None

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
    ReferrerName: Optional[str] = None
    JobTitle: Optional[str] = None

    class Config:
        from_attributes = True


# ==================================================
# REFERRAL LIST RESPONSE
# ==================================================
class ReferralListResponse(BaseModel):
    total_records: int
    page: int
    page_size: int
    data: list[ReferralResponse]
