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
    ):
        query = db.query(Role)
        # Search
        if search:
            query = query.filter(
                or_(
                    Role.RoleName.ilike(f"%{search}%"),
                    Role.Description.ilike(f"%{search}%"),
                )
            )
        # Sorting
        column = getattr(Role, sort_by, Role.RoleName)
        if order.lower() == "desc":
            query = query.order_by(column.desc())
        else:
            query = query.order_by(column.asc())
        # Total Records
        total_records = query.count()
        # Pagination
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
    def get_by_id(self, db: Session, role_id: int):
        return db.query(Role).filter(Role.RoleId == role_id).first()

    # -------------------------
    # Get Role By Name
    # -------------------------
    def get_by_name(self, db: Session, role_name: str):
        return db.query(Role).filter(Role.RoleName == role_name).first()

    # -------------------------
    # Create Role
    # -------------------------
    def create(self, db: Session, role: RoleCreate):
        new_role = Role(
            RoleName=role.RoleName,
            Description=role.Description,
            IsActive=role.IsActive,
            CreatedOn=datetime.now(),
            CreatedBy=1,
            UpdatedOn=datetime.now(),
            UpdatedBy=1,
        )
        db.add(new_role)
        db.commit()
        db.refresh(new_role)
        return new_role

    # -------------------------
    # Update Role
    # -------------------------
    def update(self, db: Session, role_id: int, role: RoleUpdate):
        existing_role = db.query(Role).filter(Role.RoleId == role_id).first()
        if not existing_role:
            return None
        existing_role.RoleName = role.RoleName
        existing_role.Description = role.Description
        existing_role.IsActive = role.IsActive
        existing_role.UpdatedOn = datetime.now()
        existing_role.UpdatedBy = 1
        db.commit()
        db.refresh(existing_role)
        return existing_role

    # -------------------------
    # Delete Role
    # -------------------------
    def delete(self, db: Session, role_id: int):
        role = db.query(Role).filter(Role.RoleId == role_id).first()
        if not role:
            return None
        db.delete(role)
        db.commit()
        return role
