from datetime import datetime
from sqlalchemy.orm import Session
from app.models.role_permission import RolePermission


class RolePermissionRepository:

    # ==================================================
    # GET PERMISSIONS BY ROLE
    # ==================================================
    def get_permissions(self, db: Session, role_id: int):
        return (
            db.query(RolePermission)
            .filter(RolePermission.RoleId == role_id, RolePermission.IsActive == True)
            .all()
        )

    # ==================================================
    # GET MODULE PERMISSIONS
    # ==================================================
    def get_module_permissions(self, db: Session, role_id: int, module_key: str):
        module_key = module_key.upper()

        # Company has special VIEW permission
        if module_key == "COMPANY":
            available_permissions = [
                "VIEW_ALL_COMPANIES",
                "CREATE_COMPANY",
                "UPDATE_COMPANY",
                "DELETE_COMPANY",
            ]

        # Role Permission only has View + Update
        elif module_key == "ROLE_PERMISSION":
            available_permissions = [
                "VIEW_ROLE_PERMISSION",
                "UPDATE_ROLE_PERMISSION",
            ]

        else:
            available_permissions = [
                f"VIEW_{module_key}",
                f"CREATE_{module_key}",
                f"UPDATE_{module_key}",
                f"DELETE_{module_key}",
            ]

        assigned_permissions = self.get_permissions(db, role_id)
        assigned_names = {p.PermissionName for p in assigned_permissions}

        return {
            "module": module_key,
            "permissions": [
                {"PermissionName": permission, "Assigned": permission in assigned_names}
                for permission in available_permissions
            ],
        }

    # ==================================================
    # DELETE EXISTING PERMISSIONS
    # ==================================================
    def delete_permissions(self, db: Session, role_id: int):
        db.query(RolePermission).filter(RolePermission.RoleId == role_id).delete()
        db.commit()

    # ==================================================
    # SAVE PERMISSIONS
    # ==================================================
    def save_permissions(
        self, db: Session, role_id: int, permissions: list[str], current_user: dict
    ):
        self.delete_permissions(db, role_id)

        for permission in permissions:
            db.add(
                RolePermission(
                    RoleId=role_id,
                    PermissionName=permission,
                    IsActive=True,
                    CreatedOn=datetime.now(),
                    CreatedBy=current_user["user_id"],
                    UpdatedOn=datetime.now(),
                    UpdatedBy=current_user["user_id"],
                )
            )

        db.commit()
        return self.get_permissions(db, role_id)
