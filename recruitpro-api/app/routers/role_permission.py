from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.role_permission_schema import (
    RolePermissionCreate,
    RolePermissionListResponse,
)
from app.permission_dependency import require_permission
from app.services.role_permission_service import RolePermissionService

router = APIRouter(prefix="/role-permissions", tags=["Role Permissions"])

service = RolePermissionService()


# ==================================================
# GET MODULE PERMISSIONS
# ==================================================
@router.get("/{role_id}/module/{module_key}")
def get_module_permissions(
    role_id: int,
    module_key: str,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_ROLE_PERMISSION")),
):
    return service.get_module_permissions(db, role_id, module_key, current_user)


# ==================================================
# GET PERMISSIONS BY ROLE
# ==================================================
@router.get("/{role_id}", response_model=RolePermissionListResponse)
def get_permissions(
    role_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_ROLE_PERMISSION")),
):
    return service.get_permissions(db, role_id, current_user)


# ==================================================
# SAVE PERMISSIONS
# ==================================================
@router.post(
    "/", response_model=RolePermissionListResponse, status_code=status.HTTP_200_OK
)
def save_permissions(
    data: RolePermissionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("UPDATE_ROLE_PERMISSION")),
):
    return service.save_permissions(db, data, current_user)
