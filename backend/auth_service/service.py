"""
Authentication Service

This module implements the authentication service for the Fixly application,
supporting both social media login and email magic link authentication.
"""

import os
import logging
import secrets
import json
from typing import Optional, Dict, Any, Tuple, List
from datetime import datetime, timedelta
from urllib.parse import urlencode, quote_plus

import jwt
import requests
from bson.objectid import ObjectId
from pymongo.database import Database
from pymongo.errors import PyMongoError
from fastapi import HTTPException, status
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from .models import User, UserCreate, UserResponse, SocialProvider, TokenData, TokenResponse
from email_service.service import EmailService

# Configure logging
logger = logging.getLogger("uvicorn.error")

# Constants
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days
ALGORITHM = "HS256"
SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "fixly_secret_key_change_in_production")
MAGIC_LINK_EXPIRE_MINUTES = 15  # 15 minutes


class AuthService:
    """Service for handling user authentication."""

    def __init__(self, db: Database):
        """Initialize the authentication service.
        
        Args:
            db: MongoDB database instance
        """
        self.db = db
        self.users_collection = db.users_collection
        self.magic_links_collection = db.magic_links_collection
        
        # Initialize social login providers
        self.google_client_id = os.environ.get("GOOGLE_CLIENT_ID")
        self.nextdoor_client_id = os.environ.get("NEXTDOOR_CLIENT_ID")
        self.nextdoor_client_secret = os.environ.get("NEXTDOOR_CLIENT_SECRET")
        self.facebook_app_id = os.environ.get("FACEBOOK_APP_ID")
        self.facebook_app_secret = os.environ.get("FACEBOOK_APP_SECRET")
        
        # Email service configuration
        self.email_sender = os.environ.get("EMAIL_SENDER", "noreply@fixly.com")
        self.frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
        
        # Initialize email service
        self.email_service = EmailService()

    async def register_user(self, user_data: UserCreate) -> User:
        """Register a new user.
        
        Args:
            user_data: User creation data
            
        Returns:
            Created user
            
        Raises:
            HTTPException: If there's an error creating the user
        """
        try:
            # Check if user already exists
            existing_user = await self.get_user_by_email(user_data.email)
            if existing_user:
                # If user exists with social provider, update provider info
                if user_data.provider and user_data.provider_user_id:
                    return await self._update_social_provider(existing_user, user_data)
                
                # Otherwise, return the existing user
                return existing_user
            
            # Create new user document
            user_dict = user_data.dict()
            user_dict["email_verified"] = bool(user_data.provider)  # Auto-verify if social login
            user_dict["created_at"] = datetime.now()
            user_dict["updated_at"] = datetime.now()
            
            # Insert user into database
            result = self.users_collection.insert_one(user_dict)
            
            # Get the created user
            user_dict["id"] = str(result.inserted_id)
            
            return User(**user_dict)
        except PyMongoError as e:
            logger.error(f"MongoDB error creating user: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Database error: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )

    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get a user by email.
        
        Args:
            email: User's email address
            
        Returns:
            User or None if not found
        """
        try:
            user_dict = self.users_collection.find_one({"email": email})
            if not user_dict:
                return None
            
            # Convert ObjectId to string
            user_dict["id"] = str(user_dict.pop("_id"))
            
            return User(**user_dict)
        except Exception as e:
            logger.error(f"Error retrieving user by email: {str(e)}")
            return None

    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get a user by ID.
        
        Args:
            user_id: User's ID
            
        Returns:
            User or None if not found
        """
        try:
            # Convert string ID to ObjectId
            obj_id = ObjectId(user_id)
            
            user_dict = self.users_collection.find_one({"_id": obj_id})
            if not user_dict:
                return None
            
            # Convert ObjectId to string
            user_dict["id"] = str(user_dict.pop("_id"))
            
            return User(**user_dict)
        except Exception as e:
            logger.error(f"Error retrieving user by ID: {str(e)}")
            return None

    async def get_user_by_social_id(self, provider: SocialProvider, provider_user_id: str) -> Optional[User]:
        """Get a user by social provider ID.
        
        Args:
            provider: Social provider
            provider_user_id: User ID from social provider
            
        Returns:
            User or None if not found
        """
        try:
            user_dict = self.users_collection.find_one({
                "provider": provider,
                "provider_user_id": provider_user_id
            })
            
            if not user_dict:
                return None
            
            # Convert ObjectId to string
            user_dict["id"] = str(user_dict.pop("_id"))
            
            return User(**user_dict)
        except Exception as e:
            logger.error(f"Error retrieving user by social ID: {str(e)}")
            return None

    async def authenticate_google(self, token: str) -> Optional[User]:
        """Authenticate a user with Google.
        
        Args:
            token: Google ID token
            
        Returns:
            Authenticated user or None if authentication fails
        """
        try:
            if not self.google_client_id:
                raise ValueError("Google client ID not configured")
            
            # Verify the token
            idinfo = id_token.verify_oauth2_token(
                token, google_requests.Request(), self.google_client_id
            )
            
            # Check issuer
            if idinfo["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
                raise ValueError("Invalid issuer")
            
            # Get user info
            email = idinfo["email"]
            name = idinfo.get("name")
            picture = idinfo.get("picture")
            google_id = idinfo["sub"]
            
            # Create or update user
            user_data = UserCreate(
                email=email,
                name=name,
                provider=SocialProvider.GOOGLE,
                provider_user_id=google_id,
                profile_picture=picture
            )
            
            # Register/update the user
            user = await self.register_user(user_data)
            
            # Update last login
            await self._update_last_login(user.id)
            
            return user
        except ValueError as e:
            logger.error(f"Google authentication error: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error authenticating with Google: {str(e)}")
            return None

    async def authenticate_nextdoor(self, token: str, redirect_url: str) -> Optional[User]:
        """Authenticate a user with NextDoor.
        
        Args:
            token: NextDoor authorization code
            redirect_url: Redirect URL used in OAuth flow
            
        Returns:
            Authenticated user or None if authentication fails
        """
        try:
            if not self.nextdoor_client_id or not self.nextdoor_client_secret:
                raise ValueError("NextDoor client credentials not configured")
            
            # Exchange authorization code for access token
            token_url = "https://api.nextdoor.com/v1/oauth2/token"
            token_data = {
                "grant_type": "authorization_code",
                "code": token,
                "redirect_uri": redirect_url,
                "client_id": self.nextdoor_client_id,
                "client_secret": self.nextdoor_client_secret
            }
            
            token_response = requests.post(token_url, data=token_data)
            token_response.raise_for_status()
            token_info = token_response.json()
            
            access_token = token_info["access_token"]
            
            # Get user info
            user_info_url = "https://api.nextdoor.com/v1/user"
            headers = {"Authorization": f"Bearer {access_token}"}
            
            user_response = requests.get(user_info_url, headers=headers)
            user_response.raise_for_status()
            user_info = user_response.json()
            
            # Extract user data
            email = user_info["email"]
            name = user_info.get("name", "")
            nextdoor_id = user_info["id"]
            picture = user_info.get("profile_picture")
            
            # Create or update user
            user_data = UserCreate(
                email=email,
                name=name,
                provider=SocialProvider.NEXTDOOR,
                provider_user_id=nextdoor_id,
                profile_picture=picture
            )
            
            # Register/update the user
            user = await self.register_user(user_data)
            
            # Update last login
            await self._update_last_login(user.id)
            
            return user
        except requests.RequestException as e:
            logger.error(f"NextDoor API request error: {str(e)}")
            return None
        except ValueError as e:
            logger.error(f"NextDoor authentication error: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error authenticating with NextDoor: {str(e)}")
            return None

    async def authenticate_facebook(self, token: str) -> Optional[User]:
        """Authenticate a user with Facebook.
        
        Args:
            token: Facebook access token
            
        Returns:
            Authenticated user or None if authentication fails
        """
        try:
            if not self.facebook_app_id or not self.facebook_app_secret:
                raise ValueError("Facebook app credentials not configured")
            
            # Verify the token
            verify_url = f"https://graph.facebook.com/debug_token"
            params = {
                "input_token": token,
                "access_token": f"{self.facebook_app_id}|{self.facebook_app_secret}"
            }
            
            verify_response = requests.get(verify_url, params=params)
            verify_response.raise_for_status()
            verify_data = verify_response.json()
            
            if not verify_data.get("data", {}).get("is_valid", False):
                raise ValueError("Invalid Facebook token")
            
            # Get user info
            user_info_url = "https://graph.facebook.com/me"
            params = {
                "fields": "id,name,email,picture",
                "access_token": token
            }
            
            user_response = requests.get(user_info_url, params=params)
            user_response.raise_for_status()
            user_info = user_response.json()
            
            # Extract user data
            email = user_info.get("email")
            if not email:
                raise ValueError("Email not provided by Facebook")
                
            name = user_info.get("name")
            facebook_id = user_info["id"]
            picture = user_info.get("picture", {}).get("data", {}).get("url")
            
            # Create or update user
            user_data = UserCreate(
                email=email,
                name=name,
                provider=SocialProvider.FACEBOOK,
                provider_user_id=facebook_id,
                profile_picture=picture
            )
            
            # Register/update the user
            user = await self.register_user(user_data)
            
            # Update last login
            await self._update_last_login(user.id)
            
            return user
        except requests.RequestException as e:
            logger.error(f"Facebook API request error: {str(e)}")
            return None
        except ValueError as e:
            logger.error(f"Facebook authentication error: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error authenticating with Facebook: {str(e)}")
            return None

    async def create_magic_link(self, email: str, redirect_url: str) -> bool:
        """Create and send a magic link for email authentication.
        
        Args:
            email: User's email address
            redirect_url: URL to redirect after authentication
            
        Returns:
            True if magic link was created and sent, False otherwise
        """
        try:
            # Generate a secure token
            token = secrets.token_urlsafe(32)
            
            # Set expiration time
            expires_at = datetime.now() + timedelta(minutes=MAGIC_LINK_EXPIRE_MINUTES)
            
            # Store the magic link in the database
            magic_link_data = {
                "email": email,
                "token": token,
                "redirect_url": redirect_url,
                "expires_at": expires_at,
                "used": False,
                "created_at": datetime.now()
            }
            
            self.magic_links_collection.insert_one(magic_link_data)
            
            # Create the magic link URL
            params = {
                "token": token,
                "redirect": redirect_url
            }
            magic_link_url = f"{self.frontend_url}/auth/verify?{urlencode(params)}"
            
            # Send the magic link email
            success = await self._send_magic_link_email(email, magic_link_url)
            
            return success
        except Exception as e:
            logger.error(f"Error creating magic link: {str(e)}")
            return False

    async def verify_magic_link(self, token: str) -> Optional[User]:
        """Verify a magic link token and authenticate the user.
        
        Args:
            token: Magic link token
            
        Returns:
            Authenticated user or None if verification fails
        """
        try:
            # Find the magic link in the database
            magic_link = self.magic_links_collection.find_one({
                "token": token,
                "used": False,
                "expires_at": {"$gt": datetime.now()}
            })
            
            if not magic_link:
                return None
            
            # Mark the magic link as used
            self.magic_links_collection.update_one(
                {"_id": magic_link["_id"]},
                {"$set": {"used": True}}
            )
            
            # Get the user's email
            email = magic_link["email"]
            
            # Check if user exists
            user = await self.get_user_by_email(email)
            
            if user:
                # Update email verification status if needed
                if not user.email_verified:
                    self.users_collection.update_one(
                        {"_id": ObjectId(user.id)},
                        {"$set": {"email_verified": True, "updated_at": datetime.now()}}
                    )
                    user.email_verified = True
                
                # Update last login
                await self._update_last_login(user.id)
            else:
                # Create a new user
                user_data = UserCreate(email=email)
                user = await self.register_user(user_data)
                
                # Update email verification status
                self.users_collection.update_one(
                    {"_id": ObjectId(user.id)},
                    {"$set": {"email_verified": True, "updated_at": datetime.now()}}
                )
                user.email_verified = True
            
            return user
        except Exception as e:
            logger.error(f"Error verifying magic link: {str(e)}")
            return None

    async def create_access_token(self, user: User) -> TokenResponse:
        """Create a JWT access token for a user.
        
        Args:
            user: User to create token for
            
        Returns:
            Token response with access token and user data
        """
        # Set token expiration
        expires_delta = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        expire = datetime.now() + expires_delta
        
        # Create token data
        token_data = {
            "sub": user.id,
            "email": user.email,
            "exp": expire.timestamp()
        }
        
        # Encode JWT token
        encoded_jwt = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
        
        # Create user response
        user_response = UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            phone=user.phone,
            profile_picture=user.profile_picture,
            email_verified=user.email_verified
        )
        
        # Create token response
        token_response = TokenResponse(
            access_token=encoded_jwt,
            token_type="bearer",
            user=user_response
        )
        
        return token_response

    async def verify_token(self, token: str) -> Optional[TokenData]:
        """Verify a JWT token and extract the token data.
        
        Args:
            token: JWT token
            
        Returns:
            Token data or None if verification fails
        """
        try:
            # Decode the token
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            
            # Extract user ID and email
            user_id = payload.get("sub")
            email = payload.get("email")
            exp = payload.get("exp")
            
            if user_id is None or email is None:
                return None
            
            # Create token data
            token_data = TokenData(
                user_id=user_id,
                email=email,
                exp=datetime.fromtimestamp(exp) if exp else None
            )
            
            return token_data
        except jwt.PyJWTError as e:
            logger.error(f"JWT verification error: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error verifying token: {str(e)}")
            return None

    async def _update_social_provider(self, user: User, user_data: UserCreate) -> User:
        """Update a user's social provider information.
        
        Args:
            user: Existing user
            user_data: New user data with social provider info
            
        Returns:
            Updated user
        """
        try:
            # Update user document
            update_data = {
                "provider": user_data.provider,
                "provider_user_id": user_data.provider_user_id,
                "updated_at": datetime.now()
            }
            
            # Update profile picture if provided
            if user_data.profile_picture:
                update_data["profile_picture"] = user_data.profile_picture
            
            # Update name if not already set
            if not user.name and user_data.name:
                update_data["name"] = user_data.name
            
            # Update email verification status if not already verified
            if not user.email_verified:
                update_data["email_verified"] = True
            
            # Update user in database
            self.users_collection.update_one(
                {"_id": ObjectId(user.id)},
                {"$set": update_data}
            )
            
            # Update user object
            for key, value in update_data.items():
                setattr(user, key, value)
            
            return user
        except Exception as e:
            logger.error(f"Error updating social provider: {str(e)}")
            raise

    async def _update_last_login(self, user_id: str) -> bool:
        """Update a user's last login timestamp.
        
        Args:
            user_id: User ID
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Update user document
            self.users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": {"last_login": datetime.now()}}
            )
            
            return True
        except Exception as e:
            logger.error(f"Error updating last login: {str(e)}")
            return False

    async def _send_magic_link_email(self, email: str, magic_link_url: str) -> bool:
        """Send a magic link email to a user.
        
        Args:
            email: User's email address
            magic_link_url: Magic link URL
            
        Returns:
            True if email was sent, False otherwise
        """
        try:
            # Get user name if available
            user = await self.get_user_by_email(email)
            user_name = user.name if user else None
            
            # Send magic link email using the email service
            return await self.email_service.send_magic_link_email(email, magic_link_url, user_name)
        except Exception as e:
            logger.error(f"Error sending magic link email: {str(e)}")
            return False
