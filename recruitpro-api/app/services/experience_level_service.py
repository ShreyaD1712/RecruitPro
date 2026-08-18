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

    # -------------------------
    # Permission Check
    # -------------------------
    def check_permission(
        self,
        current_user: dict,
        permission: str,
    ):

        user_permissions = current_user.get(
            "permissions",
            [],
        )

        if permission not in user_permissions:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )

    # -------------------------
    # Get All Experience Levels
    # -------------------------
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

        self.check_permission(
            current_user,
            "VIEW_EXPERIENCE_LEVEL",
        )

        company_id = current_user.get("company_id")

        if not company_id:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Company information not found for the current user",
            )

        return self.repository.get_all(
            db=db,
            company_id=company_id,
            search=search,
            sort_by=sort_by,
            order=order,
            page=page,
            page_size=page_size,
        )

    # -------------------------
    # Get Experience Level By Id
    # -------------------------
    def get_experience_level_by_id(
        self,
        db: Session,
        experience_level_id: int,
        current_user: dict,
    ):

        self.check_permission(
            current_user,
            "VIEW_EXPERIENCE_LEVEL",
        )

        experience_level = self.repository.get_by_id(
            db,
            experience_level_id,
        )

        if not experience_level:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Experience Level not found",
            )

        # -------------------------
        # Company Ownership Check
        # -------------------------

        if experience_level.CompanyId != current_user["company_id"]:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to access this experience level",
            )

        return experience_level

    # -------------------------
    # Create Experience Level
    # -------------------------
    def create_experience_level(
        self,
        db: Session,
        experience_level: ExperienceLevelCreate,
        current_user: dict,
    ):

        self.check_permission(
            current_user,
            "CREATE_EXPERIENCE_LEVEL",
        )

        # Automatically get company
        # from logged-in user

        company_id = current_user.get("company_id")

        if not company_id:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Company information not found for the current user",
            )

        return self.repository.create(
            db=db,
            experience_level=experience_level,
            company_id=company_id,
            current_user=current_user,
        )

    # -------------------------
    # Update Experience Level
    # -------------------------
    def update_experience_level(
        self,
        db: Session,
        experience_level_id: int,
        experience_level: ExperienceLevelUpdate,
        current_user: dict,
    ):

        self.check_permission(
            current_user,
            "UPDATE_EXPERIENCE_LEVEL",
        )

        existing_experience_level = self.repository.get_by_id(
            db,
            experience_level_id,
        )

        if not existing_experience_level:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Experience Level not found",
            )

        # -------------------------
        # Company Ownership Check
        # -------------------------

        if existing_experience_level.CompanyId != current_user["company_id"]:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to update this experience level",
            )

        # CompanyId is never changed
        # during update

        return self.repository.update(
            db=db,
            experience_level_id=experience_level_id,
            experience_level=experience_level,
            current_user=current_user,
        )

    # -------------------------
    # Delete Experience Level
    # -------------------------
    def delete_experience_level(
        self,
        db: Session,
        experience_level_id: int,
        current_user: dict,
    ):

        self.check_permission(
            current_user,
            "DELETE_EXPERIENCE_LEVEL",
        )

        experience_level = self.repository.get_by_id(
            db,
            experience_level_id,
        )

        if not experience_level:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Experience Level not found",
            )

        # -------------------------
        # Company Ownership Check
        # -------------------------

        if experience_level.CompanyId != current_user["company_id"]:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to delete this experience level",
            )

        self.repository.delete(
            db,
            experience_level_id,
        )

        return {"message": "Experience Level deleted successfully"}
