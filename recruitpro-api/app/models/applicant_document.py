from sqlalchemy import Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


class ApplicantDocument(Base):

    __tablename__ = "ApplicantDocuments"

    # ==================================================
    # PRIMARY KEY
    # ==================================================
    DocumentId = Column(Integer, primary_key=True, index=True)

    # ==================================================
    # COMPANY
    # ==================================================
    CompanyId = Column(Integer, nullable=False)

    # ==================================================
    # APPLICANT
    # ==================================================
    ApplicantId = Column(Integer, ForeignKey("Applicants.ApplicantId"), nullable=False)

    # ==================================================
    # DOCUMENT INFORMATION
    # ==================================================
    DocumentType = Column(String(100), nullable=False)

    FileName = Column(String(255), nullable=False)

    FilePath = Column(String(255), nullable=False)

    UploadedOn = Column(DateTime, nullable=True)

    # ==================================================
    # RELATIONSHIPS
    # ==================================================
    applicant = relationship("Applicant", back_populates="documents")
