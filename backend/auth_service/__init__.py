"""
Authentication Service Package

This package handles user authentication for the Fixly application,
supporting both social media login and email magic link authentication.
"""

from .models import User, UserCreate, UserResponse, SocialProvider, TokenData, TokenResponse
from .service import AuthService

__all__ = [
    'User',
    'UserCreate',
    'UserResponse',
    'SocialProvider',
    'TokenData',
    'TokenResponse',
    'AuthService'
]
