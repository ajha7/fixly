import os
import sys
sys.path.append(os.path.dirname(__file__))
import json
import asyncio
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, Response, HTTPException, Depends, Header, status, Body, UploadFile, File, Form
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from termcolor import colored
from twilio.twiml.voice_response import VoiceResponse, Connect
from twilio.request_validator import RequestValidator
from phone_service.gpt_service import GptService
from phone_service.stream_service import StreamService
from phone_service.transcription_service import TranscriptionService
from phone_service.tts_service import TextToSpeechService
from request_service.models import RequestCreate, RequestResponse, DateRange
from request_service.service import RequestService
from nextdoor_service.models import ProviderSearchRequest, ProviderSearchResponse, ProviderModel
from nextdoor_service.service import NextDoorService
from auth_service.models import User, UserCreate, UserResponse, SocialProvider, TokenData, TokenResponse, MagicLinkRequest, MagicLinkVerify, SocialLoginRequest
from auth_service.service import AuthService
from auth_service.social_auth import get_social_provider
from email_service.service import EmailService
from common.service_categories import ServiceCategory, get_category_from_string
from logging_conf import configure_logging
from pymongo import MongoClient

# Load environment variables
load_dotenv()

logger = logging.getLogger("uvicorn.error")

# Set up FastAPI
app = FastAPI(
    title="Fixly API",
    description="Backend API for Fixly application with phone service capabilities",
    version="1.0.0"
)

# MongoDB connection
mongo_uri = os.environ.get("MONGODB_URI", "mongodb://localhost:27017")
mongo_client = MongoClient(mongo_uri)
db = mongo_client.fixly_db

# Initialize services
request_service = RequestService(db)
nextdoor_service = NextDoorService(db, use_api=False)  # Set to True when API access is granted
auth_service = AuthService(db)

@app.on_event("startup")
async def startup_event():
    configure_logging()
    logger.info("Connected to MongoDB")

PORT = int(os.environ.get("PORT", 3000))

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://fixly-frontend.onrender.com", "http://localhost:8080", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active connections
connections: Dict[str, Dict[str, Any]] = {}

# Dependency to validate Twilio requests
async def validate_twilio_request(request: Request, x_twilio_signature: Optional[str] = Header(None)):
    # Get the TWILIO_AUTH_TOKEN from environment variables
    auth_token = os.environ.get('TWILIO_AUTH_TOKEN')
    if not auth_token:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="TWILIO_AUTH_TOKEN not configured"
        )
    
    # Get the request URL and form data
    validator = RequestValidator(auth_token)
    url = str(request.url)
    
    # Get form data from the request
    form_data = {}
    try:
        body = await request.form()
        form_data = {key: value for key, value in body.items()}
    except:
        # If it's not form data, use an empty dict
        pass
    
    if not x_twilio_signature:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="X-Twilio-Signature header missing"
        )
    
    # Validate the request
    request_valid = validator.validate(url, form_data, x_twilio_signature)
    
    if not request_valid:
        logger.info(colored("Invalid Twilio signature - rejecting request", "red"))
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid Twilio signature"
        )
    
    return True

# Handle incoming calls from Twilio
@app.post("/phone/incoming")
async def incoming_call(request: Request):
    logger.info("Twilio -> Incoming call received")
    try:
        # Get the server domain from environment variable
        server_domain = os.environ.get('SERVER')
        if not server_domain:
            logger.error("SERVER environment variable not set")
            return Response(content="Server configuration error", status_code=500)
            
        # Create TwiML response
        response = VoiceResponse()
        
        # Add a Say verb to keep the call active initially
        response.say("Connecting you to our service...", voice="alice")
        
        # Set up the stream connection
        connect = Connect()
        stream_url = f"wss://{server_domain}/connection"
        logger.info(f"Twilio -> Setting up stream connection to: {stream_url}")
        
        # Configure the stream with necessary parameters
        connect.stream(url=stream_url, track="inbound_track")
        
        # Add the connect verb to the response
        response.append(connect)
        
        # Log the complete TwiML response for debugging
        logger.info(f"Twilio -> Complete TwiML response: {str(response)}")
        
        return Response(content=str(response), media_type="text/xml")
    except Exception as err:
        logger.error(f"Error processing call: {err}")
        return Response(content="Error processing call", status_code=500)

# Handle WebSocket connection for the call's audio
@app.websocket("/connection")
async def websocket_endpoint(websocket: WebSocket):
    try:
        await websocket.accept()
        logger.info("WebSocket connection accepted successfully")
        # Generate a unique client_id
        client_id = str(id(websocket))
        
        logger.info(f"New client connected: {client_id}")

        # Initialize connection data
        connections[client_id] = {
            'stream_sid': None,
            'call_sid': None,
            'gpt_service': GptService(),
            'transcription_service': TranscriptionService(),
            'tts_service': TextToSpeechService(),
            'marks': [],              # Track audio completion markers
            'interaction_count': 0,    # Count back-and-forth exchanges
            'websocket': websocket     # Store reference to the websocket
        }
        # Set up custom stream service for this client
        stream_service = StreamService(websocket)
        connections[client_id]['stream_service'] = stream_service
        # Set up event handlers for this client
        await setup_client_handlers(client_id)
        logger.info("REACHED HERE3")
        try:
            # Process incoming WebSocket messages
            while True:
                data = await websocket.receive_text()
                await handle_message(client_id, data)
        except WebSocketDisconnect:
            logger.info(colored(f"Client disconnected: {client_id}", "red"))
            if client_id in connections:
                del connections[client_id]
    except Exception as e:
        logger.error(f"WebSocket connection error: {str(e)}")

# Handle incoming WebSocket messages
async def handle_message(client_id: str, data: str):
    try:
        if client_id not in connections:
            return
        
        conn = connections[client_id]
        msg = json.loads(data)
        
        if msg['event'] == 'start':
            # Call started - set up IDs and send welcome message
            conn['stream_sid'] = msg['start']['streamSid']
            conn['call_sid'] = msg['start']['callSid']
            conn['stream_service'].set_stream_sid(conn['stream_sid'])
            conn['gpt_service'].set_call_sid(conn['call_sid'])
            logger.info(colored(f"Twilio -> Starting Media Stream for {conn['stream_sid']}", "red"))
            await conn['tts_service'].generate({
                'partial_response_index': None, 
                'partial_response': "Hi, I am an assistant for a client looking for help with their plumbing needs. Do you have a minute to talk?"
            }, 0)
        
        elif msg['event'] == 'media':
            # Received audio from caller - send to transcription
            conn['transcription_service'].send(msg['media']['payload'])
        
        elif msg['event'] == 'mark':
            # Audio piece finished playing
            label = msg['mark']['name']
            logger.info(colored(f"Twilio -> Audio completed mark ({msg.get('sequenceNumber', 'N/A')}): {label}", "red"))
            conn['marks'] = [m for m in conn['marks'] if m != msg['mark']['name']]
        
        elif msg['event'] == 'stop':
            # Call ended
            logger.info(colored(f"Twilio -> Media stream {conn['stream_sid']} ended.", "red"))
    
    except Exception as err:
        logger.info(colored(f"Error in handle_message: {err}", "red"))

# Set up event handlers for each client
async def setup_client_handlers(client_id: str):
    conn = connections[client_id]
    
    # Define handler functions
    # Handle interruptions (caller speaking while assistant is)
    async def handle_utterance(text):
        if conn['marks'] and text and len(text) > 5:
            logger.info(colored('Twilio -> Interruption, Clearing stream', "red"))
            await conn['websocket'].send_text(json.dumps({
                'streamSid': conn['stream_sid'],
                'event': 'clear',
            }))
    
    # Process transcribed text through GPT
    async def handle_transcription(text):
        if not text:
            return
        logger.info(colored(f"Interaction {conn['interaction_count']} – STT -> GPT: {text}", "yellow"))
        await conn['gpt_service'].completion(text, conn['interaction_count'])
        conn['interaction_count'] += 1
    
    # Send GPT's response to text-to-speech
    async def handle_gpt_reply(gpt_reply, icount):
        logger.info(colored(f"Interaction {icount}: GPT -> TTS: {gpt_reply.get('partial_response')}", "green"))
        await conn['tts_service'].generate(gpt_reply, icount)
    
    # Send converted speech to caller
    async def handle_speech(response_index, audio, label, icount):
        logger.info(colored(f"Interaction {icount}: TTS -> TWILIO: {label}", "blue"))
        await conn['stream_service'].buffer(response_index, audio)
    
    # Track when audio pieces are sent
    def handle_audio_sent(mark_label):
        conn['marks'].append(mark_label)
    
    # Register all event handlers
    conn['transcription_service'].on('utterance', handle_utterance)
    conn['transcription_service'].on('transcription', handle_transcription)
    conn['gpt_service'].on('gptreply', handle_gpt_reply)
    conn['tts_service'].on('speech', handle_speech)
    conn['stream_service'].on('audiosent', handle_audio_sent)

# API health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Fixly API"}

# Root endpoint for API documentation redirection
@app.get("/")
async def root():
    return {"message": "Welcome to Fixly API! Visit /docs for API documentation"}

# Authentication middleware
async def get_current_user(authorization: Optional[str] = Header(None)):
    """Get the current authenticated user from the JWT token.
    
    Args:
        authorization: Authorization header with JWT token
        
    Returns:
        User data
        
    Raises:
        HTTPException: If authentication fails
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    try:
        # Extract token from header
        scheme, token = authorization.split()
        if scheme.lower() != "bearer":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication scheme",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        # Verify token
        token_data = await auth_service.verify_token(token)
        if not token_data:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token or token expired",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        # Get user from database
        user = await auth_service.get_user_by_id(token_data.user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
                headers={"WWW-Authenticate": "Bearer"}
            )
        
        return {"user_id": user.id, "email": user.email}
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed",
            headers={"WWW-Authenticate": "Bearer"}
        )

# Request service endpoints
@app.post("/api/requests", response_model=RequestResponse)
async def create_request(
    request_data: RequestCreate,
    current_user: dict = Depends(get_current_user)
):
    """Create a new service request with issue description and availability."""
    try:
        request_id = await request_service.create_request(
            user_id=current_user["user_id"],
            description=request_data.description,
            availability=request_data.availability,
            images=request_data.images,
            location=request_data.location,
            category=request_data.category,
            custom_category=request_data.custom_category
        )
        return {"id": str(request_id), "message": "Request created successfully"}
    except Exception as e:
        logger.error(f"Error creating request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/requests/{request_id}")
async def get_request(request_id: str, current_user: dict = Depends(get_current_user)):
    """Get a specific request by ID."""
    try:
        request = await request_service.get_request(request_id, current_user["user_id"])
        if not request:
            raise HTTPException(status_code=404, detail="Request not found")
        return request
    except Exception as e:
        logger.error(f"Error retrieving request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/requests")
async def get_user_requests(current_user: dict = Depends(get_current_user)):
    """Get all requests for the current user."""
    try:
        requests = await request_service.get_user_requests(current_user["user_id"])
        return requests
    except Exception as e:
        logger.error(f"Error retrieving user requests: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# NextDoor service endpoints
@app.post("/api/providers/search", response_model=ProviderSearchResponse)
async def search_providers(search_request: ProviderSearchRequest, current_user: dict = Depends(get_current_user)):
    """Search for service providers based on category and location."""
    try:
        response = await nextdoor_service.search_providers(search_request)
        return response
    except Exception as e:
        logger.error(f"Error searching providers: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/providers/{provider_id}", response_model=ProviderModel)
async def get_provider(provider_id: str, current_user: dict = Depends(get_current_user)):
    """Get detailed information for a specific provider."""
    try:
        provider = await nextdoor_service.get_provider_details(provider_id)
        if not provider:
            raise HTTPException(status_code=404, detail="Provider not found")
        return provider
    except Exception as e:
        logger.error(f"Error retrieving provider: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/requests/{request_id}/find-providers", response_model=ProviderSearchResponse)
async def find_providers_for_request(request_id: str, current_user: dict = Depends(get_current_user)):
    """Find service providers for a specific request."""
    try:
        # Get the request
        request = await request_service.get_request(request_id, current_user["user_id"])
        if not request:
            raise HTTPException(status_code=404, detail="Request not found")
        
        # Create provider search request from the request data
        category_str = request.get("category", "other")
        custom_category = request.get("custom_category")
        
        # Handle the case where category is "other" and custom_category is provided
        if category_str.lower() == "other" and custom_category:
            # For custom categories, we'll use the enum OTHER but also pass the custom_category
            category_enum = ServiceCategory.OTHER
        else:
            # Try to convert to ServiceCategory enum
            category_enum = get_category_from_string(category_str)
        
        search_request = ProviderSearchRequest(
            category=category_enum if category_enum else category_str,
            custom_category=custom_category if category_str.lower() == "other" else None,
            location=request.get("location", {}),
            radius=10.0,  # Default radius
            limit=10  # Default limit
        )
        
        # Search for providers
        response = await nextdoor_service.search_providers(search_request)
        
        # Update request with scraped provider IDs
        provider_ids = [provider.id for provider in response.providers]
        for provider_id in provider_ids:
            await request_service.add_scraped_provider(request_id, provider_id)
        
        return response
    except Exception as e:
        logger.error(f"Error finding providers for request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Authentication endpoints
@app.post("/api/auth/register", response_model=TokenResponse)
async def register_user(user_data: UserCreate):
    """Register a new user."""
    try:
        # Register the user
        user = await auth_service.register_user(user_data)
        
        # Create access token
        token_response = await auth_service.create_access_token(user)
        
        return token_response
    except Exception as e:
        logger.error(f"Error registering user: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/social-login", response_model=TokenResponse)
async def social_login(login_data: SocialLoginRequest):
    """Authenticate with a social provider."""
    try:
        # Authenticate with the social provider
        if login_data.provider == SocialProvider.GOOGLE:
            user = await auth_service.authenticate_google(login_data.token)
        elif login_data.provider == SocialProvider.NEXTDOOR:
            user = await auth_service.authenticate_nextdoor(login_data.token, login_data.redirect_url)
        elif login_data.provider == SocialProvider.FACEBOOK:
            user = await auth_service.authenticate_facebook(login_data.token)
        else:
            raise HTTPException(status_code=400, detail="Unsupported social provider")
        
        if not user:
            raise HTTPException(status_code=401, detail="Authentication failed")
        
        # Create access token
        token_response = await auth_service.create_access_token(user)
        
        return token_response
    except Exception as e:
        logger.error(f"Error authenticating with social provider: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/social-auth-url")
async def get_social_auth_url(provider: SocialProvider, redirect_uri: str, state: Optional[str] = None):
    """Get the authorization URL for a social provider."""
    try:
        # Get the social provider
        social_provider = get_social_provider(provider)
        
        # Get the authorization URL
        auth_url = await social_provider.get_auth_url(redirect_uri, state)
        
        return {"auth_url": auth_url}
    except Exception as e:
        logger.error(f"Error getting social auth URL: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/magic-link")
async def create_magic_link(request_data: MagicLinkRequest):
    """Create and send a magic link for email authentication."""
    try:
        # Create and send the magic link
        success = await auth_service.create_magic_link(request_data.email, request_data.redirect_url)
        
        if not success:
            raise HTTPException(status_code=500, detail="Failed to send magic link")
        
        return {"message": "Magic link sent successfully"}
    except Exception as e:
        logger.error(f"Error creating magic link: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/auth/verify-magic-link", response_model=TokenResponse)
async def verify_magic_link(verify_data: MagicLinkVerify):
    """Verify a magic link token and authenticate the user."""
    try:
        # Verify the magic link
        user = await auth_service.verify_magic_link(verify_data.token)
        
        if not user:
            raise HTTPException(status_code=401, detail="Invalid or expired magic link")
        
        # Create access token
        token_response = await auth_service.create_access_token(user)
        
        return token_response
    except Exception as e:
        logger.error(f"Error verifying magic link: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/auth/me", response_model=UserResponse)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """Get the current user's profile."""
    try:
        # Get the user from the database
        user = await auth_service.get_user_by_id(current_user["user_id"])
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Create user response
        user_response = UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            phone=user.phone,
            profile_picture=user.profile_picture,
            email_verified=user.email_verified
        )
        
        return user_response
    except Exception as e:
        logger.error(f"Error getting user profile: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    logger.info(f"Server running on port {PORT}")
    uvicorn.run("app:app", host="0.0.0.0", port=PORT, reload=True)