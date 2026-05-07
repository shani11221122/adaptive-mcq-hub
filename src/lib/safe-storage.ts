/**
 * Centralized, crash-safe localStorage helpers.
 * - Never throws on corrupt JSON or quota errors.
 * - Caps mutable lists (history) to prevent quota overflow.
 */

export function safeGet<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function safeSet(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function safeRemove(key: string) {
  try { localStorage.removeItem(key); } catch { /* noop */ }
}

const HISTORY_KEY = "mdcat_history";
const HISTORY_MAX = 500;

export interface HistoryEntry {
  username?: string;
  subject?: string;
  correct: number;
  incorrect?: number;
  total: number;
  difficulty?: string;
  date: string;
  timed?: boolean;
  isMock?: boolean;
}

export function getHistory(): HistoryEntry[] {
  const raw = safeGet<HistoryEntry[]>(HISTORY_KEY, []);
  return Array.isArray(raw) ? raw : [];
}

export function appendHistory(entry: HistoryEntry) {
  const list = getHistory();
  list.push(entry);
  // Cap to most recent N entries to avoid unbounded growth.
  const trimmed = list.length > HISTORY_MAX ? list.slice(-HISTORY_MAX) : list;
  safeSet(HISTORY_KEY, trimmed);
}
