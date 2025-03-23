from fastapi import APIRouter, Request, Response, HTTPException, status, Depends
from fastapi.responses import RedirectResponse
from typing import Dict, Any, Optional
import logging
import os
from services.oauth_service import OAuthService
from models.user import UserResponse

router = APIRouter()
logger = logging.getLogger("auth-service.oauth")

oauth_service = OAuthService()

# Frontend URL for redirecting after authentication
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:8080")

@router.get("/google/login")
async def google_login():
    """
    Initiates Google OAuth login flow
    """
    redirect_uri = oauth_service.get_google_auth_url()
    return {"auth_url": redirect_uri}

@router.get("/google/callback")
async def google_callback(code: str, state: Optional[str] = None):
    """
    Handles Google OAuth callback
    """
    try:
        # Exchange code for tokens and get user info
        user_data, access_token = await oauth_service.handle_google_callback(code)
        
        # Create or update user in database
        user = await oauth_service.create_or_update_user(user_data)
        
        # Generate JWT token for the user
        token = oauth_service.create_jwt_token(user)
        
        # Redirect to frontend with token
        redirect_url = f"{FRONTEND_URL}/auth/callback?token={token}"
        return RedirectResponse(url=redirect_url)
    
    except Exception as e:
        logger.error(f"Error in Google callback: {str(e)}")
        error_redirect = f"{FRONTEND_URL}/auth/error?message={str(e)}"
        return RedirectResponse(url=error_redirect)

@router.get("/user/me")
async def get_current_user(user: UserResponse = Depends(oauth_service.get_current_user)):
    """
    Get current authenticated user
    """
    return user
