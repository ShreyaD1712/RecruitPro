from datetime import datetime

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.experience_level import ExperienceLevel
from app.schemas.experience_level_schema import (
    ExperienceLevelCreate,
    ExperienceLevelUpdate,
)


class ExperienceLevelRepository:

    # -------------------------
    # Get All Experience Levels
    # -------------------------
    def get_all(
        self,
        db: Session,
        company_id: int,
        search: str = "",
        sort_by: str = "LevelName",
        order: str = "asc",
        page: int = 1,
        page_size: int = 10,
    ):

        query = db.query(ExperienceLevel)

        # -------------------------
        # Company Filter
        # -------------------------
        query = query.filter(ExperienceLevel.CompanyId == company_id)

        # -------------------------
        # Search
        # -------------------------
        if search:
            query = query.filter(
                or_(
                    ExperienceLevel.LevelName.ilike(f"%{search}%"),
                    ExperienceLevel.Description.ilike(f"%{search}%"),
                )
            )

        # -------------------------
        # Sorting
        # -------------------------
        column = getattr(
            ExperienceLevel,
            sort_by,
            ExperienceLevel.LevelName,
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
        experience_levels = query.offset((page - 1) * page_size).limit(page_size).all()

        return {
            "total_records": total_records,
            "page": page,
            "page_size": page_size,
            "data": experience_levels,
        }

    # -------------------------
    # Get Experience Level By Id
    # -------------------------
    def get_by_id(
        self,
        db: Session,
        experience_level_id: int,
        company_id: int,
    ):

        return (
            db.query(ExperienceLevel)
            .filter(
                ExperienceLevel.ExperienceLevelId == experience_level_id,
                ExperienceLevel.CompanyId == company_id,
            )
            .first()
        )

    # -------------------------
    # Get Experience Level By Name
    # -------------------------
    def get_by_name(
        self,
        db: Session,
        level_name: str,
        company_id: int,
    ):

        return (
            db.query(ExperienceLevel)
            .filter(
                ExperienceLevel.LevelName == level_name,
                ExperienceLevel.CompanyId == company_id,
            )
            .first()
        )

    # -------------------------
    # Create Experience Level
    # -------------------------
    def create(
        self,
        db: Session,
        experience_level: ExperienceLevelCreate,
        company_id: int,
        current_user: dict,
    ):

        new_experience_level = ExperienceLevel(
            LevelName=experience_level.LevelName,
            CompanyId=company_id,
            Description=experience_level.Description,
            IsActive=experience_level.IsActive,
            CreatedOn=datetime.now(),
            CreatedBy=current_user["user_id"],
            UpdatedOn=datetime.now(),
            UpdatedBy=current_user["user_id"],
        )

        db.add(new_experience_level)

        db.commit()

        db.refresh(new_experience_level)

        return new_experience_level

    # -------------------------
    # Update Experience Level
    # -------------------------
    def update(
        self,
        db: Session,
        experience_level_id: int,
        experience_level: ExperienceLevelUpdate,
        current_user: dict,
    ):

        existing_experience_level = self.get_by_id(
            db,
            experience_level_id,
        )

        if not existing_experience_level:
            return None

        # CompanyId is NOT changed

        existing_experience_level.LevelName = experience_level.LevelName

        existing_experience_level.Description = experience_level.Description

        existing_experience_level.IsActive = experience_level.IsActive

        existing_experience_level.UpdatedOn = datetime.now()

        existing_experience_level.UpdatedBy = current_user["user_id"]

        db.commit()

        db.refresh(existing_experience_level)

        return existing_experience_level

    # -------------------------
    # Delete Experience Level
    # -------------------------
    def delete(
        self,
        db: Session,
        experience_level_id: int,
    ):

        experience_level = self.get_by_id(
            db,
            experience_level_id,
        )

        if not experience_level:
            return None

        db.delete(experience_level)

        db.commit()

        return experience_level
