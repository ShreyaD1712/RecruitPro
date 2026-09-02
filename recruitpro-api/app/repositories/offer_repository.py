from datetime import datetime
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.models.offer import Offer
from app.models.application import Application
from app.models.applicant import Applicant
from app.models.job_opening import JobOpening
from app.models.department import Department

from app.schemas.offer_schema import (
    OfferCreate,
    OfferUpdate,
)


class OfferRepository:

    # ==================================================
    # GET ALL OFFERS
    # ==================================================
    def get_all(
        self,
        db: Session,
        company_id: int,
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
        query = db.query(Offer).options(
            joinedload(Offer.application).joinedload(Application.applicant),
            joinedload(Offer.application)
            .joinedload(Application.job_opening)
            .joinedload(JobOpening.department),
            joinedload(Offer.application)
            .joinedload(Application.job_opening)
            .joinedload(JobOpening.designation),
        )

        # ==================================================
        # COMPANY FILTER
        # ==================================================
        query = query.filter(Offer.CompanyId == company_id)

        # ==================================================
        # APPLICATION FILTER
        # ==================================================
        if application_id is not None:
            query = query.filter(Offer.ApplicationId == application_id)

        # ==================================================
        # OFFER STATUS FILTER
        # ==================================================
        if offer_status and offer_status != "All":
            query = query.filter(Offer.OfferStatus == offer_status)

        # ==================================================
        # DEPARTMENT / JOB OPENING FILTER
        # ==================================================
        if department_id is not None or job_opening_id is not None:
            query = query.join(
                Application, Offer.ApplicationId == Application.ApplicationId
            ).join(JobOpening, Application.JobOpeningId == JobOpening.JobOpeningId)

            if department_id is not None:
                query = query.filter(JobOpening.DepartmentId == department_id)

            if job_opening_id is not None:
                query = query.filter(JobOpening.JobOpeningId == job_opening_id)

        # ==================================================
        # SEARCH
        # ==================================================
        if search:
            search_value = f"%{search}%"

            query = (
                query.join(
                    Application, Offer.ApplicationId == Application.ApplicationId
                )
                .join(Applicant, Application.ApplicantId == Applicant.ApplicantId)
                .join(JobOpening, Application.JobOpeningId == JobOpening.JobOpeningId)
                .filter(
                    or_(
                        Applicant.FirstName.ilike(search_value),
                        Applicant.LastName.ilike(search_value),
                        Applicant.Email.ilike(search_value),
                        JobOpening.JobTitle.ilike(search_value),
                        Offer.OfferStatus.ilike(search_value),
                        Offer.Remarks.ilike(search_value),
                    )
                )
            )

        # ==================================================
        # SORTING
        # ==================================================
        allowed_sort_columns = {
            "OfferId": Offer.OfferId,
            "ApplicationId": Offer.ApplicationId,
            "OfferedSalary": Offer.OfferedSalary,
            "JoiningDate": Offer.JoiningDate,
            "OfferDate": Offer.OfferDate,
            "OfferStatus": Offer.OfferStatus,
            "CreatedOn": Offer.CreatedOn,
            "UpdatedOn": Offer.UpdatedOn,
        }

        column = allowed_sort_columns.get(
            sort_by,
            Offer.CreatedOn,
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
    # GET OFFER BY ID
    # ==================================================
    def get_by_id(
        self,
        db: Session,
        offer_id: int,
        company_id: int,
    ):
        return (
            db.query(Offer)
            .options(
                joinedload(Offer.application).joinedload(Application.applicant),
                joinedload(Offer.application)
                .joinedload(Application.job_opening)
                .joinedload(JobOpening.department),
                joinedload(Offer.application)
                .joinedload(Application.job_opening)
                .joinedload(JobOpening.designation),
            )
            .filter(
                Offer.OfferId == offer_id,
                Offer.CompanyId == company_id,
            )
            .first()
        )

    # ==================================================
    # GET OFFER BY APPLICATION
    # ==================================================
    def get_by_application(
        self,
        db: Session,
        application_id: int,
        company_id: int,
    ):
        return (
            db.query(Offer)
            .filter(
                Offer.ApplicationId == application_id,
                Offer.CompanyId == company_id,
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
            .options(
                joinedload(Application.applicant),
                joinedload(Application.job_opening).joinedload(JobOpening.department),
                joinedload(Application.job_opening).joinedload(JobOpening.designation),
            )
            .filter(
                Application.ApplicationId == application_id,
                Application.CompanyId == company_id,
            )
            .first()
        )

    # ==================================================
    # CREATE
    # ==================================================
    def create(
        self,
        db: Session,
        offer: OfferCreate,
        company_id: int,
        current_user: dict,
    ):
        now = datetime.now()

        new_offer = Offer(
            CompanyId=company_id,
            ApplicationId=offer.ApplicationId,
            OfferedSalary=offer.OfferedSalary,
            JoiningDate=offer.JoiningDate,
            OfferDate=offer.OfferDate,
            OfferStatus=offer.OfferStatus,
            Remarks=offer.Remarks,
            CreatedOn=now,
            CreatedBy=current_user["user_id"],
            UpdatedOn=now,
            UpdatedBy=current_user["user_id"],
        )

        db.add(new_offer)
        db.commit()
        db.refresh(new_offer)

        return self.get_by_id(
            db=db,
            offer_id=new_offer.OfferId,
            company_id=company_id,
        )

    # ==================================================
    # UPDATE
    # ==================================================
    def update(
        self,
        db: Session,
        offer_id: int,
        offer: OfferUpdate,
        current_user: dict,
    ):
        existing_offer = self.get_by_id(
            db=db,
            offer_id=offer_id,
            company_id=current_user["company_id"],
        )

        if not existing_offer:
            return None

        # ApplicationId stays linked to same application
        existing_offer.OfferedSalary = offer.OfferedSalary
        existing_offer.JoiningDate = offer.JoiningDate
        existing_offer.OfferDate = offer.OfferDate
        existing_offer.OfferStatus = offer.OfferStatus
        existing_offer.Remarks = offer.Remarks
        existing_offer.UpdatedOn = datetime.now()
        existing_offer.UpdatedBy = current_user["user_id"]

        db.commit()
        db.refresh(existing_offer)

        return self.get_by_id(
            db=db,
            offer_id=offer_id,
            company_id=current_user["company_id"],
        )

    # ==================================================
    # DELETE
    # ==================================================
    def delete(
        self,
        db: Session,
        offer_id: int,
        company_id: int,
    ):
        offer = self.get_by_id(
            db=db,
            offer_id=offer_id,
            company_id=company_id,
        )

        if not offer:
            return None

        db.delete(offer)
        db.commit()

        return offer
