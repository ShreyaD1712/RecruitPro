from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models.user import User
from app.schemas.auth_schema import RegisterRequest
from app.auth.password import hash_password
import traceback

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

@router.post("/register")
def register(request: RegisterRequest, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(
        User.Email == request.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already exists"
        )

    try:
        user = User(
            FirstName=request.first_name,
            LastName=request.last_name,
            Email=request.email,
            PasswordHash=hash_password(request.password),
            PhoneNumber=request.phone_number,
            RoleId=request.role_id,
            CompanyId=request.company_id,
            DepartmentId=request.department_id,
            IsActive=True,
            CreatedAt=datetime.utcnow()
        )

        db.add(user)
        db.commit()
        db.refresh(user)

        return {
            "message": "User Registered Successfully"
        }

    except Exception as e:
        db.rollback()

        print("\n========== ERROR ==========")
        print(type(e))
        print(e)
        traceback.print_exc()
        print("===========================\n")

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )