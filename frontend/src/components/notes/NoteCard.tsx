"use client";
import { Note } from "@/types";
import { formatDate, truncate, stripMarkdown, getNotebookColor, cn } from "@/lib/utils";
import { useAppStore } from "@/store/appStore";
import { Clock, Tag, MoreHorizontal, Trash2, Edit3 } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notesApi } from "@/lib/api";
import toast from "react-hot-toast";

interface NoteCardProps {
  note: Note;
  view?: "grid" | "list";
}

export default function NoteCard({ note, view = "grid" }: NoteCardProps) {
  const { setSelectedNote, setEditorOpen, removeNote } = useAppStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const deleteMutation = useMutation({
    mutationFn: () => notesApi.delete(note.id),
    onSuccess: () => {
      removeNote(note.id);
      qc.invalidateQueries({ queryKey: ["notes"] });
      qc.invalidateQueries({ queryKey: ["notebooks"] });
      qc.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Note deleted");
    },
  });

  const preview = truncate(stripMarkdown(note.content), view === "grid" ? 120 : 180);

  if (view === "list") {
    return (
      <div
        className="group flex items-start gap-4 px-5 py-4 bg-white border-b border-gray-100 hover:bg-brain-50/30 transition-colors cursor-pointer animate-in"
        onClick={() => { setSelectedNote(note); setEditorOpen(true); }}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", getNotebookColor(note.notebook))}>
              {note.notebook}
            </span>
            <span className="text-xs text-gray-400 flex items-center gap-1">
              <Clock size={10} />
              {formatDate(note.updated_at)}
            </span>
          </div>
          <h3 className="font-medium text-gray-900 text-sm truncate mb-0.5">{note.title}</h3>
          <p className="text-xs text-gray-500 truncate">{preview}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {note.tags.slice(0, 2).map(tag => (
            <span key={tag} className="text-xs text-brain-600 bg-brain-50 px-1.5 py-0.5 rounded">#{tag}</span>
          ))}
          <div ref={menuRef} className="relative">
            <button
              onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-gray-100 text-gray-400"
            >
              <MoreHorizontal size={15} />
            </button>
            {menuOpen && <NoteMenu onEdit={() => { setSelectedNote(note); setEditorOpen(true); }} onDelete={() => deleteMutation.mutate()} />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="group relative bg-white rounded-2xl border border-gray-100 p-4 hover:border-brain-200 hover:shadow-md transition-all cursor-pointer animate-in flex flex-col gap-2"
      onClick={() => { setSelectedNote(note); setEditorOpen(true); }}
    >
      {/* Notebook badge */}
      <div className="flex items-center justify-between">
        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", getNotebookColor(note.notebook))}>
          {note.notebook}
        </span>
        <div ref={menuRef} className="relative">
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-gray-100 text-gray-400"
          >
            <MoreHorizontal size={15} />
          </button>
          {menuOpen && <NoteMenu onEdit={() => { setSelectedNote(note); setEditorOpen(true); }} onDelete={() => deleteMutation.mutate()} />}
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{note.title}</h3>
      <p className="text-xs text-gray-500 leading-relaxed flex-1">{preview}</p>

      {/* Tags */}
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {note.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs text-brain-600 bg-brain-50 px-1.5 py-0.5 rounded-md">
              #{tag}
            </span>
          ))}
          {note.tags.length > 3 && <span className="text-xs text-gray-400">+{note.tags.length - 3}</span>}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50 mt-auto">
        <span className="text-[10px] text-gray-400 flex items-center gap-1">
          <Clock size={10} />{formatDate(note.updated_at)}
        </span>
        <span className="text-[10px] text-gray-400">{note.word_count} words</span>
      </div>
    </div>
  );
}

function NoteMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="absolute right-0 top-full mt-1 w-36 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50">
      <button onClick={e => { e.stopPropagation(); onEdit(); }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
        <Edit3 size={13} /> Edit
      </button>
      <button onClick={e => { e.stopPropagation(); onDelete(); }}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50">
        <Trash2 size={13} /> Delete
      </button>
    </div>
  );
}
