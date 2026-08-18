from datetime import datetime

from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.models.interview_round import InterviewRound
from app.schemas.interview_round_schema import (
    InterviewRoundCreate,
    InterviewRoundUpdate,
)


class InterviewRoundRepository:

    # -------------------------
    # Get All Interview Rounds
    # -------------------------
    def get_all(
        self,
        db: Session,
        company_id: int,
        search: str = "",
        sort_by: str = "RoundName",
        order: str = "asc",
        page: int = 1,
        page_size: int = 10,
    ):

        query = db.query(InterviewRound)

        # -------------------------
        # Company Filter
        # -------------------------
        query = query.filter(InterviewRound.CompanyId == company_id)

        # -------------------------
        # Search
        # -------------------------
        if search:

            query = query.filter(
                or_(
                    InterviewRound.RoundName.ilike(f"%{search}%"),
                    InterviewRound.Description.ilike(f"%{search}%"),
                )
            )

        # -------------------------
        # Sorting
        # -------------------------
        column = getattr(
            InterviewRound,
            sort_by,
            InterviewRound.RoundName,
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
        interview_rounds = query.offset((page - 1) * page_size).limit(page_size).all()

        return {
            "total_records": total_records,
            "page": page,
            "page_size": page_size,
            "data": interview_rounds,
        }

    # -------------------------
    # Get Interview Round By Id
    # -------------------------
    def get_by_id(
        self,
        db: Session,
        interview_round_id: int,
    ):

        return (
            db.query(InterviewRound)
            .filter(InterviewRound.InterviewRoundId == interview_round_id)
            .first()
        )

    # -------------------------
    # Get Interview Round By Name
    # -------------------------
    def get_by_name(
        self,
        db: Session,
        round_name: str,
        company_id: int,
    ):

        return (
            db.query(InterviewRound)
            .filter(
                InterviewRound.RoundName == round_name,
                InterviewRound.CompanyId == company_id,
            )
            .first()
        )

    # -------------------------
    # Create Interview Round
    # -------------------------
    def create(
        self,
        db: Session,
        interview_round: InterviewRoundCreate,
        company_id: int,
        current_user: dict,
    ):

        new_interview_round = InterviewRound(
            RoundName=interview_round.RoundName,
            CompanyId=company_id,
            Description=interview_round.Description,
            IsActive=interview_round.IsActive,
            CreatedOn=datetime.now(),
            CreatedBy=current_user["user_id"],
            UpdatedOn=datetime.now(),
            UpdatedBy=current_user["user_id"],
        )

        db.add(new_interview_round)

        db.commit()

        db.refresh(new_interview_round)

        return new_interview_round

    # -------------------------
    # Update Interview Round
    # -------------------------
    def update(
        self,
        db: Session,
        interview_round_id: int,
        interview_round: InterviewRoundUpdate,
        current_user: dict,
    ):

        existing_interview_round = self.get_by_id(
            db,
            interview_round_id,
        )

        if not existing_interview_round:

            return None

        # CompanyId is NOT changed

        existing_interview_round.RoundName = interview_round.RoundName

        existing_interview_round.Description = interview_round.Description

        existing_interview_round.IsActive = interview_round.IsActive

        existing_interview_round.UpdatedOn = datetime.now()

        existing_interview_round.UpdatedBy = current_user["user_id"]

        db.commit()

        db.refresh(existing_interview_round)

        return existing_interview_round

    # -------------------------
    # Delete Interview Round
    # -------------------------
    def delete(
        self,
        db: Session,
        interview_round_id: int,
    ):

        interview_round = self.get_by_id(
            db,
            interview_round_id,
        )

        if not interview_round:

            return None

        db.delete(interview_round)

        db.commit()

        return interview_round
