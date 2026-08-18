from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.job_opening_repository import JobOpeningRepository
from app.repositories.department_repository import DepartmentRepository
from app.repositories.designation_repository import DesignationRepository
from app.repositories.job_category_repository import JobCategoryRepository
from app.repositories.employment_type_repository import EmploymentTypeRepository
from app.repositories.experience_level_repository import ExperienceLevelRepository
from app.schemas.job_opening_schema import (
    JobOpeningCreate,
    JobOpeningUpdate,
)


class JobOpeningService:
    def __init__(self):
        self.repository = JobOpeningRepository()
        self.department_repository = DepartmentRepository()
        self.designation_repository = DesignationRepository()
        self.job_category_repository = JobCategoryRepository()
        self.employment_type_repository = EmploymentTypeRepository()
        self.experience_level_repository = ExperienceLevelRepository()

    # -------------------------
    # Permission Check
    # -------------------------
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

    # -------------------------
    # Get Company ID
    # -------------------------
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

    # -------------------------
    # Validate Master Data
    # -------------------------
    def validate_master_data(
        self,
        db: Session,
        company_id: int,
        department_id: int,
        designation_id: int,
        job_category_id: int,
        employment_type_id: int,
        experience_level_id: int,
    ):
        # -------------------------
        # Department
        # -------------------------
        department = self.department_repository.get_by_id(
            db=db,
            department_id=department_id,
            company_id=company_id,
        )
        if not department:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Department does not belong to your company",
            )
        # -------------------------
        # Designation
        # -------------------------
        designation = self.designation_repository.get_by_id(
            db=db,
            designation_id=designation_id,
            company_id=company_id,
        )
        if not designation:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Designation does not belong to your company",
            )
        # -------------------------
        # Job Category
        # -------------------------
        job_category = self.job_category_repository.get_by_id(
            db=db,
            job_category_id=job_category_id,
            company_id=company_id,
        )
        if not job_category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Job Category does not belong to your company",
            )
        # -------------------------
        # Employment Type
        # -------------------------
        employment_type = self.employment_type_repository.get_by_id(
            db=db,
            employment_type_id=employment_type_id,
            company_id=company_id,
        )
        if not employment_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Employment Type does not belong to your company",
            )
        # -------------------------
        # Experience Level
        # -------------------------
        experience_level = self.experience_level_repository.get_by_id(
            db=db,
            experience_level_id=experience_level_id,
            company_id=company_id,
        )
        if not experience_level:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Experience Level does not belong to your company",
            )

    # -------------------------
    # Validate Status
    # -------------------------
    def validate_status(
        self,
        status_value: str,
    ):
        allowed_statuses = [
            "Open",
            "Closed",
        ]
        if status_value not in allowed_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status must be either 'Open' or 'Closed'",
            )

    # -------------------------
    # Validate Salary
    # -------------------------
    def validate_salary(
        self,
        salary_from,
        salary_to,
    ):
        if (
            salary_from is not None
            and salary_to is not None
            and salary_from > salary_to
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Salary From cannot be greater than Salary To",
            )

    # -------------------------
    # Validate Vacancies
    # -------------------------
    def validate_vacancies(
        self,
        no_of_vacancies: int,
    ):
        if no_of_vacancies <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Number of vacancies must be greater than 0",
            )

    # -------------------------
    # Get All Job Openings
    # -------------------------
    def get_all_job_openings(
        self,
        db: Session,
        current_user: dict,
        search: str = "",
        department_id: int | None = None,
        designation_id: int | None = None,
        status: str | None = "Open",
        sort_by: str = "CreatedOn",
        order: str = "desc",
        page: int = 1,
        page_size: int = 10,
    ):
        self.check_permission(
            current_user,
            "VIEW_JOB_OPENING",
        )
        company_id = self.get_company_id(
            current_user,
        )
        return self.repository.get_all(
            db=db,
            company_id=company_id,
            search=search,
            department_id=department_id,
            designation_id=designation_id,
            status=status,
            sort_by=sort_by,
            order=order,
            page=page,
            page_size=page_size,
        )

    # -------------------------
    # Get Job Opening By ID
    # -------------------------
    def get_job_opening_by_id(
        self,
        db: Session,
        job_opening_id: int,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "VIEW_JOB_OPENING",
        )
        company_id = self.get_company_id(
            current_user,
        )
        job_opening = self.repository.get_by_id(
            db=db,
            job_opening_id=job_opening_id,
            company_id=company_id,
        )
        if not job_opening:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job Opening not found",
            )
        return job_opening

    # -------------------------
    # Create Job Opening
    # -------------------------
    def create_job_opening(
        self,
        db: Session,
        job_opening: JobOpeningCreate,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "CREATE_JOB_OPENING",
        )
        # Company comes ONLY from logged-in user
        company_id = self.get_company_id(
            current_user,
        )
        # -------------------------
        # Validate Status
        # -------------------------
        self.validate_status(
            job_opening.Status,
        )
        # -------------------------
        # Validate Vacancies
        # -------------------------
        self.validate_vacancies(
            job_opening.NoOfVacancies,
        )
        # -------------------------
        # Validate Salary
        # -------------------------
        self.validate_salary(
            job_opening.SalaryFrom,
            job_opening.SalaryTo,
        )
        # -------------------------
        # Check Duplicate Job Title
        # -------------------------
        existing = self.repository.get_by_title(
            db=db,
            job_title=job_opening.JobTitle,
            company_id=company_id,
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Job Opening with this title already exists in your company",
            )
        # -------------------------
        # Validate Master Data
        # -------------------------
        self.validate_master_data(
            db=db,
            company_id=company_id,
            department_id=job_opening.DepartmentId,
            designation_id=job_opening.DesignationId,
            job_category_id=job_opening.JobCategoryId,
            employment_type_id=job_opening.EmploymentTypeId,
            experience_level_id=job_opening.ExperienceLevelId,
        )
        # -------------------------
        # Create
        # -------------------------
        return self.repository.create(
            db=db,
            job_opening=job_opening,
            company_id=company_id,
            current_user=current_user,
        )

    # -------------------------
    # Update Job Opening
    # -------------------------
    def update_job_opening(
        self,
        db: Session,
        job_opening_id: int,
        job_opening: JobOpeningUpdate,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "UPDATE_JOB_OPENING",
        )
        # Company comes ONLY from logged-in user
        company_id = self.get_company_id(
            current_user,
        )
        # -------------------------
        # Find Existing Job Opening
        # -------------------------
        existing = self.repository.get_by_id(
            db=db,
            job_opening_id=job_opening_id,
            company_id=company_id,
        )
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job Opening not found",
            )
        # -------------------------
        # Validate Status
        # -------------------------
        self.validate_status(
            job_opening.Status,
        )
        # -------------------------
        # Validate Vacancies
        # -------------------------
        self.validate_vacancies(
            job_opening.NoOfVacancies,
        )
        # -------------------------
        # Validate Salary
        # -------------------------
        self.validate_salary(
            job_opening.SalaryFrom,
            job_opening.SalaryTo,
        )
        # -------------------------
        # Check Duplicate Job Title
        # -------------------------
        duplicate = self.repository.get_by_title(
            db=db,
            job_title=job_opening.JobTitle,
            company_id=company_id,
        )
        if duplicate and duplicate.JobOpeningId != job_opening_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Job Opening with this title already exists in your company",
            )
        # -------------------------
        # Validate Master Data
        # -------------------------
        self.validate_master_data(
            db=db,
            company_id=company_id,
            department_id=job_opening.DepartmentId,
            designation_id=job_opening.DesignationId,
            job_category_id=job_opening.JobCategoryId,
            employment_type_id=job_opening.EmploymentTypeId,
            experience_level_id=job_opening.ExperienceLevelId,
        )
        # -------------------------
        # Update
        # -------------------------
        return self.repository.update(
            db=db,
            job_opening_id=job_opening_id,
            job_opening=job_opening,
            current_user=current_user,
        )

    # -------------------------
    # Delete Job Opening
    # -------------------------
    def delete_job_opening(
        self,
        db: Session,
        job_opening_id: int,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "DELETE_JOB_OPENING",
        )
        company_id = self.get_company_id(
            current_user,
        )
        # -------------------------
        # Check Existing Job Opening
        # -------------------------
        existing = self.repository.get_by_id(
            db=db,
            job_opening_id=job_opening_id,
            company_id=company_id,
        )
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job Opening not found",
            )
        # -------------------------
        # Delete
        # -------------------------
        self.repository.delete(
            db=db,
            job_opening_id=job_opening_id,
            company_id=company_id,
        )
        return {"message": "Job Opening deleted successfully"}
