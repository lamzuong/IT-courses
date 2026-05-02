'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { SearchRecord } from '@/lib/search-types';

const KIND_LABEL: Record<SearchRecord['kind'], string> = {
  course: 'Course',
  lesson: 'Lesson',
  project: 'Project',
};

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function score(record: SearchRecord, tokens: string[]): number {
  const title = record.title.toLowerCase();
  const summary = record.summary.toLowerCase();
  const courseTitle = record.courseTitle.toLowerCase();
  const body = record.body.toLowerCase();

  let total = 0;
  for (const token of tokens) {
    let matched = false;
    if (title.includes(token)) {
      total += 8;
      matched = true;
      if (new RegExp(`\\b${escapeRegex(token)}`).test(title)) total += 4;
    }
    if (summary.includes(token)) {
      total += 3;
      matched = true;
    }
    if (courseTitle.includes(token)) {
      total += 2;
      matched = true;
    }
    if (body.includes(token)) {
      total += 1;
      matched = true;
    }
    if (!matched) return 0;
  }
  if (record.kind === 'course') total += 2;
  if (record.kind === 'project') total += 1;
  return total;
}

function highlight(text: string, tokens: string[]): React.ReactNode {
  if (!tokens.length || !text) return text;
  const pattern = tokens.filter(Boolean).map(escapeRegex).join('|');
  if (!pattern) return text;
  const re = new RegExp(`(${pattern})`, 'gi');
  const parts = text.split(re);
  return parts.map((part, i) =>
    re.test(part) ? (
      <mark key={i} className="search-mark">
        {part}
      </mark>
    ) : (
      <span key={i}>{part}</span>
    ),
  );
}

type SearchDialogProps = {
  index: SearchRecord[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SearchDialog({ index, open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    setQuery('');
    setActive(0);
    const id = requestAnimationFrame(() => inputRef.current?.focus());
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault();
        onOpenChange(false);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  const tokens = useMemo(
    () =>
      query
        .toLowerCase()
        .split(/\s+/)
        .map((t) => t.trim())
        .filter((t) => t.length >= 2),
    [query],
  );

  const results = useMemo(() => {
    if (!tokens.length) return [];
    const scored = index
      .map((r) => ({ r, s: score(r, tokens) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 12);
    return scored.map((x) => x.r);
  }, [index, tokens]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => (results.length ? Math.min(a + 1, results.length - 1) : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === 'Enter') {
      const r = results[active];
      if (r) {
        e.preventDefault();
        onOpenChange(false);
        router.push(r.href);
      }
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActive(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActive(Math.max(0, results.length - 1));
    }
  }

  useEffect(() => {
    if (!listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-idx="${active}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [active]);

  if (!open) return null;

  return (
    <div
      className="search-overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onOpenChange(false);
      }}
    >
      <div
        className="search-panel"
        role="dialog"
        aria-modal="true"
        aria-label="Search the site"
      >
        <div className="search-input-row">
          <svg
            className="search-icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Search courses, lessons, topics…"
            className="search-input"
            aria-label="Search query"
            aria-controls="search-results"
            aria-autocomplete="list"
            aria-activedescendant={
              results[active] ? `search-r-${active}` : undefined
            }
            spellCheck={false}
            autoComplete="off"
          />
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="search-close"
            aria-label="Close search"
          >
            esc
          </button>
        </div>

        <div
          id="search-results"
          ref={listRef}
          className="search-results"
          role="listbox"
          aria-label="Search results"
        >
          {!query && (
            <p className="search-empty">
              Start typing to search across courses, lessons, and project guides. Use{' '}
              <kbd className="search-empty-kbd">↑</kbd>{' '}
              <kbd className="search-empty-kbd">↓</kbd> to navigate,{' '}
              <kbd className="search-empty-kbd">↵</kbd> to open.
            </p>
          )}
          {query && tokens.length === 0 && (
            <p className="search-empty">Keep typing — at least 2 characters.</p>
          )}
          {query && tokens.length > 0 && results.length === 0 && (
            <p className="search-empty">
              No results for <strong>{query}</strong>.
            </p>
          )}
          {results.map((r, i) => {
            const isActive = i === active;
            const context =
              r.kind === 'lesson'
                ? `${r.courseTitle} · ${r.partTitle} · Lesson ${r.lessonNumber}`
                : r.courseTitle;
            return (
              <Link
                key={`${r.kind}-${r.href}`}
                href={r.href}
                id={`search-r-${i}`}
                role="option"
                aria-selected={isActive}
                data-idx={i}
                className={`search-result ${isActive ? 'is-active' : ''}`}
                onClick={() => onOpenChange(false)}
                onMouseMove={() => {
                  if (active !== i) setActive(i);
                }}
              >
                <span className={`search-result-kind search-result-kind--${r.kind}`}>
                  {KIND_LABEL[r.kind]}
                </span>
                <span className="search-result-title">{highlight(r.title, tokens)}</span>
                {r.summary && (
                  <span className="search-result-summary">
                    {highlight(r.summary, tokens)}
                  </span>
                )}
                <span className="search-result-context">{context}</span>
              </Link>
            );
          })}
        </div>

        <div className="search-footer">
          <span>
            <kbd className="search-empty-kbd">↑</kbd>
            <kbd className="search-empty-kbd">↓</kbd> navigate
          </span>
          <span>
            <kbd className="search-empty-kbd">↵</kbd> open
          </span>
          <span>
            <kbd className="search-empty-kbd">esc</kbd> close
          </span>
        </div>
      </div>
    </div>
  );
}
