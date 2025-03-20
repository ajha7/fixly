import json
import uuid
from events import EventEmitter

class StreamService(EventEmitter):
    """Handles the streaming of audio data to the websocket client"""
    
    def __init__(self, websocket):
        """Initialize websocket connection and audio tracking"""
        super().__init__()
        self.ws = websocket
        self.expected_audio_index = 0  # Tracks which audio piece should play next
        self.audio_buffer = {}        # Stores audio pieces that arrive out of order
        self.stream_sid = ''          # Unique ID for this call's media stream
    
    def set_stream_sid(self, stream_sid):
        """Set the stream session ID"""
        self.stream_sid = stream_sid
    
    def buffer(self, index, audio):
        """Manages the order of audio playback"""
        # Welcome message has no index, play immediately
        if index is None:
            self.send_audio(audio)
        # If this is the next expected piece, play it and check for more
        elif index == self.expected_audio_index:
            self.send_audio(audio)
            self.expected_audio_index += 1
            
            # Play any stored pieces that are now ready in sequence
            while self.expected_audio_index in self.audio_buffer:
                buffered_audio = self.audio_buffer[self.expected_audio_index]
                self.send_audio(buffered_audio)
                self.expected_audio_index += 1
        # Store future pieces until their turn
        else:
            self.audio_buffer[index] = audio
    
    def send_audio(self, audio):
        """Actually sends audio to the caller through websocket"""
        # Send the audio data
        self.ws.send(json.dumps({
            "streamSid": self.stream_sid,
            "event": "media",
            "media": {
                "payload": audio
            }
        }))
        
        # Create and send a unique marker to track when audio finishes playing
        mark_label = str(uuid.uuid4())
        self.ws.send(json.dumps({
            "streamSid": self.stream_sid,
            "event": "mark",
            "mark": {
                "name": mark_label
            }
        }))
        
        # Let other parts of the system know audio was sent
        self.emit("audiosent", mark_label)
