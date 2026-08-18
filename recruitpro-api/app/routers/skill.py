from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user

from app.schemas.skill_schema import (
    SkillCreate,
    SkillUpdate,
)
from app.permission_dependency import require_permission
from app.services.skill_service import SkillService

router = APIRouter(
    prefix="/skills",
    tags=["Skills"],
)

service = SkillService()


# -------------------------
# Get All Skills
# -------------------------
@router.get("/")
def get_all_skills(
    search: str = "",
    sort_by: str = "SkillName",
    order: str = "asc",
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_SKILL")),
):

    return service.get_all_skills(
        db=db,
        current_user=current_user,
        search=search,
        sort_by=sort_by,
        order=order,
        page=page,
        page_size=page_size,
    )


# -------------------------
# Get Skill By ID
# -------------------------
@router.get("/{skill_id}")
def get_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_SKILL")),
):

    return service.get_skill_by_id(
        db=db,
        skill_id=skill_id,
        current_user=current_user,
    )


# -------------------------
# Create Skill
# -------------------------
@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
def create_skill(
    skill: SkillCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("CREATE_SKILL")),
):

    return service.create_skill(
        db=db,
        skill=skill,
        current_user=current_user,
    )


# -------------------------
# Update Skill
# -------------------------
@router.put("/{skill_id}")
def update_skill(
    skill_id: int,
    skill: SkillUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("UPDATE_SKILL")),
):

    return service.update_skill(
        db=db,
        skill_id=skill_id,
        skill=skill,
        current_user=current_user,
    )


# -------------------------
# Delete Skill
# -------------------------
@router.delete("/{skill_id}")
def delete_skill(
    skill_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("DELETE_SKILL")),
):

    return service.delete_skill(
        db=db,
        skill_id=skill_id,
        current_user=current_user,
    )
