import os
import logging
import secrets
import jwt
from typing import Dict, Any, Optional, Tuple
from datetime import datetime, timedelta
from fastapi import HTTPException, status
from pydantic import EmailStr
from models.user import UserBase, UserCreate, UserResponse, UserInDB, AuthProvider
from services.database_service import DatabaseService
from services.email_service import EmailService

logger = logging.getLogger("auth-service.magic-link")

class MagicLinkService:
    def __init__(self):
        # JWT settings
        self.jwt_secret = os.environ.get("JWT_SECRET", "your-secret-key")
        self.jwt_algorithm = "HS256"
        self.jwt_expiration = int(os.environ.get("JWT_EXPIRATION_MINUTES", "1440"))  # 24 hours
        self.magic_link_expiration = int(os.environ.get("MAGIC_LINK_EXPIRATION_MINUTES", "15"))  # 15 minutes
        
        # Services
        self.db_service = DatabaseService()
        self.email_service = EmailService()
        
        # Magic link base URL
        self.auth_service_url = os.environ.get("AUTH_SERVICE_URL", "http://localhost:3002")
    
    async def send_magic_link(self, email: EmailStr) -> None:
        """
        Generate and send magic link to user's email
        """
        # Generate token for magic link
        token = self._generate_magic_link_token(email)
        
        # Create magic link URL
        magic_link = f"{self.auth_service_url}/magic-link/verify?token={token}"
        
        # Send email with magic link
        subject = "Fixly - Sign in to your account"
        body = f"""
        <h1>Sign in to Fixly</h1>
        <p>Click the link below to sign in to your Fixly account:</p>
        <p><a href="{magic_link}">Sign in to Fixly</a></p>
        <p>This link will expire in {self.magic_link_expiration} minutes.</p>
        <p>If you didn't request this email, you can safely ignore it.</p>
        """
        
        await self.email_service.send_email(email, subject, body)
        logger.info(f"Magic link sent to {email}")
    
    def _generate_magic_link_token(self, email: EmailStr) -> str:
        """
        Generate JWT token for magic link
        """
        payload = {
            "email": email,
            "exp": datetime.utcnow() + timedelta(minutes=self.magic_link_expiration),
            "type": "magic_link"
        }
        
        token = jwt.encode(payload, self.jwt_secret, algorithm=self.jwt_algorithm)
        return token
    
    async def verify_magic_link(self, token: str) -> Tuple[UserInDB, str]:
        """
        Verify magic link token and authenticate user
        """
        try:
            # Decode and verify token
            payload = jwt.decode(token, self.jwt_secret, algorithms=[self.jwt_algorithm])
            
            # Check token type
            if payload.get("type") != "magic_link":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid token type"
                )
            
            email = payload.get("email")
            
            if email is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid token"
                )
            
            # Get or create user
            user = await self._get_or_create_user(email)
            
            # Generate JWT token for authentication
            auth_token = self._create_auth_token(user)
            
            return user, auth_token
            
        except jwt.PyJWTError as e:
            logger.error(f"Error verifying magic link token: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired token"
            )
    
    async def _get_or_create_user(self, email: EmailStr) -> UserInDB:
        """
        Get existing user or create new user
        """
        # Check if user exists
        existing_user = await self.db_service.get_user_by_email(email)
        
        if existing_user:
            # Update last login
            update_data = {
                "last_login": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            
            updated_user = await self.db_service.update_user(existing_user.id, update_data)
            return updated_user
        else:
            # Create new user
            new_user = UserCreate(
                email=email,
                auth_provider=AuthProvider.EMAIL,
                auth_provider_id=None
            )
            
            created_user = await self.db_service.create_user(new_user, email_verified=True)
            return created_user
    
    def _create_auth_token(self, user: UserInDB) -> str:
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
