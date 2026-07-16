from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from urllib.parse import quote_plus
from dotenv import load_dotenv
import os

load_dotenv()

server = os.getenv("DB_SERVER")
database = os.getenv("DB_DATABASE")
driver = quote_plus(os.getenv("DB_DRIVER"))

DATABASE_URL = (
    f"mssql+pyodbc://@{server}/{database}"
    f"?driver={driver}"
    "&trusted_connection=yes"
    "&TrustServerCertificate=yes"
)


engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()