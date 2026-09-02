from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.employment_type_repository import EmploymentTypeRepository
from app.schemas.employment_type_schema import (
    EmploymentTypeCreate,
    EmploymentTypeUpdate,
)


class EmploymentTypeService:

    def __init__(self):
        self.repository = EmploymentTypeRepository()

    # ==================================================
    # PERMISSION CHECK
    # ==================================================
    def check_permission(self, current_user: dict, permission: str):
        if permission not in current_user.get("permissions", []):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )

    # ==================================================
    # GET COMPANY ID
    # ==================================================
    def get_company_id(self, current_user: dict):
        company_id = current_user.get("company_id")

        if not company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Company information not found for the current user",
            )

        return company_id

    # ==================================================
    # GET ALL EMPLOYMENT TYPES
    # ==================================================
    def get_all_employment_types(
        self,
        db: Session,
        current_user: dict,
        search: str = "",
        sort_by: str = "EmploymentTypeName",
        order: str = "asc",
        page: int = 1,
        page_size: int = 10,
    ):
        self.check_permission(current_user, "VIEW_EMPLOYMENT_TYPE")
        company_id = self.get_company_id(current_user)

        return self.repository.get_all(
            db=db,
            company_id=company_id,
            search=search,
            sort_by=sort_by,
            order=order,
            page=page,
            page_size=page_size,
        )

    # ==================================================
    # GET EMPLOYMENT TYPE BY ID
    # ==================================================
    def get_employment_type_by_id(
        self,
        db: Session,
        employment_type_id: int,
        current_user: dict,
    ):
        self.check_permission(current_user, "VIEW_EMPLOYMENT_TYPE")
        company_id = self.get_company_id(current_user)

        employment_type = self.repository.get_by_id(
            db,
            employment_type_id,
            company_id,
        )

        if not employment_type:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employment Type not found",
            )

        return employment_type

    # ==================================================
    # CREATE EMPLOYMENT TYPE
    # ==================================================
    def create_employment_type(
        self,
        db: Session,
        employment_type: EmploymentTypeCreate,
        current_user: dict,
    ):
        self.check_permission(current_user, "CREATE_EMPLOYMENT_TYPE")
        company_id = self.get_company_id(current_user)

        return self.repository.create(
            db=db,
            employment_type=employment_type,
            company_id=company_id,
            current_user=current_user,
        )

    # ==================================================
    # UPDATE EMPLOYMENT TYPE
    # ==================================================
    def update_employment_type(
        self,
        db: Session,
        employment_type_id: int,
        employment_type: EmploymentTypeUpdate,
        current_user: dict,
    ):
        self.check_permission(current_user, "UPDATE_EMPLOYMENT_TYPE")
        company_id = self.get_company_id(current_user)

        existing_employment_type = self.repository.get_by_id(
            db,
            employment_type_id,
            company_id,
        )

        if not existing_employment_type:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employment Type not found",
            )

        return self.repository.update(
            db=db,
            employment_type_id=employment_type_id,
            employment_type=employment_type,
            current_user=current_user,
        )

    # ==================================================
    # DELETE EMPLOYMENT TYPE
    # ==================================================
    def delete_employment_type(
        self,
        db: Session,
        employment_type_id: int,
        current_user: dict,
    ):
        self.check_permission(current_user, "DELETE_EMPLOYMENT_TYPE")
        company_id = self.get_company_id(current_user)

        employment_type = self.repository.get_by_id(
            db,
            employment_type_id,
            company_id,
        )

        if not employment_type:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Employment Type not found",
            )

        self.repository.delete(
            db,
            employment_type_id,
        )

        return {"message": "Employment Type deleted successfully"}
