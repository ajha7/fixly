# Fixly Phone Service Microservice

This microservice handles phone call functionality for the Fixly platform, which connects customers with local home service providers.

## Features

- Real-time speech-to-text transcription using Deepgram
- Conversational AI using OpenAI's GPT models
- Text-to-speech conversion for natural voice responses
- WebSocket-based audio streaming with Twilio

## Architecture

The phone service is part of a microservice architecture:

1. **Main API Gateway**: Routes requests to appropriate microservices
2. **Phone Service**: Handles all voice call functionality
3. **Frontend**: React/TypeScript application for user interface

## Setup

### Prerequisites

- Python 3.10+
- Deepgram API key
- OpenAI API key
- Twilio account with Voice API access

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
DEEPGRAM_API_KEY=your_deepgram_api_key
OPENAI_API_KEY=your_openai_api_key
TWILIO_AUTH_TOKEN=your_twilio_auth_token
PHONE_SERVICE_DOMAIN=your_domain_for_phone_service
PORT=3001
VOICE_MODEL=aura-asteria-en
```

### Installation

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the service
python app.py
```

## API Endpoints

- `GET /health`: Health check endpoint
- `POST /incoming`: Handles incoming Twilio calls
- `WebSocket /connection`: Manages real-time audio streaming

## Integration with Main API

The phone service is accessible through the main API gateway at `/api/phone/*` endpoints.

## Development

To run the service in development mode:

```bash
uvicorn app:app --reload --port 3001
```
