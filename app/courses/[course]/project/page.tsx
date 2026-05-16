import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllCourses, getCourse } from '@/lib/courses';
import { LessonSidebar } from '@/components/site/lesson-sidebar';
import { Breadcrumb } from '@/components/site/breadcrumb';
import { hasScopeAccess } from '@/lib/locks';
import { LessonLockGate } from '@/components/site/lesson-lock-gate';

export async function generateStaticParams() {
  return getAllCourses().map((c) => ({ course: c.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ course: string }> }
): Promise<Metadata> {
  const { course: slug } = await params;
  const course = getCourse(slug);
  if (!course) return {};
  return { title: `${course.project.title} · ${course.title}`, description: course.whatYoullBuild };
}

export default async function ProjectPage({ params }: { params: Promise<{ course: string }> }) {
  const { course: slug } = await params;
  const course = getCourse(slug);
  if (!course) notFound();

  if (!(await hasScopeAccess({ kind: 'course', id: slug }))) {
    return <LessonLockGate scopeKey={`course/${slug}`} title={course.title} subtitle="Cả khoá học đang khoá" />;
  }

  let MDXContent: React.ComponentType;
  try {
    MDXContent = (await import(`@/content/courses/${slug}/project.mdx`)).default;
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl md:flex md:gap-10 md:px-6 md:py-8">
      <LessonSidebar course={course} isProject />
      <main id="main-content" className="flex-1 min-w-0 px-6 py-6 md:py-2">
        <Breadcrumb
          items={[
            { label: 'Courses', href: '/' },
            { label: course.title, href: `/courses/${course.slug}` },
            { label: course.project.title },
          ]}
        />
        <article className="mx-auto max-w-[var(--container-prose)] mt-6">
          <p className="text-xs uppercase tracking-widest text-[color:var(--color-text-soft)]">Final project</p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mt-2 leading-tight">
            {course.project.title}
          </h1>
          <div className="mt-10 prose-lesson">
            <MDXContent />
          </div>
        </article>
      </main>
    </div>
  );
}
