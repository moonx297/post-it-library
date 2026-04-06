import type { PostItNote } from './types';

export const DEFAULT_STORAGE_KEY = 'post-it-library-notes-v1';

export function loadNotes(storageKey: string): PostItNote[] | null {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed as PostItNote[];
  } catch {
    return null;
  }
}

export function saveNotes(notes: PostItNote[], storageKey: string) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(notes));
  } catch {
    /* ignore quota */
  }
}
