import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  getAllEnglishTopics,
  getEnglishLesson,
  flattenEnglishLessons,
} from '@/lib/english';
import { getEnglishLessonStats } from '@/lib/english-stats';
import { EnglishTopicSidebar } from '@/components/site/english-topic-sidebar';
import { Breadcrumb } from '@/components/site/breadcrumb';
import { ReadingProgress } from '@/components/site/reading-progress';
import { BookmarkButton } from '@/components/site/bookmark-button';

export async function generateStaticParams() {
  return getAllEnglishTopics()
    .filter((t) => !t.placeholder)
    .flatMap((topic) =>
      flattenEnglishLessons(topic).map((lesson) => ({
        topic: topic.slug,
        lesson: lesson.slug,
      })),
    );
}

export async function generateMetadata(
  { params }: { params: Promise<{ topic: string; lesson: string }> },
): Promise<Metadata> {
  const p = await params;
  const ctx = getEnglishLesson(p.topic, p.lesson);
  if (!ctx) return {};
  return {
    title: `${ctx.lesson.title} · ${ctx.topic.title}`,
    description: ctx.lesson.summary,
  };
}

type Params = { topic: string; lesson: string };

export default async function EnglishLessonPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { topic: topicSlug, lesson: lessonSlug } = await params;
  const ctx = getEnglishLesson(topicSlug, lessonSlug);
  if (!ctx) notFound();

  let MDXContent: React.ComponentType;
  try {
    MDXContent = (
      await import(`@/content/english/${topicSlug}/lessons/${lessonSlug}.mdx`)
    ).default;
  } catch {
    notFound();
  }

  const stats = await getEnglishLessonStats(topicSlug, lessonSlug);
  const lessonNum = String(ctx.index + 1).padStart(2, '0');
  const totalNum = String(ctx.total).padStart(2, '0');

  return (
    <>
      <ReadingProgress />
      <div className="mx-auto max-w-6xl md:flex md:gap-10 md:px-6 md:py-8">
        <EnglishTopicSidebar
          topic={ctx.topic}
          currentLessonSlug={lessonSlug}
        />
        <main id="main-content" className="flex-1 min-w-0 px-6 py-6 md:py-2">
          <Breadcrumb
            items={[
              { label: 'English', href: '/english' },
              { label: ctx.topic.title, href: `/english/${ctx.topic.slug}` },
              { label: ctx.lesson.title },
            ]}
          />
          <article className="mx-auto max-w-[var(--container-prose)] mt-8">
            <header className="mb-12">
              <p className="lesson-eyebrow">
                Bài {lessonNum}
                <span aria-hidden style={{ color: 'color-mix(in oklab, var(--color-accent), transparent 60%)' }}>/</span>
                {totalNum}
              </p>
              <div className="lesson-title-row">
                <h1 className="lesson-title">{ctx.lesson.title}</h1>
                <BookmarkButton
                  path={`/english/${ctx.topic.slug}/lessons/${lessonSlug}`}
                  title={ctx.lesson.title}
                />
              </div>
              {ctx.lesson.scene && <p className="lesson-deck">{ctx.lesson.scene}</p>}

              <p className="lesson-meta">
                {stats && (
                  <>
                    <span>{stats.readMinutes} phút đọc</span>
                    <span aria-hidden className="lesson-meta-dot">●</span>
                    <span>{stats.words.toLocaleString()} từ</span>
                  </>
                )}
              </p>
            </header>

            <div className="prose-lesson">
              <MDXContent />
            </div>

            <nav aria-label="Lesson navigation" className="prevnext">
              {ctx.prev ? (
                <Link
                  href={`/english/${ctx.topic.slug}/lessons/${ctx.prev.slug}`}
                  className="prevnext-card prev"
                >
                  <span className="prevnext-direction">Bài trước</span>
                  <span className="prevnext-title">{ctx.prev.title}</span>
                </Link>
              ) : (
                <div aria-hidden />
              )}
              {ctx.next ? (
                <Link
                  href={`/english/${ctx.topic.slug}/lessons/${ctx.next.slug}`}
                  className="prevnext-card next"
                >
                  <span className="prevnext-direction">Bài tiếp theo</span>
                  <span className="prevnext-title">{ctx.next.title}</span>
                </Link>
              ) : (
                <div aria-hidden />
              )}
            </nav>
          </article>
        </main>
      </div>
    </>
  );
}
