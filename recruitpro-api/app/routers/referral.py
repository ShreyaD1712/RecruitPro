from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.referral_schema import (
    ReferralCreate,
    ReferralUpdate,
)
from app.permission_dependency import require_permission
from app.services.referral_service import ReferralService

router = APIRouter(
    prefix="/referrals",
    tags=["Referrals"],
)

service = ReferralService()


# ==================================================
# GET ALL REFERRALS
# ==================================================
@router.get("/")
def get_all_referrals(
    search: str = "",
    application_id: int | None = None,
    applicant_id: int | None = None,
    referred_only: bool | None = None,
    sort_by: str = "ReferralDate",
    order: str = "desc",
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_REFERRAL")),
):
    return service.get_all_referrals(
        db=db,
        current_user=current_user,
        search=search,
        application_id=application_id,
        applicant_id=applicant_id,
        referred_only=referred_only,
        sort_by=sort_by,
        order=order,
        page=page,
        page_size=page_size,
    )


# ==================================================
# GET REFERRAL BY ID
# ==================================================
@router.get("/{referral_id}")
def get_referral(
    referral_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_REFERRAL")),
):
    return service.get_referral_by_id(
        db=db,
        referral_id=referral_id,
        current_user=current_user,
    )


# ==================================================
# CREATE REFERRAL
# ==================================================
@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
def create_referral(
    referral: ReferralCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("CREATE_REFERRAL")),
):
    return service.create_referral(
        db=db,
        referral=referral,
        current_user=current_user,
    )


# ==================================================
# UPDATE REFERRAL
# ==================================================
@router.put("/{referral_id}")
def update_referral(
    referral_id: int,
    referral: ReferralUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("UPDATE_REFERRAL")),
):
    return service.update_referral(
        db=db,
        referral_id=referral_id,
        referral=referral,
        current_user=current_user,
    )


# ==================================================
# DELETE REFERRAL
# ==================================================
@router.delete("/{referral_id}")
def delete_referral(
    referral_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("DELETE_REFERRAL")),
):
    return service.delete_referral(
        db=db,
        referral_id=referral_id,
        current_user=current_user,
    )
