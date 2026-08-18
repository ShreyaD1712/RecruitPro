from sqlalchemy import Column, Integer, String, Boolean, DateTime

from app.database import Base


class ExperienceLevel(Base):

    __tablename__ = "ExperienceLevels"

    ExperienceLevelId = Column(Integer, primary_key=True, index=True)

    LevelName = Column(String(150), nullable=False)

    Description = Column(String(500), nullable=True)

    IsActive = Column(Boolean, default=True)

    CreatedOn = Column(DateTime)

    CreatedBy = Column(Integer)

    UpdatedOn = Column(DateTime)

    UpdatedBy = Column(Integer)

    CompanyId = Column(Integer, nullable=False)
