# Second Brain - AI Coding Guide

This file helps AI coding tools understand the project.

## Project Overview

AI-powered personal note-taking app with semantic search and RAG-based chat.

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Zustand, React Query |
| Backend | FastAPI, Python 3.12, LangChain, ChromaDB |
| Vector DB | ChromaDB local |
| LLM | Groq llama-3.3-70b-versatile |
| Embeddings | Local all-MiniLM-L6-v2 |

## Key Conventions

### Frontend

- Use `useAppStore()` from `@/store/appStore` for global UI state.
- Use React Query hooks from `@/hooks/useNotes` for server data.
- API calls go through `@/lib/api.ts`.
- Use Tailwind CSS and `cn()` from `@/lib/utils`.

### Backend

- All route handlers are async.
- Business logic lives in `services/`.
- Pydantic models live in `models/schemas.py`.
- RAG and vector indexing live in `services/rag_service.py`.
- Notes are stored as JSON files in `backend/data/notes/`.
- ChromaDB files are stored in `backend/data/chroma_db/`.

## Common Tasks

### Add an API endpoint

1. Add request/response schemas in `backend/models/schemas.py`.
2. Add service logic in `backend/services/`.
3. Add the route in `backend/routers/`.
4. Add the frontend API method in `frontend/src/lib/api.ts`.
5. Add or update React Query hooks in `frontend/src/hooks/useNotes.ts`.

### Add a frontend view

1. Create the component under `frontend/src/components/`.
2. Add the view type in `frontend/src/types/index.ts`.
3. Register the view in `frontend/src/components/layout/AppShell.tsx`.
4. Add navigation in `frontend/src/components/layout/Sidebar.tsx`.
