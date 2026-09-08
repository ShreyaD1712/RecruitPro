from sqlalchemy import Date, func, or_
from sqlalchemy.orm import Session
from datetime import date

from app.models.company import Company
from app.models.department import Department
from app.models.applicant import Applicant
from app.models.application import Application
from app.models.job_opening import JobOpening
from app.models.interview import Interview
from app.models.offer import Offer


class ReportRepository:

    # =========================================================
    # COMPANY SCOPE
    # =========================================================
    def get_company_id(self, current_user: dict, company_id: int = None):
        if current_user["is_super_admin"]:
            return company_id

        return current_user["company_id"]

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
        company_id = self.get_company_id(current_user, company_id)

        # -------------------------
        # Applications
        # -------------------------
        application_query = db.query(Application)

        if company_id is not None:
            application_query = application_query.filter(
                Application.CompanyId == company_id
            )

        if from_date:
            application_query = application_query.filter(
                func.cast(Application.AppliedDate, Date) >= from_date
            )

        if to_date:
            application_query = application_query.filter(
                func.cast(Application.AppliedDate, Date) <= to_date
            )

        total_applications = application_query.count()

        shortlisted_candidates = application_query.filter(
            Application.CurrentStatus == "Shortlisted"
        ).count()

        hired_candidates = application_query.filter(
            Application.CurrentStatus == "Hired"
        ).count()

        # -------------------------
        # Interviews
        # -------------------------
        interview_query = db.query(Interview)

        if company_id is not None:
            interview_query = interview_query.filter(Interview.CompanyId == company_id)

        if from_date:
            interview_query = interview_query.filter(
                func.cast(Interview.InterviewDate, Date) >= from_date
            )

        if to_date:
            interview_query = interview_query.filter(
                func.cast(Interview.InterviewDate, Date) <= to_date
            )

        total_interviews = interview_query.count()

        # -------------------------
        # Offers
        # -------------------------
        offer_query = db.query(Offer)

        if company_id is not None:
            offer_query = offer_query.filter(Offer.CompanyId == company_id)

        if from_date:
            offer_query = offer_query.filter(
                func.cast(Offer.OfferDate, Date) >= from_date
            )

        if to_date:
            offer_query = offer_query.filter(
                func.cast(Offer.OfferDate, Date) <= to_date
            )

        total_offers = offer_query.count()

        return {
            "TotalApplications": total_applications,
            "ShortlistedCandidates": shortlisted_candidates,
            "TotalInterviews": total_interviews,
            "TotalOffers": total_offers,
            "HiredCandidates": hired_candidates,
        }

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
        status: str = None,
        from_date: date = None,
        to_date: date = None,
        search: str = "",
        page: int = 1,
        page_size: int = 10,
    ):
        company_id = self.get_company_id(current_user, company_id)

        query = (
            db.query(
                Application.ApplicationId,
                Application.AppliedDate,
                Application.CurrentStatus,
                Application.Remarks,
                Applicant.ApplicantId,
                Applicant.FirstName,
                Applicant.LastName,
                Applicant.Email,
                JobOpening.JobOpeningId,
                JobOpening.JobTitle,
                Department.DepartmentId,
                Department.DepartmentName,
                Company.CompanyId,
                Company.CompanyName,
            )
            .join(Applicant, Application.ApplicantId == Applicant.ApplicantId)
            .join(JobOpening, Application.JobOpeningId == JobOpening.JobOpeningId)
            .join(Department, JobOpening.DepartmentId == Department.DepartmentId)
            .join(Company, Application.CompanyId == Company.CompanyId)
        )

        # -------------------------
        # Company Filter
        # -------------------------
        if company_id is not None:
            query = query.filter(Application.CompanyId == company_id)

        # -------------------------
        # Department Filter
        # -------------------------
        if department_id is not None:
            query = query.filter(JobOpening.DepartmentId == department_id)

        # -------------------------
        # Job Opening Filter
        # -------------------------
        if job_opening_id is not None:
            query = query.filter(Application.JobOpeningId == job_opening_id)

        # -------------------------
        # Status Filter
        # -------------------------
        if status:
            query = query.filter(Application.CurrentStatus == status)

        # -------------------------
        # Date Filter
        # -------------------------
        if from_date:
            query = query.filter(func.cast(Application.AppliedDate, Date) >= from_date)

        if to_date:
            query = query.filter(func.cast(Application.AppliedDate, Date) <= to_date)

        # -------------------------
        # Search
        # -------------------------
        if search:
            query = query.filter(
                or_(
                    Applicant.FirstName.ilike(f"%{search}%"),
                    Applicant.LastName.ilike(f"%{search}%"),
                    Applicant.Email.ilike(f"%{search}%"),
                    JobOpening.JobTitle.ilike(f"%{search}%"),
                    Department.DepartmentName.ilike(f"%{search}%"),
                )
            )

        total_records = query.count()

        records = (
            query.order_by(Application.AppliedDate.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

        data = []

        for row in records:
            data.append(
                {
                    "ApplicationId": row.ApplicationId,
                    "ApplicantId": row.ApplicantId,
                    "ApplicantName": f"{row.FirstName} {row.LastName}",
                    "Email": row.Email,
                    "JobOpeningId": row.JobOpeningId,
                    "JobTitle": row.JobTitle,
                    "DepartmentId": row.DepartmentId,
                    "DepartmentName": row.DepartmentName,
                    "CompanyId": row.CompanyId,
                    "CompanyName": row.CompanyName,
                    "AppliedDate": row.AppliedDate,
                    "CurrentStatus": row.CurrentStatus,
                    "Remarks": row.Remarks,
                }
            )

        return {
            "total_records": total_records,
            "page": page,
            "page_size": page_size,
            "data": data,
        }

    # =========================================================
    # INTERVIEW REPORT
    # =========================================================
    def get_interview_report(
        self,
        db: Session,
        current_user: dict,
        company_id: int = None,
        status: str = None,
        interviewer_id: int = None,
        interview_round_id: int = None,
        from_date: date = None,
        to_date: date = None,
        search: str = "",
        page: int = 1,
        page_size: int = 10,
    ):
        company_id = self.get_company_id(current_user, company_id)

        query = (
            db.query(
                Interview,
                Application,
                Applicant,
                JobOpening,
                Company,
            )
            .join(Application, Interview.ApplicationId == Application.ApplicationId)
            .join(Applicant, Application.ApplicantId == Applicant.ApplicantId)
            .join(JobOpening, Application.JobOpeningId == JobOpening.JobOpeningId)
            .join(Company, Interview.CompanyId == Company.CompanyId)
        )

        # -------------------------
        # Company Filter
        # -------------------------
        if company_id is not None:
            query = query.filter(Interview.CompanyId == company_id)

        # -------------------------
        # Status Filter
        # -------------------------
        if status:
            query = query.filter(Interview.Status == status)

        # -------------------------
        # Interviewer Filter
        # -------------------------
        if interviewer_id is not None:
            query = query.filter(Interview.InterviewerId == interviewer_id)

        # -------------------------
        # Interview Round Filter
        # -------------------------
        if interview_round_id is not None:
            query = query.filter(Interview.InterviewRoundId == interview_round_id)

        # -------------------------
        # Date Filter
        # -------------------------
        if from_date:
            query = query.filter(func.cast(Interview.InterviewDate, Date) >= from_date)

        if to_date:
            query = query.filter(func.cast(Interview.InterviewDate, Date) <= to_date)

        # -------------------------
        # Search
        # -------------------------
        if search:
            query = query.filter(
                or_(
                    Applicant.FirstName.ilike(f"%{search}%"),
                    Applicant.LastName.ilike(f"%{search}%"),
                    Applicant.Email.ilike(f"%{search}%"),
                    JobOpening.JobTitle.ilike(f"%{search}%"),
                )
            )

        total_records = query.count()

        records = (
            query.order_by(Interview.InterviewDate.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

        data = []

        for interview, application, applicant, job, company in records:
            data.append(
                {
                    "InterviewId": interview.InterviewId,
                    "ApplicationId": application.ApplicationId,
                    "ApplicantName": (f"{applicant.FirstName} {applicant.LastName}"),
                    "Email": applicant.Email,
                    "JobTitle": job.JobTitle,
                    "CompanyId": company.CompanyId,
                    "CompanyName": company.CompanyName,
                    "InterviewRoundId": interview.InterviewRoundId,
                    "InterviewerId": interview.InterviewerId,
                    "InterviewDate": interview.InterviewDate,
                    "InterviewMode": interview.InterviewMode,
                    "Status": interview.Status,
                }
            )

        return {
            "total_records": total_records,
            "page": page,
            "page_size": page_size,
            "data": data,
        }

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
        company_id = self.get_company_id(current_user, company_id)

        query = (
            db.query(
                Offer,
                Application,
                Applicant,
                JobOpening,
                Company,
            )
            .join(Application, Offer.ApplicationId == Application.ApplicationId)
            .join(Applicant, Application.ApplicantId == Applicant.ApplicantId)
            .join(JobOpening, Application.JobOpeningId == JobOpening.JobOpeningId)
            .join(Company, Offer.CompanyId == Company.CompanyId)
        )

        # -------------------------
        # Company Filter
        # -------------------------
        if company_id is not None:
            query = query.filter(Offer.CompanyId == company_id)

        # -------------------------
        # Offer Status Filter
        # -------------------------
        if offer_status:
            query = query.filter(Offer.OfferStatus == offer_status)

        # -------------------------
        # Date Filter
        # -------------------------
        if from_date:
            query = query.filter(func.cast(Offer.OfferDate, Date) >= from_date)

        if to_date:
            query = query.filter(func.cast(Offer.OfferDate, Date) <= to_date)

        # -------------------------
        # Search
        # -------------------------
        if search:
            query = query.filter(
                or_(
                    Applicant.FirstName.ilike(f"%{search}%"),
                    Applicant.LastName.ilike(f"%{search}%"),
                    Applicant.Email.ilike(f"%{search}%"),
                    JobOpening.JobTitle.ilike(f"%{search}%"),
                )
            )

        total_records = query.count()

        records = (
            query.order_by(Offer.OfferDate.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

        data = []

        for offer, application, applicant, job, company in records:
            data.append(
                {
                    "OfferId": offer.OfferId,
                    "ApplicationId": application.ApplicationId,
                    "ApplicantName": (f"{applicant.FirstName} {applicant.LastName}"),
                    "Email": applicant.Email,
                    "JobTitle": job.JobTitle,
                    "CompanyId": company.CompanyId,
                    "CompanyName": company.CompanyName,
                    "OfferedSalary": offer.OfferedSalary,
                    "OfferDate": offer.OfferDate,
                    "JoiningDate": offer.JoiningDate,
                    "OfferStatus": offer.OfferStatus,
                    "Remarks": offer.Remarks,
                }
            )

        return {
            "total_records": total_records,
            "page": page,
            "page_size": page_size,
            "data": data,
        }

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
        company_id = self.get_company_id(current_user, company_id)

        query = (
            db.query(
                Application,
                Applicant,
                JobOpening,
                Department,
                Company,
            )
            .join(Applicant, Application.ApplicantId == Applicant.ApplicantId)
            .join(JobOpening, Application.JobOpeningId == JobOpening.JobOpeningId)
            .join(Department, JobOpening.DepartmentId == Department.DepartmentId)
            .join(Company, Application.CompanyId == Company.CompanyId)
            .filter(Application.CurrentStatus == "Hired")
        )

        # -------------------------
        # Company Filter
        # -------------------------
        if company_id is not None:
            query = query.filter(Application.CompanyId == company_id)

        # -------------------------
        # Department Filter
        # -------------------------
        if department_id is not None:
            query = query.filter(JobOpening.DepartmentId == department_id)

        # -------------------------
        # Job Opening Filter
        # -------------------------
        if job_opening_id is not None:
            query = query.filter(Application.JobOpeningId == job_opening_id)

        # -------------------------
        # Date Filter
        # -------------------------
        if from_date:
            query = query.filter(func.cast(Application.AppliedDate, Date) >= from_date)

        if to_date:
            query = query.filter(func.cast(Application.AppliedDate, Date) <= to_date)

        # -------------------------
        # Search
        # -------------------------
        if search:
            query = query.filter(
                or_(
                    Applicant.FirstName.ilike(f"%{search}%"),
                    Applicant.LastName.ilike(f"%{search}%"),
                    Applicant.Email.ilike(f"%{search}%"),
                    JobOpening.JobTitle.ilike(f"%{search}%"),
                    Department.DepartmentName.ilike(f"%{search}%"),
                )
            )

        total_records = query.count()

        records = (
            query.order_by(Application.AppliedDate.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

        data = []

        for application, applicant, job, department, company in records:
            data.append(
                {
                    "ApplicationId": application.ApplicationId,
                    "ApplicantId": applicant.ApplicantId,
                    "ApplicantName": (f"{applicant.FirstName} {applicant.LastName}"),
                    "Email": applicant.Email,
                    "JobOpeningId": job.JobOpeningId,
                    "JobTitle": job.JobTitle,
                    "DepartmentId": department.DepartmentId,
                    "DepartmentName": department.DepartmentName,
                    "CompanyId": company.CompanyId,
                    "CompanyName": company.CompanyName,
                    "AppliedDate": application.AppliedDate,
                    "CurrentStatus": application.CurrentStatus,
                }
            )

        return {
            "total_records": total_records,
            "page": page,
            "page_size": page_size,
            "data": data,
        }
