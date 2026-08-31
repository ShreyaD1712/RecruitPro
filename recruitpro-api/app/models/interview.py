from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from app.database import Base


class Interview(Base):
    __tablename__ = "Interviews"

    # ==================================================
    # PRIMARY KEY
    # ==================================================
    InterviewId = Column(Integer, primary_key=True, index=True)

    # ==================================================
    # COMPANY
    # ==================================================
    CompanyId = Column(Integer, nullable=False)

    # ==================================================
    # APPLICATION
    # ==================================================
    ApplicationId = Column(Integer, nullable=False)

    # ==================================================
    # INTERVIEW ROUND
    # ==================================================
    InterviewRoundId = Column(Integer, nullable=False)

    # ==================================================
    # INTERVIEWER
    # ==================================================
    InterviewerId = Column(Integer, nullable=False)

    # ==================================================
    # INTERVIEW INFORMATION
    # ==================================================
    InterviewDate = Column(DateTime, nullable=False)

    InterviewMode = Column(String(50), nullable=True)

    Status = Column(String(50), nullable=True)

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
        primaryjoin="foreign(Interview.ApplicationId) == Application.ApplicationId",
        viewonly=True,
    )

    interview_round = relationship(
        "InterviewRound",
        primaryjoin="foreign(Interview.InterviewRoundId) == InterviewRound.InterviewRoundId",
        viewonly=True,
    )

    interviewer = relationship(
        "User",
        primaryjoin="foreign(Interview.InterviewerId) == User.UserId",
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
    def InterviewRoundName(self):
        if self.interview_round:
            return self.interview_round.RoundName
        return None

    @property
    def InterviewerName(self):
        if self.interviewer:
            return f"{self.interviewer.FirstName} " f"{self.interviewer.LastName}"
        return None
