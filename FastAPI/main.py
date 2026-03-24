from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List
from uuid import UUID
import models
from models import requ, user_profile, job_application, user_resume, user
from schemas import Requ, RequCreate, UserProfile, UserProfileCreate, UserPublic
from database import get_db, engine, Base
from ml_engine import get_recommender
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(
    title="AI-Based Job Recommendation System",
    description="Job recommendation system using BERT following Panchasara et al. (2023)",
    version="1.0.0"
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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

# @app.get("/requ/", response_model=List[Requ])
# async def read_requ(db: Session = Depends(get_db)):
#     requs = db.query(requ).all()
#     return requs
@app.get("/requ/", response_model=List[Requ])
async def read_requ(db: Session = Depends(get_db)):
    requs = db.query(requ).all()
    return [Requ.from_orm_model(r) for r in requs]

@app.get("/requ/{job_id}", response_model=Requ)
async def read_single_requ(job_id: UUID, db: Session = Depends(get_db)):
    """Get a specific job requirement by ID"""
    db_requ = db.query(requ).filter(requ.id == job_id).first()
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


@app.get('/users/', response_model=List[UserPublic])
async def read_users(db: Session = Depends(get_db)):
    users = db.query(user).all()
    return users


@app.get('/users/{user_id}', response_model=UserPublic)
async def read_user_by_id(user_id: UUID, db: Session = Depends(get_db)):
    db_user = db.query(user).filter(user.id == user_id).first()
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.get('/user_profile/{user_id}/recommendations')
async def get_user_recommendations(user_id: UUID, top_n: int = 10, db: Session = Depends(get_db)):

    # Fetch user profile
    db_profile = db.query(user_profile).filter(user_profile.user_id == user_id).first()

    # Use profile 'about' as user text; if empty, fall back to resume extracted_text
    # and then resume AI professional summary.
    user_text = (db_profile.about if db_profile and db_profile.about else "")
    if not user_text.strip():
        latest_resume = (
            db.query(user_resume)
            .filter(user_resume.user_id == user_id)
            .order_by(user_resume.uploaded_at.desc())
            .first()
        )
        if latest_resume and latest_resume.extracted_text:
            user_text = latest_resume.extracted_text

        if not user_text.strip() and latest_resume and isinstance(latest_resume.ai_analysis, dict):
            user_text = (
                latest_resume.ai_analysis.get("professionalSummary")
                or latest_resume.ai_analysis.get("summary")
                or ""
            )

    if not user_text.strip():
        raise HTTPException(
            status_code=404,
            detail="No profile or resume text found for this user. Complete profile/about or upload a resume first."
        )

    # Fetch published jobs first.
    jobs = db.query(requ).filter(requ.status == "published").all()

    # Dev-friendly fallback: if nothing is published yet, include non-closed jobs
    # so recommendations still work while recruiters are preparing postings.
    jobs_source = "published"
    if not jobs:
        jobs = db.query(requ).filter(
            or_(requ.status != "closed", requ.status.is_(None))
        ).all()
        jobs_source = "non_closed"

    if not jobs:
        raise HTTPException(status_code=404, detail="No job requirements found")

    # Fetch job applications for this user that have ai_analysis
    applications = db.query(job_application).filter(job_application.user_id == user_id).all()

    # Build gemini_scores dict: { job_id (as str): matchScore }
    import json, re
    gemini_scores = {}
    for app in applications:
        if not app.ai_analysis or not isinstance(app.ai_analysis, dict):
            continue

        analysis = app.ai_analysis

        # Handle old broken records: { "raw": "```json\n{...}\n```" }
        # where Gemini markdown fences were not stripped before saving
        if 'matchScore' not in analysis and 'raw' in analysis:
            try:
                raw_str = str(analysis['raw'])
                cleaned = re.sub(r'^```(?:json)?\s*', '', raw_str, flags=re.IGNORECASE).rstrip('`').strip()
                parsed = json.loads(cleaned)
                if isinstance(parsed, dict):
                    analysis = parsed
            except Exception:
                pass

        try:
            score = float(analysis.get('matchScore', 0.0))
        except (ValueError, TypeError):
            score = 0.0

        gemini_scores[str(app.job_id)] = score

    # Get recommendations from ML engine
    recommender = get_recommender()
    recommendations = recommender.get_recommendations(
        user_text=user_text,
        requs=jobs,
        top_n=top_n,
        gemini_scores=gemini_scores
    )

    return {
        "user_id": str(user_id),
        "user_profile": user_text,
        "profile_source": "about" if db_profile and db_profile.about and db_profile.about.strip() else "resume",
        "total_jobs_analyzed": len(jobs),
        "jobs_source": jobs_source,
        "scoring_weights": {
            "ml_engine": "40%" if gemini_scores else "100%",
            "gemini_ai": "60%" if gemini_scores else "0% (no applications yet)"
        },
        "recommendations": recommendations
    }


# Legacy endpoint (kept for backward compatibility)
@app.get('/user_profile/recommend/{user_id}', response_model=UserProfile)
async def read_user_profile_recommend(user_id: UUID, db: Session = Depends(get_db)):
    """Legacy endpoint - returns user profile only"""
    db_profile = db.query(user_profile).filter(user_profile.user_id == user_id).first()
    if db_profile is None:
        raise HTTPException(status_code=404, detail="User profile not found")
    return db_profile
