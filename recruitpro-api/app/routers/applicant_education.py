from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.permission_dependency import require_permission
from app.schemas.applicant_education_schema import (
    ApplicantEducationCreate,
    ApplicantEducationUpdate,
)
from app.services.applicant_education_service import (
    ApplicantEducationService,
)

router = APIRouter(
    prefix="/applicant-educations",
    tags=["Applicant Education"],
)
service = ApplicantEducationService()


# ==================================================
# GET ALL EDUCATION FOR APPLICANT
# ==================================================
@router.get("/")
def get_all_education(
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
# GET EDUCATION BY ID
# ==================================================
@router.get("/{education_id}")
def get_education(
    education_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_APPLICANT")),
):
    return service.get_by_id(
        db=db,
        education_id=education_id,
        current_user=current_user,
    )


# ==================================================
# CREATE EDUCATION
# ==================================================
@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
def create_education(
    education: ApplicantEducationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("CREATE_APPLICANT")),
):
    return service.create(
        db=db,
        education=education,
        current_user=current_user,
    )


# ==================================================
# UPDATE EDUCATION
# ==================================================
@router.put("/{education_id}")
def update_education(
    education_id: int,
    education: ApplicantEducationUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("UPDATE_APPLICANT")),
):
    return service.update(
        db=db,
        education_id=education_id,
        education=education,
        current_user=current_user,
    )


# ==================================================
# DELETE EDUCATION
# ==================================================
@router.delete("/{education_id}")
def delete_education(
    education_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("UPDATE_APPLICANT")),
):
    return service.delete(
        db=db,
        education_id=education_id,
        current_user=current_user,
    )
