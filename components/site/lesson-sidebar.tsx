'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Course } from '@/content/courses/types';

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

  // Focus trap + Escape
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

  // Compute the global lesson number across parts (e.g., part 2 lesson 1 = 10)
  const part1Count = course.parts[0]?.lessons.length ?? 0;

  const list = (
    <nav aria-label="Course lessons">
      {course.parts.map((part, partIdx) => (
        <div key={part.title} className="mb-6">
          <p className="text-xs uppercase tracking-widest text-[color:var(--color-text-soft)] mb-2">
            Part {partIdx + 1} · {part.title}
          </p>
          <ul className="space-y-0.5">
            {part.lessons.map((lesson, idx) => {
              const active = lesson.slug === currentLessonSlug;
              const globalNum = partIdx === 0 ? idx + 1 : part1Count + idx + 1;
              return (
                <li key={lesson.slug}>
                  <Link
                    href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                    onClick={() => setOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`block px-2 py-1 rounded text-sm leading-snug ${active ? 'bg-white font-semibold border-l-2 border-black -ml-[2px]' : 'text-[color:var(--color-text-soft)] hover:text-black hover:bg-white/40'}`}
                  >
                    <span className="font-mono text-[10px] mr-2">{String(globalNum).padStart(2, '0')}</span>
                    {lesson.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <div className="mt-6 pt-6 border-t border-[color:var(--color-border)]">
        <Link
          href={`/courses/${course.slug}/project`}
          onClick={() => setOpen(false)}
          aria-current={isProject ? 'page' : undefined}
          className={`block px-2 py-1 rounded text-sm ${isProject ? 'bg-white font-semibold border-l-2 border-black -ml-[2px]' : 'text-[color:var(--color-text-soft)] hover:text-black hover:bg-white/40'}`}
        >
          <span className="text-xs uppercase tracking-widest mr-2">Project</span>
          {course.project.title}
        </Link>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 shrink-0 sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto px-2">
        {list}
      </aside>

      {/* Mobile toggle + drawer */}
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
