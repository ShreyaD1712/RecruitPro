from sqlalchemy import or_
from sqlalchemy.orm import Session
from datetime import datetime

from app.models.role import Role
from app.schemas.role_schema import RoleCreate, RoleUpdate


class RoleRepository:

    # -------------------------
    # Get All Roles
    # -------------------------
    def get_all(
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

        query = db.query(Role)

        # -------------------------
        # Company Filter
        # -------------------------
        if current_user["is_super_admin"]:
            if company_id:
                query = query.filter(Role.CompanyId == company_id)
        else:
            query = query.filter(Role.CompanyId == current_user["company_id"])

        # -------------------------
        # Search
        # -------------------------
        if search:
            query = query.filter(
                or_(
                    Role.RoleName.ilike(f"%{search}%"),
                    Role.Description.ilike(f"%{search}%"),
                )
            )

        # -------------------------
        # Sorting
        # -------------------------
        column = getattr(Role, sort_by, Role.RoleId)

        if order.lower() == "desc":
            query = query.order_by(column.desc())
        else:
            query = query.order_by(column.asc())

        total_records = query.count()

        roles = query.offset((page - 1) * page_size).limit(page_size).all()

        return {
            "total_records": total_records,
            "page": page,
            "page_size": page_size,
            "data": roles,
        }

    # -------------------------
    # Get Role By Id
    # -------------------------
    def get_by_id(
        self,
        db: Session,
        role_id: int,
    ):

        return db.query(Role).filter(Role.RoleId == role_id).first()

    # -------------------------
    # Get Role By Name
    # -------------------------
    def get_by_name(
        self,
        db: Session,
        role_name: str,
        company_id: int | None = None,
    ):

        query = db.query(Role).filter(Role.RoleName == role_name)

        if company_id is None:
            query = query.filter(Role.CompanyId == None)
        else:
            query = query.filter(Role.CompanyId == company_id)

        return query.first()

    # -------------------------
    # Create Role
    # -------------------------
    def create(
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

        new_role = Role(
            RoleName=role.RoleName,
            CompanyId=company_id,
            Description=role.Description,
            IsActive=role.IsActive,
            CreatedOn=datetime.now(),
            CreatedBy=current_user["user_id"],
            UpdatedOn=datetime.now(),
            UpdatedBy=current_user["user_id"],
        )

        db.add(new_role)
        db.commit()
        db.refresh(new_role)

        return new_role

    # -------------------------
    # Update Role
    # -------------------------
    def update(
        self,
        db: Session,
        role_id: int,
        role: RoleUpdate,
        current_user: dict,
    ):

        existing_role = db.query(Role).filter(Role.RoleId == role_id).first()

        if not existing_role:
            return None

        existing_role.RoleName = role.RoleName
        existing_role.Description = role.Description
        existing_role.IsActive = role.IsActive

        if current_user["is_super_admin"]:
            existing_role.CompanyId = role.CompanyId

        existing_role.UpdatedOn = datetime.now()
        existing_role.UpdatedBy = current_user["user_id"]

        db.commit()
        db.refresh(existing_role)

        return existing_role

    # -------------------------
    # Create Default Roles
    # -------------------------
    def create_default_roles(
        self,
        db: Session,
        company_id: int,
    ):

        roles = [
            Role(
                RoleName="Company Admin",
                CompanyId=company_id,
                Description="Default Company Administrator",
                IsActive=True,
                CreatedOn=datetime.now(),
                CreatedBy=1,
                UpdatedOn=datetime.now(),
                UpdatedBy=1,
            ),
            Role(
                RoleName="HR Manager",
                CompanyId=company_id,
                Description="Default HR Manager",
                IsActive=True,
                CreatedOn=datetime.now(),
                CreatedBy=1,
                UpdatedOn=datetime.now(),
                UpdatedBy=1,
            ),
        ]

        db.add_all(roles)
        db.commit()

    # -------------------------
    # Delete Role
    # -------------------------
    def delete(
        self,
        db: Session,
        role_id: int,
    ):

        role = db.query(Role).filter(Role.RoleId == role_id).first()

        if not role:
            return None

        db.delete(role)
        db.commit()

        return role
