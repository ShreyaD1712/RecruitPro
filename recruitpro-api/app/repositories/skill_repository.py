from datetime import datetime

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.skill import Skill
from app.schemas.skill_schema import (
    SkillCreate,
    SkillUpdate,
)


class SkillRepository:

    # -------------------------
    # Get All Skills
    # -------------------------
    def get_all(
        self,
        db: Session,
        company_id: int,
        search: str = "",
        sort_by: str = "SkillName",
        order: str = "asc",
        page: int = 1,
        page_size: int = 10,
    ):

        query = db.query(Skill)

        # -------------------------
        # Company Filter
        # -------------------------
        query = query.filter(Skill.CompanyId == company_id)

        # -------------------------
        # Search
        # -------------------------
        if search:
            query = query.filter(
                or_(
                    Skill.SkillName.ilike(f"%{search}%"),
                    Skill.Description.ilike(f"%{search}%"),
                )
            )

        # -------------------------
        # Sorting
        # -------------------------
        column = getattr(
            Skill,
            sort_by,
            Skill.SkillName,
        )

        if order.lower() == "desc":
            query = query.order_by(column.desc())
        else:
            query = query.order_by(column.asc())

        # -------------------------
        # Total Records
        # -------------------------
        total_records = query.count()

        # -------------------------
        # Pagination
        # -------------------------
        skills = query.offset((page - 1) * page_size).limit(page_size).all()

        return {
            "total_records": total_records,
            "page": page,
            "page_size": page_size,
            "data": skills,
        }

    # -------------------------
    # Get Skill By Id
    # -------------------------
    def get_by_id(
        self,
        db: Session,
        skill_id: int,
    ):

        return db.query(Skill).filter(Skill.SkillId == skill_id).first()

    # -------------------------
    # Get Skill By Name
    # -------------------------
    def get_by_name(
        self,
        db: Session,
        skill_name: str,
        company_id: int,
    ):

        return (
            db.query(Skill)
            .filter(
                Skill.SkillName == skill_name,
                Skill.CompanyId == company_id,
            )
            .first()
        )

    # -------------------------
    # Create Skill
    # -------------------------
    def create(
        self,
        db: Session,
        skill: SkillCreate,
        company_id: int,
        current_user: dict,
    ):

        new_skill = Skill(
            SkillName=skill.SkillName,
            CompanyId=company_id,
            Description=skill.Description,
            IsActive=skill.IsActive,
            CreatedOn=datetime.now(),
            CreatedBy=current_user["user_id"],
            UpdatedOn=datetime.now(),
            UpdatedBy=current_user["user_id"],
        )

        db.add(new_skill)

        db.commit()

        db.refresh(new_skill)

        return new_skill

    # -------------------------
    # Update Skill
    # -------------------------
    def update(
        self,
        db: Session,
        skill_id: int,
        skill: SkillUpdate,
        current_user: dict,
    ):

        existing_skill = self.get_by_id(
            db,
            skill_id,
        )

        if not existing_skill:
            return None

        # CompanyId is NOT changed

        existing_skill.SkillName = skill.SkillName
        existing_skill.Description = skill.Description
        existing_skill.IsActive = skill.IsActive

        existing_skill.UpdatedOn = datetime.now()
        existing_skill.UpdatedBy = current_user["user_id"]

        db.commit()

        db.refresh(existing_skill)

        return existing_skill

    # -------------------------
    # Delete Skill
    # -------------------------
    def delete(
        self,
        db: Session,
        skill_id: int,
    ):

        skill = self.get_by_id(
            db,
            skill_id,
        )

        if not skill:
            return None

        db.delete(skill)

        db.commit()

        return skill
