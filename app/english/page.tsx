// app/english/page.tsx
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllEnglishTopics } from '@/lib/english';
import { getEnglishTopicStats } from '@/lib/english-stats';

export const metadata: Metadata = {
  title: 'Tiếng Anh giao tiếp · IT Courses',
  description: 'Học tiếng Anh giao tiếp B1+ qua các tình huống thực tế.',
};

function formatReadTime(minutes: number): string {
  if (minutes < 60) return `~${minutes} phút đọc`;
  const h = minutes / 60;
  return `~${h % 1 === 0 ? h : h.toFixed(1)} giờ đọc`;
}

export default async function EnglishLandingPage() {
  const topics = getAllEnglishTopics();

  const statsByTopic = await Promise.all(
    topics.map(async (topic) => {
      if (topic.placeholder) return { totalMinutes: 0 };
      const { totalMinutes } = await getEnglishTopicStats(topic);
      return { totalMinutes };
    }),
  );

  const totalLessons = topics.reduce(
    (acc, t) => acc + (t.placeholder ? (t.plannedLessonCount ?? 0) : t.lessons.length),
    0,
  );
  const totalMinutes = statsByTopic.reduce((acc, s) => acc + s.totalMinutes, 0);

  return (
    <main id="main-content" className="mx-auto max-w-7xl px-6 py-10 md:py-16">
      <header className="english-hero">
        <p className="english-hero-eyebrow">Tiếng Anh giao tiếp</p>
        <h1 className="english-hero-title">Mẫu câu thường dùng — B1+</h1>
        <p className="english-hero-deck">
          Mỗi chủ đề là một loạt bài theo tình huống thực tế. Đọc, đối chiếu mẫu câu, học idiom — tiếng Anh dùng được thay vì tiếng Anh học thuộc.
        </p>
        <p className="english-hero-meta">
          <span>{topics.length} chủ đề</span>
          <span aria-hidden className="english-hero-dot">·</span>
          <span>{totalLessons} bài học</span>
          {totalMinutes > 0 && (
            <>
              <span aria-hidden className="english-hero-dot">·</span>
              <span>{formatReadTime(totalMinutes)}</span>
            </>
          )}
        </p>
      </header>

      <section
        aria-label="English topics"
        className="english-grid grid gap-4 mt-10 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
      >
        {topics.map((topic, i) => {
          const lessonCount = topic.placeholder
            ? (topic.plannedLessonCount ?? 0)
            : topic.lessons.length;
          const minutes = statsByTopic[i].totalMinutes;
          const card = (
            <article className={`en-topic-card en-topic-card--${topic.variant} ${topic.placeholder ? 'is-placeholder' : ''}`}>
              <div className="en-topic-card-fill">
                <span className="en-topic-card-tag">{topic.level}</span>
                <h2 className="en-topic-card-title">{topic.title}</h2>
                <p className="en-topic-card-summary">{topic.summary}</p>
                <ul className="en-topic-card-stats">
                  <li>
                    <span className="en-topic-card-stat-num">{lessonCount}</span>
                    <span className="en-topic-card-stat-label">bài học</span>
                  </li>
                  {minutes > 0 && (
                    <li>
                      <span className="en-topic-card-stat-num">{minutes}</span>
                      <span className="en-topic-card-stat-label">phút đọc</span>
                    </li>
                  )}
                </ul>
              </div>
              <div className="en-topic-card-footer">
                <span className="en-topic-card-footer-left">
                  {topic.variant === 'work' ? 'Công việc' : 'Đời sống'}
                </span>
                <span className={`en-topic-card-cta ${topic.placeholder ? 'en-topic-card-cta--disabled' : ''}`}>
                  {topic.placeholder ? 'Sắp có' : 'Bắt đầu'}
                </span>
              </div>
            </article>
          );

          if (topic.placeholder) return <div key={topic.slug}>{card}</div>;
          return (
            <Link
              key={topic.slug}
              href={`/english/${topic.slug}`}
              aria-label={`${topic.title} — bắt đầu`}
              className="en-topic-card-link"
            >
              {card}
            </Link>
          );
        })}
      </section>
    </main>
  );
}
