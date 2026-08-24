from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.applicant import Applicant
from app.models.skill import Skill
from app.repositories.applicant_skill_repository import ApplicantSkillRepository
from app.schemas.applicant_skill_schema import (
    ApplicantSkillCreate,
    ApplicantSkillUpdate,
)


class ApplicantSkillService:
    def __init__(self):
        self.repository = ApplicantSkillRepository()

    # ==================================================
    # GET ALL
    # ==================================================
    def get_all_applicant_skills(
        self,
        db: Session,
        current_user: dict,
        applicant_id: int | None = None,
        search: str = "",
        sort_by: str = "ApplicantSkillId",
        order: str = "desc",
        page: int = 1,
        page_size: int = 10,
    ):
        company_id = current_user["company_id"]
        return self.repository.get_all(
            db=db,
            company_id=company_id,
            applicant_id=applicant_id,
            search=search,
            sort_by=sort_by,
            order=order,
            page=page,
            page_size=page_size,
        )

    # ==================================================
    # GET BY ID
    # ==================================================
    def get_applicant_skill_by_id(
        self,
        db: Session,
        applicant_skill_id: int,
        current_user: dict,
    ):
        applicant_skill = self.repository.get_by_id(
            db=db,
            applicant_skill_id=applicant_skill_id,
            company_id=current_user["company_id"],
        )
        if not applicant_skill:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Applicant skill not found.",
            )
        return applicant_skill

    # ==================================================
    # CREATE
    # ==================================================
    def create_applicant_skill(
        self,
        db: Session,
        applicant_skill: ApplicantSkillCreate,
        current_user: dict,
    ):
        company_id = current_user["company_id"]
        # ==================================================
        # CHECK APPLICANT
        # ==================================================
        applicant = (
            db.query(Applicant)
            .filter(
                Applicant.ApplicantId == applicant_skill.ApplicantId,
                Applicant.CompanyId == company_id,
            )
            .first()
        )
        if not applicant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Applicant not found."
            )
        # ==================================================
        # CHECK SKILL
        # ==================================================
        skill = (
            db.query(Skill)
            .filter(
                Skill.SkillId == applicant_skill.SkillId,
                Skill.CompanyId == company_id,
                Skill.IsActive == True,
            )
            .first()
        )
        if not skill:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Skill not found or inactive.",
            )
        # ==================================================
        # DUPLICATE CHECK
        # ==================================================
        existing = self.repository.get_by_applicant_and_skill(
            db=db,
            applicant_id=applicant_skill.ApplicantId,
            skill_id=applicant_skill.SkillId,
            company_id=company_id,
        )
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This skill is already assigned to the applicant.",
            )
        # ==================================================
        # CREATE
        # ==================================================
        return self.repository.create(
            db=db,
            applicant_skill=applicant_skill,
            company_id=company_id,
            current_user=current_user,
        )

    # ==================================================
    # UPDATE
    # ==================================================
    def update_applicant_skill(
        self,
        db: Session,
        applicant_skill_id: int,
        applicant_skill: ApplicantSkillUpdate,
        current_user: dict,
    ):
        company_id = current_user["company_id"]
        # ==================================================
        # GET EXISTING
        # ==================================================
        existing = self.repository.get_by_id(
            db=db,
            applicant_skill_id=applicant_skill_id,
            company_id=company_id,
        )
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Applicant skill not found.",
            )
        # ==================================================
        # CHECK SKILL
        # ==================================================
        skill = (
            db.query(Skill)
            .filter(
                Skill.SkillId == applicant_skill.SkillId,
                Skill.CompanyId == company_id,
                Skill.IsActive == True,
            )
            .first()
        )
        if not skill:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Skill not found or inactive.",
            )
        # ==================================================
        # DUPLICATE CHECK
        # ==================================================
        duplicate = self.repository.get_by_applicant_and_skill(
            db=db,
            applicant_id=existing.ApplicantId,
            skill_id=applicant_skill.SkillId,
            company_id=company_id,
            exclude_id=applicant_skill_id,
        )
        if duplicate:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This skill is already assigned to the applicant.",
            )
        # ==================================================
        # UPDATE
        # ==================================================
        return self.repository.update(
            db=db,
            applicant_skill_id=applicant_skill_id,
            applicant_skill=applicant_skill,
            current_user=current_user,
        )

    # ==================================================
    # DELETE
    # ==================================================
    def delete_applicant_skill(
        self,
        db: Session,
        applicant_skill_id: int,
        current_user: dict,
    ):
        company_id = current_user["company_id"]
        existing = self.repository.get_by_id(
            db=db,
            applicant_skill_id=applicant_skill_id,
            company_id=company_id,
        )
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Applicant skill not found.",
            )
        return self.repository.delete(
            db=db,
            applicant_skill_id=applicant_skill_id,
            company_id=company_id,
        )
