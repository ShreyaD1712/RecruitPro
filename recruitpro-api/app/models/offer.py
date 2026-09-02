from sqlalchemy import Column, Integer, String, DateTime, Date, Numeric
from sqlalchemy.orm import relationship
from app.database import Base


class Offer(Base):
    __tablename__ = "Offers"

    # ==================================================
    # PRIMARY KEY
    # ==================================================
    OfferId = Column(Integer, primary_key=True, index=True)

    # ==================================================
    # COMPANY
    # ==================================================
    CompanyId = Column(Integer, nullable=False)

    # ==================================================
    # APPLICATION
    # ==================================================
    ApplicationId = Column(Integer, nullable=False)

    # ==================================================
    # OFFER INFORMATION
    # ==================================================
    OfferedSalary = Column(Numeric(18, 2), nullable=True)

    JoiningDate = Column(Date, nullable=True)

    OfferDate = Column(Date, nullable=True)

    OfferStatus = Column(String(50), nullable=True)

    Remarks = Column(String(500), nullable=True)

    # ==================================================
    # AUDIT
    # ==================================================
    CreatedOn = Column(DateTime, nullable=True)

    CreatedBy = Column(Integer, nullable=True)

    UpdatedOn = Column(DateTime, nullable=True)

    UpdatedBy = Column(Integer, nullable=True)

    # ==================================================
    # RELATIONSHIPS
    # ==================================================
    application = relationship(
        "Application",
        primaryjoin="foreign(Offer.ApplicationId) == Application.ApplicationId",
        viewonly=True,
    )

    # ==================================================
    # DISPLAY PROPERTIES
    # ==================================================
    @property
    def ApplicantName(self):
        if self.application and self.application.applicant:
            return (
                f"{self.application.applicant.FirstName} "
                f"{self.application.applicant.LastName}"
            )
        return None

    @property
    def JobTitle(self):
        if self.application and self.application.job_opening:
            return self.application.job_opening.JobTitle
        return None

    @property
    def DepartmentName(self):
        if (
            self.application
            and self.application.job_opening
            and self.application.job_opening.department
        ):
            return self.application.job_opening.department.DepartmentName
        return None

    @property
    def DesignationName(self):
        if (
            self.application
            and self.application.job_opening
            and self.application.job_opening.designation
        ):
            return self.application.job_opening.designation.DesignationName
        return None

    @property
    def ApplicationStatus(self):
        if self.application:
            return self.application.CurrentStatus
        return None

    @property
    def AppliedDate(self):
        if self.application:
            return self.application.AppliedDate
        return None

    @property
    def ApplicantEmail(self):
        if self.application and self.application.applicant:
            return self.application.applicant.Email
        return None

    @property
    def ApplicantMobileNo(self):
        if self.application and self.application.applicant:
            return self.application.applicant.MobileNo
        return None
