

from sentence_transformers import SentenceTransformer, util
import numpy as np
import pandas as pd
import os
from dotenv import load_dotenv
from typing import List, Dict, Optional
from sqlalchemy.orm import Session

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
        
        # Preprocess user profile
        if self.user_df is not None:
            self.user_df['about_me_processed'] = self.user_df['about_me'].apply(self.preprocess_text)

    def get_data(self, requs: List, user_profile=None):
        """
        Load data from database models into DataFrame for processing.
        
        Args:
            requs: List of job requirement objects from database
            user_profile: User profile object from database (optional)
            
        Returns:
            DataFrame containing job data
        """
        # Convert database objects to DataFrame
        self.df = pd.DataFrame({
            'job_id': [r.job_id for r in requs],
            'title': [r.title for r in requs],
            'description': [r.description for r in requs],
            'company_name': [r.company_name for r in requs],
            'tags_skill': [r.tags_skill for r in requs],
        })
        
        # Convert user profile to DataFrame if provided
        if user_profile:
            self.user_df = pd.DataFrame({
                'user_id': [user_profile.user_id],
                'about_me': [user_profile.about_me]
            })
            print("User Profile:")
            print(self.user_df.head())
        
        # Apply preprocessing
        self.data_preprocessing()
        print("Job Requirements:")
        print(self.df.head())
        
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

    def get_recommendations(self, user_text: str, requs: List, top_n: int = 10) -> List[Dict]:
        """
        Main recommendation function 
        
        Paper methodology:
        1. Preprocess user input
        2. Generate embedding for user profile
        3. Calculate similarity with job descriptions
        4. Calculate similarity with tags/skills
        5. Combine scores (sum)
        6. Return top N ranked by combined score
        
        Args:
            user_text: User profile/resume text
            requs: List of job requirement objects from database
            top_n: Number of recommendations to return (default: 10)
            
        Returns:
            List of top N job recommendations with scores
        """
        # Create temporary user profile
        from types import SimpleNamespace
        user_profile = SimpleNamespace(user_id=0, about_me=user_text)
        
        # Load and preprocess data
        self.get_data(requs, user_profile)
        
        # Calculate similarity scores
        combined_scores = self.get_sim(top_n)
        
        # Get individual scores for detailed output
        user_embedding = self.model.encode(
            self.user_df['about_me_processed'].tolist(),
            convert_to_tensor=True
        )
        desc_scores = util.cos_sim(user_embedding, self.job_description_embeddings)[0].cpu().numpy()
        tag_scores = util.cos_sim(user_embedding, self.job_tags_embeddings)[0].cpu().numpy()
        
        # Get top N indices
        top_indices = np.argsort(combined_scores)[::-1][:top_n]
        
        # Build recommendations list
        recommendations = []
        for rank, idx in enumerate(top_indices, 1):
            recommendations.append({
                'rank': rank,
                'job_id': int(self.df.iloc[idx]['job_id']),
                'title': self.df.iloc[idx]['title'],
                'company': self.df.iloc[idx]['company_name'],
                'skills': self.df.iloc[idx]['tags_skill'],
                'description_score': float(desc_scores[idx]),
                'tags_score': float(tag_scores[idx]),
                'combined_score': float(combined_scores[idx]),
                'description': self.df.iloc[idx]['description'][:200] + "..."
            })
        
        return recommendations


# Singleton instance for reuse
_recommender_instance = None

def get_recommender() -> JobRecommender:
    
    global _recommender_instance
    if _recommender_instance is None:
        _recommender_instance = JobRecommender()
    return _recommender_instance