import logging
import os
import json
import re
import random
import time
from typing import List, Dict, Any, Optional, Union
from datetime import datetime
from abc import ABC, abstractmethod
from urllib.parse import quote_plus

import requests
from bs4 import BeautifulSoup
from pymongo.database import Database
from pymongo.errors import PyMongoError

from .models import ProviderModel, ProviderSearchRequest, ProviderSearchResponse, ProviderRating, ProviderContact
from common.service_categories import ServiceCategory, get_contractor_type, get_search_terms, get_category_from_string

logger = logging.getLogger("uvicorn.error")


class NextDoorProviderSource(ABC):
    """Abstract base class for NextDoor provider data sources."""
    
    @abstractmethod
    async def search_providers(self, request: ProviderSearchRequest) -> List[ProviderModel]:
        """Search for providers based on the given request."""
        pass
    
    @abstractmethod
    async def get_provider_details(self, provider_id: str) -> Optional[ProviderModel]:
        """Get detailed information for a specific provider."""
        pass


class NextDoorScraper(NextDoorProviderSource):
    """Implementation of NextDoor provider source using web scraping."""
    
    def __init__(self, base_url: str = "https://nextdoor.com"):
        """Initialize the NextDoor scraper.
        
        Args:
            base_url: Base URL for NextDoor website
        """
        self.base_url = base_url
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Cache-Control": "max-age=0"
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
    
    async def search_providers(self, request: ProviderSearchRequest) -> List[ProviderModel]:
        """Search for providers on NextDoor based on the given request.
        
        Args:
            request: Provider search request parameters
            
        Returns:
            List of provider models
        """
        try:
            # Determine search term based on category
            category_str = request.category.value if isinstance(request.category, ServiceCategory) else request.category
            
            # For custom categories (OTHER), use the custom_category directly as the search term
            if category_str.lower() == "other" and request.custom_category:
                search_term = request.custom_category
                # We'll use this custom category directly for searching
            else:
                # For standard categories, use the predefined search terms
                category_enum = get_category_from_string(category_str) or ServiceCategory.OTHER
                search_terms = get_search_terms(category_enum)
                search_term = search_terms[0] if search_terms else category_str
            
            # Format location for search
            location_str = self._format_location(request.location)
            
            # Build search URL
            search_url = f"{self.base_url}/find-services/{quote_plus(search_term)}/{quote_plus(location_str)}"
            logger.info(f"Searching NextDoor at URL: {search_url}")
            
            # In a real implementation, we would make an actual request
            # For now, we'll simulate the response with mock data
            # response = self.session.get(search_url)
            # response.raise_for_status()
            # soup = BeautifulSoup(response.text, 'html.parser')
            
            # Simulate delay for realistic scraping
            await self._simulate_delay()
            
            # Generate mock provider data based on category
            category_str = request.category.value if isinstance(request.category, ServiceCategory) else request.category
            
            # For custom categories, we'll pass the custom category string
            if category_str.lower() == "other" and request.custom_category:
                # Create mock providers with the custom category
                providers = self._generate_mock_providers(request, ServiceCategory.OTHER, request.custom_category)
            else:
                # For standard categories, use the enum
                category_enum = get_category_from_string(category_str) or ServiceCategory.OTHER
                providers = self._generate_mock_providers(request, category_enum)
            
            return providers
        except Exception as e:
            logger.error(f"Error scraping NextDoor: {str(e)}")
            # Return empty list in case of error
            return []
    
    async def get_provider_details(self, provider_id: str) -> Optional[ProviderModel]:
        """Get detailed information for a specific provider from NextDoor.
        
        Args:
            provider_id: ID of the provider to retrieve
            
        Returns:
            Provider model or None if not found
        """
        try:
            # Build provider detail URL
            detail_url = f"{self.base_url}/provider/{provider_id}"
            logger.info(f"Getting provider details from NextDoor at URL: {detail_url}")
            
            # In a real implementation, we would make an actual request
            # For now, we'll simulate the response with mock data
            # response = self.session.get(detail_url)
            # response.raise_for_status()
            # soup = BeautifulSoup(response.text, 'html.parser')
            
            # Simulate delay for realistic scraping
            await self._simulate_delay()
            
            # Generate mock provider data
            provider = self._generate_mock_provider_detail(provider_id)
            
            return provider
        except Exception as e:
            logger.error(f"Error getting provider details from NextDoor: {str(e)}")
            return None
    
    def _format_location(self, location: Dict[str, Any]) -> str:
        """Format location dictionary into a string for search.
        
        Args:
            location: Location dictionary with address, city, state, zip_code
            
        Returns:
            Formatted location string
        """
        if "city" in location and "state" in location:
            return f"{location['city']}, {location['state']}"
        elif "zip_code" in location:
            return location["zip_code"]
        elif "address" in location:
            return location["address"]
        else:
            return "San Francisco, CA"  # Default location
    
    async def _simulate_delay(self):
        """Simulate network delay for realistic scraping."""
        # Sleep for a random time between 0.5 and 2 seconds
        delay = random.uniform(0.5, 2.0)
        time.sleep(delay)
    
    def _generate_mock_providers(self, request: ProviderSearchRequest, category_enum: ServiceCategory, custom_category: Optional[str] = None) -> List[ProviderModel]:
        """Generate mock provider data for development and testing.
        
        Args:
            request: Provider search request
            
        Returns:
            List of mock provider models
        """
        # Get the appropriate contractor type for this category
        contractor_type = get_contractor_type(category_enum)
        
        # Get the category string
        category_str = request.category.value if isinstance(request.category, ServiceCategory) else request.category
        
        # If this is a custom category (OTHER), use the provided custom category
        if category_str.lower() == "other" and custom_category:
            category = custom_category
            # For custom categories, we'll use the custom name as the service type
            contractor_type = custom_category.title()
        elif category_str.lower() == "other" and request.custom_category:
            category = request.custom_category
            # For custom categories, we'll use the custom name as the service type
            contractor_type = request.custom_category.title()
        else:
            category = category_str
        
        # Generate between 3 and 8 mock providers
        num_providers = random.randint(3, 8)
        providers = []
        
        # Use the search terms from our centralized mapping
        search_terms = get_search_terms(category_enum)
        
        # Convert search terms to business types for name generation
        business_types = [term.title() for term in search_terms if term]
        
        # Default business types if we don't have any
        if not business_types:
            business_types = ["Service", "Repair", "Maintenance"]
        
        for i in range(num_providers):
            provider_id = f"nd_{random.randint(10000, 99999)}"
            
            # Generate a business name
            name_prefix = random.choice(["A+ ", "Pro ", "Expert ", "Quality ", "Reliable ", ""])
            name_suffix = random.choice([" Inc.", " LLC", " Co.", " Services", " Pros", ""])
            business_name = f"{name_prefix}{random.choice(business_types)}{name_suffix}"
            
            # Generate rating
            avg_rating = round(random.uniform(3.0, 5.0), 1)
            review_count = random.randint(5, 100)
            
            # Generate location
            city = request.location.get("city", "San Francisco")
            state = request.location.get("state", "CA")
            zip_code = request.location.get("zip_code", "94105")
            
            # Generate distance
            distance = round(random.uniform(0.5, request.radius), 1)
            
            # Create provider model
            provider = ProviderModel(
                id=provider_id,
                name=business_name,
                description=f"Professional {category} services for residential and commercial properties.",
                services=[category],
                address=f"{random.randint(100, 999)} {random.choice(['Main', 'Oak', 'Maple', 'Cedar', 'Pine'])} {random.choice(['St', 'Ave', 'Blvd', 'Dr'])}",
                city=city,
                state=state,
                zip_code=zip_code,
                distance=distance,
                rating=ProviderRating(
                    average_rating=avg_rating,
                    review_count=review_count
                ),
                contact=ProviderContact(
                    phone=f"{random.randint(200, 999)}-{random.randint(200, 999)}-{random.randint(1000, 9999)}",
                    email=f"info@{business_name.lower().replace(' ', '')}.com",
                    website=f"https://www.{business_name.lower().replace(' ', '')}.com"
                ),
                image_urls=[f"https://nextdoor.com/images/{provider_id}-{j}.jpg" for j in range(1, random.randint(2, 5))],
                source="nextdoor",
                verified=random.choice([True, False]),
                created_at=datetime.now(),
                updated_at=datetime.now()
            )
            
            providers.append(provider)
        
        return providers
    
    def _generate_mock_provider_detail(self, provider_id: str) -> ProviderModel:
        """Generate mock detailed provider data for development and testing.
        
        Args:
            provider_id: Provider ID
            
        Returns:
            Mock provider model with detailed information
        """
        # Generate a business name
        name_prefix = random.choice(["A+ ", "Pro ", "Expert ", "Quality ", "Reliable ", ""])
        business_type = random.choice(["Plumbing", "Electrical", "HVAC", "Carpentry", "Painting"])
        name_suffix = random.choice([" Inc.", " LLC", " Co.", " Services", " Pros", ""])
        business_name = f"{name_prefix}{business_type}{name_suffix}"
        
        # Generate services based on business type
        services_map = {
            "Plumbing": ["plumbing", "drain cleaning", "pipe repair", "water heater installation"],
            "Electrical": ["electrical", "wiring", "lighting installation", "panel upgrades"],
            "HVAC": ["hvac", "heating", "air conditioning", "ventilation"],
            "Carpentry": ["carpentry", "woodworking", "cabinetry", "furniture repair"],
            "Painting": ["painting", "interior painting", "exterior painting", "staining"]
        }
        
        services = services_map.get(business_type, ["general maintenance", "repair", "installation"])
        
        # Generate rating
        avg_rating = round(random.uniform(3.5, 5.0), 1)
        review_count = random.randint(10, 150)
        
        # Create detailed provider model
        provider = ProviderModel(
            id=provider_id,
            name=business_name,
            description=f"Professional {business_type.lower()} services with over {random.randint(5, 30)} years of experience. We provide high-quality services for residential and commercial properties in the greater area.",
            services=services,
            address=f"{random.randint(100, 999)} {random.choice(['Main', 'Oak', 'Maple', 'Cedar', 'Pine'])} {random.choice(['St', 'Ave', 'Blvd', 'Dr'])}",
            city="San Francisco",
            state="CA",
            zip_code="94105",
            distance=round(random.uniform(0.5, 10.0), 1),
            rating=ProviderRating(
                average_rating=avg_rating,
                review_count=review_count
            ),
            contact=ProviderContact(
                phone=f"{random.randint(200, 999)}-{random.randint(200, 999)}-{random.randint(1000, 9999)}",
                email=f"info@{business_name.lower().replace(' ', '')}.com",
                website=f"https://www.{business_name.lower().replace(' ', '')}.com"
            ),
            image_urls=[f"https://nextdoor.com/images/{provider_id}-{j}.jpg" for j in range(1, random.randint(3, 7))],
            source="nextdoor",
            verified=random.choice([True, False]),
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
        
        return provider


class NextDoorApiClient(NextDoorProviderSource):
    """Implementation of NextDoor provider source using the official API."""
    
    def __init__(self, api_key: str, api_base_url: str = "https://api.nextdoor.com/v1"):
        """Initialize the NextDoor API client.
        
        Args:
            api_key: NextDoor API key
            api_base_url: Base URL for NextDoor API
        """
        self.api_key = api_key
        self.api_base_url = api_base_url
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    
    async def search_providers(self, request: ProviderSearchRequest) -> List[ProviderModel]:
        """Search for providers using the NextDoor API.
        
        Args:
            request: Provider search request parameters
            
        Returns:
            List of provider models
        """
        try:
            # Determine search term based on category
            category_str = request.category.value if isinstance(request.category, ServiceCategory) else request.category
            
            # For custom categories (OTHER), use the custom_category directly as the search term
            if category_str.lower() == "other" and request.custom_category:
                search_term = request.custom_category
                # We'll use this custom category directly for searching
            else:
                # For standard categories, use the predefined search terms
                category_enum = get_category_from_string(category_str) or ServiceCategory.OTHER
                search_terms = get_search_terms(category_enum)
                search_term = search_terms[0] if search_terms else category_str
            
            # Build API request parameters
            params = {
                "query": search_term,
                "location": self._format_location_for_api(request.location),
                "radius": request.radius,
                "limit": request.limit
            }
            
            # Make API request
            url = f"{self.api_base_url}/providers/search"
            logger.info(f"Searching NextDoor API: {url} with params: {params}")
            
            # In a real implementation, we would make an actual API request
            # For now, we'll simulate the response with mock data
            # response = requests.get(url, headers=self.headers, params=params)
            # response.raise_for_status()
            # data = response.json()
            
            # Simulate API response with mock data
            await self._simulate_delay()
            
            # Generate mock provider data
            providers = self._generate_mock_api_providers(request)
            
            return providers
        except Exception as e:
            logger.error(f"Error searching NextDoor API: {str(e)}")
            # Return empty list in case of error
            return []
    
    async def get_provider_details(self, provider_id: str) -> Optional[ProviderModel]:
        """Get detailed information for a specific provider using the NextDoor API.
        
        Args:
            provider_id: ID of the provider to retrieve
            
        Returns:
            Provider model or None if not found
        """
        try:
            # Build API request URL
            url = f"{self.api_base_url}/providers/{provider_id}"
            logger.info(f"Getting provider details from NextDoor API: {url}")
            
            # In a real implementation, we would make an actual API request
            # For now, we'll simulate the response with mock data
            # response = requests.get(url, headers=self.headers)
            # response.raise_for_status()
            # data = response.json()
            
            # Simulate API response with mock data
            await self._simulate_delay()
            
            # Generate mock provider data
            provider = self._generate_mock_api_provider_detail(provider_id)
            
            return provider
        except Exception as e:
            logger.error(f"Error getting provider details from NextDoor API: {str(e)}")
            return None
    
    def _format_location_for_api(self, location: Dict[str, Any]) -> Dict[str, Any]:
        """Format location dictionary for API request.
        
        Args:
            location: Location dictionary with address, city, state, zip_code
            
        Returns:
            Formatted location dictionary for API
        """
        api_location = {}
        
        if "coordinates" in location and "latitude" in location["coordinates"] and "longitude" in location["coordinates"]:
            api_location["lat"] = location["coordinates"]["latitude"]
            api_location["lng"] = location["coordinates"]["longitude"]
        elif "zip_code" in location:
            api_location["zip_code"] = location["zip_code"]
        elif "city" in location and "state" in location:
            api_location["city"] = location["city"]
            api_location["state"] = location["state"]
        
        return api_location
    
    async def _simulate_delay(self):
        """Simulate API delay for realistic testing."""
        # Sleep for a random time between 0.2 and 1 seconds
        delay = random.uniform(0.2, 1.0)
        time.sleep(delay)
    
    def _generate_mock_api_providers(self, request: ProviderSearchRequest) -> List[ProviderModel]:
        """Generate mock provider data for API simulation.
        
        Args:
            request: Provider search request
            
        Returns:
            List of mock provider models
        """
        # This is a simplified version that leverages the scraper's mock generator
        scraper = NextDoorScraper()
        return scraper._generate_mock_providers(request)
    
    def _generate_mock_api_provider_detail(self, provider_id: str) -> ProviderModel:
        """Generate mock detailed provider data for API simulation.
        
        Args:
            provider_id: Provider ID
            
        Returns:
            Mock provider model with detailed information
        """
        # This is a simplified version that leverages the scraper's mock generator
        scraper = NextDoorScraper()
        return scraper._generate_mock_provider_detail(provider_id)


class NextDoorService:
    """Service for interacting with NextDoor to find local service providers."""
    
    def __init__(self, db: Database, use_api: bool = False):
        """Initialize the NextDoor service.
        
        Args:
            db: MongoDB database instance
            use_api: Whether to use the NextDoor API (True) or scraping (False)
        """
        self.db = db
        self.collection = db.providers_collection
        self.use_api = use_api
        
        # Initialize the appropriate provider source
        if use_api:
            api_key = os.environ.get("NEXTDOOR_API_KEY")
            if not api_key:
                logger.warning("NEXTDOOR_API_KEY not found in environment variables, falling back to scraper")
                self.provider_source = NextDoorScraper()
            else:
                self.provider_source = NextDoorApiClient(api_key)
        else:
            self.provider_source = NextDoorScraper()
    
    async def search_providers(self, request: ProviderSearchRequest) -> ProviderSearchResponse:
        """Search for service providers based on the given request.
        
        Args:
            request: Provider search request parameters
            
        Returns:
            Provider search response with list of providers
        """
        try:
            # Search for providers using the provider source
            providers = await self.provider_source.search_providers(request)
            
            # Save providers to database
            await self._save_providers(providers)
            
            # Create response
            response = ProviderSearchResponse(
                providers=providers,
                total_count=len(providers),
                search_radius=request.radius,
                search_location=request.location
            )
            
            return response
        except Exception as e:
            logger.error(f"Error searching providers: {str(e)}")
            # Return empty response in case of error
            return ProviderSearchResponse(
                providers=[],
                total_count=0,
                search_radius=request.radius,
                search_location=request.location
            )
    
    async def get_provider_details(self, provider_id: str) -> Optional[ProviderModel]:
        """Get detailed information for a specific provider.
        
        Args:
            provider_id: ID of the provider to retrieve
            
        Returns:
            Provider model or None if not found
        """
        try:
            # First check if provider exists in database
            provider_data = await self._get_provider_from_db(provider_id)
            
            if provider_data:
                # Convert to ProviderModel
                return ProviderModel(**provider_data)
            
            # If not in database, fetch from provider source
            provider = await self.provider_source.get_provider_details(provider_id)
            
            if provider:
                # Save to database
                await self._save_provider(provider)
            
            return provider
        except Exception as e:
            logger.error(f"Error getting provider details: {str(e)}")
            return None
    
    async def _save_providers(self, providers: List[ProviderModel]):
        """Save multiple providers to the database.
        
        Args:
            providers: List of provider models to save
        """
        try:
            if not providers:
                return
            
            # Convert providers to dictionaries
            provider_dicts = [provider.dict() for provider in providers]
            
            # Use bulk operations for efficiency
            operations = []
            for provider_dict in provider_dicts:
                provider_id = provider_dict.pop("id")
                operations.append({
                    "update_one": {
                        "filter": {"_id": provider_id},
                        "update": {"$set": provider_dict},
                        "upsert": True
                    }
                })
            
            if operations:
                self.collection.bulk_write(operations)
                logger.info(f"Saved {len(operations)} providers to database")
        except Exception as e:
            logger.error(f"Error saving providers to database: {str(e)}")
    
    async def _save_provider(self, provider: ProviderModel):
        """Save a single provider to the database.
        
        Args:
            provider: Provider model to save
        """
        try:
            # Convert provider to dictionary
            provider_dict = provider.dict()
            provider_id = provider_dict.pop("id")
            
            # Update or insert provider
            self.collection.update_one(
                {"_id": provider_id},
                {"$set": provider_dict},
                upsert=True
            )
            
            logger.info(f"Saved provider {provider_id} to database")
        except Exception as e:
            logger.error(f"Error saving provider to database: {str(e)}")
    
    async def _get_provider_from_db(self, provider_id: str) -> Optional[Dict[str, Any]]:
        """Get a provider from the database.
        
        Args:
            provider_id: ID of the provider to retrieve
            
        Returns:
            Provider data dictionary or None if not found
        """
        try:
            # Find provider in database
            provider_data = self.collection.find_one({"_id": provider_id})
            
            if provider_data:
                # Convert _id to id for Pydantic model
                provider_data["id"] = provider_data.pop("_id")
                return provider_data
            
            return None
        except Exception as e:
            logger.error(f"Error getting provider from database: {str(e)}")
            return None
