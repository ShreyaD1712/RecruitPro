from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.referral_repository import ReferralRepository
from app.schemas.referral_schema import (
    ReferralCreate,
    ReferralUpdate,
)


class ReferralService:
    def __init__(self):
        self.repository = ReferralRepository()

    # ==================================================
    # PERMISSION CHECK
    # ==================================================
    def check_permission(
        self,
        current_user: dict,
        permission: str,
    ):
        user_permissions = current_user.get("permissions", [])

        if permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )

    # ==================================================
    # GET COMPANY ID
    # ==================================================
    def get_company_id(
        self,
        current_user: dict,
    ):
        company_id = current_user.get("company_id")

        if not company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Company information not found for the current user",
            )

        return company_id

    # ==================================================
    # GET ALL REFERRALS
    # ==================================================
    def get_all_referrals(
        self,
        db: Session,
        current_user: dict,
        search: str = "",
        application_id: int | None = None,
        applicant_id: int | None = None,
        referred_only: bool | None = None,
        sort_by: str = "ReferralDate",
        order: str = "desc",
        page: int = 1,
        page_size: int = 10,
    ):
        self.check_permission(
            current_user,
            "VIEW_REFERRAL",
        )

        company_id = self.get_company_id(current_user)

        return self.repository.get_all(
            db=db,
            company_id=company_id,
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
    def get_referral_by_id(
        self,
        db: Session,
        referral_id: int,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "VIEW_REFERRAL",
        )

        company_id = self.get_company_id(current_user)

        referral = self.repository.get_by_id(
            db=db,
            referral_id=referral_id,
            company_id=company_id,
        )

        if not referral:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Referral not found",
            )

        return referral

    # ==================================================
    # CREATE REFERRAL
    # ==================================================
    def create_referral(
        self,
        db: Session,
        referral: ReferralCreate,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "CREATE_REFERRAL",
        )

        company_id = self.get_company_id(current_user)

        # ==================================================
        # CHECK APPLICATION
        # ==================================================
        application = self.repository.get_application(
            db=db,
            application_id=referral.ApplicationId,
            company_id=company_id,
        )

        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found in your company",
            )

        # ==================================================
        # CHECK APPLICANT
        # ==================================================
        applicant = self.repository.get_applicant(
            db=db,
            applicant_id=referral.ApplicantId,
            company_id=company_id,
        )

        if not applicant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Applicant not found in your company",
            )

        # ==================================================
        # APPLICATION + APPLICANT MATCH
        # ==================================================
        if application.ApplicantId != referral.ApplicantId:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Applicant does not belong to the selected application",
            )

        # ==================================================
        # DUPLICATE REFERRAL CHECK
        # ==================================================
        # Every application should have only one
        # Referral row.
        # ==================================================
        existing_referral = self.repository.get_by_application(
            db=db,
            application_id=referral.ApplicationId,
            company_id=company_id,
        )

        if existing_referral:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Referral record already exists for this application",
            )

        # ==================================================
        # CHECK REFERRER USER
        # ==================================================
        # ReferrerUserId = NULL means
        # application is not referred.
        # ==================================================
        if referral.ReferrerUserId is not None:

            referrer = self.repository.get_referrer_user(
                db=db,
                referrer_user_id=referral.ReferrerUserId,
                company_id=company_id,
            )

            if not referrer:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Referrer user not found in your company",
                )

        # ==================================================
        # CREATE REFERRAL
        # ==================================================
        return self.repository.create(
            db=db,
            referral=referral,
            company_id=company_id,
            current_user=current_user,
        )

    # ==================================================
    # UPDATE REFERRAL
    # ==================================================
    def update_referral(
        self,
        db: Session,
        referral_id: int,
        referral: ReferralUpdate,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "UPDATE_REFERRAL",
        )

        company_id = self.get_company_id(current_user)

        # ==================================================
        # CHECK EXISTING REFERRAL
        # ==================================================
        existing = self.repository.get_by_id(
            db=db,
            referral_id=referral_id,
            company_id=company_id,
        )

        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Referral not found",
            )

        # ==================================================
        # CHECK APPLICATION
        # ==================================================
        application = self.repository.get_application(
            db=db,
            application_id=referral.ApplicationId,
            company_id=company_id,
        )

        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found in your company",
            )

        # ==================================================
        # CHECK APPLICANT
        # ==================================================
        applicant = self.repository.get_applicant(
            db=db,
            applicant_id=referral.ApplicantId,
            company_id=company_id,
        )

        if not applicant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Applicant not found in your company",
            )

        # ==================================================
        # APPLICATION + APPLICANT MATCH
        # ==================================================
        if application.ApplicantId != referral.ApplicantId:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Applicant does not belong to the selected application",
            )

        # ==================================================
        # DUPLICATE APPLICATION CHECK
        # ==================================================
        duplicate = self.repository.get_by_application(
            db=db,
            application_id=referral.ApplicationId,
            company_id=company_id,
        )

        if duplicate and duplicate.ReferralId != referral_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Referral record already exists for this application",
            )

        # ==================================================
        # CHECK REFERRER USER
        # ==================================================
        if referral.ReferrerUserId is not None:

            referrer = self.repository.get_referrer_user(
                db=db,
                referrer_user_id=referral.ReferrerUserId,
                company_id=company_id,
            )

            if not referrer:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Referrer user not found in your company",
                )

        # ==================================================
        # UPDATE REFERRAL
        # ==================================================
        updated_referral = self.repository.update(
            db=db,
            referral_id=referral_id,
            referral=referral,
            current_user=current_user,
        )

        if not updated_referral:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Referral not found",
            )

        return updated_referral

    # ==================================================
    # DELETE REFERRAL
    # ==================================================
    def delete_referral(
        self,
        db: Session,
        referral_id: int,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "DELETE_REFERRAL",
        )

        company_id = self.get_company_id(current_user)

        # ==================================================
        # CHECK EXISTING REFERRAL
        # ==================================================
        existing = self.repository.get_by_id(
            db=db,
            referral_id=referral_id,
            company_id=company_id,
        )

        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Referral not found",
            )

        # ==================================================
        # DELETE REFERRAL
        # ==================================================
        self.repository.delete(
            db=db,
            referral_id=referral_id,
            company_id=company_id,
        )

        return {"message": "Referral deleted successfully"}
