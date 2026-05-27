"""
Basic API tests for notes endpoints.
Run: pytest tests/ -v
"""
import pytest
import pytest_asyncio
import os
import tempfile

os.environ["NOTES_DIR"] = tempfile.mkdtemp(prefix="second_brain_notes_")
os.environ["CHROMA_DB_PATH"] = tempfile.mkdtemp(prefix="second_brain_chroma_")

from httpx import AsyncClient, ASGITransport
from app.main import app
from services import rag_service


@pytest_asyncio.fixture(autouse=True)
async def disable_vector_indexing(monkeypatch):
    async def noop(*args, **kwargs):
        return None

    monkeypatch.setattr(rag_service, "index_note", noop)
    monkeypatch.setattr(rag_service, "remove_note_from_index", noop)


@pytest_asyncio.fixture
async def client():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c


@pytest.mark.asyncio
async def test_health(client):
    r = await client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_create_and_get_note(client):
    payload = {
        "title": "Test Note",
        "content": "This is a test note with some content.",
        "notebook": "Default",
        "tags": ["test", "pytest"],
    }
    r = await client.post("/api/notes", json=payload)
    assert r.status_code == 201
    data = r.json()
    assert data["title"] == payload["title"]
    assert data["id"]

    note_id = data["id"]
    r2 = await client.get(f"/api/notes/{note_id}")
    assert r2.status_code == 200
    assert r2.json()["id"] == note_id


@pytest.mark.asyncio
async def test_list_notes(client):
    r = await client.get("/api/notes")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@pytest.mark.asyncio
async def test_update_note(client):
    # Create
    r = await client.post("/api/notes", json={"title": "Update me", "content": "original content"})
    note_id = r.json()["id"]
    # Update
    r2 = await client.put(f"/api/notes/{note_id}", json={"title": "Updated title"})
    assert r2.status_code == 200
    assert r2.json()["title"] == "Updated title"


@pytest.mark.asyncio
async def test_delete_note(client):
    r = await client.post("/api/notes", json={"title": "Delete me", "content": "bye"})
    note_id = r.json()["id"]
    r2 = await client.delete(f"/api/notes/{note_id}")
    assert r2.status_code == 204
    r3 = await client.get(f"/api/notes/{note_id}")
    assert r3.status_code == 404


@pytest.mark.asyncio
async def test_get_notebooks(client):
    r = await client.get("/api/notes/notebooks")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@pytest.mark.asyncio
async def test_get_tags(client):
    r = await client.get("/api/notes/tags")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


@pytest.mark.asyncio
async def test_stats(client):
    r = await client.get("/api/notes/stats")
    assert r.status_code == 200
    data = r.json()
    assert "total_notes" in data
    assert "total_notebooks" in data
