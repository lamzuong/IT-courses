import Link from 'next/link';
import { getAllCourses, flattenLessons } from '@/lib/courses';
import { placeholderCourses } from '@/content/courses';

export default function Home() {
  const courses = getAllCourses();

  return (
    <main id="main-content" className="mx-auto max-w-6xl px-6">
      <section className="py-20 text-center">
        <h1 className="font-serif text-5xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto leading-[1.05]">
          Hands-on courses on the parts of frontend I find interesting.
        </h1>
        <p className="mt-6 text-lg text-[color:var(--color-text-soft)] max-w-xl mx-auto">
          Each course ends in a real project you build yourself. No fluff.
        </p>
        <Link
          href={`/courses/${courses[0].slug}`}
          className="inline-block mt-8 px-5 py-3 bg-black text-white rounded-md text-sm font-medium hover:bg-black/85"
        >
          Start the first course →
        </Link>
      </section>

      <section className="pb-24">
        <p className="text-xs uppercase tracking-widest text-[color:var(--color-text-soft)] mb-6">
          Available courses
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {courses.map((course) => {
            const lessonCount = flattenLessons(course).length;
            return (
              <Link
                key={course.slug}
                href={`/courses/${course.slug}`}
                className="group rounded-md border border-[color:var(--color-border)] bg-white/50 p-6 hover:border-black/30 transition"
              >
                <div className="aspect-[16/9] rounded bg-gradient-to-br from-[#e8e2d8] to-[#d4cab9] mb-4" aria-hidden="true" />
                <h2 className="font-serif text-xl font-semibold">{course.title}</h2>
                <p className="mt-2 text-sm text-[color:var(--color-text-soft)] line-clamp-2">
                  {course.summary}
                </p>
                <p className="mt-3 text-xs uppercase tracking-wider text-[color:var(--color-text-soft)]">
                  {lessonCount} lessons · Project
                </p>
              </Link>
            );
          })}
          {placeholderCourses.map((p, i) => (
            <div
              key={i}
              className="rounded-md border border-dashed border-[color:var(--color-border)] p-6 opacity-50"
              aria-label="Coming soon"
            >
              <div className="aspect-[16/9] rounded bg-[color:var(--color-bg-soft)] mb-4" aria-hidden="true" />
              <h2 className="font-serif text-xl font-semibold">{p.title}</h2>
              <p className="mt-2 text-sm text-[color:var(--color-text-soft)]">{p.summary}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
