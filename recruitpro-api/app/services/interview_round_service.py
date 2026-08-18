from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.interview_round_repository import InterviewRoundRepository

from app.schemas.interview_round_schema import (
    InterviewRoundCreate,
    InterviewRoundUpdate,
)


class InterviewRoundService:

    def __init__(self):

        self.repository = InterviewRoundRepository()

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
    # Get All Interview Rounds
    # -------------------------
    def get_all_interview_rounds(
        self,
        db: Session,
        current_user: dict,
        search: str = "",
        sort_by: str = "RoundName",
        order: str = "asc",
        page: int = 1,
        page_size: int = 10,
    ):

        self.check_permission(
            current_user,
            "VIEW_INTERVIEW_ROUND",
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
    # Get Interview Round By Id
    # -------------------------
    def get_interview_round_by_id(
        self,
        db: Session,
        interview_round_id: int,
        current_user: dict,
    ):

        self.check_permission(
            current_user,
            "VIEW_INTERVIEW_ROUND",
        )

        interview_round = self.repository.get_by_id(
            db,
            interview_round_id,
        )

        if not interview_round:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview Round not found",
            )

        # -------------------------
        # Company Ownership Check
        # -------------------------

        if interview_round.CompanyId != current_user["company_id"]:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to access this interview round",
            )

        return interview_round

    # -------------------------
    # Create Interview Round
    # -------------------------
    def create_interview_round(
        self,
        db: Session,
        interview_round: InterviewRoundCreate,
        current_user: dict,
    ):

        self.check_permission(
            current_user,
            "CREATE_INTERVIEW_ROUND",
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
            interview_round=interview_round,
            company_id=company_id,
            current_user=current_user,
        )

    # -------------------------
    # Update Interview Round
    # -------------------------
    def update_interview_round(
        self,
        db: Session,
        interview_round_id: int,
        interview_round: InterviewRoundUpdate,
        current_user: dict,
    ):

        self.check_permission(
            current_user,
            "UPDATE_INTERVIEW_ROUND",
        )

        existing_interview_round = self.repository.get_by_id(
            db,
            interview_round_id,
        )

        if not existing_interview_round:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview Round not found",
            )

        # -------------------------
        # Company Ownership Check
        # -------------------------

        if existing_interview_round.CompanyId != current_user["company_id"]:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to update this interview round",
            )

        # CompanyId is never changed
        # during update

        return self.repository.update(
            db=db,
            interview_round_id=interview_round_id,
            interview_round=interview_round,
            current_user=current_user,
        )

    # -------------------------
    # Delete Interview Round
    # -------------------------
    def delete_interview_round(
        self,
        db: Session,
        interview_round_id: int,
        current_user: dict,
    ):

        self.check_permission(
            current_user,
            "DELETE_INTERVIEW_ROUND",
        )

        interview_round = self.repository.get_by_id(
            db,
            interview_round_id,
        )

        if not interview_round:

            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview Round not found",
            )

        # -------------------------
        # Company Ownership Check
        # -------------------------

        if interview_round.CompanyId != current_user["company_id"]:

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to delete this interview round",
            )

        self.repository.delete(
            db,
            interview_round_id,
        )

        return {"message": "Interview Round deleted successfully"}
