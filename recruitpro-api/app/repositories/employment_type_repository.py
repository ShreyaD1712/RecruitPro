from datetime import datetime

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.employment_type import EmploymentType
from app.schemas.employment_type_schema import (
    EmploymentTypeCreate,
    EmploymentTypeUpdate,
)


class EmploymentTypeRepository:

    # -------------------------
    # Get All Employment Types
    # -------------------------
    def get_all(
        self,
        db: Session,
        company_id: int,
        search: str = "",
        sort_by: str = "EmploymentTypeName",
        order: str = "asc",
        page: int = 1,
        page_size: int = 10,
    ):

        query = db.query(EmploymentType)

        # -------------------------
        # Company Filter
        # -------------------------
        query = query.filter(EmploymentType.CompanyId == company_id)

        # -------------------------
        # Search
        # -------------------------
        if search:
            query = query.filter(
                or_(
                    EmploymentType.EmploymentTypeName.ilike(f"%{search}%"),
                    EmploymentType.Description.ilike(f"%{search}%"),
                )
            )

        # -------------------------
        # Sorting
        # -------------------------
        column = getattr(
            EmploymentType,
            sort_by,
            EmploymentType.EmploymentTypeName,
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
        employment_types = query.offset((page - 1) * page_size).limit(page_size).all()

        return {
            "total_records": total_records,
            "page": page,
            "page_size": page_size,
            "data": employment_types,
        }

    # -------------------------
    # Get Employment Type By Id
    # -------------------------
    def get_by_id(
        self,
        db: Session,
        employment_type_id: int,
    ):

        return (
            db.query(EmploymentType)
            .filter(EmploymentType.EmploymentTypeId == employment_type_id)
            .first()
        )

    # -------------------------
    # Get Employment Type By Name
    # -------------------------
    def get_by_name(
        self,
        db: Session,
        employment_type_name: str,
        company_id: int,
    ):

        return (
            db.query(EmploymentType)
            .filter(
                EmploymentType.EmploymentTypeName == employment_type_name,
                EmploymentType.CompanyId == company_id,
            )
            .first()
        )

    # -------------------------
    # Create Employment Type
    # -------------------------
    def create(
        self,
        db: Session,
        employment_type: EmploymentTypeCreate,
        company_id: int,
        current_user: dict,
    ):

        new_employment_type = EmploymentType(
            EmploymentTypeName=employment_type.EmploymentTypeName,
            CompanyId=company_id,
            Description=employment_type.Description,
            IsActive=employment_type.IsActive,
            CreatedOn=datetime.now(),
            CreatedBy=current_user["user_id"],
            UpdatedOn=datetime.now(),
            UpdatedBy=current_user["user_id"],
        )

        db.add(new_employment_type)

        db.commit()

        db.refresh(new_employment_type)

        return new_employment_type

    # -------------------------
    # Update Employment Type
    # -------------------------
    def update(
        self,
        db: Session,
        employment_type_id: int,
        employment_type: EmploymentTypeUpdate,
        current_user: dict,
    ):

        existing_employment_type = self.get_by_id(
            db,
            employment_type_id,
        )

        if not existing_employment_type:
            return None

        # CompanyId is NOT changed

        existing_employment_type.EmploymentTypeName = employment_type.EmploymentTypeName

        existing_employment_type.Description = employment_type.Description

        existing_employment_type.IsActive = employment_type.IsActive

        existing_employment_type.UpdatedOn = datetime.now()

        existing_employment_type.UpdatedBy = current_user["user_id"]

        db.commit()

        db.refresh(existing_employment_type)

        return existing_employment_type

    # -------------------------
    # Delete Employment Type
    # -------------------------
    def delete(
        self,
        db: Session,
        employment_type_id: int,
    ):

        employment_type = self.get_by_id(
            db,
            employment_type_id,
        )

        if not employment_type:
            return None

        db.delete(employment_type)

        db.commit()

        return employment_type
