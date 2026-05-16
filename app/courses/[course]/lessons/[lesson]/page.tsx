import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllCourses, getLesson, flattenLessons, lessonNumberFromSlug } from '@/lib/courses';
import { getLessonStats, partOfLesson } from '@/lib/lesson-stats';
import { LessonSidebar } from '@/components/site/lesson-sidebar';
import { Breadcrumb } from '@/components/site/breadcrumb';
import { PrevNext } from '@/components/site/prev-next';
import { ReadingProgress } from '@/components/site/reading-progress';
import { BookmarkButton } from '@/components/site/bookmark-button';
import { LanguageToggle } from '@/components/site/language-toggle';
import { firstBlockingScope } from '@/lib/locks';
import { LessonLockGate } from '@/components/site/lesson-lock-gate';

export async function generateStaticParams() {
  return getAllCourses().flatMap((course) =>
    flattenLessons(course).map((lesson) => ({ course: course.slug, lesson: lesson.slug }))
  );
}

export async function generateMetadata(
  { params }: { params: Promise<{ course: string; lesson: string }> }
): Promise<Metadata> {
  const p = await params;
  const ctx = getLesson(p.course, p.lesson);
  if (!ctx) return {};
  return {
    title: `${ctx.lesson.title} · ${ctx.course.title}`,
    description: ctx.lesson.summary,
  };
}

type Params = { course: string; lesson: string };

export default async function LessonPage({ params }: { params: Promise<Params> }) {
  const { course: courseSlug, lesson: lessonSlug } = await params;
  const ctx = getLesson(courseSlug, lessonSlug);
  if (!ctx) notFound();

  const blocking = await firstBlockingScope([
    { kind: 'course', id: courseSlug },
    { kind: 'lesson', id: `${courseSlug}/${lessonSlug}` },
  ]);
  if (blocking) {
    return (
      <LessonLockGate
        scopeKey={`${blocking.kind}/${blocking.id}`}
        title={blocking.kind === 'course' ? ctx.course.title : ctx.lesson.title}
        subtitle={blocking.kind === 'course' ? 'Cả khoá học đang khoá' : ctx.course.title}
      />
    );
  }

  let MDXContent: React.ComponentType;
  try {
    MDXContent = (await import(`@/content/courses/${courseSlug}/lessons/${lessonSlug}.mdx`)).default;
  } catch {
    notFound();
  }

  const stats = await getLessonStats(courseSlug, lessonSlug);
  const part = partOfLesson(ctx.course.parts, lessonSlug);
  const lessonNum = lessonNumberFromSlug(lessonSlug, ctx.index + 1);
  const totalNum = String(ctx.total).padStart(2, '0');

  return (
    <>
      <ReadingProgress />
      <div className="mx-auto max-w-6xl md:flex md:gap-10 md:px-6 md:py-8">
        <LessonSidebar course={ctx.course} currentLessonSlug={lessonSlug} />
        <main id="main-content" className="flex-1 min-w-0 px-6 py-6 md:py-2">
          <Breadcrumb
            items={[
              { label: 'Courses', href: '/' },
              { label: ctx.course.title, href: `/courses/${ctx.course.slug}` },
              { label: ctx.lesson.title },
            ]}
          />
          <article className="mx-auto max-w-[var(--container-prose)] mt-8">
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                  '@context': 'https://schema.org',
                  '@type': 'LearningResource',
                  name: ctx.lesson.title,
                  isPartOf: { '@type': 'Course', name: ctx.course.title },
                  learningResourceType: 'Lesson',
                  timeRequired: stats ? `PT${stats.readMinutes}M` : undefined,
                }),
              }}
            />

            <header className="mb-12">
              <p className="lesson-eyebrow">
                Lesson {lessonNum}
                <span aria-hidden style={{ color: 'color-mix(in oklab, var(--color-accent), transparent 60%)' }}>/</span>
                {totalNum}
              </p>
              <div className="lesson-title-row">
                <h1 className="lesson-title">{ctx.lesson.title}</h1>
                {ctx.course.slug === 'ai-in-your-project' && <LanguageToggle />}
                <BookmarkButton
                  path={`/courses/${ctx.course.slug}/lessons/${lessonSlug}`}
                  title={ctx.lesson.title}
                />
              </div>
              {ctx.lesson.summary && <p className="lesson-deck">{ctx.lesson.summary}</p>}

              <p className="lesson-meta">
                {part && (
                  <>
                    <span>
                      <span style={{ fontWeight: 600, color: 'var(--color-text-soft)' }}>Part {part.partIndex + 1}</span> · {part.partTitle}
                    </span>
                    <span aria-hidden className="lesson-meta-dot">●</span>
                  </>
                )}
                {stats && (
                  <>
                    <span>{stats.readMinutes} min read</span>
                    <span aria-hidden className="lesson-meta-dot">●</span>
                    <span>{stats.words.toLocaleString()} words</span>
                  </>
                )}
              </p>
            </header>

            <div className="prose-lesson">
              <MDXContent />
            </div>

            <PrevNext courseSlug={ctx.course.slug} prev={ctx.prev} next={ctx.next} />
          </article>
        </main>
      </div>
    </>
  );
}
