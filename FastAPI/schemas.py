from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from typing import Optional
from models import requ

# -----------------------------
# Job requirement schemas
# -----------------------------
class RequBase(BaseModel):
    title: str
    description: str
    company_name: str
    tags_skill: str

    @classmethod
    def from_orm_model(cls, model: requ):
        return cls(
            job_id=model.id,
            title=model.title,
            description=model.description,
            company_name=model.department or "Unknown",
            tags_skill=str(model.requirements or "")
        )

class RequCreate(RequBase):
    pass

class Requ(RequBase):
    job_id: UUID  

    model_config = {
        "from_attributes": True
    }

# -----------------------------
# User profile schemas2
# -----------------------------
class UserProfileBase(BaseModel):
    about: str

class UserProfileCreate(UserProfileBase):
    pass

class UserProfile(UserProfileBase):
    user_id: UUID

    model_config = {
        "from_attributes": True
    }


class UserPublic(BaseModel):
    id: UUID
    email: str
    firstName: str
    lastName: str
    phoneNumber: Optional[str] = None
    profilePicture: Optional[str] = None
    coverImage: Optional[str] = None
    role: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    isVerified: Optional[bool] = None
    isActive: Optional[bool] = None
    lastLogin: Optional[datetime] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None

    model_config = {
        "from_attributes": True
    }