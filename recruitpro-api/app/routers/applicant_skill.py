from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.permission_dependency import require_permission
from app.schemas.applicant_skill_schema import (
    ApplicantSkillCreate,
    ApplicantSkillUpdate,
)
from app.services.applicant_skill_service import ApplicantSkillService

router = APIRouter(
    prefix="/applicant-skills",
    tags=["Applicant Skills"],
)
service = ApplicantSkillService()


# ==================================================
# GET ALL APPLICANT SKILLS
# ==================================================
@router.get("/")
def get_all_applicant_skills(
    applicant_id: int | None = None,
    search: str = "",
    sort_by: str = "ApplicantSkillId",
    order: str = "desc",
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_APPLICANT")),
):
    return service.get_all_applicant_skills(
        db=db,
        current_user=current_user,
        applicant_id=applicant_id,
        search=search,
        sort_by=sort_by,
        order=order,
        page=page,
        page_size=page_size,
    )


# ==================================================
# GET APPLICANT SKILL BY ID
# ==================================================
@router.get("/{applicant_skill_id}")
def get_applicant_skill(
    applicant_skill_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_APPLICANT")),
):
    return service.get_applicant_skill_by_id(
        db=db,
        applicant_skill_id=applicant_skill_id,
        current_user=current_user,
    )


# ==================================================
# CREATE APPLICANT SKILL
# ==================================================
@router.post("/", status_code=status.HTTP_201_CREATED)
def create_applicant_skill(
    applicant_skill: ApplicantSkillCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("CREATE_APPLICANT")),
):
    return service.create_applicant_skill(
        db=db,
        applicant_skill=applicant_skill,
        current_user=current_user,
    )


# ==================================================
# UPDATE APPLICANT SKILL
# ==================================================
@router.put("/{applicant_skill_id}")
def update_applicant_skill(
    applicant_skill_id: int,
    applicant_skill: ApplicantSkillUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("UPDATE_APPLICANT")),
):
    return service.update_applicant_skill(
        db=db,
        applicant_skill_id=applicant_skill_id,
        applicant_skill=applicant_skill,
        current_user=current_user,
    )


# ==================================================
# DELETE APPLICANT SKILL
# ==================================================
@router.delete("/{applicant_skill_id}")
def delete_applicant_skill(
    applicant_skill_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("DELETE_APPLICANT")),
):
    return service.delete_applicant_skill(
        db=db,
        applicant_skill_id=applicant_skill_id,
        current_user=current_user,
    )
