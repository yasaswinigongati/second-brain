"use client";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { notesApi } from "@/lib/api";
import { NoteSearchResult } from "@/types";
import { useAppStore } from "@/store/appStore";
import { Search, Loader2, FileText, Zap } from "lucide-react";
import { formatDate, stripMarkdown, truncate, getNotebookColor, cn } from "@/lib/utils";

export default function SearchView() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NoteSearchResult[]>([]);
  const { setSelectedNote, setEditorOpen } = useAppStore();

  const searchMutation = useMutation({
    mutationFn: (q: string) => notesApi.search(q, 12),
    onSuccess: setResults,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) searchMutation.mutate(query.trim());
  };

  return (
    <div className="flex-1 overflow-auto p-6 max-w-3xl mx-auto w-full">
      <div className="mb-6">
        <h2 style={{ fontFamily: "Instrument Serif, serif" }} className="text-2xl text-gray-800 mb-1">
          Semantic Search
        </h2>
        <p className="text-sm text-gray-400">Search by meaning, not just keywords — powered by embeddings</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 mb-8">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Ask anything about your notes…"
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-brain-400 focus:ring-2 focus:ring-brain-100 transition-all"
            autoFocus
          />
        </div>
        <button
          type="submit"
          disabled={!query.trim() || searchMutation.isPending}
          className="px-5 py-3 bg-brain-600 hover:bg-brain-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {searchMutation.isPending ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
          Search
        </button>
      </form>

      {results.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{results.length} results</p>
          {results.map(({ note, score, matched_chunks }) => (
            <div
              key={note.id}
              onClick={() => { setSelectedNote(note); setEditorOpen(true); }}
              className="bg-white border border-gray-100 rounded-2xl p-4 hover:border-brain-200 hover:shadow-sm transition-all cursor-pointer animate-in"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <FileText size={14} className="text-brain-400 flex-shrink-0" />
                  <h3 className="font-semibold text-gray-900 text-sm">{note.title}</h3>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", getNotebookColor(note.notebook))}>
                    {note.notebook}
                  </span>
                  <span className="text-xs text-gray-300 bg-gray-50 px-2 py-0.5 rounded-full">
                    {Math.round((1 - score) * 100)}% match
                  </span>
                </div>
              </div>
              {matched_chunks[0] && (
                <p className="text-xs text-gray-500 leading-relaxed bg-brain-50 rounded-lg px-3 py-2 mb-2">
                  "…{truncate(stripMarkdown(matched_chunks[0]), 200)}…"
                </p>
              )}
              <p className="text-[11px] text-gray-400">{formatDate(note.updated_at)} · {note.word_count} words</p>
            </div>
          ))}
        </div>
      )}

      {searchMutation.isSuccess && results.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">No matching notes found. Try a different query or add more notes.</p>
        </div>
      )}

      {!searchMutation.isSuccess && !searchMutation.isPending && (
        <div className="text-center py-16 text-gray-300">
          <Search size={40} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Type something to search your knowledge base</p>
        </div>
      )}
    </div>
  );
}
