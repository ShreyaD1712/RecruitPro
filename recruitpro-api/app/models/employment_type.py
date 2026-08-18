from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


class EmploymentType(Base):

    __tablename__ = "EmploymentTypes"

    EmploymentTypeId = Column(Integer, primary_key=True, index=True)

    EmploymentTypeName = Column(String(150), nullable=False)

    Description = Column(String(500), nullable=True)

    IsActive = Column(Boolean, default=True)

    CreatedOn = Column(DateTime)

    CreatedBy = Column(Integer)

    UpdatedOn = Column(DateTime)

    UpdatedBy = Column(Integer)

    CompanyId = Column(Integer, nullable=False)

    job_openings = relationship("JobOpening", back_populates="employment_type")
