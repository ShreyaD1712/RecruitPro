from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.job_category_repository import JobCategoryRepository

from app.schemas.job_category_schema import (
    JobCategoryCreate,
    JobCategoryUpdate,
)


class JobCategoryService:

    def __init__(self):

        self.repository = JobCategoryRepository()

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
                detail=("You do not have permission " "to perform this action"),
            )

    # -------------------------
    # Get All Job Categories
    # -------------------------

    def get_all_job_categories(
        self,
        db: Session,
        current_user: dict,
        search: str = "",
        sort_by: str = "CategoryName",
        order: str = "asc",
        page: int = 1,
        page_size: int = 10,
    ):

        self.check_permission(current_user, "VIEW_JOB_CATEGORY")

        company_id = current_user.get("company_id")

        if not company_id:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=("Company information not found " "for the current user"),
            )

        return self.repository.get_all(
            db=db,
            company_id=company_id,
            search=search,
            sort_by=sort_by,
            order=order,
            page=page,
            page_size=page_size,
        )

    # -------------------------
    # Get By ID
    # -------------------------

    def get_job_category_by_id(
        self,
        db: Session,
        job_category_id: int,
        current_user: dict,
    ):

        self.check_permission(current_user, "VIEW_JOB_CATEGORY")

        company_id = current_user.get("company_id")

        if not company_id:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=("Company information not found " "for the current user"),
            )

        job_category = self.repository.get_by_id(
            db=db,
            job_category_id=job_category_id,
            company_id=company_id,
        )

        if not job_category:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job Category not found",
            )

        return job_category

    # -------------------------
    # Create
    # -------------------------

    def create_job_category(
        self,
        db: Session,
        job_category: JobCategoryCreate,
        current_user: dict,
    ):

        self.check_permission(current_user, "CREATE_JOB_CATEGORY")

        company_id = current_user.get("company_id")

        if not company_id:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=("Company information not found " "for the current user"),
            )

        # Check duplicate name
        existing = self.repository.get_by_name(
            db=db,
            category_name=job_category.CategoryName,
            company_id=company_id,
        )

        if existing:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=("Job Category already exists " "in your company"),
            )

        return self.repository.create(
            db=db,
            job_category=job_category,
            company_id=company_id,
            current_user=current_user,
        )

    # -------------------------
    # Update
    # -------------------------

    def update_job_category(
        self,
        db: Session,
        job_category_id: int,
        job_category: JobCategoryUpdate,
        current_user: dict,
    ):

        self.check_permission(current_user, "UPDATE_JOB_CATEGORY")

        company_id = current_user.get("company_id")

        if not company_id:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=("Company information not found " "for the current user"),
            )

        existing = self.repository.get_by_id(
            db=db,
            job_category_id=job_category_id,
            company_id=company_id,
        )

        if not existing:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job Category not found",
            )

        # Check duplicate name
        duplicate = self.repository.get_by_name(
            db=db,
            category_name=job_category.CategoryName,
            company_id=company_id,
        )

        if duplicate and duplicate.JobCategoryId != job_category_id:

            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=("Job Category already exists " "in your company"),
            )

        return self.repository.update(
            db=db,
            job_category_id=job_category_id,
            job_category=job_category,
            current_user=current_user,
        )

    # -------------------------
    # Delete
    # -------------------------

    def delete_job_category(
        self,
        db: Session,
        job_category_id: int,
        current_user: dict,
    ):

        self.check_permission(current_user, "DELETE_JOB_CATEGORY")

        company_id = current_user.get("company_id")

        if not company_id:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=("Company information not found " "for the current user"),
            )

        existing = self.repository.get_by_id(
            db=db,
            job_category_id=job_category_id,
            company_id=company_id,
        )

        if not existing:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Job Category not found",
            )

        self.repository.delete(
            db=db,
            job_category_id=job_category_id,
            company_id=company_id,
        )

        return {"message": "Job Category deleted successfully"}
