import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllCourses, getCourse, flattenLessons, lessonNumberFromSlug } from '@/lib/courses';
import { getCourseStats, toRoman } from '@/lib/lesson-stats';
import { BookmarkIndicator } from '@/components/site/bookmark-indicator';

export async function generateStaticParams() {
  return getAllCourses().map((c) => ({ course: c.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ course: string }> }
): Promise<Metadata> {
  const { course: slug } = await params;
  const course = getCourse(slug);
  if (!course) return {};
  return {
    title: course.title,
    description: course.summary,
    openGraph: { title: course.title, description: course.summary, type: 'website' },
  };
}

function formatReadTime(minutes: number): string {
  if (minutes < 60) return `~${minutes} min reading`;
  const h = minutes / 60;
  return `~${h % 1 === 0 ? h : h.toFixed(1)} hours reading`;
}

export default async function CoursePage({ params }: { params: Promise<{ course: string }> }) {
  const { course: slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  const { totalMinutes, perLesson } = await getCourseStats(slug, course.parts);
  const lessons = flattenLessons(course);
  const firstLessonSlug = lessons[0]?.slug;

  const projectBlurb = course.whatYoullBuild.includes('—')
    ? course.whatYoullBuild.split('—').slice(1).join('—').trim()
    : course.whatYoullBuild;

  // Continuous lesson numbering across parts
  let lessonCounter = 0;

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-6 py-10 md:py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Course',
            name: course.title,
            description: course.summary,
            provider: { '@type': 'Person', name: 'Phuoc Luu' },
          }),
        }}
      />

      <header className="agenda-header">
        <h1 className="agenda-title">{course.title}</h1>
        <p className="agenda-deck">{course.summary}</p>
        <p className="agenda-meta">
          <span>{lessons.length} lessons</span>
          <span aria-hidden className="agenda-meta-dot">·</span>
          <span>{formatReadTime(totalMinutes)}</span>
        </p>
      </header>

      <hr className="agenda-rule" />

      <section aria-label="Course curriculum">
        {course.parts.map((part, partIdx) => (
          <div key={part.title} className="agenda-part">
            <h2 className="agenda-part-label">
              <span className="agenda-part-pill">Part {toRoman(partIdx + 1)}</span>
              <span className="agenda-part-title">{part.title}</span>
            </h2>
            <ol className="agenda-list">
              {part.lessons.map((lesson) => {
                lessonCounter += 1;
                const readMin = perLesson[lesson.slug] ?? 0;
                const num = lessonNumberFromSlug(lesson.slug, lessonCounter);
                return (
                  <li key={lesson.slug} className="agenda-row">
                    <Link
                      href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                      className="agenda-link"
                    >
                      <span className="agenda-num">{num}.</span>
                      <span className="agenda-lesson-title">
                        <BookmarkIndicator path={`/courses/${course.slug}/lessons/${lesson.slug}`} />
                        {lesson.title}
                      </span>
                      <span className="agenda-time">{readMin} min</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        ))}

        <div className="agenda-part">
          <h2 className="agenda-part-label">
            <span className="agenda-part-pill">Final</span>
            <span className="agenda-part-title">Project</span>
          </h2>
          <ol className="agenda-list">
            <li className="agenda-row">
              <Link href={`/courses/${course.slug}/project`} className="agenda-link">
                <span className="agenda-num" aria-hidden>★</span>
                <span className="agenda-lesson-title">
                  {course.project.title}
                  <span className="agenda-lesson-summary">{projectBlurb}</span>
                </span>
                <span className="agenda-time">build</span>
              </Link>
            </li>
          </ol>
        </div>
      </section>

      {firstLessonSlug && (
        <div className="agenda-cta-row">
          <Link
            href={`/courses/${course.slug}/lessons/${firstLessonSlug}`}
            className="agenda-cta"
          >
            Begin reading <span aria-hidden>→</span>
          </Link>
        </div>
      )}
    </main>
  );
}
