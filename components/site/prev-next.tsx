import Link from 'next/link';
import type { LessonMeta } from '@/content/courses/types';

export function PrevNext({
  courseSlug,
  prev,
  next,
}: {
  courseSlug: string;
  prev: LessonMeta | null;
  next: LessonMeta | null;
}) {
  return (
    <nav aria-label="Lesson navigation" className="mt-12 grid grid-cols-2 gap-3">
      {prev ? (
        <Link href={`/courses/${courseSlug}/lessons/${prev.slug}`} className="rounded-md border border-[color:var(--color-border)] p-4 hover:border-black/30">
          <span className="block text-xs uppercase tracking-widest text-[color:var(--color-text-soft)]">← Previous</span>
          <span className="block mt-1 font-medium">{prev.title}</span>
        </Link>
      ) : <div aria-hidden />}
      {next ? (
        <Link href={`/courses/${courseSlug}/lessons/${next.slug}`} className="rounded-md border border-[color:var(--color-border)] p-4 hover:border-black/30 text-right">
          <span className="block text-xs uppercase tracking-widest text-[color:var(--color-text-soft)]">Next →</span>
          <span className="block mt-1 font-medium">{next.title}</span>
        </Link>
      ) : <div aria-hidden />}
    </nav>
  );
}
