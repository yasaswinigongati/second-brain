"""
Seed script — creates sample notes for testing.
Run: python utils/seed.py  (from backend/)
"""
import asyncio, sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from models.schemas import NoteCreate
from services.note_store import create_note
from services.rag_service import index_note

SAMPLES = [
    NoteCreate(
        title="Getting started with LangChain",
        content="""# LangChain Overview\n\nLangChain is a framework for building LLM-powered apps.\n\n## Key Concepts\n- **Chains**: sequences of calls\n- **Agents**: LLMs that use tools\n- **Memory**: persisting state between calls\n- **Retrievers**: fetch relevant documents\n\n## RAG Pattern\n1. Embed documents → store in vector DB\n2. Embed query → find similar docs\n3. Pass docs + query to LLM → answer""",
        notebook="Learning", tags=["langchain", "llm", "rag", "ai"]
    ),
    NoteCreate(
        title="Project ideas for Q3",
        content="""# Q3 Project Ideas\n\n## High Priority\n- Second Brain app with RAG\n- Customer support chatbot\n- Code review assistant\n\n## Research\n- Fine-tuning small models\n- Multimodal pipelines\n\n## Notes\nFocus on projects with clear user value. Ship fast, iterate.""",
        notebook="Ideas", tags=["projects", "planning", "q3"]
    ),
    NoteCreate(
        title="Meeting notes — AI strategy",
        content="""# AI Strategy Meeting\n**Date:** 2024-06-01\n\n## Attendees\nAlice, Bob, Carol\n\n## Key Decisions\n- Adopt LangChain for all AI features\n- Use ChromaDB for vector storage\n- Deploy on AWS with auto-scaling\n\n## Action Items\n- [ ] Bob: set up ChromaDB instance\n- [ ] Alice: write prompt templates\n- [ ] Carol: define evaluation metrics""",
        notebook="Work", tags=["meeting", "ai", "strategy"]
    ),
    NoteCreate(
        title="Python async patterns",
        content="""# Async Python\n\n## asyncio basics\n```python\nasync def main():\n    result = await some_coroutine()\n    return result\n\nasyncio.run(main())\n```\n\n## Concurrent tasks\n```python\nresults = await asyncio.gather(\n    task1(), task2(), task3()\n)\n```\n\n## FastAPI + async\nFastAPI natively supports async route handlers — always use `async def` for I/O bound operations.""",
        notebook="Learning", tags=["python", "async", "fastapi"]
    ),
]

async def seed():
    print("Seeding sample notes...")
    for sample in SAMPLES:
        note = await create_note(sample)
        await index_note(note)
        print(f"  ✓ Created: {note.title}")
    print(f"\nDone! {len(SAMPLES)} notes created.")

if __name__ == "__main__":
    asyncio.run(seed())
