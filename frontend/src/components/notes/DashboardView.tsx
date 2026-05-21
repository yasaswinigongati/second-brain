"use client";
import { useQuery } from "@tanstack/react-query";
import { notesApi } from "@/lib/api";
import { useAppStore } from "@/store/appStore";
import { Brain, BookOpen, FolderOpen, Tag, Clock, Plus, MessageSquare } from "lucide-react";
import { formatDate, getNotebookColor, cn } from "@/lib/utils";

export default function DashboardView() {
  const { setActiveView, setSelectedNote, setEditorOpen } = useAppStore();
  const { data: stats, isLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: notesApi.getStats,
  });

  const statCards = [
    { label: "Total Notes",     value: stats?.total_notes ?? 0,     icon: BookOpen,    color: "bg-brain-50 text-brain-600" },
    { label: "Notebooks",       value: stats?.total_notebooks ?? 0,  icon: FolderOpen,  color: "bg-amber-50 text-amber-600" },
    { label: "Tags",            value: stats?.total_tags ?? 0,       icon: Tag,         color: "bg-green-50 text-green-600" },
  ];

  return (
    <div className="flex-1 overflow-auto p-6">
      {/* Welcome */}
      <div className="mb-8">
        <h2 style={{ fontFamily: "Instrument Serif, serif" }} className="text-3xl text-gray-800 mb-1">
          Your Knowledge Base
        </h2>
        <p className="text-sm text-gray-400">Everything you know, organized and searchable.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4">
            <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0", color)}>
              <Icon size={20} />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">{isLoading ? "–" : value}</div>
              <div className="text-xs text-gray-400">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Recent Notes */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock size={15} className="text-gray-400" /> Recent Notes
          </h3>
          <div className="space-y-2">
            {stats?.recent_notes?.map(note => (
              <div
                key={note.id}
                onClick={() => { setSelectedNote(note); setEditorOpen(true); }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{note.title}</p>
                  <p className="text-xs text-gray-400">{formatDate(note.updated_at)}</p>
                </div>
                <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0", getNotebookColor(note.notebook))}>
                  {note.notebook}
                </span>
              </div>
            ))}
            {!isLoading && (stats?.recent_notes?.length ?? 0) === 0 && (
              <p className="text-sm text-gray-400 text-center py-6">No notes yet</p>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-brain-600 to-brain-800 rounded-2xl p-5 text-white">
            <Brain size={24} className="mb-3 opacity-80" />
            <h3 className="font-semibold mb-1">AI Chat</h3>
            <p className="text-xs opacity-70 mb-4">Ask questions grounded in your notes</p>
            <button
              onClick={() => setActiveView("chat")}
              className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare size={14} /> Open Chat
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-gray-800 mb-1 text-sm">New Note</h3>
            <p className="text-xs text-gray-400 mb-4">Capture an idea, meeting, or thought</p>
            <button
              onClick={() => { setSelectedNote(null); setEditorOpen(true); setActiveView("notes"); }}
              className="w-full py-2 bg-brain-50 hover:bg-brain-100 text-brain-700 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={14} /> Create Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
