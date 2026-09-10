from datetime import datetime
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from app.models.notification import Notification
from app.schemas.notification_schema import NotificationCreate


class NotificationRepository:

    # ==================================================
    # GET ALL NOTIFICATIONS
    # ==================================================
    def get_all(
        self,
        db: Session,
        company_id: int,
        user_id: int,
        search: str = "",
        is_read: bool | None = None,
        notification_type: str | None = None,
        sort_by: str = "CreatedOn",
        order: str = "desc",
        page: int = 1,
        page_size: int = 10,
    ):
        query = (
            db.query(Notification)
            .options(joinedload(Notification.user))
            .filter(
                Notification.CompanyId == company_id,
                Notification.UserId == user_id,
            )
        )

        # ==================================================
        # READ / UNREAD FILTER
        # ==================================================
        if is_read is not None:
            query = query.filter(Notification.IsRead == is_read)

        # ==================================================
        # NOTIFICATION TYPE FILTER
        # ==================================================
        if notification_type and notification_type != "All":
            query = query.filter(Notification.NotificationType == notification_type)

        # ==================================================
        # SEARCH
        # ==================================================
        if search:
            search_value = f"%{search}%"

            query = query.filter(
                or_(
                    Notification.Title.ilike(search_value),
                    Notification.Message.ilike(search_value),
                    Notification.NotificationType.ilike(search_value),
                )
            )

        # ==================================================
        # SORTING
        # ==================================================
        allowed_sort_columns = {
            "NotificationId": Notification.NotificationId,
            "Title": Notification.Title,
            "NotificationType": Notification.NotificationType,
            "IsRead": Notification.IsRead,
            "CreatedOn": Notification.CreatedOn,
        }

        column = allowed_sort_columns.get(
            sort_by,
            Notification.CreatedOn,
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
    # GET NOTIFICATION BY ID
    # ==================================================
    def get_by_id(
        self,
        db: Session,
        notification_id: int,
        company_id: int,
        user_id: int,
    ):
        return (
            db.query(Notification)
            .options(joinedload(Notification.user))
            .filter(
                Notification.NotificationId == notification_id,
                Notification.CompanyId == company_id,
                Notification.UserId == user_id,
            )
            .first()
        )

    # ==================================================
    # GET UNREAD COUNT
    # ==================================================
    def get_unread_count(
        self,
        db: Session,
        company_id: int,
        user_id: int,
    ):
        return (
            db.query(Notification)
            .filter(
                Notification.CompanyId == company_id,
                Notification.UserId == user_id,
                Notification.IsRead == False,
            )
            .count()
        )

    # ==================================================
    # CREATE NOTIFICATION
    # ==================================================
    def create(
        self,
        db: Session,
        notification: NotificationCreate,
        company_id: int,
    ):
        new_notification = Notification(
            CompanyId=company_id,
            UserId=notification.UserId,
            Title=notification.Title,
            Message=notification.Message,
            NotificationType=notification.NotificationType,
            IsRead=False,
            CreatedOn=datetime.now(),
        )

        db.add(new_notification)
        db.commit()
        db.refresh(new_notification)

        return new_notification

    # ==================================================
    # MARK NOTIFICATION AS READ
    # ==================================================
    def mark_as_read(
        self,
        db: Session,
        notification_id: int,
        company_id: int,
        user_id: int,
    ):
        notification = self.get_by_id(
            db=db,
            notification_id=notification_id,
            company_id=company_id,
            user_id=user_id,
        )

        if not notification:
            return None

        notification.IsRead = True

        db.commit()
        db.refresh(notification)

        return notification

    # ==================================================
    # MARK ALL NOTIFICATIONS AS READ
    # ==================================================
    def mark_all_as_read(
        self,
        db: Session,
        company_id: int,
        user_id: int,
    ):
        updated_count = (
            db.query(Notification)
            .filter(
                Notification.CompanyId == company_id,
                Notification.UserId == user_id,
                Notification.IsRead == False,
            )
            .update(
                {
                    Notification.IsRead: True,
                },
                synchronize_session=False,
            )
        )

        db.commit()

        return updated_count
