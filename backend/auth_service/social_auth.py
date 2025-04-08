"""
Social Authentication Providers

This module implements the social authentication providers for the Fixly application.
"""

import os
import logging
import json
from typing import Optional, Dict, Any, Tuple
from urllib.parse import urlencode

import requests
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests

from .models import SocialProvider, UserCreate

# Configure logging
logger = logging.getLogger("uvicorn.error")


class SocialAuthProvider:
    """Base class for social authentication providers."""
    
    def __init__(self):
        """Initialize the social authentication provider."""
        self.frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    
    async def get_auth_url(self, redirect_uri: str, state: Optional[str] = None) -> str:
        """Get the authorization URL for the social provider.
        
        Args:
            redirect_uri: Redirect URI after authentication
            state: Optional state parameter for security
            
        Returns:
            Authorization URL
        """
        raise NotImplementedError("Subclasses must implement get_auth_url")
    
    async def verify_token(self, token: str, redirect_uri: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Verify a token from the social provider.
        
        Args:
            token: Token from the social provider
            redirect_uri: Optional redirect URI used in the auth flow
            
        Returns:
            User information or None if verification fails
        """
        raise NotImplementedError("Subclasses must implement verify_token")


class GoogleAuthProvider(SocialAuthProvider):
    """Google authentication provider."""
    
    def __init__(self):
        """Initialize the Google authentication provider."""
        super().__init__()
        self.client_id = os.environ.get("GOOGLE_CLIENT_ID")
        self.client_secret = os.environ.get("GOOGLE_CLIENT_SECRET")
        
        if not self.client_id or not self.client_secret:
            logger.warning("Google client credentials not configured")
    
    async def get_auth_url(self, redirect_uri: str, state: Optional[str] = None) -> str:
        """Get the Google authorization URL.
        
        Args:
            redirect_uri: Redirect URI after authentication
            state: Optional state parameter for security
            
        Returns:
            Google authorization URL
        """
        if not self.client_id:
            raise ValueError("Google client ID not configured")
        
        params = {
            "client_id": self.client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "openid email profile",
            "access_type": "offline",
            "prompt": "select_account"
        }
        
        if state:
            params["state"] = state
        
        auth_url = f"https://accounts.google.com/o/oauth2/auth?{urlencode(params)}"
        return auth_url
    
    async def verify_token(self, token: str, redirect_uri: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Verify a Google ID token.
        
        Args:
            token: Google ID token or authorization code
            redirect_uri: Optional redirect URI used in the auth flow
            
        Returns:
            User information or None if verification fails
        """
        try:
            # Check if this is an authorization code or ID token
            if redirect_uri and len(token) < 1000:  # Likely an authorization code
                # Exchange authorization code for tokens
                token_url = "https://oauth2.googleapis.com/token"
                token_data = {
                    "code": token,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "redirect_uri": redirect_uri,
                    "grant_type": "authorization_code"
                }
                
                token_response = requests.post(token_url, data=token_data)
                token_response.raise_for_status()
                token_info = token_response.json()
                
                # Extract ID token
                id_token_str = token_info.get("id_token")
                if not id_token_str:
                    raise ValueError("ID token not found in response")
                
                # Verify the ID token
                idinfo = id_token.verify_oauth2_token(
                    id_token_str, google_requests.Request(), self.client_id
                )
            else:
                # Verify the ID token directly
                idinfo = id_token.verify_oauth2_token(
                    token, google_requests.Request(), self.client_id
                )
            
            # Check issuer
            if idinfo["iss"] not in ["accounts.google.com", "https://accounts.google.com"]:
                raise ValueError("Invalid issuer")
            
            # Extract user information
            user_info = {
                "provider": SocialProvider.GOOGLE,
                "provider_user_id": idinfo["sub"],
                "email": idinfo["email"],
                "name": idinfo.get("name"),
                "profile_picture": idinfo.get("picture"),
                "email_verified": idinfo.get("email_verified", False)
            }
            
            return user_info
        except ValueError as e:
            logger.error(f"Google token verification error: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error verifying Google token: {str(e)}")
            return None


class NextdoorAuthProvider(SocialAuthProvider):
    """Nextdoor authentication provider."""
    
    def __init__(self):
        """Initialize the Nextdoor authentication provider."""
        super().__init__()
        self.client_id = os.environ.get("NEXTDOOR_CLIENT_ID")
        self.client_secret = os.environ.get("NEXTDOOR_CLIENT_SECRET")
        
        if not self.client_id or not self.client_secret:
            logger.warning("Nextdoor client credentials not configured")
    
    async def get_auth_url(self, redirect_uri: str, state: Optional[str] = None) -> str:
        """Get the Nextdoor authorization URL.
        
        Args:
            redirect_uri: Redirect URI after authentication
            state: Optional state parameter for security
            
        Returns:
            Nextdoor authorization URL
        """
        if not self.client_id:
            raise ValueError("Nextdoor client ID not configured")
        
        params = {
            "client_id": self.client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "user:read email:read"
        }
        
        if state:
            params["state"] = state
        
        auth_url = f"https://auth.nextdoor.com/v2/auth?{urlencode(params)}"
        return auth_url
    
    async def verify_token(self, token: str, redirect_uri: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Verify a Nextdoor authorization code.
        
        Args:
            token: Nextdoor authorization code
            redirect_uri: Redirect URI used in the auth flow
            
        Returns:
            User information or None if verification fails
        """
        try:
            if not redirect_uri:
                raise ValueError("Redirect URI is required for Nextdoor authentication")
            
            # Exchange authorization code for access token
            token_url = "https://api.nextdoor.com/v1/oauth2/token"
            token_data = {
                "grant_type": "authorization_code",
                "code": token,
                "redirect_uri": redirect_uri,
                "client_id": self.client_id,
                "client_secret": self.client_secret
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
            user_data = user_response.json()
            
            # Extract user information
            user_info = {
                "provider": SocialProvider.NEXTDOOR,
                "provider_user_id": user_data["id"],
                "email": user_data["email"],
                "name": user_data.get("name", ""),
                "profile_picture": user_data.get("profile_picture"),
                "email_verified": True  # Assuming Nextdoor provides verified emails
            }
            
            return user_info
        except requests.RequestException as e:
            logger.error(f"Nextdoor API request error: {str(e)}")
            return None
        except ValueError as e:
            logger.error(f"Nextdoor authentication error: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error verifying Nextdoor token: {str(e)}")
            return None


class FacebookAuthProvider(SocialAuthProvider):
    """Facebook authentication provider."""
    
    def __init__(self):
        """Initialize the Facebook authentication provider."""
        super().__init__()
        self.app_id = os.environ.get("FACEBOOK_APP_ID")
        self.app_secret = os.environ.get("FACEBOOK_APP_SECRET")
        
        if not self.app_id or not self.app_secret:
            logger.warning("Facebook app credentials not configured")
    
    async def get_auth_url(self, redirect_uri: str, state: Optional[str] = None) -> str:
        """Get the Facebook authorization URL.
        
        Args:
            redirect_uri: Redirect URI after authentication
            state: Optional state parameter for security
            
        Returns:
            Facebook authorization URL
        """
        if not self.app_id:
            raise ValueError("Facebook app ID not configured")
        
        params = {
            "client_id": self.app_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": "email,public_profile"
        }
        
        if state:
            params["state"] = state
        
        auth_url = f"https://www.facebook.com/v12.0/dialog/oauth?{urlencode(params)}"
        return auth_url
    
    async def verify_token(self, token: str, redirect_uri: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Verify a Facebook access token or authorization code.
        
        Args:
            token: Facebook access token or authorization code
            redirect_uri: Optional redirect URI used in the auth flow
            
        Returns:
            User information or None if verification fails
        """
        try:
            access_token = token
            
            # If this is an authorization code, exchange it for an access token
            if redirect_uri and len(token) < 100:  # Likely an authorization code
                token_url = "https://graph.facebook.com/v12.0/oauth/access_token"
                params = {
                    "client_id": self.app_id,
                    "client_secret": self.app_secret,
                    "redirect_uri": redirect_uri,
                    "code": token
                }
                
                token_response = requests.get(token_url, params=params)
                token_response.raise_for_status()
                token_info = token_response.json()
                
                access_token = token_info["access_token"]
            
            # Verify the token
            verify_url = f"https://graph.facebook.com/debug_token"
            params = {
                "input_token": access_token,
                "access_token": f"{self.app_id}|{self.app_secret}"
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
                "access_token": access_token
            }
            
            user_response = requests.get(user_info_url, params=params)
            user_response.raise_for_status()
            user_data = user_response.json()
            
            # Extract user information
            email = user_data.get("email")
            if not email:
                raise ValueError("Email not provided by Facebook")
            
            user_info = {
                "provider": SocialProvider.FACEBOOK,
                "provider_user_id": user_data["id"],
                "email": email,
                "name": user_data.get("name"),
                "profile_picture": user_data.get("picture", {}).get("data", {}).get("url"),
                "email_verified": True  # Assuming Facebook provides verified emails
            }
            
            return user_info
        except requests.RequestException as e:
            logger.error(f"Facebook API request error: {str(e)}")
            return None
        except ValueError as e:
            logger.error(f"Facebook authentication error: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"Error verifying Facebook token: {str(e)}")
            return None


# Provider factory
def get_social_provider(provider: SocialProvider) -> SocialAuthProvider:
    """Get a social authentication provider by type.
    
    Args:
        provider: Social provider type
        
    Returns:
        Social authentication provider
        
    Raises:
        ValueError: If provider is not supported
    """
    if provider == SocialProvider.GOOGLE:
        return GoogleAuthProvider()
    elif provider == SocialProvider.NEXTDOOR:
        return NextdoorAuthProvider()
    elif provider == SocialProvider.FACEBOOK:
        return FacebookAuthProvider()
    else:
        raise ValueError(f"Unsupported social provider: {provider}")
