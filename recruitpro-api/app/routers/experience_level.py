from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.experience_level_schema import (
    ExperienceLevelCreate,
    ExperienceLevelUpdate,
)

from app.permission_dependency import require_permission

from app.services.experience_level_service import ExperienceLevelService

router = APIRouter(
    prefix="/experience-levels",
    tags=["Experience Levels"],
)


service = ExperienceLevelService()


# -------------------------
# Get All Experience Levels
# -------------------------


@router.get("/")
def get_all_experience_levels(
    search: str = "",
    sort_by: str = "ExperienceLevelName",
    order: str = "asc",
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_EXPERIENCE_LEVEL")),
):

    return service.get_all_experience_levels(
        db=db,
        current_user=current_user,
        search=search,
        sort_by=sort_by,
        order=order,
        page=page,
        page_size=page_size,
    )


# -------------------------
# Get Experience Level By ID
# -------------------------


@router.get("/{experience_level_id}")
def get_experience_level(
    experience_level_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_EXPERIENCE_LEVEL")),
):

    return service.get_experience_level_by_id(
        db=db,
        experience_level_id=experience_level_id,
        current_user=current_user,
    )


# -------------------------
# Create Experience Level
# -------------------------


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
def create_experience_level(
    experience_level: ExperienceLevelCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("CREATE_EXPERIENCE_LEVEL")),
):

    return service.create_experience_level(
        db=db,
        experience_level=experience_level,
        current_user=current_user,
    )


# -------------------------
# Update Experience Level
# -------------------------


@router.put("/{experience_level_id}")
def update_experience_level(
    experience_level_id: int,
    experience_level: ExperienceLevelUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("UPDATE_EXPERIENCE_LEVEL")),
):

    return service.update_experience_level(
        db=db,
        experience_level_id=experience_level_id,
        experience_level=experience_level,
        current_user=current_user,
    )


# -------------------------
# Delete Experience Level
# -------------------------


@router.delete("/{experience_level_id}")
def delete_experience_level(
    experience_level_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("DELETE_EXPERIENCE_LEVEL")),
):

    return service.delete_experience_level(
        db=db,
        experience_level_id=experience_level_id,
        current_user=current_user,
    )
