from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.declarative import declarative_base
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# database connection string
DATABASE_URL = os.getenv("FASTAPI_DATABASE_URL")

#create database engine
engine = create_engine(DATABASE_URL)

# create session 
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models 
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()