import os
import uuid
from fastapi import HTTPException, status, UploadFile
from sqlalchemy.orm import Session
from app.repositories.applicant_document_repository import ApplicantDocumentRepository
from app.repositories.applicant_repository import ApplicantRepository


class ApplicantDocumentService:
    def __init__(self):
        self.repository = ApplicantDocumentRepository()
        self.applicant_repository = ApplicantRepository()

    # ==================================================
    # PERMISSION CHECK
    # ==================================================
    def check_permission(
        self,
        current_user: dict,
        permission: str,
    ):
        user_permissions = current_user.get("permissions", [])
        if permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to perform this action",
            )

    # ==================================================
    # GET COMPANY ID
    # ==================================================
    def get_company_id(
        self,
        current_user: dict,
    ):
        company_id = current_user.get("company_id")
        if not company_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Company information not found for the current user",
            )
        return company_id

    # ==================================================
    # VERIFY APPLICANT
    # ==================================================
    def verify_applicant(
        self,
        db: Session,
        applicant_id: int,
        company_id: int,
    ):
        applicant = self.applicant_repository.get_by_id(
            db=db,
            applicant_id=applicant_id,
            company_id=company_id,
        )
        if not applicant:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Applicant not found",
            )
        return applicant

    # ==================================================
    # GET ALL DOCUMENTS
    # ==================================================
    def get_all(
        self,
        db: Session,
        applicant_id: int,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "VIEW_APPLICANT",
        )
        company_id = self.get_company_id(current_user)
        # ----------------------------------------------
        # VERIFY APPLICANT
        # ----------------------------------------------
        self.verify_applicant(
            db=db,
            applicant_id=applicant_id,
            company_id=company_id,
        )
        return self.repository.get_all(
            db=db,
            applicant_id=applicant_id,
            company_id=company_id,
        )

    # ==================================================
    # GET DOCUMENT BY ID
    # ==================================================
    def get_by_id(
        self,
        db: Session,
        document_id: int,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "VIEW_APPLICANT",
        )
        company_id = self.get_company_id(current_user)
        document = self.repository.get_by_id(
            db=db,
            document_id=document_id,
            company_id=company_id,
        )
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Applicant document not found",
            )
        return document

    # ==================================================
    # UPLOAD DOCUMENT
    # ==================================================
    async def upload(
        self,
        db: Session,
        applicant_id: int,
        document_type: str,
        file: UploadFile,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "CREATE_APPLICANT",
        )
        company_id = self.get_company_id(current_user)
        # ----------------------------------------------
        # VERIFY APPLICANT
        # ----------------------------------------------
        self.verify_applicant(
            db=db,
            applicant_id=applicant_id,
            company_id=company_id,
        )
        # ----------------------------------------------
        # VALIDATE FILE
        # ----------------------------------------------
        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Please select a file",
            )
        # ----------------------------------------------
        # ALLOWED FILE TYPES
        # ----------------------------------------------
        allowed_extensions = {
            ".pdf",
            ".doc",
            ".docx",
            ".jpg",
            ".jpeg",
            ".png",
        }
        original_filename = file.filename
        extension = os.path.splitext(original_filename)[1].lower()
        if extension not in allowed_extensions:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid file type. Allowed files: PDF, DOC, DOCX, JPG, JPEG and PNG.",
            )
        # ----------------------------------------------
        # UPLOAD DIRECTORY
        # ----------------------------------------------
        upload_directory = os.path.join(
            "uploads",
            "applicants",
            str(company_id),
            str(applicant_id),
        )
        os.makedirs(upload_directory, exist_ok=True)
        # ----------------------------------------------
        # UNIQUE FILE NAME
        # ----------------------------------------------
        unique_filename = f"{uuid.uuid4().hex}{extension}"
        file_path = os.path.join(upload_directory, unique_filename)
        # ----------------------------------------------
        # SAVE FILE
        # ----------------------------------------------
        try:
            contents = await file.read()
            with open(file_path, "wb") as buffer:
                buffer.write(contents)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to save uploaded file",
            )
        # ----------------------------------------------
        # SAVE DATABASE RECORD
        # ----------------------------------------------
        return self.repository.create(
            db=db,
            applicant_id=applicant_id,
            company_id=company_id,
            document_type=document_type,
            file_name=original_filename,
            file_path=file_path,
        )

    # ==================================================
    # DELETE DOCUMENT
    # ==================================================
    def delete(
        self,
        db: Session,
        document_id: int,
        current_user: dict,
    ):
        self.check_permission(
            current_user,
            "UPDATE_APPLICANT",
        )
        company_id = self.get_company_id(current_user)
        # ----------------------------------------------
        # GET DOCUMENT
        # ----------------------------------------------
        document = self.repository.get_by_id(
            db=db,
            document_id=document_id,
            company_id=company_id,
        )
        if not document:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Applicant document not found",
            )
        # ----------------------------------------------
        # DELETE PHYSICAL FILE
        # ----------------------------------------------
        if document.FilePath and os.path.exists(document.FilePath):
            try:
                os.remove(document.FilePath)
            except Exception:
                pass
        # ----------------------------------------------
        # DELETE DATABASE RECORD
        # ----------------------------------------------
        self.repository.delete(
            db=db,
            document_id=document_id,
            company_id=company_id,
        )
        return {"message": "Applicant document deleted successfully"}
