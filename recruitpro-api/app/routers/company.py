from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_current_user
from app.database import get_db
from app.permission_dependency import require_permission
from app.schemas.company_schema import (
    CompanyCreate,
    CompanyListResponse,
    CompanyUpdate,
    CompanyResponse,
)

from app.services.company_service import CompanyService

router = APIRouter(prefix="/companies", tags=["Companies"])

company_service = CompanyService()


@router.get("/", response_model=CompanyListResponse)
def get_companies(
    search: str = "",
    sort_by: str = "CompanyName",
    order: str = "asc",
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission("VIEW_COMPANY")
    ),  # Only users with 'view_companies' permission can access this endpoint
):
    return company_service.get_all_companies(
        db, search, sort_by, order, page, page_size
    )


@router.get("/{company_id}", response_model=CompanyResponse)
def get_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        get_current_user
    ),  # Allow both admin and regular users to access this endpoint
):
    return company_service.get_company_by_id(db, company_id, current_user)


@router.post("/", response_model=CompanyResponse)
def create_company(
    company: CompanyCreate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission("CREATE_COMPANY")
    ),  # Only users with 'create_company' permission can access this endpoint
):
    return company_service.create_company(db, company, current_user)


@router.put("/{company_id}", response_model=CompanyResponse)
def update_company(
    company_id: int,
    company: CompanyUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission("UPDATE_COMPANY")
    ),  # Only users with 'update_company' permission can access this endpoint
):
    return company_service.update_company(db, company_id, company, current_user)


@router.delete("/{company_id}")
def delete_company(
    company_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(
        require_permission("DELETE_COMPANY")
    ),  # Only users with 'delete_company' permission can access this endpoint
):
    return company_service.delete_company(db, company_id, current_user)
