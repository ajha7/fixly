import os
import logging
from typing import Dict, Any, Optional
from pydantic import EmailStr
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger("auth-service.email")

class EmailService:
    def __init__(self):
        # Email configuration
        self.smtp_server = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
        self.smtp_port = int(os.environ.get("SMTP_PORT", "587"))
        self.smtp_username = os.environ.get("SMTP_USERNAME", "")
        self.smtp_password = os.environ.get("SMTP_PASSWORD", "")
        self.sender_email = os.environ.get("SENDER_EMAIL", "noreply@fixly.com")
        self.sender_name = os.environ.get("SENDER_NAME", "Fixly")
    
    async def send_email(self, recipient_email: EmailStr, subject: str, body: str, is_html: bool = True) -> None:
        """
        Send email to recipient
        """
        # Create message
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = f"{self.sender_name} <{self.sender_email}>"
        message["To"] = recipient_email
        
        # Attach body
        if is_html:
            message.attach(MIMEText(body, "html"))
        else:
            message.attach(MIMEText(body, "plain"))
        
        try:
            # Connect to SMTP server
            server = smtplib.SMTP(self.smtp_server, self.smtp_port)
            server.starttls()
            
            # Login if credentials are provided
            if self.smtp_username and self.smtp_password:
                server.login(self.smtp_username, self.smtp_password)
            
            # Send email
            server.sendmail(self.sender_email, recipient_email, message.as_string())
            server.quit()
            
            logger.info(f"Email sent to {recipient_email}")
        except Exception as e:
            logger.error(f"Error sending email: {str(e)}")
            # Don't raise exception to avoid breaking the flow
            # In production, you might want to implement retry logic or queue system
