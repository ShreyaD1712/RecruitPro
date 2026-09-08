from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.dashboard_repository import DashboardRepository


class DashboardService:

    def __init__(self):
        self.repository = DashboardRepository()

    def get_dashboard(self, db: Session, current_user: dict):

        role_id = current_user.get("role_id")
        company_id = current_user.get("company_id")

        # -------------------------
        # Super Admin
        # -------------------------
        if role_id == 1:

            stats = self.repository.get_stats(db=db, company_id=None)

            stats["TotalCompanies"] = self.repository.get_total_companies(db)

            return {
                "Stats": stats,
                "ApplicationsByStatus": self.repository.get_applications_by_status(
                    db=db, company_id=None
                ),
                "ApplicationsByDepartment": self.repository.get_applications_by_department(
                    db=db, company_id=None
                ),
                "ApplicationsByCompany": self.repository.get_applications_by_company(
                    db
                ),
            }

        # -------------------------
        # Company Users
        # -------------------------
        if not company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Company information not found for the current user",
            )

        stats = self.repository.get_stats(db=db, company_id=company_id)

        stats["TotalCompanies"] = 0

        return {
            "Stats": stats,
            "ApplicationsByStatus": self.repository.get_applications_by_status(
                db=db, company_id=company_id
            ),
            "ApplicationsByDepartment": self.repository.get_applications_by_department(
                db=db, company_id=company_id
            ),
            "ApplicationsByCompany": [],
        }
