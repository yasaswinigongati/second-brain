import axios from "axios";
import type {
  Note,
  NoteCreate,
  NoteUpdate,
  NoteSearchResult,
  ChatMessage,
  ChatResponse,
  AutoTagResponse,
  StatsResponse,
} from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { "Content-Type": "application/json" },
});

// ── Notes ──────────────────────────────────────────────────────────────────

export const notesApi = {
  list: async (params?: {
    notebook?: string;
    tag?: string;
    limit?: number;
    offset?: number;
  }): Promise<Note[]> => {
    const { data } = await api.get("/notes", { params });
    return data;
  },

  get: async (id: string): Promise<Note> => {
    const { data } = await api.get(`/notes/${id}`);
    return data;
  },

  create: async (note: NoteCreate): Promise<Note> => {
    const { data } = await api.post("/notes", note);
    return data;
  },

  update: async (id: string, note: NoteUpdate): Promise<Note> => {
    const { data } = await api.put(`/notes/${id}`, note);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/notes/${id}`);
  },

  search: async (
    query: string,
    limit = 10,
    notebook_filter?: string
  ): Promise<NoteSearchResult[]> => {
    const { data } = await api.post("/notes/search", {
      query,
      limit,
      notebook_filter,
    });
    return data;
  },

  autoTag: async (
    title: string,
    content: string
  ): Promise<AutoTagResponse> => {
    const { data } = await api.post("/notes/auto-tag", { title, content });
    return data;
  },

  getStats: async (): Promise<StatsResponse> => {
    const { data } = await api.get("/notes/stats");
    return data;
  },

  getNotebooks: async (): Promise<string[]> => {
    const { data } = await api.get("/notes/notebooks");
    return data;
  },

  getTags: async (): Promise<string[]> => {
    const { data } = await api.get("/notes/tags");
    return data;
  },
};

// ── Chat ───────────────────────────────────────────────────────────────────

export const chatApi = {
  send: async (
    message: string,
    history: ChatMessage[],
    notebook_filter?: string
  ): Promise<ChatResponse> => {
    const { data } = await api.post("/chat", {
      message,
      history,
      notebook_filter,
    });
    return data;
  },
};

export default api;
