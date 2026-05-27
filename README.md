# Second Brain

Second Brain is an AI-powered personal note-taking app. It lets you create notes, organize them with tags/notebooks, search by meaning, and chat with your own notes using RAG.

## Features

- Create, edit, and delete notes
- Markdown note editor
- Notebooks and tags
- AI auto-tagging
- Semantic search using ChromaDB
- Chat with your notes using Groq
- Dashboard with notes, tags, and notebook stats

## Tech Stack

- Frontend: Next.js, TypeScript, Tailwind CSS, React Query, Zustand
- Backend: FastAPI, Python, LangChain
- AI: Groq, local Sentence Transformer embeddings
- Vector DB: ChromaDB
- Storage: Local JSON files

## Run Locally

Backend:

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Add your Groq API key in `backend/.env`.

Frontend:

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

API docs are available at `http://localhost:8000/docs`.
