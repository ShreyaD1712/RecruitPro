from datetime import datetime
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload
from app.models.job_opening import JobOpening
from app.schemas.job_opening_schema import (
    JobOpeningCreate,
    JobOpeningUpdate,
)


class JobOpeningRepository:
    # -------------------------
    # Get All Open Job Openings
    # -------------------------
    def get_all(
        self,
        db: Session,
        company_id: int,
        search: str = "",
        department_id: int | None = None,
        designation_id: int | None = None,
        status: str | None = "Open",
        sort_by: str = "CreatedOn",
        order: str = "desc",
        page: int = 1,
        page_size: int = 10,
    ):
        query = db.query(JobOpening).options(
            joinedload(JobOpening.company),
            joinedload(JobOpening.department),
            joinedload(JobOpening.designation),
            joinedload(JobOpening.job_category),
            joinedload(JobOpening.employment_type),
            joinedload(JobOpening.experience_level),
        )
        # -------------------------
        # Company Filter
        # -------------------------
        # Only job openings belonging
        # to the logged-in user's company.
        query = query.filter(JobOpening.CompanyId == company_id)
        # -------------------------
        # Status Filter
        # -------------------------
        if status and status.lower() != "all":
            query = query.filter(JobOpening.Status == status)

        # -------------------------
        # Department Filter
        # -------------------------
        if department_id is not None:
            query = query.filter(JobOpening.DepartmentId == department_id)
        # -------------------------
        # Designation Filter
        # -------------------------
        if designation_id is not None:
            query = query.filter(JobOpening.DesignationId == designation_id)
        # -------------------------
        # Search
        # -------------------------
        if search:
            query = query.filter(
                or_(
                    JobOpening.JobTitle.ilike(f"%{search}%"),
                    JobOpening.JobDescription.ilike(f"%{search}%"),
                    JobOpening.Location.ilike(f"%{search}%"),
                )
            )
        # -------------------------
        # Sorting
        # -------------------------
        allowed_sort_columns = {
            "JobTitle": JobOpening.JobTitle,
            "Location": JobOpening.Location,
            "NoOfVacancies": JobOpening.NoOfVacancies,
            "SalaryFrom": JobOpening.SalaryFrom,
            "SalaryTo": JobOpening.SalaryTo,
            "CreatedOn": JobOpening.CreatedOn,
        }
        column = allowed_sort_columns.get(
            sort_by,
            JobOpening.CreatedOn,
        )
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
        job_opening_id: int,
        company_id: int,
    ):
        return (
            db.query(JobOpening)
            .options(
                joinedload(JobOpening.company),
                joinedload(JobOpening.department),
                joinedload(JobOpening.designation),
                joinedload(JobOpening.job_category),
                joinedload(JobOpening.employment_type),
                joinedload(JobOpening.experience_level),
            )
            .filter(
                JobOpening.JobOpeningId == job_opening_id,
                JobOpening.CompanyId == company_id,
            )
            .first()
        )

    # -------------------------
    # Get By Job Title
    # -------------------------
    def get_by_title(
        self,
        db: Session,
        job_title: str,
        company_id: int,
    ):
        return (
            db.query(JobOpening)
            .filter(
                JobOpening.JobTitle == job_title,
                JobOpening.CompanyId == company_id,
            )
            .first()
        )

    # -------------------------
    # Create
    # -------------------------
    def create(
        self,
        db: Session,
        job_opening: JobOpeningCreate,
        company_id: int,
        current_user: dict,
    ):
        now = datetime.now()
        new_job_opening = JobOpening(
            # -------------------------
            # Company
            # -------------------------
            # CompanyId NEVER comes
            # from Angular/request body.
            # It comes from logged-in user.
            CompanyId=company_id,
            # -------------------------
            # Master Data
            # -------------------------
            DepartmentId=job_opening.DepartmentId,
            DesignationId=job_opening.DesignationId,
            JobCategoryId=job_opening.JobCategoryId,
            EmploymentTypeId=job_opening.EmploymentTypeId,
            ExperienceLevelId=job_opening.ExperienceLevelId,
            # -------------------------
            # Job Details
            # -------------------------
            JobTitle=job_opening.JobTitle,
            JobDescription=job_opening.JobDescription,
            Location=job_opening.Location,
            NoOfVacancies=job_opening.NoOfVacancies,
            # -------------------------
            # Salary
            # -------------------------
            SalaryFrom=job_opening.SalaryFrom,
            SalaryTo=job_opening.SalaryTo,
            # -------------------------
            # Status
            # -------------------------
            Status=job_opening.Status,
            # -------------------------
            # Audit
            # -------------------------
            CreatedOn=now,
            CreatedBy=current_user["user_id"],
            UpdatedOn=now,
            UpdatedBy=current_user["user_id"],
        )
        db.add(new_job_opening)
        db.commit()
        db.refresh(new_job_opening)
        return new_job_opening

    # -------------------------
    # Update
    # -------------------------
    def update(
        self,
        db: Session,
        job_opening_id: int,
        job_opening: JobOpeningUpdate,
        current_user: dict,
    ):
        existing_job_opening = self.get_by_id(
            db=db,
            job_opening_id=job_opening_id,
            company_id=current_user["company_id"],
        )
        if not existing_job_opening:
            return None
        # -------------------------
        # CompanyId is NEVER changed
        # -------------------------
        existing_job_opening.DepartmentId = job_opening.DepartmentId
        existing_job_opening.DesignationId = job_opening.DesignationId
        existing_job_opening.JobCategoryId = job_opening.JobCategoryId
        existing_job_opening.EmploymentTypeId = job_opening.EmploymentTypeId
        existing_job_opening.ExperienceLevelId = job_opening.ExperienceLevelId
        existing_job_opening.JobTitle = job_opening.JobTitle
        existing_job_opening.JobDescription = job_opening.JobDescription
        existing_job_opening.Location = job_opening.Location
        existing_job_opening.NoOfVacancies = job_opening.NoOfVacancies
        existing_job_opening.SalaryFrom = job_opening.SalaryFrom
        existing_job_opening.SalaryTo = job_opening.SalaryTo
        existing_job_opening.Status = job_opening.Status
        # -------------------------
        # Audit
        # -------------------------
        existing_job_opening.UpdatedOn = datetime.now()
        existing_job_opening.UpdatedBy = current_user["user_id"]
        db.commit()
        db.refresh(existing_job_opening)
        return existing_job_opening

    # -------------------------
    # Delete
    # -------------------------
    def delete(
        self,
        db: Session,
        job_opening_id: int,
        company_id: int,
    ):
        job_opening = self.get_by_id(
            db=db,
            job_opening_id=job_opening_id,
            company_id=company_id,
        )
        if not job_opening:
            return None
        db.delete(job_opening)
        db.commit()
        return job_opening
