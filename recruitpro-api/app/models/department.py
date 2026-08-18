from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Department(Base):

    __tablename__ = "Departments"

    DepartmentId = Column(Integer, primary_key=True, index=True)

    DepartmentCode = Column(String(20), unique=True, nullable=False)
    DepartmentName = Column(String(150), unique=True, nullable=False)

    CompanyId = Column(Integer, ForeignKey("Companies.CompanyId"), nullable=False)

    Description = Column(String(500))

    IsActive = Column(Boolean, default=True)

    CreatedOn = Column(DateTime)
    CreatedBy = Column(Integer)
    UpdatedOn = Column(DateTime)
    UpdatedBy = Column(Integer)

    company = relationship("Company", back_populates="departments")
    designations = relationship(
        "Designation", back_populates="department", cascade="all, delete-orphan"
    )
    users = relationship("User", back_populates="department")
    job_openings = relationship("JobOpening", back_populates="department")

    @property
    def CompanyName(self):
        return self.company.CompanyName if self.company else None
