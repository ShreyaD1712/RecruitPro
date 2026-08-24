from sqlalchemy.orm import Session
from app.models.applicant_education import ApplicantEducation
from app.schemas.applicant_education_schema import (
    ApplicantEducationCreate,
    ApplicantEducationUpdate,
)


class ApplicantEducationRepository:
    # ==================================================
    # GET ALL EDUCATIONS FOR APPLICANT
    # ==================================================
    def get_all(
        self,
        db: Session,
        applicant_id: int,
        company_id: int,
    ):
        return (
            db.query(ApplicantEducation)
            .filter(
                ApplicantEducation.ApplicantId == applicant_id,
                ApplicantEducation.CompanyId == company_id,
            )
            .order_by(ApplicantEducation.PassingYear.desc())
            .all()
        )

    # ==================================================
    # GET EDUCATION BY ID
    # ==================================================
    def get_by_id(
        self,
        db: Session,
        education_id: int,
        company_id: int,
    ):
        return (
            db.query(ApplicantEducation)
            .filter(
                ApplicantEducation.EducationId == education_id,
                ApplicantEducation.CompanyId == company_id,
            )
            .first()
        )

    # ==================================================
    # CREATE
    # ==================================================
    def create(
        self,
        db: Session,
        education: ApplicantEducationCreate,
        company_id: int,
    ):
        new_education = ApplicantEducation(
            CompanyId=company_id,
            ApplicantId=education.ApplicantId,
            Degree=education.Degree,
            Institute=education.Institute,
            University=education.University,
            PassingYear=education.PassingYear,
            Percentage=education.Percentage,
        )
        db.add(new_education)
        db.commit()
        db.refresh(new_education)
        return new_education

    # ==================================================
    # UPDATE
    # ==================================================
    def update(
        self,
        db: Session,
        education_id: int,
        education: ApplicantEducationUpdate,
        company_id: int,
    ):
        existing_education = self.get_by_id(
            db=db,
            education_id=education_id,
            company_id=company_id,
        )
        if not existing_education:
            return None
        existing_education.Degree = education.Degree
        existing_education.Institute = education.Institute
        existing_education.University = education.University
        existing_education.PassingYear = education.PassingYear
        existing_education.Percentage = education.Percentage
        db.commit()
        db.refresh(existing_education)
        return existing_education

    # ==================================================
    # DELETE
    # ==================================================
    def delete(
        self,
        db: Session,
        education_id: int,
        company_id: int,
    ):
        education = self.get_by_id(
            db=db,
            education_id=education_id,
            company_id=company_id,
        )
        if not education:
            return None
        db.delete(education)
        db.commit()
        return education
