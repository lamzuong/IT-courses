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
    <nav aria-label="Lesson navigation" className="prevnext">
      {prev ? (
        <Link href={`/courses/${courseSlug}/lessons/${prev.slug}`} className="prevnext-card prev">
          <span className="prevnext-direction">Previous</span>
          <span className="prevnext-title">{prev.title}</span>
          {prev.summary && <span className="prevnext-summary">{prev.summary}</span>}
        </Link>
      ) : <div aria-hidden />}
      {next ? (
        <Link href={`/courses/${courseSlug}/lessons/${next.slug}`} className="prevnext-card next">
          <span className="prevnext-direction">Next lesson</span>
          <span className="prevnext-title">{next.title}</span>
          {next.summary && <span className="prevnext-summary">{next.summary}</span>}
        </Link>
      ) : <div aria-hidden />}
    </nav>
  );
}
