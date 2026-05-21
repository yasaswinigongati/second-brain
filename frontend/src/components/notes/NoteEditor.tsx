"use client";
import { useAppStore } from "@/store/appStore";
import { useState, useEffect, useRef, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notesApi } from "@/lib/api";
import { Note } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  X, Sparkles, Eye, Edit3, Tag, FolderOpen,
  Save, Loader2, Wand2, ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const NOTEBOOKS = ["Default", "Work", "Personal", "Research", "Ideas", "Learning"];

export default function NoteEditor() {
  const { isEditorOpen, setEditorOpen, selectedNote, addNote, updateNote } = useAppStore();
  const qc = useQueryClient();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [notebook, setNotebook] = useState("Default");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [preview, setPreview] = useState(false);
  const [notebookOpen, setNotebookOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditorOpen) {
      if (selectedNote) {
        setTitle(selectedNote.title);
        setContent(selectedNote.content);
        setNotebook(selectedNote.notebook);
        setTags(selectedNote.tags);
      } else {
        setTitle(""); setContent(""); setNotebook("Default"); setTags([]);
      }
      setPreview(false);
    }
  }, [isEditorOpen, selectedNote]);

  const autoTagMutation = useMutation({
    mutationFn: () => notesApi.autoTag(title, content),
    onSuccess: (res) => {
      setTags(res.tags);
      setNotebook(res.suggested_notebook);
      toast.success("AI tags applied!");
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { title, content, notebook, tags };
      if (selectedNote) return notesApi.update(selectedNote.id, payload);
      return notesApi.create(payload);
    },
    onSuccess: (note: Note) => {
      if (selectedNote) updateNote(note);
      else addNote(note);
      qc.invalidateQueries({ queryKey: ["notes"] });
      qc.invalidateQueries({ queryKey: ["notebooks"] });
      qc.invalidateQueries({ queryKey: ["tags"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      toast.success(selectedNote ? "Note updated!" : "Note created!");
      setEditorOpen(false);
    },
    onError: () => toast.error("Failed to save note. Check backend connection."),
  });

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") {
      e.preventDefault();
      if (title && content) saveMutation.mutate();
    }
    if (e.key === "Escape") setEditorOpen(false);
  }, [title, content, saveMutation, setEditorOpen]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !tags.includes(t)) setTags(prev => [...prev, t]);
    setTagInput("");
  };

  if (!isEditorOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
      onKeyDown={handleKeyDown}
    >
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-3xl max-h-[90vh] animate-in overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100">
          {/* Notebook picker */}
          <div className="relative">
            <button
              onClick={() => setNotebookOpen(v => !v)}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
            >
              <FolderOpen size={12} /> {notebook} <ChevronDown size={11} />
            </button>
            {notebookOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-10 min-w-36">
                {NOTEBOOKS.map(nb => (
                  <button key={nb} onClick={() => { setNotebook(nb); setNotebookOpen(false); }}
                    className={cn("w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50", notebook === nb && "text-brain-600 font-medium")}>
                    {nb}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1" />

          {/* AI Auto-tag */}
          <button
            onClick={() => autoTagMutation.mutate()}
            disabled={!title || !content || autoTagMutation.isPending}
            className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg transition-colors disabled:opacity-40"
          >
            {autoTagMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
            AI Tag
          </button>

          {/* Preview toggle */}
          <button
            onClick={() => setPreview(v => !v)}
            className={cn(
              "flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg transition-colors",
              preview ? "bg-brain-50 text-brain-700" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {preview ? <Edit3 size={12} /> : <Eye size={12} />}
            {preview ? "Edit" : "Preview"}
          </button>

          {/* Save */}
          <button
            onClick={() => saveMutation.mutate()}
            disabled={!title || !content || saveMutation.isPending}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-brain-600 hover:bg-brain-700 text-white rounded-lg font-medium transition-colors disabled:opacity-40"
          >
            {saveMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
            Save
          </button>

          <button onClick={() => setEditorOpen(false)} className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Note title…"
          className="px-6 pt-5 pb-2 text-xl font-semibold text-gray-900 placeholder-gray-300 outline-none border-none w-full"
          style={{ fontFamily: "Instrument Serif, serif" }}
          autoFocus
        />

        {/* Content */}
        <div className="flex-1 overflow-auto px-6 pb-4 min-h-0">
          {preview ? (
            <div className="prose-note pt-2 pb-6">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "*Nothing to preview*"}</ReactMarkdown>
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={"Start writing… (Markdown supported)\n\n# Heading\n**bold**, *italic*, `code`\n- bullet lists\n> blockquotes"}
              className="note-editor h-full min-h-64"
            />
          )}
        </div>

        {/* Tags */}
        <div className="px-6 pb-4 border-t border-gray-50 pt-3 flex flex-wrap items-center gap-2">
          <Tag size={13} className="text-gray-400 flex-shrink-0" />
          {tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 text-xs bg-brain-50 text-brain-700 px-2 py-1 rounded-full">
              #{tag}
              <button onClick={() => setTags(t => t.filter(x => x !== tag))} className="hover:text-brain-900 ml-0.5">
                <X size={10} />
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
            placeholder="Add tag…"
            className="text-xs outline-none border-none bg-transparent text-gray-600 placeholder-gray-300 min-w-20"
          />
        </div>

        <div className="px-6 pb-3">
          <p className="text-[10px] text-gray-300">⌘S to save · ESC to close · Markdown supported</p>
        </div>
      </div>
    </div>
  );
}
