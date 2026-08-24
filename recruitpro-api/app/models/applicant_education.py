from sqlalchemy import Column, ForeignKey, Integer, Numeric, String
from sqlalchemy.orm import relationship
from app.database import Base


class ApplicantEducation(Base):
    __tablename__ = "ApplicantEducations"
    # ==================================================
    # PRIMARY KEY
    # ==================================================
    EducationId = Column(Integer, primary_key=True, index=True)
    # ==================================================
    # COMPANY
    # ==================================================
    CompanyId = Column(Integer, nullable=False)
    # ==================================================
    # APPLICANT
    # ==================================================
    ApplicantId = Column(Integer, ForeignKey("Applicants.ApplicantId"), nullable=False)
    # ==================================================
    # EDUCATION INFORMATION
    # ==================================================
    Degree = Column(String(100), nullable=False)
    Institute = Column(String(150), nullable=False)
    University = Column(String(150), nullable=False)
    PassingYear = Column(Integer, nullable=False)
    Percentage = Column(Numeric(5, 2), nullable=False)
    # ==================================================
    # RELATIONSHIPS
    # ==================================================
    applicant = relationship("Applicant", back_populates="educations")
