from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


# -------------------------
# Create
# -------------------------
class UserCreate(BaseModel):

    FirstName: str

    LastName: str

    Email: EmailStr

    Password: str

    MobileNo: Optional[str] = None

    CompanyId: int

    DepartmentId: int

    RoleId: int

    IsActive: bool = True


# -------------------------
# Update
# -------------------------
class UserUpdate(BaseModel):

    FirstName: str

    LastName: str

    Email: EmailStr

    MobileNo: Optional[str] = None

    CompanyId: int

    DepartmentId: int

    RoleId: int

    IsActive: bool


# -------------------------
# Change Password
# -------------------------
class ChangePassword(BaseModel):

    Password: str


# -------------------------
# Response
# -------------------------
class UserResponse(BaseModel):

    UserId: int

    FirstName: str

    LastName: str

    Email: str

    MobileNo: Optional[str]

    CompanyId: int

    CompanyName: str

    DepartmentId: int

    DepartmentName: str

    RoleId: int

    RoleName: str

    IsActive: bool

    CreatedOn: datetime

    class Config:
        from_attributes = True


# -------------------------
# List Response
# -------------------------
class UserListResponse(BaseModel):

    total_records: int

    page: int

    page_size: int

    data: list[UserResponse]