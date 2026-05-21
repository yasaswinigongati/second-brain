export interface Note {
  id: string;
  title: string;
  content: string;
  notebook: string;
  tags: string[];
  word_count: number;
  summary?: string;
  created_at: string;
  updated_at: string;
}

export interface NoteCreate {
  title: string;
  content: string;
  notebook?: string;
  tags?: string[];
}

export interface NoteUpdate {
  title?: string;
  content?: string;
  notebook?: string;
  tags?: string[];
}

export interface NoteSearchResult {
  note: Note;
  score: number;
  matched_chunks: string[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  sources?: string[];
}

export interface ChatResponse {
  message: string;
  sources: Note[];
  follow_up_questions: string[];
}

export interface AutoTagResponse {
  tags: string[];
  suggested_notebook: string;
  summary: string;
}

export interface StatsResponse {
  total_notes: number;
  total_notebooks: number;
  total_tags: number;
  recent_notes: Note[];
}

export type ViewMode = "grid" | "list";
export type ActiveView = "notes" | "chat" | "search" | "dashboard";
