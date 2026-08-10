from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.department import Department
from app.repositories.designation_repository import DesignationRepository
from app.schemas.designation_schema import (
    DesignationCreate,
    DesignationUpdate,
)


class DesignationService:

    def __init__(self):
        self.repository = DesignationRepository()

    # -------------------------
    # Get All Designations
    # -------------------------
    def get_all_designations(
        self,
        db: Session,
        current_user,
        search: str = "",
        company_id: int = None,
        department_id: int = None,
        sort_by: str = "DesignationName",
        order: str = "asc",
        page: int = 1,
        page_size: int = 10,
    ):

        return self.repository.get_all(
            db,
            current_user,
            search,
            company_id,
            department_id,
            sort_by,
            order,
            page,
            page_size,
        )

    # -------------------------
    # Get Designation By Id
    # -------------------------
    def get_designation_by_id(
        self,
        db: Session,
        designation_id: int,
        current_user,
    ):

        designation = self.repository.get_by_id(
            db,
            designation_id,
        )

        if not designation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Designation not found",
            )

        # Company users can access only their own company
        if (
            not current_user["is_super_admin"]
            and designation.CompanyId != current_user["company_id"]
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to access this designation",
            )

        return designation

    # -------------------------
    # Create Designation
    # -------------------------
    def create_designation(
        self,
        db: Session,
        designation: DesignationCreate,
        current_user,
    ):

        # Company users can create only in their own company
        if not current_user["is_super_admin"]:
            designation.CompanyId = current_user["company_id"]

        # Check Department Exists
        department = (
            db.query(Department)
            .filter(Department.DepartmentId == designation.DepartmentId)
            .first()
        )

        if not department:
            raise HTTPException(
                status_code=400,
                detail="Department not found",
            )

        # Check Department belongs to Company
        if department.CompanyId != designation.CompanyId:
            raise HTTPException(
                status_code=400,
                detail="Selected Department does not belong to the selected company",
            )

        # Duplicate Code
        existing_code = self.repository.get_by_code(
            db,
            designation.DesignationCode,
            designation.CompanyId,
        )

        if existing_code:
            raise HTTPException(
                status_code=400,
                detail="Designation Code already exists in this company",
            )

        # Duplicate Name
        existing_name = self.repository.get_by_name(
            db,
            designation.DesignationName,
            designation.CompanyId,
        )

        if existing_name:
            raise HTTPException(
                status_code=400,
                detail="Designation Name already exists in this company",
            )

        return self.repository.create(
            db,
            designation,
        )

    # -------------------------
    # Update Designation
    # -------------------------
    def update_designation(
        self,
        db: Session,
        designation_id: int,
        designation: DesignationUpdate,
        current_user,
    ):

        existing_designation = self.repository.get_by_id(
            db,
            designation_id,
        )

        if not existing_designation:
            raise HTTPException(
                status_code=404,
                detail="Designation not found",
            )

        # Company users can update only their own company
        if (
            not current_user["is_super_admin"]
            and existing_designation.CompanyId != current_user["company_id"]
        ):
            raise HTTPException(
                status_code=403,
                detail="You are not authorized to update this designation",
            )

        if not current_user["is_super_admin"]:
            designation.CompanyId = current_user["company_id"]

        # Check Department Exists
        department = (
            db.query(Department)
            .filter(Department.DepartmentId == designation.DepartmentId)
            .first()
        )

        if not department:
            raise HTTPException(
                status_code=400,
                detail="Department not found",
            )

        # Check Department belongs to Company
        if department.CompanyId != designation.CompanyId:
            raise HTTPException(
                status_code=400,
                detail="Selected Department does not belong to the selected company",
            )

        # Duplicate Code
        duplicate_code = self.repository.get_by_code(
            db,
            designation.DesignationCode,
            designation.CompanyId,
        )

        if duplicate_code and duplicate_code.DesignationId != designation_id:
            raise HTTPException(
                status_code=400,
                detail="Designation Code already exists in this company",
            )

        # Duplicate Name
        duplicate_name = self.repository.get_by_name(
            db,
            designation.DesignationName,
            designation.CompanyId,
        )

        if duplicate_name and duplicate_name.DesignationId != designation_id:
            raise HTTPException(
                status_code=400,
                detail="Designation Name already exists in this company",
            )

        return self.repository.update(
            db,
            designation_id,
            designation,
        )

    # -------------------------
    # Delete Designation
    # -------------------------
    def delete_designation(
        self,
        db: Session,
        designation_id: int,
        current_user,
    ):

        designation = self.repository.get_by_id(
            db,
            designation_id,
        )

        if not designation:
            raise HTTPException(
                status_code=404,
                detail="Designation not found",
            )

        # Company users can delete only their own company
        if (
            not current_user["is_super_admin"]
            and designation.CompanyId != current_user["company_id"]
        ):
            raise HTTPException(
                status_code=403,
                detail="You are not authorized to delete this designation",
            )

        self.repository.delete(
            db,
            designation_id,
        )

        return {"message": "Designation deleted successfully"}
