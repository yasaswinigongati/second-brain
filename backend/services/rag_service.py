"""
RAG Service — Retrieval-Augmented Generation pipeline.

Uses:
- LangChain for orchestration
- ChromaDB for vector storage
- OpenAI embeddings + LLM
"""
import os
import logging
from typing import List, Optional, Tuple
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_chroma import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.schema import Document, HumanMessage, AIMessage, SystemMessage
from langchain.prompts import ChatPromptTemplate
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains.retrieval import create_retrieval_chain
from app.config import settings
from models.schemas import Note, ChatMessage

logger = logging.getLogger(__name__)

# ── Singletons ──────────────────────────────────────────────────────────────

_embeddings: Optional[OpenAIEmbeddings] = None
_vectorstore: Optional[Chroma] = None
_llm: Optional[ChatOpenAI] = None


def _get_embeddings() -> OpenAIEmbeddings:
    global _embeddings
    if _embeddings is None:
        _embeddings = OpenAIEmbeddings(
            model=settings.embedding_model,
            openai_api_key=settings.openai_api_key,
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


def _get_llm() -> ChatOpenAI:
    global _llm
    if _llm is None:
        _llm = ChatOpenAI(
            model=settings.llm_model,
            openai_api_key=settings.openai_api_key,
            temperature=0.3,
        )
    return _llm


# ── Text Splitter ─────────────────────────────────────────────────────────

_splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\n\n", "\n", ". ", " ", ""],
)


# ── Indexing ──────────────────────────────────────────────────────────────

async def index_note(note: Note) -> None:
    """Add or update a note in the vector store."""
    try:
        vs = _get_vectorstore()
        # Delete old chunks for this note
        await remove_note_from_index(note.id)

        # Chunk the note content
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
            logger.info(f"Indexed note {note.id} ({len(documents)} chunks)")
    except Exception as e:
        logger.error(f"Error indexing note {note.id}: {e}")


async def remove_note_from_index(note_id: str) -> None:
    """Remove all chunks for a note from the vector store."""
    try:
        vs = _get_vectorstore()
        results = vs.get(where={"note_id": note_id})
        if results and results.get("ids"):
            vs.delete(ids=results["ids"])
    except Exception as e:
        logger.warning(f"Could not remove note {note_id} from index: {e}")


# ── Semantic Search ────────────────────────────────────────────────────────

async def semantic_search(
    query: str,
    limit: int = 10,
    notebook_filter: Optional[str] = None,
) -> List[Tuple[str, float, str]]:
    """
    Returns list of (note_id, score, matched_chunk) tuples.
    """
    try:
        vs = _get_vectorstore()
        where = {"notebook": notebook_filter} if notebook_filter else None
        results = vs.similarity_search_with_score(
            query, k=limit, filter=where
        )
        seen_notes: dict[str, Tuple[str, float, str]] = {}
        for doc, score in results:
            note_id = doc.metadata.get("note_id", "")
            # Keep best score per note
            if note_id not in seen_notes or score < seen_notes[note_id][1]:
                seen_notes[note_id] = (note_id, float(score), doc.page_content)
        return sorted(seen_notes.values(), key=lambda x: x[1])
    except Exception as e:
        logger.error(f"Search error: {e}")
        return []


# ── RAG Chat ──────────────────────────────────────────────────────────────

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

        # Build retriever
        search_kwargs = {"k": 5}
        if notebook_filter:
            search_kwargs["filter"] = {"notebook": notebook_filter}
        retriever = vs.as_retriever(search_kwargs=search_kwargs)

        # Retrieve relevant docs
        docs = retriever.invoke(message)

        if not docs:
            return (
                "I couldn't find any relevant notes for your question. "
                "Try adding more notes or rephrasing your question.",
                [],
                [],
            )

        # Build context string
        context = "\n\n---\n\n".join(
            f"**{doc.metadata.get('title', 'Untitled')}**\n{doc.page_content}"
            for doc in docs
        )

        # Build chat history for LLM
        messages = [SystemMessage(content=SYSTEM_PROMPT.format(context=context))]
        for msg in history[-6:]:  # Last 6 messages for context
            if msg.role == "user":
                messages.append(HumanMessage(content=msg.content))
            else:
                messages.append(AIMessage(content=msg.content))
        messages.append(HumanMessage(content=message))

        # Call LLM
        response = llm.invoke(messages)
        answer = response.content

        # Extract source note IDs
        source_ids = list({doc.metadata.get("note_id", "") for doc in docs})
        source_ids = [sid for sid in source_ids if sid]

        # Generate follow-up questions
        follow_ups = await _generate_follow_ups(message, answer, llm)

        return answer, source_ids, follow_ups

    except Exception as e:
        logger.error(f"Chat error: {e}")
        return (
            f"I encountered an error processing your question. "
            f"Please check your API keys and try again. Error: {str(e)}",
            [],
            [],
        )


async def _generate_follow_ups(
    question: str, answer: str, llm: ChatOpenAI
) -> List[str]:
    try:
        prompt = f"""Based on this Q&A pair, suggest 3 short follow-up questions the user might want to ask.
Return ONLY a JSON array of strings, nothing else.

Question: {question}
Answer: {answer[:500]}

Return format: ["question 1", "question 2", "question 3"]"""
        response = llm.invoke([HumanMessage(content=prompt)])
        import json
        text = response.content.strip()
        if text.startswith("["):
            return json.loads(text)
    except Exception:
        pass
    return []


# ── Auto-tagging ──────────────────────────────────────────────────────────

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
        import json
        text = response.content.strip()
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
        return json.loads(text)
    except Exception as e:
        logger.error(f"Auto-tag error: {e}")
        return {
            "tags": [],
            "suggested_notebook": "Default",
            "summary": "",
        }
