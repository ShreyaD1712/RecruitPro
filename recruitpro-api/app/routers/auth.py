from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.schemas.auth_schema import LoginRequest
from app.auth.jwt_handler import create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# ===========================================
# Angular Login (JSON)
# ===========================================
@router.post("/login")
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.Email == request.email
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if request.password != user.Password:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not user.IsActive:
        raise HTTPException(
            status_code=403,
            detail="User account is inactive"
        )

    access_token = create_access_token(
        data={
            "sub": user.Email,
            "user_id": user.UserId,
            "role_id": user.RoleId,
            "company_id": user.CompanyId
        }
    )

    return {
        "message": "Login Successful",
        "access_token": access_token,
        "token_type": "bearer"
    }


# ===========================================
# Swagger OAuth Login
# ===========================================
@router.post("/token")
def token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    user = db.query(User).filter(
        User.Email == form_data.username
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if form_data.password != user.Password:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not user.IsActive:
        raise HTTPException(
            status_code=403,
            detail="User account is inactive"
        )

    access_token = create_access_token(
        data={
            "sub": user.Email,
            "user_id": user.UserId,
            "role_id": user.RoleId,
            "company_id": user.CompanyId
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer"
    }