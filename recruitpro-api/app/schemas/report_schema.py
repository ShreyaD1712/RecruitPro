from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime
from decimal import Decimal


# =========================================================
# RECRUITMENT SUMMARY
# =========================================================
class RecruitmentSummaryResponse(BaseModel):
    TotalApplications: int
    ShortlistedCandidates: int
    TotalInterviews: int
    TotalOffers: int
    HiredCandidates: int


# =========================================================
# APPLICATION REPORT
# =========================================================
class ApplicationReportItem(BaseModel):
    ApplicationId: int
    ApplicantId: int
    ApplicantName: str
    Email: str

    JobOpeningId: int
    JobTitle: str

    DepartmentId: int
    DepartmentName: str

    CompanyId: int
    CompanyName: str

    AppliedDate: datetime
    CurrentStatus: str
    Remarks: Optional[str] = None


class ApplicationReportResponse(BaseModel):
    total_records: int
    page: int
    page_size: int
    data: List[ApplicationReportItem]


# =========================================================
# INTERVIEW REPORT
# =========================================================
class InterviewReportItem(BaseModel):
    InterviewId: int
    ApplicationId: int

    ApplicantName: str
    Email: str
    JobTitle: str

    CompanyId: int
    CompanyName: str

    InterviewRoundId: int
    InterviewerId: int

    InterviewDate: datetime
    InterviewMode: str
    Status: str


class InterviewReportResponse(BaseModel):
    total_records: int
    page: int
    page_size: int
    data: List[InterviewReportItem]


# =========================================================
# OFFER REPORT
# =========================================================
class OfferReportItem(BaseModel):
    OfferId: int
    ApplicationId: int

    ApplicantName: str
    Email: str
    JobTitle: str

    CompanyId: int
    CompanyName: str

    OfferedSalary: Optional[Decimal] = None
    OfferDate: Optional[date] = None
    JoiningDate: Optional[date] = None
    OfferStatus: str
    Remarks: Optional[str] = None


class OfferReportResponse(BaseModel):
    total_records: int
    page: int
    page_size: int
    data: List[OfferReportItem]


# =========================================================
# HIRED CANDIDATES REPORT
# =========================================================
class HiredCandidateReportItem(BaseModel):
    ApplicationId: int
    ApplicantId: int

    ApplicantName: str
    Email: str

    JobOpeningId: int
    JobTitle: str

    DepartmentId: int
    DepartmentName: str

    CompanyId: int
    CompanyName: str

    AppliedDate: datetime
    CurrentStatus: str


class HiredCandidateReportResponse(BaseModel):
    total_records: int
    page: int
    page_size: int
    data: List[HiredCandidateReportItem]
