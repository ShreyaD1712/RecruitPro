from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# ==================================================
# DOCUMENT RESPONSE
# ==================================================
class ApplicantDocumentResponse(BaseModel):

    DocumentId: int
    CompanyId: int
    ApplicantId: int

    DocumentType: str
    FileName: str
    FilePath: str

    UploadedOn: Optional[datetime] = None

    class Config:
        from_attributes = True
