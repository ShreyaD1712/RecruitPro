from fastapi import Depends, HTTPException, status

from app.dependencies import get_current_user


def admin_only(current_user=Depends(get_current_user)):
    if current_user["role_id"] != 1:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user


def hr_only(current_user=Depends(get_current_user)):
    if current_user["role_id"] != 2:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="HR access required"
        )
    return current_user


def interviewer_only(current_user=Depends(get_current_user)):
    if current_user["role_id"] != 3:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Interviewer access required"
        )
    return current_user


def recruiter_only(current_user=Depends(get_current_user)):
    if current_user["role_id"] != 4:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Recruiter access required"
        )
    return current_user