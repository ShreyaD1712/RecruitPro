from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.notification_repository import NotificationRepository
from app.schemas.notification_schema import NotificationCreate
from app.models.user import User


class NotificationService:

    def __init__(self):
        self.repository = NotificationRepository()

    # ==================================================
    # GET COMPANY ID
    # ==================================================
    def get_company_id(self, current_user: dict):
        company_id = current_user.get("company_id")

        if not company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Company information not found for the current user",
            )

        return company_id

    # ==================================================
    # GET USER ID
    # ==================================================
    def get_user_id(self, current_user: dict):
        user_id = current_user.get("user_id")

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User information not found",
            )

        return user_id

    # ==================================================
    # VALIDATE RECEIVER USER
    # ==================================================
    def validate_receiver(
        self,
        db: Session,
        user_id: int,
        company_id: int,
    ):
        user = (
            db.query(User)
            .filter(
                User.UserId == user_id,
                User.CompanyId == company_id,
            )
            .first()
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification receiver not found in your company",
            )

        return user

    # ==================================================
    # GET ALL NOTIFICATIONS
    # ==================================================
    def get_all_notifications(
        self,
        db: Session,
        current_user: dict,
        search: str = "",
        is_read: bool | None = None,
        notification_type: str | None = None,
        sort_by: str = "CreatedOn",
        order: str = "desc",
        page: int = 1,
        page_size: int = 10,
    ):
        company_id = self.get_company_id(current_user)
        user_id = self.get_user_id(current_user)

        return self.repository.get_all(
            db=db,
            company_id=company_id,
            user_id=user_id,
            search=search,
            is_read=is_read,
            notification_type=notification_type,
            sort_by=sort_by,
            order=order,
            page=page,
            page_size=page_size,
        )

    # ==================================================
    # GET NOTIFICATION BY ID
    # ==================================================
    def get_notification_by_id(
        self,
        db: Session,
        notification_id: int,
        current_user: dict,
    ):
        company_id = self.get_company_id(current_user)
        user_id = self.get_user_id(current_user)

        notification = self.repository.get_by_id(
            db=db,
            notification_id=notification_id,
            company_id=company_id,
            user_id=user_id,
        )

        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found",
            )

        return notification

    # ==================================================
    # GET UNREAD COUNT
    # ==================================================
    def get_unread_count(
        self,
        db: Session,
        current_user: dict,
    ):
        company_id = self.get_company_id(current_user)
        user_id = self.get_user_id(current_user)

        unread_count = self.repository.get_unread_count(
            db=db,
            company_id=company_id,
            user_id=user_id,
        )

        return {
            "unread_count": unread_count,
        }

    # ==================================================
    # CREATE NOTIFICATION
    # ==================================================
    def create_notification(
        self,
        db: Session,
        notification: NotificationCreate,
        current_user: dict,
    ):
        company_id = self.get_company_id(current_user)

        # ==================================================
        # VALIDATE RECEIVER
        # ==================================================
        self.validate_receiver(
            db=db,
            user_id=notification.UserId,
            company_id=company_id,
        )

        # ==================================================
        # CREATE NOTIFICATION
        # ==================================================
        return self.repository.create(
            db=db,
            notification=notification,
            company_id=company_id,
        )

    # ==================================================
    # MARK ONE NOTIFICATION AS READ
    # ==================================================
    def mark_as_read(
        self,
        db: Session,
        notification_id: int,
        current_user: dict,
    ):
        company_id = self.get_company_id(current_user)
        user_id = self.get_user_id(current_user)

        notification = self.repository.mark_as_read(
            db=db,
            notification_id=notification_id,
            company_id=company_id,
            user_id=user_id,
        )

        if not notification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Notification not found",
            )

        return {
            "message": "Notification marked as read successfully",
            "NotificationId": notification.NotificationId,
            "IsRead": notification.IsRead,
        }

    # ==================================================
    # MARK ALL NOTIFICATIONS AS READ
    # ==================================================
    def mark_all_as_read(
        self,
        db: Session,
        current_user: dict,
    ):
        company_id = self.get_company_id(current_user)
        user_id = self.get_user_id(current_user)

        updated_count = self.repository.mark_all_as_read(
            db=db,
            company_id=company_id,
            user_id=user_id,
        )

        return {
            "message": "All notifications marked as read successfully",
            "updated_count": updated_count,
        }
