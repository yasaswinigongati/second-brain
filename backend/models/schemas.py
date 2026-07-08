from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List
from datetime import datetime, timezone
import uuid


class NoteBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    content: str = Field(..., min_length=1)
    notebook: Optional[str] = Field(default="Default")
    tags: List[str] = Field(default_factory=list)


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    content: Optional[str] = Field(None, min_length=1)
    notebook: Optional[str] = None
    tags: Optional[List[str]] = None


class Note(NoteBase):
    model_config = ConfigDict(from_attributes=True)

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    word_count: int = 0
    summary: Optional[str] = None


class NoteSearchResult(BaseModel):
    note: Note
    score: float
    matched_chunks: List[str] = Field(default_factory=list)


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str
    sources: Optional[List[str]] = None  # note IDs used as context


class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = Field(default_factory=list)
    notebook_filter: Optional[str] = None


class ChatResponse(BaseModel):
    message: str
    sources: List[Note] = Field(default_factory=list)
    follow_up_questions: List[str] = Field(default_factory=list)


class AutoTagRequest(BaseModel):
    title: str
    content: str


class AutoTagResponse(BaseModel):
    tags: List[str]
    suggested_notebook: str
    summary: str


class SearchRequest(BaseModel):
    query: str
    limit: int = Field(default=10, ge=1, le=50)
    notebook_filter: Optional[str] = None


class StatsResponse(BaseModel):
    total_notes: int
    total_notebooks: int
    total_tags: int
    recent_notes: List[Note]
