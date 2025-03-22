import os
import base64
from termcolor import colored
from deepgram import (
    DeepgramClient,
    LiveTranscriptionEvents,
    LiveOptions,
    Microphone,
)
from events import EventEmitter
import logging

logger = logging.getLogger("uvicorn.error")

class TranscriptionService(EventEmitter):
    """Handles real-time speech-to-text using Deepgram"""
    
    def __init__(self):
        """Initialize the transcription service"""
        super().__init__()
        # Set up connection to Deepgram with API key
        self.deepgram: DeepgramClient = DeepgramClient(os.environ.get("DEEPGRAM_API_KEY"))
        
        # Configure live transcription settings
        options = LiveOptions(
            encoding="mulaw",         # Audio encoding type
            sample_rate=8000,         # Phone call quality
            model="nova-2",           # Deepgram model to use
            punctuate=True,           # Add punctuation
            interim_results=True,     # Get partial results
            endpointing=200,          # Detect speech endings
            utterance_end_ms=1000     # Wait time for utterance end
        )
        
        self.final_result = ""       # Store complete transcription
        self.speech_final = False    # Track if speaker has finished naturally
        
        # Define event handler functions
        def on_open():
            logger.info(colored("STT -> Deepgram connection established", "yellow"))
        
        def on_transcript(self_or_result, result=None, **kwargs):
            # Deepgram passes the client as first arg and result as second arg or keyword
            # Handle both cases by checking the type
            from deepgram.clients.live.v1.client import LiveClient
            
            if isinstance(self_or_result, LiveClient):
                # First argument is the client, use the result keyword arg
                transcript_result = result
            else:
                # First argument is the result itself
                transcript_result = self_or_result
                
            logger.info(colored(f"STT -> Transcript received: {transcript_result}", "yellow"))
            text = ""
            if transcript_result and hasattr(transcript_result, 'channel') and transcript_result.channel and transcript_result.channel.alternatives:
                text = transcript_result.channel.alternatives[0].transcript
            
            # Handle end of utterance (speaker stopped talking)
            if transcript_result and hasattr(transcript_result, 'type') and transcript_result.type == "UtteranceEnd":
                if not self.speech_final:
                    logger.info(colored(f"UtteranceEnd received before speechFinal, emit the text collected so far: {self.final_result}", "yellow"))
                    self.emit("transcription", self.final_result)
                    return
                else:
                    logger.info(colored("STT -> Speech was already final when UtteranceEnd received", "yellow"))
                    return
            
            # Handle final transcription pieces
            if transcript_result and hasattr(transcript_result, 'is_final') and transcript_result.is_final and text.strip():
                self.final_result += f" {text}"
                
                # If speaker made a natural pause, send the transcription
                if hasattr(transcript_result, 'speech_final') and transcript_result.speech_final:
                    self.speech_final = True  # Prevent duplicate sends
                    self.emit("transcription", self.final_result)
                    self.final_result = ""
                else:
                    # Reset for next utterance
                    self.speech_final = False
            else:
                # Emit interim results for real-time feedback
                self.emit("utterance", text)
        
        def on_error(error):
            logger.error(f"STT -> Deepgram error: {error}")
        
        def on_warning(warning):
            logger.warning(f"STT -> Deepgram warning: {warning}")
        
        def on_metadata(self_or_metadata, metadata=None, **kwargs):
            # Handle both calling patterns like we did for on_transcript
            
            if isinstance(self_or_metadata, LiveClient):
                # First argument is the client, use the metadata keyword arg
                metadata_obj = metadata
            else:
                # First argument is the metadata itself
                metadata_obj = self_or_metadata
                
            logger.info(f"STT -> Deepgram metadata: {metadata_obj}")
        
        def on_close():
            logger.info(colored("STT -> Deepgram connection closed", "yellow"))
        
        # Connect to Deepgram streaming API
        self.dg_connection = self.deepgram.listen.live.v("1")
        # Register event handlers with the Deepgram connection
        self.dg_connection.on(LiveTranscriptionEvents.Open, on_open)
        self.dg_connection.on(LiveTranscriptionEvents.Transcript, on_transcript)
        self.dg_connection.on(LiveTranscriptionEvents.Error, on_error)
        self.dg_connection.on(LiveTranscriptionEvents.Warning, on_warning)
        self.dg_connection.on(LiveTranscriptionEvents.Metadata, on_metadata)
        self.dg_connection.on(LiveTranscriptionEvents.Close, on_close)

        # Start the connection
        self.dg_connection.start(options)
    
    def send(self, payload):
        """Send audio data to Deepgram for transcription"""
        try:
            # Check if connection exists
            if hasattr(self, 'dg_connection'):
                # Decode the base64 audio data
                audio_data = base64.b64decode(payload)
                # Send the audio data to Deepgram
                self.dg_connection.send(audio_data)
            else:
                logger.warning("Cannot send audio: Deepgram connection not initialized")
        except Exception as e:
            logger.error(f"Error in TranscriptionService.send: {str(e)}")
