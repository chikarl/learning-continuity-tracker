from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class LessonBase(BaseModel):
    title: str
    subject: str
    class_level: str
    topic: str
    description: str
    content_type: str
    content_url: Optional[str] = None
    estimated_duration: Optional[int] = None
    lockdown_week_reference: Optional[int] = None

class Lesson(LessonBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
