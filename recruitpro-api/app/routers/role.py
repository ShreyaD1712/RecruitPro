from fastapi import (
    APIRouter,
    Depends,
    Query,
    status
)
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.role_schema import (
    RoleCreate,
    RoleResponse,
    RoleUpdate,
    RoleListResponse
)
from app.services.role_service import RoleService
from app.dependencies import get_current_user
from app.role_dependency import admin_only

router = APIRouter(
    prefix="/roles",
    tags=["Roles"]
)

service = RoleService()


# -------------------------
# Get All Roles
# -------------------------
@router.get("/", 
            response_model=RoleListResponse)
def get_all_roles(
    search: str = "",
    sort_by: str = "RoleId",
    order: str = "asc",
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return service.get_all_roles(
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
@router.get("/{role_id}", response_model=RoleResponse)
def get_role(
    role_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):

    return service.get_role_by_id(
        db,
        role_id
    )


# -------------------------
# Create Role
# -------------------------
@router.post(
    "/",
    response_model=RoleResponse,
    status_code=status.HTTP_201_CREATED,
    dependencies=[Depends(admin_only)]
)
def create_role(
    role: RoleCreate,
    db: Session = Depends(get_db)
):

    return service.create_role(
        db,
        role
    )


# -------------------------
# Update Role
# -------------------------
@router.put(
    "/{role_id}",
    dependencies=[Depends(admin_only)]
)
def update_role(
    role_id: int,
    role: RoleUpdate,
    db: Session = Depends(get_db)
):

    return service.update_role(
        db,
        role_id,
        role
    )


# -------------------------
# Delete Role
# -------------------------
@router.delete(
    "/{role_id}",
    dependencies=[Depends(admin_only)]
)
def delete_role(
    role_id: int,
    db: Session = Depends(get_db)
):

    return service.delete_role(
        db,
        role_id
    )