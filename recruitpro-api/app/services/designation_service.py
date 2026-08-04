from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.department import Department
from app.repositories.designation_repository import DesignationRepository
from app.schemas.designation_schema import (
    DesignationCreate,
    DesignationUpdate
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
        page_size: int = 10
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
            page_size
        )

    # -------------------------
    # Get Designation By Id
    # -------------------------
    def get_designation_by_id(
        self,
        db: Session,
        designation_id: int
    ):

        designation = self.repository.get_by_id(
            db,
            designation_id
        )

        if not designation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Designation not found"
            )

        return designation

    # -------------------------
    # Create Designation
    # -------------------------
    def create_designation(
        self,
        db: Session,
        designation: DesignationCreate,
        current_user
    ):
        # Only Super Admin and Company Admin can create designations
        if current_user["role_id"] not in [1, 2]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to create designations"
            )
        # Company Admin can create only in their own company
        if current_user["role_id"] == 2:
            designation.CompanyId = current_user["company_id"]
            
        #check department exists
        department = ( db.query(Department).filter(Department.DepartmentId == designation.DepartmentId).first())
        if not department:
            raise HTTPException(
                status_code=400,
                detail="Department not found"
            )
        #Check department belongs to company
        if department.CompanyId != designation.CompanyId:
            raise HTTPException(
                status_code=400,
                detail="Selected Department does not belong to the selected company"
            )
        
        # Check duplicate designation code in same company
        existing_code = self.repository.get_by_code(
            db,
            designation.DesignationCode,
            designation.CompanyId
        )

        if existing_code:
            raise HTTPException(
                status_code=400,
                detail="Designation Code already exists in this company"
            )

        # Check duplicate designation name in same company
        existing_name = self.repository.get_by_name(
            db,
            designation.DesignationName,
            designation.CompanyId
        )

        if existing_name:
            raise HTTPException(
                status_code=400,
                detail="Designation Name already exists in this company"
            )

        return self.repository.create(
            db,
            designation
        )

    # -------------------------
    # Update Designation
    # -------------------------
    def update_designation(
        self,
        db: Session,
        designation_id: int,
        designation: DesignationUpdate,
        current_user
    ):
        #Only Super Admin and Company Admin can update designations
        if current_user["role_id"] not in [1, 2]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to update designations"
            )
        existing_designation = self.repository.get_by_id(
            db,
            designation_id
        )
        if (current_user["role_id"] == 2) and (existing_designation.CompanyId != current_user["company_id"]):
            raise HTTPException(
                status_code=403,
                detail="You are not authorized to update this designation"
            )
        if current_user["role_id"] == 2: 
            designation.CompanyId = current_user["company_id"]
        if not existing_designation:
            raise HTTPException(
                status_code=404,
                detail="Designation not found"
            )
            
        department = ( db.query(Department).filter(Department.DepartmentId == designation.DepartmentId).first())
        if not department:
            raise HTTPException(
                status_code=400,
                detail="Department not found"
            )
        if department.CompanyId != designation.CompanyId:
            raise HTTPException(
                status_code=400,
                detail="Selected Department does not belong to the selected company"
            )
        if not department:
            raise HTTPException(
                status_code=400,
                detail="Department not found"
            )

        if department.CompanyId != designation.CompanyId:
            raise HTTPException(
                status_code=400,
                detail="Selected Department does not belong to the selected company"
            )

        # Duplicate Designation Code
        duplicate_code = self.repository.get_by_code(
            db,
            designation.DesignationCode,
            designation.CompanyId
        )

        if (
            duplicate_code
            and duplicate_code.DesignationId != designation_id
        ):
            raise HTTPException(
                status_code=400,
                detail="Designation Code already exists in this company"
            )

        # Duplicate Designation Name
        duplicate_name = self.repository.get_by_name(
            db,
            designation.DesignationName,
            designation.CompanyId
        )

        if (
            duplicate_name
            and duplicate_name.DesignationId != designation_id
        ):
            raise HTTPException(
                status_code=400,
                detail="Designation Name already exists in this company"
            )

        return self.repository.update(
            db,
            designation_id,
            designation
        )

    # -------------------------
    # Delete Designation
    # -------------------------
    def delete_designation(
        self,
        db: Session,
        designation_id: int,
        current_user
    ):
        # Only Super Admin and Company Admin can delete designations
        if current_user["role_id"] not in [1, 2]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to delete designations"
            )
        designation = self.repository.get_by_id(
            db,
            designation_id
        )
        if not designation:
            raise HTTPException(
                status_code=404,
                detail="Designation not found"
            )
        if (current_user["role_id"] == 2) and (designation.CompanyId != current_user["company_id"]):
            raise HTTPException(
                status_code=403,
                detail="You are not authorized to delete this designation"
            )

        deleted_designation = self.repository.delete(
            db,
            designation_id
        )

        if not deleted_designation:
            raise HTTPException(
                status_code=404,
                detail="Designation not found"
            )

        return {
            "message": "Designation deleted successfully"
        }