"use client";
import { useState, useRef, useEffect } from "react";
import { chatApi } from "@/lib/api";
import { ChatMessage, Note } from "@/types";
import { useAppStore } from "@/store/appStore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Send, Loader2, FileText, RotateCcw } from "lucide-react";

const STARTERS = [
  "Summarize what I know about AI",
  "What's in my Research notebook?",
  "What were my latest ideas?",
];

export default function ChatView() {
  const [msgs, setMsgs]       = useState<ChatMessage[]>([]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const [srcMap, setSrcMap]   = useState<Record<number, Note[]>>({});
  const [followUps, setFU]    = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const { setSelectedNote, setEditorOpen } = useAppStore();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, loading]);

  const send = async (text: string) => {
    const userMsg: ChatMessage = { role: "user", content: text };
    const next = [...msgs, userMsg];
    setMsgs(next); setInput(""); setFU([]); setLoading(true);
    try {
      const res = await chatApi.send(text, msgs);
      setMsgs([...next, { role: "assistant", content: res.message }]);
      setSrcMap(p => ({ ...p, [next.length]: res.sources }));
      setFU(res.follow_up_questions ?? []);
    } catch {
      setMsgs([...next, { role: "assistant", content: "⚠️ Backend unreachable. Start the FastAPI server on port 8000." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (input.trim()) send(input.trim()); }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "var(--c-bg)" }}>
      {/* Bar */}
      <div className="flex items-center justify-between px-5 py-2.5 border-b" style={{ borderColor: "var(--c-border)", background: "var(--c-surface)" }}>
        <div>
          <span className="text-sm font-medium text-stone-700">AI Chat</span>
          <span className="ml-2 text-[11px] font-mono text-stone-400">grounded in your notes</span>
        </div>
        {msgs.length > 0 && (
          <button
            onClick={() => { setMsgs([]); setSrcMap({}); setFU([]); }}
            className="flex items-center gap-1 text-[11px] font-mono text-stone-400 hover:text-stone-700 px-2 py-1 rounded hover:bg-stone-100 transition-colors"
          >
            <RotateCcw size={11} /> clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-4 py-5 space-y-5">
        {msgs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-5 pb-16 text-center">
            <div>
              <p className="font-serif text-2xl text-stone-400 mb-1">Ask your notes anything.</p>
              <p className="text-xs font-mono text-stone-400">Answers come from your actual notes, not the internet.</p>
            </div>
            <div className="flex flex-col gap-2 w-full max-w-sm">
              {STARTERS.map(s => (
                <button key={s} onClick={() => send(s)}
                  className="text-sm text-left px-4 py-2.5 rounded-lg transition-all hover:shadow-sm font-mono text-stone-500"
                  style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-3 fade-up ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 mt-1 font-mono text-[10px] font-bold text-white"
                style={{ background: "var(--c-accent)" }}>
                AI
              </div>
            )}
            <div className="max-w-xl">
              <div
                className="px-4 py-3 rounded-lg text-sm leading-relaxed"
                style={m.role === "user"
                  ? { background: "var(--c-sidebar)", color: "#D6D3D1" }
                  : { background: "var(--c-surface)", border: "1px solid var(--c-border)", color: "var(--c-text)" }
                }
              >
                {m.role === "assistant"
                  ? <div className="prose-note text-sm"><ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown></div>
                  : m.content
                }
              </div>

              {/* Source notes */}
              {m.role === "assistant" && (srcMap[i - 1]?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {srcMap[i - 1].map(n => (
                    <button key={n.id} onClick={() => { setSelectedNote(n); setEditorOpen(true); }}
                      className="tag-link flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded transition-colors">
                      <FileText size={9} /> {n.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 fade-up">
            <div className="w-6 h-6 rounded flex items-center justify-center flex-shrink-0 font-mono text-[10px] font-bold text-white"
              style={{ background: "var(--c-accent)" }}>
              AI
            </div>
            <div className="px-4 py-3 rounded-lg" style={{ background: "var(--c-surface)", border: "1px solid var(--c-border)" }}>
              <span className="dot-1 inline-block w-1.5 h-1.5 rounded-full mx-0.5" style={{ background: "var(--c-accent)" }} />
              <span className="dot-2 inline-block w-1.5 h-1.5 rounded-full mx-0.5" style={{ background: "var(--c-accent)" }} />
              <span className="dot-3 inline-block w-1.5 h-1.5 rounded-full mx-0.5" style={{ background: "var(--c-accent)" }} />
            </div>
          </div>
        )}

        {/* Follow-ups */}
        {followUps.length > 0 && !loading && (
          <div className="flex flex-wrap gap-2 pl-9">
            {followUps.map(fq => (
              <button key={fq} onClick={() => send(fq)}
                className="text-[11px] font-mono px-2.5 py-1 rounded-full transition-colors text-stone-500 hover:text-stone-800"
                style={{ border: "1px solid var(--c-border2)" }}>
                {fq}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4" style={{ borderTop: "1px solid var(--c-border)", paddingTop: 12 }}>
        <div className="flex items-end gap-2 px-3 py-2.5 rounded-lg transition-all"
          style={{ background: "var(--c-surface)", border: "1px solid var(--c-border2)" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Ask something… (Enter to send)"
            rows={1}
            className="flex-1 resize-none outline-none text-sm bg-transparent font-mono leading-relaxed max-h-28"
            style={{ color: "var(--c-text)" }}
          />
          <button
            onClick={() => { if (input.trim()) send(input.trim()); }}
            disabled={!input.trim() || loading}
            className="p-1.5 rounded text-white disabled:opacity-40 transition-colors flex-shrink-0"
            style={{ background: "var(--c-accent)" }}
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          </button>
        </div>
        <p className="text-[10px] font-mono text-stone-300 mt-1.5 text-center">Shift+Enter for new line</p>
      </div>
    </div>
  );
}
