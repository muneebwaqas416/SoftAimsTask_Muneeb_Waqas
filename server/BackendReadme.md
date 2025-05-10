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
git clone https://github.com/muneebwaqas416/SoftAimsTask_Muneeb_Waqas
cd server

npm install

# Server
PORT=5000

# MongoDB
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority&appName=<app-name>

# JWT
JWT_SECRET=your_jwt_secret

# OpenAI
OPENAI_API_KEY=sk-...

# Pinecone
PINECONE_API_KEY=pcsk_...
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX_NAME=text-embedding-ada-002

# ElevenLabs
ELEVENLABS_API_KEY=sk_...

# File Ingestion
PDF_PATH=/absolute/path/to/your/document.pdf
INDEX_INIT_TIMEOUT=500000


npm run prepare:data

npm run start:dev
