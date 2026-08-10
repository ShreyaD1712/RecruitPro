from typing import List
from pydantic import BaseModel
from datetime import datetime


# -------------------------
# Save Permissions
# -------------------------
class RolePermissionCreate(BaseModel):
    RoleId: int
    Permissions: List[str]


# -------------------------
# Response
# -------------------------
class RolePermissionResponse(BaseModel):
    RolePermissionId: int
    RoleId: int
    PermissionName: str
    IsActive: bool

    class Config:
        from_attributes = True


# -------------------------
# Permission List
# -------------------------
class RolePermissionListResponse(BaseModel):
    RoleId: int
    Permissions: List[str]
