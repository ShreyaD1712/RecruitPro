from sqlalchemy import Column, Integer, String, DateTime, Text
from sqlalchemy.orm import relationship
from app.database import Base


class InterviewFeedback(Base):
    __tablename__ = "InterviewFeedback"

    # ==================================================
    # PRIMARY KEY
    # ==================================================
    FeedbackId = Column(Integer, primary_key=True, index=True)

    # ==================================================
    # COMPANY
    # ==================================================
    CompanyId = Column(Integer, nullable=False)

    # ==================================================
    # INTERVIEW
    # ==================================================
    InterviewId = Column(Integer, nullable=False)

    # ==================================================
    # FEEDBACK INFORMATION
    # ==================================================
    Rating = Column(Integer, nullable=True)

    Strengths = Column(Text, nullable=True)

    Weaknesses = Column(Text, nullable=True)

    Recommendation = Column(String(100), nullable=True)

    Comments = Column(Text, nullable=True)

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
    interview = relationship(
        "Interview",
        primaryjoin="foreign(InterviewFeedback.InterviewId) == Interview.InterviewId",
        viewonly=True,
    )

    # ==================================================
    # DISPLAY PROPERTIES
    # ==================================================
    @property
    def ApplicantName(self):
        if (
            self.interview
            and self.interview.application
            and self.interview.application.applicant
        ):
            return (
                f"{self.interview.application.applicant.FirstName} "
                f"{self.interview.application.applicant.LastName}"
            )
        return None

    @property
    def JobTitle(self):
        if (
            self.interview
            and self.interview.application
            and self.interview.application.job_opening
        ):
            return self.interview.application.job_opening.JobTitle
        return None

    @property
    def DepartmentName(self):
        if (
            self.interview
            and self.interview.application
            and self.interview.application.job_opening
            and self.interview.application.job_opening.department
        ):
            return self.interview.application.job_opening.department.DepartmentName
        return None

    @property
    def InterviewRoundName(self):
        if self.interview and self.interview.interview_round:
            return self.interview.interview_round.RoundName
        return None

    @property
    def InterviewerName(self):
        if self.interview and self.interview.interviewer:
            return (
                f"{self.interview.interviewer.FirstName} "
                f"{self.interview.interviewer.LastName}"
            )
        return None

    @property
    def InterviewDate(self):
        if self.interview:
            return self.interview.InterviewDate
        return None

    @property
    def InterviewMode(self):
        if self.interview:
            return self.interview.InterviewMode
        return None

    @property
    def InterviewStatus(self):
        if self.interview:
            return self.interview.Status
        return None
