from fastapi import APIRouter, Request, Response, HTTPException, status
from fastapi.responses import RedirectResponse
from typing import Dict, Any, Optional
import logging
import os
from pydantic import BaseModel, EmailStr
from services.magic_link_service import MagicLinkService

router = APIRouter()
logger = logging.getLogger("auth-service.magic-link")

magic_link_service = MagicLinkService()

# Frontend URL for redirecting after authentication
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:8080")

class MagicLinkRequest(BaseModel):
    email: EmailStr

@router.post("/request")
async def request_magic_link(request: MagicLinkRequest):
    """
    Request a magic link to be sent to the user's email
    """
    try:
        # Generate magic link and send email
        await magic_link_service.send_magic_link(request.email)
        return {"message": "Magic link sent to your email", "email": request.email}
    
    except Exception as e:
        logger.error(f"Error sending magic link: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error sending magic link: {str(e)}"
        )

@router.get("/verify")
async def verify_magic_link(token: str):
    """
    Verify magic link token and authenticate user
    """
    try:
        # Verify token and get or create user
        user, jwt_token = await magic_link_service.verify_magic_link(token)
        
        # Redirect to frontend with token
        redirect_url = f"{FRONTEND_URL}/auth/callback?token={jwt_token}"
        return RedirectResponse(url=redirect_url)
    
    except Exception as e:
        logger.error(f"Error verifying magic link: {str(e)}")
        error_redirect = f"{FRONTEND_URL}/auth/error?message={str(e)}"
        return RedirectResponse(url=error_redirect)
