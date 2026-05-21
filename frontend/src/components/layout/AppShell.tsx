"use client";
import Sidebar from "./Sidebar";
import Header from "./Header";
import NotesView from "@/components/notes/NotesView";
import ChatView from "@/components/chat/ChatView";
import SearchView from "@/components/notes/SearchView";
import DashboardView from "@/components/notes/DashboardView";
import NoteEditor from "@/components/notes/NoteEditor";
import { useAppStore } from "@/store/appStore";

export default function AppShell() {
  const { activeView, sidebarOpen } = useAppStore();

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8f7f4]">
      <Sidebar />
      <div
        className="flex flex-col flex-1 overflow-hidden transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? "260px" : "0" }}
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
