import { LessonSnapshot, SavedLesson } from '../types';

const AUTOSAVE_KEY = 'matteytan-autosave-v1';
const LESSONS_KEY = 'matteytan-lessons-v1';

export function saveAutosave(snapshot: LessonSnapshot): void {
  try {
    localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(snapshot));
  } catch (err) {
    console.warn('Kunde inte spara automatiskt:', err);
  }
}

export function loadAutosave(): LessonSnapshot | null {
  try {
    const raw = localStorage.getItem(AUTOSAVE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LessonSnapshot;
  } catch (err) {
    console.warn('Kunde inte läsa in automatiskt sparat innehåll:', err);
    return null;
  }
}

export function listLessons(): SavedLesson[] {
  try {
    const raw = localStorage.getItem(LESSONS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('Kunde inte läsa in sparade lektioner:', err);
    return [];
  }
}

function persistLessons(lessons: SavedLesson[]): void {
  // Left uncaught on purpose: callers (save/rename/delete) want to know
  // if storage is full so they can tell the user, instead of failing silently.
  localStorage.setItem(LESSONS_KEY, JSON.stringify(lessons));
}

export function saveLesson(name: string, snapshot: LessonSnapshot, existingId?: string): SavedLesson[] {
  const lessons = listLessons();
  const now = new Date().toISOString();

  if (existingId) {
    const idx = lessons.findIndex(l => l.id === existingId);
    if (idx !== -1) {
      const next = [...lessons];
      next[idx] = { ...next[idx], name, snapshot, savedAt: now };
      persistLessons(next);
      return next;
    }
  }

  const newLesson: SavedLesson = {
    id: `lesson-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name,
    savedAt: now,
    snapshot,
  };
  const next = [newLesson, ...lessons];
  persistLessons(next);
  return next;
}

export function deleteLesson(id: string): SavedLesson[] {
  const next = listLessons().filter(l => l.id !== id);
  persistLessons(next);
  return next;
}

export function renameLesson(id: string, name: string): SavedLesson[] {
  const next = listLessons().map(l => (l.id === id ? { ...l, name } : l));
  persistLessons(next);
  return next;
}
