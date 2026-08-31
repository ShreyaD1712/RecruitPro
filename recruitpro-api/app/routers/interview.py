from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.interview_schema import (
    InterviewCreate,
    InterviewUpdate,
)
from app.permission_dependency import require_permission
from app.services.interview_service import InterviewService

router = APIRouter(
    prefix="/interviews",
    tags=["Interviews"],
)

service = InterviewService()


# ==================================================
# GET ALL INTERVIEWS
# ==================================================
@router.get("/")
def get_all_interviews(
    search: str = "",
    application_id: int | None = None,
    interview_round_id: int | None = None,
    interviewer_id: int | None = None,
    interview_status: str | None = None,
    sort_by: str = "InterviewDate",
    order: str = "desc",
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_INTERVIEW")),
):
    return service.get_all_interviews(
        db=db,
        current_user=current_user,
        search=search,
        application_id=application_id,
        interview_round_id=interview_round_id,
        interviewer_id=interviewer_id,
        interview_status=interview_status,
        sort_by=sort_by,
        order=order,
        page=page,
        page_size=page_size,
    )


# ==================================================
# GET INTERVIEW BY ID
# ==================================================
@router.get("/{interview_id}")
def get_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_INTERVIEW")),
):
    return service.get_interview_by_id(
        db=db,
        interview_id=interview_id,
        current_user=current_user,
    )


# ==================================================
# CREATE INTERVIEW
# ==================================================
@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
def create_interview(
    interview: InterviewCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("CREATE_INTERVIEW")),
):
    return service.create_interview(
        db=db,
        interview=interview,
        current_user=current_user,
    )


# ==================================================
# UPDATE INTERVIEW
# ==================================================
@router.put("/{interview_id}")
def update_interview(
    interview_id: int,
    interview: InterviewUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("UPDATE_INTERVIEW")),
):
    return service.update_interview(
        db=db,
        interview_id=interview_id,
        interview=interview,
        current_user=current_user,
    )


# ==================================================
# CANCEL INTERVIEW
# ==================================================
@router.put("/{interview_id}/cancel")
def cancel_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("UPDATE_INTERVIEW")),
):
    return service.cancel_interview(
        db=db,
        interview_id=interview_id,
        current_user=current_user,
    )


# ==================================================
# DELETE INTERVIEW
# ==================================================
@router.delete("/{interview_id}")
def delete_interview(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("DELETE_INTERVIEW")),
):
    return service.delete_interview(
        db=db,
        interview_id=interview_id,
        current_user=current_user,
    )
