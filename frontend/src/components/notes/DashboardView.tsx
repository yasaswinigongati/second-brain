"use client";
import { useQuery } from "@tanstack/react-query";
import { notesApi } from "@/lib/api";
import { useAppStore } from "@/store/appStore";
import { formatDate, nbDot, cn } from "@/lib/utils";
import { Pencil, MessageSquare, Search } from "lucide-react";

export default function DashboardView() {
  const { setActiveView, setSelectedNote, setEditorOpen } = useAppStore();
  const { data: stats, isLoading } = useQuery({ queryKey: ["stats"], queryFn: notesApi.getStats });

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="flex-1 overflow-auto p-6 max-w-3xl mx-auto w-full">
      {/* Greeting */}
      <div className="mb-8 mt-2">
        <h2 className="font-serif text-3xl text-stone-700 font-medium">{greeting}.</h2>
        <p className="text-sm text-stone-400 mt-1">
          {isLoading ? "Loading…" : `${stats?.total_notes ?? 0} notes across ${stats?.total_notebooks ?? 0} notebooks`}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "notes",     val: stats?.total_notes ?? 0 },
          { label: "notebooks", val: stats?.total_notebooks ?? 0 },
          { label: "tags",      val: stats?.total_tags ?? 0 },
        ].map(({ label, val }) => (
          <div key={label} className="p-4 rounded-lg" style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}>
            <p className="font-mono text-2xl font-medium text-stone-800">{isLoading ? "–" : val}</p>
            <p className="text-xs text-stone-400 mt-0.5 font-mono">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { label: "New note",   icon: Pencil,       fn: () => { setSelectedNote(null); setEditorOpen(true); setActiveView("notes"); }, accent: true },
          { label: "Ask AI",     icon: MessageSquare, fn: () => setActiveView("chat"), accent: false },
          { label: "Search",     icon: Search,        fn: () => setActiveView("search"), accent: false },
        ].map(({ label, icon: Icon, fn, accent }) => (
          <button
            key={label}
            onClick={fn}
            className="flex items-center gap-2 p-3.5 rounded-lg text-sm font-medium transition-all hover:scale-[1.01]"
            style={accent
              ? { background: "var(--c-accent)", color: "#fff", border: "1px solid var(--c-accent2)" }
              : { background: "var(--c-surface)", color: "var(--c-muted)", border: "1px solid var(--c-border)" }
            }
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* Recent notes */}
      <div>
        <p className="text-xs font-mono text-stone-400 uppercase tracking-wider mb-3">Recently edited</p>
        <div className="rounded-lg overflow-hidden" style={{ border: "1px solid var(--c-border)" }}>
          {isLoading && (
            <div className="p-4 text-sm text-stone-400">Loading…</div>
          )}
          {stats?.recent_notes?.map((note, i) => (
            <button
              key={note.id}
              onClick={() => { setSelectedNote(note); setEditorOpen(true); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-stone-50 transition-colors"
              style={{ borderTop: i > 0 ? "1px solid var(--c-border)" : "none", background: "var(--c-surface)" }}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", nbDot(note.notebook))} />
              <span className="flex-1 text-sm text-stone-700 truncate">{note.title}</span>
              <span className="text-[11px] font-mono text-stone-400 flex-shrink-0">{formatDate(note.updated_at)}</span>
            </button>
          ))}
          {!isLoading && (stats?.recent_notes?.length ?? 0) === 0 && (
            <p className="px-4 py-6 text-sm text-stone-400 text-center" style={{ background: "var(--c-surface)" }}>
              No notes yet — write something.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
