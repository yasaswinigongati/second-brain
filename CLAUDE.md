# Second Brain — AI Coding Guide

This file helps AI coding tools (Claude Code, Cursor, GitHub Copilot) understand the project.

## Project Overview
AI-powered personal note-taking app with semantic search and RAG-based chat.

## Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, React Query |
| Backend | FastAPI (Python 3.12), LangChain, ChromaDB, OpenAI |
| Vector DB | ChromaDB (local) |
| LLM | OpenAI GPT-4o-mini (configurable) |
| Embeddings | text-embedding-3-small |

## Directory Layout
```
second-brain/
├── frontend/src/
│   ├── app/              # Next.js App Router pages
│   ├── components/
│   │   ├── layout/       # AppShell, Sidebar, Header, Providers
│   │   ├── notes/        # NotesView, NoteCard, NoteEditor, SearchView, DashboardView
│   │   └── chat/         # ChatView (RAG chat)
│   ├── hooks/            # useNotes, useStats, etc.
│   ├── lib/              # api.ts (axios client), utils.ts
│   ├── store/            # appStore.ts (Zustand)
│   └── types/            # index.ts (all TypeScript interfaces)
│
└── backend/
    ├── app/              # main.py (FastAPI), config.py (settings)
    ├── models/           # schemas.py (Pydantic models)
    ├── routers/          # notes.py, chat.py
    ├── services/         # rag_service.py (LangChain RAG), note_store.py
    └── utils/            # seed.py, reindex.py
```

## Key Conventions

### Frontend
- All components are `"use client"` unless they are pure layout wrappers
- Use `useAppStore()` from `@/store/appStore` for global state
- Use React Query hooks from `@/hooks/useNotes` for server data
- API calls go through `@/lib/api.ts` — never call `fetch` directly
- Tailwind only — no CSS modules or styled-components
- Color palette: `brain-*` (indigo) for primary, `sage-*` for accents
- `cn()` utility from `@/lib/utils` for conditional classes

### Backend
- All route handlers are `async`
- Business logic lives in `services/` — routers only call services
- Pydantic models for all request/response shapes in `models/schemas.py`
- LangChain RAG pipeline lives entirely in `services/rag_service.py`
- Notes are stored as JSON files in `data/notes/`
- ChromaDB vector store is in `data/chroma_db/`

### API Endpoints
```
GET    /api/notes              List notes (filters: notebook, tag)
POST   /api/notes              Create note
GET    /api/notes/{id}         Get note
PUT    /api/notes/{id}         Update note
DELETE /api/notes/{id}         Delete note
POST   /api/notes/search       Semantic search
POST   /api/notes/auto-tag     AI auto-tag suggestion
GET    /api/notes/stats        Dashboard stats
GET    /api/notes/notebooks    All notebooks
GET    /api/notes/tags         All tags
POST   /api/chat               RAG chat
GET    /health                 Health check
```

## Running Locally
```bash
# Backend
cd backend
cp .env.example .env        # add OPENAI_API_KEY
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Optional: seed sample notes
python utils/seed.py

# Frontend
cd frontend
cp .env.example .env.local
npm install
npm run dev                  # http://localhost:3000
```

## Environment Variables

### backend/.env
```
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...   # optional
CHROMA_DB_PATH=./data/chroma_db
EMBEDDING_MODEL=text-embedding-3-small
LLM_MODEL=gpt-4o-mini
CORS_ORIGINS=http://localhost:3000
```

### frontend/.env.local
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Common Tasks for AI Tools

### Add a new API endpoint
1. Add Pydantic schema to `backend/models/schemas.py`
2. Add service logic to `backend/services/note_store.py` or `rag_service.py`
3. Add route to appropriate router in `backend/routers/`
4. Add API client method to `frontend/src/lib/api.ts`
5. Add React Query hook to `frontend/src/hooks/useNotes.ts`

### Add a new frontend view
1. Create component in `frontend/src/components/`
2. Add to `ActiveView` type in `frontend/src/types/index.ts`
3. Register in `frontend/src/components/layout/AppShell.tsx`
4. Add nav item in `frontend/src/components/layout/Sidebar.tsx`

### Change the LLM model
Update `LLM_MODEL` in `backend/.env` — supported values: `gpt-4o`, `gpt-4o-mini`, `gpt-3.5-turbo`

### Switch to Anthropic Claude
Update `rag_service.py` to use `langchain_anthropic.ChatAnthropic` instead of `ChatOpenAI`.

## Git Workflow
- `main` — production branch (protected)
- Feature branches: `feat/feature-name`
- Bug fixes: `fix/bug-name`
- PR required to merge into main
- CI must pass before merge
