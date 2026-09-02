from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.offer_schema import (
    OfferCreate,
    OfferUpdate,
)
from app.permission_dependency import require_permission
from app.services.offer_service import OfferService

router = APIRouter(
    prefix="/offers",
    tags=["Offers"],
)

service = OfferService()


# ==================================================
# GET ALL OFFERS
# ==================================================
@router.get("/")
def get_all_offers(
    search: str = "",
    application_id: int | None = None,
    department_id: int | None = None,
    job_opening_id: int | None = None,
    offer_status: str | None = None,
    sort_by: str = "CreatedOn",
    order: str = "desc",
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_OFFER")),
):
    return service.get_all_offers(
        db=db,
        current_user=current_user,
        search=search,
        application_id=application_id,
        department_id=department_id,
        job_opening_id=job_opening_id,
        offer_status=offer_status,
        sort_by=sort_by,
        order=order,
        page=page,
        page_size=page_size,
    )


# ==================================================
# GET OFFER BY APPLICATION
# ==================================================
@router.get("/by-application/{application_id}")
def get_offer_by_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_OFFER")),
):
    return service.get_offer_by_application(
        db=db,
        application_id=application_id,
        current_user=current_user,
    )


# ==================================================
# GET OFFER BY ID
# ==================================================
@router.get("/{offer_id}")
def get_offer(
    offer_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_OFFER")),
):
    return service.get_offer_by_id(
        db=db,
        offer_id=offer_id,
        current_user=current_user,
    )


# ==================================================
# CREATE OFFER
# ==================================================
@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
def create_offer(
    offer: OfferCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("CREATE_OFFER")),
):
    return service.create_offer(
        db=db,
        offer=offer,
        current_user=current_user,
    )


# ==================================================
# UPDATE OFFER
# ==================================================
@router.put("/{offer_id}")
def update_offer(
    offer_id: int,
    offer: OfferUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("UPDATE_OFFER")),
):
    return service.update_offer(
        db=db,
        offer_id=offer_id,
        offer=offer,
        current_user=current_user,
    )


# ==================================================
# DELETE OFFER
# ==================================================
@router.delete("/{offer_id}")
def delete_offer(
    offer_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("DELETE_OFFER")),
):
    return service.delete_offer(
        db=db,
        offer_id=offer_id,
        current_user=current_user,
    )
