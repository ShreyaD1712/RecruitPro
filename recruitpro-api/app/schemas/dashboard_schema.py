from pydantic import BaseModel
from typing import List


class DashboardStatsResponse(BaseModel):
    TotalCompanies: int = 0
    TotalJobOpenings: int
    TotalApplications: int
    ShortlistedCandidates: int
    TotalInterviews: int
    TotalOffers: int
    HiredCandidates: int


class ApplicationStatusItem(BaseModel):
    Status: str
    Count: int


class DepartmentApplicationItem(BaseModel):
    DepartmentName: str
    Count: int


class CompanyApplicationItem(BaseModel):
    CompanyName: str
    Count: int


class DashboardResponse(BaseModel):
    Stats: DashboardStatsResponse
    ApplicationsByStatus: List[ApplicationStatusItem]
    ApplicationsByDepartment: List[DepartmentApplicationItem]
    ApplicationsByCompany: List[CompanyApplicationItem] = []
