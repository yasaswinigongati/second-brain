# brain.

A note-taking app I built because I was tired of paying for Notion and not trusting that Obsidian's AI plugins weren't phoning home with my notes.

RAG-powered so you can actually talk to your notes. Built over a few weekends.

## what it does

- write notes in markdown, organized into notebooks
- semantic search (find notes by meaning, not exact words)
- AI chat that answers questions *from your own notes*, not the internet
- auto-tagging via LLM when you're too lazy to tag manually
- grid or list view, dark sidebar, works fine

## stack

**frontend** — Next.js 14, TypeScript, Tailwind, Zustand, React Query  
**backend** — FastAPI (Python), LangChain, ChromaDB for vectors  
**LLM** — OpenAI gpt-4o-mini by default (cheap, fast enough)  
**embeddings** — text-embedding-3-small  

## running it

You need an OpenAI API key. Everything else is local.

```bash
# 1. clone
git clone https://github.com/YOUR_USERNAME/second-brain.git
cd second-brain

# 2. backend
cd backend
cp .env.example .env
# edit .env and add your OPENAI_API_KEY
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 3. frontend (new terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000

Or with Docker:
```bash
cp backend/.env.example backend/.env
# add OPENAI_API_KEY to backend/.env
docker-compose up --build
```

## seed some sample notes

```bash
cd backend
python utils/seed.py
```

This creates 4 sample notes so you can test search and chat right away.

## project layout

```
second-brain/
├── backend/
│   ├── app/           # FastAPI app + config
│   ├── models/        # Pydantic schemas
│   ├── routers/       # notes, chat endpoints
│   ├── services/
│   │   ├── rag_service.py    # LangChain RAG pipeline
│   │   └── note_store.py     # JSON file persistence
│   ├── utils/         # seed, reindex scripts
│   └── tests/         # pytest tests
│
└── frontend/
    └── src/
        ├── app/           # Next.js app router
        ├── components/
        │   ├── layout/    # shell, sidebar, header
        │   ├── notes/     # note list, editor, search, dashboard
        │   └── chat/      # AI chat
        ├── hooks/         # useNotes etc.
        ├── lib/           # api client, utils
        ├── store/         # zustand
        └── types/         # TypeScript types
```

## env vars

**backend/.env**
```
OPENAI_API_KEY=sk-...
CHROMA_DB_PATH=./data/chroma_db
EMBEDDING_MODEL=text-embedding-3-small
LLM_MODEL=gpt-4o-mini
CORS_ORIGINS=http://localhost:3000
```

**frontend/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## switching to Anthropic

Change `LLM_MODEL` in `.env` and swap `ChatOpenAI` for `ChatAnthropic` in `backend/services/rag_service.py`. LangChain makes this a two-line change.

## known issues / todo

- notes are stored as JSON files — fine for personal use, swap for SQLite/Postgres if you want multi-user
- no auth — this is meant to run locally
- the reindex script (`python utils/seed.py`) needs to be run manually if ChromaDB gets out of sync

## license

MIT
