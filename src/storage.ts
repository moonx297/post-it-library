import type { PostItNote } from './types';

export const STORAGE_KEY = 'post-it-library-notes-v1';

export function loadNotes(): PostItNote[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return null;
    return parsed as PostItNote[];
  } catch {
    return null;
  }
}

export function saveNotes(notes: PostItNote[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  } catch {
    /* ignore quota */
  }
}
