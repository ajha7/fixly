from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime, date

from common.service_categories import ServiceCategory

class DateRange(BaseModel):
    """Model representing a date range for availability."""
    start_date: date = Field(..., description="Start date of availability")
    end_date: date = Field(..., description="End date of availability")


class Location(BaseModel):
    """Model representing a location."""
    address: str = Field(..., description="Full address")
    city: str = Field(..., description="City")
    state: str = Field(..., description="State")
    zip_code: str = Field(..., description="ZIP code")
    coordinates: Optional[Dict[str, float]] = Field(None, description="Geo-coordinates (latitude, longitude)")


class RequestCreate(BaseModel):
    """Model for creating a new service request."""
    description: str = Field(..., description="Detailed description of the issue")
    availability: List[DateRange] = Field(..., description="Date ranges when user is available")
    images: Optional[List[str]] = Field([], description="URLs or paths to uploaded images")
    location: Location = Field(..., description="Location where service is needed")
    category: ServiceCategory = Field(default=ServiceCategory.OTHER, description="Category of service needed")
    custom_category: Optional[str] = Field(None, description="Custom category when 'OTHER' is selected")


class RequestResponse(BaseModel):
    """Model for request creation response."""
    id: str = Field(..., description="Unique request identifier")
    message: str = Field(..., description="Response message")


class RequestModel(BaseModel):
    """Complete request model with all fields."""
    id: str = Field(..., description="Unique request identifier")
    user_id: str = Field(..., description="User identifier")
    description: str = Field(..., description="Detailed description of the issue")
    availability: List[DateRange] = Field(..., description="Date ranges when user is available")
    images: List[str] = Field(default_factory=list, description="URLs or paths to uploaded images")
    location: Location = Field(..., description="Location where service is needed")
    category: ServiceCategory = Field(default=ServiceCategory.OTHER, description="Category of service needed")
    custom_category: Optional[str] = Field(None, description="Custom category when 'OTHER' is selected")
    status: str = Field(default="pending", description="Current state (e.g., 'pending', 'in_progress', 'completed')")
    scraped_providers: List[str] = Field(default_factory=list, description="List of related provider IDs")
    created_at: datetime = Field(default_factory=datetime.now, description="Time when the request was submitted")
    updated_at: datetime = Field(default_factory=datetime.now, description="Last modification timestamp")
    
    class Config:
        schema_extra = {
            "example": {
                "id": "60d21b4967d0d8992e610c85",
                "user_id": "60d21b4967d0d8992e610c84",
                "description": "Leaking kitchen faucet that needs repair",
                "availability": [
                    {"start_date": "2025-04-01", "end_date": "2025-04-05"},
                    {"start_date": "2025-04-10", "end_date": "2025-04-15"}
                ],
                "images": ["https://storage.example.com/image1.jpg"],
                "location": {
                    "address": "123 Main St",
                    "city": "San Francisco",
                    "state": "CA",
                    "zip_code": "94105",
                    "coordinates": {"latitude": 37.7749, "longitude": -122.4194}
                },
                "category": "plumbing",
                "custom_category": None,
                "status": "pending",
                "scraped_providers": ["60d21b4967d0d8992e610c86"],
                "created_at": "2025-03-23T10:24:54",
                "updated_at": "2025-03-23T10:24:54"
            }
        }
