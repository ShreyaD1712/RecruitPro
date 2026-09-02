from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.experience_level_repository import ExperienceLevelRepository
from app.schemas.experience_level_schema import (
    ExperienceLevelCreate,
    ExperienceLevelUpdate,
)


class ExperienceLevelService:

    def __init__(self):
        self.repository = ExperienceLevelRepository()

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
    # GET ALL EXPERIENCE LEVELS
    # ==================================================
    def get_all_experience_levels(
        self,
        db: Session,
        current_user: dict,
        search: str = "",
        sort_by: str = "LevelName",
        order: str = "asc",
        page: int = 1,
        page_size: int = 10,
    ):
        self.check_permission(current_user, "VIEW_EXPERIENCE_LEVEL")
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
    # GET EXPERIENCE LEVEL BY ID
    # ==================================================
    def get_experience_level_by_id(
        self,
        db: Session,
        experience_level_id: int,
        current_user: dict,
    ):
        self.check_permission(current_user, "VIEW_EXPERIENCE_LEVEL")
        company_id = self.get_company_id(current_user)

        experience_level = self.repository.get_by_id(
            db,
            experience_level_id,
            company_id,
        )

        if not experience_level:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Experience Level not found",
            )

        return experience_level

    # ==================================================
    # CREATE EXPERIENCE LEVEL
    # ==================================================
    def create_experience_level(
        self,
        db: Session,
        experience_level: ExperienceLevelCreate,
        current_user: dict,
    ):
        self.check_permission(current_user, "CREATE_EXPERIENCE_LEVEL")
        company_id = self.get_company_id(current_user)

        return self.repository.create(
            db=db,
            experience_level=experience_level,
            company_id=company_id,
            current_user=current_user,
        )

    # ==================================================
    # UPDATE EXPERIENCE LEVEL
    # ==================================================
    def update_experience_level(
        self,
        db: Session,
        experience_level_id: int,
        experience_level: ExperienceLevelUpdate,
        current_user: dict,
    ):
        self.check_permission(current_user, "UPDATE_EXPERIENCE_LEVEL")
        company_id = self.get_company_id(current_user)

        existing_experience_level = self.repository.get_by_id(
            db,
            experience_level_id,
            company_id,
        )

        if not existing_experience_level:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Experience Level not found",
            )

        return self.repository.update(
            db=db,
            experience_level_id=experience_level_id,
            experience_level=experience_level,
            current_user=current_user,
        )

    # ==================================================
    # DELETE EXPERIENCE LEVEL
    # ==================================================
    def delete_experience_level(
        self,
        db: Session,
        experience_level_id: int,
        current_user: dict,
    ):
        self.check_permission(current_user, "DELETE_EXPERIENCE_LEVEL")
        company_id = self.get_company_id(current_user)

        experience_level = self.repository.get_by_id(
            db,
            experience_level_id,
            company_id,
        )

        if not experience_level:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Experience Level not found",
            )

        self.repository.delete(
            db,
            experience_level_id,
        )

        return {"message": "Experience Level deleted successfully"}
