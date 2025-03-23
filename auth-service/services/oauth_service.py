import os
import logging
import json
from typing import Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
import httpx
import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from models.user import UserBase, UserCreate, UserResponse, UserInDB, AuthProvider
from services.database_service import DatabaseService

logger = logging.getLogger("auth-service.oauth")

# OAuth2 scheme for token authentication
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

class OAuthService:
    def __init__(self):
        # Google OAuth credentials
        self.google_client_id = os.environ.get("GOOGLE_CLIENT_ID", "")
        self.google_client_secret = os.environ.get("GOOGLE_CLIENT_SECRET", "")
        self.google_redirect_uri = os.environ.get("GOOGLE_REDIRECT_URI", "http://localhost:3002/oauth/google/callback")
        
        # JWT settings
        self.jwt_secret = os.environ.get("JWT_SECRET", "your-secret-key")
        self.jwt_algorithm = "HS256"
        self.jwt_expiration = int(os.environ.get("JWT_EXPIRATION_MINUTES", "1440"))  # 24 hours
        
        # Database service
        self.db_service = DatabaseService()
    
    def get_google_auth_url(self) -> str:
        """
        Generate Google OAuth authorization URL
        """
        auth_url = "https://accounts.google.com/o/oauth2/auth"
        params = {
            "client_id": self.google_client_id,
            "redirect_uri": self.google_redirect_uri,
            "response_type": "code",
            "scope": "email profile",
            "access_type": "offline",
            "prompt": "consent"
        }
        
        # Construct URL with query parameters
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        return f"{auth_url}?{query_string}"
    
    async def handle_google_callback(self, code: str) -> Tuple[Dict[str, Any], str]:
        """
        Exchange authorization code for tokens and get user info
        """
        # Exchange code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "client_id": self.google_client_id,
            "client_secret": self.google_client_secret,
            "code": code,
            "redirect_uri": self.google_redirect_uri,
            "grant_type": "authorization_code"
        }
        
        async with httpx.AsyncClient() as client:
            token_response = await client.post(token_url, data=token_data)
            
            if token_response.status_code != 200:
                logger.error(f"Error getting Google token: {token_response.text}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to get Google token"
                )
            
            token_json = token_response.json()
            access_token = token_json.get("access_token")
            
            # Get user info using access token
            userinfo_url = "https://www.googleapis.com/oauth2/v2/userinfo"
            headers = {"Authorization": f"Bearer {access_token}"}
            
            userinfo_response = await client.get(userinfo_url, headers=headers)
            
            if userinfo_response.status_code != 200:
                logger.error(f"Error getting Google user info: {userinfo_response.text}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Failed to get Google user info"
                )
            
            user_data = userinfo_response.json()
            return user_data, access_token
    
    async def create_or_update_user(self, google_user_data: Dict[str, Any]) -> UserInDB:
        """
        Create or update user in database based on Google profile
        """
        email = google_user_data.get("email")
        google_id = google_user_data.get("id")
        
        # Check if user exists
        existing_user = await self.db_service.get_user_by_email(email)
        
        if existing_user:
            # Update existing user
            update_data = {
                "auth_provider": AuthProvider.GOOGLE,
                "auth_provider_id": google_id,
                "first_name": google_user_data.get("given_name"),
                "last_name": google_user_data.get("family_name"),
                "profile_picture": google_user_data.get("picture"),
                "email_verified": google_user_data.get("verified_email", False),
                "last_login": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            updated_user = await self.db_service.update_user(existing_user.id, update_data)
            return updated_user
        else:
            # Create new user
            new_user = UserCreate(
                email=email,
                auth_provider=AuthProvider.GOOGLE,
                auth_provider_id=google_id,
                first_name=google_user_data.get("given_name"),
                last_name=google_user_data.get("family_name"),
                profile_picture=google_user_data.get("picture")
            )
            
            created_user = await self.db_service.create_user(new_user, email_verified=google_user_data.get("verified_email", False))
            return created_user
    
    def create_jwt_token(self, user: UserInDB) -> str:
        """
        Create JWT token for authenticated user
        """
        payload = {
            "sub": user.id,
            "email": user.email,
            "exp": datetime.utcnow() + timedelta(minutes=self.jwt_expiration)
        }
        
        token = jwt.encode(payload, self.jwt_secret, algorithm=self.jwt_algorithm)
        return token
    
    async def get_current_user(self, token: str = Depends(oauth2_scheme)) -> UserResponse:
        """
        Get current user from JWT token
        """
        try:
            # Decode and verify token
            payload = jwt.decode(token, self.jwt_secret, algorithms=[self.jwt_algorithm])
            user_id = payload.get("sub")
            
            if user_id is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid authentication credentials",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Get user from database
            user = await self.db_service.get_user_by_id(user_id)
            
            if user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            # Convert to UserResponse
            return UserResponse(
                id=user.id,
                email=user.email,
                first_name=user.first_name,
                last_name=user.last_name,
                profile_picture=user.profile_picture,
                auth_provider=user.auth_provider,
                created_at=user.created_at,
                updated_at=user.updated_at
            )
            
        except jwt.PyJWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
