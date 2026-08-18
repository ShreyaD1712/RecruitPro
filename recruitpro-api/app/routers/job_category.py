from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.job_category_schema import (
    JobCategoryCreate,
    JobCategoryUpdate,
)
from app.permission_dependency import require_permission
from app.services.job_category_service import JobCategoryService

router = APIRouter(
    prefix="/job-categories",
    tags=["Job Categories"],
)

service = JobCategoryService()


# -------------------------
# Get All Job Categories
# -------------------------


@router.get("/")
def get_all_job_categories(
    search: str = "",
    sort_by: str = "CategoryName",
    order: str = "asc",
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_JOB_CATEGORY")),
):

    return service.get_all_job_categories(
        db=db,
        current_user=current_user,
        search=search,
        sort_by=sort_by,
        order=order,
        page=page,
        page_size=page_size,
    )


# -------------------------
# Get Job Category By ID
# -------------------------


@router.get("/{job_category_id}")
def get_job_category(
    job_category_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_JOB_CATEGORY")),
):

    return service.get_job_category_by_id(
        db=db,
        job_category_id=job_category_id,
        current_user=current_user,
    )


# -------------------------
# Create Job Category
# -------------------------


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
def create_job_category(
    job_category: JobCategoryCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("CREATE_JOB_CATEGORY")),
):

    return service.create_job_category(
        db=db,
        job_category=job_category,
        current_user=current_user,
    )


# -------------------------
# Update Job Category
# -------------------------


@router.put("/{job_category_id}")
def update_job_category(
    job_category_id: int,
    job_category: JobCategoryUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("UPDATE_JOB_CATEGORY")),
):

    return service.update_job_category(
        db=db,
        job_category_id=job_category_id,
        job_category=job_category,
        current_user=current_user,
    )


# -------------------------
# Delete Job Category
# -------------------------


@router.delete("/{job_category_id}")
def delete_job_category(
    job_category_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("DELETE_JOB_CATEGORY")),
):

    return service.delete_job_category(
        db=db,
        job_category_id=job_category_id,
        current_user=current_user,
    )
