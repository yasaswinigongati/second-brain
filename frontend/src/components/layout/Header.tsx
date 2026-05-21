"use client";
import { useAppStore } from "@/store/appStore";
import { Menu, Grid2x2, List, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const viewLabels: Record<string, string> = {
  dashboard: "Dashboard",
  notes: "Notes",
  chat: "AI Chat",
  search: "Search",
};

export default function Header() {
  const {
    activeView, sidebarOpen, setSidebarOpen,
    viewMode, setViewMode,
    setEditorOpen, setSelectedNote,
    activeNotebook, activeTag,
  } = useAppStore();

  const subtitle = activeNotebook
    ? `Notebook: ${activeNotebook}`
    : activeTag
    ? `Tag: #${activeTag}`
    : null;

  return (
    <header
      className="h-14 bg-white border-b border-gray-100 flex items-center px-5 gap-4 flex-shrink-0 z-10"
    >
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-gray-500 hover:text-gray-800 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Menu size={18} />
        </button>
      )}

      <div className="flex-1">
        <h1
          className="font-medium text-gray-900 leading-none"
          style={{ fontFamily: "Instrument Serif, serif", fontSize: "1.15rem" }}
        >
          {viewLabels[activeView] ?? "Notes"}
        </h1>
        {subtitle && (
          <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="flex items-center gap-2">
        {activeView === "notes" && (
          <>
            <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === "grid" ? "bg-white shadow-sm text-gray-800" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <Grid2x2 size={15} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-1.5 rounded-md transition-colors",
                  viewMode === "list" ? "bg-white shadow-sm text-gray-800" : "text-gray-400 hover:text-gray-600"
                )}
              >
                <List size={15} />
              </button>
            </div>
            <button
              onClick={() => { setSelectedNote(null); setEditorOpen(true); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-brain-600 hover:bg-brain-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={15} />
              New
            </button>
          </>
        )}
      </div>
    </header>
  );
}
