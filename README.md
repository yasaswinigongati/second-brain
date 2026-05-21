# 🧠 Second Brain — AI-Powered Note Taking App

A full-stack AI-powered second brain app with semantic search, RAG-based Q&A, and smart note organization.

## Tech Stack

### Frontend
- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** for styling
- **Zustand** for state management
- **React Query** for data fetching

### Backend
- **FastAPI** (Python) REST API
- **LangChain** for RAG pipeline
- **ChromaDB** for vector storage
- **OpenAI / Anthropic** embeddings & LLM

## Features

- 📝 Rich note creation & editing (Markdown support)
- 🔍 Semantic search across all notes
- 🤖 AI Chat — ask questions, get answers grounded in YOUR notes
- 🏷️ Auto-tagging & categorization
- 🔗 Note linking & knowledge graph
- 📁 Notebook organization
- 💡 AI-powered note suggestions

## Project Structure

```
second-brain/
├── frontend/          # Next.js TypeScript app
│   └── src/
│       ├── app/       # App Router pages
│       ├── components/
│       │   ├── ui/    # Base UI components
│       │   ├── notes/ # Note-specific components
│       │   ├── chat/  # AI chat components
│       │   └── layout/
│       ├── lib/       # API client, utilities
│       ├── hooks/     # Custom React hooks
│       ├── store/     # Zustand stores
│       └── types/     # TypeScript types
│
└── backend/           # FastAPI Python app
    ├── app/           # Main app
    ├── routers/       # API route handlers
    ├── services/      # Business logic (RAG, embeddings)
    ├── models/        # Pydantic models
    └── utils/         # Helpers
```

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # Add your API keys
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local   # Add backend URL
npm run dev
```

Open http://localhost:3000

## Environment Variables

### Backend (.env)
```
OPENAI_API_KEY=your_key_here
ANTHROPIC_API_KEY=your_key_here
CHROMA_DB_PATH=./data/chroma_db
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```
