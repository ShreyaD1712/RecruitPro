from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload
from datetime import datetime

from app.models.designation import Designation
from app.models.company import Company
from app.models.department import Department
from app.schemas.designation_schema import (
    DesignationCreate,
    DesignationUpdate,
)


class DesignationRepository:

    # -------------------------
    # Get All Designations
    # -------------------------
    def get_all(
        self,
        db: Session,
        current_user: dict,
        search: str = "",
        company_id: int = None,
        department_id: int = None,
        sort_by: str = "DesignationName",
        order: str = "asc",
        page: int = 1,
        page_size: int = 10,
    ):

        query = db.query(Designation).options(
            joinedload(Designation.company),
            joinedload(Designation.department),
        )

        # -------------------------
        # Company Filter
        # -------------------------
        if current_user["is_super_admin"]:
            if company_id:
                query = query.filter(Designation.CompanyId == company_id)
        else:
            query = query.filter(Designation.CompanyId == current_user["company_id"])

        # -------------------------
        # Department Filter
        # -------------------------
        if department_id:
            query = query.filter(Designation.DepartmentId == department_id)

        # -------------------------
        # Search
        # -------------------------
        if search:
            query = query.filter(
                or_(
                    Designation.DesignationCode.ilike(f"%{search}%"),
                    Designation.DesignationName.ilike(f"%{search}%"),
                )
            )

        # -------------------------
        # Sorting
        # -------------------------
        if sort_by == "CompanyName":
            query = query.join(Company)
            column = Company.CompanyName

        elif sort_by == "DepartmentName":
            query = query.join(Department)
            column = Department.DepartmentName

        else:
            column = getattr(
                Designation,
                sort_by,
                Designation.DesignationName,
            )

        if order.lower() == "desc":
            query = query.order_by(column.desc())
        else:
            query = query.order_by(column.asc())

        total_records = query.count()

        designations = query.offset((page - 1) * page_size).limit(page_size).all()

        return {
            "total_records": total_records,
            "page": page,
            "page_size": page_size,
            "data": designations,
        }

    # -------------------------
    # Get By Id
    # -------------------------
    def get_by_id(
        self,
        db: Session,
        designation_id: int,
    ):
        return (
            db.query(Designation)
            .options(
                joinedload(Designation.company),
                joinedload(Designation.department),
            )
            .filter(Designation.DesignationId == designation_id)
            .first()
        )

    # -------------------------
    # Get By Code
    # -------------------------
    def get_by_code(
        self,
        db: Session,
        designation_code: str,
        company_id: int,
    ):
        return (
            db.query(Designation)
            .filter(
                Designation.DesignationCode == designation_code,
                Designation.CompanyId == company_id,
            )
            .first()
        )

    # -------------------------
    # Get By Name
    # -------------------------
    def get_by_name(
        self,
        db: Session,
        designation_name: str,
        company_id: int,
    ):
        return (
            db.query(Designation)
            .filter(
                Designation.DesignationName == designation_name,
                Designation.CompanyId == company_id,
            )
            .first()
        )

    # -------------------------
    # Create
    # -------------------------
    def create(
        self,
        db: Session,
        designation: DesignationCreate,
    ):

        new_designation = Designation(
            DesignationCode=designation.DesignationCode,
            DesignationName=designation.DesignationName,
            CompanyId=designation.CompanyId,
            DepartmentId=designation.DepartmentId,
            Description=designation.Description,
            IsActive=designation.IsActive,
            CreatedOn=datetime.now(),
            CreatedBy=1,
            UpdatedOn=datetime.now(),
            UpdatedBy=1,
        )

        db.add(new_designation)
        db.commit()
        db.refresh(new_designation)

        return (
            db.query(Designation)
            .options(
                joinedload(Designation.company),
                joinedload(Designation.department),
            )
            .filter(Designation.DesignationId == new_designation.DesignationId)
            .first()
        )

    # -------------------------
    # Update
    # -------------------------
    def update(
        self,
        db: Session,
        designation_id: int,
        designation: DesignationUpdate,
    ):

        existing_designation = (
            db.query(Designation)
            .filter(Designation.DesignationId == designation_id)
            .first()
        )

        if not existing_designation:
            return None

        existing_designation.DesignationCode = designation.DesignationCode
        existing_designation.DesignationName = designation.DesignationName
        existing_designation.CompanyId = designation.CompanyId
        existing_designation.DepartmentId = designation.DepartmentId
        existing_designation.Description = designation.Description
        existing_designation.IsActive = designation.IsActive
        existing_designation.UpdatedOn = datetime.now()
        existing_designation.UpdatedBy = 1

        db.commit()
        db.refresh(existing_designation)

        return (
            db.query(Designation)
            .options(
                joinedload(Designation.company),
                joinedload(Designation.department),
            )
            .filter(Designation.DesignationId == designation_id)
            .first()
        )

    # -------------------------
    # Delete
    # -------------------------
    def delete(
        self,
        db: Session,
        designation_id: int,
    ):

        designation = (
            db.query(Designation)
            .filter(Designation.DesignationId == designation_id)
            .first()
        )

        if not designation:
            return None

        db.delete(designation)
        db.commit()

        return designation
