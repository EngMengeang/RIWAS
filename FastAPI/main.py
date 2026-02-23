from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import models
from models import requ, user_profile
from schemas import Requ, RequCreate, UserProfile, UserProfileCreate
from database import get_db, engine, Base
from ml_engine import get_recommender

app = FastAPI(
    title="AI-Based Job Recommendation System",
    description="Job recommendation system using BERT following Panchasara et al. (2023)",
    version="1.0.0"
)

# create tables if not exist 
models.Base.metadata.create_all(bind=engine)

@app.post("/requ/", response_model=Requ)
async def create_requ(requ_data: RequCreate, db: Session = Depends(get_db)):
    db_requ = requ(**requ_data.dict())
    db.add(db_requ)
    db.commit()
    db.refresh(db_requ)
    return db_requ

@app.get("/requ/", response_model=List[Requ])
async def read_requ(db: Session = Depends(get_db)):
    requs = db.query(requ).all()
    return requs

@app.get("/requ/{job_id}", response_model=Requ)
async def read_single_requ(job_id: int, db: Session = Depends(get_db)):
    """Get a specific job requirement by ID"""
    db_requ = db.query(requ).filter(requ.job_id == job_id).first()
    if db_requ is None:
        raise HTTPException(status_code=404, detail="Requ not found")
    return db_requ

@app.post('/user_profile/', response_model=UserProfile)
async def create_user_profile(profile_data: UserProfileCreate, db: Session = Depends(get_db)):
    db_profile = user_profile(**profile_data.dict())
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile

@app.get('/user_profile/{user_id}/recommendations')
async def get_user_recommendations(user_id: int, top_n: int = 10, db: Session = Depends(get_db)):
    """
    Get AI-powered job recommendations for a specific user.
    
    This endpoint uses the new recommendation engine following the paper methodology:
    - Preprocesses user profile and job data
    - Generates embeddings using Sentence-BERT
    - Calculates similarity scores (description + tags/skills)
    - Returns top N ranked job recommendations
    
    Args:
        user_id: User ID to get recommendations for
        top_n: Number of recommendations to return (default: 10)
        
    Returns:
        List of ranked job recommendations with similarity scores
    """
    # Get user profile from database
    db_profile = db.query(user_profile).filter(user_profile.user_id == user_id).first()
    if db_profile is None:
        raise HTTPException(status_code=404, detail="User profile not found")
    
    # Get all job requirements from database
    requs = db.query(requ).all()
    
    if not requs:
        raise HTTPException(status_code=404, detail="No job requirements found")
    
    # Get recommender instance
    recommender = get_recommender()
    
    # Get recommendations using the new function
    recommendations = recommender.get_recommendations(
        user_text=db_profile.about_me,
        requs=requs,
        top_n=top_n
    )
    
    return {
        "user_id": user_id,
        "user_profile": db_profile.about_me,
        "total_jobs_analyzed": len(requs),
        "recommendations": recommendations
    }


# Legacy endpoint (kept for backward compatibility)
@app.get('/user_profile/recommend/{user_id}', response_model=UserProfile)
async def read_user_profile_recommend(user_id: int, db: Session = Depends(get_db)):
    """Legacy endpoint - returns user profile only"""
    db_profile = db.query(user_profile).filter(user_profile.user_id == user_id).first()
    if db_profile is None:
        raise HTTPException(status_code=404, detail="User profile not found")
    return db_profile
