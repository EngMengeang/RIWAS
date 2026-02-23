from pydantic import BaseModel

class RequBase(BaseModel):
    title: str
    description: str
    company_name: str
    tags_skill: str 
class RequCreate(RequBase):
    pass    
class Requ(RequBase):
    job_id: int

    class Config:
        from_attributes = True

class UserProfileBase(BaseModel):
    about_me: str

class UserProfileCreate(UserProfileBase):
    pass

class UserProfile(UserProfileBase):
    user_id: int

    class Config:
        from_attributes = True