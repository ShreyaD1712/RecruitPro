from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.company_repository import CompanyRepository
from app.schemas.company_schema import CompanyCreate, CompanyUpdate


class CompanyService:

    def __init__(self):
        self.repository = CompanyRepository()

    def get_all_companies(
        self,
        db: Session,
        search: str = "",
        sort_by: str = "CompanyName",
        order: str = "asc",
        page: int = 1,
        page_size: int = 10
    ):
        return self.repository.get_all(
            db,
            search,
            sort_by,
            order,
            page,
            page_size
        )

    def get_company_by_id(self, db: Session, company_id: int, current_user):

        #Super Admin
        if current_user["role_id"] == 1:
            company = self.repository.get_by_id(db, company_id)
        else:
            # Company users can access only their own company
            if company_id != current_user["company_id"]:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to access this company"
                )
            company = self.repository.get_by_id(db, company_id)

        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company not found"
            )

        return company

    def create_company(self, db: Session, company: CompanyCreate, current_user):

        # Only Super Admin can create companies
        if current_user["role_id"] != 1:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to create companies"
            )

        # Validate Company Code
        existing_code = self.repository.get_by_code(db, company.CompanyCode)
        if existing_code:
            raise HTTPException(
                status_code=400,
                detail="Company Code already exists"
            )

        # Validate Company Name
        existing_name = self.repository.get_by_name(db, company.CompanyName)
        if existing_name:
            raise HTTPException(
                status_code=400,
                detail="Company Name already exists"
            )

        # Validate Email
        existing_email = self.repository.get_by_email(db, company.Email)
        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="Email already exists"
            )

        return self.repository.create(db, company)

    def update_company(
        self,
        db: Session,
        company_id: int,
        company: CompanyUpdate,
        current_user
    ):

        # Only Super Admin can update companies
        if current_user["role_id"] != 1:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to update companies"
            )
        updated_company = self.repository.update(
            db,
            company_id,
            company
        )

        if not updated_company:
            raise HTTPException(
                status_code=404,
                detail="Company not found"
            )

        return updated_company

    def delete_company(self, db: Session, company_id: int, current_user):

        # Only Super Admin can delete companies
        if current_user["role_id"] != 1:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to delete companies"
            )

        deleted_company = self.repository.delete(db, company_id)

        if not deleted_company:
            raise HTTPException(
                status_code=404,
                detail="Company not found"
            )

        return {
            "message": "Company deleted successfully"
        }