from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.repositories.user_repository import UserRepository
from app.schemas.user_schema import UserCreate, UserUpdate, ChangePassword


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
        page_size: int,
    ):

        return self.user_repository.get_all(
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
    # Get By Id
    # -------------------------
    def get_by_id(self, db: Session, user_id: int, current_user: dict):

        user = self.user_repository.get_by_id(db, user_id)

        if not user:
            raise HTTPException(status_code=404, detail="User Not Found")

        # Company users can access only their own company users
        if (
            not current_user["is_super_admin"]
            and user.CompanyId != current_user["company_id"]
        ):
            raise HTTPException(status_code=403, detail="Access Denied")

        return user

    # -------------------------
    # Create User
    # -------------------------
    def create(self, db: Session, current_user: dict, user: UserCreate):

        # Company users can create users only in their own company
        if not current_user["is_super_admin"]:
            user.CompanyId = current_user["company_id"]

        existing = self.user_repository.get_by_email(db, user.Email)

        if existing:
            raise HTTPException(status_code=400, detail="Email already exists.")

        return self.user_repository.create(db, user)

    # -------------------------
    # Update User
    # -------------------------
    def update(self, db: Session, current_user: dict, user_id: int, user: UserUpdate):

        existing = self.user_repository.get_by_id(db, user_id)

        if not existing:
            raise HTTPException(status_code=404, detail="User Not Found")

        # Company users can update only their own company users
        if (
            not current_user["is_super_admin"]
            and existing.CompanyId != current_user["company_id"]
        ):
            raise HTTPException(status_code=403, detail="Access Denied.")

        if not current_user["is_super_admin"]:
            user.CompanyId = current_user["company_id"]

        return self.user_repository.update(db, user_id, user)

    # -------------------------
    # Delete User
    # -------------------------
    def delete(self, db: Session, current_user: dict, user_id: int):

        existing = self.user_repository.get_by_id(db, user_id)

        if not existing:
            raise HTTPException(status_code=404, detail="User Not Found")

        if (
            not current_user["is_super_admin"]
            and existing.CompanyId != current_user["company_id"]
        ):
            raise HTTPException(status_code=403, detail="Access Denied.")

        self.user_repository.delete(db, user_id)

        return {"message": "User deleted successfully"}

    # -------------------------
    # Change Password
    # -------------------------
    def change_password(
        self, db: Session, current_user: dict, user_id: int, password: ChangePassword
    ):

        existing = self.user_repository.get_by_id(db, user_id)

        if not existing:
            raise HTTPException(status_code=404, detail="User Not Found")

        if (
            not current_user["is_super_admin"]
            and existing.CompanyId != current_user["company_id"]
        ):
            raise HTTPException(status_code=403, detail="Access Denied.")

        return self.user_repository.change_password(db, user_id, password.Password)
