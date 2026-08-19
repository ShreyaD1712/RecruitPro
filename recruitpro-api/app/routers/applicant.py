from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.applicant_schema import (
    ApplicantCreate,
    ApplicantUpdate,
)
from app.permission_dependency import require_permission
from app.services.applicant_service import ApplicantService

router = APIRouter(
    prefix="/applicants",
    tags=["Applicants"],
)
service = ApplicantService()


# ==================================================
# Get All Applicants
# ==================================================
@router.get("/")
def get_all_applicants(
    search: str = "",
    sort_by: str = "CreatedOn",
    order: str = "desc",
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_APPLICANT")),
):
    return service.get_all_applicants(
        db=db,
        current_user=current_user,
        search=search,
        sort_by=sort_by,
        order=order,
        page=page,
        page_size=page_size,
    )


# ==================================================
# Get Applicant By ID
# ==================================================
@router.get("/{applicant_id}")
def get_applicant(
    applicant_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_APPLICANT")),
):
    return service.get_applicant_by_id(
        db=db,
        applicant_id=applicant_id,
        current_user=current_user,
    )


# ==================================================
# Create Applicant
# ==================================================
@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
def create_applicant(
    applicant: ApplicantCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("CREATE_APPLICANT")),
):
    return service.create_applicant(
        db=db,
        applicant=applicant,
        current_user=current_user,
    )


# ==================================================
# Update Applicant
# ==================================================
@router.put("/{applicant_id}")
def update_applicant(
    applicant_id: int,
    applicant: ApplicantUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("UPDATE_APPLICANT")),
):
    return service.update_applicant(
        db=db,
        applicant_id=applicant_id,
        applicant=applicant,
        current_user=current_user,
    )


# ==================================================
# Delete Applicant
# ==================================================
@router.delete("/{applicant_id}")
def delete_applicant(
    applicant_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("DELETE_APPLICANT")),
):
    return service.delete_applicant(
        db=db,
        applicant_id=applicant_id,
        current_user=current_user,
    )
