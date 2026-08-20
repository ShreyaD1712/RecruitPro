from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Application(Base):
    __tablename__ = "Applications"
    # PRIMARY KEY
    ApplicationId = Column(Integer, primary_key=True, index=True)
    CompanyId = Column(Integer, ForeignKey("Companies.CompanyId"), nullable=False)
    ApplicantId = Column(Integer, ForeignKey("Applicants.ApplicantId"), nullable=False)
    JobOpeningId = Column(
        Integer, ForeignKey("JobOpenings.JobOpeningId"), nullable=False
    )
    AppliedDate = Column(DateTime, nullable=False)
    CurrentStatus = Column(String(50), nullable=False)
    Remarks = Column(Text, nullable=True)
    CreatedOn = Column(DateTime, nullable=False)
    CreatedBy = Column(Integer, nullable=True)
    UpdatedOn = Column(DateTime, nullable=True)
    UpdatedBy = Column(Integer, nullable=True)
    # RELATIONSHIPS
    company = relationship("Company", back_populates="applications")
    applicant = relationship("Applicant", back_populates="applications")
    job_opening = relationship("JobOpening", back_populates="applications")

    # DISPLAY PROPERTIES
    @property
    def ApplicantName(self):
        if self.applicant:
            return f"{self.applicant.FirstName} {self.applicant.LastName}"
        return None

    @property
    def JobTitle(self):
        return self.job_opening.JobTitle if self.job_opening else None

    @property
    def DepartmentName(self):
        if self.job_opening and self.job_opening.department:
            return self.job_opening.department.DepartmentName
        return None

    @property
    def DesignationName(self):
        if self.job_opening and self.job_opening.designation:
            return self.job_opening.designation.DesignationName
        return None
