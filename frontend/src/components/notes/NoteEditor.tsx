"use client";
import { useAppStore } from "@/store/appStore";
import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { notesApi } from "@/lib/api";
import { Note } from "@/types";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { X, Wand2, Eye, Code2, Hash, Loader2, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

const NOTEBOOKS = ["Default","Work","Personal","Research","Ideas","Learning"];

export default function NoteEditor() {
  const { isEditorOpen, setEditorOpen, selectedNote, addNote, updateNote } = useAppStore();
  const qc = useQueryClient();

  const [title, setTitle]       = useState("");
  const [content, setContent]   = useState("");
  const [notebook, setNotebook] = useState("Default");
  const [tags, setTags]         = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [preview, setPreview]   = useState(false);
  const [nbOpen, setNbOpen]     = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!isEditorOpen) return;
    if (selectedNote) {
      setTitle(selectedNote.title);
      setContent(selectedNote.content);
      setNotebook(selectedNote.notebook);
      setTags(selectedNote.tags);
    } else {
      setTitle(""); setContent(""); setNotebook("Default"); setTags([]);
    }
    setPreview(false);
    setTimeout(() => textareaRef.current?.focus(), 80);
  }, [isEditorOpen, selectedNote]);

  const autoTagMut = useMutation({
    mutationFn: () => notesApi.autoTag(title, content),
    onSuccess: r => { setTags(r.tags); setNotebook(r.suggested_notebook); toast.success("Tags applied"); },
    onError:   () => toast.error("Auto-tag failed — check API key"),
  });

  const saveMut = useMutation({
    mutationFn: async () => {
      const body = { title, content, notebook, tags };
      return selectedNote ? notesApi.update(selectedNote.id, body) : notesApi.create(body);
    },
    onSuccess: (note: Note) => {
      selectedNote ? updateNote(note) : addNote(note);
      ["notes","stats","notebooks","tags"].forEach(k => qc.invalidateQueries({ queryKey: [k] }));
      toast.success(selectedNote ? "Saved" : "Created");
      setEditorOpen(false);
    },
    onError: () => toast.error("Save failed — is the backend running?"),
  });

  const addTag = () => {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !tags.includes(t)) setTags(p => [...p, t]);
    setTagInput("");
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "s") { e.preventDefault(); if (title && content) saveMut.mutate(); }
    if (e.key === "Escape") setEditorOpen(false);
  };

  if (!isEditorOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-6"
      style={{ background: "rgba(28,25,23,0.6)", backdropFilter: "blur(4px)" }}
      onKeyDown={handleKey}
    >
      <div
        className="flex flex-col w-full max-w-2xl fade-up"
        style={{
          background: "var(--c-surface)",
          border: "1px solid var(--c-border2)",
          borderRadius: 10,
          maxHeight: "88vh",
          boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
        }}
      >
        {/* Top bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b" style={{ borderColor: "var(--c-border)" }}>
          {/* Notebook dropdown */}
          <div className="relative">
            <button
              onClick={() => setNbOpen(v => !v)}
              className="flex items-center gap-1 text-xs px-2 py-1 rounded text-stone-500 hover:bg-stone-100 hover:text-stone-700 transition-colors"
            >
              {notebook} <ChevronDown size={11} />
            </button>
            {nbOpen && (
              <div className="absolute top-full left-0 mt-1 z-10 rounded-md shadow-lg py-1 w-36"
                style={{ background: "var(--c-surface)", border: "1px solid var(--c-border2)" }}>
                {NOTEBOOKS.map(nb => (
                  <button key={nb} onClick={() => { setNotebook(nb); setNbOpen(false); }}
                    className={cn("w-full text-left px-3 py-1.5 text-xs hover:bg-stone-50 transition-colors",
                      notebook === nb ? "font-medium" : "text-stone-600")}
                    style={notebook === nb ? { color: "var(--c-accent)" } : undefined}>
                    {nb}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1" />

          {/* AI tag */}
          <button
            onClick={() => autoTagMut.mutate()}
            disabled={!title || !content || autoTagMut.isPending}
            title="Auto-tag with AI"
            className="accent-soft-btn flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors"
          >
            {autoTagMut.isPending ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
            AI tag
          </button>

          {/* Preview */}
          <button
            onClick={() => setPreview(v => !v)}
            className={cn(
              "flex items-center gap-1 px-2 py-1 text-xs rounded transition-colors",
              preview ? "text-stone-700 bg-stone-100" : "text-stone-400 hover:text-stone-600 hover:bg-stone-50"
            )}
          >
            {preview ? <Code2 size={12} /> : <Eye size={12} />}
            {preview ? "Edit" : "Preview"}
          </button>

          {/* Save */}
          <button
            onClick={() => saveMut.mutate()}
            disabled={!title || !content || saveMut.isPending}
            className="flex items-center gap-1 px-3 py-1 text-xs font-medium rounded text-white disabled:opacity-40 transition-colors"
            style={{ background: "var(--c-accent)" }}
          >
            {saveMut.isPending ? <Loader2 size={12} className="animate-spin" /> : null}
            Save
          </button>

          <button onClick={() => setEditorOpen(false)} className="p-1 text-stone-400 hover:text-stone-700 rounded hover:bg-stone-100">
            <X size={15} />
          </button>
        </div>

        {/* Title */}
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Note title"
          className="px-5 pt-4 pb-1 text-xl font-semibold text-stone-900 placeholder-stone-300 outline-none border-none bg-transparent"
          style={{ fontFamily: "Lora, serif" }}
        />

        {/* Content */}
        <div className="flex-1 overflow-auto px-5 py-3 min-h-0">
          {preview ? (
            <div className="prose-note pb-4">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{content || "*Nothing to preview*"}</ReactMarkdown>
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder={"Write in markdown...\n\n## Heading\n**bold** _italic_ `code`\n- list items\n> quotes"}
              className="note-editor"
              style={{ minHeight: 280 }}
            />
          )}
        </div>

        {/* Tags */}
        <div className="px-5 py-2.5 border-t flex flex-wrap items-center gap-1.5" style={{ borderColor: "var(--c-border)" }}>
          <Hash size={12} className="text-stone-400 flex-shrink-0" />
          {tags.map(t => (
            <span key={t} className="tag-pill inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded-full">
              {t}
              <button onClick={() => setTags(p => p.filter(x => x !== t))} className="tag-pill-btn">
                <X size={9} />
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addTag(); } }}
            placeholder="add tag…"
            className="text-[11px] font-mono outline-none border-none bg-transparent text-stone-500 placeholder-stone-300 min-w-16"
          />
        </div>

        <div className="px-5 py-1.5 border-t" style={{ borderColor: "var(--c-border)" }}>
          <p className="text-[10px] font-mono text-stone-300">
            <kbd>⌘S</kbd> save · <kbd>Esc</kbd> close · markdown supported
          </p>
        </div>
      </div>
    </div>
  );
}
