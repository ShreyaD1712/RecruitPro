from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ==========================
# Base Schema
# ==========================
class RoleBase(BaseModel):

    RoleName: str

    Description: Optional[str] = None

    IsActive: bool = True


# ==========================
# Create Schema
# ==========================
class RoleCreate(BaseModel):
    RoleName: str
    CompanyId: Optional[int] = None
    Description: Optional[str] = None
    IsActive: bool = True


# ==========================
# Update Schema
# ==========================
class RoleUpdate(BaseModel):
    RoleName: str
    CompanyId: Optional[int] = None
    Description: Optional[str] = None
    IsActive: bool = True


# ==========================
# Response Schema
# ==========================
class RoleResponse(BaseModel):
    RoleId: int
    RoleName: str
    CompanyId: Optional[int]
    Description: Optional[str]
    IsActive: bool = True

    class Config:
        from_attributes = True


# ==========================
# List Response
# ==========================
class RoleListResponse(BaseModel):

    total_records: int

    page: int

    page_size: int

    data: list[RoleResponse]
