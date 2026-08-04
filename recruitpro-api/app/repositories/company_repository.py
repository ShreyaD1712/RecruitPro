from sqlalchemy import or_
from sqlalchemy.orm import Session
from datetime import datetime
from app.models.company import Company
from app.schemas.company_schema import CompanyCreate, CompanyUpdate

class CompanyRepository:
    def get_all(
        self,
        db: Session,
        search: str = "",
        sort_by: str = "CompanyName",
        order: str = "asc",
        page: int = 1,
        page_size: int = 10,
    ):
        query = db.query(Company)
        if search:
            query = query.filter(
                or_(
                    Company.CompanyName.ilike(f"%{search}%"),
                    Company.CompanyCode.ilike(f"%{search}%"),
                )
            )
        column = getattr(Company, sort_by, Company.CompanyName)
        if order.lower() == "desc":
            query = query.order_by(column.desc())
        else:
            query = query.order_by(column.asc())
        total_records = query.count()
        companies = query.offset((page - 1) * page_size).limit(page_size).all()
        return {
            "total_records": total_records,
            "page": page,
            "page_size": page_size,
            "data": companies,
        }

    def get_by_id(self, db: Session, company_id: int):
        return db.query(Company).filter(Company.CompanyId == company_id).first()

    # ===========================
    # Validation Methods
    # ===========================
    def get_by_code(self, db: Session, company_code: str):
        return db.query(Company).filter(Company.CompanyCode == company_code).first()

    def get_by_name(self, db: Session, company_name: str):
        return db.query(Company).filter(Company.CompanyName == company_name).first()

    def get_by_email(self, db: Session, email: str):
        return db.query(Company).filter(Company.Email == email).first()

    def create(self, db: Session, company: CompanyCreate):
        new_company = Company(
            CompanyCode=company.CompanyCode,
            CompanyName=company.CompanyName,
            Email=company.Email,
            Phone=company.Phone,
            Website=company.Website,
            Address=company.Address,
            IsActive=company.IsActive,
            CreatedOn=datetime.now(),
            CreatedBy=1,
            UpdatedOn=datetime.now(),
            UpdatedBy=1,
        )
        db.add(new_company)
        db.commit()
        db.refresh(new_company)
        return new_company

    def update(self, db: Session, company_id: int, company: CompanyUpdate):
        existing_company = (
            db.query(Company).filter(Company.CompanyId == company_id).first()
        )
        if not existing_company:
            return None
        existing_company.CompanyCode = company.CompanyCode
        existing_company.CompanyName = company.CompanyName
        existing_company.Email = company.Email
        existing_company.Phone = company.Phone
        existing_company.Website = company.Website
        existing_company.Address = company.Address
        existing_company.IsActive = company.IsActive
        existing_company.UpdatedOn = datetime.now()
        existing_company.UpdatedBy = 1
        db.commit()
        db.refresh(existing_company)
        return existing_company

    def delete(self, db: Session, company_id: int):
        company = db.query(Company).filter(Company.CompanyId == company_id).first()
        if not company:
            return None
        db.delete(company)
        db.commit()
        return company
