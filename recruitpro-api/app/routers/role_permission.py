from fastapi import APIRouter, Depends, status

from sqlalchemy.orm import Session

from app.database import get_db

from app.dependencies import get_current_user

from app.schemas.role_permission_schema import (
    RolePermissionCreate,
    RolePermissionListResponse,
)

from app.services.role_permission_service import RolePermissionService

router = APIRouter(prefix="/role-permissions", tags=["Role Permissions"])

service = RolePermissionService()


# -------------------------
# Get Permissions By Role
# -------------------------
@router.get("/{role_id}", response_model=RolePermissionListResponse)
def get_permissions(
    role_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)
):

    return service.get_permissions(db, role_id, current_user)


# -------------------------
# Save Permissions
# -------------------------
@router.post(
    "/", response_model=RolePermissionListResponse, status_code=status.HTTP_200_OK
)
def save_permissions(
    data: RolePermissionCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    return service.save_permissions(db, data, current_user)
