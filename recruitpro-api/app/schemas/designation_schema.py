from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ----------------------------
# Create Designation
# ----------------------------
class DesignationCreate(BaseModel):

    DesignationCode: str
    DesignationName: str
    CompanyId: int
    DepartmentId: int
    Description: Optional[str] = None
    IsActive: bool = True


# ----------------------------
# Update Designation
# ----------------------------
class DesignationUpdate(BaseModel):

    DesignationCode: Optional[str] = None
    DesignationName: Optional[str] = None
    CompanyId: Optional[int] = None
    DepartmentId: Optional[int] = None
    Description: Optional[str] = None
    IsActive: Optional[bool] = None


# ----------------------------
# Designation Response
# ----------------------------
class DesignationResponse(BaseModel):

    DesignationId: int
    DesignationCode: str
    DesignationName: str
    CompanyId: int
    CompanyName: Optional[str] = None
    DepartmentId: int
    DepartmentName: Optional[str] = None
    Description: Optional[str]
    IsActive: bool
    CreatedOn: Optional[datetime]

    class Config:
        from_attributes = True


# ----------------------------
# Pagination Response
# ----------------------------
class DesignationListResponse(BaseModel):

    total_records: int
    page: int
    page_size: int
    data: list[DesignationResponse]