"use client";
import { useAppStore } from "@/store/appStore";
import { useQuery } from "@tanstack/react-query";
import { notesApi } from "@/lib/api";
import { cn, getNotebookColor } from "@/lib/utils";
import {
  Brain, BookOpen, MessageSquare, Search, LayoutDashboard,
  ChevronDown, ChevronRight, Plus, Tag, FolderOpen, X
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

  const [notebooksOpen, setNotebooksOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);

  const { data: notebooks = [] } = useQuery({
    queryKey: ["notebooks"],
    queryFn: notesApi.getNotebooks,
  });
  const { data: tags = [] } = useQuery({
    queryKey: ["tags"],
    queryFn: notesApi.getTags,
  });

  const navItems = [
    { id: "dashboard" as const, label: "Dashboard",  icon: LayoutDashboard },
    { id: "notes"     as const, label: "All Notes",   icon: BookOpen },
    { id: "chat"      as const, label: "AI Chat",     icon: MessageSquare },
    { id: "search"    as const, label: "Search",       icon: Search },
  ];

  if (!sidebarOpen) return null;

  return (
    <aside
      className="fixed left-0 top-0 h-full bg-white border-r border-gray-100 flex flex-col z-20 shadow-sm"
      style={{ width: 260 }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brain-500 to-brain-700 flex items-center justify-center shadow-sm">
            <Brain size={16} className="text-white" />
          </div>
          <span style={{ fontFamily: "Instrument Serif, serif" }} className="text-lg text-gray-900">
            Second Brain
          </span>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-50">
          <X size={15} />
        </button>
      </div>

      {/* New Note */}
      <div className="px-4 py-3">
        <button
          onClick={() => { setSelectedNote(null); setEditorOpen(true); setActiveView("notes"); }}
          className="w-full flex items-center gap-2 px-3 py-2.5 bg-brain-600 hover:bg-brain-700 text-white rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus size={16} />
          New Note
        </button>
      </div>

      {/* Nav */}
      <nav className="px-3 space-y-0.5">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setActiveView(id); setActiveNotebook(null); setActiveTag(null); }}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors text-left",
              activeView === id
                ? "bg-brain-50 text-brain-700 font-medium"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <Icon size={16} className={activeView === id ? "text-brain-600" : "text-gray-400"} />
            {label}
          </button>
        ))}
      </nav>

      {/* Divider */}
      <div className="mx-4 my-3 border-t border-gray-100" />

      <div className="flex-1 overflow-y-auto px-3 space-y-4 pb-4">
        {/* Notebooks */}
        <div>
          <button
            onClick={() => setNotebooksOpen(v => !v)}
            className="w-full flex items-center justify-between px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600"
          >
            <span className="flex items-center gap-1.5"><FolderOpen size={11} />Notebooks</span>
            {notebooksOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          </button>
          {notebooksOpen && (
            <div className="mt-1 space-y-0.5">
              <button
                onClick={() => { setActiveNotebook(null); setActiveView("notes"); }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors text-left",
                  !activeNotebook ? "bg-gray-100 text-gray-800 font-medium" : "text-gray-600 hover:bg-gray-50"
                )}
              >
                All Notebooks
              </button>
              {notebooks.map((nb) => (
                <button
                  key={nb}
                  onClick={() => { setActiveNotebook(nb); setActiveView("notes"); }}
                  className={cn(
                    "w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors text-left",
                    activeNotebook === nb ? "bg-brain-50 text-brain-700 font-medium" : "text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <span className={cn("w-2 h-2 rounded-full flex-shrink-0", getNotebookColor(nb).split(" ")[0])} />
                  {nb}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tags */}
        <div>
          <button
            onClick={() => setTagsOpen(v => !v)}
            className="w-full flex items-center justify-between px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600"
          >
            <span className="flex items-center gap-1.5"><Tag size={11} />Tags</span>
            {tagsOpen ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
          </button>
          {tagsOpen && (
            <div className="mt-1 flex flex-wrap gap-1.5 px-1">
              {tags.slice(0, 20).map((tag) => (
                <button
                  key={tag}
                  onClick={() => { setActiveTag(tag); setActiveView("notes"); }}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-xs transition-colors",
                    activeTag === tag
                      ? "bg-brain-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-brain-50 hover:text-brain-700"
                  )}
                >
                  #{tag}
                </button>
              ))}
              {tags.length === 0 && (
                <p className="text-xs text-gray-400 px-1">No tags yet</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-400 text-center">Powered by LangChain + ChromaDB</p>
      </div>
    </aside>
  );
}
