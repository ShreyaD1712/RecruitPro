from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.applicant_work_experience_repository import (
    ApplicantWorkExperienceRepository,
)
from app.repositories.applicant_repository import ApplicantRepository
from app.schemas.applicant_work_experience_schema import (
    ApplicantWorkExperienceCreate,
    ApplicantWorkExperienceUpdate,
)


class ApplicantWorkExperienceService:
    def __init__(self):
        self.repository = ApplicantWorkExperienceRepository()
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
    # GET ALL WORK EXPERIENCES
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
        # ----------------------------------------------
        # VERIFY APPLICANT
        # ----------------------------------------------
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
    # GET WORK EXPERIENCE BY ID
    # ==================================================
    def get_by_id(
        self,
        db: Session,
        work_experience_id: int,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "VIEW_APPLICANT",
        )
        company_id = self.get_company_id(current_user)
        work_experience = self.repository.get_by_id(
            db=db,
            work_experience_id=work_experience_id,
            company_id=company_id,
        )
        if not work_experience:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Work experience record not found",
            )
        return work_experience

    # ==================================================
    # CREATE WORK EXPERIENCE
    # ==================================================
    def create(
        self,
        db: Session,
        work_experience: ApplicantWorkExperienceCreate,
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
            applicant_id=work_experience.ApplicantId,
            company_id=company_id,
        )
        # ----------------------------------------------
        # END DATE VALIDATION
        # ----------------------------------------------
        if work_experience.CurrentlyWorking:
            work_experience.EndDate = None
        else:
            if work_experience.EndDate is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="End date is required when applicant is not currently working.",
                )
            if work_experience.EndDate < work_experience.StartDate:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="End date cannot be earlier than start date.",
                )
        return self.repository.create(
            db=db,
            work_experience=work_experience,
            company_id=company_id,
        )

    # ==================================================
    # UPDATE WORK EXPERIENCE
    # ==================================================
    def update(
        self,
        db: Session,
        work_experience_id: int,
        work_experience: ApplicantWorkExperienceUpdate,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "UPDATE_APPLICANT",
        )
        company_id = self.get_company_id(current_user)
        # ----------------------------------------------
        # VERIFY WORK EXPERIENCE EXISTS
        # ----------------------------------------------
        existing = self.repository.get_by_id(
            db=db,
            work_experience_id=work_experience_id,
            company_id=company_id,
        )
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Work experience record not found",
            )
        # ----------------------------------------------
        # END DATE VALIDATION
        # ----------------------------------------------
        if work_experience.CurrentlyWorking:
            work_experience.EndDate = None
        else:
            if work_experience.EndDate is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="End date is required when applicant is not currently working.",
                )
            if work_experience.EndDate < work_experience.StartDate:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="End date cannot be earlier than start date.",
                )
        return self.repository.update(
            db=db,
            work_experience_id=work_experience_id,
            work_experience=work_experience,
            company_id=company_id,
        )

    # ==================================================
    # DELETE WORK EXPERIENCE
    # ==================================================
    def delete(
        self,
        db: Session,
        work_experience_id: int,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "UPDATE_APPLICANT",
        )
        company_id = self.get_company_id(current_user)
        # ----------------------------------------------
        # VERIFY WORK EXPERIENCE EXISTS
        # ----------------------------------------------
        existing = self.repository.get_by_id(
            db=db,
            work_experience_id=work_experience_id,
            company_id=company_id,
        )
        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Work experience record not found",
            )
        self.repository.delete(
            db=db,
            work_experience_id=work_experience_id,
            company_id=company_id,
        )
        return {"message": "Work experience deleted successfully"}
