from sqlalchemy import Column, Integer, String, Boolean, DateTime

from app.database import Base


class RolePermission(Base):

    __tablename__ = "RolePermissions"

    RolePermissionId = Column(Integer, primary_key=True, index=True)

    # Reference to Roles table (No Foreign Key)
    RoleId = Column(Integer, nullable=False)

    PermissionName = Column(String(100), nullable=False)

    IsActive = Column(Boolean, default=True)

    CreatedOn = Column(DateTime)

    CreatedBy = Column(Integer)

    UpdatedOn = Column(DateTime)

    UpdatedBy = Column(Integer)
