import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string): string {
  const hasTimezone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(dateStr);
  const date = new Date(hasTimezone ? dateStr : `${dateStr}Z`);
  const diff = Date.now() - date.getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return formatDistanceToNow(date, { addSuffix: true });
  if (diff < 86_400_000) return format(date, "h:mm a");
  if (diff < 7 * 86_400_000) return format(date, "EEE");
  return format(date, "MMM d");
}

export function truncate(str: string, len: number) {
  return str.length <= len ? str : str.slice(0, len).trimEnd() + "…";
}

export function stripMarkdown(text: string): string {
  return text
    .replace(/#{1,6}\s+/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^\s*[-*+>]\s+/gm, "")
    .replace(/\n+/g, " ")
    .trim();
}

// Notebook → colour dot CSS class
export const NB_DOT: Record<string, string> = {
  Default:  "nb-dot-default",
  Work:     "nb-dot-work",
  Personal: "nb-dot-personal",
  Research: "nb-dot-research",
  Ideas:    "nb-dot-ideas",
  Learning: "nb-dot-learning",
};
export function nbDot(nb: string) {
  return NB_DOT[nb] ?? "nb-dot-default";
}
