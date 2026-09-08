from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional

from app.models.job_opening import JobOpening
from app.models.application import Application
from app.models.interview import Interview
from app.models.offer import Offer
from app.models.department import Department
from app.models.company import Company


class DashboardRepository:

    def get_stats(self, db: Session, company_id: Optional[int] = None):

        job_query = db.query(func.count(JobOpening.JobOpeningId)).filter(
            JobOpening.Status == "Open"
        )

        application_query = db.query(func.count(Application.ApplicationId))

        shortlisted_query = db.query(func.count(Application.ApplicationId)).filter(
            Application.CurrentStatus == "Shortlisted"
        )

        interview_query = db.query(func.count(Interview.InterviewId))

        offer_query = db.query(func.count(Offer.OfferId))

        hired_query = db.query(func.count(Application.ApplicationId)).filter(
            Application.CurrentStatus == "Hired"
        )

        # Company-wise filtering for normal users
        if company_id is not None:
            job_query = job_query.filter(JobOpening.CompanyId == company_id)

            application_query = application_query.filter(
                Application.CompanyId == company_id
            )

            shortlisted_query = shortlisted_query.filter(
                Application.CompanyId == company_id
            )

            interview_query = interview_query.filter(Interview.CompanyId == company_id)

            offer_query = offer_query.filter(Offer.CompanyId == company_id)

            hired_query = hired_query.filter(Application.CompanyId == company_id)

        return {
            "TotalJobOpenings": job_query.scalar() or 0,
            "TotalApplications": application_query.scalar() or 0,
            "ShortlistedCandidates": shortlisted_query.scalar() or 0,
            "TotalInterviews": interview_query.scalar() or 0,
            "TotalOffers": offer_query.scalar() or 0,
            "HiredCandidates": hired_query.scalar() or 0,
        }

    def get_total_companies(self, db: Session):

        return (db.query(func.count(Company.CompanyId)).scalar()) or 0

    def get_applications_by_status(self, db: Session, company_id: Optional[int] = None):

        query = db.query(
            Application.CurrentStatus.label("Status"),
            func.count(Application.ApplicationId).label("Count"),
        )

        if company_id is not None:
            query = query.filter(Application.CompanyId == company_id)

        data = (
            query.group_by(Application.CurrentStatus)
            .order_by(func.count(Application.ApplicationId).desc())
            .all()
        )

        return [{"Status": row.Status, "Count": row.Count} for row in data]

    def get_applications_by_department(
        self, db: Session, company_id: Optional[int] = None
    ):

        query = (
            db.query(
                Department.DepartmentName,
                func.count(Application.ApplicationId).label("Count"),
            )
            .join(JobOpening, JobOpening.DepartmentId == Department.DepartmentId)
            .join(Application, Application.JobOpeningId == JobOpening.JobOpeningId)
        )

        if company_id is not None:
            query = query.filter(Application.CompanyId == company_id)

        data = (
            query.group_by(Department.DepartmentId, Department.DepartmentName)
            .order_by(func.count(Application.ApplicationId).desc())
            .all()
        )

        return [
            {"DepartmentName": row.DepartmentName, "Count": row.Count} for row in data
        ]

    def get_applications_by_company(self, db: Session):

        data = (
            db.query(
                Company.CompanyName,
                func.count(Application.ApplicationId).label("Count"),
            )
            .join(Application, Application.CompanyId == Company.CompanyId)
            .group_by(Company.CompanyId, Company.CompanyName)
            .order_by(func.count(Application.ApplicationId).desc())
            .all()
        )

        return [{"CompanyName": row.CompanyName, "Count": row.Count} for row in data]
