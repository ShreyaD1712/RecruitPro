from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.interview_round_schema import (
    InterviewRoundCreate,
    InterviewRoundUpdate,
)

from app.permission_dependency import require_permission

from app.services.interview_round_service import InterviewRoundService

router = APIRouter(
    prefix="/interview-rounds",
    tags=["Interview Rounds"],
)


service = InterviewRoundService()


# -------------------------
# Get All Interview Rounds
# -------------------------


@router.get("/")
def get_all_interview_rounds(
    search: str = "",
    sort_by: str = "RoundName",
    order: str = "asc",
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_INTERVIEW_ROUND")),
):

    return service.get_all_interview_rounds(
        db=db,
        current_user=current_user,
        search=search,
        sort_by=sort_by,
        order=order,
        page=page,
        page_size=page_size,
    )


# -------------------------
# Get Interview Round By ID
# -------------------------


@router.get("/{interview_round_id}")
def get_interview_round(
    interview_round_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_INTERVIEW_ROUND")),
):

    return service.get_interview_round_by_id(
        db=db,
        interview_round_id=interview_round_id,
        current_user=current_user,
    )


# -------------------------
# Create Interview Round
# -------------------------


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
def create_interview_round(
    interview_round: InterviewRoundCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("CREATE_INTERVIEW_ROUND")),
):

    return service.create_interview_round(
        db=db,
        interview_round=interview_round,
        current_user=current_user,
    )


# -------------------------
# Update Interview Round
# -------------------------


@router.put("/{interview_round_id}")
def update_interview_round(
    interview_round_id: int,
    interview_round: InterviewRoundUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("UPDATE_INTERVIEW_ROUND")),
):

    return service.update_interview_round(
        db=db,
        interview_round_id=interview_round_id,
        interview_round=interview_round,
        current_user=current_user,
    )


# -------------------------
# Delete Interview Round
# -------------------------


@router.delete("/{interview_round_id}")
def delete_interview_round(
    interview_round_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("DELETE_INTERVIEW_ROUND")),
):

    return service.delete_interview_round(
        db=db,
        interview_round_id=interview_round_id,
        current_user=current_user,
    )
