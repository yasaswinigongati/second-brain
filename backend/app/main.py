"""
Second Brain — FastAPI Backend
"""
import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from routers import notes, chat

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Ensure data directories exist
os.makedirs("./data/notes", exist_ok=True)
os.makedirs("./data/chroma_db", exist_ok=True)

app = FastAPI(
    title="Second Brain API",
    description="AI-powered note taking with RAG",
    version="1.0.0",
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
