from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.department_repository import DepartmentRepository
from app.schemas.department_schema import (
    DepartmentCreate,
    DepartmentUpdate,
)


class DepartmentService:

    def __init__(self):
        self.repository = DepartmentRepository()

    # ==================================================
    # GET ALL DEPARTMENTS
    # ==================================================
    def get_all_departments(
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
        return self.repository.get_all(
            db=db,
            current_user=current_user,
            search=search,
            company_id=company_id,
            sort_by=sort_by,
            order=order,
            page=page,
            page_size=page_size,
        )

    # ==================================================
    # GET DEPARTMENT BY ID
    # ==================================================
    def get_department_by_id(
        self,
        db: Session,
        department_id: int,
        current_user: dict,
    ):
        # ==================================================
        # GET DEPARTMENT
        # ==================================================
        department = self.repository.get_by_id(
            db=db,
            department_id=department_id,
        )

        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found",
            )

        # ==================================================
        # COMPANY ACCESS CHECK
        # ==================================================
        if (
            not current_user["is_super_admin"]
            and department.CompanyId != current_user["company_id"]
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to access this department",
            )

        return department

    # ==================================================
    # CREATE DEPARTMENT
    # ==================================================
    def create_department(
        self,
        db: Session,
        department: DepartmentCreate,
        current_user: dict,
    ):
        # ==================================================
        # COMPANY
        # ==================================================
        if not current_user["is_super_admin"]:
            department.CompanyId = current_user["company_id"]

        # ==================================================
        # COMPANY VALIDATION
        # ==================================================
        if not department.CompanyId:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company is required",
            )

        # ==================================================
        # DUPLICATE DEPARTMENT CODE
        # ==================================================
        existing_code = self.repository.get_by_code(
            db=db,
            department_code=department.DepartmentCode,
            company_id=department.CompanyId,
        )

        if existing_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Department Code already exists in this company",
            )

        # ==================================================
        # DUPLICATE DEPARTMENT NAME
        # ==================================================
        existing_name = self.repository.get_by_name(
            db=db,
            department_name=department.DepartmentName,
            company_id=department.CompanyId,
        )

        if existing_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Department Name already exists in this company",
            )

        # ==================================================
        # CREATE
        # ==================================================
        return self.repository.create(
            db=db,
            department=department,
        )

    # ==================================================
    # UPDATE DEPARTMENT
    # ==================================================
    def update_department(
        self,
        db: Session,
        department_id: int,
        department: DepartmentUpdate,
        current_user: dict,
    ):
        # ==================================================
        # GET EXISTING DEPARTMENT
        # ==================================================
        existing_department = self.repository.get_by_id(
            db=db,
            department_id=department_id,
        )

        if not existing_department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found",
            )

        # ==================================================
        # COMPANY ACCESS CHECK
        # ==================================================
        if (
            not current_user["is_super_admin"]
            and existing_department.CompanyId != current_user["company_id"]
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to update this department",
            )

        # ==================================================
        # COMPANY
        # ==================================================
        if not current_user["is_super_admin"]:
            department.CompanyId = current_user["company_id"]

        if not department.CompanyId:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Company is required",
            )

        # ==================================================
        # DUPLICATE DEPARTMENT CODE
        # ==================================================
        duplicate_code = self.repository.get_by_code(
            db=db,
            department_code=department.DepartmentCode,
            company_id=department.CompanyId,
        )

        if duplicate_code and duplicate_code.DepartmentId != department_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Department Code already exists in this company",
            )

        # ==================================================
        # DUPLICATE DEPARTMENT NAME
        # ==================================================
        duplicate_name = self.repository.get_by_name(
            db=db,
            department_name=department.DepartmentName,
            company_id=department.CompanyId,
        )

        if duplicate_name and duplicate_name.DepartmentId != department_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Department Name already exists in this company",
            )

        # ==================================================
        # UPDATE
        # ==================================================
        updated_department = self.repository.update(
            db=db,
            department_id=department_id,
            department=department,
        )

        if not updated_department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found",
            )

        return updated_department

    # ==================================================
    # DELETE DEPARTMENT
    # ==================================================
    def delete_department(
        self,
        db: Session,
        department_id: int,
        current_user: dict,
    ):
        # ==================================================
        # GET DEPARTMENT
        # ==================================================
        department = self.repository.get_by_id(
            db=db,
            department_id=department_id,
        )

        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found",
            )

        # ==================================================
        # COMPANY ACCESS CHECK
        # ==================================================
        if (
            not current_user["is_super_admin"]
            and department.CompanyId != current_user["company_id"]
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to delete this department",
            )

        # ==================================================
        # DELETE
        # ==================================================
        deleted_department = self.repository.delete(
            db=db,
            department_id=department_id,
        )

        if not deleted_department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Department not found",
            )

        return {"message": "Department deleted successfully"}
