from datetime import datetime
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload
from app.models.interview_feedback import InterviewFeedback
from app.models.interview import Interview
from app.models.application import Application
from app.models.applicant import Applicant
from app.models.job_opening import JobOpening
from app.models.interview_round import InterviewRound
from app.models.user import User
from app.schemas.interview_feedback_schema import (
    InterviewFeedbackCreate,
    InterviewFeedbackUpdate,
)


class InterviewFeedbackRepository:
    # ==================================================
    # GET ALL INTERVIEW FEEDBACK
    # ==================================================
    def get_all(
        self,
        db: Session,
        company_id: int,
        search: str = "",
        interview_id: int | None = None,
        recommendation: str | None = None,
        sort_by: str = "CreatedOn",
        order: str = "desc",
        page: int = 1,
        page_size: int = 10,
    ):
        query = db.query(InterviewFeedback).options(
            joinedload(InterviewFeedback.interview)
            .joinedload(Interview.application)
            .joinedload(Application.applicant),
            joinedload(InterviewFeedback.interview)
            .joinedload(Interview.application)
            .joinedload(Application.job_opening)
            .joinedload(JobOpening.department),
            joinedload(InterviewFeedback.interview).joinedload(
                Interview.interview_round
            ),
            joinedload(InterviewFeedback.interview).joinedload(Interview.interviewer),
        )
        # ==================================================
        # COMPANY FILTER
        # ==================================================
        query = query.filter(InterviewFeedback.CompanyId == company_id)
        # ==================================================
        # INTERVIEW FILTER
        # ==================================================
        if interview_id is not None:
            query = query.filter(InterviewFeedback.InterviewId == interview_id)
        # ==================================================
        # RECOMMENDATION FILTER
        # ==================================================
        if recommendation and recommendation != "All":
            query = query.filter(InterviewFeedback.Recommendation == recommendation)
        # ==================================================
        # SEARCH
        # ==================================================
        if search:
            search_value = f"%{search}%"
            query = (
                query.join(
                    Interview,
                    InterviewFeedback.InterviewId == Interview.InterviewId,
                )
                .join(
                    Application,
                    Interview.ApplicationId == Application.ApplicationId,
                )
                .join(
                    Applicant,
                    Application.ApplicantId == Applicant.ApplicantId,
                )
                .join(
                    JobOpening,
                    Application.JobOpeningId == JobOpening.JobOpeningId,
                )
                .join(
                    InterviewRound,
                    Interview.InterviewRoundId == InterviewRound.InterviewRoundId,
                )
                .join(
                    User,
                    Interview.InterviewerId == User.UserId,
                )
                .filter(
                    or_(
                        Applicant.FirstName.ilike(search_value),
                        Applicant.LastName.ilike(search_value),
                        Applicant.Email.ilike(search_value),
                        JobOpening.JobTitle.ilike(search_value),
                        InterviewRound.RoundName.ilike(search_value),
                        User.FirstName.ilike(search_value),
                        User.LastName.ilike(search_value),
                        InterviewFeedback.Recommendation.ilike(search_value),
                        InterviewFeedback.Strengths.ilike(search_value),
                        InterviewFeedback.Weaknesses.ilike(search_value),
                        InterviewFeedback.Comments.ilike(search_value),
                    )
                )
            )
        # ==================================================
        # SORTING
        # ==================================================
        allowed_sort_columns = {
            "FeedbackId": InterviewFeedback.FeedbackId,
            "InterviewId": InterviewFeedback.InterviewId,
            "Rating": InterviewFeedback.Rating,
            "Recommendation": InterviewFeedback.Recommendation,
            "CreatedOn": InterviewFeedback.CreatedOn,
            "UpdatedOn": InterviewFeedback.UpdatedOn,
        }
        column = allowed_sort_columns.get(
            sort_by,
            InterviewFeedback.CreatedOn,
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
    # GET FEEDBACK BY ID
    # ==================================================
    def get_by_id(
        self,
        db: Session,
        feedback_id: int,
        company_id: int,
    ):
        return (
            db.query(InterviewFeedback)
            .options(
                joinedload(InterviewFeedback.interview)
                .joinedload(Interview.application)
                .joinedload(Application.applicant),
                joinedload(InterviewFeedback.interview)
                .joinedload(Interview.application)
                .joinedload(Application.job_opening)
                .joinedload(JobOpening.department),
                joinedload(InterviewFeedback.interview).joinedload(
                    Interview.interview_round
                ),
                joinedload(InterviewFeedback.interview).joinedload(
                    Interview.interviewer
                ),
            )
            .filter(
                InterviewFeedback.FeedbackId == feedback_id,
                InterviewFeedback.CompanyId == company_id,
            )
            .first()
        )

    # ==================================================
    # GET FEEDBACK BY INTERVIEW
    # ==================================================
    def get_by_interview(
        self,
        db: Session,
        interview_id: int,
        company_id: int,
    ):
        return (
            db.query(InterviewFeedback)
            .filter(
                InterviewFeedback.InterviewId == interview_id,
                InterviewFeedback.CompanyId == company_id,
            )
            .first()
        )

    # ==================================================
    # GET INTERVIEW
    # ==================================================
    def get_interview(
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
    # CREATE
    # ==================================================
    def create(
        self,
        db: Session,
        feedback: InterviewFeedbackCreate,
        company_id: int,
        current_user: dict,
    ):
        now = datetime.now()
        new_feedback = InterviewFeedback(
            # ==================================================
            # COMPANY
            # ==================================================
            # CompanyId comes from logged-in user.
            # Never comes from Angular.
            # ==================================================
            CompanyId=company_id,
            # ==================================================
            # INTERVIEW
            # ==================================================
            InterviewId=feedback.InterviewId,
            # ==================================================
            # FEEDBACK DETAILS
            # ==================================================
            Rating=feedback.Rating,
            Strengths=feedback.Strengths,
            Weaknesses=feedback.Weaknesses,
            Recommendation=feedback.Recommendation,
            Comments=feedback.Comments,
            # ==================================================
            # AUDIT
            # ==================================================
            CreatedOn=now,
            CreatedBy=current_user["user_id"],
            UpdatedOn=now,
            UpdatedBy=current_user["user_id"],
        )
        db.add(new_feedback)
        db.commit()
        db.refresh(new_feedback)
        return new_feedback

    # ==================================================
    # UPDATE
    # ==================================================
    def update(
        self,
        db: Session,
        feedback_id: int,
        feedback: InterviewFeedbackUpdate,
        current_user: dict,
    ):
        # ==================================================
        # GET EXISTING FEEDBACK
        # ==================================================
        existing_feedback = self.get_by_id(
            db=db,
            feedback_id=feedback_id,
            company_id=current_user["company_id"],
        )
        # ==================================================
        # SECURITY CHECK
        # ==================================================
        if not existing_feedback:
            return None
        # ==================================================
        # COMPANY ID IS NEVER CHANGED
        # ==================================================
        # ==================================================
        # INTERVIEW
        # ==================================================
        existing_feedback.InterviewId = feedback.InterviewId
        # ==================================================
        # RATING
        # ==================================================
        existing_feedback.Rating = feedback.Rating
        # ==================================================
        # STRENGTHS
        # ==================================================
        existing_feedback.Strengths = feedback.Strengths
        # ==================================================
        # WEAKNESSES
        # ==================================================
        existing_feedback.Weaknesses = feedback.Weaknesses
        # ==================================================
        # RECOMMENDATION
        # ==================================================
        existing_feedback.Recommendation = feedback.Recommendation
        # ==================================================
        # COMMENTS
        # ==================================================
        existing_feedback.Comments = feedback.Comments
        # ==================================================
        # AUDIT
        # ==================================================
        existing_feedback.UpdatedOn = datetime.now()
        existing_feedback.UpdatedBy = current_user["user_id"]
        db.commit()
        db.refresh(existing_feedback)
        return existing_feedback

    # ==================================================
    # DELETE
    # ==================================================
    def delete(
        self,
        db: Session,
        feedback_id: int,
        company_id: int,
    ):
        feedback = self.get_by_id(
            db=db,
            feedback_id=feedback_id,
            company_id=company_id,
        )
        if not feedback:
            return None
        db.delete(feedback)
        db.commit()
        return feedback
