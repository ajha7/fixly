"""
Authentication Service Models

This module defines the data models used by the authentication service.
"""

from enum import Enum
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field, EmailStr, HttpUrl


class SocialProvider(str, Enum):
    """Enumeration of supported social login providers."""
    GOOGLE = "google"
    NEXTDOOR = "nextdoor"
    FACEBOOK = "facebook"


class UserBase(BaseModel):
    """Base model for user data."""
    email: EmailStr = Field(..., description="User's email address")
    name: Optional[str] = Field(None, description="User's full name")
    phone: Optional[str] = Field(None, description="User's phone number")


class UserCreate(UserBase):
    """Model for creating a new user."""
    provider: Optional[SocialProvider] = Field(None, description="Social login provider if applicable")
    provider_user_id: Optional[str] = Field(None, description="User ID from social provider")
    profile_picture: Optional[HttpUrl] = Field(None, description="URL to user's profile picture")


class User(UserBase):
    """Complete user model with all fields."""
    id: str = Field(..., description="Unique user identifier")
    provider: Optional[SocialProvider] = Field(None, description="Social login provider if applicable")
    provider_user_id: Optional[str] = Field(None, description="User ID from social provider")
    profile_picture: Optional[HttpUrl] = Field(None, description="URL to user's profile picture")
    email_verified: bool = Field(default=False, description="Whether the email is verified")
    created_at: datetime = Field(default_factory=datetime.now, description="Time when the user was created")
    updated_at: datetime = Field(default_factory=datetime.now, description="Last update timestamp")
    last_login: Optional[datetime] = Field(None, description="Last login timestamp")
    
    class Config:
        schema_extra = {
            "example": {
                "id": "60d21b4967d0d8992e610c85",
                "email": "user@example.com",
                "name": "John Doe",
                "phone": "415-555-1234",
                "provider": "google",
                "provider_user_id": "google_12345",
                "profile_picture": "https://example.com/profile.jpg",
                "email_verified": True,
                "created_at": "2025-03-27T10:48:36",
                "updated_at": "2025-03-27T10:48:36",
                "last_login": "2025-03-27T10:48:36"
            }
        }


class UserResponse(BaseModel):
    """User data returned to the client."""
    id: str = Field(..., description="Unique user identifier")
    email: EmailStr = Field(..., description="User's email address")
    name: Optional[str] = Field(None, description="User's full name")
    phone: Optional[str] = Field(None, description="User's phone number")
    profile_picture: Optional[HttpUrl] = Field(None, description="URL to user's profile picture")
    email_verified: bool = Field(..., description="Whether the email is verified")


class TokenData(BaseModel):
    """Data stored in JWT token."""
    user_id: str = Field(..., description="Unique user identifier")
    email: EmailStr = Field(..., description="User's email address")
    exp: Optional[datetime] = Field(None, description="Token expiration time")


class TokenResponse(BaseModel):
    """Token response returned to the client."""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    user: UserResponse = Field(..., description="User data")


class MagicLinkRequest(BaseModel):
    """Request to send a magic link for authentication."""
    email: EmailStr = Field(..., description="User's email address")
    redirect_url: str = Field(..., description="URL to redirect after authentication")


class MagicLinkVerify(BaseModel):
    """Request to verify a magic link token."""
    token: str = Field(..., description="Magic link token")


class SocialLoginRequest(BaseModel):
    """Request to authenticate with a social provider."""
    provider: SocialProvider = Field(..., description="Social login provider")
    token: str = Field(..., description="OAuth token from provider")
    redirect_url: Optional[str] = Field(None, description="URL to redirect after authentication")
