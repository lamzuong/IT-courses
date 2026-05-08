'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getBookmarks, subscribe, toggleBookmark, type Bookmark } from '@/lib/bookmarks';
import type { BookmarkInfo, BookmarkLookup } from '@/lib/bookmark-lookup';

type Group = {
  sectionType: 'course' | 'english';
  sectionSlug: string;
  sectionTitle: string;
  items: { bookmark: Bookmark; info: BookmarkInfo }[];
  latest: number;
};

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function BookmarksList({ lookup }: { lookup: BookmarkLookup }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[] | null>(null);

  useEffect(() => {
    setBookmarks(getBookmarks());
    return subscribe(() => setBookmarks(getBookmarks()));
  }, []);

  if (bookmarks === null) {
    return <p className="bookmarks-empty">Loading…</p>;
  }

  if (bookmarks.length === 0) {
    return (
      <p className="bookmarks-empty">
        Nothing saved yet. Open any lesson and tap the bookmark icon next to its title to save it here.
      </p>
    );
  }

  const groupMap = new Map<string, Group>();
  for (const bookmark of bookmarks) {
    const basePath = bookmark.path.split('#')[0];
    const info = lookup[basePath];
    if (!info) continue;
    const key = `${info.sectionType}:${info.sectionSlug}`;
    const existing = groupMap.get(key);
    if (existing) {
      existing.items.push({ bookmark, info });
      existing.latest = Math.max(existing.latest, bookmark.savedAt);
    } else {
      groupMap.set(key, {
        sectionType: info.sectionType,
        sectionSlug: info.sectionSlug,
        sectionTitle: info.sectionTitle,
        items: [{ bookmark, info }],
        latest: bookmark.savedAt,
      });
    }
  }

  const groups = Array.from(groupMap.values()).sort((a, b) => b.latest - a.latest);

  if (groups.length === 0) {
    return (
      <p className="bookmarks-empty">
        Your saved lessons no longer exist. They may have been removed.
      </p>
    );
  }

  return (
    <div className="bookmarks-groups">
      {groups.map((group) => (
        <section key={`${group.sectionType}:${group.sectionSlug}`} className="agenda-part">
          <h2 className="agenda-part-label">
            <span className="agenda-part-pill">
              {group.sectionType === 'english' ? 'English' : 'Course'}
            </span>
            <Link
              href={
                group.sectionType === 'english'
                  ? `/english/${group.sectionSlug}`
                  : `/courses/${group.sectionSlug}`
              }
              className="agenda-part-title bookmarks-section-link"
            >
              {group.sectionTitle}
            </Link>
          </h2>
          <ol className="agenda-list">
            {group.items.map(({ bookmark, info }) => {
              const isSection = bookmark.path.includes('#');
              return (
                <li key={bookmark.path} className="agenda-row bookmarks-row">
                  <Link href={bookmark.path} className="agenda-link bookmarks-link">
                    <span className="agenda-num" aria-hidden>{isSection ? '§' : '★'}</span>
                    <span className="agenda-lesson-title">
                      {bookmark.title}
                      {isSection && (
                        <span className="agenda-lesson-summary">in {info.lessonTitle}</span>
                      )}
                    </span>
                    <span className="agenda-time">{formatDate(bookmark.savedAt)}</span>
                  </Link>
                  <button
                    type="button"
                    className="bookmarks-remove"
                    onClick={() => {
                      toggleBookmark(bookmark.path, bookmark.title);
                    }}
                    aria-label={`Remove bookmark: ${bookmark.title}`}
                    title="Remove bookmark"
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ol>
        </section>
      ))}
    </div>
  );
}
