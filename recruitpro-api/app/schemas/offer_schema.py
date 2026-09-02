from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from decimal import Decimal


# ==================================================
# CREATE OFFER
# ==================================================
class OfferCreate(BaseModel):

    # Application for which the offer is created
    ApplicationId: int = Field(..., gt=0)

    # Offered salary
    OfferedSalary: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    # Expected joining date
    JoiningDate: Optional[date] = None

    # Date on which offer is issued
    OfferDate: Optional[date] = None

    # Offer status
    OfferStatus: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    # Additional remarks
    Remarks: Optional[str] = Field(
        default=None,
        max_length=500,
    )


# ==================================================
# UPDATE OFFER
# ==================================================
class OfferUpdate(BaseModel):

    # ApplicationId remains required so backend can
    # validate that offer belongs to this application
    ApplicationId: int = Field(..., gt=0)

    OfferedSalary: Optional[Decimal] = Field(
        default=None,
        ge=0,
    )

    JoiningDate: Optional[date] = None

    OfferDate: Optional[date] = None

    OfferStatus: Optional[str] = Field(
        default=None,
        max_length=50,
    )

    Remarks: Optional[str] = Field(
        default=None,
        max_length=500,
    )


# ==================================================
# OFFER RESPONSE
# ==================================================
class OfferResponse(BaseModel):

    OfferId: int

    CompanyId: int

    # --------------------------------------------------
    # OFFER INFORMATION
    # --------------------------------------------------
    ApplicationId: int

    OfferedSalary: Optional[Decimal] = None

    JoiningDate: Optional[date] = None

    OfferDate: Optional[date] = None

    OfferStatus: Optional[str] = None

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

    ApplicantEmail: Optional[str] = None

    JobTitle: Optional[str] = None

    DepartmentName: Optional[str] = None

    DesignationName: Optional[str] = None

    ApplicationStatus: Optional[str] = None

    AppliedDate: Optional[datetime] = None

    class Config:
        from_attributes = True


# ==================================================
# OFFER LIST RESPONSE
# ==================================================
class OfferListResponse(BaseModel):

    total_records: int

    page: int

    page_size: int

    data: list[OfferResponse]
