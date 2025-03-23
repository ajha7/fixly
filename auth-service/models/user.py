from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from enum import Enum

class AuthProvider(str, Enum):
    GOOGLE = "google"
    EMAIL = "email"

class UserBase(BaseModel):
    email: EmailStr
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    profile_picture: Optional[str] = None
    
class UserCreate(UserBase):
    auth_provider: AuthProvider
    auth_provider_id: Optional[str] = None
    
class UserResponse(UserBase):
    id: str
    auth_provider: AuthProvider
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True
        
class UserInDB(UserBase):
    id: str
    auth_provider: AuthProvider
    auth_provider_id: Optional[str] = None
    email_verified: bool = False
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None
    
    class Config:
        orm_mode = True
