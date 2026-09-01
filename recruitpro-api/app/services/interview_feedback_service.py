from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.interview_feedback_repository import (
    InterviewFeedbackRepository,
)
from app.schemas.interview_feedback_schema import (
    InterviewFeedbackCreate,
    InterviewFeedbackUpdate,
)


class InterviewFeedbackService:
    def __init__(self):
        self.repository = InterviewFeedbackRepository()

    # ==================================================
    # PERMISSION CHECK
    # ==================================================
    def check_permission(
        self,
        current_user: dict,
        permission: str,
    ):
        user_permissions = current_user.get("permissions", [])
        if permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )

    # ==================================================
    # GET COMPANY ID
    # ==================================================
    def get_company_id(
        self,
        current_user: dict,
    ):
        company_id = current_user.get("company_id")
        if not company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Company information not found for the current user",
            )
        return company_id

    # ==================================================
    # GET ALL INTERVIEW FEEDBACK
    # ==================================================
    def get_all_interview_feedback(
        self,
        db: Session,
        current_user: dict,
        search: str = "",
        interview_id: int | None = None,
        recommendation: str | None = None,
        sort_by: str = "CreatedOn",
        order: str = "desc",
        page: int = 1,
        page_size: int = 10,
    ):
        self.check_permission(
            current_user,
            "VIEW_INTERVIEW_FEEDBACK",
        )
        company_id = self.get_company_id(current_user)
        return self.repository.get_all(
            db=db,
            company_id=company_id,
            search=search,
            interview_id=interview_id,
            recommendation=recommendation,
            sort_by=sort_by,
            order=order,
            page=page,
            page_size=page_size,
        )

    # ==================================================
    # GET INTERVIEW FEEDBACK BY ID
    # ==================================================
    def get_interview_feedback_by_id(
        self,
        db: Session,
        feedback_id: int,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "VIEW_INTERVIEW_FEEDBACK",
        )
        company_id = self.get_company_id(current_user)
        feedback = self.repository.get_by_id(
            db=db,
            feedback_id=feedback_id,
            company_id=company_id,
        )
        if not feedback:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview feedback not found",
            )
        return feedback

    # ==================================================
    # GET FEEDBACK BY INTERVIEW
    # ==================================================
    def get_feedback_by_interview(
        self,
        db: Session,
        interview_id: int,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "VIEW_INTERVIEW_FEEDBACK",
        )
        company_id = self.get_company_id(current_user)
        # ==================================================
        # CHECK INTERVIEW
        # ==================================================
        interview = self.repository.get_interview(
            db=db,
            interview_id=interview_id,
            company_id=company_id,
        )
        if not interview:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview not found in your company",
            )
        # ==================================================
        # GET FEEDBACK
        # ==================================================
        feedback = self.repository.get_by_interview(
            db=db,
            interview_id=interview_id,
            company_id=company_id,
        )
        if not feedback:
            return {
                "exists": False,
                "feedback": None,
            }
        return {
            "exists": True,
            "feedback": feedback,
        }

    # ==================================================
    # CREATE INTERVIEW FEEDBACK
    # ==================================================
    def create_interview_feedback(
        self,
        db: Session,
        feedback: InterviewFeedbackCreate,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "CREATE_INTERVIEW_FEEDBACK",
        )
        company_id = self.get_company_id(current_user)
        # ==================================================
        # CHECK INTERVIEW
        # ==================================================
        interview = self.repository.get_interview(
            db=db,
            interview_id=feedback.InterviewId,
            company_id=company_id,
        )
        if not interview:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview not found in your company",
            )
        # ==================================================
        # INTERVIEW MUST BE COMPLETED
        # ==================================================
        if interview.Status != "Completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Feedback can only be added for a completed interview",
            )
        # ==================================================
        # DUPLICATE FEEDBACK CHECK
        # ==================================================
        existing_feedback = self.repository.get_by_interview(
            db=db,
            interview_id=feedback.InterviewId,
            company_id=company_id,
        )
        if existing_feedback:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Feedback already exists for this interview",
            )
        # ==================================================
        # VALIDATE RECOMMENDATION
        # ==================================================
        allowed_recommendations = [
            "Next Round",
            "Selected",
            "Rejected",
            "On Hold",
        ]
        if (
            feedback.Recommendation
            and feedback.Recommendation not in allowed_recommendations
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid recommendation",
            )
        # ==================================================
        # CREATE FEEDBACK
        # ==================================================
        return self.repository.create(
            db=db,
            feedback=feedback,
            company_id=company_id,
            current_user=current_user,
        )

    # ==================================================
    # UPDATE INTERVIEW FEEDBACK
    # ==================================================
    def update_interview_feedback(
        self,
        db: Session,
        feedback_id: int,
        feedback: InterviewFeedbackUpdate,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "UPDATE_INTERVIEW_FEEDBACK",
        )
        company_id = self.get_company_id(current_user)
        # ==================================================
        # CHECK EXISTING FEEDBACK
        # ==================================================
        existing = self.repository.get_by_id(
            db=db,
            feedback_id=feedback_id,
            company_id=company_id,
        )
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview feedback not found",
            )
        # ==================================================
        # CHECK INTERVIEW
        # ==================================================
        interview = self.repository.get_interview(
            db=db,
            interview_id=feedback.InterviewId,
            company_id=company_id,
        )
        if not interview:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview not found in your company",
            )
        # ==================================================
        # INTERVIEW MUST BE COMPLETED
        # ==================================================
        if interview.Status != "Completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Feedback can only be updated for a completed interview",
            )
        # ==================================================
        # DUPLICATE INTERVIEW CHECK
        # ==================================================
        duplicate = self.repository.get_by_interview(
            db=db,
            interview_id=feedback.InterviewId,
            company_id=company_id,
        )
        if duplicate and duplicate.FeedbackId != feedback_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Feedback already exists for this interview",
            )
        # ==================================================
        # VALIDATE RECOMMENDATION
        # ==================================================
        allowed_recommendations = [
            "Next Round",
            "Selected",
            "Rejected",
            "On Hold",
        ]
        if (
            feedback.Recommendation
            and feedback.Recommendation not in allowed_recommendations
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid recommendation",
            )
        # ==================================================
        # UPDATE FEEDBACK
        # ==================================================
        updated_feedback = self.repository.update(
            db=db,
            feedback_id=feedback_id,
            feedback=feedback,
            current_user=current_user,
        )
        if not updated_feedback:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview feedback not found",
            )
        return updated_feedback

    # ==================================================
    # DELETE INTERVIEW FEEDBACK
    # ==================================================
    def delete_interview_feedback(
        self,
        db: Session,
        feedback_id: int,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "DELETE_INTERVIEW_FEEDBACK",
        )
        company_id = self.get_company_id(current_user)
        # ==================================================
        # CHECK EXISTING FEEDBACK
        # ==================================================
        existing = self.repository.get_by_id(
            db=db,
            feedback_id=feedback_id,
            company_id=company_id,
        )
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview feedback not found",
            )
        # ==================================================
        # DELETE FEEDBACK
        # ==================================================
        self.repository.delete(
            db=db,
            feedback_id=feedback_id,
            company_id=company_id,
        )
        return {"message": "Interview feedback deleted successfully"}
