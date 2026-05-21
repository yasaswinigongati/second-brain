"use client";
import { useAppStore } from "@/store/appStore";
import { useQuery } from "@tanstack/react-query";
import { notesApi } from "@/lib/api";
import { cn, nbDot } from "@/lib/utils";
import {
  Hash, FileText, MessageSquare, Search,
  LayoutGrid, Plus, ChevronDown, Pencil, X,
} from "lucide-react";
import { useState } from "react";

export default function Sidebar() {
  const {
    activeView, setActiveView,
    activeNotebook, setActiveNotebook,
    activeTag, setActiveTag,
    sidebarOpen, setSidebarOpen,
    setEditorOpen, setSelectedNote,
  } = useAppStore();

  const [nbOpen,   setNbOpen]   = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);

  const { data: notebooks = [] } = useQuery({ queryKey: ["notebooks"], queryFn: notesApi.getNotebooks });
  const { data: tags = [] }      = useQuery({ queryKey: ["tags"],      queryFn: notesApi.getTags });
  const { data: stats }          = useQuery({ queryKey: ["stats"],     queryFn: notesApi.getStats });

  if (!sidebarOpen) return null;

  const nav = [
    { id: "dashboard" as const, label: "Overview",  icon: LayoutGrid },
    { id: "notes"     as const, label: "Notes",      icon: FileText },
    { id: "search"    as const, label: "Search",      icon: Search },
    { id: "chat"      as const, label: "Ask AI",      icon: MessageSquare },
  ];

  return (
    <aside
      className="fixed left-0 top-0 h-full flex flex-col z-20 select-none"
      style={{
        width: 252,
        background: "var(--c-sidebar)",
        borderRight: "1px solid #292524",
      }}
    >
      {/* Wordmark */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-sm font-medium text-stone-100 tracking-tight">
              brain<span style={{ color: "var(--c-accent)" }}>.</span>
            </span>
            <span className="text-[10px] text-stone-600 font-mono">v0.1</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              title="New note"
              onClick={() => { setSelectedNote(null); setEditorOpen(true); setActiveView("notes"); }}
              className="w-6 h-6 rounded flex items-center justify-center text-stone-500 hover:text-stone-200 hover:bg-stone-700 transition-colors"
            >
              <Pencil size={12} />
            </button>
            <button
              title="Close sidebar"
              onClick={() => setSidebarOpen(false)}
              className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:text-stone-300 hover:bg-stone-700 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        </div>
        <p className="mt-2.5 text-[11px] text-stone-600 font-mono">
          {stats?.total_notes ?? "–"} notes · {stats?.total_notebooks ?? "–"} notebooks
        </p>
      </div>

      <div className="mx-4 border-t border-stone-800" />

      {/* Nav links */}
      <nav className="px-2 pt-2.5 space-y-0.5">
        {nav.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setActiveView(id); setActiveNotebook(null); setActiveTag(null); }}
            className={cn("sidebar-link", activeView === id && "active")}
          >
            <Icon size={13} strokeWidth={1.75} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="mx-4 border-t border-stone-800 mt-2.5" />

      {/* Scrollable section */}
      <div className="flex-1 overflow-y-auto px-2 pt-2.5">
        {/* Notebooks */}
        <button
          onClick={() => setNbOpen(v => !v)}
          className="sidebar-link hover:bg-transparent mb-0.5"
          style={{ color: "#57534E", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}
        >
          <ChevronDown size={10} style={{ transition: "transform 0.15s", transform: nbOpen ? "none" : "rotate(-90deg)" }} />
          Notebooks
        </button>

        {nbOpen && (
          <div className="space-y-0.5 mb-3">
            <button
              onClick={() => { setActiveNotebook(null); setActiveView("notes"); }}
              className={cn("sidebar-link", !activeNotebook && activeView === "notes" && "active")}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-stone-600 flex-shrink-0" />
              All notes
            </button>
            {notebooks.map(nb => (
              <button
                key={nb}
                onClick={() => { setActiveNotebook(nb); setActiveView("notes"); }}
                className={cn("sidebar-link", activeNotebook === nb && "active")}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", nbDot(nb))} />
                {nb}
              </button>
            ))}
          </div>
        )}

        {/* Tags */}
        <button
          onClick={() => setTagsOpen(v => !v)}
          className="sidebar-link hover:bg-transparent mb-0.5"
          style={{ color: "#57534E", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}
        >
          <ChevronDown size={10} style={{ transition: "transform 0.15s", transform: tagsOpen ? "none" : "rotate(-90deg)" }} />
          Tags
        </button>

        {tagsOpen && (
          <div className="flex flex-wrap gap-1 px-1 pb-4">
            {tags.slice(0, 30).map(tag => (
              <button
                key={tag}
                onClick={() => { setActiveTag(tag); setActiveView("notes"); }}
                className={cn(
                  "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors",
                  activeTag === tag
                    ? "text-amber-300 bg-stone-700"
                    : "text-stone-600 hover:text-stone-300 hover:bg-stone-800"
                )}
              >
                <Hash size={9} />{tag}
              </button>
            ))}
            {tags.length === 0 && (
              <span className="text-[11px] text-stone-700 font-mono px-1">no tags yet</span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2.5 border-t border-stone-800">
        <button
          onClick={() => { setSelectedNote(null); setEditorOpen(true); setActiveView("notes"); }}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded text-xs font-medium transition-colors text-stone-500 hover:text-stone-200 hover:bg-stone-800 border border-stone-800"
        >
          <Plus size={12} /> New note
        </button>
      </div>
    </aside>
  );
}
