'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { EnglishTopic } from '@/content/english/types';

export function EnglishTopicSidebar({
  topic,
  currentLessonSlug,
}: {
  topic: EnglishTopic;
  currentLessonSlug?: string;
}) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const dlg = dialogRef.current;
    if (!dlg) return;
    const focusable = dlg.querySelectorAll<HTMLElement>('a, button');
    focusable[0]?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab' || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const list = (
    <nav aria-label="Lessons in this topic" className="toc">
      <p className="toc-part-label">
        <span className="toc-part-pill">{topic.level}</span>
        <span className="toc-part-title">{topic.title}</span>
      </p>
      <ol className="toc-list">
        {topic.lessons.map((lesson, i) => {
          const active = lesson.slug === currentLessonSlug;
          return (
            <li key={lesson.slug} className="toc-item-wrap">
              <Link
                href={`/english/${topic.slug}/lessons/${lesson.slug}`}
                aria-current={active ? 'page' : undefined}
                className={`toc-item ${active ? 'is-active' : ''}`}
                onClick={() => setOpen(false)}
              >
                <span className="toc-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="toc-title">{lesson.title}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );

  return (
    <>
      <aside className="hidden md:block w-72 shrink-0 sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto pr-4 pb-8">
        {list}
      </aside>

      <div className="md:hidden border-b border-[color:var(--color-border)] px-4 py-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="english-lesson-drawer"
          className="text-sm font-medium underline-offset-2 hover:underline"
        >
          {open ? 'Hide lessons' : 'Lessons'}
        </button>
      </div>
      {open && (
        <div
          id="english-lesson-drawer"
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Lessons in this topic"
          className="md:hidden fixed inset-0 bg-[color:var(--color-bg)] z-40 overflow-y-auto p-6"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-sm underline mb-4"
          >
            Close
          </button>
          {list}
        </div>
      )}
    </>
  );
}
