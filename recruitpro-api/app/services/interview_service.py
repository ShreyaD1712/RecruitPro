from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime

from app.repositories.interview_repository import InterviewRepository
from app.schemas.interview_schema import (
    InterviewCreate,
    InterviewUpdate,
)

from app.services.notification_service import NotificationService
from app.schemas.notification_schema import NotificationCreate


class InterviewService:
    def __init__(self):
        self.repository = InterviewRepository()
        self.notification_service = NotificationService()

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
    # CREATE INTERVIEW NOTIFICATION
    # ==================================================
    def create_interview_notification(
        self,
        db: Session,
        user_id: int,
        application_id: int,
        interview_date: datetime,
        interview_mode: str | None,
        title: str,
        message: str,
        current_user: dict,
    ):
        formatted_date = interview_date.strftime("%d %b %Y at %I:%M %p")

        mode_text = interview_mode if interview_mode else "Not specified"

        notification = NotificationCreate(
            UserId=user_id,
            Title=title,
            Message=message.format(
                application_id=application_id,
                interview_date=formatted_date,
                interview_mode=mode_text,
            ),
            NotificationType="Interview",
        )

        return self.notification_service.create_notification(
            db=db,
            notification=notification,
            current_user=current_user,
        )

    # ==================================================
    # GET ALL INTERVIEWS
    # ==================================================
    def get_all_interviews(
        self,
        db: Session,
        current_user: dict,
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
        self.check_permission(
            current_user,
            "VIEW_INTERVIEW",
        )

        company_id = self.get_company_id(current_user)

        return self.repository.get_all(
            db=db,
            company_id=company_id,
            search=search,
            application_id=application_id,
            interview_round_id=interview_round_id,
            interviewer_id=interviewer_id,
            interview_status=interview_status,
            sort_by=sort_by,
            order=order,
            page=page,
            page_size=page_size,
        )

    # ==================================================
    # GET INTERVIEW BY ID
    # ==================================================
    def get_interview_by_id(
        self,
        db: Session,
        interview_id: int,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "VIEW_INTERVIEW",
        )

        company_id = self.get_company_id(current_user)

        interview = self.repository.get_by_id(
            db=db,
            interview_id=interview_id,
            company_id=company_id,
        )

        if not interview:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview not found",
            )

        return interview

    # ==================================================
    # CREATE INTERVIEW
    # ==================================================
    def create_interview(
        self,
        db: Session,
        interview: InterviewCreate,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "CREATE_INTERVIEW",
        )

        company_id = self.get_company_id(current_user)

        # ==================================================
        # CHECK APPLICATION
        # ==================================================
        application = self.repository.get_application(
            db=db,
            application_id=interview.ApplicationId,
            company_id=company_id,
        )

        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found in your company",
            )

        # ==================================================
        # CHECK INTERVIEW ROUND
        # ==================================================
        interview_round = self.repository.get_interview_round(
            db=db,
            interview_round_id=interview.InterviewRoundId,
            company_id=company_id,
        )

        if not interview_round:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview Round not found in your company",
            )

        # ==================================================
        # INTERVIEW ROUND ACTIVE CHECK
        # ==================================================
        if not interview_round.IsActive:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive Interview Round cannot be selected",
            )

        # ==================================================
        # CHECK INTERVIEWER
        # ==================================================
        interviewer = self.repository.get_interviewer(
            db=db,
            interviewer_id=interview.InterviewerId,
            company_id=company_id,
        )

        if not interviewer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interviewer user not found in your company",
            )

        # ==================================================
        # VALIDATE INTERVIEW MODE
        # ==================================================
        allowed_modes = [
            "Online",
            "In Person",
            "Phone",
        ]

        if interview.InterviewMode and interview.InterviewMode not in allowed_modes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid interview mode",
            )

        # ==================================================
        # VALIDATE STATUS
        # ==================================================
        allowed_statuses = [
            "Scheduled",
            "Completed",
            "Cancelled",
            "Rescheduled",
        ]

        interview_status = interview.Status or "Scheduled"

        if interview_status not in allowed_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid interview status",
            )

        # ==================================================
        # INTERVIEW DATE VALIDATION
        # ==================================================
        if interview.InterviewDate <= datetime.now():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Interview date and time must be in the future",
            )

        # ==================================================
        # DUPLICATE ROUND CHECK
        # ==================================================
        existing_interview = self.repository.get_by_application_and_round(
            db=db,
            application_id=interview.ApplicationId,
            interview_round_id=interview.InterviewRoundId,
            company_id=company_id,
        )

        if existing_interview:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This interview round is already scheduled for this application",
            )

        # ==================================================
        # CREATE INTERVIEW
        # ==================================================
        created_interview = self.repository.create(
            db=db,
            interview=interview,
            company_id=company_id,
            current_user=current_user,
        )

        # ==================================================
        # CREATE SCHEDULED NOTIFICATION
        # ==================================================
        self.create_interview_notification(
            db=db,
            user_id=interview.InterviewerId,
            application_id=interview.ApplicationId,
            interview_date=interview.InterviewDate,
            interview_mode=interview.InterviewMode,
            title="Interview Scheduled",
            message=(
                "You have been assigned an interview for "
                "Application #{application_id} on "
                "{interview_date}. "
                "Interview mode: {interview_mode}."
            ),
            current_user=current_user,
        )

        return created_interview

    # ==================================================
    # UPDATE INTERVIEW
    # ==================================================
    def update_interview(
        self,
        db: Session,
        interview_id: int,
        interview: InterviewUpdate,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "UPDATE_INTERVIEW",
        )

        company_id = self.get_company_id(current_user)

        # ==================================================
        # CHECK EXISTING INTERVIEW
        # ==================================================
        existing = self.repository.get_by_id(
            db=db,
            interview_id=interview_id,
            company_id=company_id,
        )

        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview not found",
            )

        # Save old interviewer before update
        old_interviewer_id = existing.InterviewerId

        # ==================================================
        # CHECK APPLICATION
        # ==================================================
        application = self.repository.get_application(
            db=db,
            application_id=interview.ApplicationId,
            company_id=company_id,
        )

        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found in your company",
            )

        # ==================================================
        # CHECK INTERVIEW ROUND
        # ==================================================
        interview_round = self.repository.get_interview_round(
            db=db,
            interview_round_id=interview.InterviewRoundId,
            company_id=company_id,
        )

        if not interview_round:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview Round not found in your company",
            )

        # ==================================================
        # INTERVIEW ROUND ACTIVE CHECK
        # ==================================================
        if not interview_round.IsActive:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Inactive Interview Round cannot be selected",
            )

        # ==================================================
        # CHECK NEW INTERVIEWER
        # ==================================================
        interviewer = self.repository.get_interviewer(
            db=db,
            interviewer_id=interview.InterviewerId,
            company_id=company_id,
        )

        if not interviewer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interviewer user not found in your company",
            )

        # ==================================================
        # VALIDATE INTERVIEW MODE
        # ==================================================
        allowed_modes = [
            "Online",
            "In Person",
            "Phone",
        ]

        if interview.InterviewMode and interview.InterviewMode not in allowed_modes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid interview mode",
            )

        # ==================================================
        # VALIDATE STATUS
        # ==================================================
        allowed_statuses = [
            "Scheduled",
            "Completed",
            "Cancelled",
            "Rescheduled",
        ]

        if interview.Status and interview.Status not in allowed_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid interview status",
            )

        # ==================================================
        # INTERVIEW DATE VALIDATION
        # ==================================================
        if (
            interview.Status
            not in [
                "Completed",
                "Cancelled",
            ]
            and interview.InterviewDate <= datetime.now()
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Interview date and time must be in the future",
            )

        # ==================================================
        # DUPLICATE ROUND CHECK
        # ==================================================
        duplicate = self.repository.get_by_application_and_round(
            db=db,
            application_id=interview.ApplicationId,
            interview_round_id=interview.InterviewRoundId,
            company_id=company_id,
        )

        if duplicate and duplicate.InterviewId != interview_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This interview round is already scheduled for this application",
            )

        # ==================================================
        # UPDATE INTERVIEW
        # ==================================================
        updated_interview = self.repository.update(
            db=db,
            interview_id=interview_id,
            interview=interview,
            current_user=current_user,
        )

        if not updated_interview:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview not found",
            )

        new_interviewer_id = interview.InterviewerId

        # ==================================================
        # INTERVIEWER CHANGED
        # OLD USER GETS REMOVED/REASSIGNED NOTIFICATION
        # ==================================================
        if old_interviewer_id != new_interviewer_id:

            self.create_interview_notification(
                db=db,
                user_id=old_interviewer_id,
                application_id=interview.ApplicationId,
                interview_date=interview.InterviewDate,
                interview_mode=interview.InterviewMode,
                title="Interview Reassigned",
                message=(
                    "You are no longer assigned as the interviewer "
                    "for Application #{application_id}. "
                    "The interview was scheduled for "
                    "{interview_date}."
                ),
                current_user=current_user,
            )

            # ==================================================
            # NEW INTERVIEWER - CANCELLED
            # ==================================================
            if interview.Status == "Cancelled":

                self.create_interview_notification(
                    db=db,
                    user_id=new_interviewer_id,
                    application_id=interview.ApplicationId,
                    interview_date=interview.InterviewDate,
                    interview_mode=interview.InterviewMode,
                    title="Interview Cancelled",
                    message=(
                        "The interview for Application "
                        "#{application_id} scheduled for "
                        "{interview_date} has been cancelled."
                    ),
                    current_user=current_user,
                )

            # ==================================================
            # NEW INTERVIEWER - RESCHEDULED
            # ==================================================
            elif interview.Status == "Rescheduled":

                self.create_interview_notification(
                    db=db,
                    user_id=new_interviewer_id,
                    application_id=interview.ApplicationId,
                    interview_date=interview.InterviewDate,
                    interview_mode=interview.InterviewMode,
                    title="Interview Rescheduled",
                    message=(
                        "You have been assigned a rescheduled "
                        "interview for Application #{application_id} "
                        "on {interview_date}. "
                        "Interview mode: {interview_mode}."
                    ),
                    current_user=current_user,
                )

            # ==================================================
            # NEW INTERVIEWER - NORMAL ASSIGNMENT
            # ==================================================
            else:

                self.create_interview_notification(
                    db=db,
                    user_id=new_interviewer_id,
                    application_id=interview.ApplicationId,
                    interview_date=interview.InterviewDate,
                    interview_mode=interview.InterviewMode,
                    title="Interview Assigned",
                    message=(
                        "You have been assigned as the interviewer "
                        "for Application #{application_id} on "
                        "{interview_date}. "
                        "Interview mode: {interview_mode}."
                    ),
                    current_user=current_user,
                )

        # ==================================================
        # SAME INTERVIEWER
        # ==================================================
        else:

            # ==================================================
            # CANCELLED
            # ==================================================
            if interview.Status == "Cancelled":

                self.create_interview_notification(
                    db=db,
                    user_id=new_interviewer_id,
                    application_id=interview.ApplicationId,
                    interview_date=interview.InterviewDate,
                    interview_mode=interview.InterviewMode,
                    title="Interview Cancelled",
                    message=(
                        "Your interview for Application "
                        "#{application_id} scheduled for "
                        "{interview_date} has been cancelled."
                    ),
                    current_user=current_user,
                )

            # ==================================================
            # RESCHEDULED
            # ==================================================
            elif interview.Status == "Rescheduled":

                self.create_interview_notification(
                    db=db,
                    user_id=new_interviewer_id,
                    application_id=interview.ApplicationId,
                    interview_date=interview.InterviewDate,
                    interview_mode=interview.InterviewMode,
                    title="Interview Rescheduled",
                    message=(
                        "Your interview for Application "
                        "#{application_id} has been rescheduled "
                        "to {interview_date}. "
                        "Interview mode: {interview_mode}."
                    ),
                    current_user=current_user,
                )

            # ==================================================
            # COMPLETED
            # ==================================================
            elif interview.Status == "Completed":

                self.create_interview_notification(
                    db=db,
                    user_id=new_interviewer_id,
                    application_id=interview.ApplicationId,
                    interview_date=interview.InterviewDate,
                    interview_mode=interview.InterviewMode,
                    title="Interview Completed",
                    message=(
                        "The interview for Application "
                        "#{application_id} has been marked "
                        "as completed."
                    ),
                    current_user=current_user,
                )

            # ==================================================
            # NORMAL UPDATE
            # ==================================================
            else:

                self.create_interview_notification(
                    db=db,
                    user_id=new_interviewer_id,
                    application_id=interview.ApplicationId,
                    interview_date=interview.InterviewDate,
                    interview_mode=interview.InterviewMode,
                    title="Interview Updated",
                    message=(
                        "Your interview for Application "
                        "#{application_id} has been updated. "
                        "Interview date: {interview_date}. "
                        "Interview mode: {interview_mode}."
                    ),
                    current_user=current_user,
                )

        return updated_interview

    # ==================================================
    # CANCEL INTERVIEW
    # ==================================================
    def cancel_interview(
        self,
        db: Session,
        interview_id: int,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "UPDATE_INTERVIEW",
        )

        company_id = self.get_company_id(current_user)

        existing = self.repository.get_by_id(
            db=db,
            interview_id=interview_id,
            company_id=company_id,
        )

        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview not found",
            )

        if existing.Status == "Cancelled":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Interview is already cancelled",
            )

        if existing.Status == "Completed":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Completed interview cannot be cancelled",
            )

        # Save values before cancelling
        interviewer_id = existing.InterviewerId
        application_id = existing.ApplicationId
        interview_date = existing.InterviewDate
        interview_mode = existing.InterviewMode

        cancelled_interview = self.repository.cancel(
            db=db,
            interview_id=interview_id,
            company_id=company_id,
            current_user=current_user,
        )

        # ==================================================
        # CREATE CANCEL NOTIFICATION
        # ==================================================
        self.create_interview_notification(
            db=db,
            user_id=interviewer_id,
            application_id=application_id,
            interview_date=interview_date,
            interview_mode=interview_mode,
            title="Interview Cancelled",
            message=(
                "Your interview for Application "
                "#{application_id} scheduled for "
                "{interview_date} has been cancelled."
            ),
            current_user=current_user,
        )

        return cancelled_interview

    # ==================================================
    # DELETE INTERVIEW
    # ==================================================
    def delete_interview(
        self,
        db: Session,
        interview_id: int,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "DELETE_INTERVIEW",
        )

        company_id = self.get_company_id(current_user)

        existing = self.repository.get_by_id(
            db=db,
            interview_id=interview_id,
            company_id=company_id,
        )

        if not existing:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Interview not found",
            )

        # Save values before deleting
        interviewer_id = existing.InterviewerId
        application_id = existing.ApplicationId
        interview_date = existing.InterviewDate
        interview_mode = existing.InterviewMode

        # ==================================================
        # DELETE INTERVIEW
        # ==================================================
        self.repository.delete(
            db=db,
            interview_id=interview_id,
            company_id=company_id,
        )

        # ==================================================
        # CREATE REMOVED NOTIFICATION
        # ==================================================
        self.create_interview_notification(
            db=db,
            user_id=interviewer_id,
            application_id=application_id,
            interview_date=interview_date,
            interview_mode=interview_mode,
            title="Interview Removed",
            message=(
                "The interview assigned to you for "
                "Application #{application_id} on "
                "{interview_date} has been removed."
            ),
            current_user=current_user,
        )

        return {"message": "Interview deleted successfully"}
