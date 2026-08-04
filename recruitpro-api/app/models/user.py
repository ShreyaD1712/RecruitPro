from sqlalchemy import Column, ForeignKey, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship

from app.database import Base


class User(Base):
    __tablename__ = "Users"

    UserId = Column(Integer, primary_key=True, index=True)

    FirstName = Column(String(100), nullable=False)
    LastName = Column(String(100), nullable=False)

    Email = Column(String(150), unique=True, nullable=False)

    Password = Column(String(255), nullable=False)

    MobileNo = Column(String(20))

    RoleId = Column(Integer, ForeignKey("Roles.RoleId"))
    CompanyId = Column(Integer, ForeignKey("Companies.CompanyId"))
    DepartmentId = Column(Integer, ForeignKey("Departments.DepartmentId"))

    IsActive = Column(Boolean)

    CreatedOn = Column(DateTime)
    CreatedBy = Column(Integer)

    UpdatedOn = Column(DateTime)
    UpdatedBy = Column(Integer)

    # -------------------------
    # Relationships
    # -------------------------

    company = relationship("Company", back_populates="users")

    department = relationship("Department", back_populates="users")

    role = relationship("Role", back_populates="users")

    @property
    def CompanyName(self):
        return self.company.CompanyName if self.company else None

    @property
    def DepartmentName(self):
        return self.department.DepartmentName if self.department else None

    @property
    def RoleName(self):
        return self.role.RoleName if self.role else None
