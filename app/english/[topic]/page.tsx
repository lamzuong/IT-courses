import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllEnglishTopics, getEnglishTopic, flattenEnglishLessons } from '@/lib/english';
import { getEnglishTopicStats } from '@/lib/english-stats';
import { BookmarkIndicator } from '@/components/site/bookmark-indicator';
import { hasScopeAccess } from '@/lib/locks';
import { LessonLockGate } from '@/components/site/lesson-lock-gate';

export async function generateStaticParams() {
  return getAllEnglishTopics()
    .filter((t) => !t.placeholder)
    .map((t) => ({ topic: t.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ topic: string }> },
): Promise<Metadata> {
  const { topic: slug } = await params;
  const topic = getEnglishTopic(slug);
  if (!topic) return {};
  return {
    title: `${topic.title} · Tiếng Anh giao tiếp`,
    description: topic.summary,
  };
}

function formatReadTime(minutes: number): string {
  if (minutes < 60) return `~${minutes} phút đọc`;
  const h = minutes / 60;
  return `~${h % 1 === 0 ? h : h.toFixed(1)} giờ đọc`;
}

function renderMemoryTip(tip: string) {
  return tip.split(/(\*\*[^*]+\*\*)/).map((chunk, i) => {
    if (chunk.startsWith('**') && chunk.endsWith('**')) {
      return <strong key={i}>{chunk.slice(2, -2)}</strong>;
    }
    return <span key={i}>{chunk}</span>;
  });
}

export default async function EnglishTopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic: slug } = await params;
  const topic = getEnglishTopic(slug);
  if (!topic || topic.placeholder) notFound();

  if (!(await hasScopeAccess({ kind: 'english', id: slug }))) {
    return (
      <LessonLockGate
        scopeKey={`english/${slug}`}
        title={topic.title}
        subtitle="Chủ đề tiếng Anh đang khoá"
      />
    );
  }

  const { totalMinutes, perLesson } = await getEnglishTopicStats(topic);
  const lessons = flattenEnglishLessons(topic);
  const firstSlug = lessons[0]?.slug;

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-6 py-10 md:py-16">
      <header className="agenda-header">
        <p className="agenda-eyebrow">Tiếng Anh giao tiếp · {topic.level}</p>
        <h1 className="agenda-title">{topic.title}</h1>
        <p className="agenda-deck">{topic.summary}</p>
        <p className="agenda-meta">
          <span>{lessons.length} bài học</span>
          <span aria-hidden className="agenda-meta-dot">·</span>
          <span>{formatReadTime(totalMinutes)}</span>
        </p>
      </header>

      <hr className="agenda-rule" />

      {topic.memoryTip && (
        <aside className="memory-tip" aria-label="Gợi ý cách ghi nhớ nhanh">
          <p className="memory-tip-label">Gợi ý cách ghi nhớ nhanh</p>
          <p className="memory-tip-body">{renderMemoryTip(topic.memoryTip)}</p>
        </aside>
      )}

      <section aria-label="Topic lessons">
        <ol className="agenda-list">
          {lessons.map((lesson, i) => {
            const min = perLesson[lesson.slug] ?? 0;
            return (
              <li key={lesson.slug} className="agenda-row">
                <Link
                  href={`/english/${topic.slug}/lessons/${lesson.slug}`}
                  className="agenda-link"
                >
                  <span className="agenda-num">{i + 1}.</span>
                  <span className="agenda-lesson-title">
                    <BookmarkIndicator path={`/english/${topic.slug}/lessons/${lesson.slug}`} />
                    {lesson.title}
                    {lesson.scene && (
                      <span className="agenda-lesson-summary">{lesson.scene}</span>
                    )}
                  </span>
                  <span className="agenda-time">{min} phút</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {firstSlug && (
        <div className="agenda-cta-row">
          <Link
            href={`/english/${topic.slug}/lessons/${firstSlug}`}
            className="agenda-cta"
          >
            Bắt đầu bài 1 <span aria-hidden>→</span>
          </Link>
        </div>
      )}
    </main>
  );
}
