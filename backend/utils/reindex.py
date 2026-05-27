"""
Re-index all notes into ChromaDB.
Useful if the vector store gets out of sync.
Run: python utils/reindex.py  (from backend/)
"""
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from services.note_store import list_notes
from services.rag_service import _get_vectorstore, index_note


async def reindex():
    print("Re-indexing all notes into ChromaDB...")
    vs = _get_vectorstore()
    existing = vs.get()
    if existing["ids"]:
        vs.delete(ids=existing["ids"])
        print(f"  Cleared {len(existing['ids'])} existing chunks")

    notes = await list_notes(limit=10000)
    print(f"  Found {len(notes)} notes to index")

    for note in notes:
        await index_note(note)
        print(f"  Indexed: {note.title}")

    print(f"\nDone! {len(notes)} notes re-indexed.")


if __name__ == "__main__":
    asyncio.run(reindex())
