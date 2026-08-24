from datetime import datetime
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload
from app.models.applicant_skill import ApplicantSkill
from app.models.applicant import Applicant
from app.models.skill import Skill
from app.schemas.applicant_skill_schema import (
    ApplicantSkillCreate,
    ApplicantSkillUpdate,
)


class ApplicantSkillRepository:
    # ==================================================
    # GET ALL APPLICANT SKILLS
    # ==================================================
    def get_all(
        self,
        db: Session,
        company_id: int,
        applicant_id: int | None = None,
        search: str = "",
        sort_by: str = "ApplicantSkillId",
        order: str = "desc",
        page: int = 1,
        page_size: int = 10,
    ):
        query = db.query(ApplicantSkill).options(
            joinedload(ApplicantSkill.applicant),
            joinedload(ApplicantSkill.skill),
        )
        # ==================================================
        # COMPANY FILTER
        # ==================================================
        query = query.filter(ApplicantSkill.CompanyId == company_id)
        # ==================================================
        # APPLICANT FILTER
        # ==================================================
        if applicant_id is not None:
            query = query.filter(ApplicantSkill.ApplicantId == applicant_id)
        # ==================================================
        # SEARCH
        # ==================================================
        if search:
            query = query.join(Skill).filter(
                or_(
                    Skill.SkillName.ilike(f"%{search}%"),
                    Applicant.FirstName.ilike(f"%{search}%"),
                    Applicant.LastName.ilike(f"%{search}%"),
                )
            )
        # ==================================================
        # SORTING
        # ==================================================
        allowed_sort_columns = {
            "ApplicantSkillId": ApplicantSkill.ApplicantSkillId,
            "ExperienceInYears": ApplicantSkill.ExperienceInYears,
            "SkillName": Skill.SkillName,
        }
        column = allowed_sort_columns.get(sort_by, ApplicantSkill.ApplicantSkillId)
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
        data = query.offset((page - 1) * page_size).limit(page_size).all()
        return {
            "total_records": total_records,
            "page": page,
            "page_size": page_size,
            "data": data,
        }

    # ==================================================
    # GET BY ID
    # ==================================================
    def get_by_id(
        self,
        db: Session,
        applicant_skill_id: int,
        company_id: int,
    ):
        return (
            db.query(ApplicantSkill)
            .options(
                joinedload(ApplicantSkill.applicant),
                joinedload(ApplicantSkill.skill),
            )
            .filter(
                ApplicantSkill.ApplicantSkillId == applicant_skill_id,
                ApplicantSkill.CompanyId == company_id,
            )
            .first()
        )

    # ==================================================
    # CHECK DUPLICATE APPLICANT + SKILL
    # ==================================================
    def get_by_applicant_and_skill(
        self,
        db: Session,
        applicant_id: int,
        skill_id: int,
        company_id: int,
        exclude_id: int | None = None,
    ):
        query = db.query(ApplicantSkill).filter(
            ApplicantSkill.ApplicantId == applicant_id,
            ApplicantSkill.SkillId == skill_id,
            ApplicantSkill.CompanyId == company_id,
        )
        if exclude_id is not None:
            query = query.filter(ApplicantSkill.ApplicantSkillId != exclude_id)
        return query.first()

    # ==================================================
    # CREATE
    # ==================================================
    def create(
        self,
        db: Session,
        applicant_skill: ApplicantSkillCreate,
        company_id: int,
        current_user: dict,
    ):
        new_applicant_skill = ApplicantSkill(
            # ==================================================
            # COMPANY
            # ==================================================
            CompanyId=company_id,
            # ==================================================
            # APPLICANT
            # ==================================================
            ApplicantId=applicant_skill.ApplicantId,
            # ==================================================
            # SKILL
            # ==================================================
            SkillId=applicant_skill.SkillId,
            # ==================================================
            # EXPERIENCE
            # ==================================================
            ExperienceInYears=applicant_skill.ExperienceInYears,
        )
        db.add(new_applicant_skill)
        db.commit()
        db.refresh(new_applicant_skill)
        return new_applicant_skill

    # ==================================================
    # UPDATE
    # ==================================================
    def update(
        self,
        db: Session,
        applicant_skill_id: int,
        applicant_skill: ApplicantSkillUpdate,
        current_user: dict,
    ):
        existing_skill = self.get_by_id(
            db=db,
            applicant_skill_id=applicant_skill_id,
            company_id=current_user["company_id"],
        )
        # ==================================================
        # SECURITY CHECK
        # ==================================================
        if not existing_skill:
            return None
        # ==================================================
        # UPDATE
        # ==================================================
        existing_skill.SkillId = applicant_skill.SkillId
        existing_skill.ExperienceInYears = applicant_skill.ExperienceInYears
        db.commit()
        db.refresh(existing_skill)
        return existing_skill

    # ==================================================
    # DELETE
    # ==================================================
    def delete(
        self,
        db: Session,
        applicant_skill_id: int,
        company_id: int,
    ):
        applicant_skill = self.get_by_id(
            db=db,
            applicant_skill_id=applicant_skill_id,
            company_id=company_id,
        )
        # ==================================================
        # SECURITY CHECK
        # ==================================================
        if not applicant_skill:
            return None
        # ==================================================
        # DELETE
        # ==================================================
        db.delete(applicant_skill)
        db.commit()
        return applicant_skill
