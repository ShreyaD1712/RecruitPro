from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.schemas.department_schema import (
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentResponse,
    DepartmentListResponse
)

from app.services.department_service import DepartmentService




router = APIRouter(
    prefix="/departments",
    tags=["Departments"]
)

service = DepartmentService()


# -------------------------------------
# Get All Departments
# -------------------------------------
@router.get(
    "/",
    response_model=DepartmentListResponse
)
def get_departments(
    search: str = "",
    company_id: int | None = Query(None),
    sort_by: str = "DepartmentName",
    order: str = "asc",
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1),

    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    
):

    return service.get_all_departments(
        db,
        current_user,
        search,
        company_id,
        sort_by,
        order,
        page,
        page_size
    )

# -------------------------------------
# Get Department By Id
# -------------------------------------
@router.get(
    "/{department_id}",
    response_model=DepartmentResponse
)
def get_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
   
):

    return service.get_department_by_id(
        db,
        department_id,
        current_user
    )

# -------------------------------------
# Create Department
# -------------------------------------
@router.post(
    "/",
    response_model=DepartmentResponse,
    status_code=201
)
def create_department(
    department: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    
):
    return service.create_department(
        db,
        department,
        current_user
    )


# -------------------------------------
# Update Department
# -------------------------------------
@router.put(
    "/{department_id}",
    response_model=DepartmentResponse
)
def update_department(
    department_id: int,
    department: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),

):
    return service.update_department(
        db,
        department_id,
        department,
        current_user
    )


# -------------------------------------
# Delete Department
# -------------------------------------
@router.delete("/{department_id}")
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return service.delete_department(
        db,
        department_id,
        current_user
    )