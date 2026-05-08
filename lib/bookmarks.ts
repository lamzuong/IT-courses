const KEY = 'it-courses:bookmarks';
const EVENT = 'it-courses:bookmarks-changed';

export type Bookmark = {
  path: string;
  title: string;
  savedAt: number;
};

function read(): Bookmark[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(list: Bookmark[]): void {
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function getBookmarks(): Bookmark[] {
  return read().sort((a, b) => b.savedAt - a.savedAt);
}

export function isBookmarked(path: string): boolean {
  return read().some((b) => b.path === path);
}

export function toggleBookmark(path: string, title: string): boolean {
  const list = read();
  const idx = list.findIndex((b) => b.path === path);
  if (idx >= 0) {
    list.splice(idx, 1);
    write(list);
    return false;
  }
  list.push({ path, title, savedAt: Date.now() });
  write(list);
  return true;
}

export function subscribe(cb: () => void): () => void {
  const handler = () => cb();
  window.addEventListener(EVENT, handler);
  window.addEventListener('storage', handler);
  return () => {
    window.removeEventListener(EVENT, handler);
    window.removeEventListener('storage', handler);
  };
}
