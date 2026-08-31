from datetime import datetime
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload
from app.models.interview import Interview
from app.models.application import Application
from app.models.applicant import Applicant
from app.models.job_opening import JobOpening
from app.models.interview_round import InterviewRound
from app.models.user import User
from app.schemas.interview_schema import (
    InterviewCreate,
    InterviewUpdate,
)


class InterviewRepository:
    # ==================================================
    # GET ALL INTERVIEWS
    # ==================================================
    def get_all(
        self,
        db: Session,
        company_id: int,
        search: str = "",
        application_id: int | None = None,
        interview_round_id: int | None = None,
        interviewer_id: int | None = None,
        interview_status: str | None = None,
        sort_by: str = "InterviewDate",
        order: str = "desc",
        page: int = 1,
        page_size: int = 10,
    ):
        query = db.query(Interview).options(
            joinedload(Interview.application).joinedload(Application.applicant),
            joinedload(Interview.application)
            .joinedload(Application.job_opening)
            .joinedload(JobOpening.department),
            joinedload(Interview.interview_round),
            joinedload(Interview.interviewer),
        )
        # ==================================================
        # COMPANY FILTER
        # ==================================================
        query = query.filter(Interview.CompanyId == company_id)
        # ==================================================
        # APPLICATION FILTER
        # ==================================================
        if application_id is not None:
            query = query.filter(Interview.ApplicationId == application_id)
        # ==================================================
        # INTERVIEW ROUND FILTER
        # ==================================================
        if interview_round_id is not None:
            query = query.filter(Interview.InterviewRoundId == interview_round_id)
        # ==================================================
        # INTERVIEWER FILTER
        # ==================================================
        if interviewer_id is not None:
            query = query.filter(Interview.InterviewerId == interviewer_id)
        # ==================================================
        # STATUS FILTER
        # ==================================================
        if interview_status and interview_status != "All":
            query = query.filter(Interview.Status == interview_status)
        # ==================================================
        # SEARCH
        # ==================================================
        if search:
            search_value = f"%{search}%"
            query = (
                query.outerjoin(
                    Application, Interview.ApplicationId == Application.ApplicationId
                )
                .outerjoin(Applicant, Application.ApplicantId == Applicant.ApplicantId)
                .outerjoin(
                    JobOpening, Application.JobOpeningId == JobOpening.JobOpeningId
                )
                .outerjoin(
                    InterviewRound,
                    Interview.InterviewRoundId == InterviewRound.InterviewRoundId,
                )
                .outerjoin(User, Interview.InterviewerId == User.UserId)
                .filter(
                    or_(
                        Applicant.FirstName.ilike(search_value),
                        Applicant.LastName.ilike(search_value),
                        Applicant.Email.ilike(search_value),
                        JobOpening.JobTitle.ilike(search_value),
                        InterviewRound.RoundName.ilike(search_value),
                        User.FirstName.ilike(search_value),
                        User.LastName.ilike(search_value),
                        Interview.InterviewMode.ilike(search_value),
                        Interview.Status.ilike(search_value),
                    )
                )
            )
        # ==================================================
        # SORTING
        # ==================================================
        allowed_sort_columns = {
            "InterviewId": Interview.InterviewId,
            "ApplicationId": Interview.ApplicationId,
            "InterviewRoundId": Interview.InterviewRoundId,
            "InterviewerId": Interview.InterviewerId,
            "InterviewDate": Interview.InterviewDate,
            "InterviewMode": Interview.InterviewMode,
            "Status": Interview.Status,
            "CreatedOn": Interview.CreatedOn,
        }
        column = allowed_sort_columns.get(
            sort_by,
            Interview.InterviewDate,
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
    # GET INTERVIEW BY ID
    # ==================================================
    def get_by_id(
        self,
        db: Session,
        interview_id: int,
        company_id: int,
    ):
        return (
            db.query(Interview)
            .options(
                joinedload(Interview.application).joinedload(Application.applicant),
                joinedload(Interview.application)
                .joinedload(Application.job_opening)
                .joinedload(JobOpening.department),
                joinedload(Interview.interview_round),
                joinedload(Interview.interviewer),
            )
            .filter(
                Interview.InterviewId == interview_id,
                Interview.CompanyId == company_id,
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
            )
            .filter(
                Application.ApplicationId == application_id,
                Application.CompanyId == company_id,
            )
            .first()
        )

    # ==================================================
    # GET INTERVIEW ROUND
    # ==================================================
    def get_interview_round(
        self,
        db: Session,
        interview_round_id: int,
        company_id: int,
    ):
        return (
            db.query(InterviewRound)
            .filter(
                InterviewRound.InterviewRoundId == interview_round_id,
                InterviewRound.CompanyId == company_id,
            )
            .first()
        )

    # ==================================================
    # GET INTERVIEWER USER
    # ==================================================
    def get_interviewer(
        self,
        db: Session,
        interviewer_id: int,
        company_id: int,
    ):
        return (
            db.query(User)
            .filter(
                User.UserId == interviewer_id,
                User.CompanyId == company_id,
            )
            .first()
        )

    # ==================================================
    # GET EXISTING INTERVIEW FOR APPLICATION + ROUND
    # ==================================================
    def get_by_application_and_round(
        self,
        db: Session,
        application_id: int,
        interview_round_id: int,
        company_id: int,
    ):
        return (
            db.query(Interview)
            .filter(
                Interview.ApplicationId == application_id,
                Interview.InterviewRoundId == interview_round_id,
                Interview.CompanyId == company_id,
            )
            .first()
        )

    # ==================================================
    # CREATE
    # ==================================================
    def create(
        self,
        db: Session,
        interview: InterviewCreate,
        company_id: int,
        current_user: dict,
    ):
        now = datetime.now()
        new_interview = Interview(
            # ==================================================
            # COMPANY
            # ==================================================
            CompanyId=company_id,
            # ==================================================
            # APPLICATION
            # ==================================================
            ApplicationId=interview.ApplicationId,
            # ==================================================
            # INTERVIEW ROUND
            # ==================================================
            InterviewRoundId=interview.InterviewRoundId,
            # ==================================================
            # INTERVIEWER
            # ==================================================
            # InterviewerId = User.UserId
            # ==================================================
            InterviewerId=interview.InterviewerId,
            # ==================================================
            # INTERVIEW DETAILS
            # ==================================================
            InterviewDate=interview.InterviewDate,
            InterviewMode=interview.InterviewMode,
            Status=interview.Status,
            # ==================================================
            # AUDIT
            # ==================================================
            CreatedOn=now,
            CreatedBy=current_user["user_id"],
            UpdatedOn=now,
            UpdatedBy=current_user["user_id"],
        )
        db.add(new_interview)
        db.commit()
        db.refresh(new_interview)
        return new_interview

    # ==================================================
    # UPDATE
    # ==================================================
    def update(
        self,
        db: Session,
        interview_id: int,
        interview: InterviewUpdate,
        current_user: dict,
    ):
        # ==================================================
        # GET EXISTING INTERVIEW
        # ==================================================
        existing_interview = self.get_by_id(
            db=db,
            interview_id=interview_id,
            company_id=current_user["company_id"],
        )
        # ==================================================
        # SECURITY CHECK
        # ==================================================
        if not existing_interview:
            return None
        # ==================================================
        # COMPANY ID IS NEVER CHANGED
        # ==================================================
        # ==================================================
        # APPLICATION
        # ==================================================
        existing_interview.ApplicationId = interview.ApplicationId
        # ==================================================
        # INTERVIEW ROUND
        # ==================================================
        existing_interview.InterviewRoundId = interview.InterviewRoundId
        # ==================================================
        # INTERVIEWER
        # ==================================================
        existing_interview.InterviewerId = interview.InterviewerId
        # ==================================================
        # INTERVIEW DATE
        # ==================================================
        existing_interview.InterviewDate = interview.InterviewDate
        # ==================================================
        # INTERVIEW MODE
        # ==================================================
        existing_interview.InterviewMode = interview.InterviewMode
        # ==================================================
        # STATUS
        # ==================================================
        existing_interview.Status = interview.Status
        # ==================================================
        # AUDIT
        # ==================================================
        existing_interview.UpdatedOn = datetime.now()
        existing_interview.UpdatedBy = current_user["user_id"]
        db.commit()
        db.refresh(existing_interview)
        return existing_interview

    # ==================================================
    # CANCEL INTERVIEW
    # ==================================================
    def cancel(
        self,
        db: Session,
        interview_id: int,
        company_id: int,
        current_user: dict,
    ):
        interview = self.get_by_id(
            db=db,
            interview_id=interview_id,
            company_id=company_id,
        )
        if not interview:
            return None
        interview.Status = "Cancelled"
        interview.UpdatedOn = datetime.now()
        interview.UpdatedBy = current_user["user_id"]
        db.commit()
        db.refresh(interview)
        return interview

    # ==================================================
    # DELETE
    # ==================================================
    def delete(
        self,
        db: Session,
        interview_id: int,
        company_id: int,
    ):
        interview = self.get_by_id(
            db=db,
            interview_id=interview_id,
            company_id=company_id,
        )
        if not interview:
            return None
        db.delete(interview)
        db.commit()
        return interview
