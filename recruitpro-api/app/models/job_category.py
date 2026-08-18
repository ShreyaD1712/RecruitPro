from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship

from app.database import Base


class JobCategory(Base):

    __tablename__ = "JobCategories"

    JobCategoryId = Column(Integer, primary_key=True, index=True)

    CategoryName = Column(String(150), nullable=False)

    Description = Column(String(500), nullable=True)

    CompanyId = Column(Integer, nullable=False)

    IsActive = Column(Boolean, default=True, nullable=False)

    CreatedOn = Column(DateTime, nullable=True)

    CreatedBy = Column(Integer, nullable=True)

    UpdatedOn = Column(DateTime, nullable=True)

    UpdatedBy = Column(Integer, nullable=True)

    job_openings = relationship("JobOpening", back_populates="job_category")
