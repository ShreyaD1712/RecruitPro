from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ----------------------------
# Create Department
# ----------------------------
class DepartmentCreate(BaseModel):

    DepartmentCode: str
    DepartmentName: str
    CompanyId: int
    Description: Optional[str] = None
    IsActive: bool = True


# ----------------------------
# Update Department
# ----------------------------
class DepartmentUpdate(BaseModel):

    DepartmentCode: Optional[str] = None
    DepartmentName: Optional[str] = None
    CompanyId: Optional[int] = None
    Description: Optional[str] = None
    IsActive: Optional[bool] = None


# ----------------------------
# Department Response
# ----------------------------
class DepartmentResponse(BaseModel):

    DepartmentId: int
    DepartmentCode: str
    DepartmentName: str
    CompanyId: int
    CompanyName: Optional[str] = None
    Description: Optional[str]
    IsActive: bool
    CreatedOn: Optional[datetime]

    class Config:
        from_attributes = True


# ----------------------------
# Pagination Response
# ----------------------------
class DepartmentListResponse(BaseModel):

    total_records: int
    page: int
    page_size: int
    data: list[DepartmentResponse]