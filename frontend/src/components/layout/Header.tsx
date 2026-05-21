"use client";
import { useAppStore } from "@/store/appStore";
import { Grid2x2, List, Plus, SidebarOpen } from "lucide-react";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  dashboard: "Overview",
  notes:     "Notes",
  chat:      "Ask AI",
  search:    "Search",
};

export default function Header() {
  const {
    activeView, sidebarOpen, setSidebarOpen,
    viewMode, setViewMode,
    setEditorOpen, setSelectedNote,
    activeNotebook, activeTag,
  } = useAppStore();

  const crumb = activeNotebook ?? (activeTag ? `#${activeTag}` : null);

  return (
    <header
      className="h-11 flex items-center px-5 gap-3 flex-shrink-0"
      style={{
        borderBottom: "1px solid var(--c-border)",
        background: "var(--c-surface)",
      }}
    >
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-stone-400 hover:text-stone-700 p-1 -ml-1 rounded transition-colors"
        >
          <SidebarOpen size={16} />
        </button>
      )}

      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <span className="text-sm font-medium text-stone-800">{LABELS[activeView]}</span>
        {crumb && (
          <>
            <span className="text-stone-300">/</span>
            <span className="text-sm text-stone-500 truncate">{crumb}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        {activeView === "notes" && (
          <>
            <div className="flex items-center border border-stone-200 rounded overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 transition-colors",
                  viewMode === "grid" ? "bg-stone-100 text-stone-700" : "text-stone-400 hover:text-stone-600"
                )}
              >
                <Grid2x2 size={13} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 transition-colors",
                  viewMode === "list" ? "bg-stone-100 text-stone-700" : "text-stone-400 hover:text-stone-600"
                )}
              >
                <List size={13} />
              </button>
            </div>
            <button
              onClick={() => { setSelectedNote(null); setEditorOpen(true); }}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded transition-colors text-white"
              style={{ background: "var(--c-accent)" }}
            >
              <Plus size={13} /> Note
            </button>
          </>
        )}
      </div>
    </header>
  );
}
