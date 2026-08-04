from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


class Role(Base):

    __tablename__ = "Roles"

    RoleId = Column(Integer, primary_key=True, index=True)

    RoleName = Column(String(200), nullable=False, unique=True)

    Description = Column(String(510), nullable=True)

    IsActive = Column(Boolean, default=True, nullable=False)

    CreatedOn = Column(DateTime, nullable=False)

    CreatedBy = Column(Integer, nullable=True)

    UpdatedOn = Column(DateTime, nullable=True)

    UpdatedBy = Column(Integer, nullable=True)
    users = relationship("User", back_populates="role")
