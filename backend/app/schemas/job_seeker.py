from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from typing import List, Optional
from datetime import datetime


class JobSeekerSignupRequest(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    phone: str = Field(..., description="Nigerian format, e.g. 08011223344", pattern=r"^0\d{10}$")
    skills: List[str] = Field(..., description="e.g. ['phone repair', 'sales']")
    language: str
    location: str
    bio: Optional[str] = None


class JobSeekerSignupResponse(BaseModel):
    message: str
    email: str
    job_seeker_id: UUID


class JobSeekerView(BaseModel):
    id: UUID
    auth_user_id: Optional[UUID]
    first_name: str
    last_name: str
    phone: str
    skills: List[str]
    language: str
    location: str
    bio: Optional[str]
    is_matched: bool
    matched_cluster_id: Optional[UUID]
    created_at: datetime

    class Config:
        from_attributes = True
