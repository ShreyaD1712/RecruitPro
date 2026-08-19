from datetime import datetime
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload
from app.models.applicant import Applicant
from app.schemas.applicant_schema import (
    ApplicantCreate,
    ApplicantUpdate,
)


class ApplicantRepository:
    # ==================================================
    # Get All Applicants
    # ==================================================
    def get_all(
        self,
        db: Session,
        company_id: int,
        search: str = "",
        sort_by: str = "CreatedOn",
        order: str = "desc",
        page: int = 1,
        page_size: int = 10,
    ):
        query = db.query(Applicant).options(
            joinedload(Applicant.company),
        )
        # ==================================================
        # COMPANY FILTER
        # ==================================================
        query = query.filter(Applicant.CompanyId == company_id)
        # ==================================================
        # SEARCH
        # ==================================================
        if search:
            query = query.filter(
                or_(
                    Applicant.FirstName.ilike(f"%{search}%"),
                    Applicant.LastName.ilike(f"%{search}%"),
                    Applicant.Email.ilike(f"%{search}%"),
                    Applicant.MobileNo.ilike(f"%{search}%"),
                    Applicant.CurrentCompany.ilike(f"%{search}%"),
                    Applicant.CurrentCity.ilike(f"%{search}%"),
                )
            )
        # ==================================================
        # SORTING
        # ==================================================
        allowed_sort_columns = {
            "FirstName": Applicant.FirstName,
            "LastName": Applicant.LastName,
            "Email": Applicant.Email,
            "CurrentCompany": Applicant.CurrentCompany,
            "CurrentCity": Applicant.CurrentCity,
            "CreatedOn": Applicant.CreatedOn,
        }
        column = allowed_sort_columns.get(
            sort_by,
            Applicant.CreatedOn,
        )
        if order.lower() == "desc":
            query = query.order_by(column.desc())
        else:
            query = query.order_by(column.asc())
        # ==================================================
        # TOTAL RECORDS
        # ==================================================
        total_records = query.count()
        # ==================================================
        # PAGINATION
        # ==================================================
        data = query.offset((page - 1) * page_size).limit(page_size).all()
        return {
            "total_records": total_records,
            "page": page,
            "page_size": page_size,
            "data": data,
        }

    # ==================================================
    # Get Applicant By ID
    # ==================================================
    def get_by_id(
        self,
        db: Session,
        applicant_id: int,
        company_id: int,
    ):
        return (
            db.query(Applicant)
            .options(
                joinedload(Applicant.company),
            )
            .filter(
                Applicant.ApplicantId == applicant_id,
                Applicant.CompanyId == company_id,
            )
            .first()
        )

    # ==================================================
    # Get Applicant By Email
    # ==================================================
    def get_by_email(
        self,
        db: Session,
        email: str,
        company_id: int,
    ):
        return (
            db.query(Applicant)
            .options(
                joinedload(Applicant.company),
            )
            .filter(
                Applicant.Email == email,
                Applicant.CompanyId == company_id,
            )
            .first()
        )

    # ==================================================
    # Get Applicant By Mobile
    # ==================================================
    def get_by_mobile(
        self,
        db: Session,
        mobile_no: str,
        company_id: int,
    ):
        return (
            db.query(Applicant)
            .options(
                joinedload(Applicant.company),
            )
            .filter(
                Applicant.MobileNo == mobile_no,
                Applicant.CompanyId == company_id,
            )
            .first()
        )

    # ==================================================
    # CREATE
    # ==================================================
    def create(
        self,
        db: Session,
        applicant: ApplicantCreate,
        company_id: int,
        current_user: dict,
    ):
        now = datetime.now()
        new_applicant = Applicant(
            # ==================================================
            # COMPANY
            # ==================================================
            # CompanyId NEVER comes from Angular.
            # It comes from logged-in user.
            CompanyId=company_id,
            # ==================================================
            # PERSONAL INFORMATION
            # ==================================================
            FirstName=applicant.FirstName,
            LastName=applicant.LastName,
            Email=applicant.Email,
            MobileNo=applicant.MobileNo,
            DOB=applicant.DOB,
            Gender=applicant.Gender,
            CurrentCity=applicant.CurrentCity,
            # ==================================================
            # PROFESSIONAL INFORMATION
            # ==================================================
            CurrentCompany=applicant.CurrentCompany,
            CurrentCTC=applicant.CurrentCTC,
            ExpectedCTC=applicant.ExpectedCTC,
            NoticePeriod=applicant.NoticePeriod,
            LinkedInUrl=applicant.LinkedInUrl,
            # ==================================================
            # AUDIT
            # ==================================================
            CreatedOn=now,
            CreatedBy=current_user["user_id"],
            UpdatedOn=now,
            UpdatedBy=current_user["user_id"],
        )
        db.add(new_applicant)
        db.commit()
        db.refresh(new_applicant)
        return new_applicant

    # ==================================================
    # UPDATE
    # ==================================================
    def update(
        self,
        db: Session,
        applicant_id: int,
        applicant: ApplicantUpdate,
        current_user: dict,
    ):
        # ==================================================
        # GET EXISTING APPLICANT
        # ==================================================
        existing_applicant = self.get_by_id(
            db=db,
            applicant_id=applicant_id,
            company_id=current_user["company_id"],
        )
        # ==================================================
        # SECURITY CHECK
        # ==================================================
        if not existing_applicant:
            return None
        # ==================================================
        # COMPANY ID IS NEVER CHANGED
        # ==================================================
        existing_applicant.FirstName = applicant.FirstName
        existing_applicant.LastName = applicant.LastName
        existing_applicant.Email = applicant.Email
        existing_applicant.MobileNo = applicant.MobileNo
        existing_applicant.DOB = applicant.DOB
        existing_applicant.Gender = applicant.Gender
        existing_applicant.CurrentCity = applicant.CurrentCity
        # ==================================================
        # PROFESSIONAL INFORMATION
        # ==================================================
        existing_applicant.CurrentCompany = applicant.CurrentCompany
        existing_applicant.CurrentCTC = applicant.CurrentCTC
        existing_applicant.ExpectedCTC = applicant.ExpectedCTC
        existing_applicant.NoticePeriod = applicant.NoticePeriod
        existing_applicant.LinkedInUrl = applicant.LinkedInUrl
        # ==================================================
        # NO STATUS
        # ==================================================
        # Applicant does not contain Status.
        # Status belongs to Application.
        # ==================================================
        # AUDIT
        # ==================================================
        existing_applicant.UpdatedOn = datetime.now()
        existing_applicant.UpdatedBy = current_user["user_id"]
        db.commit()
        db.refresh(existing_applicant)
        return existing_applicant

    # ==================================================
    # DELETE
    # ==================================================
    def delete(
        self,
        db: Session,
        applicant_id: int,
        company_id: int,
    ):
        # ==================================================
        # GET APPLICANT WITH COMPANY CHECK
        # ==================================================
        applicant = self.get_by_id(
            db=db,
            applicant_id=applicant_id,
            company_id=company_id,
        )
        # ==================================================
        # SECURITY CHECK
        # ==================================================
        if not applicant:
            return None
        # ==================================================
        # DELETE
        # ==================================================
        db.delete(applicant)
        db.commit()
        return applicant
