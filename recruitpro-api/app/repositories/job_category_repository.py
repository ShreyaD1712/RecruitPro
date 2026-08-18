from datetime import datetime

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.job_category import JobCategory
from app.schemas.job_category_schema import (
    JobCategoryCreate,
    JobCategoryUpdate,
)


class JobCategoryRepository:

    # -------------------------
    # Get All Job Categories
    # -------------------------
    def get_all(
        self,
        db: Session,
        company_id: int,
        search: str = "",
        sort_by: str = "CategoryName",
        order: str = "asc",
        page: int = 1,
        page_size: int = 10,
    ):

        query = db.query(JobCategory)

        # -------------------------
        # Company Filter
        # -------------------------

        query = query.filter(JobCategory.CompanyId == company_id)

        # -------------------------
        # Search
        # -------------------------

        if search:

            query = query.filter
            (
                JobCategory.CategoryName.ilike(f"%{search}%"),
                JobCategory.Description.ilike(f"%{search}%"),
            )

        # -------------------------
        # Sorting
        # -------------------------

        column = getattr(JobCategory, sort_by, JobCategory.CategoryName)

        if order.lower() == "desc":

            query = query.order_by(column.desc())

        else:

            query = query.order_by(column.asc())

        # -------------------------
        # Total Records
        # -------------------------

        total_records = query.count()

        # -------------------------
        # Pagination
        # -------------------------

        data = query.offset((page - 1) * page_size).limit(page_size).all()

        return {
            "total_records": total_records,
            "page": page,
            "page_size": page_size,
            "data": data,
        }

    # -------------------------
    # Get By ID
    # -------------------------

    def get_by_id(
        self,
        db: Session,
        job_category_id: int,
        company_id: int,
    ):

        return (
            db.query(JobCategory)
            .filter(
                JobCategory.JobCategoryId == job_category_id,
                JobCategory.CompanyId == company_id,
            )
            .first()
        )

    # -------------------------
    # Get By Name
    # -------------------------

    def get_by_name(
        self,
        db: Session,
        category_name: str,
        company_id: int,
    ):

        return (
            db.query(JobCategory)
            .filter(
                JobCategory.CategoryName == category_name,
                JobCategory.CompanyId == company_id,
            )
            .first()
        )

    # -------------------------
    # Create
    # -------------------------

    def create(
        self,
        db: Session,
        job_category: JobCategoryCreate,
        company_id: int,
        current_user: dict,
    ):

        new_job_category = JobCategory(
            CategoryName=job_category.CategoryName,
            CompanyId=company_id,
            Description=job_category.Description,
            IsActive=job_category.IsActive,
            CreatedOn=datetime.now(),
            CreatedBy=current_user["user_id"],
            UpdatedOn=datetime.now(),
            UpdatedBy=current_user["user_id"],
        )

        db.add(new_job_category)

        db.commit()

        db.refresh(new_job_category)

        return new_job_category

    # -------------------------
    # Update
    # -------------------------

    def update(
        self,
        db: Session,
        job_category_id: int,
        job_category: JobCategoryUpdate,
        current_user: dict,
    ):

        existing_job_category = self.get_by_id(
            db=db,
            job_category_id=job_category_id,
            company_id=current_user["company_id"],
        )

        if not existing_job_category:
            return None

        # CompanyId is NEVER changed

        existing_job_category.CategoryName = job_category.CategoryName

        existing_job_category.Description = job_category.Description

        existing_job_category.IsActive = job_category.IsActive

        existing_job_category.UpdatedOn = datetime.now()

        existing_job_category.UpdatedBy = current_user["user_id"]

        db.commit()

        db.refresh(existing_job_category)

        return existing_job_category

    # -------------------------
    # Delete
    # -------------------------

    def delete(
        self,
        db: Session,
        job_category_id: int,
        company_id: int,
    ):

        job_category = self.get_by_id(
            db=db,
            job_category_id=job_category_id,
            company_id=company_id,
        )

        if not job_category:
            return None

        db.delete(job_category)

        db.commit()

        return job_category
