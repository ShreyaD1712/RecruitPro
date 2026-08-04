from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload
from datetime import datetime
from app.models.user import User
from app.models.company import Company
from app.models.department import Department
from app.models.role import Role
from app.schemas.user_schema import UserCreate, UserUpdate


class UserRepository:
    # -------------------------
    # Get All Users
    # -------------------------
    def get_all(
        self,
        db: Session,
        current_user: dict,
        search: str = "",
        company_id: int = None,
        sort_by: str = "FirstName",
        order: str = "asc",
        page: int = 1,
        page_size: int = 10,
    ):
        query = db.query(User).options(
            joinedload(User.company), joinedload(User.department), joinedload(User.role)
        )
        # -------------------------
        # Company Filter
        # -------------------------
        if current_user["role_id"] == 1:
            if company_id:
                query = query.filter(User.CompanyId == company_id)
        else:
            query = query.filter(User.CompanyId == current_user["company_id"])
        # -------------------------
        # Search
        # -------------------------
        if search:
            query = query.filter(
                or_(
                    User.FirstName.ilike(f"%{search}%"),
                    User.LastName.ilike(f"%{search}%"),
                    User.Email.ilike(f"%{search}%"),
                    User.MobileNo.ilike(f"%{search}%"),
                )
            )
        # -------------------------
        # Sorting
        # -------------------------
        if sort_by == "CompanyName":
            query = query.join(Company)
            column = Company.CompanyName
        elif sort_by == "DepartmentName":
            query = query.join(Department)
            column = Department.DepartmentName
        elif sort_by == "RoleName":
            query = query.join(Role)
            column = Role.RoleName
        else:
            column = getattr(User, sort_by, User.FirstName)
        if order.lower() == "desc":
            query = query.order_by(column.desc())
        else:
            query = query.order_by(column.asc())
        total_records = query.count()
        users = query.offset((page - 1) * page_size).limit(page_size).all()
        return {
            "total_records": total_records,
            "page": page,
            "page_size": page_size,
            "data": users,
        }

    # -------------------------
    # Get By Id
    # -------------------------
    def get_by_id(self, db: Session, user_id: int):
        return (
            db.query(User)
            .options(
                joinedload(User.company),
                joinedload(User.department),
                joinedload(User.role),
            )
            .filter(User.UserId == user_id)
            .first()
        )

    # -------------------------
    # Get By Email
    # -------------------------
    def get_by_email(self, db: Session, email: str):
        return db.query(User).filter(User.Email == email).first()

    # -------------------------
    # Create
    # -------------------------
    def create(self, db: Session, user: UserCreate):
        new_user = User(
            FirstName=user.FirstName,
            LastName=user.LastName,
            Email=user.Email,
            Password=user.Password,
            MobileNo=user.MobileNo,
            CompanyId=user.CompanyId,
            DepartmentId=user.DepartmentId,
            RoleId=user.RoleId,
            IsActive=user.IsActive,
            CreatedOn=datetime.now(),
            CreatedBy=1,
            UpdatedOn=datetime.now(),
            UpdatedBy=1,
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        return self.get_by_id(db, new_user.UserId)

    # -------------------------
    # Update
    # -------------------------
    def update(self, db: Session, user_id: int, user: UserUpdate):
        existing_user = db.query(User).filter(User.UserId == user_id).first()
        if not existing_user:
            return None
        existing_user.FirstName = user.FirstName
        existing_user.LastName = user.LastName
        existing_user.Email = user.Email
        existing_user.MobileNo = user.MobileNo
        existing_user.CompanyId = user.CompanyId
        existing_user.DepartmentId = user.DepartmentId
        existing_user.RoleId = user.RoleId
        existing_user.IsActive = user.IsActive
        existing_user.UpdatedOn = datetime.now()
        existing_user.UpdatedBy = 1
        db.commit()
        db.refresh(existing_user)
        return self.get_by_id(db, existing_user.UserId)

    # -------------------------
    # Change Password
    # -------------------------
    def change_password(self, db: Session, user_id: int, password: str):
        user = db.query(User).filter(User.UserId == user_id).first()
        if not user:
            return None
        user.Password = password
        user.UpdatedOn = datetime.now()
        db.commit()
        db.refresh(user)
        return user

    # -------------------------
    # Delete
    # -------------------------
    def delete(self, db: Session, user_id: int):
        user = db.query(User).filter(User.UserId == user_id).first()
        if not user:
            return None
        db.delete(user)
        db.commit()
        return user
