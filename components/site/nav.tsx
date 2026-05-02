'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { SkipLink } from './skip-link';
import { SearchDialog } from './search';
import type { SearchRecord } from '@/lib/search-types';

const HIDE_AFTER = 80;       // px — keep header visible near the top
const DELTA = 5;             // px — ignore tiny scrolls to avoid flicker

export function SiteNav({ searchIndex }: { searchIndex: SearchRecord[] }) {
  const [hidden, setHidden] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const lastY = useRef(0);
  const lastDirChangeY = useRef(0);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad|iPod/.test(navigator.platform));
    lastY.current = window.scrollY;

    function onScroll() {
      const y = Math.max(0, window.scrollY);
      const dy = y - lastY.current;

      if (y < HIDE_AFTER) {
        setHidden(false);
      } else if (dy > DELTA && y - lastDirChangeY.current > DELTA) {
        setHidden(true);
        lastDirChangeY.current = y;
      } else if (dy < -DELTA && lastDirChangeY.current - y > DELTA) {
        setHidden(false);
        lastDirChangeY.current = y;
      }

      lastY.current = y;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey;
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((p) => !p);
      } else if (e.key === '/' && !searchOpen) {
        const target = e.target as HTMLElement | null;
        const tag = target?.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return;
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [searchOpen]);

  return (
    <>
      <header className={`site-nav ${hidden ? 'site-nav--hidden' : ''}`}>
        <SkipLink />
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-4">
          <Link href="/" className="font-serif text-lg font-bold tracking-tight whitespace-nowrap">
            IT Courses
          </Link>
          <div className="flex items-center gap-3 sm:gap-5 min-w-0">
            <button
              type="button"
              className="search-trigger"
              onClick={() => setSearchOpen(true)}
              aria-label="Search the site"
              aria-haspopup="dialog"
              aria-expanded={searchOpen}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <span className="search-trigger-text">Search</span>
              <kbd className="search-trigger-kbd" aria-hidden="true">
                <span className="search-trigger-kbd-mod">{isMac ? '⌘' : 'Ctrl'}</span>K
              </kbd>
            </button>
            <nav aria-label="Site" className="flex gap-5 text-sm">
              <Link href="/" className="hover:underline">Courses</Link>
              <Link href="/about" className="hover:underline opacity-70 hidden sm:inline">About</Link>
            </nav>
          </div>
        </div>
      </header>
      <SearchDialog
        index={searchIndex}
        open={searchOpen}
        onOpenChange={setSearchOpen}
      />
    </>
  );
}
