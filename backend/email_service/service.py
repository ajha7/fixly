"""
Email Service

This module implements the email sending service for the Fixly application.
"""

import os
import logging
from enum import Enum
from typing import Dict, Any, List, Optional
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# For SendGrid integration
import sendgrid
from sendgrid.helpers.mail import Mail, Email, To, Content, HtmlContent

# Configure logging
logger = logging.getLogger("uvicorn.error")


class EmailTemplate(str, Enum):
    """Enumeration of email templates."""
    MAGIC_LINK = "magic_link"
    WELCOME = "welcome"
    REQUEST_CONFIRMATION = "request_confirmation"
    PROVIDER_MATCH = "provider_match"


class EmailService:
    """Service for sending emails."""

    def __init__(self):
        """Initialize the email service."""
        # Email configuration
        self.sender_email = os.environ.get("EMAIL_SENDER", "noreply@fixly.com")
        self.sender_name = os.environ.get("EMAIL_SENDER_NAME", "Fixly")
        
        # SMTP configuration (for development/testing)
        self.smtp_host = os.environ.get("SMTP_HOST")
        self.smtp_port = int(os.environ.get("SMTP_PORT", "587"))
        self.smtp_username = os.environ.get("SMTP_USERNAME")
        self.smtp_password = os.environ.get("SMTP_PASSWORD")
        
        # SendGrid configuration (for production)
        self.sendgrid_api_key = os.environ.get("SENDGRID_API_KEY")
        
        # Frontend URL for links
        self.frontend_url = os.environ.get("FRONTEND_URL", "http://localhost:3000")
        
        # Determine which email provider to use
        self.use_sendgrid = bool(self.sendgrid_api_key)
        
        if not (self.use_sendgrid or (self.smtp_host and self.smtp_username and self.smtp_password)):
            logger.warning("No email provider configured. Emails will be logged but not sent.")

    async def send_email(self, to_email: str, subject: str, html_content: str, text_content: Optional[str] = None) -> bool:
        """Send an email.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML content of the email
            text_content: Plain text content of the email (optional)
            
        Returns:
            True if email was sent successfully, False otherwise
        """
        try:
            # Log the email for development/debugging
            logger.info(f"Sending email to {to_email}: {subject}")
            
            if self.use_sendgrid:
                return await self._send_with_sendgrid(to_email, subject, html_content, text_content)
            elif self.smtp_host and self.smtp_username and self.smtp_password:
                return await self._send_with_smtp(to_email, subject, html_content, text_content)
            else:
                # Log the email content for development
                logger.info(f"Email content (HTML): {html_content}")
                if text_content:
                    logger.info(f"Email content (Text): {text_content}")
                return True  # Return success for development
        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            return False

    async def send_template_email(self, to_email: str, template: EmailTemplate, context: Dict[str, Any]) -> bool:
        """Send an email using a template.
        
        Args:
            to_email: Recipient email address
            template: Email template to use
            context: Context data for the template
            
        Returns:
            True if email was sent successfully, False otherwise
        """
        try:
            # Get template content
            subject, html_content, text_content = self._get_template_content(template, context)
            
            # Send the email
            return await self.send_email(to_email, subject, html_content, text_content)
        except Exception as e:
            logger.error(f"Error sending template email: {str(e)}")
            return False

    async def send_magic_link_email(self, to_email: str, magic_link_url: str, user_name: Optional[str] = None) -> bool:
        """Send a magic link email for authentication.
        
        Args:
            to_email: Recipient email address
            magic_link_url: Magic link URL
            user_name: User's name (optional)
            
        Returns:
            True if email was sent successfully, False otherwise
        """
        try:
            # Prepare context for the template
            context = {
                "magic_link_url": magic_link_url,
                "user_name": user_name or to_email.split("@")[0],
                "expires_in_minutes": 15,  # Match the expiration time in auth_service
                "frontend_url": self.frontend_url
            }
            
            # Send the email using the magic link template
            return await self.send_template_email(to_email, EmailTemplate.MAGIC_LINK, context)
        except Exception as e:
            logger.error(f"Error sending magic link email: {str(e)}")
            return False

    async def _send_with_sendgrid(self, to_email: str, subject: str, html_content: str, text_content: Optional[str] = None) -> bool:
        """Send an email using SendGrid.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML content of the email
            text_content: Plain text content of the email (optional)
            
        Returns:
            True if email was sent successfully, False otherwise
        """
        try:
            # Initialize SendGrid client
            sg = sendgrid.SendGridAPIClient(api_key=self.sendgrid_api_key)
            
            # Create email
            from_email = Email(self.sender_email, self.sender_name)
            to_email = To(to_email)
            
            # Create content
            if text_content:
                mail = Mail(from_email, to_email, subject, Content("text/plain", text_content))
                mail.add_content(HtmlContent(html_content))
            else:
                mail = Mail(from_email, to_email, subject, HtmlContent(html_content))
            
            # Send email
            response = sg.client.mail.send.post(request_body=mail.get())
            
            # Check response
            return response.status_code in (200, 201, 202)
        except Exception as e:
            logger.error(f"SendGrid error: {str(e)}")
            return False

    async def _send_with_smtp(self, to_email: str, subject: str, html_content: str, text_content: Optional[str] = None) -> bool:
        """Send an email using SMTP.
        
        Args:
            to_email: Recipient email address
            subject: Email subject
            html_content: HTML content of the email
            text_content: Plain text content of the email (optional)
            
        Returns:
            True if email was sent successfully, False otherwise
        """
        try:
            # Create message
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{self.sender_name} <{self.sender_email}>"
            msg["To"] = to_email
            
            # Add content
            if text_content:
                msg.attach(MIMEText(text_content, "plain"))
            msg.attach(MIMEText(html_content, "html"))
            
            # Connect to SMTP server
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_username, self.smtp_password)
                server.send_message(msg)
            
            return True
        except Exception as e:
            logger.error(f"SMTP error: {str(e)}")
            return False

    def _get_template_content(self, template: EmailTemplate, context: Dict[str, Any]) -> tuple:
        """Get the content for an email template.
        
        Args:
            template: Email template to use
            context: Context data for the template
            
        Returns:
            Tuple of (subject, html_content, text_content)
        """
        if template == EmailTemplate.MAGIC_LINK:
            return self._get_magic_link_template(context)
        elif template == EmailTemplate.WELCOME:
            return self._get_welcome_template(context)
        elif template == EmailTemplate.REQUEST_CONFIRMATION:
            return self._get_request_confirmation_template(context)
        elif template == EmailTemplate.PROVIDER_MATCH:
            return self._get_provider_match_template(context)
        else:
            raise ValueError(f"Unknown email template: {template}")

    def _get_magic_link_template(self, context: Dict[str, Any]) -> tuple:
        """Get the content for the magic link email template.
        
        Args:
            context: Context data for the template
            
        Returns:
            Tuple of (subject, html_content, text_content)
        """
        user_name = context.get("user_name", "there")
        magic_link_url = context.get("magic_link_url")
        expires_in_minutes = context.get("expires_in_minutes", 15)
        frontend_url = context.get("frontend_url", self.frontend_url)
        
        subject = "Sign in to Fixly"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sign in to Fixly</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                .container {{ background-color: #f9f9f9; border-radius: 5px; padding: 20px; }}
                .logo {{ text-align: center; margin-bottom: 20px; }}
                .button {{ display: inline-block; background-color: #4CAF50; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin: 20px 0; }}
                .footer {{ font-size: 12px; color: #777; margin-top: 30px; text-align: center; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">
                    <h1>Fixly</h1>
                </div>
                <p>Hi {user_name},</p>
                <p>Click the button below to sign in to your Fixly account. This link will expire in {expires_in_minutes} minutes.</p>
                <p><a href="{magic_link_url}" class="button">Sign in to Fixly</a></p>
                <p>If you didn't request this email, you can safely ignore it.</p>
                <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
                <p>{magic_link_url}</p>
                <div class="footer">
                    <p>© {datetime.now().year} Fixly. All rights reserved.</p>
                    <p><a href="{frontend_url}">Visit our website</a></p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Hi {user_name},
        
        Click the link below to sign in to your Fixly account. This link will expire in {expires_in_minutes} minutes.
        
        {magic_link_url}
        
        If you didn't request this email, you can safely ignore it.
        
        © {datetime.now().year} Fixly. All rights reserved.
        {frontend_url}
        """
        
        return subject, html_content, text_content

    def _get_welcome_template(self, context: Dict[str, Any]) -> tuple:
        """Get the content for the welcome email template.
        
        Args:
            context: Context data for the template
            
        Returns:
            Tuple of (subject, html_content, text_content)
        """
        # Implement welcome email template
        user_name = context.get("user_name", "there")
        frontend_url = context.get("frontend_url", self.frontend_url)
        
        subject = "Welcome to Fixly!"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Fixly</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                .container {{ background-color: #f9f9f9; border-radius: 5px; padding: 20px; }}
                .logo {{ text-align: center; margin-bottom: 20px; }}
                .button {{ display: inline-block; background-color: #4CAF50; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin: 20px 0; }}
                .footer {{ font-size: 12px; color: #777; margin-top: 30px; text-align: center; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">
                    <h1>Fixly</h1>
                </div>
                <p>Hi {user_name},</p>
                <p>Welcome to Fixly! We're excited to have you on board.</p>
                <p>Fixly connects you with local home service providers to help you solve your home-related issues quickly and easily.</p>
                <p><a href="{frontend_url}" class="button">Get Started</a></p>
                <div class="footer">
                    <p>© {datetime.now().year} Fixly. All rights reserved.</p>
                    <p><a href="{frontend_url}">Visit our website</a></p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Hi {user_name},
        
        Welcome to Fixly! We're excited to have you on board.
        
        Fixly connects you with local home service providers to help you solve your home-related issues quickly and easily.
        
        Get started: {frontend_url}
        
        © {datetime.now().year} Fixly. All rights reserved.
        {frontend_url}
        """
        
        return subject, html_content, text_content

    def _get_request_confirmation_template(self, context: Dict[str, Any]) -> tuple:
        """Get the content for the request confirmation email template.
        
        Args:
            context: Context data for the template
            
        Returns:
            Tuple of (subject, html_content, text_content)
        """
        # Implement request confirmation email template
        user_name = context.get("user_name", "there")
        request_id = context.get("request_id")
        request_description = context.get("request_description")
        frontend_url = context.get("frontend_url", self.frontend_url)
        
        subject = "Your Fixly Service Request Confirmation"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Fixly Service Request Confirmation</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                .container {{ background-color: #f9f9f9; border-radius: 5px; padding: 20px; }}
                .logo {{ text-align: center; margin-bottom: 20px; }}
                .button {{ display: inline-block; background-color: #4CAF50; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin: 20px 0; }}
                .footer {{ font-size: 12px; color: #777; margin-top: 30px; text-align: center; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">
                    <h1>Fixly</h1>
                </div>
                <p>Hi {user_name},</p>
                <p>Your service request has been received and is being processed.</p>
                <p><strong>Request ID:</strong> {request_id}</p>
                <p><strong>Description:</strong> {request_description}</p>
                <p>We'll start looking for service providers in your area right away.</p>
                <p><a href="{frontend_url}/requests/{request_id}" class="button">View Request</a></p>
                <div class="footer">
                    <p>© {datetime.now().year} Fixly. All rights reserved.</p>
                    <p><a href="{frontend_url}">Visit our website</a></p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Hi {user_name},
        
        Your service request has been received and is being processed.
        
        Request ID: {request_id}
        Description: {request_description}
        
        We'll start looking for service providers in your area right away.
        
        View Request: {frontend_url}/requests/{request_id}
        
        © {datetime.now().year} Fixly. All rights reserved.
        {frontend_url}
        """
        
        return subject, html_content, text_content

    def _get_provider_match_template(self, context: Dict[str, Any]) -> tuple:
        """Get the content for the provider match email template.
        
        Args:
            context: Context data for the template
            
        Returns:
            Tuple of (subject, html_content, text_content)
        """
        # Implement provider match email template
        user_name = context.get("user_name", "there")
        request_id = context.get("request_id")
        provider_count = context.get("provider_count", 0)
        frontend_url = context.get("frontend_url", self.frontend_url)
        
        subject = f"We found {provider_count} service providers for your request"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Service Providers Found</title>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                .container {{ background-color: #f9f9f9; border-radius: 5px; padding: 20px; }}
                .logo {{ text-align: center; margin-bottom: 20px; }}
                .button {{ display: inline-block; background-color: #4CAF50; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin: 20px 0; }}
                .footer {{ font-size: 12px; color: #777; margin-top: 30px; text-align: center; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="logo">
                    <h1>Fixly</h1>
                </div>
                <p>Hi {user_name},</p>
                <p>Good news! We found {provider_count} service providers that match your request.</p>
                <p>Click the button below to view the providers and their details.</p>
                <p><a href="{frontend_url}/requests/{request_id}" class="button">View Providers</a></p>
                <div class="footer">
                    <p>© {datetime.now().year} Fixly. All rights reserved.</p>
                    <p><a href="{frontend_url}">Visit our website</a></p>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        Hi {user_name},
        
        Good news! We found {provider_count} service providers that match your request.
        
        Click the link below to view the providers and their details.
        
        {frontend_url}/requests/{request_id}
        
        © {datetime.now().year} Fixly. All rights reserved.
        {frontend_url}
        """
        
        return subject, html_content, text_content
