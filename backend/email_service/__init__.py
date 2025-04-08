"""
Email Service Package

This package handles email sending for the Fixly application.
"""

from .service import EmailService, EmailTemplate

__all__ = [
    'EmailService',
    'EmailTemplate'
]
