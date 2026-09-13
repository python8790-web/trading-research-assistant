import type { Experiment } from "./experiment";

export interface HistoryEntry {
  id: string;
  question: string;
  experiment: Experiment;
  createdAt: number;
}

const STORAGE_KEY = "nexus-research-history";
const MAX_ENTRIES = 12;

export function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveToHistory(question: string, experiment: Experiment): HistoryEntry[] {
  const entries = loadHistory();
  const entry: HistoryEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    question,
    experiment,
    createdAt: Date.now(),
  };
  const next = [entry, ...entries].slice(0, MAX_ENTRIES);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage full or unavailable — history is a nice-to-have, fail silently.
  }
  return next;
}

export function clearHistory() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* noop */
  }
}
