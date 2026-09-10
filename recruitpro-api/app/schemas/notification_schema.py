from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ==================================================
# CREATE NOTIFICATION
# ==================================================
class NotificationCreate(BaseModel):

    # User who will receive the notification
    UserId: int = Field(..., gt=0)

    # Notification title
    Title: str = Field(
        ...,
        min_length=1,
        max_length=150,
    )

    # Notification message
    Message: str = Field(
        ...,
        min_length=1,
    )

    # Type of notification
    # Example: Interview, Application, Offer, Referral
    NotificationType: Optional[str] = Field(
        default=None,
        max_length=100,
    )


# ==================================================
# NOTIFICATION RESPONSE
# ==================================================
class NotificationResponse(BaseModel):

    NotificationId: int

    CompanyId: int

    UserId: int

    # --------------------------------------------------
    # NOTIFICATION INFORMATION
    # --------------------------------------------------
    Title: str

    Message: str

    NotificationType: Optional[str] = None

    IsRead: bool

    # --------------------------------------------------
    # AUDIT INFORMATION
    # --------------------------------------------------
    CreatedOn: datetime

    # --------------------------------------------------
    # DISPLAY INFORMATION
    # --------------------------------------------------
    UserName: Optional[str] = None

    UserEmail: Optional[str] = None

    class Config:
        from_attributes = True


# ==================================================
# NOTIFICATION LIST RESPONSE
# ==================================================
class NotificationListResponse(BaseModel):

    total_records: int

    page: int

    page_size: int

    data: list[NotificationResponse]


# ==================================================
# UNREAD COUNT RESPONSE
# ==================================================
class NotificationUnreadCountResponse(BaseModel):

    unread_count: int


# ==================================================
# MARK AS READ RESPONSE
# ==================================================
class NotificationReadResponse(BaseModel):

    message: str

    NotificationId: int

    IsRead: bool


# ==================================================
# MARK ALL AS READ RESPONSE
# ==================================================
class NotificationMarkAllReadResponse(BaseModel):

    message: str

    updated_count: int
