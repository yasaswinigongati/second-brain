"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { notesApi } from "@/lib/api";
import { NoteSearchResult } from "@/types";
import { useAppStore } from "@/store/appStore";
import { Search, Loader2 } from "lucide-react";
import { formatDate, truncate, stripMarkdown, nbDot, cn } from "@/lib/utils";

export default function SearchView() {
  const [q, setQ]             = useState("");
  const [results, setResults] = useState<NoteSearchResult[]>([]);
  const { setSelectedNote, setEditorOpen } = useAppStore();

  const mut = useMutation({
    mutationFn: (query: string) => notesApi.search(query, 10),
    onSuccess: setResults,
  });

  const submit = (e: React.FormEvent) => { e.preventDefault(); if (q.trim()) mut.mutate(q.trim()); };

  return (
    <div className="flex-1 overflow-auto p-6 max-w-2xl mx-auto w-full">
      <div className="mb-6">
        <h2 className="font-serif text-2xl text-stone-700 mb-0.5">Search</h2>
        <p className="text-xs font-mono text-stone-400">semantic — finds by meaning, not keyword</p>
      </div>

      <form onSubmit={submit} className="flex gap-2 mb-8">
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="what do you remember writing about…"
          className="flex-1 px-3 py-2 text-sm rounded-lg outline-none transition-all font-mono"
          style={{
            background: "var(--c-surface)",
            border: "1px solid var(--c-border2)",
            color: "var(--c-text)",
          }}
          autoFocus
        />
        <button
          type="submit"
          disabled={!q.trim() || mut.isPending}
          className="px-4 py-2 text-xs font-medium rounded-lg text-white disabled:opacity-40 transition-colors flex items-center gap-1.5"
          style={{ background: "var(--c-accent)" }}
        >
          {mut.isPending ? <Loader2 size={13} className="animate-spin" /> : <Search size={13} />}
          Search
        </button>
      </form>

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-[11px] font-mono text-stone-400 mb-3">{results.length} results</p>
          {results.map(({ note, score, matched_chunks }) => (
            <div
              key={note.id}
              onClick={() => { setSelectedNote(note); setEditorOpen(true); }}
              className="p-4 rounded-lg cursor-pointer transition-all hover:shadow-sm fade-up"
              style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", nbDot(note.notebook))} />
                <h3 className="text-sm font-semibold text-stone-800 flex-1">{note.title}</h3>
                <span className="text-[10px] font-mono text-stone-300">{Math.round((1 - score) * 100)}% match</span>
              </div>
              {matched_chunks[0] && (
                <p className="text-xs text-stone-500 font-mono leading-relaxed px-3 py-2 rounded mb-2"
                  style={{ background: "#FAF7F2", borderLeft: "2px solid var(--c-accent)" }}>
                  {truncate(stripMarkdown(matched_chunks[0]), 200)}
                </p>
              )}
              <p className="text-[10px] font-mono text-stone-400">{formatDate(note.updated_at)} · {note.word_count}w</p>
            </div>
          ))}
        </div>
      )}

      {mut.isSuccess && results.length === 0 && (
        <p className="text-sm text-stone-400 text-center py-12 font-mono">no results — try rephrasing</p>
      )}

      {!mut.isSuccess && !mut.isPending && (
        <div className="text-center py-16">
          <p className="font-mono text-stone-300 text-sm">start typing to search your notes</p>
        </div>
      )}
    </div>
  );
}
