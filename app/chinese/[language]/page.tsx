import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { CHINESE_LANGUAGES, getChineseLanguage } from '@/content/chinese';
import { Breadcrumb } from '@/components/site/breadcrumb';

export function generateStaticParams() {
  return CHINESE_LANGUAGES.map((lang) => ({ language: lang.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ language: string }> },
): Promise<Metadata> {
  const { language } = await params;
  const lang = getChineseLanguage(language);
  if (!lang) return {};
  return {
    title: `${lang.title} (${lang.vietnameseName}) · IT Courses`,
    description: lang.summary,
  };
}

export default async function ChineseLanguagePage({
  params,
}: {
  params: Promise<{ language: string }>;
}) {
  const { language } = await params;
  const lang = getChineseLanguage(language);
  if (!lang) notFound();

  const lessonCount = lang.topics.reduce((acc, t) => acc + t.lessons.length, 0);

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-6 py-10 md:py-16">
      <Breadcrumb
        items={[
          { label: 'Tiếng Trung', href: '/chinese' },
          { label: lang.title },
        ]}
      />

      <header className="english-hero" style={{ marginTop: '1.5rem' }}>
        <p className="english-hero-eyebrow">{lang.vietnameseName}</p>
        <h1 className="english-hero-title">
          {lang.title} <span style={{ opacity: 0.55, fontWeight: 500 }}>· {lang.nativeName}</span>
        </h1>
        <p className="english-hero-deck">{lang.summary}</p>
        <p className="english-hero-meta">
          <span>{lang.region}</span>
          <span aria-hidden className="english-hero-dot">·</span>
          <span>{lang.topics.length} chủ đề</span>
          <span aria-hidden className="english-hero-dot">·</span>
          <span>{lessonCount} bài đã xuất bản</span>
        </p>
      </header>

      <section aria-label="Topics & lessons" className="mt-10">
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.5rem', marginBottom: '1rem' }}>
          Chủ đề
        </h2>
        <ol style={{ display: 'grid', gap: '0.85rem', listStyle: 'none', padding: 0 }}>
          {lang.topics.map((topic, i) => (
            <li
              key={topic.title}
              style={{
                padding: '1rem 1.25rem',
                border: '1px solid var(--color-rule)',
                borderRadius: '0.75rem',
                background: 'var(--color-bg)',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem' }}>
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  color: 'var(--color-accent)',
                }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span style={{ fontWeight: 600 }}>{topic.title}</span>
                {topic.lessons.length === 0 && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '0.7rem',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'var(--color-text-soft)',
                      opacity: 0.7,
                    }}
                  >
                    Sắp có
                  </span>
                )}
              </span>
              <p style={{ margin: '0.35rem 0 0', color: 'var(--color-text-soft)', fontSize: '0.95rem' }}>
                {topic.summary}
              </p>
              {topic.lessons.length > 0 && (
                <ul style={{ marginTop: '0.75rem', display: 'grid', gap: '0.35rem', listStyle: 'none', padding: 0 }}>
                  {topic.lessons.map((l) => (
                    <li key={l.slug}>
                      <Link
                        href={`/chinese/${lang.slug}/lessons/${l.slug}`}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '0.6rem 0.85rem',
                          border: '1px solid var(--color-rule)',
                          borderRadius: '0.5rem',
                          background: 'var(--color-bg-soft, var(--color-bg))',
                          color: 'var(--color-text)',
                          textDecoration: 'none',
                          fontSize: '0.95rem',
                        }}
                      >
                        <span style={{ fontWeight: 500 }}>{l.title}</span>
                        <span style={{ color: 'var(--color-link)', fontSize: '0.85rem' }}>
                          Bắt đầu →
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}
