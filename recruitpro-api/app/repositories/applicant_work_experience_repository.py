from sqlalchemy.orm import Session
from app.models.applicant_work_experience import ApplicantWorkExperience
from app.schemas.applicant_work_experience_schema import (
    ApplicantWorkExperienceCreate,
    ApplicantWorkExperienceUpdate,
)

class ApplicantWorkExperienceRepository:
    # ==================================================
    # GET ALL WORK EXPERIENCES FOR APPLICANT
    # ==================================================
    def get_all(
        self,
        db: Session,
        applicant_id: int,
        company_id: int,
    ):
        return (
            db.query(ApplicantWorkExperience)
            .filter(
                ApplicantWorkExperience.ApplicantId == applicant_id,
                ApplicantWorkExperience.CompanyId == company_id,
            )
            .order_by(ApplicantWorkExperience.StartDate.desc())
            .all()
        )

    # ==================================================
    # GET WORK EXPERIENCE BY ID
    # ==================================================
    def get_by_id(
        self,
        db: Session,
        work_experience_id: int,
        company_id: int,
    ):
        return (
            db.query(ApplicantWorkExperience)
            .filter(
                ApplicantWorkExperience.WorkExperienceId == work_experience_id,
                ApplicantWorkExperience.CompanyId == company_id,
            )
            .first()
        )

    # ==================================================
    # CREATE
    # ==================================================
    def create(
        self,
        db: Session,
        work_experience: ApplicantWorkExperienceCreate,
        company_id: int,
    ):
        new_work_experience = ApplicantWorkExperience(
            CompanyId=company_id,
            ApplicantId=work_experience.ApplicantId,
            CompanyName=work_experience.CompanyName,
            Designation=work_experience.Designation,
            StartDate=work_experience.StartDate,
            EndDate=work_experience.EndDate,
            CurrentlyWorking=work_experience.CurrentlyWorking,
            Responsibilities=work_experience.Responsibilities,
        )
        db.add(new_work_experience)
        db.commit()
        db.refresh(new_work_experience)
        return new_work_experience

    # ==================================================
    # UPDATE
    # ==================================================
    def update(
        self,
        db: Session,
        work_experience_id: int,
        work_experience: ApplicantWorkExperienceUpdate,
        company_id: int,
    ):
        existing_work_experience = self.get_by_id(
            db=db,
            work_experience_id=work_experience_id,
            company_id=company_id,
        )
        if not existing_work_experience:
            return None
        existing_work_experience.CompanyName = work_experience.CompanyName
        existing_work_experience.Designation = work_experience.Designation
        existing_work_experience.StartDate = work_experience.StartDate
        existing_work_experience.EndDate = work_experience.EndDate
        existing_work_experience.CurrentlyWorking = work_experience.CurrentlyWorking
        existing_work_experience.Responsibilities = work_experience.Responsibilities
        db.commit()
        db.refresh(existing_work_experience)
        return existing_work_experience

    # ==================================================
    # DELETE
    # ==================================================
    def delete(
        self,
        db: Session,
        work_experience_id: int,
        company_id: int,
    ):
        work_experience = self.get_by_id(
            db=db,
            work_experience_id=work_experience_id,
            company_id=company_id,
        )
        if not work_experience:
            return None
        db.delete(work_experience)
        db.commit()
        return work_experience
