from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List
from models.schemas import (
    Note, NoteCreate, NoteUpdate,
    NoteSearchResult, AutoTagRequest, AutoTagResponse,
    SearchRequest, StatsResponse
)
from services import note_store, rag_service

router = APIRouter(prefix="/notes", tags=["notes"])


@router.post("/", response_model=Note, status_code=201)
async def create_note(data: NoteCreate):
    note = await note_store.create_note(data)
    # Index in vector store (non-blocking)
    try:
        await rag_service.index_note(note)
    except Exception:
        pass
    return note


@router.get("/", response_model=List[Note])
async def list_notes(
    notebook: Optional[str] = Query(None),
    tag: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    return await note_store.list_notes(notebook=notebook, tag=tag, limit=limit, offset=offset)


@router.get("/stats", response_model=StatsResponse)
async def get_stats():
    all_notes = await note_store.list_notes(limit=10000)
    notebooks = {n.notebook for n in all_notes}
    all_tags: set = set()
    for note in all_notes:
        all_tags.update(note.tags)
    return StatsResponse(
        total_notes=len(all_notes),
        total_notebooks=len(notebooks),
        total_tags=len(all_tags),
        recent_notes=all_notes[:5],
    )


@router.get("/notebooks", response_model=List[str])
async def get_notebooks():
    return await note_store.get_all_notebooks()


@router.get("/tags", response_model=List[str])
async def get_tags():
    return await note_store.get_all_tags()


@router.get("/{note_id}", response_model=Note)
async def get_note(note_id: str):
    note = await note_store.get_note(note_id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note


@router.put("/{note_id}", response_model=Note)
async def update_note(note_id: str, data: NoteUpdate):
    note = await note_store.update_note(note_id, data)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    try:
        await rag_service.index_note(note)
    except Exception:
        pass
    return note


@router.delete("/{note_id}", status_code=204)
async def delete_note(note_id: str):
    deleted = await note_store.delete_note(note_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Note not found")
    try:
        await rag_service.remove_note_from_index(note_id)
    except Exception:
        pass


@router.post("/search", response_model=List[NoteSearchResult])
async def search_notes(req: SearchRequest):
    results = await rag_service.semantic_search(
        query=req.query,
        limit=req.limit,
        notebook_filter=req.notebook_filter,
    )
    output = []
    for note_id, score, chunk in results:
        note = await note_store.get_note(note_id)
        if note:
            output.append(NoteSearchResult(
                note=note,
                score=score,
                matched_chunks=[chunk],
            ))
    return output


@router.post("/auto-tag", response_model=AutoTagResponse)
async def auto_tag(req: AutoTagRequest):
    result = await rag_service.auto_tag_note(req.title, req.content)
    return AutoTagResponse(
        tags=result.get("tags", []),
        suggested_notebook=result.get("suggested_notebook", "Default"),
        summary=result.get("summary", ""),
    )
