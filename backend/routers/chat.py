from fastapi import APIRouter
from models.schemas import ChatRequest, ChatResponse, Note
from services import note_store, rag_service

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/", response_model=ChatResponse)
async def chat(req: ChatRequest):
    answer, source_ids, follow_ups = await rag_service.chat_with_notes(
        message=req.message,
        history=req.history,
        notebook_filter=req.notebook_filter,
    )

    # Resolve source note objects
    source_notes: list[Note] = []
    for note_id in source_ids:
        note = await note_store.get_note(note_id)
        if note:
            source_notes.append(note)

    return ChatResponse(
        message=answer,
        sources=source_notes,
        follow_up_questions=follow_ups,
    )
