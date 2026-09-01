from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from app.models.department import Department
from app.models.company import Company
from app.schemas.department_schema import (
    DepartmentCreate,
    DepartmentUpdate,
)


class DepartmentRepository:
    # ==================================================
    # GET ALL DEPARTMENTS
    # ==================================================
    def get_all(
        self,
        db: Session,
        current_user: dict,
        search: str = "",
        company_id: int | None = None,
        sort_by: str = "DepartmentName",
        order: str = "asc",
        page: int = 1,
        page_size: int = 10,
    ):
        query = db.query(Department).options(joinedload(Department.company))
        # ==================================================
        # COMPANY FILTER
        # ==================================================
        if current_user["is_super_admin"]:
            if company_id is not None:
                query = query.filter(Department.CompanyId == company_id)
        else:
            query = query.filter(Department.CompanyId == current_user["company_id"])
        # ==================================================
        # SEARCH
        # ==================================================
        if search:
            search_value = f"%{search}%"
            query = query.filter(
                or_(
                    Department.DepartmentName.ilike(search_value),
                    Department.DepartmentCode.ilike(search_value),
                )
            )
        # ==================================================
        # SORTING
        # ==================================================
        if sort_by == "CompanyName":
            query = query.join(Company)
            column = Company.CompanyName
        else:
            column = getattr(Department, sort_by, Department.DepartmentName)
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
        departments = query.offset((page - 1) * page_size).limit(page_size).all()
        return {
            "total_records": total_records,
            "page": page,
            "page_size": page_size,
            "data": departments,
        }

    # ==================================================
    # GET DEPARTMENT BY ID
    # ==================================================
    def get_by_id(
        self,
        db: Session,
        department_id: int,
        company_id: int | None = None,
    ):
        query = (
            db.query(Department)
            .options(joinedload(Department.company))
            .filter(Department.DepartmentId == department_id)
        )
        if company_id is not None:
            query = query.filter(Department.CompanyId == company_id)
        return query.first()

    # ==================================================
    # GET DEPARTMENT BY CODE
    # ==================================================
    def get_by_code(
        self,
        db: Session,
        department_code: str,
        company_id: int,
    ):
        return (
            db.query(Department)
            .filter(
                Department.DepartmentCode == department_code,
                Department.CompanyId == company_id,
            )
            .first()
        )

    # ==================================================
    # GET DEPARTMENT BY NAME
    # ==================================================
    def get_by_name(
        self,
        db: Session,
        department_name: str,
        company_id: int,
    ):
        return (
            db.query(Department)
            .filter(
                Department.DepartmentName == department_name,
                Department.CompanyId == company_id,
            )
            .first()
        )

    # ==================================================
    # CREATE DEPARTMENT
    # ==================================================
    def create(
        self,
        db: Session,
        department: DepartmentCreate,
    ):
        now = datetime.now()
        new_department = Department(
            DepartmentCode=department.DepartmentCode,
            DepartmentName=department.DepartmentName,
            CompanyId=department.CompanyId,
            Description=department.Description,
            IsActive=department.IsActive,
            CreatedOn=now,
            CreatedBy=1,
            UpdatedOn=now,
            UpdatedBy=1,
        )
        db.add(new_department)
        db.commit()
        db.refresh(new_department)
        return (
            db.query(Department)
            .options(joinedload(Department.company))
            .filter(Department.DepartmentId == new_department.DepartmentId)
            .first()
        )

    # ==================================================
    # UPDATE DEPARTMENT
    # ==================================================
    def update(
        self,
        db: Session,
        department_id: int,
        department: DepartmentUpdate,
    ):
        existing_department = (
            db.query(Department)
            .filter(Department.DepartmentId == department_id)
            .first()
        )
        if not existing_department:
            return None
        existing_department.DepartmentCode = department.DepartmentCode
        existing_department.DepartmentName = department.DepartmentName
        existing_department.CompanyId = department.CompanyId
        existing_department.Description = department.Description
        existing_department.IsActive = department.IsActive
        existing_department.UpdatedOn = datetime.now()
        existing_department.UpdatedBy = 1
        db.commit()
        db.refresh(existing_department)
        return (
            db.query(Department)
            .options(joinedload(Department.company))
            .filter(Department.DepartmentId == department_id)
            .first()
        )

    # ==================================================
    # DELETE DEPARTMENT
    # ==================================================
    def delete(
        self,
        db: Session,
        department_id: int,
    ):
        department = (
            db.query(Department)
            .filter(Department.DepartmentId == department_id)
            .first()
        )
        if not department:
            return None
        db.delete(department)
        db.commit()
        return department
