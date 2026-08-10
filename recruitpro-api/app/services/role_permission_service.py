from sqlalchemy.orm import Session
from fastapi import HTTPException

from app.repositories.role_permission_repository import RolePermissionRepository

from app.repositories.role_repository import RoleRepository

from app.schemas.role_permission_schema import (
    RolePermissionCreate,
    RolePermissionListResponse,
)


class RolePermissionService:

    def __init__(self):

        self.repository = RolePermissionRepository()

        self.role_repository = RoleRepository()

    # -------------------------
    # Get Permissions By Role
    # -------------------------
    def get_permissions(self, db: Session, role_id: int, current_user: dict):

        role = self.role_repository.get_by_id(db, role_id)

        if not role:
            raise HTTPException(status_code=404, detail="Role not found")

        # Company Admin can access only
        # their company's roles
        if (
            current_user["role_name"] != "Super Admin"
            and role.CompanyId != current_user["company_id"]
        ):
            raise HTTPException(
                status_code=403, detail="You are not authorized to access this role"
            )

        permissions = self.repository.get_permissions(db, role_id)

        return RolePermissionListResponse(
            RoleId=role_id, Permissions=[p.PermissionName for p in permissions]
        )

    # -------------------------
    # Save Permissions
    # -------------------------
    def save_permissions(
        self, db: Session, data: RolePermissionCreate, current_user: dict
    ):

        role = self.role_repository.get_by_id(db, data.RoleId)

        if not role:
            raise HTTPException(status_code=404, detail="Role not found")

        # Company Admin can assign
        # permissions only to
        # their company's roles
        if (
            current_user["role_name"] != "Super Admin"
            and role.CompanyId != current_user["company_id"]
        ):
            raise HTTPException(
                status_code=403, detail="You are not authorized to modify this role"
            )

        permissions = self.repository.save_permissions(
            db, data.RoleId, data.Permissions, current_user
        )

        return RolePermissionListResponse(
            RoleId=data.RoleId, Permissions=[p.PermissionName for p in permissions]
        )
