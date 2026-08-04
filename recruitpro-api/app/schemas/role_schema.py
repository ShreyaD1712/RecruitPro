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
class RoleCreate(RoleBase):
    pass
# ==========================
# Update Schema
# ==========================
class RoleUpdate(RoleBase):
    pass

# ==========================
# Response Schema
# ==========================
class RoleResponse(RoleBase):

    RoleId: int

    CreatedOn: Optional[datetime]

    CreatedBy: Optional[int]

    UpdatedOn: Optional[datetime]

    UpdatedBy: Optional[int]

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