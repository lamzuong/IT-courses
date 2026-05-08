import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import avatarPhoto from './avatar.jpg';

export const metadata: Metadata = {
  title: 'About',
  description: 'About Vương Ánh Lâm — frontend developer.',
};

function AvatarPortrait() {
  return (
    <div className="about-avatar-photo-wrap">
      {/* dashed orbit ring */}
      <svg className="about-avatar-ring" viewBox="0 0 320 320" aria-hidden>
        <circle
          cx="160"
          cy="160"
          r="155"
          fill="none"
          stroke="#0e6b3f"
          strokeWidth="1.5"
          strokeDasharray="2 8"
          className="about-avatar-orbit"
        />
      </svg>

      {/* circular photo */}
      <div className="about-avatar-photo">
        <Image
          src={avatarPhoto}
          alt="Portrait of Vương Ánh Lâm"
          fill
          sizes="(min-width: 768px) 420px, 360px"
          priority
          placeholder="blur"
          className="about-avatar-img"
        />
      </div>

      {/* code-bracket accent (top-left) */}
      <span className="about-avatar-bracket" aria-hidden>{'</>'}</span>

      {/* small lime dot accent (bottom-right) */}
      <span className="about-avatar-dot" aria-hidden />
    </div>
  );
}

const stack = [
  'React & TypeScript',
  'Next.js · App Router',
  'Tailwind & design tokens',
  'Accessibility & motion',
  'Design systems',
];

const principles = [
  { k: 'Calm', v: 'Restraint over noise — typography and spacing do most of the work.' },
  { k: 'Honest', v: 'Motion serves meaning, never decoration for its own sake.' },
  { k: 'Durable', v: 'Components that hold up across themes, scale, and time.' },
];

export default function AboutPage() {
  return (
    <main id="main-content" className="mx-auto max-w-6xl px-6 py-12 md:py-20">
      <div className="about-grid">
        {/* ── Avatar column ─────────────────────────────────────────────── */}
        <aside className="about-avatar-col">
          <div className="about-avatar">
            <AvatarPortrait />
          </div>
          <div className="about-avatar-meta">
            <p className="about-meta-eyebrow">Currently</p>
            <p className="about-meta-line">
              <span className="about-status-dot" aria-hidden /> Building &amp; teaching frontend.
            </p>
            <p className="about-meta-line about-meta-faint">Ho Chi Minh City · UTC+7</p>
          </div>
        </aside>

        {/* ── Content column ────────────────────────────────────────────── */}
        <section className="about-content">
          <p className="about-eyebrow about-fade" style={{ animationDelay: '0ms' }}>
            About · A short introduction
          </p>

          <h1 className="about-name about-fade" style={{ animationDelay: '90ms' }}>
            Hi, I&rsquo;m{' '}
            <span className="about-name-highlight">
              Vương Ánh Lâm
              <span className="about-name-underline" aria-hidden />
            </span>
            .
          </h1>

          <p className="about-role about-fade" style={{ animationDelay: '180ms' }}>
            Frontend developer — I build interfaces that feel calm, considered, and honest.
          </p>

          <p className="about-bio about-fade" style={{ animationDelay: '270ms' }}>
            I care about typography, clear information design, and motion that earns its place.
            Most of my time goes into React, TypeScript, and the small details that make a product
            feel finished — focus rings, empty states, the tenth keystroke that should still feel fast.
          </p>

          <div className="about-section about-fade" style={{ animationDelay: '360ms' }}>
            <h2 className="about-h2">I tend to reach for</h2>
            <ul className="about-stack">
              {stack.map((s, i) => (
                <li
                  key={s}
                  className="about-chip about-pop"
                  style={{ animationDelay: `${450 + i * 70}ms` }}
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>

          <div className="about-section about-fade" style={{ animationDelay: '820ms' }}>
            <h2 className="about-h2">How I work</h2>
            <dl className="about-principles">
              {principles.map((p, i) => (
                <div
                  key={p.k}
                  className="about-principle about-slide"
                  style={{ animationDelay: `${900 + i * 90}ms` }}
                >
                  <dt>{p.k}</dt>
                  <dd>{p.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="about-cta about-fade" style={{ animationDelay: '1250ms' }}>
            <Link href="/" className="about-cta-primary">
              Browse the courses
              <span aria-hidden>→</span>
            </Link>
            <Link href="/english" className="about-cta-ghost">
              Read the English series
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
