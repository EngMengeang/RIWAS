from sqlalchemy import Column, String, Text, Integer, DateTime, Float, JSON, ForeignKey, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.ext.declarative import declarative_base
from database import Base

class requ(Base):
    __tablename__ = "JobPostings"

    id = Column(UUID, primary_key=True)
    title = Column(String(50))
    description = Column(Text)
    requirements = Column(JSONB)
    location = Column(String)
    jobType = Column(String)
    status = Column(String)
    department = Column(String)
    salary = Column(JSONB)
    applicationDeadline = Column(DateTime)
    createdAt = Column(DateTime)
    updatedAt = Column(DateTime)


class user_profile(Base):
    __tablename__ = "Profiles"

    id = Column(UUID, primary_key=True)        
    user_id = Column(UUID)                    
    about = Column(Text)


class job_application(Base):
    __tablename__ = "JobApplications"

    id = Column(UUID, primary_key=True)
    user_id = Column(UUID)
    job_id = Column(UUID)
    candidate_id = Column(UUID)
    resume = Column(String)
    resumePublicId = Column(String)
    cover_letter = Column(String)
    coverLetterPublicId = Column(String)
    extracted_text = Column(Text)
    cover_letter_text = Column(Text)
    ai_analysis = Column(JSONB)
    cover_letter_score = Column(Float)
    missing_skills = Column(JSONB)
    status = Column(String)
    rejection_reason = Column(Text)
    applied_at = Column(DateTime)
    rejected_at = Column(DateTime)
    createdAt = Column(DateTime)
    updatedAt = Column(DateTime)


class user_resume(Base):
    __tablename__ = "UserResumes"

    id = Column(UUID, primary_key=True)
    user_id = Column(UUID)
    resume = Column(String)
    resumePublicId = Column(String)
    extracted_text = Column(Text)
    ai_analysis = Column(JSONB)
    uploaded_at = Column(DateTime)
    createdAt = Column(DateTime)
    updatedAt = Column(DateTime)


class user(Base):
    __tablename__ = "Users"

    id = Column(UUID, primary_key=True)
    email = Column(String)
    password = Column(String)
    firstName = Column(String)
    lastName = Column(String)
    phoneNumber = Column(String)
    profilePicture = Column(String)
    coverImage = Column(String)
    profilePicturePublicId = Column(String)
    coverImagePublicId = Column(String)
    role = Column(String)
    bio = Column(Text)
    location = Column(String)
    isVerified = Column(Boolean)
    isActive = Column(Boolean)
    lastLogin = Column(DateTime)
    createdAt = Column(DateTime)
    updatedAt = Column(DateTime)