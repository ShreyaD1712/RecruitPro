from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class CompanyCreate(BaseModel):
    CompanyCode: str
    CompanyName: str
    Email: EmailStr
    Phone: str
    Website: Optional[str] = None
    Address: Optional[str] = None
    IsActive: bool = True


class CompanyUpdate(BaseModel):
    CompanyCode: Optional[str] = None
    CompanyName: Optional[str] = None
    Email: Optional[EmailStr] = None
    Phone: Optional[str] = None
    Website: Optional[str] = None
    Address: Optional[str] = None
    IsActive: Optional[bool] = None


class CompanyResponse(BaseModel):
    CompanyId: int
    CompanyCode: str
    CompanyName: str
    Email: EmailStr
    Phone: str
    Website: Optional[str] = None
    Address: Optional[str] = None
    IsActive: bool
    CreatedOn: Optional[datetime] = None

    class Config:
        from_attributes = True


# NEW CLASS FOR PAGINATION
class CompanyListResponse(BaseModel):
    total_records: int
    page: int
    page_size: int
    data: list[CompanyResponse]

    class Config:
        from_attributes = True