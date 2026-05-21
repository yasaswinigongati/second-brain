"use client";
import { useState, useRef, useEffect } from "react";
import { chatApi } from "@/lib/api";
import { ChatMessage, Note } from "@/types";
import { useAppStore } from "@/store/appStore";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Brain, Send, Loader2, FileText, User, Sparkles, Trash2 } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export default function ChatView() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sources, setSources] = useState<Record<number, Note[]>>({});
  const [followUps, setFollowUps] = useState<string[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { setSelectedNote, setEditorOpen } = useAppStore();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

  const send = async (text: string) => {
    const userMsg: ChatMessage = { role: "user", content: text };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInput("");
    setFollowUps([]);
    setLoading(true);
    try {
      const res = await chatApi.send(text, messages);
      const assistantMsg: ChatMessage = { role: "assistant", content: res.message };
      setMessages([...nextMessages, assistantMsg]);
      setSources(prev => ({ ...prev, [nextMessages.length]: res.sources }));
      setFollowUps(res.follow_up_questions ?? []);
    } catch {
      setMessages([...nextMessages, { role: "assistant", content: "⚠️ Could not reach the backend. Make sure the FastAPI server is running on port 8000." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (input.trim()) send(input.trim()); }
  };

  return (
    <div className="flex flex-col h-full bg-[#f8f7f4]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brain-500 to-brain-700 flex items-center justify-center">
            <Brain size={15} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">AI Assistant</p>
            <p className="text-[10px] text-gray-400">Grounded in your notes via RAG</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={() => { setMessages([]); setSources({}); setFollowUps([]); }}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">
            <Trash2 size={12} /> Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto px-4 py-6 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brain-100 to-brain-200 flex items-center justify-center">
              <Sparkles size={28} className="text-brain-600" />
            </div>
            <div>
              <h3 style={{ fontFamily: "Instrument Serif, serif" }} className="text-xl text-gray-700 mb-1">Ask your Second Brain</h3>
              <p className="text-sm text-gray-400 max-w-sm">I'll answer questions using your actual notes as context, powered by RAG.</p>
            </div>
            <div className="grid grid-cols-1 gap-2 max-w-sm w-full mt-2">
              {["Summarize my recent notes", "What are my key ideas about AI?", "What did I capture last week?"].map(q => (
                <button key={q} onClick={() => send(q)}
                  className="text-sm text-left px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-brain-300 hover:bg-brain-50 text-gray-600 transition-colors">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-3 animate-in", msg.role === "user" ? "justify-end" : "justify-start")}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-brain-500 to-brain-700 flex items-center justify-center flex-shrink-0 mt-1">
                <Brain size={13} className="text-white" />
              </div>
            )}
            <div className={cn("max-w-2xl", msg.role === "user" ? "order-first" : "")}>
              <div className={cn(
                "rounded-2xl px-4 py-3 text-sm",
                msg.role === "user"
                  ? "bg-brain-600 text-white rounded-br-sm"
                  : "bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm"
              )}>
                {msg.role === "assistant" ? (
                  <div className="prose-note">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                  </div>
                ) : msg.content}
              </div>

              {/* Source notes */}
              {msg.role === "assistant" && sources[i - 1]?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {sources[i - 1].map(note => (
                    <button key={note.id} onClick={() => { setSelectedNote(note); setEditorOpen(true); }}
                      className="flex items-center gap-1 text-[11px] px-2 py-1 bg-brain-50 text-brain-700 rounded-lg hover:bg-brain-100 transition-colors">
                      <FileText size={10} /> {note.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-7 h-7 rounded-xl bg-gray-200 flex items-center justify-center flex-shrink-0 mt-1">
                <User size={13} className="text-gray-600" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 animate-in">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-brain-500 to-brain-700 flex items-center justify-center flex-shrink-0">
              <Brain size={13} className="text-white" />
            </div>
            <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <span className="dot-1 inline-block w-1.5 h-1.5 bg-brain-400 rounded-full mx-0.5" />
              <span className="dot-2 inline-block w-1.5 h-1.5 bg-brain-400 rounded-full mx-0.5" />
              <span className="dot-3 inline-block w-1.5 h-1.5 bg-brain-400 rounded-full mx-0.5" />
            </div>
          </div>
        )}

        {/* Follow-up suggestions */}
        {followUps.length > 0 && !loading && (
          <div className="flex flex-wrap gap-2 pl-10">
            {followUps.map(q => (
              <button key={q} onClick={() => send(q)}
                className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full hover:border-brain-300 hover:bg-brain-50 text-gray-600 transition-colors">
                {q}
              </button>
            ))}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pb-4">
        <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-2xl p-3 focus-within:border-brain-300 focus-within:ring-2 focus-within:ring-brain-50 transition-all shadow-sm">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about your notes… (Enter to send)"
            rows={1}
            className="flex-1 resize-none outline-none text-sm text-gray-800 placeholder-gray-300 bg-transparent leading-relaxed max-h-32"
            style={{ scrollbarWidth: "none" }}
          />
          <button
            onClick={() => { if (input.trim()) send(input.trim()); }}
            disabled={!input.trim() || loading}
            className="p-2 bg-brain-600 hover:bg-brain-700 text-white rounded-xl transition-colors disabled:opacity-40 flex-shrink-0"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-[10px] text-gray-300 text-center mt-2">Answers grounded in your notes · Shift+Enter for new line</p>
      </div>
    </div>
  );
}
