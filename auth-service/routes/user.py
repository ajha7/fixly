from fastapi import APIRouter, Request, Response, HTTPException, status, Depends
from typing import Dict, Any, Optional
import logging
from services.oauth_service import OAuthService
from models.user import UserResponse

router = APIRouter()
logger = logging.getLogger("auth-service.user")

oauth_service = OAuthService()

@router.get("/me")
async def get_current_user(user: UserResponse = Depends(oauth_service.get_current_user)):
    """
    Get current authenticated user
    """
    return user

@router.post("/logout")
async def logout():
    """
    Logout user (invalidate token)
    """
    # In a stateless JWT system, client-side logout is typically handled by removing the token
    # For server-side logout, we would need to implement token blacklisting
    return {"message": "Successfully logged out"}
