from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.role_repository import RoleRepository
from app.schemas.role_schema import RoleCreate, RoleUpdate


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
        page_size: int = 10,
        company_id: int | None = None,
        current_user: dict | None = None,
    ):

        return self.repository.get_all(
            db=db,
            search=search,
            sort_by=sort_by,
            order=order,
            page=page,
            page_size=page_size,
            company_id=company_id,
            current_user=current_user,
        )

    # -------------------------
    # Get Role By Id
    # -------------------------
    def get_role_by_id(
        self,
        db: Session,
        role_id: int,
        current_user: dict,
    ):

        role = self.repository.get_by_id(
            db,
            role_id,
        )

        if not role:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Role not found",
            )

        # Company users can access only their own company's roles
        if (
            not current_user["is_super_admin"]
            and role.CompanyId != current_user["company_id"]
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to access this role",
            )

        return role

    # -------------------------
    # Create Role
    # -------------------------
    def create_role(
        self,
        db: Session,
        role: RoleCreate,
        current_user: dict,
    ):

        company_id = (
            role.CompanyId
            if current_user["is_super_admin"]
            else current_user["company_id"]
        )

        if not current_user["is_super_admin"]:
            role.CompanyId = current_user["company_id"]

        existing_role = self.repository.get_by_name(
            db,
            role.RoleName,
            company_id,
        )

        if existing_role:
            raise HTTPException(
                status_code=400,
                detail="Role Name already exists",
            )

        return self.repository.create(
            db,
            role,
            current_user,
        )

    # -------------------------
    # Update Role
    # -------------------------
    def update_role(
        self,
        db: Session,
        role_id: int,
        role: RoleUpdate,
        current_user: dict,
    ):

        existing_role = self.repository.get_by_id(
            db,
            role_id,
        )

        if not existing_role:
            raise HTTPException(
                status_code=404,
                detail="Role not found",
            )

        # Company users can update only their own company's roles
        if (
            not current_user["is_super_admin"]
            and existing_role.CompanyId != current_user["company_id"]
        ):
            raise HTTPException(
                status_code=403,
                detail="You are not authorized to update this role",
            )

        company_id = (
            role.CompanyId
            if current_user["is_super_admin"]
            else current_user["company_id"]
        )

        if not current_user["is_super_admin"]:
            role.CompanyId = current_user["company_id"]

        duplicate_role = self.repository.get_by_name(
            db,
            role.RoleName,
            company_id,
        )

        if duplicate_role and duplicate_role.RoleId != role_id:
            raise HTTPException(
                status_code=400,
                detail="Role Name already exists",
            )

        return self.repository.update(
            db,
            role_id,
            role,
            current_user,
        )

    # -------------------------
    # Delete Role
    # -------------------------
    def delete_role(
        self,
        db: Session,
        role_id: int,
        current_user: dict,
    ):

        role = self.repository.get_by_id(
            db,
            role_id,
        )

        if not role:
            raise HTTPException(
                status_code=404,
                detail="Role not found",
            )

        # Company users can delete only their own company's roles
        if (
            not current_user["is_super_admin"]
            and role.CompanyId != current_user["company_id"]
        ):
            raise HTTPException(
                status_code=403,
                detail="You are not authorized to delete this role",
            )

        self.repository.delete(
            db,
            role_id,
        )

        return {"message": "Role deleted successfully"}
