from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.auth.jwt_handler import verify_token
from app.database import get_db
from app.models.user import User
from app.models.role_permission import RolePermission

security = HTTPBearer()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
):
    token = credentials.credentials

    payload = verify_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or Expired Token",
        )

    user = db.query(User).filter(User.UserId == payload["user_id"]).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    permissions = [
        p.PermissionName
        for p in db.query(RolePermission)
        .filter(
            RolePermission.RoleId == user.RoleId,
            RolePermission.IsActive == True,
        )
        .all()
    ]

    payload["permissions"] = permissions

    return payload
