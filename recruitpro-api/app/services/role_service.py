from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.role_repository import RoleRepository
from app.schemas.role_schema import (
    RoleCreate,
    RoleUpdate
)


class RoleService:

    def __init__(self):
        self.repository = RoleRepository()

    # -------------------------
    # Get All Roles
    # -------------------------
    def get_all_roles(
        self,
        db: Session,
        search: str = "",
        sort_by: str = "RoleId",
        order: str = "asc",
        page: int = 1,
        page_size: int = 10
    ):

        return self.repository.get_all(
            db,
            search,
            sort_by,
            order,
            page,
            page_size
        )

    # -------------------------
    # Get Role By Id
    # -------------------------
    def get_role_by_id(
        self,
        db: Session,
        role_id: int
    ):

        role = self.repository.get_by_id(
            db,
            role_id
        )

        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found"
            )

        return role

    # -------------------------
    # Create Role
    # -------------------------
    def create_role(
        self,
        db: Session,
        role: RoleCreate
    ):

        # Check duplicate Role Name
        existing_role = self.repository.get_by_name(
            db,
            role.RoleName
        )

        if existing_role:
            raise HTTPException(
                status_code=400,
                detail="Role Name already exists"
            )

        return self.repository.create(
            db,
            role
        )

    # -------------------------
    # Update Role
    # -------------------------
    def update_role(
        self,
        db: Session,
        role_id: int,
        role: RoleUpdate
    ):

        existing_role = self.repository.get_by_id(
            db,
            role_id
        )

        if not existing_role:
            raise HTTPException(
                status_code=404,
                detail="Role not found"
            )

        duplicate_role = self.repository.get_by_name(
            db,
            role.RoleName
        )

        if (
            duplicate_role
            and duplicate_role.RoleId != role_id
        ):
            raise HTTPException(
                status_code=400,
                detail="Role Name already exists"
            )

        return self.repository.update(
            db,
            role_id,
            role
        )

    # -------------------------
    # Delete Role
    # -------------------------
    def delete_role(
        self,
        db: Session,
        role_id: int
    ):

        deleted_role = self.repository.delete(
            db,
            role_id
        )

        if not deleted_role:
            raise HTTPException(
                status_code=404,
                detail="Role not found"
            )

        return {
            "message": "Role deleted successfully"
        }