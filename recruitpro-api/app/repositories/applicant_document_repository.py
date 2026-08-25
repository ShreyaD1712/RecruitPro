from datetime import datetime
from sqlalchemy.orm import Session
from app.models.applicant_document import ApplicantDocument


class ApplicantDocumentRepository:
    # ==================================================
    # GET ALL DOCUMENTS FOR APPLICANT
    # ==================================================
    def get_all(
        self,
        db: Session,
        applicant_id: int,
        company_id: int,
    ):
        return (
            db.query(ApplicantDocument)
            .filter(
                ApplicantDocument.ApplicantId == applicant_id,
                ApplicantDocument.CompanyId == company_id,
            )
            .order_by(ApplicantDocument.UploadedOn.desc())
            .all()
        )

    # ==================================================
    # GET DOCUMENT BY ID
    # ==================================================
    def get_by_id(
        self,
        db: Session,
        document_id: int,
        company_id: int,
    ):
        return (
            db.query(ApplicantDocument)
            .filter(
                ApplicantDocument.DocumentId == document_id,
                ApplicantDocument.CompanyId == company_id,
            )
            .first()
        )

    # ==================================================
    # CREATE
    # ==================================================
    def create(
        self,
        db: Session,
        applicant_id: int,
        company_id: int,
        document_type: str,
        file_name: str,
        file_path: str,
    ):
        new_document = ApplicantDocument(
            CompanyId=company_id,
            ApplicantId=applicant_id,
            DocumentType=document_type,
            FileName=file_name,
            FilePath=file_path,
            UploadedOn=datetime.now(),
        )
        db.add(new_document)
        db.commit()
        db.refresh(new_document)
        return new_document

    # ==================================================
    # DELETE
    # ==================================================
    def delete(
        self,
        db: Session,
        document_id: int,
        company_id: int,
    ):
        document = self.get_by_id(
            db=db,
            document_id=document_id,
            company_id=company_id,
        )
        if not document:
            return None
        db.delete(document)
        db.commit()
        return document
