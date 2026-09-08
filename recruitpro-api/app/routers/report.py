from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import date

from app.database import get_db
from app.dependencies import get_current_user
from app.services.report_service import ReportService
from app.schemas.report_schema import (
    RecruitmentSummaryResponse,
    ApplicationReportResponse,
    InterviewReportResponse,
    OfferReportResponse,
    HiredCandidateReportResponse,
)

router = APIRouter(prefix="/reports", tags=["Reports"])

service = ReportService()


# =========================================================
# RECRUITMENT SUMMARY
# =========================================================
@router.get("/summary", response_model=RecruitmentSummaryResponse)
def get_recruitment_summary(
    company_id: int = Query(None),
    from_date: date = Query(None),
    to_date: date = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return service.get_recruitment_summary(
        db=db,
        current_user=current_user,
        company_id=company_id,
        from_date=from_date,
        to_date=to_date,
    )


# =========================================================
# APPLICATION REPORT
# =========================================================
@router.get("/applications", response_model=ApplicationReportResponse)
def get_application_report(
    company_id: int = Query(None),
    department_id: int = Query(None),
    job_opening_id: int = Query(None),
    application_status: str = Query(None),
    from_date: date = Query(None),
    to_date: date = Query(None),
    search: str = Query(""),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return service.get_application_report(
        db=db,
        current_user=current_user,
        company_id=company_id,
        department_id=department_id,
        job_opening_id=job_opening_id,
        application_status=application_status,
        from_date=from_date,
        to_date=to_date,
        search=search,
        page=page,
        page_size=page_size,
    )


# =========================================================
# INTERVIEW REPORT
# =========================================================
@router.get("/interviews", response_model=InterviewReportResponse)
def get_interview_report(
    company_id: int = Query(None),
    interview_status: str = Query(None),
    interviewer_id: int = Query(None),
    interview_round_id: int = Query(None),
    from_date: date = Query(None),
    to_date: date = Query(None),
    search: str = Query(""),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return service.get_interview_report(
        db=db,
        current_user=current_user,
        company_id=company_id,
        interview_status=interview_status,
        interviewer_id=interviewer_id,
        interview_round_id=interview_round_id,
        from_date=from_date,
        to_date=to_date,
        search=search,
        page=page,
        page_size=page_size,
    )


# =========================================================
# OFFER REPORT
# =========================================================
@router.get("/offers", response_model=OfferReportResponse)
def get_offer_report(
    company_id: int = Query(None),
    offer_status: str = Query(None),
    from_date: date = Query(None),
    to_date: date = Query(None),
    search: str = Query(""),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return service.get_offer_report(
        db=db,
        current_user=current_user,
        company_id=company_id,
        offer_status=offer_status,
        from_date=from_date,
        to_date=to_date,
        search=search,
        page=page,
        page_size=page_size,
    )


# =========================================================
# HIRED CANDIDATES REPORT
# =========================================================
@router.get("/hired-candidates", response_model=HiredCandidateReportResponse)
def get_hired_candidates_report(
    company_id: int = Query(None),
    department_id: int = Query(None),
    job_opening_id: int = Query(None),
    from_date: date = Query(None),
    to_date: date = Query(None),
    search: str = Query(""),
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return service.get_hired_candidates_report(
        db=db,
        current_user=current_user,
        company_id=company_id,
        department_id=department_id,
        job_opening_id=job_opening_id,
        from_date=from_date,
        to_date=to_date,
        search=search,
        page=page,
        page_size=page_size,
    )
