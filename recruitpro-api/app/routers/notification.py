from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.notification_schema import NotificationCreate
from app.services.notification_service import NotificationService

router = APIRouter(
    prefix="/notifications",
    tags=["Notifications"],
)

service = NotificationService()


# ==================================================
# GET ALL NOTIFICATIONS
# ==================================================
@router.get("/")
def get_all_notifications(
    search: str = "",
    is_read: bool | None = None,
    notification_type: str | None = None,
    sort_by: str = "CreatedOn",
    order: str = "desc",
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return service.get_all_notifications(
        db=db,
        current_user=current_user,
        search=search,
        is_read=is_read,
        notification_type=notification_type,
        sort_by=sort_by,
        order=order,
        page=page,
        page_size=page_size,
    )


# ==================================================
# GET UNREAD COUNT
# ==================================================
@router.get("/unread-count")
def get_unread_count(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return service.get_unread_count(
        db=db,
        current_user=current_user,
    )


# ==================================================
# MARK ALL NOTIFICATIONS AS READ
# ==================================================
@router.put("/mark-all-read")
def mark_all_as_read(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return service.mark_all_as_read(
        db=db,
        current_user=current_user,
    )


# ==================================================
# GET NOTIFICATION BY ID
# ==================================================
@router.get("/{notification_id}")
def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return service.get_notification_by_id(
        db=db,
        notification_id=notification_id,
        current_user=current_user,
    )


# ==================================================
# CREATE NOTIFICATION
# ==================================================
@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
def create_notification(
    notification: NotificationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return service.create_notification(
        db=db,
        notification=notification,
        current_user=current_user,
    )


# ==================================================
# MARK ONE NOTIFICATION AS READ
# ==================================================
@router.put("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return service.mark_as_read(
        db=db,
        notification_id=notification_id,
        current_user=current_user,
    )
