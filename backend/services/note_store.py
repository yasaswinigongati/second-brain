"""
Note storage service - persists notes as JSON files.
In production, swap for PostgreSQL or SQLite.
"""
import json
import os
import aiofiles
from datetime import datetime
from typing import Optional, List
from app.config import settings
from models.schemas import Note, NoteCreate, NoteUpdate
import uuid

NOTES_DIR = settings.notes_dir
os.makedirs(NOTES_DIR, exist_ok=True)


def _note_path(note_id: str) -> str:
    return os.path.join(NOTES_DIR, f"{note_id}.json")


async def create_note(data: NoteCreate) -> Note:
    note = Note(
        id=str(uuid.uuid4()),
        title=data.title,
        content=data.content,
        notebook=data.notebook or "Default",
        tags=data.tags,
        word_count=len(data.content.split()),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    async with aiofiles.open(_note_path(note.id), "w") as f:
        await f.write(note.model_dump_json(indent=2))
    return note


async def get_note(note_id: str) -> Optional[Note]:
    path = _note_path(note_id)
    if not os.path.exists(path):
        return None
    async with aiofiles.open(path, "r") as f:
        data = json.loads(await f.read())
    return Note(**data)


async def update_note(note_id: str, data: NoteUpdate) -> Optional[Note]:
    note = await get_note(note_id)
    if not note:
        return None
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(note, field, value)
    if data.content:
        note.word_count = len(data.content.split())
    note.updated_at = datetime.utcnow()
    async with aiofiles.open(_note_path(note_id), "w") as f:
        await f.write(note.model_dump_json(indent=2))
    return note


async def delete_note(note_id: str) -> bool:
    path = _note_path(note_id)
    if not os.path.exists(path):
        return False
    os.remove(path)
    return True


async def list_notes(
    notebook: Optional[str] = None,
    tag: Optional[str] = None,
    limit: int = 100,
    offset: int = 0,
) -> List[Note]:
    notes = []
    for fname in os.listdir(NOTES_DIR):
        if not fname.endswith(".json"):
            continue
        path = os.path.join(NOTES_DIR, fname)
        async with aiofiles.open(path, "r") as f:
            data = json.loads(await f.read())
        note = Note(**data)
        if notebook and note.notebook != notebook:
            continue
        if tag and tag not in note.tags:
            continue
        notes.append(note)
    # Sort by updated_at descending
    notes.sort(key=lambda n: n.updated_at, reverse=True)
    return notes[offset : offset + limit]


async def get_all_notebooks() -> List[str]:
    notes = await list_notes(limit=10000)
    return list({n.notebook for n in notes})


async def get_all_tags() -> List[str]:
    notes = await list_notes(limit=10000)
    all_tags: set = set()
    for note in notes:
        all_tags.update(note.tags)
    return sorted(all_tags)
