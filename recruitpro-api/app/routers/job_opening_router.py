from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.job_opening_schema import (
    JobOpeningCreate,
    JobOpeningUpdate,
)
from app.permission_dependency import require_permission
from app.services.job_opening_service import JobOpeningService

router = APIRouter(
    prefix="/job-openings",
    tags=["Job Openings"],
)
service = JobOpeningService()


# -------------------------
# Get All Job Openings
# -------------------------
# Only OPEN job openings
# belonging to current user's company
#
# Optional filters:
# - search
# - department_id
# - designation_id
# - sorting
# - pagination
# -------------------------
@router.get("/")
def get_all_job_openings(
    search: str = "",
    department_id: int | None = None,
    designation_id: int | None = None,
    status: str = "Open",
    sort_by: str = "CreatedOn",
    order: str = "desc",
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_JOB_OPENING")),
):
    return service.get_all_job_openings(
        db=db,
        current_user=current_user,
        search=search,
        department_id=department_id,
        designation_id=designation_id,
        status=status,
        sort_by=sort_by,
        order=order,
        page=page,
        page_size=page_size,
    )


# -------------------------
# Get Job Opening By ID
# -------------------------
@router.get("/{job_opening_id}")
def get_job_opening(
    job_opening_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_JOB_OPENING")),
):
    return service.get_job_opening_by_id(
        db=db,
        job_opening_id=job_opening_id,
        current_user=current_user,
    )


# -------------------------
# Create Job Opening
# -------------------------
@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
def create_job_opening(
    job_opening: JobOpeningCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("CREATE_JOB_OPENING")),
):
    return service.create_job_opening(
        db=db,
        job_opening=job_opening,
        current_user=current_user,
    )


# -------------------------
# Update Job Opening
# -------------------------
@router.put("/{job_opening_id}")
def update_job_opening(
    job_opening_id: int,
    job_opening: JobOpeningUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("UPDATE_JOB_OPENING")),
):
    return service.update_job_opening(
        db=db,
        job_opening_id=job_opening_id,
        job_opening=job_opening,
        current_user=current_user,
    )


# -------------------------
# Delete Job Opening
# -------------------------
@router.delete("/{job_opening_id}")
def delete_job_opening(
    job_opening_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("DELETE_JOB_OPENING")),
):
    return service.delete_job_opening(
        db=db,
        job_opening_id=job_opening_id,
        current_user=current_user,
    )
