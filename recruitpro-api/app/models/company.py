from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


class Company(Base):

    __tablename__ = "Companies"
    CompanyId = Column(Integer, primary_key=True, index=True)
    CompanyCode = Column(String(50), nullable=False)
    CompanyName = Column(String(150), nullable=False)
    Email = Column(String(150), nullable=False)
    Phone = Column(String(20), nullable=False)
    Website = Column(String(150))
    Address = Column(String(255))
    IsActive = Column(Boolean, default=True)
    CreatedOn = Column(DateTime)
    CreatedBy = Column(Integer)
    UpdatedOn = Column(DateTime)
    UpdatedBy = Column(Integer)

    departments = relationship(
        "Department", back_populates="company", cascade="all, delete-orphan"
    )
    designations = relationship(
        "Designation", back_populates="company", cascade="all, delete-orphan"
    )
    users = relationship("User", back_populates="company")
