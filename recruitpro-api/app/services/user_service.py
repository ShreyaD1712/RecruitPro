from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository
from app.schemas.user_schema import (
    UserCreate,
    UserUpdate,
    ChangePassword
)


class UserService:

    def __init__(self):
        self.user_repository = UserRepository()

    # -------------------------
    # Get All Users
    # -------------------------
    def get_all(
        self,
        db: Session,
        current_user: dict,
        search: str,
        company_id: int,
        sort_by: str,
        order: str,
        page: int,
        page_size: int
    ):

        return self.user_repository.get_all(
            db,
            current_user,
            search,
            company_id,
            sort_by,
            order,
            page,
            page_size
        )

    # -------------------------
    # Get By Id
    # -------------------------
    def get_by_id(
        self,
        db: Session,
        user_id: int
    ):

        user = self.user_repository.get_by_id(
            db,
            user_id
        )

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User Not Found"
            )

        return user

    # -------------------------
    # Create
    # -------------------------
    def create(
        self,
        db: Session,
        current_user: dict,
        user: UserCreate
    ):

        # Only Super Admin & Company Admin
        if current_user["role_id"] not in [1, 2]:

            raise HTTPException(
                status_code=403,
                detail="You are not authorized to create users."
            )

        # Company Admin -> Only Own Company
        if current_user["role_id"] == 2:

            if user.CompanyId != current_user["company_id"]:

                raise HTTPException(
                    status_code=403,
                    detail="Company Admin can create users only for their company."
                )

        existing = self.user_repository.get_by_email(
            db,
            user.Email
        )

        if existing:

            raise HTTPException(
                status_code=400,
                detail="Email already exists."
            )

        return self.user_repository.create(
            db,
            user
        )

    # -------------------------
    # Update
    # -------------------------
    def update(
        self,
        db: Session,
        current_user: dict,
        user_id: int,
        user: UserUpdate
    ):

        existing = self.user_repository.get_by_id(
            db,
            user_id
        )

        if not existing:

            raise HTTPException(
                status_code=404,
                detail="User Not Found"
            )

        if current_user["role_id"] not in [1, 2]:

            raise HTTPException(
                status_code=403,
                detail="You are not authorized."
            )

        if current_user["role_id"] == 2:

            if existing.CompanyId != current_user["company_id"]:

                raise HTTPException(
                    status_code=403,
                    detail="Access Denied."
                )

            if user.CompanyId != current_user["company_id"]:

                raise HTTPException(
                    status_code=403,
                    detail="Cannot move user to another company."
                )

        return self.user_repository.update(
            db,
            user_id,
            user
        )

    # -------------------------
    # Delete
    # -------------------------
    def delete(
        self,
        db: Session,
        current_user: dict,
        user_id: int
    ):

        existing = self.user_repository.get_by_id(
            db,
            user_id
        )

        if not existing:

            raise HTTPException(
                status_code=404,
                detail="User Not Found"
            )

        if current_user["role_id"] not in [1, 2]:

            raise HTTPException(
                status_code=403,
                detail="You are not authorized."
            )

        if current_user["role_id"] == 2:

            if existing.CompanyId != current_user["company_id"]:

                raise HTTPException(
                    status_code=403,
                    detail="Access Denied."
                )

        return self.user_repository.delete(
            db,
            user_id
        )

    # -------------------------
    # Change Password
    # -------------------------
    def change_password(
        self,
        db: Session,
        current_user: dict,
        user_id: int,
        password: ChangePassword
    ):

        existing = self.user_repository.get_by_id(
            db,
            user_id
        )

        if not existing:

            raise HTTPException(
                status_code=404,
                detail="User Not Found"
            )

        if current_user["role_id"] not in [1, 2]:

            raise HTTPException(
                status_code=403,
                detail="You are not authorized."
            )

        if current_user["role_id"] == 2:

            if existing.CompanyId != current_user["company_id"]:

                raise HTTPException(
                    status_code=403,
                    detail="Access Denied."
                )

        return self.user_repository.change_password(
            db,
            user_id,
            password.Password
        )