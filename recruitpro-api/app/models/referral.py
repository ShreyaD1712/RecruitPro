from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship, foreign
from app.database import Base


class Referral(Base):
    __tablename__ = "Referrals"

    # ==================================================
    # PRIMARY KEY
    # ==================================================
    ReferralId = Column(Integer, primary_key=True, index=True)

    # ==================================================
    # COMPANY
    # ==================================================
    CompanyId = Column(Integer, nullable=False)

    # ==================================================
    # APPLICANT
    # ==================================================
    ApplicantId = Column(Integer, nullable=False)

    # ==================================================
    # APPLICATION
    # ==================================================
    ApplicationId = Column(Integer, nullable=False)

    # ==================================================
    # REFERRER USER
    # ==================================================
    ReferrerUserId = Column(Integer, nullable=True)

    # ==================================================
    # REFERRAL INFORMATION
    # ==================================================
    ReferralDate = Column(DateTime, nullable=True)

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
    applicant = relationship(
        "Applicant",
        primaryjoin="foreign(Referral.ApplicantId) == Applicant.ApplicantId",
        viewonly=True,
    )

    application = relationship(
        "Application",
        primaryjoin="foreign(Referral.ApplicationId) == Application.ApplicationId",
        viewonly=True,
    )

    referrer = relationship(
        "User",
        primaryjoin="foreign(Referral.ReferrerUserId) == User.UserId",
        viewonly=True,
    )

    # ==================================================
    # DISPLAY PROPERTIES
    # ==================================================
    @property
    def ApplicantName(self):
        if self.applicant:
            return f"{self.applicant.FirstName} " f"{self.applicant.LastName}"
        return None

    @property
    def ReferrerName(self):
        if self.referrer:
            return f"{self.referrer.FirstName} " f"{self.referrer.LastName}"
        return None

    @property
    def JobTitle(self):
        if self.application and self.application.job_opening:
            return self.application.job_opening.JobTitle
        return None
