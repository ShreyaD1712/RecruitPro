from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.routers.user import router as user_router
from app.database import engine
from app.routers.role import router as role_router
from app.routers.auth import router as auth_router
from app.routers.company import router as company_router
from app.routers.department import router as department_router
from app.routers.designation import router as designation_router
from app.routers import role_permission
from app.routers import skill
from app.routers.job_category import router as job_category_router
from app.routers.employment_type import router as employment_type_router
from app.routers.experience_level import router as experience_level_router
from app.routers.interview_round import router as interview_round_router
from app.routers import job_opening_router
from app.routers import applicant
from app.routers import application

app = FastAPI(title="RecruitPro API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth_router)
app.include_router(company_router)
app.include_router(department_router)
app.include_router(designation_router)
app.include_router(role_router)
app.include_router(user_router)
app.include_router(role_permission.router)
app.include_router(skill.router)
app.include_router(job_category_router)
app.include_router(employment_type_router)
app.include_router(experience_level_router)
app.include_router(interview_round_router)
app.include_router(job_opening_router.router)
app.include_router(applicant.router)
app.include_router(application.router)


@app.get("/")
def home():
    return {"message": "RecruitPro API is Running"}


@app.get("/db-test")
def db_test():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT DB_NAME()"))
        db_name = result.scalar()

    return {"status": "Connected Successfully", "database": db_name}
