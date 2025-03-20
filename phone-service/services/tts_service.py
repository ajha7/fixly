import os
import base64
import requests
from termcolor import colored
from events import EventEmitter

class TextToSpeechService(EventEmitter):
    """Handles text-to-speech conversion using Deepgram's API"""
    
    def __init__(self):
        """Initialize the TTS service"""
        super().__init__()
        self.next_expected_index = 0  # Track order of speech chunks
        self.speech_buffer = {}       # Store speech pieces
    
    async def generate(self, gpt_reply, interaction_count):
        """Convert text to speech using Deepgram's API"""
        partial_response_index = gpt_reply.get('partial_response_index')
        partial_response = gpt_reply.get('partial_response')
        
        # Skip if no text to convert
        if not partial_response:
            return
        
        try:
            # Call Deepgram's text-to-speech API
            voice_model = os.environ.get("VOICE_MODEL", "aura-asteria-en")
            response = requests.post(
                f"https://api.deepgram.com/v1/speak?model={voice_model}&encoding=mulaw&sample_rate=8000&container=none",
                headers={
                    "Authorization": f"Token {os.environ.get('DEEPGRAM_API_KEY')}",
                    "Content-Type": "application/json",
                },
                json={
                    "text": partial_response,
                }
            )
            
            # Handle successful response
            if response.status_code == 200:
                try:
                    # Convert audio response to base64 format
                    base64_string = base64.b64encode(response.content).decode('utf-8')
                    
                    # Send audio to be played
                    self.emit('speech', partial_response_index, base64_string, partial_response, interaction_count)
                except Exception as err:
                    print(err)
            else:
                print(colored('Deepgram TTS error:', 'red'))
                print(response.text)
        except Exception as err:
            print(colored('Error occurred in TextToSpeech service', 'red'))
            print(err)
