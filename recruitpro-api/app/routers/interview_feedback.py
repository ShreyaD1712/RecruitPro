from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.interview_feedback_schema import (
    InterviewFeedbackCreate,
    InterviewFeedbackUpdate,
)
from app.permission_dependency import require_permission
from app.services.interview_feedback_service import InterviewFeedbackService

router = APIRouter(
    prefix="/interview-feedback",
    tags=["Interview Feedback"],
)

service = InterviewFeedbackService()


# ==================================================
# GET ALL INTERVIEW FEEDBACK
# ==================================================
@router.get("/")
def get_all_interview_feedback(
    search: str = "",
    interview_id: int | None = None,
    recommendation: str | None = None,
    sort_by: str = "CreatedOn",
    order: str = "desc",
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_INTERVIEW_FEEDBACK")),
):
    return service.get_all_interview_feedback(
        db=db,
        current_user=current_user,
        search=search,
        interview_id=interview_id,
        recommendation=recommendation,
        sort_by=sort_by,
        order=order,
        page=page,
        page_size=page_size,
    )


# ==================================================
# GET FEEDBACK BY INTERVIEW
# ==================================================
@router.get("/by-interview/{interview_id}")
def get_feedback_by_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_INTERVIEW_FEEDBACK")),
):
    return service.get_feedback_by_interview(
        db=db,
        interview_id=interview_id,
        current_user=current_user,
    )


# ==================================================
# GET FEEDBACK BY ID
# ==================================================
@router.get("/{feedback_id}")
def get_interview_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_INTERVIEW_FEEDBACK")),
):
    return service.get_interview_feedback_by_id(
        db=db,
        feedback_id=feedback_id,
        current_user=current_user,
    )


# ==================================================
# CREATE INTERVIEW FEEDBACK
# ==================================================
@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
def create_interview_feedback(
    feedback: InterviewFeedbackCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("CREATE_INTERVIEW_FEEDBACK")),
):
    return service.create_interview_feedback(
        db=db,
        feedback=feedback,
        current_user=current_user,
    )


# ==================================================
# UPDATE INTERVIEW FEEDBACK
# ==================================================
@router.put("/{feedback_id}")
def update_interview_feedback(
    feedback_id: int,
    feedback: InterviewFeedbackUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("UPDATE_INTERVIEW_FEEDBACK")),
):
    return service.update_interview_feedback(
        db=db,
        feedback_id=feedback_id,
        feedback=feedback,
        current_user=current_user,
    )


# ==================================================
# DELETE INTERVIEW FEEDBACK
# ==================================================
@router.delete("/{feedback_id}")
def delete_interview_feedback(
    feedback_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("DELETE_INTERVIEW_FEEDBACK")),
):
    return service.delete_interview_feedback(
        db=db,
        feedback_id=feedback_id,
        current_user=current_user,
    )
