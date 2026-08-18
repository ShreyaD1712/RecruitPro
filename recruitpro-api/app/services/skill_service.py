from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.skill_repository import SkillRepository
from app.schemas.skill_schema import (
    SkillCreate,
    SkillUpdate,
)


class SkillService:

    def __init__(self):
        self.repository = SkillRepository()

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
    # Get All Skills
    # -------------------------
    def get_all_skills(
        self,
        db: Session,
        current_user: dict,
        search: str = "",
        sort_by: str = "SkillName",
        order: str = "asc",
        page: int = 1,
        page_size: int = 10,
    ):

        self.check_permission(
            current_user,
            "VIEW_SKILL",
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
    # Get Skill By Id
    # -------------------------
    def get_skill_by_id(
        self,
        db: Session,
        skill_id: int,
        current_user: dict,
    ):

        self.check_permission(
            current_user,
            "VIEW_SKILL",
        )

        skill = self.repository.get_by_id(
            db,
            skill_id,
        )

        if not skill:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Skill not found",
            )

        # Company ownership check
        if skill.CompanyId != current_user["company_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to access this skill",
            )

        return skill

    # -------------------------
    # Create Skill
    # -------------------------
    def create_skill(
        self,
        db: Session,
        skill: SkillCreate,
        current_user: dict,
    ):

        self.check_permission(
            current_user,
            "CREATE_SKILL",
        )

        # Automatically get company from logged-in user
        company_id = current_user.get("company_id")

        if not company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Company information not found for the current user",
            )

        return self.repository.create(
            db=db,
            skill=skill,
            company_id=company_id,
            current_user=current_user,
        )

    # -------------------------
    # Update Skill
    # -------------------------
    def update_skill(
        self,
        db: Session,
        skill_id: int,
        skill: SkillUpdate,
        current_user: dict,
    ):

        self.check_permission(
            current_user,
            "UPDATE_SKILL",
        )

        existing_skill = self.repository.get_by_id(
            db,
            skill_id,
        )

        if not existing_skill:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Skill not found",
            )

        # User can update only their company's skill
        if existing_skill.CompanyId != current_user["company_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to update this skill",
            )

        # CompanyId is never changed during update
        return self.repository.update(
            db=db,
            skill_id=skill_id,
            skill=skill,
            current_user=current_user,
        )

    # -------------------------
    # Delete Skill
    # -------------------------
    def delete_skill(
        self,
        db: Session,
        skill_id: int,
        current_user: dict,
    ):

        self.check_permission(
            current_user,
            "DELETE_SKILL",
        )

        skill = self.repository.get_by_id(
            db,
            skill_id,
        )

        if not skill:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Skill not found",
            )

        # User can delete only their company's skill
        if skill.CompanyId != current_user["company_id"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to delete this skill",
            )

        self.repository.delete(
            db,
            skill_id,
        )

        return {"message": "Skill deleted successfully"}
