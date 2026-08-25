from sqlalchemy import Column, ForeignKey, Integer, String, Date, Boolean
from sqlalchemy.orm import relationship
from app.database import Base


class ApplicantWorkExperience(Base):
    __tablename__ = "ApplicantWorkExperiences"
    # ==================================================
    # PRIMARY KEY
    # ==================================================
    WorkExperienceId = Column(Integer, primary_key=True, index=True)
    # ==================================================
    # COMPANY
    # ==================================================
    CompanyId = Column(Integer, nullable=False)
    # ==================================================
    # APPLICANT
    # ==================================================
    ApplicantId = Column(Integer, ForeignKey("Applicants.ApplicantId"), nullable=False)
    # ==================================================
    # WORK EXPERIENCE INFORMATION
    # ==================================================
    CompanyName = Column(String(150), nullable=False)
    Designation = Column(String(100), nullable=False)
    StartDate = Column(Date, nullable=False)
    EndDate = Column(Date, nullable=True)
    CurrentlyWorking = Column(Boolean, nullable=False)
    Responsibilities = Column(String, nullable=True)
    # ==================================================
    # RELATIONSHIPS
    # ==================================================
    applicant = relationship("Applicant", back_populates="work_experiences")
