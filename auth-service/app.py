import os
import sys
import logging
from fastapi import FastAPI, Request, Response, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from typing import Dict, Any, Optional

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("auth-service")

# Set up FastAPI
app = FastAPI(
    title="Fixly Auth Service",
    description="Authentication microservice for Fixly application",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PORT = int(os.environ.get("AUTH_SERVICE_PORT", 3002))

@app.on_event("startup")
async def startup_event():
    logger.info("Starting Fixly Auth Service")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "auth-service"}

# Import routers
from routes.oauth import router as oauth_router
from routes.magic_link import router as magic_link_router
from routes.user import router as user_router

# Include routers
app.include_router(oauth_router, prefix="/oauth", tags=["oauth"])
app.include_router(magic_link_router, prefix="/magic-link", tags=["magic-link"])
app.include_router(user_router, prefix="/user", tags=["user"])

if __name__ == "__main__":
    import uvicorn
    logger.info(f"Auth Service running on port {PORT}")
    uvicorn.run("app:app", host="0.0.0.0", port=PORT, reload=True)
