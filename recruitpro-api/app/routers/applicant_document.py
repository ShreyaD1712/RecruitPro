from fastapi import (
    APIRouter,
    Depends,
    File,
    Form,
    UploadFile,
)
from sqlalchemy.orm import Session
from app.database import get_db
from app.permission_dependency import require_permission
from app.services.applicant_document_service import ApplicantDocumentService

router = APIRouter(
    prefix="/applicant-documents",
    tags=["Applicant Documents"],
)
service = ApplicantDocumentService()


# ==================================================
# GET ALL DOCUMENTS FOR APPLICANT
# ==================================================
@router.get("/")
def get_all_documents(
    applicant_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_APPLICANT")),
):
    return service.get_all(
        db=db,
        applicant_id=applicant_id,
        current_user=current_user,
    )


# ==================================================
# GET DOCUMENT BY ID
# ==================================================
@router.get("/{document_id}")
def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("VIEW_APPLICANT")),
):
    return service.get_by_id(
        db=db,
        document_id=document_id,
        current_user=current_user,
    )


# ==================================================
# UPLOAD DOCUMENT
# ==================================================
@router.post("/")
async def upload_document(
    applicant_id: int = Form(...),
    document_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("CREATE_APPLICANT")),
):
    return await service.upload(
        db=db,
        applicant_id=applicant_id,
        document_type=document_type,
        file=file,
        current_user=current_user,
    )


# ==================================================
# DELETE DOCUMENT
# ==================================================
@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_permission("UPDATE_APPLICANT")),
):
    return service.delete(
        db=db,
        document_id=document_id,
        current_user=current_user,
    )
