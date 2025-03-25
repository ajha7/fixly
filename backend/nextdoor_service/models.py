from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field, HttpUrl
from datetime import datetime

from common.service_categories import ServiceCategory


class ProviderRating(BaseModel):
    """Model representing a provider's rating."""
    average_rating: float = Field(..., description="Average rating (1-5)")
    review_count: int = Field(..., description="Number of reviews")


class ProviderContact(BaseModel):
    """Model representing contact information for a provider."""
    phone: Optional[str] = Field(None, description="Phone number")
    email: Optional[str] = Field(None, description="Email address")
    website: Optional[HttpUrl] = Field(None, description="Website URL")


class ProviderModel(BaseModel):
    """Model representing a service provider from NextDoor."""
    id: str = Field(..., description="Unique provider identifier")
    name: str = Field(..., description="Business name")
    description: Optional[str] = Field(None, description="Business description")
    services: List[str] = Field(default_factory=list, description="List of services offered")
    address: Optional[str] = Field(None, description="Business address")
    city: str = Field(..., description="City")
    state: str = Field(..., description="State")
    zip_code: str = Field(..., description="ZIP code")
    distance: Optional[float] = Field(None, description="Distance from search location in miles")
    rating: Optional[ProviderRating] = Field(None, description="Provider rating information")
    contact: ProviderContact = Field(..., description="Contact information")
    image_urls: List[str] = Field(default_factory=list, description="List of image URLs")
    source: str = Field(default="nextdoor", description="Source of the provider data")
    verified: bool = Field(default=False, description="Whether the provider is verified")
    created_at: datetime = Field(default_factory=datetime.now, description="Time when the provider was added")
    updated_at: datetime = Field(default_factory=datetime.now, description="Last update timestamp")

    class Config:
        schema_extra = {
            "example": {
                "id": "nd_12345",
                "name": "ABC Plumbing Services",
                "description": "Professional plumbing services for residential and commercial properties",
                "services": ["plumbing", "drain cleaning", "water heater installation"],
                "address": "123 Main St",
                "city": "San Francisco",
                "state": "CA",
                "zip_code": "94105",
                "distance": 2.5,
                "rating": {
                    "average_rating": 4.8,
                    "review_count": 42
                },
                "contact": {
                    "phone": "415-555-1234",
                    "email": "info@abcplumbing.com",
                    "website": "https://www.abcplumbing.com"
                },
                "image_urls": ["https://nextdoor.com/images/abc-plumbing.jpg"],
                "source": "nextdoor",
                "verified": True,
                "created_at": "2025-03-24T16:09:28",
                "updated_at": "2025-03-24T16:09:28"
            }
        }


class ProviderSearchRequest(BaseModel):
    """Model for requesting provider search."""
    category: Union[ServiceCategory, str] = Field(..., description="Service category to search for")
    custom_category: Optional[str] = Field(None, description="Custom category if category is 'other'")
    location: Dict[str, Any] = Field(..., description="Location to search near")
    radius: float = Field(default=10.0, description="Search radius in miles")
    limit: int = Field(default=10, description="Maximum number of results to return")


class ProviderSearchResponse(BaseModel):
    """Model for provider search response."""
    providers: List[ProviderModel] = Field(..., description="List of providers found")
    total_count: int = Field(..., description="Total number of providers found")
    search_radius: float = Field(..., description="Search radius in miles")
    search_location: Dict[str, Any] = Field(..., description="Location searched")
