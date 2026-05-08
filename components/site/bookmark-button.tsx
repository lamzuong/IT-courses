'use client';
import { useEffect, useState } from 'react';
import { isBookmarked, subscribe, toggleBookmark } from '@/lib/bookmarks';

export function BookmarkButton({ path, title }: { path: string; title: string }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(isBookmarked(path));
    return subscribe(() => setSaved(isBookmarked(path)));
  }, [path]);

  return (
    <button
      type="button"
      className={`bookmark-btn${saved ? ' is-saved' : ''}`}
      onClick={() => setSaved(toggleBookmark(path, title))}
      aria-pressed={saved}
      aria-label={saved ? 'Remove bookmark' : 'Bookmark this lesson'}
      title={saved ? 'Bookmarked — click to remove' : 'Bookmark this lesson'}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
      </svg>
    </button>
  );
}
