from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load environment variables from .env file for local development
dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(dotenv_path=dotenv_path)

# --- Production & Development Database URL Logic ---

# Check for a DATABASE_URL environment variable (used by Render, Heroku, etc.)
DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL:
    # If DATABASE_URL is found, use it (for production)
    # Replace "postgres://" with "postgresql://" for SQLAlchemy compatibility
    SQLALCHEMY_DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
else:
    # If not found, build the URL from individual .env variables (for local development)
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_NAME = os.getenv("DB_NAME")
    DB_HOST = "localhost"
    DB_PORT = "5432"
    SQLALCHEMY_DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# ----------------------------------------------------

# Create the SQLAlchemy engine with the determined URL
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# Each instance of SessionLocal will be a database session.
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for our database models to inherit from
Base = declarative_base()