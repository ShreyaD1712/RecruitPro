from sqlalchemy.orm import Session
from fastapi import HTTPException, status
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

    # ==================================================
    # COMPANY PERMISSIONS
    # ==================================================
    COMPANY_PERMISSIONS = {
        "VIEW_ALL_COMPANIES",
        "CREATE_COMPANY",
        "UPDATE_COMPANY",
        "DELETE_COMPANY",
    }

    # ==================================================
    # CHECK ROLE ACCESS
    # ==================================================
    def check_role_access(self, db: Session, role_id: int, current_user: dict):
        role = self.role_repository.get_by_id(db, role_id)

        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found",
            )

        if (
            not current_user.get("is_super_admin", False)
            and role.CompanyId != current_user["company_id"]
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to access this role",
            )

        return role

    # ==================================================
    # CHECK TARGET ROLE IS SUPER ADMIN
    # ==================================================
    def is_super_admin_role(self, role) -> bool:
        return role.RoleName == "Super Admin"

    # ==================================================
    # GET PERMISSIONS BY ROLE
    # ==================================================
    def get_permissions(self, db: Session, role_id: int, current_user: dict):
        role = self.check_role_access(db, role_id, current_user)
        permissions = self.repository.get_permissions(db, role_id)

        permission_names = [p.PermissionName for p in permissions]

        # Non-Super-Admin roles can never have Company permissions
        if not self.is_super_admin_role(role):
            permission_names = [
                permission
                for permission in permission_names
                if permission not in self.COMPANY_PERMISSIONS
            ]

        return RolePermissionListResponse(
            RoleId=role_id,
            Permissions=permission_names,
        )

    # ==================================================
    # GET MODULE PERMISSIONS
    # ==================================================
    def get_module_permissions(
        self,
        db: Session,
        role_id: int,
        module_key: str,
        current_user: dict,
    ):
        role = self.check_role_access(db, role_id, current_user)
        module_key = module_key.upper()

        # Hide Company permissions for every role except Super Admin
        if module_key == "COMPANY" and not self.is_super_admin_role(role):
            return {
                "module": "COMPANY",
                "permissions": [],
            }

        return self.repository.get_module_permissions(
            db,
            role_id,
            module_key,
        )

    # ==================================================
    # SAVE PERMISSIONS
    # ==================================================
    def save_permissions(
        self,
        db: Session,
        data: RolePermissionCreate,
        current_user: dict,
    ):
        role = self.check_role_access(db, data.RoleId, current_user)

        permissions_to_save = list(data.Permissions)

        # Remove Company permissions from every non-Super-Admin role
        if not self.is_super_admin_role(role):
            permissions_to_save = [
                permission
                for permission in permissions_to_save
                if permission not in self.COMPANY_PERMISSIONS
            ]

        permissions = self.repository.save_permissions(
            db,
            data.RoleId,
            permissions_to_save,
            current_user,
        )

        return RolePermissionListResponse(
            RoleId=data.RoleId,
            Permissions=[p.PermissionName for p in permissions],
        )
