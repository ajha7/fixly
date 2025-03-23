import os
import sys
sys.path.append(os.path.dirname(__file__))
import logging
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from fastapi import FastAPI, Request, Response, HTTPException, status
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from termcolor import colored
from logging_conf import configure_logging

# Load environment variables
load_dotenv()

logger = logging.getLogger("uvicorn.error")

# Set up FastAPI
app = FastAPI(
    title="Fixly API",
    description="Backend API for Fixly application with microservice architecture",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    configure_logging()
    logger.info(colored("Starting Fixly main API service", "green"))

PORT = int(os.environ.get("PORT", 3000))

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://fixly-frontend.onrender.com", "http://localhost:8080", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "main-api"}

# Root endpoint for API documentation redirection
@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/docs")

# Import the gateway router to handle microservice routing
from gateway import app as gateway_app

# Mount the gateway app under /api prefix
app.mount("/api", gateway_app)







    

if __name__ == "__main__":
    import uvicorn
    logger.info(f"Server running on port {PORT}")
    uvicorn.run("app:app", host="0.0.0.0", port=PORT, reload=True)
