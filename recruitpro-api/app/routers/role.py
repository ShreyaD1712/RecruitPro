from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.role_schema import (
    RoleCreate,
    RoleResponse,
    RoleUpdate,
    RoleListResponse,
)
from app.services.role_service import RoleService
from app.dependencies import get_current_user
from app.permission_dependency import require_permission

router = APIRouter(prefix="/roles", tags=["Roles"])

service = RoleService()


# -------------------------
# Get All Roles
# -------------------------
@router.get("/", response_model=RoleListResponse)
def get_all_roles(
    search: str = "",
    sort_by: str = "RoleId",
    order: str = "asc",
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1),
    company_id: int | None = None,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_ROLE")),
):

    return service.get_all_roles(
        db,
        search,
        sort_by,
        order,
        page,
        page_size,
        company_id,
        current_user,
    )


# -------------------------
# Get Role By Id
# -------------------------
@router.get("/{role_id}", response_model=RoleResponse)
def get_role(
    role_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)
):

    return service.get_role_by_id(db, role_id, current_user)


# -------------------------
# Create Role
# -------------------------
@router.post("/")
def create_role(
    role: RoleCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("CREATE_ROLE")),
):

    return service.create_role(db, role, current_user)


# -------------------------
# Update Role
# -------------------------
@router.put("/{role_id}")
def update_role(
    role_id: int,
    role: RoleUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("UPDATE_ROLE")),
):

    return service.update_role(db, role_id, role, current_user)


# -------------------------
# Delete Role
# -------------------------
@router.delete("/{role_id}")
def delete_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("DELETE_ROLE")),
):

    return service.delete_role(db, role_id, current_user)
