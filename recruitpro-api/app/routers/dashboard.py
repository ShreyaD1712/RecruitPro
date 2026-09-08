from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.services.dashboard_service import DashboardService
from app.schemas.dashboard_schema import DashboardResponse

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

service = DashboardService()


@router.get("/", response_model=DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db), current_user=Depends(get_current_user)
):
    return service.get_dashboard(db=db, current_user=current_user)
