from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables for local development
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

# --- Production & Development Database URL Logic ---
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # We are in production (on Render)
    SQLALCHEMY_DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

    # Add sslmode=require if it's not already in the URL
    if "?sslmode=" not in SQLALCHEMY_DATABASE_URL:
        SQLALCHEMY_DATABASE_URL += "?sslmode=require"
else:
    # We are in local development
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_NAME = os.getenv("DB_NAME")
    DB_HOST = "localhost"
    DB_PORT = "5432"
    SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# --- End of URL Logic ---

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
