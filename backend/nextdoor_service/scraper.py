import logging
import random
import time
import re
from typing import List, Dict, Any, Optional
from urllib.parse import urljoin, quote_plus

import requests
from bs4 import BeautifulSoup

from .models import ProviderModel, ProviderRating, ProviderContact

logger = logging.getLogger("uvicorn.error")


class NextDoorScraper:
    """Class for scraping service provider data from NextDoor."""
    
    def __init__(self, base_url: str = "https://nextdoor.com"):
        """Initialize the NextDoor scraper.
        
        Args:
            base_url: Base URL for NextDoor website
        """
        self.base_url = base_url
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9",
            "Accept-Encoding": "gzip, deflate, br",
            "Connection": "keep-alive",
            "Upgrade-Insecure-Requests": "1",
            "Cache-Control": "max-age=0"
        }
        self.session = requests.Session()
        self.session.headers.update(self.headers)
    
    async def search_providers(self, category: str, location: Dict[str, Any], radius: float = 10.0, limit: int = 10) -> List[ProviderModel]:
        """Search for service providers on NextDoor.
        
        Args:
            category: Service category to search for
            location: Location dictionary with address, city, state, zip_code
            radius: Search radius in miles
            limit: Maximum number of results to return
            
        Returns:
            List of provider models
        """
        try:
            # Format location for search
            location_str = self._format_location(location)
            
            # Build search URL
            search_url = f"{self.base_url}/find-services/{quote_plus(category)}/{quote_plus(location_str)}"
            logger.info(f"Searching NextDoor at URL: {search_url}")
            
            # In a real implementation, we would make an actual request
            # response = self.session.get(search_url)
            # response.raise_for_status()
            # soup = BeautifulSoup(response.text, 'html.parser')
            # providers = self._parse_search_results(soup, limit)
            
            # For now, we'll use mock data
            await self._simulate_delay()
            providers = self._generate_mock_providers(category, location, radius, limit)
            
            return providers
        except Exception as e:
            logger.error(f"Error scraping NextDoor: {str(e)}")
            return []
    
    async def get_provider_details(self, provider_id: str) -> Optional[ProviderModel]:
        """Get detailed information for a specific provider.
        
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
            # response = self.session.get(detail_url)
            # response.raise_for_status()
            # soup = BeautifulSoup(response.text, 'html.parser')
            # provider = self._parse_provider_details(soup, provider_id)
            
            # For now, we'll use mock data
            await self._simulate_delay()
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
    
    def _parse_search_results(self, soup: BeautifulSoup, limit: int) -> List[ProviderModel]:
        """Parse search results from BeautifulSoup object.
        
        Args:
            soup: BeautifulSoup object containing search results
            limit: Maximum number of results to return
            
        Returns:
            List of provider models
        """
        # This would be the actual implementation for parsing the HTML
        # For now, we'll return an empty list
        return []
    
    def _parse_provider_details(self, soup: BeautifulSoup, provider_id: str) -> Optional[ProviderModel]:
        """Parse provider details from BeautifulSoup object.
        
        Args:
            soup: BeautifulSoup object containing provider details
            provider_id: ID of the provider
            
        Returns:
            Provider model or None if parsing fails
        """
        # This would be the actual implementation for parsing the HTML
        # For now, we'll return None
        return None
    
    def _generate_mock_providers(self, category: str, location: Dict[str, Any], radius: float, limit: int) -> List[ProviderModel]:
        """Generate mock provider data for development and testing.
        
        Args:
            category: Service category
            location: Location dictionary
            radius: Search radius in miles
            limit: Maximum number of results to return
            
        Returns:
            List of mock provider models
        """
        # Generate between 3 and limit mock providers
        num_providers = random.randint(3, min(8, limit))
        providers = []
        
        business_types = {
            "plumbing": ["Plumbing", "Plumbers", "Pipe Repair"],
            "electrical": ["Electrical", "Electricians", "Wiring"],
            "hvac": ["HVAC", "Heating & Cooling", "Air Conditioning"],
            "carpentry": ["Carpentry", "Woodworking", "Cabinetry"],
            "painting": ["Painting", "Painters", "Interior Design"],
            "roofing": ["Roofing", "Roofers", "Roof Repair"],
            "landscaping": ["Landscaping", "Lawn Care", "Garden Design"],
            "cleaning": ["Cleaning", "Cleaners", "Maid Service"],
            "appliance_repair": ["Appliance Repair", "Appliance Service", "Home Appliances"]
        }
        
        business_type = business_types.get(category.lower(), ["Service", "Repair", "Maintenance"])
        
        for i in range(num_providers):
            provider_id = f"nd_{random.randint(10000, 99999)}"
            
            # Generate a business name
            name_prefix = random.choice(["A+ ", "Pro ", "Expert ", "Quality ", "Reliable ", ""])
            name_suffix = random.choice([" Inc.", " LLC", " Co.", " Services", " Pros", ""])
            business_name = f"{name_prefix}{random.choice(business_type)}{name_suffix}"
            
            # Generate rating
            avg_rating = round(random.uniform(3.0, 5.0), 1)
            review_count = random.randint(5, 100)
            
            # Generate location
            city = location.get("city", "San Francisco")
            state = location.get("state", "CA")
            zip_code = location.get("zip_code", "94105")
            
            # Generate distance
            distance = round(random.uniform(0.5, radius), 1)
            
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
                verified=random.choice([True, False])
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
            verified=random.choice([True, False])
        )
        
        return provider
