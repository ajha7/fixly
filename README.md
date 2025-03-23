# Fixly - Home Service Provider Platform

Fixly is a full-stack application that connects customers with local home service providers. The platform allows customers to describe their home-related issues (with text and image uploads) and automatically retrieves local recommendations. The system then uses AI to contact these providers to get quotes and negotiate prices based on the customer's needs. Finally, the application aggregates and displays the provider details in a clean, user-friendly directory for customers to follow up.

## Microservice Architecture

The application follows a microservice architecture with the following components:

1. **API Gateway** (`/backend`): The main entry point for all API requests, routing them to the appropriate microservices.

2. **Phone Service** (`/phone-service`): Handles all voice call functionality, including:
   - Real-time speech-to-text transcription using Deepgram
   - Conversational AI using OpenAI's GPT models
   - Text-to-speech conversion for natural voice responses
   - WebSocket-based audio streaming with Twilio

3. **Frontend** (`/frontend`): React/TypeScript application with a modern UI built using Shadcn components.

## Tech Stack

- **Frontend**: React, TypeScript
- **Backend**: Python, FastAPI
- **Database**: MongoDB
- **AI**: OpenAI
- **Messaging Service**: Twilio
- **Audio Processing**: Deepgram

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 16+
- Docker and Docker Compose (optional)

### Environment Setup

Copy the example environment file and fill in your API keys:

```bash
cp .env.example .env
```

### Running with Docker

The easiest way to run the entire application is using Docker Compose:

```bash
docker-compose up
```

This will start all microservices and make them available at their respective ports.

### Running Locally

#### API Gateway

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --port 3000
```

#### Phone Service

```bash
cd phone-service
pip install -r requirements.txt
uvicorn app:app --reload --port 3001
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## API Documentation

- API Gateway: http://localhost:3000/docs
- Phone Service: http://localhost:3001/docs

## Deployment

The application is designed to be deployed on Render.com:

- **Frontend**: Static Site
  - Build Command: `npm install && npm run build`
  - Publish Directory: `dist`

- **Backend Services**: Web Services
  - Build Command: `pip install -r requirements.txt`
  - Start Command: `uvicorn app:app --host 0.0.0.0 --port $PORT`

## What technologies are used for this project?

This project is built with .

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/3d969005-f38a-4f0f-96b7-2d1e19e7ec23) and click on Share -> Publish.

## I want to use a custom domain - is that possible?

We don't support custom domains (yet). If you want to deploy your project under your own domain then we recommend using Netlify. Visit our docs for more details: [Custom domains](https://docs.lovable.dev/tips-tricks/custom-domain/)
