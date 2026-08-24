from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.applicant_education_repository import ApplicantEducationRepository
from app.repositories.applicant_repository import ApplicantRepository
from app.schemas.applicant_education_schema import (
    ApplicantEducationCreate,
    ApplicantEducationUpdate,
)


class ApplicantEducationService:
    def __init__(self):
        self.repository = ApplicantEducationRepository()
        self.applicant_repository = ApplicantRepository()

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
    # VERIFY APPLICANT
    # ==================================================
    def verify_applicant(
        self,
        db: Session,
        applicant_id: int,
        company_id: int,
    ):
        applicant = self.applicant_repository.get_by_id(
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
    # GET ALL EDUCATIONS
    # ==================================================
    def get_all(
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
        self.verify_applicant(
            db=db,
            applicant_id=applicant_id,
            company_id=company_id,
        )
        return self.repository.get_all(
            db=db,
            applicant_id=applicant_id,
            company_id=company_id,
        )

    # ==================================================
    # GET EDUCATION BY ID
    # ==================================================
    def get_by_id(
        self,
        db: Session,
        education_id: int,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "VIEW_APPLICANT",
        )
        company_id = self.get_company_id(current_user)
        education = self.repository.get_by_id(
            db=db,
            education_id=education_id,
            company_id=company_id,
        )
        if not education:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Education record not found",
            )
        return education

    # ==================================================
    # CREATE EDUCATION
    # ==================================================
    def create(
        self,
        db: Session,
        education: ApplicantEducationCreate,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "CREATE_APPLICANT",
        )
        company_id = self.get_company_id(current_user)
        # ----------------------------------------------
        # VERIFY APPLICANT BELONGS TO COMPANY
        # ----------------------------------------------
        self.verify_applicant(
            db=db,
            applicant_id=education.ApplicantId,
            company_id=company_id,
        )
        return self.repository.create(
            db=db,
            education=education,
            company_id=company_id,
        )

    # ==================================================
    # UPDATE EDUCATION
    # ==================================================
    def update(
        self,
        db: Session,
        education_id: int,
        education: ApplicantEducationUpdate,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "UPDATE_APPLICANT",
        )
        company_id = self.get_company_id(current_user)
        # ----------------------------------------------
        # VERIFY EDUCATION EXISTS
        # ----------------------------------------------
        existing = self.repository.get_by_id(
            db=db,
            education_id=education_id,
            company_id=company_id,
        )
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Education record not found",
            )
        return self.repository.update(
            db=db,
            education_id=education_id,
            education=education,
            company_id=company_id,
        )

    # ==================================================
    # DELETE EDUCATION
    # ==================================================
    def delete(
        self,
        db: Session,
        education_id: int,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "UPDATE_APPLICANT",
        )
        company_id = self.get_company_id(current_user)
        existing = self.repository.get_by_id(
            db=db,
            education_id=education_id,
            company_id=company_id,
        )
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Education record not found",
            )
        self.repository.delete(
            db=db,
            education_id=education_id,
            company_id=company_id,
        )
        return {"message": "Education deleted successfully"}
