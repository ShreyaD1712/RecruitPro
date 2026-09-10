from sqlalchemy import Column, Integer, String, DateTime, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class Notification(Base):
    __tablename__ = "Notifications"

    NotificationId = Column(Integer, primary_key=True, index=True)

    CompanyId = Column(Integer, nullable=False)

    UserId = Column(Integer, nullable=False)

    Title = Column(String(150), nullable=False)

    Message = Column(String, nullable=False)

    NotificationType = Column(String(100), nullable=True)

    IsRead = Column(Boolean, nullable=False, default=False)

    CreatedOn = Column(DateTime, nullable=False)

    user = relationship(
        "User",
        primaryjoin="foreign(Notification.UserId) == User.UserId",
        viewonly=True,
    )

    # ==================================================
    # DISPLAY PROPERTIES
    # ==================================================
    @property
    def UserName(self):
        if self.user:
            return f"{self.user.FirstName} {self.user.LastName}"
        return None

    @property
    def UserEmail(self):
        if self.user:
            return self.user.Email
        return None
