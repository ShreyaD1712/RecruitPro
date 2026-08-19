from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.applicant_repository import ApplicantRepository
from app.schemas.applicant_schema import (
    ApplicantCreate,
    ApplicantUpdate,
)


class ApplicantService:
    def __init__(self):
        self.repository = ApplicantRepository()

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
    # GET ALL APPLICANTS
    # ==================================================
    def get_all_applicants(
        self,
        db: Session,
        current_user: dict,
        search: str = "",
        sort_by: str = "CreatedOn",
        order: str = "desc",
        page: int = 1,
        page_size: int = 10,
    ):
        self.check_permission(
            current_user,
            "VIEW_APPLICANT",
        )
        company_id = self.get_company_id(current_user)
        return self.repository.get_all(
            db=db,
            company_id=company_id,
            search=search,
            sort_by=sort_by,
            order=order,
            page=page,
            page_size=page_size,
        )

    # ==================================================
    # GET APPLICANT BY ID
    # ==================================================
    def get_applicant_by_id(
        self,
        db: Session,
        applicant_id: int,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "VIEW_APPLICANT",
        )
        company_id = self.get_company_id(current_user)
        applicant = self.repository.get_by_id(
            db=db,
            applicant_id=applicant_id,
            company_id=company_id,
        )
        if not applicant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Applicant not found",
            )
        return applicant

    # ==================================================
    # CREATE APPLICANT
    # ==================================================
    def create_applicant(
        self,
        db: Session,
        applicant: ApplicantCreate,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "CREATE_APPLICANT",
        )
        # Company comes ONLY from logged-in user
        company_id = self.get_company_id(current_user)
        # ----------------------------------------------
        # Check Duplicate Email
        # ----------------------------------------------
        existing_email = self.repository.get_by_email(
            db=db,
            email=applicant.Email,
            company_id=company_id,
        )
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Applicant with this email already exists in your company",
            )
        # ----------------------------------------------
        # Check Duplicate Mobile
        # ----------------------------------------------
        existing_mobile = self.repository.get_by_mobile(
            db=db,
            mobile_no=applicant.MobileNo,
            company_id=company_id,
        )
        if existing_mobile:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Applicant with this mobile number already exists in your company",
            )
        # ----------------------------------------------
        # Create Applicant
        # ----------------------------------------------
        return self.repository.create(
            db=db,
            applicant=applicant,
            company_id=company_id,
            current_user=current_user,
        )

    # ==================================================
    # UPDATE APPLICANT
    # ==================================================
    def update_applicant(
        self,
        db: Session,
        applicant_id: int,
        applicant: ApplicantUpdate,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "UPDATE_APPLICANT",
        )
        company_id = self.get_company_id(current_user)
        # ----------------------------------------------
        # Find Existing Applicant
        # ----------------------------------------------
        existing = self.repository.get_by_id(
            db=db,
            applicant_id=applicant_id,
            company_id=company_id,
        )
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Applicant not found",
            )
        # ----------------------------------------------
        # Check Duplicate Email
        # ----------------------------------------------
        duplicate_email = self.repository.get_by_email(
            db=db,
            email=applicant.Email,
            company_id=company_id,
        )
        if duplicate_email and duplicate_email.ApplicantId != applicant_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Another applicant with this email already exists in your company",
            )
        # ----------------------------------------------
        # Check Duplicate Mobile
        # ----------------------------------------------
        duplicate_mobile = self.repository.get_by_mobile(
            db=db,
            mobile_no=applicant.MobileNo,
            company_id=company_id,
        )
        if duplicate_mobile and duplicate_mobile.ApplicantId != applicant_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Another applicant with this mobile number already exists in your company",
            )
        # ----------------------------------------------
        # Update Applicant
        # ----------------------------------------------
        return self.repository.update(
            db=db,
            applicant_id=applicant_id,
            applicant=applicant,
            current_user=current_user,
        )

    # ==================================================
    # DELETE APPLICANT
    # ==================================================
    def delete_applicant(
        self,
        db: Session,
        applicant_id: int,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "DELETE_APPLICANT",
        )
        company_id = self.get_company_id(current_user)
        # ----------------------------------------------
        # Check Existing Applicant
        # ----------------------------------------------
        existing = self.repository.get_by_id(
            db=db,
            applicant_id=applicant_id,
            company_id=company_id,
        )
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Applicant not found",
            )
        # ----------------------------------------------
        # Delete Applicant
        # ----------------------------------------------
        self.repository.delete(
            db=db,
            applicant_id=applicant_id,
            company_id=company_id,
        )
        return {"message": "Applicant deleted successfully"}
