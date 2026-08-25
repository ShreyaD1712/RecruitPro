from pydantic import BaseModel, Field, model_validator
from typing import Optional
from datetime import date


# ==================================================
# CREATE APPLICANT WORK EXPERIENCE
# ==================================================
class ApplicantWorkExperienceCreate(BaseModel):
    ApplicantId: int
    CompanyName: str = Field(..., min_length=1, max_length=150)
    Designation: str = Field(..., min_length=1, max_length=100)
    StartDate: date
    EndDate: Optional[date] = None
    CurrentlyWorking: bool
    Responsibilities: Optional[str] = None

    # ==================================================
    # END DATE VALIDATION
    # ==================================================
    @model_validator(mode="after")
    def validate_dates(self):
        # Currently working → EndDate must be NULL
        if self.CurrentlyWorking:
            self.EndDate = None
        # Not currently working → EndDate is required
        else:
            if self.EndDate is None:
                raise ValueError("EndDate is required when CurrentlyWorking is false.")
            if self.EndDate < self.StartDate:
                raise ValueError("EndDate cannot be earlier than StartDate.")
        return self


# ==================================================
# UPDATE APPLICANT WORK EXPERIENCE
# ==================================================
class ApplicantWorkExperienceUpdate(BaseModel):
    CompanyName: str = Field(..., min_length=1, max_length=150)
    Designation: str = Field(..., min_length=1, max_length=100)
    StartDate: date
    EndDate: Optional[date] = None
    CurrentlyWorking: bool
    Responsibilities: Optional[str] = None

    # ==================================================
    # END DATE VALIDATION
    # ==================================================
    @model_validator(mode="after")
    def validate_dates(self):
        # Currently working → EndDate must be NULL
        if self.CurrentlyWorking:
            self.EndDate = None
        # Not currently working → EndDate is required
        else:
            if self.EndDate is None:
                raise ValueError("EndDate is required when CurrentlyWorking is false.")
            if self.EndDate < self.StartDate:
                raise ValueError("EndDate cannot be earlier than StartDate.")
        return self


# ==================================================
# RESPONSE
# ==================================================
class ApplicantWorkExperienceResponse(BaseModel):
    WorkExperienceId: int
    CompanyId: int
    ApplicantId: int
    CompanyName: str
    Designation: str
    StartDate: date
    EndDate: Optional[date] = None
    CurrentlyWorking: bool
    Responsibilities: Optional[str] = None

    class Config:
        from_attributes = True
