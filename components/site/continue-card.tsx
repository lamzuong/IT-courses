'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getBookmarks, subscribe, type Bookmark } from '@/lib/bookmarks';

export function ContinueCard() {
  const [latest, setLatest] = useState<Bookmark | null>(null);

  useEffect(() => {
    function refresh() {
      const all = getBookmarks();
      setLatest(all[0] ?? null);
    }
    refresh();
    return subscribe(refresh);
  }, []);

  if (!latest) return null;

  return (
    <Link href={latest.path} className="continue-card" aria-label={`Continue reading: ${latest.title}`}>
      <span className="continue-card-eyebrow">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
        Pick up where you left off
      </span>
      <span className="continue-card-title">{latest.title}</span>
      <span className="continue-card-arrow" aria-hidden>Resume reading →</span>
    </Link>
  );
}
