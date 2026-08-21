from datetime import datetime
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload
from app.models.applicant import Applicant
from app.models.job_opening import JobOpening
from app.models.application import Application
from app.schemas.application_schema import (
    ApplicationCreate,
    ApplicationUpdate,
)


class ApplicationRepository:
    # ==================================================
    # Get All Applications
    # ==================================================
    def get_all(
        self,
        db: Session,
        company_id: int,
        search: str = "",
        job_opening_id: int | None = None,
        department_id: int | None = None,
        Current_Status: str | None = None,
        sort_by: str = "AppliedDate",
        order: str = "desc",
        page: int = 1,
        page_size: int = 10,
    ):
        query = db.query(Application).options(
            joinedload(Application.company),
            joinedload(Application.applicant),
            joinedload(Application.job_opening).joinedload(JobOpening.department),
        )
        # ==================================================
        # COMPANY FILTER
        # ==================================================
        query = query.filter(Application.CompanyId == company_id)

        # ==================================================
        # JOB OPENING FILTER
        # ==================================================
        if job_opening_id is not None:
            query = query.filter(Application.JobOpeningId == job_opening_id)
        # ==================================================
        # DEPARTMENT FILTER
        # ==================================================
        if department_id is not None:
            query = query.join(Application.job_opening).filter(
                Application.job_opening.has(DepartmentId=department_id)
            )
        # ==================================================
        # STATUS FILTER
        # ==================================================
        if Current_Status and Current_Status != "All":
            query = query.filter(Application.CurrentStatus == Current_Status)
        # ==================================================
        # SEARCH
        # ==================================================
        if search:
            search_value = f"%{search}%"
            query = (
                query.join(Application.applicant)
                .join(Application.job_opening)
                .filter(
                    or_(
                        Applicant.FirstName.ilike(search_value),
                        Applicant.LastName.ilike(search_value),
                        Applicant.Email.ilike(search_value),
                        JobOpening.JobTitle.ilike(search_value),
                        Application.Remarks.ilike(search_value),
                        Application.CurrentStatus.ilike(search_value),
                    )
                )
            )
        # ==================================================
        # SORTING
        # ==================================================
        allowed_sort_columns = {
            "ApplicationId": Application.ApplicationId,
            "AppliedDate": Application.AppliedDate,
            "CurrentStatus": Application.CurrentStatus,
            "CreatedOn": Application.CreatedOn,
        }
        column = allowed_sort_columns.get(
            sort_by,
            Application.AppliedDate,
        )
        if order.lower() == "desc":
            query = query.order_by(column.desc())
        else:
            query = query.order_by(column.asc())
        # ==================================================
        # TOTAL RECORDS
        # ==================================================
        total_records = query.count()
        # ==================================================
        # PAGINATION
        # ==================================================
        data = query.offset((page - 1) * page_size).limit(page_size).all()
        return {
            "total_records": total_records,
            "page": page,
            "page_size": page_size,
            "data": data,
        }

    # ==================================================
    # Get Application By ID
    # ==================================================
    def get_by_id(
        self,
        db: Session,
        application_id: int,
        company_id: int,
    ):
        return (
            db.query(Application)
            .options(
                joinedload(Application.company),
                joinedload(Application.applicant),
                joinedload(Application.job_opening).joinedload(JobOpening.department),
            )
            .filter(
                Application.ApplicationId == application_id,
                Application.CompanyId == company_id,
            )
            .first()
        )

    # ==================================================
    # Check Existing Application
    # ==================================================
    def get_by_applicant_and_job(
        self,
        db: Session,
        applicant_id: int,
        job_opening_id: int,
        company_id: int,
    ):
        return (
            db.query(Application)
            .filter(
                Application.ApplicantId == applicant_id,
                Application.JobOpeningId == job_opening_id,
                Application.CompanyId == company_id,
            )
            .first()
        )

    # ==================================================
    # Get Applicant
    # ==================================================
    def get_applicant(
        self,
        db: Session,
        applicant_id: int,
        company_id: int,
    ):
        return (
            db.query(Applicant)
            .filter(
                Applicant.ApplicantId == applicant_id,
                Applicant.CompanyId == company_id,
            )
            .first()
        )

    # ==================================================
    # Get Job Opening
    # ==================================================
    def get_job_opening(
        self,
        db: Session,
        job_opening_id: int,
        company_id: int,
    ):
        return (
            db.query(JobOpening)
            .options(
                joinedload(JobOpening.department),
            )
            .filter(
                JobOpening.JobOpeningId == job_opening_id,
                JobOpening.CompanyId == company_id,
            )
            .first()
        )

    # ==================================================
    # CREATE
    # ==================================================
    def create(
        self,
        db: Session,
        application: ApplicationCreate,
        company_id: int,
        current_user: dict,
    ):
        now = datetime.now()
        new_application = Application(
            # ==================================================
            # COMPANY
            # ==================================================
            # CompanyId NEVER comes from Angular.
            # It comes from logged-in user.
            CompanyId=company_id,
            # ==================================================
            # APPLICATION RELATIONSHIPS
            # ==================================================
            ApplicantId=application.ApplicantId,
            JobOpeningId=application.JobOpeningId,
            # ==================================================
            # APPLICATION DETAILS
            # ==================================================
            # AppliedDate is automatically generated.
            # It does NOT come from Angular.
            AppliedDate=now,
            CurrentStatus=application.CurrentStatus,
            Remarks=application.Remarks,
            # ==================================================
            # AUDIT
            # ==================================================
            CreatedOn=now,
            CreatedBy=current_user["user_id"],
            UpdatedOn=now,
            UpdatedBy=current_user["user_id"],
        )
        db.add(new_application)
        db.commit()
        db.refresh(new_application)
        return new_application

    # ==================================================
    # UPDATE
    # ==================================================
    def update(
        self,
        db: Session,
        application_id: int,
        application: ApplicationUpdate,
        current_user: dict,
    ):
        # ==================================================
        # GET EXISTING APPLICATION
        # ==================================================
        existing_application = self.get_by_id(
            db=db,
            application_id=application_id,
            company_id=current_user["company_id"],
        )
        # ==================================================
        # SECURITY CHECK
        # ==================================================
        if not existing_application:
            return None
        # ==================================================
        # COMPANY ID IS NEVER CHANGED
        # ==================================================
        # ==================================================
        # APPLICANT
        # ==================================================
        existing_application.ApplicantId = application.ApplicantId
        # ==================================================
        # JOB OPENING
        # ==================================================
        existing_application.JobOpeningId = application.JobOpeningId
        # ==================================================
        # STATUS
        # ==================================================
        existing_application.CurrentStatus = application.CurrentStatus
        # ==================================================
        # REMARKS
        # ==================================================
        existing_application.Remarks = application.Remarks
        # ==================================================
        # APPLIED DATE
        # ==================================================
        # IMPORTANT:
        # AppliedDate is NEVER changed during update.
        # ==================================================
        # AUDIT
        # ==================================================
        existing_application.UpdatedOn = datetime.now()
        existing_application.UpdatedBy = current_user["user_id"]
        db.commit()
        db.refresh(existing_application)
        return existing_application

    # ==================================================
    # DELETE
    # ==================================================
    def delete(
        self,
        db: Session,
        application_id: int,
        company_id: int,
    ):
        # ==================================================
        # GET APPLICATION WITH COMPANY CHECK
        # ==================================================
        application = self.get_by_id(
            db=db,
            application_id=application_id,
            company_id=company_id,
        )
        # ==================================================
        # SECURITY CHECK
        # ==================================================
        if not application:
            return None
        # ==================================================
        # DELETE
        # ==================================================
        db.delete(application)
        db.commit()
        return application
