import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllCourses, getLesson, flattenLessons } from '@/lib/courses';
import { LessonSidebar } from '@/components/site/lesson-sidebar';
import { Breadcrumb } from '@/components/site/breadcrumb';
import { PrevNext } from '@/components/site/prev-next';

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

  // Dynamically import the MDX file. Path matches content/courses/<course>/lessons/<lesson>.mdx
  let MDXContent: React.ComponentType;
  try {
    MDXContent = (await import(`@/content/courses/${courseSlug}/lessons/${lessonSlug}.mdx`)).default;
  } catch {
    notFound();
  }

  return (
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
        <article className="mx-auto max-w-[var(--container-prose)] mt-6">
          <p className="text-xs uppercase tracking-widest text-[color:var(--color-text-soft)]">
            Lesson {ctx.index + 1} / {ctx.total}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mt-2 leading-tight">
            {ctx.lesson.title}
          </h1>
          {ctx.lesson.summary && (
            <p className="mt-3 text-lg text-[color:var(--color-text-soft)]">{ctx.lesson.summary}</p>
          )}

          <div className="mt-10 prose-lesson">
            <MDXContent />
          </div>

          <PrevNext courseSlug={ctx.course.slug} prev={ctx.prev} next={ctx.next} />
        </article>
      </main>
    </div>
  );
}
