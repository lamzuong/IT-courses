'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { SkipLink } from './skip-link';

const HIDE_AFTER = 80;       // px — keep header visible near the top
const DELTA = 5;             // px — ignore tiny scrolls to avoid flicker

export function SiteNav() {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  const lastDirChangeY = useRef(0);

  useEffect(() => {
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

  return (
    <header className={`site-nav ${hidden ? 'site-nav--hidden' : ''}`}>
      <SkipLink />
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-serif text-lg font-bold tracking-tight">
          IT Courses
        </Link>
        <nav aria-label="Site" className="flex gap-6 text-sm">
          <Link href="/" className="hover:underline">Courses</Link>
          <Link href="/about" className="hover:underline opacity-70">About</Link>
        </nav>
      </div>
    </header>
  );
}
