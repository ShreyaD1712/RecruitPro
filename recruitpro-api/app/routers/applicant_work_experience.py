from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.permission_dependency import require_permission
from app.schemas.applicant_work_experience_schema import (
    ApplicantWorkExperienceCreate,
    ApplicantWorkExperienceUpdate,
)
from app.services.applicant_work_experience_service import (
    ApplicantWorkExperienceService,
)

router = APIRouter(
    prefix="/applicant-work-experiences",
    tags=["Applicant Work Experience"],
)
service = ApplicantWorkExperienceService()


# ==================================================
# GET ALL WORK EXPERIENCES FOR APPLICANT
# ==================================================
@router.get("/")
def get_all_work_experiences(
    applicant_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_APPLICANT")),
):
    return service.get_all(
        db=db,
        applicant_id=applicant_id,
        current_user=current_user,
    )


# ==================================================
# GET WORK EXPERIENCE BY ID
# ==================================================
@router.get("/{work_experience_id}")
def get_work_experience(
    work_experience_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_APPLICANT")),
):
    return service.get_by_id(
        db=db,
        work_experience_id=work_experience_id,
        current_user=current_user,
    )


# ==================================================
# CREATE WORK EXPERIENCE
# ==================================================
@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
def create_work_experience(
    work_experience: ApplicantWorkExperienceCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("CREATE_APPLICANT")),
):
    return service.create(
        db=db,
        work_experience=work_experience,
        current_user=current_user,
    )


# ==================================================
# UPDATE WORK EXPERIENCE
# ==================================================
@router.put("/{work_experience_id}")
def update_work_experience(
    work_experience_id: int,
    work_experience: ApplicantWorkExperienceUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("UPDATE_APPLICANT")),
):
    return service.update(
        db=db,
        work_experience_id=work_experience_id,
        work_experience=work_experience,
        current_user=current_user,
    )


# ==================================================
# DELETE WORK EXPERIENCE
# ==================================================
@router.delete("/{work_experience_id}")
def delete_work_experience(
    work_experience_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("UPDATE_APPLICANT")),
):
    return service.delete(
        db=db,
        work_experience_id=work_experience_id,
        current_user=current_user,
    )
