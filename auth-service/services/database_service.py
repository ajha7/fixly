import os
import logging
import uuid
from typing import Dict, Any, Optional, List
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import DuplicateKeyError
from models.user import UserCreate, UserInDB, AuthProvider

logger = logging.getLogger("auth-service.database")

class DatabaseService:
    def __init__(self):
        # MongoDB connection string
        self.mongo_uri = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
        self.db_name = os.environ.get("MONGODB_DB", "fixly_auth")
        self.client = AsyncIOMotorClient(self.mongo_uri)
        self.db = self.client[self.db_name]
        self.users_collection = self.db["users"]
        
        # Ensure indexes
        self._create_indexes()
    
    def _create_indexes(self):
        """
        Create necessary indexes for the database
        """
        # Run in synchronous context during initialization
        import asyncio
        loop = asyncio.get_event_loop()
        loop.run_until_complete(self._create_indexes_async())
    
    async def _create_indexes_async(self):
        """
        Create necessary indexes for the database (async)
        """
        # Create unique index on email
        await self.users_collection.create_index("email", unique=True)
        
        # Create index on auth_provider and auth_provider_id
        await self.users_collection.create_index([
            ("auth_provider", 1),
            ("auth_provider_id", 1)
        ])
    
    async def get_user_by_id(self, user_id: str) -> Optional[UserInDB]:
        """
        Get user by ID
        """
        user_data = await self.users_collection.find_one({"id": user_id})
        if user_data:
            return UserInDB(**user_data)
        return None
    
    async def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        """
        Get user by email
        """
        user_data = await self.users_collection.find_one({"email": email})
        if user_data:
            return UserInDB(**user_data)
        return None
    
    async def get_user_by_auth_provider(self, provider: AuthProvider, provider_id: str) -> Optional[UserInDB]:
        """
        Get user by auth provider and provider ID
        """
        user_data = await self.users_collection.find_one({
            "auth_provider": provider,
            "auth_provider_id": provider_id
        })
        if user_data:
            return UserInDB(**user_data)
        return None
    
    async def create_user(self, user: UserCreate, email_verified: bool = False) -> UserInDB:
        """
        Create a new user
        """
        now = datetime.utcnow()
        user_id = str(uuid.uuid4())
        
        user_data = {
            "id": user_id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "profile_picture": user.profile_picture,
            "auth_provider": user.auth_provider,
            "auth_provider_id": user.auth_provider_id,
            "email_verified": email_verified,
            "created_at": now,
            "updated_at": now,
            "last_login": now
        }
        
        try:
            await self.users_collection.insert_one(user_data)
            return UserInDB(**user_data)
        except DuplicateKeyError:
            # User with this email already exists
            logger.error(f"User with email {user.email} already exists")
            existing_user = await self.get_user_by_email(user.email)
            return existing_user
    
    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> UserInDB:
        """
        Update user data
        """
        # Ensure updated_at is set
        if "updated_at" not in update_data:
            update_data["updated_at"] = datetime.utcnow()
        
        # Update user in database
        await self.users_collection.update_one(
            {"id": user_id},
            {"$set": update_data}
        )
        
        # Get updated user
        updated_user = await self.get_user_by_id(user_id)
        return updated_user
    
    async def delete_user(self, user_id: str) -> bool:
        """
        Delete user by ID
        """
        result = await self.users_collection.delete_one({"id": user_id})
        return result.deleted_count > 0
