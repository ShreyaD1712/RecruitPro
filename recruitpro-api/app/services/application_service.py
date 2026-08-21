from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.application_repository import ApplicationRepository
from app.schemas.application_schema import (
    ApplicationCreate,
    ApplicationUpdate,
)


class ApplicationService:
    def __init__(self):
        self.repository = ApplicationRepository()

    # PERMISSION CHECK
    def check_permission(
        self,
        current_user: dict,
        permission: str,
    ):
        user_permissions = current_user.get("permissions", [])
        if permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )

    # GET COMPANY ID
    def get_company_id(
        self,
        current_user: dict,
    ):
        company_id = current_user.get("company_id")
        if not company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Company information not found for the current user",
            )
        return company_id

    # GET ALL APPLICATIONS
    def get_all_applications(
        self,
        db: Session,
        current_user: dict,
        search: str = "",
        department_id: int | None = None,
        job_opening_id: int | None = None,
        Current_Status: str | None = None,
        sort_by: str = "AppliedDate",
        order: str = "desc",
        page: int = 1,
        page_size: int = 10,
    ):
        self.check_permission(
            current_user,
            "VIEW_APPLICATION",
        )
        company_id = self.get_company_id(current_user)
        return self.repository.get_all(
            db=db,
            company_id=company_id,
            search=search,
            department_id=department_id,
            job_opening_id=job_opening_id,
            Current_Status=Current_Status,
            sort_by=sort_by,
            order=order,
            page=page,
            page_size=page_size,
        )

    # GET APPLICATION BY ID
    def get_application_by_id(
        self,
        db: Session,
        application_id: int,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "VIEW_APPLICATION",
        )
        company_id = self.get_company_id(current_user)
        application = self.repository.get_by_id(
            db=db,
            application_id=application_id,
            company_id=company_id,
        )
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found",
            )
        return application

    # CREATE APPLICATION
    def create_application(
        self,
        db: Session,
        application: ApplicationCreate,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "CREATE_APPLICATION",
        )
        company_id = self.get_company_id(current_user)
        # Check Applicant
        applicant = self.repository.get_applicant(
            db=db,
            applicant_id=application.ApplicantId,
            company_id=company_id,
        )
        if not applicant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Applicant not found in your company",
            )
        # Check Job Opening
        job_opening = self.repository.get_job_opening(
            db=db,
            job_opening_id=application.JobOpeningId,
            company_id=company_id,
        )
        if not job_opening:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job Opening not found in your company",
            )
        # Job Opening Status Check
        if job_opening.Status != "Open":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Application cannot be created for a closed job opening",
            )
        # Check Duplicate Application
        existing_application = self.repository.get_by_applicant_and_job(
            db=db,
            applicant_id=application.ApplicantId,
            job_opening_id=application.JobOpeningId,
            company_id=company_id,
        )
        if existing_application:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This applicant has already applied for this job opening",
            )
        # Validate Application Status
        allowed_statuses = [
            "Applied",
            "Screening",
            "Shortlisted",
            "Interview",
            "Selected",
            "Rejected",
            "Hired",
        ]
        if application.CurrentStatus not in allowed_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid application status",
            )
        # Create Application
        return self.repository.create(
            db=db,
            application=application,
            company_id=company_id,
            current_user=current_user,
        )

    # UPDATE APPLICATION
    def update_application(
        self,
        db: Session,
        application_id: int,
        application: ApplicationUpdate,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "UPDATE_APPLICATION",
        )
        company_id = self.get_company_id(current_user)
        # Find Existing Application
        existing = self.repository.get_by_id(
            db=db,
            application_id=application_id,
            company_id=company_id,
        )
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found",
            )
        # Check Applicant
        applicant = self.repository.get_applicant(
            db=db,
            applicant_id=application.ApplicantId,
            company_id=company_id,
        )
        if not applicant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Applicant not found in your company",
            )
        # Check Job Opening
        job_opening = self.repository.get_job_opening(
            db=db,
            job_opening_id=application.JobOpeningId,
            company_id=company_id,
        )
        if not job_opening:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job Opening not found in your company",
            )
        # Check Duplicate Application
        duplicate_application = self.repository.get_by_applicant_and_job(
            db=db,
            applicant_id=application.ApplicantId,
            job_opening_id=application.JobOpeningId,
            company_id=company_id,
        )
        if (
            duplicate_application
            and duplicate_application.ApplicationId != application_id
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This applicant has already applied for this job opening",
            )
        # Validate Application Status
        allowed_statuses = [
            "Applied",
            "Screening",
            "Shortlisted",
            "Interview",
            "Selected",
            "Rejected",
            "Hired",
        ]
        if application.CurrentStatus not in allowed_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid application status",
            )
        # Update Application
        return self.repository.update(
            db=db,
            application_id=application_id,
            application=application,
            current_user=current_user,
        )

    # DELETE APPLICATION
    def delete_application(
        self,
        db: Session,
        application_id: int,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "DELETE_APPLICATION",
        )
        company_id = self.get_company_id(current_user)
        # Check Existing Application
        existing = self.repository.get_by_id(
            db=db,
            application_id=application_id,
            company_id=company_id,
        )
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found",
            )
        # Delete Application
        self.repository.delete(
            db=db,
            application_id=application_id,
            company_id=company_id,
        )
        return {"message": "Application deleted successfully"}
