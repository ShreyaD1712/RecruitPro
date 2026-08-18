from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal


# -------------------------
# Create Job Opening
# -------------------------
class JobOpeningCreate(BaseModel):
    DepartmentId: int = Field(..., gt=0)
    DesignationId: int = Field(..., gt=0)
    JobCategoryId: int = Field(..., gt=0)
    EmploymentTypeId: int = Field(..., gt=0)
    ExperienceLevelId: int = Field(..., gt=0)
    JobTitle: str = Field(..., min_length=1, max_length=150)
    JobDescription: Optional[str] = None
    Location: Optional[str] = Field(default=None, max_length=150)
    NoOfVacancies: int = Field(..., gt=0)
    SalaryFrom: Optional[Decimal] = Field(default=None, ge=0)
    SalaryTo: Optional[Decimal] = Field(default=None, ge=0)
    Status: str = Field(..., min_length=1, max_length=50)


# -------------------------
# Update Job Opening
# -------------------------
class JobOpeningUpdate(BaseModel):
    DepartmentId: int = Field(..., gt=0)
    DesignationId: int = Field(..., gt=0)
    JobCategoryId: int = Field(..., gt=0)
    EmploymentTypeId: int = Field(..., gt=0)
    ExperienceLevelId: int = Field(..., gt=0)
    JobTitle: str = Field(..., min_length=1, max_length=150)
    JobDescription: Optional[str] = None
    Location: Optional[str] = Field(default=None, max_length=150)
    NoOfVacancies: int = Field(..., gt=0)
    SalaryFrom: Optional[Decimal] = Field(default=None, ge=0)
    SalaryTo: Optional[Decimal] = Field(default=None, ge=0)
    Status: str = Field(..., min_length=1, max_length=50)


# -------------------------
# Job Opening Response
# -------------------------
class JobOpeningResponse(BaseModel):
    JobOpeningId: int
    CompanyId: int
    DepartmentId: int
    DesignationId: int
    JobCategoryId: int
    EmploymentTypeId: int
    ExperienceLevelId: int
    JobTitle: str
    JobDescription: Optional[str] = None
    Location: Optional[str] = None
    NoOfVacancies: int
    SalaryFrom: Optional[Decimal] = None
    SalaryTo: Optional[Decimal] = None
    Status: str
    CreatedOn: Optional[datetime] = None
    CreatedBy: Optional[int] = None
    UpdatedOn: Optional[datetime] = None
    UpdatedBy: Optional[int] = None
    # Display names for Angular
    CompanyName: Optional[str] = None
    DepartmentName: Optional[str] = None
    DesignationName: Optional[str] = None
    JobCategoryName: Optional[str] = None
    EmploymentTypeName: Optional[str] = None
    ExperienceLevelName: Optional[str] = None

    class Config:
        from_attributes = True


# -------------------------
# Job Opening List Response
# -------------------------
class JobOpeningListResponse(BaseModel):
    total_records: int
    page: int
    page_size: int
    data: list[JobOpeningResponse]
