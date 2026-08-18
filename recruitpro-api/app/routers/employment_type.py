from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db

from app.schemas.employment_type_schema import (
    EmploymentTypeCreate,
    EmploymentTypeUpdate,
)

from app.permission_dependency import require_permission

from app.services.employment_type_service import EmploymentTypeService

router = APIRouter(
    prefix="/employment-types",
    tags=["Employment Types"],
)


service = EmploymentTypeService()


# -------------------------
# Get All Employment Types
# -------------------------


@router.get("/")
def get_all_employment_types(
    search: str = "",
    sort_by: str = "EmploymentTypeName",
    order: str = "asc",
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_EMPLOYMENT_TYPE")),
):

    return service.get_all_employment_types(
        db=db,
        current_user=current_user,
        search=search,
        sort_by=sort_by,
        order=order,
        page=page,
        page_size=page_size,
    )


# -------------------------
# Get Employment Type By ID
# -------------------------


@router.get("/{employment_type_id}")
def get_employment_type(
    employment_type_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_EMPLOYMENT_TYPE")),
):

    return service.get_employment_type_by_id(
        db=db,
        employment_type_id=employment_type_id,
        current_user=current_user,
    )


# -------------------------
# Create Employment Type
# -------------------------


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
def create_employment_type(
    employment_type: EmploymentTypeCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("CREATE_EMPLOYMENT_TYPE")),
):

    return service.create_employment_type(
        db=db,
        employment_type=employment_type,
        current_user=current_user,
    )


# -------------------------
# Update Employment Type
# -------------------------


@router.put("/{employment_type_id}")
def update_employment_type(
    employment_type_id: int,
    employment_type: EmploymentTypeUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("UPDATE_EMPLOYMENT_TYPE")),
):

    return service.update_employment_type(
        db=db,
        employment_type_id=employment_type_id,
        employment_type=employment_type,
        current_user=current_user,
    )


# -------------------------
# Delete Employment Type
# -------------------------


@router.delete("/{employment_type_id}")
def delete_employment_type(
    employment_type_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("DELETE_EMPLOYMENT_TYPE")),
):

    return service.delete_employment_type(
        db=db,
        employment_type_id=employment_type_id,
        current_user=current_user,
    )
