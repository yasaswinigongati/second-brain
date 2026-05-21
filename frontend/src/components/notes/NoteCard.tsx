"use client";
import { Note } from "@/types";
import { formatDate, truncate, stripMarkdown, nbDot, cn } from "@/lib/utils";
import { useAppStore } from "@/store/appStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notesApi } from "@/lib/api";
import { Hash, Trash2, MoreHorizontal } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";

export default function NoteCard({ note, view = "grid" }: { note: Note; view?: "grid" | "list" }) {
  const { setSelectedNote, setEditorOpen, removeNote } = useAppStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const del = useMutation({
    mutationFn: () => notesApi.delete(note.id),
    onSuccess: () => {
      removeNote(note.id);
      qc.invalidateQueries({ queryKey: ["notes"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Deleted");
    },
  });

  const preview = truncate(stripMarkdown(note.content), view === "grid" ? 110 : 160);
  const open = () => { setSelectedNote(note); setEditorOpen(true); };

  if (view === "list") {
    return (
      <div
        onClick={open}
        className="group flex items-center gap-4 px-5 py-3 cursor-pointer transition-colors hover:bg-stone-50 border-b border-stone-100 fade-up"
      >
        <div className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0 mt-0.5", nbDot(note.notebook))} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-800 truncate">{note.title}</p>
          <p className="text-xs text-stone-400 truncate mt-0.5">{preview}</p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          {note.tags.slice(0, 2).map(t => (
            <span key={t} className="text-[11px] font-mono text-amber-700 hidden sm:block">#{t}</span>
          ))}
          <span className="text-[11px] text-stone-400 font-mono">{formatDate(note.updated_at)}</span>
          <div ref={menuRef} className="relative">
            <button
              onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <MoreHorizontal size={14} />
            </button>
            {menuOpen && <DropMenu onDelete={() => del.mutate()} />}
          </div>
        </div>
      </div>
    );
  }

  // Grid card
  return (
    <div
      onClick={open}
      className="group relative flex flex-col gap-2.5 p-4 rounded-lg cursor-pointer fade-up transition-all hover:shadow-md"
      style={{
        background: "var(--c-surface)",
        border: "1px solid var(--c-border)",
      }}
    >
      {/* Notebook indicator strip */}
      <div className={cn("absolute top-0 left-0 w-0.5 h-full rounded-l-lg", nbDot(note.notebook))} />

      <div className="flex items-start justify-between gap-2 pl-2">
        <h3 className="text-sm font-semibold text-stone-800 leading-snug line-clamp-2 flex-1">{note.title}</h3>
        <div ref={menuRef} className="relative flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(v => !v); }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-opacity"
          >
            <MoreHorizontal size={13} />
          </button>
          {menuOpen && <DropMenu onDelete={() => del.mutate()} />}
        </div>
      </div>

      <p className="text-xs text-stone-500 leading-relaxed pl-2 flex-1">{preview}</p>

      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 pl-2">
          {note.tags.slice(0, 4).map(t => (
            <span key={t} className="inline-flex items-center gap-0.5 text-[10px] font-mono text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              <Hash size={8} />{t}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between pl-2 pt-1 border-t border-stone-100">
        <span className="text-[10px] font-mono text-stone-400">{formatDate(note.updated_at)}</span>
        <span className="text-[10px] font-mono text-stone-300">{note.word_count}w</span>
      </div>
    </div>
  );
}

function DropMenu({ onDelete }: { onDelete: () => void }) {
  return (
    <div className="absolute right-0 top-full mt-1 w-28 rounded-md shadow-lg py-1 z-50"
      style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}>
      <button
        onClick={e => { e.stopPropagation(); onDelete(); }}
        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
      >
        <Trash2 size={12} /> Delete
      </button>
    </div>
  );
}
