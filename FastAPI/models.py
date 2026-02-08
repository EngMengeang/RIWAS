from sqlalchemy import Column, Integer, String, Float, Text
from database import Base

class requ(Base):
    __tablename__ = "requ"

    job_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(50), index=True)
    description = Column(Text, index=True)
    company_name = Column(String(50), index=True)
    tags_skill = Column(Text, index=True)
    
class user_profile(Base):
    __tablename__ = "user_profile"

    user_id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    about_me = Column(Text, index=True)
   