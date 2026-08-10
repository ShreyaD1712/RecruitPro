from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user

from app.schemas.user_schema import (
    UserCreate,
    UserUpdate,
    UserResponse,
    UserListResponse,
    ChangePassword,
)
from app.permission_dependency import require_permission
from app.services.user_service import UserService

router = APIRouter(prefix="/users", tags=["Users"])

user_service = UserService()


# -------------------------
# Get All Users
# -------------------------
@router.get("/", response_model=UserListResponse)
def get_all_users(
    search: str = "",
    company_id: int | None = Query(None),
    sort_by: str = "FirstName",
    order: str = "asc",
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_permission("VIEW_USER")),
):

    return user_service.get_all(
        db=db,
        current_user=current_user,
        search=search,
        company_id=company_id,
        sort_by=sort_by,
        order=order,
        page=page,
        page_size=page_size,
    )


# -------------------------
# Get User By Id
# -------------------------
@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):

    return user_service.get_by_id(db, user_id, current_user)


# -------------------------
# Create User
# -------------------------
@router.post("/", response_model=UserResponse)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_permission("CREATE_USER")),
):

    return user_service.create(db, current_user, user)


# -------------------------
# Update User
# -------------------------
@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user: UserUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_permission("UPDATE_USER")),
):

    return user_service.update(db, current_user, user_id, user)


# -------------------------
# Change Password
# -------------------------
@router.put("/change-password/{user_id}", response_model=UserResponse)
def change_password(
    user_id: int,
    password: ChangePassword,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):

    return user_service.change_password(db, current_user, user_id, password)


# -------------------------
# Delete User
# -------------------------
@router.delete("/{user_id}", response_model=UserResponse)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(require_permission("DELETE_USER")),
):

    return user_service.delete(db, current_user, user_id)
