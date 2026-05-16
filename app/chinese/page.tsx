import Link from 'next/link';
import type { Metadata } from 'next';
import { CHINESE_LANGUAGES } from '@/content/chinese';

export const metadata: Metadata = {
  title: 'Tiếng Trung · IT Courses',
  description:
    'Học tiếng Trung giao tiếp — Mandarin (Phổ Thông) và Cantonese (Quảng Đông) cho người Việt.',
};

export default function ChineseLandingPage() {
  return (
    <main id="main-content" className="mx-auto max-w-7xl px-6 py-10 md:py-16">
      <header className="english-hero">
        <p className="english-hero-eyebrow">Tiếng Trung giao tiếp</p>
        <h1 className="english-hero-title">中文 — Hai nhánh, hai trải nghiệm</h1>
        <p className="english-hero-deck">
          Mandarin và Cantonese cùng dùng chữ Hán, nhưng phát âm, thanh điệu và đời sống văn hoá rất khác nhau. Chọn nhánh phù hợp với mục tiêu — học tập, công việc, hay du lịch Hồng Kông.
        </p>
        <p className="english-hero-meta">
          <span>2 ngôn ngữ</span>
          <span aria-hidden className="english-hero-dot">·</span>
          <span>{CHINESE_LANGUAGES.reduce((acc, l) => acc + l.topics.length, 0)} chủ đề</span>
          <span aria-hidden className="english-hero-dot">·</span>
          <span>
            {CHINESE_LANGUAGES.reduce(
              (acc, l) => acc + l.topics.reduce((a, t) => a + t.lessons.length, 0),
              0,
            )} bài đã xuất bản
          </span>
        </p>
      </header>

      <section
        aria-label="Chinese languages"
        className="english-grid grid gap-4 mt-10 grid-cols-1 md:grid-cols-2"
      >
        {CHINESE_LANGUAGES.map((lang) => (
          <Link
            key={lang.slug}
            href={`/chinese/${lang.slug}`}
            aria-label={`${lang.title} — xem chi tiết`}
            className="en-topic-card-link"
          >
            <article className="en-topic-card en-topic-card--life">
              <div className="en-topic-card-fill">
                <span className="en-topic-card-tag">{lang.vietnameseName}</span>
                <h2 className="en-topic-card-title">
                  {lang.title} <span style={{ opacity: 0.6, fontWeight: 500 }}>· {lang.nativeName}</span>
                </h2>
                <p className="en-topic-card-summary">{lang.summary}</p>
                <ul className="en-topic-card-stats">
                  <li>
                    <span className="en-topic-card-stat-num">{lang.topics.length}</span>
                    <span className="en-topic-card-stat-label">chủ đề</span>
                  </li>
                  <li>
                    <span className="en-topic-card-stat-num">
                      {lang.topics.reduce((acc, t) => acc + t.lessons.length, 0)}
                    </span>
                    <span className="en-topic-card-stat-label">bài đã có</span>
                  </li>
                </ul>
              </div>
              <div className="en-topic-card-footer">
                <span className="en-topic-card-footer-left">{lang.region}</span>
                <span className="en-topic-card-cta">Xem lộ trình</span>
              </div>
            </article>
          </Link>
        ))}
      </section>
    </main>
  );
}
