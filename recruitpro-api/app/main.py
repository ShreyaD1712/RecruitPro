from fastapi import FastAPI
from sqlalchemy import text
from app.routers.auth import router as auth_router
from app.database import engine

app = FastAPI(title="RecruitPro API")
app.include_router(auth_router)

@app.get("/")
def home():
    return {
        "message": "RecruitPro API is Running"
    }

@app.get("/db-test")
def db_test():
    with engine.connect() as connection:
        result = connection.execute(text("SELECT DB_NAME()"))
        db_name = result.scalar()

    return {
        "status": "Connected Successfully",
        "database": db_name
    }
