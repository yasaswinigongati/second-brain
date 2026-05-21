"use client";
import Sidebar from "./Sidebar";
import Header from "./Header";
import NotesView from "@/components/notes/NotesView";
import ChatView from "@/components/chat/ChatView";
import SearchView from "@/components/notes/SearchView";
import DashboardView from "@/components/notes/DashboardView";
import NoteEditor from "@/components/notes/NoteEditor";
import { useAppStore } from "@/store/appStore";

// Must match --sidebar-w in globals.css
const SIDEBAR_W = 252;

export default function AppShell() {
  const { activeView, sidebarOpen } = useAppStore();

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--c-bg)" }}>
      <Sidebar />
      <div
        className="flex flex-col flex-1 overflow-hidden"
        style={{
          marginLeft: sidebarOpen ? SIDEBAR_W : 0,
          transition: "margin-left 0.18s ease",
        }}
      >
        <Header />
        <main className="flex-1 overflow-hidden">
          {activeView === "notes"     && <NotesView />}
          {activeView === "chat"      && <ChatView />}
          {activeView === "search"    && <SearchView />}
          {activeView === "dashboard" && <DashboardView />}
        </main>
      </div>
      <NoteEditor />
    </div>
  );
}
