import { create } from "zustand";
import type { Note, ActiveView, ViewMode } from "@/types";

interface AppStore {
  // Notes
  notes: Note[];
  setNotes: (notes: Note[]) => void;
  addNote: (note: Note) => void;
  updateNote: (note: Note) => void;
  removeNote: (id: string) => void;

  // UI State
  activeView: ActiveView;
  setActiveView: (view: ActiveView) => void;
  selectedNote: Note | null;
  setSelectedNote: (note: Note | null) => void;
  isEditorOpen: boolean;
  setEditorOpen: (open: boolean) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;

  // Filters
  activeNotebook: string | null;
  setActiveNotebook: (nb: string | null) => void;
  activeTag: string | null;
  setActiveTag: (tag: string | null) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppStore>((set) => ({
  notes: [],
  setNotes: (notes) => set({ notes }),
  addNote: (note) => set((s) => ({ notes: [note, ...s.notes] })),
  updateNote: (note) =>
    set((s) => ({
      notes: s.notes.map((n) => (n.id === note.id ? note : n)),
    })),
  removeNote: (id) =>
    set((s) => ({ notes: s.notes.filter((n) => n.id !== id) })),

  activeView: "notes",
  setActiveView: (activeView) => set({ activeView }),
  selectedNote: null,
  setSelectedNote: (selectedNote) => set({ selectedNote }),
  isEditorOpen: false,
  setEditorOpen: (isEditorOpen) => set({ isEditorOpen }),
  viewMode: "grid",
  setViewMode: (viewMode) => set({ viewMode }),

  activeNotebook: null,
  setActiveNotebook: (activeNotebook) => set({ activeNotebook }),
  activeTag: null,
  setActiveTag: (activeTag) => set({ activeTag }),
  searchQuery: "",
  setSearchQuery: (searchQuery) => set({ searchQuery }),

  sidebarOpen: true,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
}));
