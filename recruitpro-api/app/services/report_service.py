from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from datetime import date

from app.repositories.report_repository import ReportRepository


class ReportService:

    def __init__(self):
        self.repository = ReportRepository()

    # =========================================================
    # VALIDATE COMPANY ACCESS
    # =========================================================
    def _get_company_id(self, current_user: dict, company_id: int = None):
        is_super_admin = current_user.get("is_super_admin", False)
        user_company_id = current_user.get("company_id")

        # -------------------------
        # Super Admin
        # -------------------------
        if is_super_admin:
            # None = All Companies
            return company_id

        # -------------------------
        # Company Users
        # -------------------------
        if not user_company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Company information not found for the current user",
            )

        return user_company_id

    # =========================================================
    # RECRUITMENT SUMMARY
    # =========================================================
    def get_recruitment_summary(
        self,
        db: Session,
        current_user: dict,
        company_id: int = None,
        from_date: date = None,
        to_date: date = None,
    ):
        effective_company_id = self._get_company_id(current_user, company_id)

        self._validate_date_range(from_date, to_date)

        return self.repository.get_recruitment_summary(
            db=db,
            current_user=current_user,
            company_id=effective_company_id,
            from_date=from_date,
            to_date=to_date,
        )

    # =========================================================
    # APPLICATION REPORT
    # =========================================================
    def get_application_report(
        self,
        db: Session,
        current_user: dict,
        company_id: int = None,
        department_id: int = None,
        job_opening_id: int = None,
        application_status: str = None,
        from_date: date = None,
        to_date: date = None,
        search: str = "",
        page: int = 1,
        page_size: int = 10,
    ):
        effective_company_id = self._get_company_id(current_user, company_id)

        self._validate_date_range(from_date, to_date)

        self._validate_pagination(page, page_size)

        return self.repository.get_application_report(
            db=db,
            current_user=current_user,
            company_id=effective_company_id,
            department_id=department_id,
            job_opening_id=job_opening_id,
            status=application_status,
            from_date=from_date,
            to_date=to_date,
            search=search,
            page=page,
            page_size=page_size,
        )

    # =========================================================
    # INTERVIEW REPORT
    # =========================================================
    def get_interview_report(
        self,
        db: Session,
        current_user: dict,
        company_id: int = None,
        interview_status: str = None,
        interviewer_id: int = None,
        interview_round_id: int = None,
        from_date: date = None,
        to_date: date = None,
        search: str = "",
        page: int = 1,
        page_size: int = 10,
    ):
        effective_company_id = self._get_company_id(current_user, company_id)

        self._validate_date_range(from_date, to_date)

        self._validate_pagination(page, page_size)

        return self.repository.get_interview_report(
            db=db,
            current_user=current_user,
            company_id=effective_company_id,
            status=interview_status,
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
    def get_offer_report(
        self,
        db: Session,
        current_user: dict,
        company_id: int = None,
        offer_status: str = None,
        from_date: date = None,
        to_date: date = None,
        search: str = "",
        page: int = 1,
        page_size: int = 10,
    ):
        effective_company_id = self._get_company_id(current_user, company_id)

        self._validate_date_range(from_date, to_date)

        self._validate_pagination(page, page_size)

        return self.repository.get_offer_report(
            db=db,
            current_user=current_user,
            company_id=effective_company_id,
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
    def get_hired_candidates_report(
        self,
        db: Session,
        current_user: dict,
        company_id: int = None,
        department_id: int = None,
        job_opening_id: int = None,
        from_date: date = None,
        to_date: date = None,
        search: str = "",
        page: int = 1,
        page_size: int = 10,
    ):
        effective_company_id = self._get_company_id(current_user, company_id)

        self._validate_date_range(from_date, to_date)

        self._validate_pagination(page, page_size)

        return self.repository.get_hired_candidates_report(
            db=db,
            current_user=current_user,
            company_id=effective_company_id,
            department_id=department_id,
            job_opening_id=job_opening_id,
            from_date=from_date,
            to_date=to_date,
            search=search,
            page=page,
            page_size=page_size,
        )

    # =========================================================
    # DATE VALIDATION
    # =========================================================
    def _validate_date_range(self, from_date: date = None, to_date: date = None):
        if from_date and to_date and from_date > to_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="From Date cannot be greater than To Date",
            )

    # =========================================================
    # PAGINATION VALIDATION
    # =========================================================
    def _validate_pagination(self, page: int, page_size: int):
        if page < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Page must be greater than 0",
            )

        if page_size < 1:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Page size must be greater than 0",
            )
