import os
import sys
import logging
from fastapi import FastAPI, Request, Response, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
from dotenv import load_dotenv
from typing import Dict, Any, Optional

# Load environment variables
load_dotenv()

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("gateway")

# Set up FastAPI
app = FastAPI(
    title="Fixly API Gateway",
    description="API Gateway for Fixly microservices",
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

# Service URLs
PHONE_SERVICE_URL = os.environ.get("PHONE_SERVICE_URL", "http://localhost:3001")
AUTH_SERVICE_URL = os.environ.get("AUTH_SERVICE_URL", "http://localhost:3002")

@app.on_event("startup")
async def startup_event():
    logger.info("Starting Fixly API Gateway")
    logger.info(f"Phone Service URL: {PHONE_SERVICE_URL}")
    logger.info(f"Auth Service URL: {AUTH_SERVICE_URL}")

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "api-gateway"}

# Proxy for phone service
@app.api_route("/phone/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def phone_service_proxy(request: Request, path: str):
    """
    Proxy requests to the phone service
    """
    client = httpx.AsyncClient(base_url=PHONE_SERVICE_URL)
    
    # Prepare URL and headers
    url = f"/{path}"
    headers = {key: value for key, value in request.headers.items() if key.lower() != "host"}
    
    # Get request body
    body = await request.body()
    
    try:
        # Forward the request to the phone service
        response = await client.request(
            method=request.method,
            url=url,
            headers=headers,
            content=body,
            timeout=30.0
        )
        
        # Return the response from the phone service
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=dict(response.headers),
            media_type=response.headers.get("content-type")
        )
    except httpx.RequestError as exc:
        logger.error(f"Error forwarding request to phone service: {exc}")
        raise HTTPException(status_code=503, detail=f"Error communicating with phone service: {str(exc)}")
    finally:
        await client.aclose()

# Proxy for auth service
@app.api_route("/auth/{path:path}", methods=["GET", "POST", "PUT", "DELETE"])
async def auth_service_proxy(request: Request, path: str):
    """
    Proxy requests to the auth service
    """
    client = httpx.AsyncClient(base_url=AUTH_SERVICE_URL)
    
    # Prepare URL and headers
    url = f"/{path}"
    headers = {key: value for key, value in request.headers.items() if key.lower() != "host"}
    
    # Get request body
    body = await request.body()
    
    try:
        # Forward the request to the auth service
        response = await client.request(
            method=request.method,
            url=url,
            headers=headers,
            content=body,
            timeout=30.0
        )
        
        # Return the response from the auth service
        return Response(
            content=response.content,
            status_code=response.status_code,
            headers=dict(response.headers),
            media_type=response.headers.get("content-type")
        )
    except httpx.RequestError as exc:
        logger.error(f"Error forwarding request to auth service: {exc}")
        raise HTTPException(status_code=503, detail=f"Error communicating with auth service: {str(exc)}")
    finally:
        await client.aclose()

# Main entry point
if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 3000))
    uvicorn.run("gateway:app", host="0.0.0.0", port=port, reload=True)
