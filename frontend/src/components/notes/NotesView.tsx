"use client";
import { useQuery } from "@tanstack/react-query";
import { notesApi } from "@/lib/api";
import { useAppStore } from "@/store/appStore";
import NoteCard from "./NoteCard";
import { BookOpen, Plus } from "lucide-react";
import { useEffect } from "react";

export default function NotesView() {
  const { viewMode, activeNotebook, activeTag, setNotes } = useAppStore();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes", activeNotebook, activeTag],
    queryFn: () => notesApi.list({ notebook: activeNotebook ?? undefined, tag: activeTag ?? undefined }),
  });

  useEffect(() => { setNotes(notes); }, [notes, setNotes]);

  const { setEditorOpen, setSelectedNote } = useAppStore();

  if (isLoading) {
    return (
      <div className="flex-1 overflow-auto p-6">
        <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : ""}`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-44 bg-white rounded-2xl border border-gray-100 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
        <div className="w-16 h-16 rounded-2xl bg-brain-50 flex items-center justify-center">
          <BookOpen size={28} className="text-brain-400" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-700 mb-1">No notes yet</h3>
          <p className="text-sm text-gray-400">Create your first note to start building your second brain</p>
        </div>
        <button
          onClick={() => { setSelectedNote(null); setEditorOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-brain-600 hover:bg-brain-700 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus size={15} /> Create Note
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-6">
      {viewMode === "grid" ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {notes.map(note => <NoteCard key={note.id} note={note} view="grid" />)}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {notes.map(note => <NoteCard key={note.id} note={note} view="list" />)}
        </div>
      )}
    </div>
  );
}
