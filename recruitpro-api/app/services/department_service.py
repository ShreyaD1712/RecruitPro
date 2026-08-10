from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.repositories.department_repository import DepartmentRepository
from app.schemas.department_schema import DepartmentCreate, DepartmentUpdate


class DepartmentService:

    def __init__(self):
        self.repository = DepartmentRepository()

    # -------------------------
    # Get All Departments
    # -------------------------
    def get_all_departments(
        self,
        db: Session,
        current_user,
        search: str = "",
        company_id: int = None,
        sort_by: str = "DepartmentName",
        order: str = "asc",
        page: int = 1,
        page_size: int = 10,
    ):

        return self.repository.get_all(
            db, current_user, search, company_id, sort_by, order, page, page_size
        )

    # -------------------------
    # Get Department By Id
    # -------------------------
    def get_department_by_id(self, db: Session, department_id: int, current_user):

        department = self.repository.get_by_id(db, department_id)

        if not department:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Department not found"
            )
        # Company admin can access only their company department
        if (
            not current_user["is_super_admin"]
            and department.CompanyId != current_user["company_id"]
        ):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to access this department",
            )
        return department

    # -------------------------
    # Create Department
    # -------------------------
    def create_department(
        self, db: Session, department: DepartmentCreate, current_user
    ):
        # Company admin can create department only for their company
        if not current_user["is_super_admin"]:
            department.CompanyId = current_user["company_id"]

        # Check duplicate department code in same company
        existing_code = self.repository.get_by_code(
            db, department.DepartmentCode, department.CompanyId
        )

        if existing_code:
            raise HTTPException(
                status_code=400, detail="Department Code already exists in this company"
            )

        # Check duplicate department name in same company
        existing_name = self.repository.get_by_name(
            db, department.DepartmentName, department.CompanyId
        )

        if existing_name:
            raise HTTPException(
                status_code=400, detail="Department Name already exists in this company"
            )

        return self.repository.create(db, department)

    # -------------------------
    # Update Department
    # -------------------------
    def update_department(
        self,
        db: Session,
        department_id: int,
        department: DepartmentUpdate,
        current_user,
    ):

        existing_department = self.repository.get_by_id(db, department_id)

        if not existing_department:
            raise HTTPException(status_code=404, detail="Department not found")

        # Company Admin can update only own company
        if (
            not current_user["is_super_admin"]
            and existing_department.CompanyId != current_user["company_id"]
        ):
            raise HTTPException(
                status_code=403,
                detail="You are not authorized to update this department.",
            )

        if not current_user["is_super_admin"]:
            department.CompanyId = current_user["company_id"]
        # Duplicate Department Code
        duplicate_code = self.repository.get_by_code(
            db, department.DepartmentCode, department.CompanyId
        )

        if duplicate_code and duplicate_code.DepartmentId != department_id:
            raise HTTPException(
                status_code=400, detail="Department Code already exists in this company"
            )

        # Duplicate Department Name
        duplicate_name = self.repository.get_by_name(
            db, department.DepartmentName, department.CompanyId
        )

        if duplicate_name and duplicate_name.DepartmentId != department_id:
            raise HTTPException(
                status_code=400, detail="Department Name already exists in this company"
            )

        return self.repository.update(db, department_id, department)

    # -------------------------
    # Delete Department
    # -------------------------
    def delete_department(self, db: Session, department_id: int, current_user):
        department = self.repository.get_by_id(db, department_id)
        if not department:
            raise HTTPException(status_code=404, detail="Department not found")
        # Company Admin can delete only own company
        if (
            not current_user["is_super_admin"]
            and department.CompanyId != current_user["company_id"]
        ):
            raise HTTPException(
                status_code=403,
                detail="You are not authorized to delete this department.",
            )

        self.repository.delete(db, department_id)

        return {"message": "Department deleted successfully"}
