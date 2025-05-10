# EG App - Backend (NestJS + LangChain + AI)

This is the backend service for the AI-powered Influencer Clone Platform. It is built with NestJS and integrates LangChain, OpenAI, ElevenLabs, Pinecone, WebSockets, and other AI/voice technologies.

---

## 🚀 Features

- NestJS-based scalable server architecture
- Integration with OpenAI, ElevenLabs, Pinecone, and LangChain
- WebSocket support for real-time chat/call
- PDF ingestion and Retrieval-Augmented Generation (RAG)
- JWT-based authentication
- MongoDB with Mongoose
- FFmpeg audio processing

---

## 🛠️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/your-repo/eg-app-server.git
cd eg-app-server

npm install

PORT=5000
MONGODB_URI=mongodb://localhost:27017/eg-app
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_key
PINECONE_API_KEY=your_pinecone_key
PINECONE_ENVIRONMENT=your_pinecone_env
ELEVENLABS_API_KEY=your_elevenlabs_key

npm run prepare:data

npm run start:dev
