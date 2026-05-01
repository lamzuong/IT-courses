import Link from 'next/link';
import { getAllCourses, flattenLessons } from '@/lib/courses';
import { placeholderCourses } from '@/content/courses';
import { getCourseStats } from '@/lib/lesson-stats';
import type { ReactNode } from 'react';

type CardProps = {
  variant: 'peach' | 'sage' | 'butter' | 'sky';
  tag: string;
  title: string;
  summary: string;
  stats: { label: string; value: string }[];
  pct: number;
  pctLabel: string;
  footerLeft: string;
  cta: { label: string; href: string; disabled?: boolean };
  illustration: ReactNode;
};

function CourseCard({
  variant, tag, title, summary, stats, pct, pctLabel, footerLeft, cta, illustration,
}: CardProps) {
  const inner = (
    <article className={`course-card course-card--${variant}`}>
      <div className="course-card-fill">
        <div className="course-card-art" aria-hidden>{illustration}</div>
        <span className="course-card-tag">{tag}</span>
        <h2 className="course-card-title">{title}</h2>
        <p className="course-card-summary">{summary}</p>
        <ul className="course-card-stats">
          {stats.map((s) => (
            <li key={s.label}>
              <span className="course-card-stat-num">{s.value}</span>
              <span className="course-card-stat-label">{s.label}</span>
            </li>
          ))}
        </ul>
        <div className="course-card-progress-row">
          <span>Authoring</span>
          <span>{pctLabel}</span>
        </div>
        <div className="course-card-progress-track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={`Authoring progress: ${pctLabel}`}>
          <span className="course-card-progress-fill" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="course-card-footer">
        <span className="course-card-footer-left">{footerLeft}</span>
        {cta.disabled ? (
          <span className="course-card-cta course-card-cta--disabled">{cta.label}</span>
        ) : (
          <span className="course-card-cta">{cta.label}</span>
        )}
      </div>
    </article>
  );

  if (cta.disabled || cta.href === '#') return inner;
  return (
    <Link href={cta.href} aria-label={`${title} — ${cta.label}`} className="course-card-link">
      {inner}
    </Link>
  );
}

// ─── illustrations ─────────────────────────────────────────────────────────

function ArtDragDrop() {
  return (
    <svg viewBox="0 0 140 140" width="140" height="140" fill="none">
      <defs>
        <linearGradient id="dd-card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#c5e8a8" />
        </linearGradient>
      </defs>
      <rect x="22" y="22" width="74" height="46" rx="8" fill="url(#dd-card)" stroke="#091610" strokeWidth="2" />
      <rect x="44" y="50" width="74" height="46" rx="8" fill="#fff" stroke="#091610" strokeWidth="2" />
      <rect x="66" y="78" width="60" height="40" rx="8" fill="#091610" />
      <circle cx="74" cy="32" r="2.5" fill="#091610" />
      <circle cx="84" cy="32" r="2.5" fill="#091610" />
      <circle cx="94" cy="32" r="2.5" fill="#091610" />
      <path d="M30 110 Q 42 100, 60 102 T 96 88" stroke="#0e6b3f" strokeWidth="2" strokeDasharray="3 4" strokeLinecap="round" />
      <path d="M93 86 l 6 1 l -3 5" stroke="#0e6b3f" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArtAnimations() {
  return (
    <svg viewBox="0 0 140 140" width="140" height="140" fill="none">
      <path d="M14 90 Q 40 30, 70 70 T 130 50" stroke="#091610" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="14" cy="90" r="4" fill="#091610" />
      <circle cx="36" cy="60" r="3" fill="#fff" stroke="#091610" strokeWidth="2" />
      <circle cx="60" cy="74" r="3" fill="#fff" stroke="#091610" strokeWidth="2" />
      <circle cx="84" cy="62" r="3" fill="#fff" stroke="#091610" strokeWidth="2" />
      <circle cx="108" cy="56" r="3" fill="#fff" stroke="#091610" strokeWidth="2" />
      <circle cx="130" cy="50" r="6" fill="#9ee04a" stroke="#0a4729" strokeWidth="2" />
      <rect x="20" y="100" width="20" height="20" rx="3" fill="#fff" stroke="#091610" strokeWidth="2" transform="rotate(-8 30 110)" />
      <rect x="50" y="104" width="20" height="20" rx="3" fill="#fff" stroke="#091610" strokeWidth="2" transform="rotate(2 60 114)" />
      <rect x="80" y="108" width="20" height="20" rx="3" fill="#fff" stroke="#091610" strokeWidth="2" transform="rotate(10 90 118)" />
    </svg>
  );
}

function ArtAccessibility() {
  return (
    <svg viewBox="0 0 140 140" width="140" height="140" fill="none">
      <rect x="20" y="40" width="100" height="60" rx="8" fill="#fff" stroke="#091610" strokeWidth="2" />
      <rect x="28" y="50" width="14" height="10" rx="2" fill="#091610" />
      <rect x="46" y="50" width="14" height="10" rx="2" fill="#fff" stroke="#091610" strokeWidth="1.5" />
      <rect x="64" y="50" width="14" height="10" rx="2" fill="#fff" stroke="#091610" strokeWidth="1.5" />
      <rect x="82" y="50" width="14" height="10" rx="2" fill="#fff" stroke="#091610" strokeWidth="1.5" />
      <rect x="100" y="50" width="14" height="10" rx="2" fill="#fff" stroke="#091610" strokeWidth="1.5" />
      <rect x="28" y="64" width="14" height="10" rx="2" fill="#fff" stroke="#091610" strokeWidth="1.5" />
      <rect x="46" y="64" width="50" height="10" rx="2" fill="#fff" stroke="#091610" strokeWidth="1.5" />
      <rect x="100" y="64" width="14" height="10" rx="2" fill="#fff" stroke="#091610" strokeWidth="1.5" />
      <rect x="28" y="78" width="68" height="10" rx="2" fill="#fff" stroke="#091610" strokeWidth="1.5" />
      <rect x="100" y="78" width="14" height="10" rx="2" fill="#fff" stroke="#091610" strokeWidth="1.5" />
      {/* focus ring on the highlighted key */}
      <rect x="24" y="46" width="22" height="18" rx="4" fill="none" stroke="#0e6b3f" strokeWidth="2" strokeDasharray="3 3" />
      <text x="68" y="120" fontFamily="ui-monospace" fontSize="11" fill="#091610" fontWeight="600">Tab ↹</text>
    </svg>
  );
}

function ArtAIOperator() {
  return (
    <svg viewBox="0 0 140 140" width="140" height="140" fill="none">
      <defs>
        <linearGradient id="ai-card" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#c5e8a8" />
        </linearGradient>
      </defs>
      {/* graph: three nodes connected by arrows */}
      <circle cx="28" cy="34" r="9" fill="#fff" stroke="#091610" strokeWidth="2" />
      <circle cx="28" cy="78" r="9" fill="#fff" stroke="#091610" strokeWidth="2" />
      <circle cx="68" cy="56" r="11" fill="#9ee04a" stroke="#091610" strokeWidth="2" />
      <path d="M37 38 Q 50 44, 58 52" stroke="#0e6b3f" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M56 50 l 4 2 l -1 5" stroke="#0e6b3f" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M37 74 Q 50 68, 58 60" stroke="#0e6b3f" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M56 62 l 4 -2 l -1 -5" stroke="#0e6b3f" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* overlaid confirmation card */}
      <rect x="58" y="74" width="62" height="40" rx="6" fill="url(#ai-card)" stroke="#091610" strokeWidth="2" />
      <text x="65" y="89" fontFamily="ui-monospace" fontSize="8" fontWeight="600" fill="#091610">confirm?</text>
      {/* check mark */}
      <circle cx="76" cy="102" r="7" fill="#fff" stroke="#0e6b3f" strokeWidth="2" />
      <path d="M73 102 l 2.5 2.5 l 4.5 -5" stroke="#0e6b3f" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* cross mark */}
      <circle cx="102" cy="102" r="7" fill="#fff" stroke="#091610" strokeWidth="2" />
      <path d="M99 99 l 6 6 M105 99 l -6 6" stroke="#091610" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// ─── page ──────────────────────────────────────────────────────────────────

function formatHours(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = minutes / 60;
  return `~${h % 1 === 0 ? h : h.toFixed(1)} h`;
}

export default async function Home() {
  const courses = getAllCourses();
  const aiCourse = courses.find((c) => c.slug === 'ai-in-your-project')!;
  const dndCourse = courses.find((c) => c.slug === 'drag-drop-react')!;

  const aiLessonCount = flattenLessons(aiCourse).length;
  const dndLessonCount = flattenLessons(dndCourse).length;
  const aiStats = await getCourseStats(aiCourse.slug, aiCourse.parts);
  const dndStats = await getCourseStats(dndCourse.slug, dndCourse.parts);
  const aiTotalRead = formatHours(aiStats.totalMinutes);
  const dndTotalRead = formatHours(dndStats.totalMinutes);

  return (
    <main id="main-content" className="mx-auto max-w-5xl px-6 py-12 md:py-16">
      <header className="mb-10 md:mb-14">
        <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--color-text-faint)] font-semibold">
          IT Courses · A small shelf
        </p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mt-3 leading-[1.05] max-w-2xl">
          Hands-on courses on the parts of frontend I find interesting.
        </h1>
        <p className="font-serif italic text-lg text-[color:var(--color-text-soft)] mt-4 max-w-xl">
          Each course ships with its own working final project. No fluff, no quizzes — just builds you can read.
        </p>
      </header>

      <section aria-labelledby="course-shelf-heading">
        <h2 id="course-shelf-heading" className="sr-only">Available courses</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <CourseCard
            variant="peach"
            tag="Complete"
            title={aiCourse.title}
            summary={aiCourse.summary}
            stats={[
              { label: 'lessons', value: String(aiLessonCount) },
              { label: 'demos',   value: '17' },
              { label: 'project', value: '1' },
            ]}
            pct={100}
            pctLabel="Complete"
            footerLeft={`${aiLessonCount} lessons · ${aiTotalRead} read`}
            cta={{ label: 'Begin reading', href: `/courses/${aiCourse.slug}` }}
            illustration={<ArtAIOperator />}
          />

          <CourseCard
            variant="sage"
            tag="Complete"
            title={dndCourse.title}
            summary={dndCourse.summary}
            stats={[
              { label: 'lessons', value: String(dndLessonCount) },
              { label: 'demos',   value: '13' },
              { label: 'project', value: '1' },
            ]}
            pct={100}
            pctLabel="Complete"
            footerLeft={`${dndLessonCount} lessons · ${dndTotalRead} read`}
            cta={{ label: 'Begin reading', href: `/courses/${dndCourse.slug}` }}
            illustration={<ArtDragDrop />}
          />

          <CourseCard
            variant="butter"
            tag={placeholderCourses[0].tag}
            title={placeholderCourses[0].title}
            summary={placeholderCourses[0].summary}
            stats={[
              { label: 'lessons', value: String(placeholderCourses[0].lessons) },
              { label: 'demos',   value: String(placeholderCourses[0].demos) },
              { label: 'project', value: '1' },
            ]}
            pct={placeholderCourses[0].authoringPct}
            pctLabel={`${placeholderCourses[0].authoringPct}%`}
            footerLeft="Coming soon"
            cta={{ label: 'In progress', href: '#', disabled: true }}
            illustration={<ArtAnimations />}
          />

          <CourseCard
            variant="sky"
            tag={placeholderCourses[1].tag}
            title={placeholderCourses[1].title}
            summary={placeholderCourses[1].summary}
            stats={[
              { label: 'lessons', value: String(placeholderCourses[1].lessons) },
              { label: 'demos',   value: String(placeholderCourses[1].demos) },
              { label: 'project', value: '1' },
            ]}
            pct={placeholderCourses[1].authoringPct}
            pctLabel={`${placeholderCourses[1].authoringPct}%`}
            footerLeft="Coming soon"
            cta={{ label: 'Planned', href: '#', disabled: true }}
            illustration={<ArtAccessibility />}
          />
        </div>
      </section>

      <p className="mt-10 text-sm text-[color:var(--color-text-soft)] font-serif italic">
        New cards as I finish them. The shelf grows.
      </p>
    </main>
  );
}
