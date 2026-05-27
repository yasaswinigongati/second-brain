"""
RAG Service - Retrieval-Augmented Generation pipeline.

Default (free): Groq LLM + local HuggingFace embeddings.
Optional: OpenAI if OPENAI_API_KEY is set.
"""
import json
import logging
import os
from typing import Any, List, Optional, Tuple

# Chroma telemetry can produce noisy PostHog errors with some dependency versions.
os.environ.setdefault("ANONYMIZED_TELEMETRY", "False")

from langchain.schema import AIMessage, BaseMessage, Document, HumanMessage, SystemMessage
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_chroma import Chroma

from app.config import settings
from models.schemas import ChatMessage, Note

logger = logging.getLogger(__name__)

# Singletons
_embeddings: Optional[Any] = None
_vectorstore: Optional[Chroma] = None
_llm: Optional[Any] = None


def _get_embeddings():
    global _embeddings
    if _embeddings is None:
        if settings.openai_api_key:
            from langchain_openai import OpenAIEmbeddings

            _embeddings = OpenAIEmbeddings(
                model=settings.embedding_model,
                openai_api_key=settings.openai_api_key,
            )
            logger.info("Using OpenAI embeddings")
        else:
            from langchain_community.embeddings import HuggingFaceEmbeddings

            _embeddings = HuggingFaceEmbeddings(
                model_name=settings.local_embedding_model,
            )
            logger.info(
                "Using local embeddings (%s) - run utils/reindex.py if search seems off",
                settings.local_embedding_model,
            )
    return _embeddings


def _get_vectorstore() -> Chroma:
    global _vectorstore
    if _vectorstore is None:
        os.makedirs(settings.chroma_db_path, exist_ok=True)
        _vectorstore = Chroma(
            collection_name="second_brain_notes",
            embedding_function=_get_embeddings(),
            persist_directory=settings.chroma_db_path,
        )
    return _vectorstore


def _get_llm():
    global _llm
    if _llm is None:
        if settings.groq_api_key:
            from langchain_groq import ChatGroq

            _llm = ChatGroq(
                model=settings.groq_model,
                groq_api_key=settings.groq_api_key,
                temperature=0.3,
            )
            logger.info("Using Groq LLM (%s) - free tier", settings.groq_model)
        elif settings.openai_api_key:
            from langchain_openai import ChatOpenAI

            _llm = ChatOpenAI(
                model=settings.llm_model,
                openai_api_key=settings.openai_api_key,
                temperature=0.3,
            )
            logger.info("Using OpenAI LLM (%s)", settings.llm_model)
        else:
            raise ValueError(
                "Set GROQ_API_KEY in backend/.env - free at https://console.groq.com"
            )
    return _llm


# Text splitter
_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", ". ", " ", ""],
)


async def index_note(note: Note) -> None:
    """Add or update a note in the vector store."""
    try:
        vs = _get_vectorstore()
        await remove_note_from_index(note.id)

        full_text = f"# {note.title}\n\n{note.content}"
        chunks = _splitter.split_text(full_text)

        documents = [
            Document(
                page_content=chunk,
                metadata={
                    "note_id": note.id,
                    "title": note.title,
                    "notebook": note.notebook,
                    "tags": ",".join(note.tags),
                    "chunk_index": i,
                },
            )
            for i, chunk in enumerate(chunks)
        ]

        if documents:
            ids = [f"{note.id}_chunk_{i}" for i in range(len(documents))]
            vs.add_documents(documents, ids=ids)
            logger.info("Indexed note %s (%s chunks)", note.id, len(documents))
    except Exception as e:
        logger.error("Error indexing note %s: %s", note.id, e)


async def remove_note_from_index(note_id: str) -> None:
    """Remove all chunks for a note from the vector store."""
    try:
        vs = _get_vectorstore()
        results = vs.get(where={"note_id": note_id})
        if results and results.get("ids"):
            vs.delete(ids=results["ids"])
    except Exception as e:
        logger.warning("Could not remove note %s from index: %s", note_id, e)


async def semantic_search(
    query: str,
    limit: int = 10,
    notebook_filter: Optional[str] = None,
) -> List[Tuple[str, float, str]]:
    """
    Return list of (note_id, score, matched_chunk) tuples.
    """
    try:
        vs = _get_vectorstore()
        where = {"notebook": notebook_filter} if notebook_filter else None
        results = vs.similarity_search_with_score(query, k=limit, filter=where)
        seen_notes: dict[str, Tuple[str, float, str]] = {}
        for doc, score in results:
            note_id = doc.metadata.get("note_id", "")
            if note_id not in seen_notes or score < seen_notes[note_id][1]:
                seen_notes[note_id] = (note_id, float(score), doc.page_content)
        return sorted(seen_notes.values(), key=lambda x: x[1])
    except Exception as e:
        logger.error("Search error: %s", e)
        return []


SYSTEM_PROMPT = """You are a helpful AI assistant for a personal knowledge base called "Second Brain".
Your job is to help the user understand and explore their notes.

IMPORTANT RULES:
1. Always ground your answers in the provided context (the user's actual notes).
2. If the context doesn't contain enough info, say so clearly.
3. Be conversational but precise.
4. Cite note titles when referencing specific notes.
5. Suggest follow-up questions at the end when relevant.

Context from the user's notes:
{context}
"""


async def chat_with_notes(
    message: str,
    history: List[ChatMessage],
    notebook_filter: Optional[str] = None,
) -> Tuple[str, List[str], List[str]]:
    """
    RAG-based chat. Returns (answer, source_note_ids, follow_up_questions).
    """
    try:
        vs = _get_vectorstore()
        llm = _get_llm()

        search_kwargs: dict[str, Any] = {"k": 5}
        if notebook_filter:
            search_kwargs["filter"] = {"notebook": notebook_filter}
        retriever = vs.as_retriever(search_kwargs=search_kwargs)

        docs = retriever.invoke(message)

        if not docs:
            return (
                "I couldn't find any relevant notes for your question. "
                "Try adding more notes or rephrasing your question.",
                [],
                [],
            )

        context = "\n\n---\n\n".join(
            f"**{doc.metadata.get('title', 'Untitled')}**\n{doc.page_content}"
            for doc in docs
        )

        messages: list[BaseMessage] = [
            SystemMessage(content=SYSTEM_PROMPT.format(context=context))
        ]
        for msg in history[-6:]:
            if msg.role == "user":
                messages.append(HumanMessage(content=msg.content))
            else:
                messages.append(AIMessage(content=msg.content))
        messages.append(HumanMessage(content=message))

        response = llm.invoke(messages)
        answer = response.content

        source_ids = list({doc.metadata.get("note_id", "") for doc in docs})
        source_ids = [sid for sid in source_ids if sid]

        follow_ups = await _generate_follow_ups(message, answer, llm)

        return answer, source_ids, follow_ups
    except Exception as e:
        logger.error("Chat error: %s", e)
        return (
            "I encountered an error processing your question. "
            f"Please check your API keys and try again. Error: {str(e)}",
            [],
            [],
        )


async def _generate_follow_ups(question: str, answer: str, llm: Any) -> List[str]:
    try:
        prompt = f"""Based on this Q&A pair, suggest 3 short follow-up questions the user might want to ask.
Return ONLY a JSON array of strings, nothing else.

Question: {question}
Answer: {answer[:500]}

Return format: ["question 1", "question 2", "question 3"]"""
        response = llm.invoke([HumanMessage(content=prompt)])
        text = response.content.strip()
        if text.startswith("["):
            return json.loads(text)
    except Exception:
        pass
    return []


async def auto_tag_note(title: str, content: str) -> dict:
    """Use LLM to suggest tags, notebook, and summary."""
    try:
        llm = _get_llm()
        prompt = f"""Analyze this note and return a JSON object with:
- "tags": array of 3-6 relevant tags (single words or short phrases, lowercase)
- "suggested_notebook": the best notebook category (e.g. "Work", "Personal", "Research", "Ideas", "Learning")
- "summary": a 1-2 sentence summary of the note

Note title: {title}
Note content: {content[:1000]}

Return ONLY valid JSON, no other text."""

        response = llm.invoke([HumanMessage(content=prompt)])
        text = response.content.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        return json.loads(text)
    except Exception as e:
        logger.error("Auto-tag error: %s", e)
        return {
            "tags": [],
            "suggested_notebook": "Default",
            "summary": "",
        }
