from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# -------------------------
# Create Interview Round
# -------------------------


class InterviewRoundCreate(BaseModel):

    RoundName: str = Field(
        ...,
        min_length=1,
        max_length=150,
    )

    Description: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    IsActive: bool = True


# -------------------------
# Update Interview Round
# -------------------------


class InterviewRoundUpdate(BaseModel):

    RoundName: str = Field(
        ...,
        min_length=1,
        max_length=150,
    )

    Description: Optional[str] = Field(
        default=None,
        max_length=500,
    )

    IsActive: bool = True


# -------------------------
# Interview Round Response
# -------------------------


class InterviewRoundResponse(BaseModel):

    InterviewRoundId: int

    RoundName: str

    CompanyId: int

    Description: Optional[str] = None

    IsActive: bool

    CreatedOn: Optional[datetime] = None

    CreatedBy: Optional[int] = None

    UpdatedOn: Optional[datetime] = None

    UpdatedBy: Optional[int] = None

    class Config:
        from_attributes = True


# -------------------------
# Interview Round List Response
# -------------------------


class InterviewRoundListResponse(BaseModel):

    total_records: int

    page: int

    page_size: int

    data: list[InterviewRoundResponse]
