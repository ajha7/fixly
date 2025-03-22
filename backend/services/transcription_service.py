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

class TranscriptionService(EventEmitter):
    """Handles real-time speech-to-text using Deepgram"""
    
    def __init__(self):
        """Initialize the transcription service"""
        super().__init__()
        # Set up connection to Deepgram with API key
        self.deepgram = DeepgramClient(os.environ.get("DEEPGRAM_API_KEY"))
        
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
        
        # Connect to Deepgram streaming API
        self.dg_connection = self.deepgram.listen.live.v("1")
        self.dg_connection.start(options)
        
        self.final_result = ""       # Store complete transcription
        self.speech_final = False    # Track if speaker has finished naturally
        
        # When connection opens, set up all event handlers
        @self.dg_connection.on(LiveTranscriptionEvents.Open)
        def on_open():
            print(colored("STT -> Deepgram connection established", "yellow"))
        
        # Handle incoming transcription chunks
        @self.dg_connection.on(LiveTranscriptionEvents.Transcript)
        def on_transcript(transcript):
            text = ""
            if transcript.channel and transcript.channel.alternatives:
                text = transcript.channel.alternatives[0].transcript
            
            # Handle end of utterance (speaker stopped talking)
            if transcript.type == "UtteranceEnd":
                if not self.speech_final:
                    print(colored(f"UtteranceEnd received before speechFinal, emit the text collected so far: {self.final_result}", "yellow"))
                    self.emit("transcription", self.final_result)
                    return
                else:
                    print(colored("STT -> Speech was already final when UtteranceEnd received", "yellow"))
                    return
            
            # Handle final transcription pieces
            if transcript.is_final and text.strip():
                self.final_result += f" {text}"
                
                # If speaker made a natural pause, send the transcription
                if transcript.speech_final:
                    self.speech_final = True  # Prevent duplicate sends
                    self.emit("transcription", self.final_result)
                    self.final_result = ""
                else:
                    # Reset for next utterance
                    self.speech_final = False
            else:
                # Emit interim results for real-time feedback
                self.emit("utterance", text)
        
        # Error handling events
        @self.dg_connection.on(LiveTranscriptionEvents.Error)
        def on_error(error):
            print(colored("STT -> deepgram error", "red"))
            print(error)
        
        @self.dg_connection.on(LiveTranscriptionEvents.Warning)
        def on_warning(warning):
            print(colored("STT -> deepgram warning", "red"))
            print(warning)
        
        @self.dg_connection.on(LiveTranscriptionEvents.Metadata)
        def on_metadata(metadata):
            print(colored("STT -> deepgram metadata", "yellow"))
            print(metadata)
        
        @self.dg_connection.on(LiveTranscriptionEvents.Close)
        def on_close():
            print(colored("STT -> Deepgram connection closed", "yellow"))
    
    def send(self, payload):
        """Send audio data to Deepgram for transcription"""
        if self.dg_connection.is_ready():  # Check if connection is open
            audio_data = base64.b64decode(payload)
            self.dg_connection.send(audio_data)
