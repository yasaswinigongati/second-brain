"""
Second Brain - FastAPI Backend
"""
import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from routers import notes, chat

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ensure data directories exist
os.makedirs(settings.notes_dir, exist_ok=True)
os.makedirs(settings.chroma_db_path, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    if settings.groq_api_key:
        logger.info("AI mode: Groq (%s) + local embeddings - no paid API required", settings.groq_model)
    elif settings.openai_api_key:
        logger.info("AI mode: OpenAI (%s)", settings.llm_model)
    else:
        logger.warning("No GROQ_API_KEY set - AI chat/search will not work")
    yield


app = FastAPI(
    title="Second Brain API",
    description="AI-powered note taking with RAG",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(notes.router, prefix="/api")
app.include_router(chat.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok", "version": "1.0.0"}


@app.get("/")
async def root():
    return {
        "name": "Second Brain API",
        "docs": "/docs",
        "health": "/health",
    }
