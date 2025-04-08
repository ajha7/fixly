"""
Email Authentication with Magic Links

This module implements email authentication with magic links for the Fixly application.
"""

import os
import logging
import secrets
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from urllib.parse import urlencode

from pymongo.database import Database
from pymongo.errors import PyMongoError

# Configure logging
logger = logging.getLogger("uvicorn.error")

# Constants
MAGIC_LINK_EXPIRE_MINUTES = 15  # 15 minutes


class MagicLinkAuth:
    """Magic link email authentication."""
    
    def __init__(self, db: Database):
        """Initialize the magic link authentication.
        
        Args:
            db: MongoDB database instance
        """
        self.db = db
        self.magic_links_collection = db.magic_links_collection
        
        # Email service configuration
        self.email_sender = os.environ.get("EMAIL_SENDER", "noreply@fixly.com")
        self.frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
    
    async def create_magic_link(self, email: str, redirect_url: str) -> Optional[str]:
        """Create a magic link for email authentication.
        
        Args:
            email: User's email address
            redirect_url: URL to redirect after authentication
            
        Returns:
            Magic link token or None if creation fails
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
            
            return magic_link_url
        except Exception as e:
            logger.error(f"Error creating magic link: {str(e)}")
            return None
    
    async def verify_magic_link(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify a magic link token.
        
        Args:
            token: Magic link token
            
        Returns:
            User information or None if verification fails
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
            redirect_url = magic_link.get("redirect_url")
            
            # Return user information
            user_info = {
                "email": email,
                "email_verified": True,
                "redirect_url": redirect_url
            }
            
            return user_info
        except Exception as e:
            logger.error(f"Error verifying magic link: {str(e)}")
            return None
    
    async def send_magic_link_email(self, email: str, magic_link_url: str) -> bool:
        """Send a magic link email to a user.
        
        Args:
            email: User's email address
            magic_link_url: Magic link URL
            
        Returns:
            True if email was sent, False otherwise
        """
        try:
            # In a real implementation, you would use an email service like SendGrid, Mailgun, etc.
            # For now, we'll just log the magic link
            logger.info(f"Magic link for {email}: {magic_link_url}")
            
            # TODO: Implement actual email sending
            # Example with SendGrid:
            # from sendgrid import SendGridAPIClient
            # from sendgrid.helpers.mail import Mail
            #
            # message = Mail(
            #     from_email=self.email_sender,
            #     to_emails=email,
            #     subject='Sign in to Fixly',
            #     html_content=f'<p>Click the link below to sign in to Fixly:</p><p><a href="{magic_link_url}">Sign in</a></p>'
            # )
            #
            # sg = SendGridAPIClient(os.environ.get('SENDGRID_API_KEY'))
            # response = sg.send(message)
            #
            # return response.status_code == 202
            
            return True
        except Exception as e:
            logger.error(f"Error sending magic link email: {str(e)}")
            return False
