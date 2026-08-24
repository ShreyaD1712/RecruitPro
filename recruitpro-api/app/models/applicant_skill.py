from sqlalchemy import Column, ForeignKey, Integer, Numeric
from sqlalchemy.orm import relationship

from app.database import Base


class ApplicantSkill(Base):

    __tablename__ = "ApplicantSkills"

    # PRIMARY KEY

    ApplicantSkillId = Column(Integer, primary_key=True, index=True)
    CompanyId = Column(Integer, ForeignKey("Companies.CompanyId"), nullable=False)
    ApplicantId = Column(Integer, ForeignKey("Applicants.ApplicantId"), nullable=False)
    SkillId = Column(Integer, ForeignKey("Skills.SkillId"), nullable=False)
    ExperienceInYears = Column(Numeric(4, 1), nullable=True)

    # ==================================================
    # RELATIONSHIPS
    # ==================================================

    applicant = relationship("Applicant", back_populates="applicant_skills")

    skill = relationship("Skill", back_populates="applicant_skills")

    company = relationship("Company")
