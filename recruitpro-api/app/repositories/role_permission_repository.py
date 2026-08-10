from datetime import datetime
from sqlalchemy.orm import Session

from app.models.role_permission import RolePermission


class RolePermissionRepository:

    # -------------------------
    # Get Permissions By Role
    # -------------------------
    def get_permissions(self, db: Session, role_id: int):

        permissions = (
            db.query(RolePermission)
            .filter(RolePermission.RoleId == role_id, RolePermission.IsActive == True)
            .all()
        )

        return permissions

    # -------------------------
    # Delete Existing Permissions
    # -------------------------
    def delete_permissions(self, db: Session, role_id: int):

        db.query(RolePermission).filter(RolePermission.RoleId == role_id).delete()

        db.commit()

    # -------------------------
    # Save Permissions
    # -------------------------
    def save_permissions(
        self, db: Session, role_id: int, permissions: list[str], current_user: dict
    ):

        # Remove old permissions
        self.delete_permissions(db, role_id)

        # Add new permissions
        for permission in permissions:

            new_permission = RolePermission(
                RoleId=role_id,
                PermissionName=permission,
                IsActive=True,
                CreatedOn=datetime.now(),
                CreatedBy=current_user["user_id"],
                UpdatedOn=datetime.now(),
                UpdatedBy=current_user["user_id"],
            )

            db.add(new_permission)

        db.commit()

        return self.get_permissions(db, role_id)
