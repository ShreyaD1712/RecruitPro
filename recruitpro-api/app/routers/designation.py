from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user

from app.schemas.designation_schema import (
    DesignationCreate,
    DesignationUpdate,
    DesignationResponse,
    DesignationListResponse
)

from app.services.designation_service import DesignationService


router = APIRouter(
    prefix="/designations",
    tags=["Designations"]
)

service = DesignationService()


# -------------------------------------
# Get All Designations
# -------------------------------------
@router.get(
    "/",
    response_model=DesignationListResponse
)
def get_designations(
    search: str = "",
    company_id: int | None = None,
    department_id: int | None = None,
    sort_by: str = "DesignationName",
    order: str = "asc",
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1),

    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),

):

    return service.get_all_designations(
        db,
        current_user,
        search,
        company_id,
        department_id,
        sort_by,
        order,
        page,
        page_size
    )


# -------------------------------------
# Get Designation By Id
# -------------------------------------
@router.get(
    "/{designation_id}",
    response_model=DesignationResponse
)
def get_designation(
    designation_id: int,
    db: Session = Depends(get_db),

):

    return service.get_designation_by_id(
        db,
        designation_id
    )


# -------------------------------------
# Create Designation
# -------------------------------------
@router.post(
    "/",
    response_model=DesignationResponse,
    status_code=201
)
def create_designation(
    designation: DesignationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    return service.create_designation(
        db,
        designation,
        current_user
    )

# -------------------------------------
# Update Designation
# -------------------------------------
@router.put(
    "/{designation_id}",
    response_model=DesignationResponse
)
def update_designation(
    designation_id: int,
    designation: DesignationUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    return service.update_designation(
        db,
        designation_id,
        designation,
        current_user
    )

# -------------------------------------
# Delete Designation
# -------------------------------------
@router.delete("/{designation_id}")
def delete_designation(
    designation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return service.delete_designation(
        db,
        designation_id,
        current_user
    )