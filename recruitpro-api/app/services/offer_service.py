from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.offer_repository import OfferRepository
from app.schemas.offer_schema import OfferCreate, OfferUpdate


class OfferService:

    def __init__(self):
        self.repository = OfferRepository()

    # ==================================================
    # PERMISSION CHECK
    # ==================================================
    def check_permission(self, current_user: dict, permission: str):
        if permission not in current_user.get("permissions", []):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )

    # ==================================================
    # GET COMPANY ID
    # ==================================================
    def get_company_id(self, current_user: dict):
        company_id = current_user.get("company_id")

        if not company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Company information not found for the current user",
            )

        return company_id

    # ==================================================
    # VALIDATE OFFER STATUS
    # ==================================================
    def validate_offer_status(self, offer_status: str | None):
        allowed_statuses = [
            "Draft",
            "Sent",
            "Accepted",
            "Rejected",
            "Withdrawn",
        ]

        if offer_status and offer_status not in allowed_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid offer status",
            )

    # ==================================================
    # VALIDATE DATES
    # ==================================================
    def validate_dates(self, offer_date, joining_date):
        if offer_date and joining_date and joining_date < offer_date:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Joining Date cannot be before Offer Date",
            )

    # ==================================================
    # GET ALL OFFERS
    # ==================================================
    def get_all_offers(
        self,
        db: Session,
        current_user: dict,
        search: str = "",
        application_id: int | None = None,
        department_id: int | None = None,
        job_opening_id: int | None = None,
        offer_status: str | None = None,
        sort_by: str = "CreatedOn",
        order: str = "desc",
        page: int = 1,
        page_size: int = 10,
    ):
        self.check_permission(current_user, "VIEW_OFFER")
        company_id = self.get_company_id(current_user)

        return self.repository.get_all(
            db=db,
            company_id=company_id,
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
    # GET OFFER BY ID
    # ==================================================
    def get_offer_by_id(
        self,
        db: Session,
        offer_id: int,
        current_user: dict,
    ):
        self.check_permission(current_user, "VIEW_OFFER")
        company_id = self.get_company_id(current_user)

        offer = self.repository.get_by_id(
            db=db,
            offer_id=offer_id,
            company_id=company_id,
        )

        if not offer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Offer not found",
            )

        return offer

    # ==================================================
    # GET OFFER BY APPLICATION
    # ==================================================
    def get_offer_by_application(
        self,
        db: Session,
        application_id: int,
        current_user: dict,
    ):
        self.check_permission(current_user, "VIEW_OFFER")
        company_id = self.get_company_id(current_user)

        application = self.repository.get_application(
            db=db,
            application_id=application_id,
            company_id=company_id,
        )

        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found in your company",
            )

        offer = self.repository.get_by_application(
            db=db,
            application_id=application_id,
            company_id=company_id,
        )

        if not offer:
            return {
                "exists": False,
                "offer": None,
            }

        return {
            "exists": True,
            "offer": offer,
        }

    # ==================================================
    # CREATE OFFER
    # ==================================================
    def create_offer(
        self,
        db: Session,
        offer: OfferCreate,
        current_user: dict,
    ):
        self.check_permission(current_user, "CREATE_OFFER")
        company_id = self.get_company_id(current_user)

        # ==================================================
        # CHECK APPLICATION
        # ==================================================
        application = self.repository.get_application(
            db=db,
            application_id=offer.ApplicationId,
            company_id=company_id,
        )

        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found in your company",
            )

        # ==================================================
        # APPLICATION MUST BE SELECTED
        # ==================================================
        if application.CurrentStatus != "Selected":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Offer can only be created for a selected application",
            )

        # ==================================================
        # DUPLICATE OFFER CHECK
        # ==================================================
        existing_offer = self.repository.get_by_application(
            db=db,
            application_id=offer.ApplicationId,
            company_id=company_id,
        )

        if existing_offer:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Offer already exists for this application",
            )

        # ==================================================
        # VALIDATE STATUS
        # ==================================================
        self.validate_offer_status(offer.OfferStatus)

        # ==================================================
        # VALIDATE DATES
        # ==================================================
        self.validate_dates(
            offer.OfferDate,
            offer.JoiningDate,
        )

        # ==================================================
        # CREATE OFFER
        # ==================================================
        return self.repository.create(
            db=db,
            offer=offer,
            company_id=company_id,
            current_user=current_user,
        )

    # ==================================================
    # UPDATE OFFER
    # ==================================================
    def update_offer(
        self,
        db: Session,
        offer_id: int,
        offer: OfferUpdate,
        current_user: dict,
    ):
        self.check_permission(current_user, "UPDATE_OFFER")
        company_id = self.get_company_id(current_user)

        # ==================================================
        # CHECK EXISTING OFFER
        # ==================================================
        existing_offer = self.repository.get_by_id(
            db=db,
            offer_id=offer_id,
            company_id=company_id,
        )

        if not existing_offer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Offer not found",
            )

        # ==================================================
        # CHECK APPLICATION
        # ==================================================
        application = self.repository.get_application(
            db=db,
            application_id=offer.ApplicationId,
            company_id=company_id,
        )

        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found in your company",
            )

        # ==================================================
        # APPLICATION CANNOT CHANGE
        # ==================================================
        if existing_offer.ApplicationId != offer.ApplicationId:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Application cannot be changed for an existing offer",
            )

        # ==================================================
        # VALIDATE STATUS
        # ==================================================
        self.validate_offer_status(offer.OfferStatus)

        # ==================================================
        # VALIDATE DATES
        # ==================================================
        self.validate_dates(
            offer.OfferDate,
            offer.JoiningDate,
        )

        # ==================================================
        # UPDATE OFFER
        # ==================================================
        updated_offer = self.repository.update(
            db=db,
            offer_id=offer_id,
            offer=offer,
            current_user=current_user,
        )

        if not updated_offer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Offer not found",
            )

        return updated_offer

    # ==================================================
    # DELETE OFFER
    # ==================================================
    def delete_offer(
        self,
        db: Session,
        offer_id: int,
        current_user: dict,
    ):
        self.check_permission(current_user, "DELETE_OFFER")
        company_id = self.get_company_id(current_user)

        existing_offer = self.repository.get_by_id(
            db=db,
            offer_id=offer_id,
            company_id=company_id,
        )

        if not existing_offer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Offer not found",
            )

        self.repository.delete(
            db=db,
            offer_id=offer_id,
            company_id=company_id,
        )

        return {"message": "Offer deleted successfully"}
