import os
import json
import asyncio
from typing import Dict, Any, Optional
from dotenv import load_dotenv
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request, Response, HTTPException, Depends, Header, status
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from termcolor import colored
from twilio.twiml.voice_response import VoiceResponse, Connect
from twilio.request_validator import RequestValidator
from services.gpt_service import GptService
from services.stream_service_fastapi import StreamService
from services.transcription_service import TranscriptionService
from services.tts_service import TextToSpeechService

# Load environment variables
load_dotenv()

# Set up FastAPI
app = FastAPI(
    title="Fixly API",
    description="Backend API for Fixly application with phone service capabilities",
    version="1.0.0"
)
PORT = int(os.environ.get("PORT", 3000))

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://fixly-frontend.onrender.com", "http://localhost:8080"],
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
        print(colored("Invalid Twilio signature - rejecting request", "red"))
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid Twilio signature"
        )
    
    return True

# Handle incoming calls from Twilio
@app.post("/phone/incoming")
async def incoming_call(request: Request, _: bool = Depends(validate_twilio_request)):
    try:
        response = VoiceResponse()
        connect = Connect()
        # Tell Twilio where to connect the call's media stream
        connect.stream(url=f"wss://{os.environ.get('SERVER')}/connection")
        response.append(connect)
        return Response(content=str(response), media_type="text/xml")
    except Exception as err:
        print(err)
        return Response(content="Error processing call", status_code=500)

# Handle WebSocket connection for the call's audio
@app.websocket("/connection")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    # Generate a unique client_id
    client_id = str(id(websocket))
    
    print(colored(f"New client connected: {client_id}", "green"))
    
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
        print(colored(f"Client disconnected: {client_id}", "red"))
        if client_id in connections:
            del connections[client_id]

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
            print(colored(f"Twilio -> Starting Media Stream for {conn['stream_sid']}", "red"))
            await conn['tts_service'].generate({
                'partial_response_index': None, 
                'partial_response': "Welcome to Bart's Automotive. • How can I help you today?"
            }, 0)
        
        elif msg['event'] == 'media':
            # Received audio from caller - send to transcription
            conn['transcription_service'].send(msg['media']['payload'])
        
        elif msg['event'] == 'mark':
            # Audio piece finished playing
            label = msg['mark']['name']
            print(colored(f"Twilio -> Audio completed mark ({msg.get('sequenceNumber', 'N/A')}): {label}", "red"))
            conn['marks'] = [m for m in conn['marks'] if m != msg['mark']['name']]
        
        elif msg['event'] == 'stop':
            # Call ended
            print(colored(f"Twilio -> Media stream {conn['stream_sid']} ended.", "red"))
    
    except Exception as err:
        print(colored(f"Error in handle_message: {err}", "red"))

# Set up event handlers for each client
async def setup_client_handlers(client_id: str):
    conn = connections[client_id]
    
    # Handle interruptions (caller speaking while assistant is)
    @conn['transcription_service'].on('utterance')
    async def handle_utterance(text):
        if conn['marks'] and text and len(text) > 5:
            print(colored('Twilio -> Interruption, Clearing stream', "red"))
            await conn['websocket'].send_text(json.dumps({
                'streamSid': conn['stream_sid'],
                'event': 'clear',
            }))
    
    # Process transcribed text through GPT
    @conn['transcription_service'].on('transcription')
    async def handle_transcription(text):
        if not text:
            return
        print(colored(f"Interaction {conn['interaction_count']} – STT -> GPT: {text}", "yellow"))
        await conn['gpt_service'].completion(text, conn['interaction_count'])
        conn['interaction_count'] += 1
    
    # Send GPT's response to text-to-speech
    @conn['gpt_service'].on('gptreply')
    async def handle_gpt_reply(gpt_reply, icount):
        print(colored(f"Interaction {icount}: GPT -> TTS: {gpt_reply.get('partial_response')}", "green"))
        await conn['tts_service'].generate(gpt_reply, icount)
    
    # Send converted speech to caller
    @conn['tts_service'].on('speech')
    def handle_speech(response_index, audio, label, icount):
        print(colored(f"Interaction {icount}: TTS -> TWILIO: {label}", "blue"))
        conn['stream_service'].buffer(response_index, audio)
    
    # Track when audio pieces are sent
    @conn['stream_service'].on('audiosent')
    def handle_audio_sent(mark_label):
        conn['marks'].append(mark_label)

# API health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "Fixly API"}

# Root endpoint for API documentation redirection
@app.get("/")
async def root():
    return {"message": "Welcome to Fixly API! Visit /docs for API documentation"}

if __name__ == "__main__":
    import uvicorn
    print(f"Server running on port {PORT}")
    uvicorn.run("app:app", host="0.0.0.0", port=PORT, reload=True)
