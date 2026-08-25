from sqlalchemy import Column, ForeignKey, Integer, String, Date, DateTime, Numeric
from sqlalchemy.orm import relationship
from app.database import Base


class Applicant(Base):
    __tablename__ = "Applicants"
    # PRIMARY KEY
    ApplicantId = Column(Integer, primary_key=True, index=True)
    CompanyId = Column(Integer, ForeignKey("Companies.CompanyId"), nullable=False)
    FirstName = Column(String(100), nullable=False)
    LastName = Column(String(100), nullable=False)
    Email = Column(String(150), nullable=False)
    MobileNo = Column(String(20), nullable=False)
    DOB = Column(Date, nullable=True)
    Gender = Column(String(20), nullable=True)
    CurrentCity = Column(String(100), nullable=True)
    CurrentCompany = Column(String(150), nullable=True)
    CurrentCTC = Column(Numeric(18, 2), nullable=True)
    ExpectedCTC = Column(Numeric(18, 2), nullable=True)
    NoticePeriod = Column(String(50), nullable=True)
    LinkedInUrl = Column(String(255), nullable=True)
    CreatedOn = Column(DateTime, nullable=False)
    CreatedBy = Column(Integer, nullable=True)
    UpdatedOn = Column(DateTime, nullable=True)
    UpdatedBy = Column(Integer, nullable=True)
    # RELATIONSHIPS
    company = relationship("Company", back_populates="applicants")
    applications = relationship("Application", back_populates="applicant")
    applicant_skills = relationship(
        "ApplicantSkill", back_populates="applicant", cascade="all, delete-orphan"
    )
    educations = relationship(
        "ApplicantEducation", back_populates="applicant", cascade="all, delete-orphan"
    )
    work_experiences = relationship(
        "ApplicantWorkExperience", back_populates="applicant"
    )
    documents = relationship(
        "ApplicantDocument", back_populates="applicant", cascade="all, delete-orphan"
    )

    # DISPLAY PROPERTIES
    @property
    def CompanyName(self):
        return self.company.CompanyName if self.company else None
