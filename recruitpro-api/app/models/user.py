from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.database import Base

class User(Base):
    __tablename__ = "Users"

    UserId = Column(Integer, primary_key=True, index=True)

    FirstName = Column(String(100), nullable=False)
    LastName = Column(String(100), nullable=False)

    Email = Column(String(150), unique=True, nullable=False)

    PasswordHash = Column(String(255), nullable=False)

    PhoneNumber = Column(String(20))

    RoleId = Column(Integer, nullable=False)

    CompanyId = Column(Integer)

    DepartmentId = Column(Integer)

    IsActive = Column(Boolean)

    CreatedAt = Column(DateTime)