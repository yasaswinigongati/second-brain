"""
Seed script - creates sample notes for testing.
Run: python utils/seed.py  (from backend/)
"""
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from models.schemas import NoteCreate
from services.note_store import create_note
from services.rag_service import index_note

SAMPLES = [
    NoteCreate(
        title="Getting started with LangChain",
        content="""# LangChain Overview

LangChain is a framework for building LLM-powered apps.

## Key Concepts
- **Chains**: sequences of calls
- **Agents**: LLMs that use tools
- **Memory**: persisting state between calls
- **Retrievers**: fetch relevant documents

## RAG Pattern
1. Embed documents -> store in vector DB
2. Embed query -> find similar docs
3. Pass docs + query to LLM -> answer""",
        notebook="Learning",
        tags=["langchain", "llm", "rag", "ai"],
    ),
    NoteCreate(
        title="Project ideas for Q3",
        content="""# Q3 Project Ideas

## High Priority
- Second Brain app with RAG
- Customer support chatbot
- Code review assistant

## Research
- Fine-tuning small models
- Multimodal pipelines

## Notes
Focus on projects with clear user value. Ship fast, iterate.""",
        notebook="Ideas",
        tags=["projects", "planning", "q3"],
    ),
    NoteCreate(
        title="Meeting notes - AI strategy",
        content="""# AI Strategy Meeting
**Date:** 2024-06-01

## Attendees
Alice, Bob, Carol

## Key Decisions
- Adopt LangChain for all AI features
- Use ChromaDB for vector storage
- Deploy on AWS with auto-scaling

## Action Items
- [ ] Bob: set up ChromaDB instance
- [ ] Alice: write prompt templates
- [ ] Carol: define evaluation metrics""",
        notebook="Work",
        tags=["meeting", "ai", "strategy"],
    ),
    NoteCreate(
        title="Python async patterns",
        content="""# Async Python

## asyncio basics
```python
async def main():
    result = await some_coroutine()
    return result

asyncio.run(main())
```

## Concurrent tasks
```python
results = await asyncio.gather(
    task1(), task2(), task3()
)
```

## FastAPI + async
FastAPI natively supports async route handlers - always use `async def` for I/O bound operations.""",
        notebook="Learning",
        tags=["python", "async", "fastapi"],
    ),
]


async def seed():
    print("Seeding sample notes...")
    for sample in SAMPLES:
        note = await create_note(sample)
        await index_note(note)
        print(f"  Created: {note.title}")
    print(f"\nDone! {len(SAMPLES)} notes created.")


if __name__ == "__main__":
    asyncio.run(seed())
