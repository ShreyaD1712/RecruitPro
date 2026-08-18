from sqlalchemy import Column, ForeignKey, Integer, String, DateTime, Numeric, Text
from sqlalchemy.orm import relationship
from app.database import Base


class JobOpening(Base):
    __tablename__ = "JobOpenings"
    JobOpeningId = Column(Integer, primary_key=True, index=True)
    CompanyId = Column(Integer, ForeignKey("Companies.CompanyId"), nullable=False)
    DepartmentId = Column(
        Integer, ForeignKey("Departments.DepartmentId"), nullable=False
    )
    DesignationId = Column(
        Integer, ForeignKey("Designations.DesignationId"), nullable=False
    )
    JobCategoryId = Column(
        Integer, ForeignKey("JobCategories.JobCategoryId"), nullable=False
    )
    EmploymentTypeId = Column(
        Integer, ForeignKey("EmploymentTypes.EmploymentTypeId"), nullable=False
    )
    ExperienceLevelId = Column(
        Integer, ForeignKey("ExperienceLevels.ExperienceLevelId"), nullable=False
    )
    JobTitle = Column(String(150), nullable=False)
    JobDescription = Column(Text, nullable=True)
    Location = Column(String(150), nullable=True)
    NoOfVacancies = Column(Integer, nullable=False)
    SalaryFrom = Column(Numeric(18, 2), nullable=True)
    SalaryTo = Column(Numeric(18, 2), nullable=True)
    Status = Column(String(50), nullable=False)
    CreatedOn = Column(DateTime, nullable=False)
    CreatedBy = Column(Integer, nullable=False)
    UpdatedOn = Column(DateTime, nullable=True)
    UpdatedBy = Column(Integer, nullable=True)
    # -------------------------
    # Relationships
    # -------------------------
    company = relationship("Company", back_populates="job_openings")
    department = relationship("Department", back_populates="job_openings")
    designation = relationship("Designation", back_populates="job_openings")
    job_category = relationship("JobCategory", back_populates="job_openings")
    employment_type = relationship("EmploymentType", back_populates="job_openings")
    experience_level = relationship("ExperienceLevel", back_populates="job_openings")

    @property
    def CompanyName(self):
        return self.company.CompanyName if self.company else None

    @property
    def DepartmentName(self):
        return self.department.DepartmentName if self.department else None

    @property
    def DesignationName(self):
        return self.designation.DesignationName if self.designation else None

    @property
    def JobCategoryName(self):
        return self.job_category.JobCategoryName if self.job_category else None

    @property
    def EmploymentTypeName(self):
        return self.employment_type.EmploymentTypeName if self.employment_type else None

    @property
    def ExperienceLevelName(self):
        return (
            self.experience_level.ExperienceLevelName if self.experience_level else None
        )
