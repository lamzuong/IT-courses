'use client';
import { useEffect, useState } from 'react';
import { isBookmarked, subscribe } from '@/lib/bookmarks';

export function BookmarkIndicator({ path }: { path: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isBookmarked(path));
    return subscribe(() => setSaved(isBookmarked(path)));
  }, [path]);

  if (!saved) return null;

  return (
    <span className="bookmark-indicator" aria-label="Bookmarked" title="Bookmarked">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </span>
  );
}
