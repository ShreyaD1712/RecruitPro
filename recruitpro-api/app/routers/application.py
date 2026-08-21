from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.application_schema import (
    ApplicationCreate,
    ApplicationUpdate,
)
from app.permission_dependency import require_permission
from app.services.application_service import ApplicationService

router = APIRouter(
    prefix="/applications",
    tags=["Applications"],
)
service = ApplicationService()


# ==================================================
# Get All Applications
# ==================================================
@router.get("/")
def get_all_applications(
    search: str = "",
    job_opening_id: int | None = None,
    department_id: int | None = None,
    Current_Status: str | None = None,
    sort_by: str = "AppliedDate",
    order: str = "desc",
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_APPLICATION")),
):
    return service.get_all_applications(
        db=db,
        current_user=current_user,
        search=search,
        job_opening_id=job_opening_id,
        department_id=department_id,
        Current_Status=Current_Status,
        sort_by=sort_by,
        order=order,
        page=page,
        page_size=page_size,
    )


# ==================================================
# Get Application By ID
# ==================================================
@router.get("/{application_id}")
def get_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_APPLICATION")),
):
    return service.get_application_by_id(
        db=db,
        application_id=application_id,
        current_user=current_user,
    )


# ==================================================
# Create Application
# ==================================================
@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
)
def create_application(
    application: ApplicationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("CREATE_APPLICATION")),
):
    return service.create_application(
        db=db,
        application=application,
        current_user=current_user,
    )


# ==================================================
# Update Application
# ==================================================
@router.put("/{application_id}")
def update_application(
    application_id: int,
    application: ApplicationUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("UPDATE_APPLICATION")),
):
    return service.update_application(
        db=db,
        application_id=application_id,
        application=application,
        current_user=current_user,
    )


# ==================================================
# Delete Application
# ==================================================
@router.delete("/{application_id}")
def delete_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("DELETE_APPLICATION")),
):
    return service.delete_application(
        db=db,
        application_id=application_id,
        current_user=current_user,
    )
