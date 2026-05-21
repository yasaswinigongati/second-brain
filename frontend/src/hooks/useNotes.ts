import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notesApi } from "@/lib/api";
import { NoteCreate, NoteUpdate } from "@/types";
import { useAppStore } from "@/store/appStore";
import toast from "react-hot-toast";

export function useNotes(notebook?: string | null, tag?: string | null) {
  return useQuery({
    queryKey: ["notes", notebook, tag],
    queryFn: () => notesApi.list({ notebook: notebook ?? undefined, tag: tag ?? undefined }),
  });
}

export function useNote(id: string | null) {
  return useQuery({
    queryKey: ["note", id],
    queryFn: () => notesApi.get(id!),
    enabled: !!id,
  });
}

export function useCreateNote() {
  const qc = useQueryClient();
  const { addNote } = useAppStore();
  return useMutation({
    mutationFn: (data: NoteCreate) => notesApi.create(data),
    onSuccess: (note) => {
      addNote(note);
      qc.invalidateQueries({ queryKey: ["notes"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      qc.invalidateQueries({ queryKey: ["notebooks"] });
      qc.invalidateQueries({ queryKey: ["tags"] });
      toast.success("Note created!");
    },
    onError: () => toast.error("Failed to create note"),
  });
}

export function useUpdateNote() {
  const qc = useQueryClient();
  const { updateNote } = useAppStore();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: NoteUpdate }) => notesApi.update(id, data),
    onSuccess: (note) => {
      updateNote(note);
      qc.invalidateQueries({ queryKey: ["notes"] });
      qc.invalidateQueries({ queryKey: ["note", note.id] });
      toast.success("Note saved!");
    },
    onError: () => toast.error("Failed to save note"),
  });
}

export function useDeleteNote() {
  const qc = useQueryClient();
  const { removeNote } = useAppStore();
  return useMutation({
    mutationFn: (id: string) => notesApi.delete(id),
    onSuccess: (_, id) => {
      removeNote(id);
      qc.invalidateQueries({ queryKey: ["notes"] });
      qc.invalidateQueries({ queryKey: ["stats"] });
      toast.success("Note deleted");
    },
    onError: () => toast.error("Failed to delete note"),
  });
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: notesApi.getStats,
    staleTime: 60_000,
  });
}

export function useNotebooks() {
  return useQuery({
    queryKey: ["notebooks"],
    queryFn: notesApi.getNotebooks,
    staleTime: 30_000,
  });
}

export function useTags() {
  return useQuery({
    queryKey: ["tags"],
    queryFn: notesApi.getTags,
    staleTime: 30_000,
  });
}
