import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  findChineseLesson,
  getAllChineseLessons,
} from '@/content/chinese';
import { Breadcrumb } from '@/components/site/breadcrumb';
import { firstBlockingScope } from '@/lib/locks';
import { LessonLockGate } from '@/components/site/lesson-lock-gate';

export function generateStaticParams() {
  return getAllChineseLessons().map(({ language, lesson }) => ({
    language: language.slug,
    lesson: lesson.slug,
  }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ language: string; lesson: string }> },
): Promise<Metadata> {
  const { language, lesson } = await params;
  const ctx = findChineseLesson(language, lesson);
  if (!ctx) return {};
  return {
    title: `${ctx.lesson.title} · ${ctx.language.title} · IT Courses`,
    description: ctx.lesson.summary,
  };
}

export default async function ChineseLessonPage({
  params,
}: {
  params: Promise<{ language: string; lesson: string }>;
}) {
  const { language, lesson } = await params;
  const ctx = findChineseLesson(language, lesson);
  if (!ctx) notFound();

  const blocking = await firstBlockingScope([
    { kind: 'chinese', id: language },
    { kind: 'chinese-lesson', id: `${language}/${lesson}` },
  ]);
  if (blocking) {
    return (
      <LessonLockGate
        scopeKey={`${blocking.kind}/${blocking.id}`}
        title={
          blocking.kind === 'chinese'
            ? `${ctx.language.title} (${ctx.language.vietnameseName})`
            : ctx.lesson.title
        }
        subtitle={
          blocking.kind === 'chinese'
            ? 'Cả phần ngôn ngữ đang khoá'
            : `${ctx.language.title} · ${ctx.topic.title}`
        }
      />
    );
  }

  let MDXContent: React.ComponentType;
  try {
    MDXContent = (
      await import(`@/content/chinese/${language}/lessons/${lesson}.mdx`)
    ).default;
  } catch {
    notFound();
  }

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-6 py-10 md:py-14">
      <Breadcrumb
        items={[
          { label: 'Tiếng Trung', href: '/chinese' },
          { label: ctx.language.title, href: `/chinese/${ctx.language.slug}` },
          { label: ctx.lesson.title },
        ]}
      />

      <header className="english-hero" style={{ marginTop: '1.5rem' }}>
        <p className="english-hero-eyebrow">
          {ctx.language.title} · {ctx.topic.title}
        </p>
        <h1 className="english-hero-title">{ctx.lesson.title}</h1>
        <p className="english-hero-deck">{ctx.lesson.summary}</p>
      </header>

      <article className="prose-lesson" style={{ marginTop: '2rem' }}>
        <MDXContent />
      </article>

      <p style={{ marginTop: '3rem', color: 'var(--color-text-soft)', fontSize: '0.95rem' }}>
        <Link
          href={`/chinese/${ctx.language.slug}`}
          style={{ color: 'var(--color-link)', borderBottom: '1px solid currentColor' }}
        >
          ← Quay lại {ctx.language.title}
        </Link>
      </p>
    </main>
  );
}
