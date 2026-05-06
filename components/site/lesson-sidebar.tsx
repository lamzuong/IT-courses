'use client';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Course } from '@/content/courses/types';
import { lessonNumberFromSlug } from '@/lib/courses';

const STORAGE_KEY = 'lesson-toc-scroll';

const ROMAN_MAP: [number, string][] = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']];
function toRoman(n: number): string {
  let out = '';
  let rem = n;
  for (const [v, s] of ROMAN_MAP) {
    while (rem >= v) { out += s; rem -= v; }
  }
  return out;
}

export function LessonSidebar({
  course,
  currentLessonSlug,
  isProject = false,
}: {
  course: Course;
  currentLessonSlug?: string;
  isProject?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLElement | null>(null);

  function onLinkClick() {
    if (asideRef.current) {
      sessionStorage.setItem(STORAGE_KEY, String(asideRef.current.scrollTop));
    }
    setOpen(false);
  }

  useLayoutEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved !== null && asideRef.current) {
      const y = parseInt(saved, 10);
      if (!Number.isNaN(y)) asideRef.current.scrollTop = y;
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    const dlg = dialogRef.current;
    if (!dlg) return;
    const focusable = dlg.querySelectorAll<HTMLElement>('a, button');
    focusable[0]?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key !== 'Tab' || focusable.length === 0) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  let lessonCounter = 0;

  const list = (
    <nav aria-label="Course lessons" className="toc">
      {course.parts.map((part, partIdx) => (
        <section key={part.title} className="toc-part">
          <p className="toc-part-label">
            <span className="toc-part-pill">Part {toRoman(partIdx + 1)}</span>
            <span className="toc-part-title">{part.title}</span>
          </p>
          <ol className="toc-list">
            {part.lessons.map((lesson) => {
              lessonCounter += 1;
              const active = lesson.slug === currentLessonSlug;
              const num = lessonNumberFromSlug(lesson.slug, lessonCounter);
              return (
                <li key={lesson.slug} className="toc-item-wrap">
                  <Link
                    href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                    onClick={onLinkClick}
                    aria-current={active ? 'page' : undefined}
                    className={`toc-item ${active ? 'is-active' : ''}`}
                  >
                    <span className="toc-num">{num}</span>
                    <span className="toc-title">{lesson.title}</span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </section>
      ))}

      <section className="toc-part">
        <p className="toc-part-label">
          <span className="toc-part-pill">Final</span>
          <span className="toc-part-title">Project</span>
        </p>
        <ol className="toc-list">
          <li className="toc-item-wrap">
            <Link
              href={`/courses/${course.slug}/project`}
              onClick={onLinkClick}
              aria-current={isProject ? 'page' : undefined}
              className={`toc-item toc-project ${isProject ? 'is-active' : ''}`}
            >
              <span className="toc-num" aria-hidden>★</span>
              <span className="toc-title">{course.project.title}</span>
            </Link>
          </li>
        </ol>
      </section>
    </nav>
  );

  return (
    <>
      <aside
        ref={asideRef}
        className="hidden md:block w-72 shrink-0 sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto pr-4 pb-8"
      >
        {list}
      </aside>

      <div className="md:hidden border-b border-[color:var(--color-border)] px-4 py-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="lesson-drawer"
          className="text-sm font-medium underline-offset-2 hover:underline"
        >
          {open ? 'Hide lessons' : 'Lessons'}
        </button>
      </div>
      {open && (
        <div
          id="lesson-drawer"
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Course lessons"
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
