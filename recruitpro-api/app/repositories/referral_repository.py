from datetime import datetime
from sqlalchemy import or_
from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload
from app.models.referral import Referral
from app.models.applicant import Applicant
from app.models.application import Application
from app.models.user import User

from app.schemas.referral_schema import (
    ReferralCreate,
    ReferralUpdate,
)


class ReferralRepository:

    # ==================================================
    # GET ALL REFERRALS
    # ==================================================
    def get_all(
        self,
        db: Session,
        company_id: int,
        search: str = "",
        application_id: int | None = None,
        applicant_id: int | None = None,
        referred_only: bool | None = None,
        sort_by: str = "ReferralDate",
        order: str = "desc",
        page: int = 1,
        page_size: int = 10,
    ):

        query = db.query(Referral).options(
            joinedload(Referral.applicant),
            joinedload(Referral.referrer),
            joinedload(Referral.application).joinedload(Application.job_opening),
        )

        # ==================================================
        # COMPANY FILTER
        # ==================================================

        query = query.filter(Referral.CompanyId == company_id)

        # ==================================================
        # APPLICATION FILTER
        # ==================================================

        if application_id is not None:
            query = query.filter(Referral.ApplicationId == application_id)

        # ==================================================
        # APPLICANT FILTER
        # ==================================================

        if applicant_id is not None:
            query = query.filter(Referral.ApplicantId == applicant_id)

        # ==================================================
        # REFERRED / NOT REFERRED FILTER
        # ==================================================

        if referred_only is True:
            query = query.filter(Referral.ReferrerUserId.isnot(None))

        elif referred_only is False:
            query = query.filter(Referral.ReferrerUserId.is_(None))

        # ==================================================
        # SEARCH
        # ==================================================

        if search:

            search_value = f"%{search}%"

            query = (
                query.outerjoin(
                    Applicant, Referral.ApplicantId == Applicant.ApplicantId
                )
                .outerjoin(User, Referral.ReferrerUserId == User.UserId)
                .filter(
                    or_(
                        Applicant.FirstName.ilike(search_value),
                        Applicant.LastName.ilike(search_value),
                        Applicant.Email.ilike(search_value),
                        User.FirstName.ilike(search_value),
                        User.LastName.ilike(search_value),
                    )
                )
            )

        # ==================================================
        # SORTING
        # ==================================================

        allowed_sort_columns = {
            "ReferralId": Referral.ReferralId,
            "ApplicationId": Referral.ApplicationId,
            "ApplicantId": Referral.ApplicantId,
            "ReferralDate": Referral.ReferralDate,
            "CreatedOn": Referral.CreatedOn,
        }

        column = allowed_sort_columns.get(
            sort_by,
            Referral.ReferralDate,
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
    # GET REFERRAL BY ID
    # ==================================================

    def get_by_id(
        self,
        db: Session,
        referral_id: int,
        company_id: int,
    ):

        return (
            db.query(Referral)
            .filter(
                Referral.ReferralId == referral_id,
                Referral.CompanyId == company_id,
            )
            .first()
        )

    # ==================================================
    # GET REFERRAL BY APPLICATION
    # ==================================================

    def get_by_application(
        self,
        db: Session,
        application_id: int,
        company_id: int,
    ):

        return (
            db.query(Referral)
            .filter(
                Referral.ApplicationId == application_id,
                Referral.CompanyId == company_id,
            )
            .first()
        )

    # ==================================================
    # GET APPLICANT
    # ==================================================

    def get_applicant(
        self,
        db: Session,
        applicant_id: int,
        company_id: int,
    ):

        return (
            db.query(Applicant)
            .filter(
                Applicant.ApplicantId == applicant_id,
                Applicant.CompanyId == company_id,
            )
            .first()
        )

    # ==================================================
    # GET APPLICATION
    # ==================================================

    def get_application(
        self,
        db: Session,
        application_id: int,
        company_id: int,
    ):

        return (
            db.query(Application)
            .filter(
                Application.ApplicationId == application_id,
                Application.CompanyId == company_id,
            )
            .first()
        )

    # ==================================================
    # GET REFERRER USER
    # ==================================================

    def get_referrer_user(
        self,
        db: Session,
        referrer_user_id: int,
        company_id: int,
    ):

        return (
            db.query(User)
            .filter(
                User.UserId == referrer_user_id,
                User.CompanyId == company_id,
            )
            .first()
        )

    # ==================================================
    # CREATE
    # ==================================================

    def create(
        self,
        db: Session,
        referral: ReferralCreate,
        company_id: int,
        current_user: dict,
    ):

        now = datetime.now()

        referral_date = now if referral.ReferrerUserId is not None else None

        new_referral = Referral(
            # ==================================================
            # COMPANY
            # ==================================================
            # CompanyId NEVER comes from Angular.
            # It comes from logged-in user.
            # ==================================================
            CompanyId=company_id,
            # ==================================================
            # APPLICATION
            # ==================================================
            ApplicationId=referral.ApplicationId,
            # ==================================================
            # APPLICANT
            # ==================================================
            ApplicantId=referral.ApplicantId,
            # ==================================================
            # REFERRER
            # ==================================================
            ReferrerUserId=referral.ReferrerUserId,
            # ==================================================
            # REFERRAL DETAILS
            # ==================================================
            ReferralDate=referral_date,
            Remarks=referral.Remarks,
            # ==================================================
            # AUDIT
            # ==================================================
            CreatedOn=now,
            CreatedBy=current_user["user_id"],
            UpdatedOn=now,
            UpdatedBy=current_user["user_id"],
        )

        db.add(new_referral)

        db.commit()

        db.refresh(new_referral)

        return new_referral

    # ==================================================
    # UPDATE
    # ==================================================

    def update(
        self,
        db: Session,
        referral_id: int,
        referral: ReferralUpdate,
        current_user: dict,
    ):

        # ==================================================
        # GET EXISTING REFERRAL
        # ==================================================

        existing_referral = self.get_by_id(
            db=db,
            referral_id=referral_id,
            company_id=current_user["company_id"],
        )

        # ==================================================
        # SECURITY CHECK
        # ==================================================

        if not existing_referral:
            return None

        # ==================================================
        # COMPANY ID IS NEVER CHANGED
        # ==================================================

        # ==================================================
        # APPLICATION
        # ==================================================

        existing_referral.ApplicationId = referral.ApplicationId

        # ==================================================
        # APPLICANT
        # ==================================================

        existing_referral.ApplicantId = referral.ApplicantId

        # ==================================================
        # REFERRER
        # ==================================================

        existing_referral.ReferrerUserId = referral.ReferrerUserId

        # ==================================================
        # REFERRAL DATE
        # ==================================================
        # If changed from Not Referred -> Referred,
        # set the current date.
        #
        # If changed to Not Referred,
        # clear ReferralDate.
        # ==================================================

        if referral.ReferrerUserId is None:

            existing_referral.ReferralDate = None

        elif existing_referral.ReferralDate is None:

            existing_referral.ReferralDate = datetime.now()

        # ==================================================
        # REMARKS
        # ==================================================

        existing_referral.Remarks = referral.Remarks

        # ==================================================
        # AUDIT
        # ==================================================

        existing_referral.UpdatedOn = datetime.now()

        existing_referral.UpdatedBy = current_user["user_id"]

        db.commit()

        db.refresh(existing_referral)

        return existing_referral

    # ==================================================
    # DELETE
    # ==================================================

    def delete(
        self,
        db: Session,
        referral_id: int,
        company_id: int,
    ):

        # ==================================================
        # GET REFERRAL WITH COMPANY CHECK
        # ==================================================

        referral = self.get_by_id(
            db=db,
            referral_id=referral_id,
            company_id=company_id,
        )

        # ==================================================
        # SECURITY CHECK
        # ==================================================

        if not referral:
            return None

        # ==================================================
        # DELETE
        # ==================================================

        db.delete(referral)

        db.commit()

        return referral
