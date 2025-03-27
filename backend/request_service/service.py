import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from bson import ObjectId
from pymongo.database import Database
from pymongo.errors import PyMongoError
from .models import RequestModel, DateRange, Location, ServiceCategory

logger = logging.getLogger("uvicorn.error")

class RequestService:
    """Service for managing service requests."""
    
    def __init__(self, db: Database):
        """Initialize the request service with a MongoDB database connection.
        
        Args:
            db: MongoDB database instance
        """
        self.db = db
        self.collection = db.requests_collection
    
    async def create_request(
        self, 
        user_id: str, 
        description: str, 
        availability: List[DateRange],
        images: Optional[List[str]] = None,
        location: Optional[Location] = None,
        category: ServiceCategory = ServiceCategory.OTHER,
        custom_category: Optional[str] = None
    ) -> str:
        """Create a new service request.
        
        Args:
            user_id: ID of the user creating the request
            description: Detailed description of the issue
            availability: List of date ranges when the user is available
            images: Optional list of image URLs or paths
            location: Location information where service is needed
            
        Returns:
            ID of the created request
            
        Raises:
            Exception: If there's an error creating the request
        """
        try:
            # Convert Pydantic models to dictionaries
            availability_dict = [avail.dict() for avail in availability]
            location_dict = location.dict() if location else {}
            
            # Create request document
            request_data = {
                "user_id": user_id,
                "description": description,
                "availability": availability_dict,
                "images": images or [],
                "location": location_dict,
                "category": category.value if isinstance(category, ServiceCategory) else category,
                "custom_category": custom_category,
                "status": "pending",
                "scraped_providers": [],
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }
            
            # Insert into MongoDB
            result = await self._insert_request(request_data)
            logger.info(f"Created request with ID: {result}")
            
            return result
        except Exception as e:
            logger.error(f"Error creating request: {str(e)}")
            raise
    
    async def _insert_request(self, request_data: Dict[str, Any]) -> str:
        """Insert a request into MongoDB.
        
        This is a separate method to allow for easier mocking in tests.
        
        Args:
            request_data: Request data to insert
            
        Returns:
            ID of the inserted request
        """
        try:
            result = self.collection.insert_one(request_data)
            return str(result.inserted_id)
        except PyMongoError as e:
            logger.error(f"MongoDB error inserting request: {str(e)}")
            raise Exception(f"Database error: {str(e)}")
    
    async def get_request(self, request_id: str, user_id: str) -> Optional[Dict[str, Any]]:
        """Get a specific request by ID.
        
        Args:
            request_id: ID of the request to retrieve
            user_id: ID of the user making the request (for authorization)
            
        Returns:
            Request data or None if not found
            
        Raises:
            Exception: If there's an error retrieving the request
        """
        try:
            # Convert string ID to ObjectId
            obj_id = ObjectId(request_id)
            
            # Find request in MongoDB
            request = self.collection.find_one({"_id": obj_id, "user_id": user_id})
            
            if not request:
                return None
            
            # Convert ObjectId to string for JSON serialization
            request["id"] = str(request.pop("_id"))
            
            return request
        except Exception as e:
            logger.error(f"Error retrieving request: {str(e)}")
            raise
    
    async def get_user_requests(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all requests for a specific user.
        
        Args:
            user_id: ID of the user
            
        Returns:
            List of request data
            
        Raises:
            Exception: If there's an error retrieving the requests
        """
        try:
            logger.info(f"Retrieving requests for user: {user_id}")
            # Find all requests for the user in MongoDB
            cursor = self.collection.find({"user_id": user_id})
            logger.info(f"Found {cursor} requests for user: {user_id}")
            # Convert cursor to list and process each document
            requests = []

            for request in cursor:
                # Convert ObjectId to string for JSON serialization
                request["id"] = str(request.pop("_id"))
                requests.append(request)
            logger.info(f"Returning {len(requests)} requests for user: {user_id}")
            return requests
        except Exception as e:
            logger.error(f"Error retrieving user requests: {str(e)}")
            raise
    
    async def update_request_status(self, request_id: str, status: str) -> bool:
        """Update the status of a request.
        
        Args:
            request_id: ID of the request to update
            status: New status value
            
        Returns:
            True if successful, False otherwise
            
        Raises:
            Exception: If there's an error updating the request
        """
        try:
            # Convert string ID to ObjectId
            obj_id = ObjectId(request_id)
            
            # Update request in MongoDB
            result = self.collection.update_one(
                {"_id": obj_id},
                {
                    "$set": {
                        "status": status,
                        "updated_at": datetime.now()
                    }
                }
            )
            
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error updating request status: {str(e)}")
            raise
    
    async def add_scraped_provider(self, request_id: str, provider_id: str) -> bool:
        """Add a scraped provider to a request.
        
        Args:
            request_id: ID of the request
            provider_id: ID of the provider to add
            
        Returns:
            True if successful, False otherwise
            
        Raises:
            Exception: If there's an error updating the request
        """
        try:
            # Convert string ID to ObjectId
            obj_id = ObjectId(request_id)
            
            # Update request in MongoDB, adding provider if not already present
            result = self.collection.update_one(
                {"_id": obj_id, "scraped_providers": {"$ne": provider_id}},
                {
                    "$push": {"scraped_providers": provider_id},
                    "$set": {"updated_at": datetime.now()}
                }
            )
            
            return result.modified_count > 0
        except Exception as e:
            logger.error(f"Error adding scraped provider: {str(e)}")
            raise
