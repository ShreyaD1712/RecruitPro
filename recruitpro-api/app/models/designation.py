from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Designation(Base):

    __tablename__ = "Designations"

    DesignationId = Column(Integer, primary_key=True, index=True)

    DesignationCode = Column(String(20), unique=True, nullable=False)
    DesignationName = Column(String(150), unique=True, nullable=False)

    CompanyId = Column(Integer, ForeignKey("Companies.CompanyId"), nullable=False)

    DepartmentId = Column(
        Integer, ForeignKey("Departments.DepartmentId"), nullable=False
    )

    Description = Column(String(500))

    IsActive = Column(Boolean, default=True)

    CreatedOn = Column(DateTime)
    CreatedBy = Column(Integer)
    UpdatedOn = Column(DateTime)
    UpdatedBy = Column(Integer)

    company = relationship("Company", back_populates="designations")
    department = relationship("Department", back_populates="designations")
    job_openings = relationship("JobOpening", back_populates="designation")

    @property
    def CompanyName(self):
        return self.company.CompanyName if self.company else None

    @property
    def DepartmentName(self):
        return self.department.DepartmentName if self.department else None
