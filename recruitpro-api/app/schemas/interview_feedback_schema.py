from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# ==================================================
# CREATE INTERVIEW FEEDBACK
# ==================================================
class InterviewFeedbackCreate(BaseModel):

    # Interview to which this feedback belongs
    InterviewId: int = Field(..., gt=0)

    # Rating from 1 to 5
    Rating: Optional[int] = Field(default=None, ge=1, le=5)

    Strengths: Optional[str] = None

    Weaknesses: Optional[str] = None

    Recommendation: Optional[str] = Field(default=None, max_length=100)

    Comments: Optional[str] = None


# ==================================================
# UPDATE INTERVIEW FEEDBACK
# ==================================================
class InterviewFeedbackUpdate(BaseModel):

    # InterviewId remains required so backend can
    # validate that feedback belongs to this interview
    InterviewId: int = Field(..., gt=0)

    Rating: Optional[int] = Field(default=None, ge=1, le=5)

    Strengths: Optional[str] = None

    Weaknesses: Optional[str] = None

    Recommendation: Optional[str] = Field(default=None, max_length=100)

    Comments: Optional[str] = None


# ==================================================
# INTERVIEW FEEDBACK RESPONSE
# ==================================================
class InterviewFeedbackResponse(BaseModel):

    FeedbackId: int
    CompanyId: int

    # --------------------------------------------------
    # FEEDBACK INFORMATION
    # --------------------------------------------------
    InterviewId: int

    Rating: Optional[int] = None

    Strengths: Optional[str] = None

    Weaknesses: Optional[str] = None

    Recommendation: Optional[str] = None

    Comments: Optional[str] = None

    # --------------------------------------------------
    # AUDIT INFORMATION
    # --------------------------------------------------
    CreatedOn: Optional[datetime] = None

    CreatedBy: Optional[int] = None

    UpdatedOn: Optional[datetime] = None

    UpdatedBy: Optional[int] = None

    # --------------------------------------------------
    # DISPLAY INFORMATION
    # --------------------------------------------------
    ApplicantName: Optional[str] = None

    JobTitle: Optional[str] = None

    DepartmentName: Optional[str] = None

    InterviewRoundName: Optional[str] = None

    InterviewerName: Optional[str] = None

    InterviewDate: Optional[datetime] = None

    InterviewMode: Optional[str] = None

    InterviewStatus: Optional[str] = None

    class Config:
        from_attributes = True


# ==================================================
# INTERVIEW FEEDBACK LIST RESPONSE
# ==================================================
class InterviewFeedbackListResponse(BaseModel):

    total_records: int

    page: int

    page_size: int

    data: list[InterviewFeedbackResponse]
