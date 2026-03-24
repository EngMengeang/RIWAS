

from sentence_transformers import SentenceTransformer, util
import numpy as np
import pandas as pd
import os
from dotenv import load_dotenv
from typing import List, Dict, Optional
from sqlalchemy.orm import Session
from models import job_application

# Load environment variables from .env file
load_dotenv()


class JobRecommender:

    def __init__(self, model_name: str = 'all-MiniLM-L6-v2'):
        self.df = None
        self.user_df = None
        self.model = SentenceTransformer(model_name)
        self.job_description_embeddings = None
        self.job_tags_embeddings = None

    def preprocess_text(self, text: str) -> str:
        if not text or pd.isna(text):
            return ""
        
        # Step 1: Lowercase
        text = str(text).lower()
        
        # Step 2: Strip leading/trailing whitespace
        text = text.strip()
        
        # Step 3: Replace multiple spaces with single space
        text = ' '.join(text.split())
        
        # Remove newlines and replace with space
        text = text.replace('\n', ' ').replace('\r', ' ')
        
        return text

    def data_preprocessing(self):
        """
        Preprocess job descriptions and tags/skills from database data.
        """
        # Preprocess job descriptions
        self.df['description_processed'] = self.df['description'].apply(self.preprocess_text)
        
        # Preprocess tags and skills
        self.df['tags_processed'] = self.df['tags_skill'].apply(
            lambda x: self.preprocess_text(str(x).replace(',', ' '))
        )
        
        # Preprocess user profile (only when loaded via get_data with a user_profile arg)
        if self.user_df is not None and 'about' in self.user_df.columns:
            self.user_df['about_me_processed'] = self.user_df['about'].apply(self.preprocess_text)

    
    def get_data(self, requs, user_profile=None):
        self.df = pd.DataFrame({
            'job_id': [r.id for r in requs],                      
            'title': [r.title for r in requs],
            'description': [r.description or "" for r in requs],
            'company_name': [r.department or "" for r in requs],      # no company_name
            'tags_skill': [str(r.requirements or "") for r in requs], # JSONB requirements
        })

        if user_profile:
            self.user_df = pd.DataFrame({
                'user_id': [user_profile.user_id],
                'about': [user_profile.about]
            })

        self.data_preprocessing()
        return self.df

    def generate_embeddings(self):
        """
        Generate embeddings for job descriptions and tags/skills.
        Following paper Section III.C: Encode BOTH descriptions AND tags separately.
        """
        print("Generating embeddings for job descriptions...")
        self.job_description_embeddings = self.model.encode(
            self.df['description_processed'].tolist(),
            convert_to_tensor=True,
            show_progress_bar=True
        )
        
        print("Generating embeddings for tags and skills...")
        self.job_tags_embeddings = self.model.encode(
            self.df['tags_processed'].tolist(),
            convert_to_tensor=True,
            show_progress_bar=True
        )

    def get_sim(self, top_n: int = 10) -> np.ndarray:
        """
        Calculate similarity scores between user profile and jobs.
        Following paper methodology: Calculate similarity for BOTH descriptions 
        and tags/skills, then combine the scores.
        
        Args:
            top_n: Number of recommendations to return
            
        Returns:
            Combined similarity scores
        """
        # Generate embeddings if not already done
        if self.job_description_embeddings is None or self.job_tags_embeddings is None:
            self.generate_embeddings()
        
        # Generate user embedding
        print("Generating embeddings for user profile...")
        user_embedding = self.model.encode(
            self.user_df['about_me_processed'].tolist(),
            convert_to_tensor=True
        )
        
        # Calculate cosine similarity for descriptions
        description_scores = util.cos_sim(user_embedding, self.job_description_embeddings)[0].cpu().numpy()
        
        # Calculate cosine similarity for tags/skills
        tags_scores = util.cos_sim(user_embedding, self.job_tags_embeddings)[0].cpu().numpy()
        
        # Combine scores (sum of both similarities as per paper)
        combined_scores = description_scores + tags_scores
        
        return combined_scores

   
    def get_recommendations(
        self,
        user_text: str,
        requs: list,
        top_n: int = 10,
        gemini_scores: dict = {}
    ) -> list:
        """
        Generate job recommendations using combined scoring:
        - ML similarity (sentence-BERT): 40%
        - Gemini AI score: 60%
        
        Args:
            user_text: User profile text
            requs: List of job requirement objects
            top_n: Number of recommendations to return
            gemini_scores: Optional dict of {job_id: gemini_score}

        Returns:
            List of top N recommendations with combined score
        """

        from types import SimpleNamespace

        # ── Step 1: Load job data into DataFrame ──
        # Reset user_df first so data_preprocessing() doesn't reuse a stale user_df
        # from a previous request (singleton instance)
        self.user_df = None
        self.get_data(requs)

        # Reset embeddings so they are always regenerated for the current job set
        self.job_description_embeddings = None
        self.job_tags_embeddings = None

        # ── Step 2: Create temporary user profile ──
        user_profile_obj = SimpleNamespace(user_id=0, about_me=user_text)
        self.user_df = pd.DataFrame({
            'user_id': [user_profile_obj.user_id],
            'about_me': [user_profile_obj.about_me]
        })

        # Preprocess user text
        self.user_df['about_me_processed'] = self.user_df['about_me'].apply(self.preprocess_text)

        # ── Step 3: Calculate ML similarity scores ──
        combined_scores = self.get_sim(top_n)

        # Get description & tag scores individually
        user_embedding = self.model.encode(
            self.user_df['about_me_processed'].tolist(),
            convert_to_tensor=True
        )
        desc_scores = util.cos_sim(user_embedding, self.job_description_embeddings)[0].cpu().numpy()
        tag_scores = util.cos_sim(user_embedding, self.job_tags_embeddings)[0].cpu().numpy()

        # Normalize ML scores to 0-1
        ml_max = combined_scores.max() if combined_scores.max() > 0 else 1
        normalized_ml_scores = combined_scores / ml_max

        # ── Step 4: Build final recommendations combining ML + Gemini ──
        # If no Gemini scores exist at all (user has no applications), use 100% ML score
        has_gemini = bool(gemini_scores)

        recommendations = []
        for idx in range(len(self.df)):
            job_id = str(self.df.iloc[idx]['job_id'])  # convert to string for gemini_scores dict
            gemini_score = gemini_scores.get(job_id, 0.0)  # default 0.0 if not present

            if has_gemini:
                # 40% ML + 60% Gemini when application data is available
                final_score = 0.4 * normalized_ml_scores[idx] + 0.6 * gemini_score
            else:
                # No applications yet — rank purely by ML similarity
                final_score = float(normalized_ml_scores[idx])

            recommendations.append({
                'job_id': job_id,
                'title': self.df.iloc[idx]['title'],
                'company': self.df.iloc[idx]['company_name'],
                'skills': self.df.iloc[idx]['tags_skill'],
                'description_score': float(desc_scores[idx]),
                'tags_score': float(tag_scores[idx]),
                'ml_score': float(normalized_ml_scores[idx]),
                'gemini_score': float(gemini_score),
                'final_score': float(final_score),
                'description': self.df.iloc[idx]['description'][:200] + "..."
            })

        # ── Step 5: Sort by final score and add ranking ──
        recommendations.sort(key=lambda x: x['final_score'], reverse=True)
        for rank, rec in enumerate(recommendations[:top_n], 1):
            rec['rank'] = rank

        return recommendations[:top_n]


# Singleton instance for reuse
_recommender_instance = None

def get_recommender() -> JobRecommender:
    
    global _recommender_instance
    if _recommender_instance is None:
        _recommender_instance = JobRecommender()
    return _recommender_instance