# Phone Service

This application provides an interactive voice response system using Twilio, OpenAI GPT, and Deepgram for transcription and text-to-speech capabilities.

## Features

- Handles incoming phone calls via Twilio
- Streams audio to/from the caller using WebSockets
- Transcribes caller speech using Deepgram
- Processes conversation context with OpenAI GPT
- Converts responses back to speech using Deepgram TTS
- Maintains natural conversation flow with speech markers

## Requirements

- Python 3.9+
- Twilio account
- OpenAI API key
- Deepgram API key
- FastAPI and related dependencies

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Configure your environment variables in the `.env` file:
   ```
   DEEPGRAM_API_KEY=your_deepgram_api_key
   SERVER=your_server_domain_or_ip
   PORT=3000
   VOICE_MODEL=aura-asteria-en
   OPENAI_API_KEY=your_openai_api_key
   ```

## Running the Application

Start the server:
```
uvicorn app:app --host 0.0.0.0 --port 3000 --reload
```

Or simply:
```
python app.py
```

The server will run on port 3000 by default or the port specified in your `.env` file.

## API Documentation

FastAPI automatically generates interactive API documentation. Once the server is running, you can access:

- Swagger UI: http://localhost:3000/docs
- ReDoc: http://localhost:3000/redoc

## How It Works

1. When a call comes in through Twilio, it connects to this service via WebSockets
2. Audio from the caller is streamed to the Deepgram transcription service
3. The transcribed text is sent to OpenAI GPT for processing
4. GPT's response is split at natural pauses (marked with '•')
5. Each response segment is converted to speech using Deepgram's TTS
6. The speech audio is streamed back to the caller

## Structure

- `app.py` - Main application with FastAPI server and WebSocket handling
- `events.py` - Custom event emitter implementation
- `phone_service/`
  - `gpt_service.py` - Handles conversation with OpenAI GPT
  - `transcription_service.py` - Handles speech-to-text with Deepgram
  - `tts_service.py` - Handles text-to-speech with Deepgram
  - `stream_service.py` - Manages audio streaming to Twilio using FastAPI WebSockets
