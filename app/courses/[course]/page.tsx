import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllCourses, getCourse } from '@/lib/courses';

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

export default async function CoursePage({ params }: { params: Promise<{ course: string }> }) {
  const { course: slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  // The project card heading already shows the project title, so strip a
  // leading "<title> —" prefix from whatYoullBuild for the card's description.
  const projectBlurb = course.whatYoullBuild.includes('—')
    ? course.whatYoullBuild.split('—').slice(1).join('—').trim()
    : course.whatYoullBuild;

  // The "What you'll build" panel uses the same trimmed blurb, since the
  // course title is already rendered as the page h1 just above it.
  const buildBlurb = projectBlurb;

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-6 py-16">
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
      <header className="mb-12">
        <p className="text-xs uppercase tracking-widest text-[color:var(--color-text-soft)] mb-3">Course</p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight leading-tight">{course.title}</h1>
        <p className="mt-4 text-lg text-[color:var(--color-text-soft)]">{course.longDescription}</p>

        <div className="mt-10 grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-[color:var(--color-text-soft)] mb-3">What you&apos;ll learn</h2>
            <ul className="space-y-2 text-sm">
              {course.whatYoullLearn.map((b) => <li key={b} className="flex gap-2"><span aria-hidden>·</span><span>{b}</span></li>)}
            </ul>
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-widest text-[color:var(--color-text-soft)] mb-3">What you&apos;ll build</h2>
            <p className="text-sm">{buildBlurb}</p>
          </div>
        </div>
      </header>

      <section>
        {course.parts.map((part, partIdx) => (
          <div key={part.title} className="mb-10">
            <h2 className="font-serif text-2xl font-semibold mb-4">
              <span className="text-[color:var(--color-text-soft)] mr-2">Part {partIdx + 1}.</span>
              {part.title}
            </h2>
            <ol className="border-t border-[color:var(--color-border)]">
              {part.lessons.map((lesson, idx) => (
                <li key={lesson.slug} className="border-b border-[color:var(--color-border)]">
                  <Link
                    href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                    className="flex items-baseline gap-4 py-3 hover:bg-[color:var(--color-bg-soft)] px-2 -mx-2 rounded"
                  >
                    <span className="font-mono text-xs text-[color:var(--color-text-soft)] w-8 shrink-0">{String(idx + 1).padStart(2, '0')}</span>
                    <span className="flex-1">
                      <span className="block font-medium">{lesson.title}</span>
                      {lesson.summary && <span className="block text-sm text-[color:var(--color-text-soft)] mt-0.5">{lesson.summary}</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        ))}

        <Link
          href={`/courses/${course.slug}/project`}
          className="block rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg-soft)] p-6 hover:border-black/30 transition"
        >
          <p className="text-xs uppercase tracking-widest text-[color:var(--color-text-soft)] mb-2">Final project</p>
          <h2 className="font-serif text-2xl font-semibold">{course.project.title}</h2>
          <p className="mt-2 text-sm text-[color:var(--color-text-soft)]">{projectBlurb}</p>
        </Link>
      </section>
    </main>
  );
}
