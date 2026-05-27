"use client";
import { useQuery } from "@tanstack/react-query";
import { notesApi } from "@/lib/api";
import { useAppStore } from "@/store/appStore";
import NoteCard from "./NoteCard";
import { Pencil } from "lucide-react";

export default function NotesView() {
  const { viewMode, activeNotebook, activeTag, setEditorOpen, setSelectedNote } = useAppStore();

  const { data: notes = [], isLoading } = useQuery({
    queryKey: ["notes", activeNotebook, activeTag],
    queryFn: () => notesApi.list({ notebook: activeNotebook ?? undefined, tag: activeTag ?? undefined }),
  });

  if (isLoading) {
    return (
      <div className="p-6 grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 rounded-lg animate-pulse" style={{ background: "var(--c-border)" }} />
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 pb-20">
        <p className="text-2xl font-serif text-stone-300">nothing here yet</p>
        <p className="text-sm text-stone-400">
          {activeNotebook ? `No notes in ${activeNotebook}` : activeTag ? `No notes tagged #${activeTag}` : "Create your first note to get started"}
        </p>
        <button
          onClick={() => { setSelectedNote(null); setEditorOpen(true); }}
          className="mt-2 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded text-white transition-colors"
          style={{ background: "var(--c-accent)" }}
        >
          <Pencil size={13} /> Write something
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-5">
      {viewMode === "grid" ? (
        <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {notes.map(n => <NoteCard key={n.id} note={n} view="grid" />)}
        </div>
      ) : (
        <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--c-border)", background: "var(--c-surface)" }}>
          {notes.map(n => <NoteCard key={n.id} note={n} view="list" />)}
        </div>
      )}
    </div>
  );
}