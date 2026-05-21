import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  if (diff < oneDayMs) {
    return formatDistanceToNow(date, { addSuffix: true });
  } else if (diff < 7 * oneDayMs) {
    return formatDistanceToNow(date, { addSuffix: true });
  }
  return format(date, "MMM d, yyyy");
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trim() + "…";
}

export function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/\n+/g, " ")
    .trim();
}

export const NOTEBOOK_COLORS: Record<string, string> = {
  Default: "bg-gray-100 text-gray-700",
  Work: "bg-blue-100 text-blue-700",
  Personal: "bg-purple-100 text-purple-700",
  Research: "bg-amber-100 text-amber-700",
  Ideas: "bg-green-100 text-green-700",
  Learning: "bg-rose-100 text-rose-700",
};

export function getNotebookColor(notebook: string): string {
  return NOTEBOOK_COLORS[notebook] || "bg-brain-100 text-brain-700";
}
