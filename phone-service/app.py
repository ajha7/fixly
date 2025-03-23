import os
import sys
import json
import asyncio
import logging
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, Response, HTTPException, Depends, Header, status
from fastapi.middleware.cors import CORSMiddleware
from termcolor import colored
from twilio.twiml.voice_response import VoiceResponse, Connect
from twilio.request_validator import RequestValidator
from services.gpt_service import GptService
from services.stream_service import StreamService
from services.transcription_service import TranscriptionService
from services.tts_service import TextToSpeechService
from logging_conf import configure_logging

# Load environment variables
load_dotenv()

logger = logging.getLogger("uvicorn.error")

# Set up FastAPI
app = FastAPI(
    title="Fixly Phone Service",
    description="Microservice for handling phone calls and voice interactions",
    version="1.0.0"
)

@app.on_event("startup")
async def startup_event():
    configure_logging()

PORT = int(os.environ.get("PORT", 3001))  # Use a different port from the main API

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store active connections
connections = {}

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
@app.post("/incoming")
async def incoming_call(request: Request, validated: bool = Depends(validate_twilio_request)):
    logger.info("Twilio -> Incoming call received")
    try:
        # Get the server domain from environment variable
        server_domain = os.environ.get('PHONE_SERVICE_DOMAIN')
        if not server_domain:
            logger.error("PHONE_SERVICE_DOMAIN environment variable not set")
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

        try:
            # Process incoming WebSocket messages
            while True:
                data = await websocket.receive_text()
                await handle_message(client_id, data)
        except WebSocketDisconnect:
            logger.info(colored(f"Client disconnected: {client_id}", "red"))
            if client_id in connections:
                # Clean up services before removing the connection
                try:
                    # Properly close the Deepgram connection
                    if 'transcription_service' in connections[client_id]:
                        connections[client_id]['transcription_service'].cleanup()
                except Exception as e:
                    logger.error(f"Error during cleanup: {str(e)}")
                
                # Remove the connection
                del connections[client_id]
    except Exception as e:
        logger.error(f"WebSocket connection error: {str(e)}")

# Handle incoming WebSocket messages
async def handle_message(client_id: str, data: str):
    try:
        if client_id not in connections:
            logger.warning(f"Message received for unknown client: {client_id}")
            return
            
        # Parse the JSON message
        message = json.loads(data)
        event = message.get('event')
        
        # Handle different event types
        if event == 'start':
            # Call started, get stream and call SIDs
            stream_sid = message.get('streamSid')
            call_sid = message.get('callSid')
            
            # Store the SIDs
            connections[client_id]['stream_sid'] = stream_sid
            connections[client_id]['call_sid'] = call_sid
            connections[client_id]['stream_service'].set_stream_sid(stream_sid)
            connections[client_id]['gpt_service'].set_call_sid(call_sid)
            
            logger.info(f"Twilio -> Call started: {call_sid}, Stream: {stream_sid}")
            
        elif event == 'media':
            # Audio data received, send to transcription service
            payload = message.get('media', {}).get('payload')
            if payload:
                connections[client_id]['transcription_service'].send(payload)
                
        elif event == 'mark':
            # Mark event received (audio playback marker)
            mark_name = message.get('mark', {}).get('name')
            if mark_name and mark_name in connections[client_id]['marks']:
                connections[client_id]['marks'].remove(mark_name)
                
        elif event == 'stop':
            # Call ended
            logger.info(f"Twilio -> Media stream {message.get('streamSid')} ended.")
            
    except json.JSONDecodeError:
        logger.error(f"Invalid JSON received: {data}")
    except Exception as e:
        logger.error(f"Error handling message: {str(e)}")

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
    return {"status": "healthy", "service": "phone-service"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=PORT, reload=True)
