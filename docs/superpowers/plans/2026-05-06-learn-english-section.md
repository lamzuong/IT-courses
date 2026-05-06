# Learn English Section — Implementation Plan (v0.1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the v0.1 of `/english` — the infrastructure for the Learn English section plus one fully-realized pilot topic (Restaurant & café) and 14 placeholder topic cards.

**Architecture:** A parallel content tree at `content/english/` mirroring `content/courses/`, with its own type system (`EnglishTopic`, `EnglishLessonMeta`), helper library (`lib/english.ts`), stats helper (`lib/english-stats.ts`), and four new MDX components (`Pattern`, `Dialogue`, `Vocab`, `Mistake`) used only inside English lessons. Three new app-router routes: `/english`, `/english/[topic]`, `/english/[topic]/lessons/[lesson]`. A single nav link at the top of the site is the only homepage-visible change.

**Tech Stack:** Next.js 16 App Router (Turbopack), React 19, MDX (`@next/mdx`), Tailwind v4, Vitest 4 (lib tests), `tsc --noEmit` (typecheck).

**Spec:** `docs/superpowers/specs/2026-05-06-learn-english-section-design.md`.

---

## File structure

**New files (creates):**

- `content/english/types.ts` — `EnglishTopic`, `EnglishLessonMeta` types.
- `content/english/index.ts` — `allEnglishTopics` registry.
- `content/english/restaurant-cafe/topic.ts` — pilot topic metadata.
- `content/english/restaurant-cafe/lessons/01-getting-seated.mdx` — pilot lesson 1 (full bilingual content).
- `content/english/restaurant-cafe/lessons/02-menu-and-dietary.mdx` — pilot lesson 2.
- `content/english/restaurant-cafe/lessons/03-ordering-customizing.mdx` — pilot lesson 3.
- `content/english/restaurant-cafe/lessons/04-during-the-meal.mdx` — pilot lesson 4.
- `content/english/restaurant-cafe/lessons/05-paying-tipping-leaving.mdx` — pilot lesson 5.
- `content/english/restaurant-cafe/lessons/06-cultural-notes-idioms.mdx` — pilot lesson 6 (capstone).
- `content/english/_placeholders/index.ts` — the 14 placeholder topic stubs.
- `lib/english.ts` — `getAllEnglishTopics`, `getEnglishTopic`, `getEnglishLesson`, `flattenEnglishLessons`.
- `lib/english.test.ts` — vitest tests for the above.
- `lib/english-stats.ts` — `getEnglishLessonStats`, `getEnglishTopicStats` (parallel to `lib/lesson-stats.ts`).
- `components/mdx/english/pattern.tsx` — sentence-pattern card.
- `components/mdx/english/dialogue.tsx` — multi-line bilingual dialogue.
- `components/mdx/english/vocab.tsx` — vocabulary list.
- `components/mdx/english/mistake.tsx` — wrong-vs-right pair.
- `components/site/english-topic-sidebar.tsx` — TOC sidebar parallel to `components/site/lesson-sidebar.tsx` but for English topics (no "parts", no project link).
- `app/english/page.tsx` — `/english` listing page.
- `app/english/[topic]/page.tsx` — `/english/<topic>` topic landing.
- `app/english/[topic]/lessons/[lesson]/page.tsx` — `/english/<topic>/lessons/<lesson>` lesson page.

**Modified files:**

- `mdx-components.tsx` — register `Pattern`, `Dialogue`, `Vocab`, `Mistake` in the MDX components map.
- `components/site/nav.tsx` — add `English` link in the right-hand `<nav aria-label="Site">`.
- `app/globals.css` — append section styles: English topic card variants (daily-life, work), Pattern/Dialogue/Vocab/Mistake component styles, English landing-page hero.

**Out of scope for v0.1 (explicit):**

- The 13 remaining real topics (small-talk, shopping, etc.). Only their stubs ship.
- Search index integration. The English content is not added to `lib/search-index.ts` in this plan; it remains course-only. Adding it is a follow-up.
- Sitemap/robots updates. Out of scope; these auto-pick-up when routes prerender, but verifying is a follow-up.
- Audio. Practice grading. Per-learner state.

---

## Phase 0 — Infrastructure

### Task 1: Types

**Files:**
- Create: `content/english/types.ts`

- [ ] **Step 1: Write the types file**

```ts
// content/english/types.ts
export type EnglishLessonMeta = {
  slug: string;        // matches MDX filename without extension
  title: string;       // displayed Vietnamese title
  scene?: string;      // optional scene tag, e.g., 'Vào quán & gọi đồ uống'
  summary?: string;    // optional one-liner
};

export type EnglishVariant = 'daily-life' | 'work';

export type EnglishTopic = {
  slug: string;
  title: string;            // displayed Vietnamese title
  englishTitle: string;     // for breadcrumb fallback / metadata
  summary: string;          // Vietnamese one-line summary
  level: 'B1+' | 'B2+';
  variant: EnglishVariant;
  lessons: EnglishLessonMeta[];
  placeholder?: boolean;
  plannedLessonCount?: number; // shown on placeholder cards when lessons.length === 0
};
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: passes (no other files reference these types yet, so this is just a syntax/parse check).

- [ ] **Step 3: Commit**

```bash
git add content/english/types.ts
git commit -m "feat(english): add EnglishTopic and EnglishLessonMeta types"
```

---

### Task 2: Empty registry

**Files:**
- Create: `content/english/index.ts`

- [ ] **Step 1: Write an empty registry**

```ts
// content/english/index.ts
import type { EnglishTopic } from './types';

export const allEnglishTopics: EnglishTopic[] = [];
```

The pilot topic and the placeholders will be appended in later tasks.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add content/english/index.ts
git commit -m "feat(english): add empty topics registry"
```

---

### Task 3: Helper library — TDD

**Files:**
- Create: `lib/english.ts`
- Create: `lib/english.test.ts`

This task uses TDD: write the failing test first, then implement.

- [ ] **Step 1: Write the failing test file**

```ts
// lib/english.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { EnglishTopic } from '@/content/english/types';

const fakeTopics: EnglishTopic[] = [
  {
    slug: 'restaurant-cafe',
    title: 'Nhà hàng & quán cà phê',
    englishTitle: 'Restaurant & café',
    summary: 'Test summary',
    level: 'B1+',
    variant: 'daily-life',
    lessons: [
      { slug: '01-a', title: 'Lesson A' },
      { slug: '02-b', title: 'Lesson B' },
      { slug: '03-c', title: 'Lesson C' },
    ],
  },
  {
    slug: 'small-talk',
    title: 'Trò chuyện xã giao',
    englishTitle: 'Small talk',
    summary: 'Test',
    level: 'B1+',
    variant: 'daily-life',
    lessons: [],
    placeholder: true,
    plannedLessonCount: 6,
  },
];

beforeEach(() => {
  vi.resetModules();
  // doMock is not hoisted — it runs after fakeTopics is defined, which is what we want.
  vi.doMock('@/content/english', () => ({ allEnglishTopics: fakeTopics }));
});

describe('getAllEnglishTopics', () => {
  it('returns all registered topics', async () => {
    const { getAllEnglishTopics } = await import('./english');
    expect(getAllEnglishTopics()).toHaveLength(2);
  });
});

describe('getEnglishTopic', () => {
  it('returns a topic by slug', async () => {
    const { getEnglishTopic } = await import('./english');
    expect(getEnglishTopic('restaurant-cafe')?.title).toBe('Nhà hàng & quán cà phê');
  });

  it('returns null for an unknown slug', async () => {
    const { getEnglishTopic } = await import('./english');
    expect(getEnglishTopic('nope')).toBeNull();
  });

  it('returns placeholder topics too', async () => {
    const { getEnglishTopic } = await import('./english');
    expect(getEnglishTopic('small-talk')?.placeholder).toBe(true);
  });
});

describe('flattenEnglishLessons', () => {
  it('returns the lessons array directly (no parts)', async () => {
    const { getEnglishTopic, flattenEnglishLessons } = await import('./english');
    const topic = getEnglishTopic('restaurant-cafe')!;
    const lessons = flattenEnglishLessons(topic);
    expect(lessons).toHaveLength(3);
    expect(lessons[0].slug).toBe('01-a');
  });
});

describe('getEnglishLesson', () => {
  it('returns lesson + neighbors for a middle lesson', async () => {
    const { getEnglishLesson } = await import('./english');
    const ctx = getEnglishLesson('restaurant-cafe', '02-b');
    expect(ctx).not.toBeNull();
    expect(ctx!.lesson.title).toBe('Lesson B');
    expect(ctx!.prev?.slug).toBe('01-a');
    expect(ctx!.next?.slug).toBe('03-c');
    expect(ctx!.index).toBe(1);
    expect(ctx!.total).toBe(3);
  });

  it('returns null prev for the first lesson', async () => {
    const { getEnglishLesson } = await import('./english');
    const ctx = getEnglishLesson('restaurant-cafe', '01-a');
    expect(ctx!.prev).toBeNull();
    expect(ctx!.next?.slug).toBe('02-b');
  });

  it('returns null next for the last lesson', async () => {
    const { getEnglishLesson } = await import('./english');
    const ctx = getEnglishLesson('restaurant-cafe', '03-c');
    expect(ctx!.prev?.slug).toBe('02-b');
    expect(ctx!.next).toBeNull();
  });

  it('returns null for unknown topic or lesson', async () => {
    const { getEnglishLesson } = await import('./english');
    expect(getEnglishLesson('nope', '01-a')).toBeNull();
    expect(getEnglishLesson('restaurant-cafe', 'nope')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run lib/english.test.ts`
Expected: FAIL — `Cannot find module './english'` (or similar).

- [ ] **Step 3: Implement the helper**

```ts
// lib/english.ts
import { allEnglishTopics } from '@/content/english';
import type { EnglishTopic, EnglishLessonMeta } from '@/content/english/types';

export function getAllEnglishTopics(): EnglishTopic[] {
  return allEnglishTopics;
}

export function getEnglishTopic(slug: string): EnglishTopic | null {
  return allEnglishTopics.find((t) => t.slug === slug) ?? null;
}

export function flattenEnglishLessons(topic: EnglishTopic): EnglishLessonMeta[] {
  return topic.lessons;
}

export type EnglishLessonContext = {
  topic: EnglishTopic;
  lesson: EnglishLessonMeta;
  prev: EnglishLessonMeta | null;
  next: EnglishLessonMeta | null;
  index: number;
  total: number;
};

export function getEnglishLesson(
  topicSlug: string,
  lessonSlug: string,
): EnglishLessonContext | null {
  const topic = getEnglishTopic(topicSlug);
  if (!topic) return null;
  const lessons = flattenEnglishLessons(topic);
  const index = lessons.findIndex((l) => l.slug === lessonSlug);
  if (index === -1) return null;
  return {
    topic,
    lesson: lessons[index],
    prev: index > 0 ? lessons[index - 1] : null,
    next: index < lessons.length - 1 ? lessons[index + 1] : null,
    index,
    total: lessons.length,
  };
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `npx vitest run lib/english.test.ts`
Expected: PASS — all 9 tests green.

- [ ] **Step 5: Run full test suite to confirm no regressions**

Run: `npm test`
Expected: all tests pass (existing course tests + the new english tests).

- [ ] **Step 6: Commit**

```bash
git add lib/english.ts lib/english.test.ts
git commit -m "feat(english): add lib helpers + tests for topic lookup"
```

---

### Task 4: Stats helper

**Files:**
- Create: `lib/english-stats.ts`

The existing `lib/lesson-stats.ts` is hardcoded to `content/courses/...` paths. Rather than refactor it (and risk regressions in 4 IT courses), we add a parallel implementation for English. The two are ~30 lines and intentionally don't share code; if a third content tree appears we'll factor.

- [ ] **Step 1: Write the stats helper**

```ts
// lib/english-stats.ts
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { EnglishTopic } from '@/content/english/types';

export type LessonStats = { words: number; readMinutes: number };

export async function getEnglishLessonStats(
  topicSlug: string,
  lessonSlug: string,
): Promise<LessonStats | null> {
  const file = path.join(
    process.cwd(),
    'content',
    'english',
    topicSlug,
    'lessons',
    `${lessonSlug}.mdx`,
  );
  let raw: string;
  try {
    raw = await readFile(file, 'utf8');
  } catch {
    return null;
  }
  const prose = raw
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/import\s.+?;/g, ' ')
    .replace(/[#*_>\-=|]+/g, ' ');
  const words = prose.split(/\s+/).filter((w) => w.length > 1).length;
  return { words, readMinutes: Math.max(1, Math.round(words / 220)) };
}

export async function getEnglishTopicStats(
  topic: EnglishTopic,
): Promise<{ totalMinutes: number; perLesson: Record<string, number> }> {
  const slugs = topic.lessons.map((l) => l.slug);
  const stats = await Promise.all(
    slugs.map((s) => getEnglishLessonStats(topic.slug, s)),
  );
  const perLesson: Record<string, number> = {};
  let totalMinutes = 0;
  slugs.forEach((slug, i) => {
    const m = stats[i]?.readMinutes ?? 0;
    perLesson[slug] = m;
    totalMinutes += m;
  });
  return { totalMinutes, perLesson };
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add lib/english-stats.ts
git commit -m "feat(english): add lesson + topic word-count and read-time helpers"
```

---

### Task 5: MDX components — Pattern + Vocab

**Files:**
- Create: `components/mdx/english/pattern.tsx`
- Create: `components/mdx/english/vocab.tsx`

- [ ] **Step 1: Write Pattern component**

```tsx
// components/mdx/english/pattern.tsx
import type { ReactNode } from 'react';

export function Pattern({
  en,
  vi,
  variations = [],
  note,
}: {
  en: string;
  vi: string;
  variations?: string[];
  note?: ReactNode;
}) {
  return (
    <div className="en-pattern">
      <p className="en-pattern-en">{en}</p>
      <p className="en-pattern-vi">{vi}</p>
      {variations.length > 0 && (
        <ul className="en-pattern-variations">
          {variations.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
      )}
      {note && <p className="en-pattern-note">{note}</p>}
    </div>
  );
}
```

- [ ] **Step 2: Write Vocab component**

```tsx
// components/mdx/english/vocab.tsx
type VocabItem = {
  en: string;
  ipa?: string;
  vi: string;
  example?: string;
};

export function Vocab({ items }: { items: VocabItem[] }) {
  return (
    <dl className="en-vocab">
      {items.map((item) => (
        <div key={item.en} className="en-vocab-row">
          <dt className="en-vocab-term">
            <span className="en-vocab-en">{item.en}</span>
            {item.ipa && <span className="en-vocab-ipa">/{item.ipa}/</span>}
          </dt>
          <dd className="en-vocab-def">
            <span className="en-vocab-vi">{item.vi}</span>
            {item.example && <span className="en-vocab-example">{item.example}</span>}
          </dd>
        </div>
      ))}
    </dl>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add components/mdx/english/pattern.tsx components/mdx/english/vocab.tsx
git commit -m "feat(english): add Pattern and Vocab MDX components"
```

---

### Task 6: MDX components — Dialogue + Mistake

**Files:**
- Create: `components/mdx/english/dialogue.tsx`
- Create: `components/mdx/english/mistake.tsx`

- [ ] **Step 1: Write Dialogue component**

```tsx
// components/mdx/english/dialogue.tsx
type DialogueLine = {
  speaker: string;
  en: string;
  vi: string;
};

export function Dialogue({ lines }: { lines: DialogueLine[] }) {
  return (
    <div className="en-dialogue" role="group" aria-label="Sample dialogue">
      {lines.map((line, i) => (
        <div key={i} className="en-dialogue-line">
          <span className="en-dialogue-speaker">{line.speaker}:</span>
          <p className="en-dialogue-en">{line.en}</p>
          <p className="en-dialogue-vi">{line.vi}</p>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Write Mistake component**

```tsx
// components/mdx/english/mistake.tsx
import type { ReactNode } from 'react';

export function Mistake({
  wrong,
  right,
  why,
}: {
  wrong: string;
  right: string;
  why: ReactNode;
}) {
  return (
    <div className="en-mistake" role="note" aria-label="Common mistake">
      <div className="en-mistake-row">
        <span className="en-mistake-label en-mistake-label--wrong">Sai</span>
        <p className="en-mistake-wrong">{wrong}</p>
      </div>
      <div className="en-mistake-row">
        <span className="en-mistake-label en-mistake-label--right">Đúng</span>
        <p className="en-mistake-right">{right}</p>
      </div>
      <p className="en-mistake-why">{why}</p>
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add components/mdx/english/dialogue.tsx components/mdx/english/mistake.tsx
git commit -m "feat(english): add Dialogue and Mistake MDX components"
```

---

### Task 7: Wire components into MDX runtime

**Files:**
- Modify: `mdx-components.tsx`

- [ ] **Step 1: Update mdx-components.tsx**

Replace the existing file contents with:

```tsx
// mdx-components.tsx
import type { MDXComponents } from 'mdx/types';
import { CodeBlock } from '@/components/mdx/code-block';
import { Callout } from '@/components/mdx/callout';
import { Demo } from '@/components/mdx/demo';
import { Recap } from '@/components/mdx/recap';
import { Pattern } from '@/components/mdx/english/pattern';
import { Vocab } from '@/components/mdx/english/vocab';
import { Dialogue } from '@/components/mdx/english/dialogue';
import { Mistake } from '@/components/mdx/english/mistake';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    pre: (props) => <CodeBlock>{props.children}</CodeBlock>,
    Callout,
    Demo,
    Recap,
    Pattern,
    Vocab,
    Dialogue,
    Mistake,
  };
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add mdx-components.tsx
git commit -m "feat(english): register Pattern/Vocab/Dialogue/Mistake in MDX runtime"
```

---

### Task 8: English topic sidebar

**Files:**
- Create: `components/site/english-topic-sidebar.tsx`

The IT-courses `LessonSidebar` is keyed on `course.parts` and links to `/courses/...`. English topics have no parts and live at `/english/...`, so we author a parallel component. It is simpler — no Roman-numeral parts, no project link, no scroll-position memory (lessons within a topic are short enough that the cost is low).

- [ ] **Step 1: Write the sidebar component**

```tsx
// components/site/english-topic-sidebar.tsx
'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { EnglishTopic } from '@/content/english/types';

export function EnglishTopicSidebar({
  topic,
  currentLessonSlug,
}: {
  topic: EnglishTopic;
  currentLessonSlug?: string;
}) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const dlg = dialogRef.current;
    if (!dlg) return;
    const focusable = dlg.querySelectorAll<HTMLElement>('a, button');
    focusable[0]?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        return;
      }
      if (e.key !== 'Tab' || focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const list = (
    <nav aria-label="Lessons in this topic" className="toc">
      <p className="toc-part-label">
        <span className="toc-part-pill">{topic.level}</span>
        <span className="toc-part-title">{topic.title}</span>
      </p>
      <ol className="toc-list">
        {topic.lessons.map((lesson, i) => {
          const active = lesson.slug === currentLessonSlug;
          return (
            <li key={lesson.slug} className="toc-item-wrap">
              <Link
                href={`/english/${topic.slug}/lessons/${lesson.slug}`}
                aria-current={active ? 'page' : undefined}
                className={`toc-item ${active ? 'is-active' : ''}`}
                onClick={() => setOpen(false)}
              >
                <span className="toc-num">{String(i + 1).padStart(2, '0')}</span>
                <span className="toc-title">{lesson.title}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </nav>
  );

  return (
    <>
      <aside className="hidden md:block w-72 shrink-0 sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto pr-4 pb-8">
        {list}
      </aside>

      <div className="md:hidden border-b border-[color:var(--color-border)] px-4 py-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="english-lesson-drawer"
          className="text-sm font-medium underline-offset-2 hover:underline"
        >
          {open ? 'Hide lessons' : 'Lessons'}
        </button>
      </div>
      {open && (
        <div
          id="english-lesson-drawer"
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Lessons in this topic"
          className="md:hidden fixed inset-0 bg-[color:var(--color-bg)] z-40 overflow-y-auto p-6"
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-sm underline mb-4"
          >
            Close
          </button>
          {list}
        </div>
      )}
    </>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add components/site/english-topic-sidebar.tsx
git commit -m "feat(english): add EnglishTopicSidebar"
```

---

### Task 9: Routes — `/english` landing

**Files:**
- Create: `app/english/page.tsx`

- [ ] **Step 1: Write the landing page**

```tsx
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
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add app/english/page.tsx
git commit -m "feat(english): add /english landing page with topic grid"
```

---

### Task 10: Routes — topic landing + lesson page

**Files:**
- Create: `app/english/[topic]/page.tsx`
- Create: `app/english/[topic]/lessons/[lesson]/page.tsx`

- [ ] **Step 1: Write the topic landing page**

```tsx
// app/english/[topic]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getAllEnglishTopics, getEnglishTopic, flattenEnglishLessons } from '@/lib/english';
import { getEnglishTopicStats } from '@/lib/english-stats';

export async function generateStaticParams() {
  return getAllEnglishTopics()
    .filter((t) => !t.placeholder)
    .map((t) => ({ topic: t.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<{ topic: string }> },
): Promise<Metadata> {
  const { topic: slug } = await params;
  const topic = getEnglishTopic(slug);
  if (!topic) return {};
  return {
    title: `${topic.title} · Tiếng Anh giao tiếp`,
    description: topic.summary,
  };
}

function formatReadTime(minutes: number): string {
  if (minutes < 60) return `~${minutes} phút đọc`;
  const h = minutes / 60;
  return `~${h % 1 === 0 ? h : h.toFixed(1)} giờ đọc`;
}

export default async function EnglishTopicPage({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic: slug } = await params;
  const topic = getEnglishTopic(slug);
  if (!topic || topic.placeholder) notFound();

  const { totalMinutes, perLesson } = await getEnglishTopicStats(topic);
  const lessons = flattenEnglishLessons(topic);
  const firstSlug = lessons[0]?.slug;

  return (
    <main id="main-content" className="mx-auto max-w-3xl px-6 py-10 md:py-16">
      <header className="agenda-header">
        <p className="agenda-eyebrow">Tiếng Anh giao tiếp · {topic.level}</p>
        <h1 className="agenda-title">{topic.title}</h1>
        <p className="agenda-deck">{topic.summary}</p>
        <p className="agenda-meta">
          <span>{lessons.length} bài học</span>
          <span aria-hidden className="agenda-meta-dot">·</span>
          <span>{formatReadTime(totalMinutes)}</span>
        </p>
      </header>

      <hr className="agenda-rule" />

      <section aria-label="Topic lessons">
        <ol className="agenda-list">
          {lessons.map((lesson, i) => {
            const min = perLesson[lesson.slug] ?? 0;
            return (
              <li key={lesson.slug} className="agenda-row">
                <Link
                  href={`/english/${topic.slug}/lessons/${lesson.slug}`}
                  className="agenda-link"
                >
                  <span className="agenda-num">{i + 1}.</span>
                  <span className="agenda-lesson-title">
                    {lesson.title}
                    {lesson.scene && (
                      <span className="agenda-lesson-summary">{lesson.scene}</span>
                    )}
                  </span>
                  <span className="agenda-time">{min} phút</span>
                </Link>
              </li>
            );
          })}
        </ol>
      </section>

      {firstSlug && (
        <div className="agenda-cta-row">
          <Link
            href={`/english/${topic.slug}/lessons/${firstSlug}`}
            className="agenda-cta"
          >
            Bắt đầu bài 1 <span aria-hidden>→</span>
          </Link>
        </div>
      )}
    </main>
  );
}
```

- [ ] **Step 2: Write the lesson page**

```tsx
// app/english/[topic]/lessons/[lesson]/page.tsx
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import {
  getAllEnglishTopics,
  getEnglishLesson,
  flattenEnglishLessons,
} from '@/lib/english';
import { getEnglishLessonStats } from '@/lib/english-stats';
import { EnglishTopicSidebar } from '@/components/site/english-topic-sidebar';
import { Breadcrumb } from '@/components/site/breadcrumb';
import { ReadingProgress } from '@/components/site/reading-progress';

export async function generateStaticParams() {
  return getAllEnglishTopics()
    .filter((t) => !t.placeholder)
    .flatMap((topic) =>
      flattenEnglishLessons(topic).map((lesson) => ({
        topic: topic.slug,
        lesson: lesson.slug,
      })),
    );
}

export async function generateMetadata(
  { params }: { params: Promise<{ topic: string; lesson: string }> },
): Promise<Metadata> {
  const p = await params;
  const ctx = getEnglishLesson(p.topic, p.lesson);
  if (!ctx) return {};
  return {
    title: `${ctx.lesson.title} · ${ctx.topic.title}`,
    description: ctx.lesson.summary,
  };
}

type Params = { topic: string; lesson: string };

export default async function EnglishLessonPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { topic: topicSlug, lesson: lessonSlug } = await params;
  const ctx = getEnglishLesson(topicSlug, lessonSlug);
  if (!ctx) notFound();

  let MDXContent: React.ComponentType;
  try {
    MDXContent = (
      await import(`@/content/english/${topicSlug}/lessons/${lessonSlug}.mdx`)
    ).default;
  } catch {
    notFound();
  }

  const stats = await getEnglishLessonStats(topicSlug, lessonSlug);
  const lessonNum = String(ctx.index + 1).padStart(2, '0');
  const totalNum = String(ctx.total).padStart(2, '0');

  return (
    <>
      <ReadingProgress />
      <div className="mx-auto max-w-6xl md:flex md:gap-10 md:px-6 md:py-8">
        <EnglishTopicSidebar
          topic={ctx.topic}
          currentLessonSlug={lessonSlug}
        />
        <main id="main-content" className="flex-1 min-w-0 px-6 py-6 md:py-2">
          <Breadcrumb
            items={[
              { label: 'English', href: '/english' },
              { label: ctx.topic.title, href: `/english/${ctx.topic.slug}` },
              { label: ctx.lesson.title },
            ]}
          />
          <article className="mx-auto max-w-[var(--container-prose)] mt-8">
            <header className="mb-12">
              <p className="lesson-eyebrow">
                Bài {lessonNum}
                <span aria-hidden style={{ color: 'color-mix(in oklab, var(--color-accent), transparent 60%)' }}>/</span>
                {totalNum}
              </p>
              <h1 className="lesson-title">{ctx.lesson.title}</h1>
              {ctx.lesson.scene && <p className="lesson-deck">{ctx.lesson.scene}</p>}

              <p className="lesson-meta">
                {stats && (
                  <>
                    <span>{stats.readMinutes} phút đọc</span>
                    <span aria-hidden className="lesson-meta-dot">●</span>
                    <span>{stats.words.toLocaleString()} từ</span>
                  </>
                )}
              </p>
            </header>

            <div className="prose-lesson">
              <MDXContent />
            </div>

            <nav aria-label="Lesson navigation" className="prevnext">
              {ctx.prev ? (
                <Link
                  href={`/english/${ctx.topic.slug}/lessons/${ctx.prev.slug}`}
                  className="prevnext-card prev"
                >
                  <span className="prevnext-direction">Bài trước</span>
                  <span className="prevnext-title">{ctx.prev.title}</span>
                </Link>
              ) : (
                <div aria-hidden />
              )}
              {ctx.next ? (
                <Link
                  href={`/english/${ctx.topic.slug}/lessons/${ctx.next.slug}`}
                  className="prevnext-card next"
                >
                  <span className="prevnext-direction">Bài tiếp theo</span>
                  <span className="prevnext-title">{ctx.next.title}</span>
                </Link>
              ) : (
                <div aria-hidden />
              )}
            </nav>
          </article>
        </main>
      </div>
    </>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add app/english/[topic]/page.tsx app/english/[topic]/lessons/[lesson]/page.tsx
git commit -m "feat(english): add topic landing and lesson routes"
```

---

### Task 11: Top-nav link

**Files:**
- Modify: `components/site/nav.tsx`

- [ ] **Step 1: Add the English link**

In `components/site/nav.tsx`, find the `<nav aria-label="Site">` block (around line 95):

```tsx
<nav aria-label="Site" className="flex gap-5 text-sm">
  <Link href="/" className="hover:underline">Courses</Link>
  <Link href="/about" className="hover:underline opacity-70 hidden sm:inline">About</Link>
</nav>
```

Replace it with:

```tsx
<nav aria-label="Site" className="flex gap-5 text-sm">
  <Link href="/" className="hover:underline">Courses</Link>
  <Link href="/english" className="hover:underline">English</Link>
  <Link href="/about" className="hover:underline opacity-70 hidden sm:inline">About</Link>
</nav>
```

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 3: Commit**

```bash
git add components/site/nav.tsx
git commit -m "feat(english): add English top-nav link"
```

---

### Task 12: CSS — card variants + MDX component styles

**Files:**
- Modify: `app/globals.css`

- [ ] **Step 1: Append English-section styles**

Append the following block to the end of `app/globals.css`:

```css
/* ───────────────────────── English section ───────────────────────── */

.english-hero {
  text-align: center;
  margin-bottom: 1.5rem;
}
.english-hero-eyebrow {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-soft);
}
.english-hero-title {
  font-family: var(--font-serif);
  font-size: clamp(2rem, 4vw, 2.75rem);
  letter-spacing: -0.015em;
  margin: 0.25rem 0 0.75rem;
}
.english-hero-deck {
  max-width: 38rem;
  margin: 0 auto;
  color: var(--color-text-soft);
  font-size: 1.05rem;
  line-height: 1.6;
}
.english-hero-meta {
  margin-top: 0.75rem;
  font-size: 0.9rem;
  color: var(--color-text-soft);
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
}
.english-hero-dot { opacity: 0.5; }

.en-topic-card-link {
  display: block;
  height: 100%;
  text-decoration: none;
  color: inherit;
}

.en-topic-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  border: 1px solid var(--color-border);
  border-radius: 14px;
  background: var(--color-bg);
  overflow: hidden;
  transition: transform 160ms ease, border-color 160ms ease, box-shadow 160ms ease;
}
.en-topic-card-link:hover .en-topic-card {
  transform: translateY(-2px);
  border-color: var(--color-accent);
  box-shadow: 0 12px 32px -16px color-mix(in oklab, var(--color-accent), transparent 60%);
}

.en-topic-card-fill {
  flex: 1;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: var(--card-wash, var(--color-bg-soft));
}
.en-topic-card-tag {
  align-self: flex-start;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 0.18rem 0.5rem;
  border-radius: 999px;
  background: var(--color-bg);
  color: var(--color-text-soft);
  border: 1px solid var(--color-border);
}
.en-topic-card-title {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  letter-spacing: -0.01em;
  margin: 0.25rem 0 0;
  color: var(--color-ink);
}
.en-topic-card-summary {
  color: var(--color-text-soft);
  font-size: 0.92rem;
  line-height: 1.5;
}
.en-topic-card-stats {
  list-style: none;
  display: flex;
  gap: 1.25rem;
  padding: 0;
  margin-top: auto;
  padding-top: 0.5rem;
}
.en-topic-card-stat-num {
  display: block;
  font-family: var(--font-serif);
  font-size: 1.4rem;
  line-height: 1;
  color: var(--color-ink);
}
.en-topic-card-stat-label {
  font-size: 0.75rem;
  color: var(--color-text-soft);
}
.en-topic-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.25rem;
  border-top: 1px solid var(--color-border);
  background: var(--color-bg);
}
.en-topic-card-footer-left {
  font-size: 0.78rem;
  color: var(--color-text-soft);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.en-topic-card-cta {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--color-accent);
}
.en-topic-card-cta--disabled {
  color: var(--color-text-faint);
}
.en-topic-card.is-placeholder {
  opacity: 0.7;
  cursor: default;
}

/* Two palette variants */
.en-topic-card--daily-life { --card-wash: #d6efe7; }   /* soft cyan/teal */
.en-topic-card--work       { --card-wash: #d6dded; }   /* muted indigo/slate */

/* ── Pattern card ── */
.en-pattern {
  border-left: 3px solid var(--color-accent);
  background: var(--color-bg-soft);
  padding: 0.85rem 1rem;
  border-radius: 0 8px 8px 0;
  margin: 1.25rem 0;
}
.en-pattern-en {
  font-family: var(--font-serif);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-ink);
  margin: 0;
}
.en-pattern-vi {
  color: var(--color-text-soft);
  font-size: 0.95rem;
  margin: 0.2rem 0 0;
  font-style: italic;
}
.en-pattern-variations {
  list-style: '— ';
  padding-left: 1.25rem;
  margin: 0.6rem 0 0;
  font-size: 0.95rem;
  color: var(--color-text);
}
.en-pattern-variations li { margin: 0.15rem 0; }
.en-pattern-note {
  margin: 0.6rem 0 0;
  font-size: 0.85rem;
  color: var(--color-text-soft);
  border-top: 1px dashed var(--color-rule);
  padding-top: 0.4rem;
}

/* ── Vocab list ── */
.en-vocab {
  margin: 1.25rem 0;
  display: grid;
  gap: 0.4rem;
}
.en-vocab-row {
  display: grid;
  grid-template-columns: minmax(8rem, 14rem) 1fr;
  gap: 1rem;
  padding: 0.4rem 0;
  border-bottom: 1px dashed var(--color-rule);
}
.en-vocab-term { display: flex; gap: 0.5rem; align-items: baseline; }
.en-vocab-en { font-weight: 600; color: var(--color-ink); }
.en-vocab-ipa {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  color: var(--color-text-faint);
}
.en-vocab-def { display: flex; flex-direction: column; gap: 0.15rem; }
.en-vocab-vi { color: var(--color-text); }
.en-vocab-example {
  font-size: 0.85rem;
  color: var(--color-text-soft);
  font-style: italic;
}

/* ── Dialogue ── */
.en-dialogue {
  margin: 1.25rem 0;
  display: grid;
  gap: 0.85rem;
  border-left: 3px solid var(--color-rule);
  padding-left: 1rem;
}
.en-dialogue-line { display: grid; gap: 0.1rem; }
.en-dialogue-speaker {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-soft);
}
.en-dialogue-en {
  font-family: var(--font-serif);
  margin: 0;
  color: var(--color-ink);
}
.en-dialogue-vi {
  margin: 0;
  color: var(--color-text-soft);
  font-size: 0.92rem;
  font-style: italic;
}

/* ── Mistake ── */
.en-mistake {
  margin: 1.25rem 0;
  border: 1px solid var(--color-rule);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  display: grid;
  gap: 0.4rem;
}
.en-mistake-row { display: flex; gap: 0.65rem; align-items: baseline; }
.en-mistake-label {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  padding: 0.1rem 0.4rem;
  border-radius: 999px;
  flex-shrink: 0;
}
.en-mistake-label--wrong { background: #fcd9d6; color: #7a1a14; }
.en-mistake-label--right { background: #d6f0d8; color: #1a5a1f; }
.en-mistake-wrong { margin: 0; text-decoration: line-through; color: var(--color-text-soft); }
.en-mistake-right { margin: 0; color: var(--color-ink); font-weight: 500; }
.en-mistake-why {
  margin: 0.2rem 0 0;
  font-size: 0.88rem;
  color: var(--color-text-soft);
  border-top: 1px dashed var(--color-rule);
  padding-top: 0.3rem;
}

/* Lesson eyebrow already exists; make sure agenda-eyebrow has a default */
.agenda-eyebrow {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-soft);
  margin: 0 0 0.25rem;
}
```

- [ ] **Step 2: Verify the dev server renders**

Run: `npm run dev` then open `http://localhost:3000/english` (the page will be empty — no topics registered yet, and the page guards that case below the hero). Verify the hero renders without console errors. Stop dev server.

Note: at this point the grid is empty because `allEnglishTopics === []`. That's expected; topics are added in Phase 1 + Phase 2.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "feat(english): add English-section styles (cards, patterns, dialogues, mistakes)"
```

---

## Phase 1 — Pilot topic (Restaurant & café)

> **Note on Phase 1 task shape.** Task 14 (lesson 01) is fully authored in the plan — every section, every Pattern/Vocab/Dialogue/Mistake — and serves as the *template* for the remaining lessons. Tasks 15–18 use detailed structural specs (each required pattern, vocab item, dialogue setup, idiom, etc., is named explicitly) rather than fully-authored MDX. Reason: pre-authoring 6 × ~2,000-word bilingual lessons inside this plan would push it past usable size, and the structural specs are sufficient for an executor to follow Task 14's template. Task 19 (the capstone lesson 06) likewise uses a structural spec but with explicit shape differences from the scene-driven lesson 01.

### Task 13: Pilot topic metadata + register in index

**Files:**
- Create: `content/english/restaurant-cafe/topic.ts`
- Modify: `content/english/index.ts`

- [ ] **Step 1: Write the topic file**

```ts
// content/english/restaurant-cafe/topic.ts
import type { EnglishTopic } from '../types';

export const topic: EnglishTopic = {
  slug: 'restaurant-cafe',
  title: 'Nhà hàng & quán cà phê',
  englishTitle: 'Restaurant & café',
  summary:
    'Đặt bàn, gọi món, hỏi về thực đơn, xử lý vấn đề và thanh toán — tất cả trong tiếng Anh tự nhiên, lịch sự.',
  level: 'B1+',
  variant: 'daily-life',
  lessons: [
    {
      slug: '01-getting-seated',
      title: 'Vào quán & gọi đồ uống đầu',
      scene: 'Bước vào quán, được dẫn bàn, gọi đồ uống.',
    },
    {
      slug: '02-menu-and-dietary',
      title: 'Hỏi về thực đơn & ăn kiêng',
      scene: 'Hỏi món, dị ứng, chế độ ăn riêng (chay, không gluten…).',
    },
    {
      slug: '03-ordering-customizing',
      title: 'Gọi món & yêu cầu thay đổi',
      scene: 'Đặt món chính, sửa nguyên liệu, chia phần.',
    },
    {
      slug: '04-during-the-meal',
      title: 'Trong bữa ăn — yêu cầu, vấn đề, trò chuyện nhỏ',
      scene: 'Xin thêm đồ, phàn nàn nhẹ nhàng, trò chuyện với phục vụ.',
    },
    {
      slug: '05-paying-tipping-leaving',
      title: 'Thanh toán, tip & rời quán',
      scene: 'Xin hoá đơn, chia tiền, tip, lời chào tạm biệt.',
    },
    {
      slug: '06-cultural-notes-idioms',
      title: 'Văn hoá & idiom',
      scene: 'Khác biệt văn hoá ăn uống, idiom liên quan đến đồ ăn.',
    },
  ],
};
```

- [ ] **Step 2: Register in index**

Replace `content/english/index.ts` with:

```ts
// content/english/index.ts
import type { EnglishTopic } from './types';
import { topic as restaurantCafe } from './restaurant-cafe/topic';

export const allEnglishTopics: EnglishTopic[] = [
  restaurantCafe,
];
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add content/english/restaurant-cafe/topic.ts content/english/index.ts
git commit -m "feat(english): register Restaurant & café pilot topic metadata"
```

---

### Task 14: Pilot lesson 01 — Vào quán & gọi đồ uống đầu

**Files:**
- Create: `content/english/restaurant-cafe/lessons/01-getting-seated.mdx`

This task includes the full content for the pilot's first lesson. It's the **template lesson** — every later lesson copies this rhythm: 8 numbered sections, scene-driven, bilingual, ~1,500–2,000 words.

- [ ] **Step 1: Write the full lesson**

```mdx
import { Callout } from '@/components/mdx/callout';
import { Recap } from '@/components/mdx/recap';

Cảnh đầu tiên trong một bữa ăn ở nhà hàng phương Tây thường rất nhanh: bước vào, chào, được dẫn bàn, gọi đồ uống đầu. Tiếng Anh dùng ở đây không phức tạp về ngữ pháp — phần khó là *nhịp* và *sắc thái lịch sự*. Bài này cho bạn các mẫu câu "vào việc" mà người bản xứ thực sự dùng, kèm những lựa chọn lịch sự tinh tế bạn có thể không học từ sách giáo khoa.

## 01 — Bối cảnh

Bạn vừa mở cửa một quán cà phê hoặc nhà hàng tầm trung. Một nhân viên (`host` hoặc `server`) sẽ chào bạn, hỏi số người, dẫn bạn đến bàn. Sau khi ngồi xuống, họ thường hỏi đồ uống *trước khi* đưa thực đơn — đây là điểm khác biệt phổ biến nhất với văn hoá Việt Nam. Bạn cần ba thứ: chào lịch sự, nói số người, và biết cách *đợi* hoặc *gọi nhanh* đồ uống.

## 02 — Từ vựng

<Vocab items={[
  { en: "host / hostess", ipa: "hoʊst", vi: "người chào và dẫn bàn (không phải bồi bàn)", example: "The host will seat you." },
  { en: "server / waiter / waitress", vi: "phục vụ (server là cách nói trung tính phổ biến nhất ở Mỹ)" },
  { en: "table for two / a party of four", vi: "bàn cho hai / nhóm bốn người", example: "We have a party of four." },
  { en: "to be seated", ipa: "ˈsiːtɪd", vi: "được dẫn bàn (cấu trúc bị động hay dùng)", example: "You'll be seated shortly." },
  { en: "menu", ipa: "ˈmenjuː", vi: "thực đơn" },
  { en: "specials", vi: "món đặc biệt trong ngày (off-menu, server thường giới thiệu miệng)" },
  { en: "still water / sparkling water", vi: "nước thường / nước có ga" },
  { en: "tap water", vi: "nước máy (miễn phí ở phần lớn nhà hàng Mỹ; có thể không có ở Châu Âu)" },
  { en: "to be ready (to order)", vi: "đã sẵn sàng gọi món" },
  { en: "I'll have / I'd like / Could I get…", vi: "ba cách gọi món lịch sự, từ thân mật → trung tính → lịch sự nhất" },
  { en: "for here / to go", vi: "ăn tại chỗ / mang đi (Mỹ); 'eat in / take away' ở Anh" },
  { en: "no rush", vi: "không vội (dùng để cho server biết bạn cần thêm thời gian)" },
]} />

## 03 — Mẫu câu

Năm mẫu câu dưới đây phủ ~80% câu bạn cần ở cảnh này. Học thuộc cả mẫu *và* phần biến thể.

<Pattern
  en="Hi, just the two of us, please."
  vi="Chào, chỉ có hai người chúng tôi thôi."
  variations={[
    "A table for two, please.",
    "Just one — a table for one.",
    "We have a party of six.",
  ]}
  note='"just" ở đầu câu mềm hoá yêu cầu — rất tự nhiên với người bản xứ.'
/>

<Pattern
  en="Could we sit by the window?"
  vi="Cho chúng tôi ngồi cạnh cửa sổ được không?"
  variations={[
    "Is there a quieter spot?",
    "Could we have a booth, if possible?",
    "Anywhere is fine, thanks.",
  ]}
  note='Thêm "if possible" cho cực kỳ lịch sự khi yêu cầu có thể bị từ chối.'
/>

<Pattern
  en="Could I just get a still water to start?"
  vi="Cho tôi một cốc nước thường để bắt đầu nhé?"
  variations={[
    "I'll have a coffee, please.",
    "Just a tap water for me, thanks.",
    "Could we get a bottle of sparkling for the table?",
  ]}
  note='"to start" báo cho server biết bạn sẽ gọi thêm sau — quan trọng để họ không vội ghi đơn món chính.'
/>

<Pattern
  en="Could we have a few more minutes with the menu?"
  vi="Cho chúng tôi xem thực đơn thêm vài phút nữa nhé?"
  variations={[
    "Sorry, we're not quite ready.",
    "We need a little more time, thanks.",
    "Could you give us a minute?",
  ]}
  note='Câu này lịch sự hơn rất nhiều so với "Wait!" — tránh dùng "Wait!" với server.'
/>

<Pattern
  en="Actually, we're ready to order — could we go ahead?"
  vi="À chúng tôi sẵn sàng gọi món rồi — gọi luôn được không?"
  variations={[
    "We're ready whenever you are.",
    "Yes, we'd like to order.",
    "Sorry to interrupt — when you have a sec, we're ready.",
  ]}
  note='"Actually" ở đầu câu báo hiệu một thay đổi nhỏ trong tình huống. Rất phổ biến.'
/>

## 04 — Hội thoại mẫu

<Dialogue lines={[
  { speaker: "Host", en: "Hi! Welcome to The Lighthouse. How many?", vi: "Chào! Mừng bạn đến The Lighthouse. Mấy người ạ?" },
  { speaker: "You", en: "Just the two of us, please.", vi: "Chỉ hai người chúng tôi thôi." },
  { speaker: "Host", en: "Right this way. Is a booth okay, or would you prefer a table?", vi: "Mời theo lối này. Bàn ghế tựa cao được không, hay bạn muốn bàn thường?" },
  { speaker: "You", en: "A booth would be great, thanks.", vi: "Bàn ghế tựa cao là tốt, cảm ơn." },
  { speaker: "Server", en: "Hi, I'm Maya — I'll be looking after you tonight. Can I start you off with anything to drink?", vi: "Chào, tôi là Maya — tôi sẽ phục vụ các bạn tối nay. Bạn dùng gì uống trước nhé?" },
  { speaker: "You", en: "Could I just get a still water to start? And we'll need a few more minutes with the menu.", vi: "Cho tôi một cốc nước thường để bắt đầu nhé? Và chúng tôi cần xem menu thêm vài phút." },
  { speaker: "Server", en: "Of course, no rush. I'll be back in a few.", vi: "Tất nhiên, không vội. Tôi sẽ quay lại sau ít phút." },
]} />

## 05 — Lỗi thường gặp

<Mistake
  wrong="Give me the menu."
  right="Could we see the menu, please?"
  why="`Give me` nghe ra lệnh, không phù hợp ở nhà hàng. `Could we…, please?` là chuẩn lịch sự cơ bản."
/>

<Mistake
  wrong="I want water."
  right="Could I get a water, please? / Just a tap water, thanks."
  why="`I want` quá thẳng. Người bản xứ dùng `Could I get`, `I'll have`, hoặc `Just a…` để mềm hoá."
/>

## 06 — Văn hoá & sắc thái

Ba điểm dễ trượt:

1. **Đồ uống được hỏi trước khi đưa menu.** Nếu bạn chưa biết uống gì, cứ thoải mái nói `Could I get a still water to start?` — server hiểu là "tôi sẽ quyết định đồ uống chính sau."
2. **`Tap water` miễn phí ở Mỹ và phần lớn châu Á; ở Pháp, Ý, Tây Ban Nha, không phải lúc nào cũng phục vụ.** Nếu không chắc, hỏi `Is tap water okay?` — server sẽ nói rõ.
3. **Server tự giới thiệu tên là phổ biến ở Mỹ.** Bạn không cần nhớ, nhưng dùng tên (`Thanks, Maya!`) khi cảm ơn là điểm cộng nhỏ về văn hoá.

<Callout type="note" title="Khi nào nói `Sir/Ma'am`">
Ở Mỹ, gọi server bằng `Sir` hoặc `Ma'am` thường nghe quá trang trọng (hoặc thậm chí mỉa mai trong vài vùng). Cứ gọi tên họ nếu họ giới thiệu, hoặc đơn giản là `Excuse me — when you have a moment?`.
</Callout>

## 07 — Idiom & cụm tự nhiên

- **`grab a bite`** — ăn nhanh, không trang trọng. *"Want to grab a bite after work?"*
- **`my treat`** — tôi mời. *"Order whatever you want — it's my treat."*
- **`hit the spot`** — đúng lúc, đã (nói khi đồ ăn/uống vừa miệng). *"That coffee really hit the spot."*
- **`for here or to go?`** — phục vụ tại chỗ hay mang đi (Mỹ). Câu kinh điển ở quán cà phê.
- **`a quick coffee`** — cà phê nhanh, không ngồi lâu. *"Got time for a quick coffee?"*

## 08 — Tự luyện

1. **Nói:** Bạn vừa bước vào một quán cà phê đông. Nói (thật to) ba câu liên tiếp: chào, nói số người, gọi nước trước.
2. **Viết:** Soạn một đoạn hội thoại 6 lượt giữa bạn và server — bạn cần thêm 5 phút xem menu.
3. **Đổi vai:** Tưởng tượng bạn *là* server. Viết câu chào khách lịch sự, hỏi số người, đề xuất chỗ ngồi.

<Recap>
- Cảnh "vào quán" có nhịp riêng: chào → số người → dẫn bàn → đồ uống → menu.
- `Could I…`, `Could we…`, `Just a…` là ba khuôn lịch sự chuẩn — học thuộc.
- `to start` báo cho server biết bạn sẽ gọi tiếp; `no rush` cho họ biết bạn cần thời gian.
- Thêm `if possible`, `actually`, `sorry to interrupt` để tăng độ tự nhiên.
- Văn hoá: đồ uống hỏi trước menu, `tap water` không phải lúc nào cũng có, server tự giới thiệu tên là chuyện bình thường ở Mỹ.
</Recap>
```

- [ ] **Step 2: Build to verify the MDX parses**

Run: `npx next build`
Expected: build succeeds; `/english/restaurant-cafe/lessons/01-getting-seated` is among the prerendered routes. If MDX parsing fails (typically on bare `{ }` outside code blocks), inspect the failure, fix the MDX, and rerun.

- [ ] **Step 3: Commit**

```bash
git add content/english/restaurant-cafe/lessons/01-getting-seated.mdx
git commit -m "feat(english): write pilot lesson 01 — vào quán & gọi đồ uống"
```

---

### Task 15: Pilot lesson 02 — Hỏi về thực đơn & ăn kiêng

**Files:**
- Create: `content/english/restaurant-cafe/lessons/02-menu-and-dietary.mdx`

This and the next four content tasks follow the **lesson 01 template exactly**: 8 numbered sections, same component shapes, same Vietnamese section headers. Only the *content* changes. Use lesson 01 as the visual reference.

- [ ] **Step 1: Author the lesson**

The MDX file must contain these eight sections in order. Author each at ~150–250 words of bilingual content, following the lesson-01 template exactly:

1. **Bối cảnh** — opening prose: scene is the moment after you've sat down with the menu in hand. Server returns; you have questions about ingredients, dietary restrictions, allergies, and you need to ask about the chef's specials.

2. **Từ vựng** — `<Vocab>` with 10–12 items. Must include: `appetizer / starter`, `entrée / main course` (note: in the US, *entrée* = main course; in France/UK, an entrée is the appetizer — flag this), `side / side dish`, `vegetarian / vegan / pescatarian`, `gluten-free`, `dairy-free`, `nut allergy`, `medium / medium-rare / well done` (steak doneness), `the chef's special`, `comes with`, `to substitute (X for Y)`.

3. **Mẫu câu** — 6 `<Pattern>` blocks. Mandatory patterns:
   - "What do you recommend?" with variations covering "What's good here?" / "What's the chef's special?" / "Any dishes you'd particularly recommend?"
   - "I'm vegetarian — what would you suggest?" with variations for vegan, pescatarian, gluten-free.
   - "Does the [pasta] have any dairy/nuts?" with allergy-flavored variations.
   - "What does the [risotto] come with?"
   - "Could I substitute [the fries] for [a salad]?"
   - "What's in the [dressing]?" — for ingredient questions.

4. **Hội thoại mẫu** — `<Dialogue>` with 6–8 lines. Setup: you're vegetarian and asking about a pasta dish; server explains it has cream, suggests a substitute.

5. **Lỗi thường gặp** — 2 `<Mistake>` blocks:
   - `wrong: "I no eat meat."` → `right: "I don't eat meat — I'm vegetarian."` (verb forms; introducing yourself as vegetarian).
   - `wrong: "Give me something without nuts."` → `right: "I have a nut allergy — could you flag any dishes that contain nuts?"` (pleading vs informing for safety-critical info).

6. **Văn hoá & sắc thái** — paragraph covering: it's normal to ask about ingredients in detail in the US/UK; servers expect allergy questions and will sometimes check with the kitchen; "specials" are off-menu and often more expensive — fine to ask the price.

7. **Idiom & cụm tự nhiên** — 4–5 phrases including `easy on the [salt/oil]`, `on the side` (e.g., "dressing on the side"), `to die for` ("the cake is to die for"), `a hidden gem`.

8. **Tự luyện** — 3 prompts: speak (ask about a dish you can't eat), write (a dialogue where you have a peanut allergy), swap (you're the server explaining a dish to a vegan).

The opening paragraph (above the section headers) should set up the scene in 3–4 Vietnamese sentences.

- [ ] **Step 2: Build to verify**

Run: `npx next build`
Expected: build succeeds with the new lesson route prerendered.

- [ ] **Step 3: Commit**

```bash
git add content/english/restaurant-cafe/lessons/02-menu-and-dietary.mdx
git commit -m "feat(english): write pilot lesson 02 — menu questions & dietary needs"
```

---

### Task 16: Pilot lesson 03 — Gọi món & yêu cầu thay đổi

**Files:**
- Create: `content/english/restaurant-cafe/lessons/03-ordering-customizing.mdx`

Follow the lesson 01 template. Eight sections.

- [ ] **Step 1: Author the lesson**

1. **Bối cảnh** — you've decided. Server is ready. You order, customise, possibly share, and confirm the order before they leave.

2. **Từ vựng** — 10–12 items: `to order`, `for me / for him / for her`, `to start with… and then…`, `to share`, `instead of`, `extra (cheese, sauce)`, `on the side`, `dressing`, `cooked / done`, `(steak) rare / medium-rare / medium / well done`, `I'll go with`, `to skip (X)`.

3. **Mẫu câu** — 6 `<Pattern>` blocks. Mandatory:
   - "I'll have the [dish], please." (most common opener) + variations.
   - "To start, I'll go with the [soup], and then the [main]." — for multi-course.
   - "Could I get the [salad] without [walnuts]?"
   - "Can I substitute [the fries] for [a salad], please?"
   - "How would you like that cooked?" — *the server's question*; explain expected answers (`medium-rare` etc.).
   - "We'll share the [appetizer], and then [main 1] for me, [main 2] for him."

4. **Hội thoại mẫu** — 8-line dialogue. You order a steak (medium-rare) with a salad instead of fries, plus a shared appetizer. Server confirms back.

5. **Lỗi thường gặp** — 2 `<Mistake>` blocks:
   - `wrong: "I want this and this."` (with vague pointing) → `right: "I'll have the salmon, please — and the Caesar salad to start."` (be specific by name).
   - `wrong: "Make it without onion."` → `right: "Could I have the [pasta] without onion, please?"` (verb forms again).

6. **Văn hoá & sắc thái** — paragraph: in the US, customisation is welcome; in some European fine-dining contexts, it can be seen as rude. Steak doneness is asked for almost universally. Confirming the order back ("So that's one X and one Y, right?") is normal — affirm or correct gently.

7. **Idiom & cụm tự nhiên** — `to go for [the steak]`, `make it two`, `the works` (= everything on it), `well done` (also a compliment, beware), `pricey but worth it`.

8. **Tự luyện** — 3 prompts: order a 2-course meal, customise a dish for an allergy you don't have, role-play the server confirming the order.

- [ ] **Step 2: Build to verify**

Run: `npx next build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add content/english/restaurant-cafe/lessons/03-ordering-customizing.mdx
git commit -m "feat(english): write pilot lesson 03 — ordering & customizing"
```

---

### Task 17: Pilot lesson 04 — Trong bữa ăn

**Files:**
- Create: `content/english/restaurant-cafe/lessons/04-during-the-meal.mdx`

Follow the lesson 01 template. Eight sections.

- [ ] **Step 1: Author the lesson**

1. **Bối cảnh** — food has arrived. You may need to: ask for something extra, send a dish back politely, make small talk with the server, or compliment the chef. This is the lesson where *register* matters most — complaining politely is a learnable skill.

2. **Từ vựng** — 10–12 items: `extra (napkins, water)`, `refill`, `medium-rare (vs medium-well — sent back)`, `undercooked / overcooked / overdone`, `cold (when it shouldn't be)`, `the manager`, `to send it back`, `to flag down (the server)`, `to compliment the chef`, `you alright?` (UK server check-in), `everything okay so far?`, `to box up / to take home`.

3. **Mẫu câu** — 7 `<Pattern>` blocks. Mandatory:
   - "Sorry — could we get some more water, please?" + variations (more bread, refills, extra napkins).
   - "When you have a sec, could you flag the server?" (asking your dining companion).
   - "Excuse me — could we get a refill on the coffee?" — direct to the server.
   - "I'm so sorry — I think this is undercooked. Could you have it cooked a little longer?" — sending food back politely.
   - "Could I get a box for the rest?" — taking food home.
   - "This is delicious — please give my compliments to the chef." — complimenting.
   - "Everything's been great, thanks." — answering the server's check-in.

4. **Hội thoại mẫu** — 8-line dialogue. You ordered medium-rare steak; it came medium-well. Send it back politely; server apologises; food returns; server checks again.

5. **Lỗi thường gặp** — 2 `<Mistake>` blocks:
   - `wrong: "This food is bad!"` → `right: "I'm so sorry — this is more well-done than I'd hoped. Could it go back for a minute?"` (specific complaint, not blanket judgment).
   - `wrong: "Hey! Water!"` → `right: "Excuse me — could we get some water, please?"` (don't shout; use `Excuse me`).

6. **Văn hoá & sắc thái** — paragraph: sending food back is normal *when there's a real issue*; doing it because you changed your mind is rude. The server's check-in (`Everything alright?`) expects a brief positive — long detailed answers are usually skipped unless something's wrong. Volume matters: getting the server's attention is `Excuse me`, never `Hey!` or hand-clap.

7. **Idiom & cụm tự nhiên** — `to be on the house` (= free, comp'd), `to top up (a glass)`, `mouth-watering`, `to dig in` ("Let's dig in!"), `to take a doggy bag`.

8. **Tự luyện** — 3 prompts: send a cold dish back, compliment the chef, ask for a refill while another person at the table is mid-sentence (keep your interjection minimal).

- [ ] **Step 2: Build to verify**

Run: `npx next build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add content/english/restaurant-cafe/lessons/04-during-the-meal.mdx
git commit -m "feat(english): write pilot lesson 04 — during the meal"
```

---

### Task 18: Pilot lesson 05 — Thanh toán, tip & rời quán

**Files:**
- Create: `content/english/restaurant-cafe/lessons/05-paying-tipping-leaving.mdx`

Follow the lesson 01 template. Eight sections.

- [ ] **Step 1: Author the lesson**

1. **Bối cảnh** — meal's over. You ask for the bill, decide whether to split, calculate a tip, pay, and leave. Tipping is *the* cultural minefield — give it explicit treatment.

2. **Từ vựng** — 10–12 items: `the bill / the check`, `to settle up`, `to split the bill / to go Dutch`, `to put it on one card`, `to pay with cash / by card`, `tip`, `gratuity` (auto-added in some places), `service charge` (UK), `tax (already added or not?)`, `receipt`, `change`, `keep the change`.

3. **Mẫu câu** — 6 `<Pattern>` blocks. Mandatory:
   - "Could we get the bill, please?" + variations (`Could I get the check`, `Are we ready to settle up?`, `Whenever you have a sec, the bill please`).
   - "Could we split it down the middle?" + variations (`Could we split it three ways?`, `Could you put it on one card?`).
   - "Is service included?" (UK/Europe), `Is gratuity added?` (US — often for parties of 6+).
   - "I'll put it on this card." — paying.
   - "Keep the change." (cash) — tipping in cash.
   - "Thanks so much — everything was great." — closing comments.

4. **Hội thoại mẫu** — 8-line dialogue. Two people splitting the bill 50/50; you ask if service is included; server says yes; you add a small extra tip in cash and say thanks.

5. **Lỗi thường gặp** — 2 `<Mistake>` blocks:
   - `wrong: "Bring me the bill!"` → `right: "Could we get the bill, please?"`.
   - `wrong: "I'll pay 18% tip."` (announcing) → `right: "I'll go with 20%."` (or just leave it; you don't announce the percentage).

6. **Văn hoá & sắc thái** — the central paragraph of the topic. Cover:
   - **US:** 18–22% tip on pre-tax total is standard. Servers earn below minimum wage and depend on tips. Even bad service usually still tips ~15%.
   - **UK / Europe:** 10–12.5% if no service charge already included; if `service charge` line is on the bill, *do not* add more.
   - **Vietnam / Asia:** rounding up or 5–10% if not already in the bill.
   - The card terminal often offers tip percentages — pick one or hit `custom`/`no tip`. No need to say it out loud.

<Callout type="warning" title="Đừng quên kiểm `gratuity`/`service charge`">
Một số nhà hàng (đặc biệt nhóm đông) tự cộng `gratuity` 18–20% vào hoá đơn. Đọc hoá đơn trước khi tip thêm — nếu không bạn sẽ tip *hai lần*.
</Callout>

7. **Idiom & cụm tự nhiên** — `to foot the bill` (= pay), `it's on me / my treat` (= I'm paying), `to go halves`, `to chip in` (= each contribute), `the damage` (jokey: "What's the damage?" = what does it cost?).

8. **Tự luyện** — 3 prompts: ask for the bill in two registers (casual + formal), split a bill three ways with one person paying for two, ask whether service is included.

- [ ] **Step 2: Build to verify**

Run: `npx next build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add content/english/restaurant-cafe/lessons/05-paying-tipping-leaving.mdx
git commit -m "feat(english): write pilot lesson 05 — paying, tipping & leaving"
```

---

### Task 19: Pilot lesson 06 — Văn hoá & idiom (capstone)

**Files:**
- Create: `content/english/restaurant-cafe/lessons/06-cultural-notes-idioms.mdx`

This is the **capstone lesson**. Different shape from lessons 01–05: less *new patterns*, more synthesis. The 8 sections still apply but Section 3 (Patterns) shrinks and Section 7 (Idioms) expands. Use the structure below — it's the template for the cultural-notes lesson in every later topic.

- [ ] **Step 1: Author the lesson**

1. **Bối cảnh** — opening prose: this is the synthesis lesson. You've learned the patterns. Now zoom out: how does eating-out *feel* across cultures, what idioms native speakers use, what would mark you as fluent vs. translated.

2. **Từ vựng** — 8–10 register/sociolinguistic items: `formal vs casual`, `register`, `small talk`, `service-industry English`, `regional differences (US vs UK)`, `tip culture`, `host vs guest expectations`, `dining etiquette`.

3. **Mẫu câu** — only 3 `<Pattern>` blocks for synthesis (not new patterns):
   - "Thanks so much — everything was great." (the universal closer).
   - "I really enjoyed the [dish] — what's in it?" (transitioning to small talk / compliment-questions).
   - "We'd love to come back." (the leaving line that earns warmth).

4. **Hội thoại mẫu** — single dialogue (~8 lines) that uses the *full arc* in compressed form: arrival, drink, order, mid-meal compliment, paying with tip question, leaving. This is the demo of how the topic flows end-to-end.

5. **Lỗi thường gặp** — 2 `<Mistake>` blocks at the cultural register:
   - `wrong: "Server! Bill!"` (translated directly from common Vietnamese restaurant calling) → `right: "Excuse me — could we get the bill when you have a sec?"`.
   - `wrong: "I don't tip — bad service."` (announced loudly) → `right: "Just put it on the card, thanks."` (skip the announcement; the no-tip register reads quieter).

6. **Văn hoá & sắc thái** — the *big* section. ~3 paragraphs:
   - **Pace.** US restaurants rotate tables faster than VN; the server may bring the bill before you ask. Not rude — efficient. Asking for the bill earlier than you would in VN is normal.
   - **Tipping vs. service charge.** Reframe what's in lesson 05: explicit comparison VN / US / UK / EU.
   - **Compliments earn warmth.** A short compliment to the server or chef changes the tone of the visit — and is something many learners skip.

7. **Idiom & cụm tự nhiên — the *big* section.** Author 8–10 idioms, each with `<Pattern>`-like presentation (use `<Pattern>` component for these — `en` is the idiom in a sentence, `vi` is the gloss + meaning, `variations` are common collocations). Required idioms:
   - `to grab a bite`
   - `to hit the spot`
   - `to wolf down (food)` — eat very fast
   - `to be stuffed` — very full
   - `food coma` — sleepy after eating too much
   - `to dine out (vs eat in)`
   - `a hole-in-the-wall` — small unassuming restaurant, often great
   - `to be a foodie`
   - `comfort food`
   - `(food) to die for`

8. **Tự luyện** — 3 synthesis prompts:
   - Write a 12-line dialogue covering arrival → leaving, using at least 3 idioms from this lesson.
   - Take one of the lesson-04 mistakes and explain *why* it's wrong using cultural reasoning, in English.
   - Compare tipping in VN vs US in 4–5 sentences in English.

The closing `<Recap>` should be the synthesis recap — what you can now *do* in English at a restaurant — not a feature list.

- [ ] **Step 2: Build to verify**

Run: `npx next build`
Expected: build succeeds. The pilot topic now has 6 prerendered lessons under `/english/restaurant-cafe/lessons/...`.

- [ ] **Step 3: Commit**

```bash
git add content/english/restaurant-cafe/lessons/06-cultural-notes-idioms.mdx
git commit -m "feat(english): write pilot lesson 06 — cultural notes & idioms (capstone)"
```

---

## Phase 2 — Placeholder topics

### Task 20: 14 placeholder topic stubs

**Files:**
- Create: `content/english/_placeholders/index.ts`
- Modify: `content/english/index.ts`

Spec: v0.1 ships 14 placeholder topic cards visible-but-unclickable. We define them in one file rather than creating 14 directories of empty stubs (`topic.ts` + folder) — placeholders have no MDX, no folder.

- [ ] **Step 1: Write the placeholders file**

```ts
// content/english/_placeholders/index.ts
import type { EnglishTopic } from '../types';

export const placeholderTopics: EnglishTopic[] = [
  {
    slug: 'greetings-introductions',
    title: 'Chào hỏi & giới thiệu',
    englishTitle: 'Greetings & introductions',
    summary: 'Mở đầu cuộc trò chuyện, giới thiệu bản thân và người khác trong các bối cảnh khác nhau.',
    level: 'B1+',
    variant: 'daily-life',
    lessons: [],
    placeholder: true,
    plannedLessonCount: 5,
  },
  {
    slug: 'small-talk',
    title: 'Trò chuyện xã giao',
    englishTitle: 'Small talk',
    summary: 'Bắt đầu, duy trì và kết thúc cuộc trò chuyện ngắn một cách tự nhiên.',
    level: 'B1+',
    variant: 'daily-life',
    lessons: [],
    placeholder: true,
    plannedLessonCount: 6,
  },
  {
    slug: 'shopping-money',
    title: 'Mua sắm & tiền bạc',
    englishTitle: 'Shopping & money',
    summary: 'Hỏi giá, thử đồ, mặc cả nhẹ nhàng, đổi trả và xử lý phàn nàn.',
    level: 'B1+',
    variant: 'daily-life',
    lessons: [],
    placeholder: true,
    plannedLessonCount: 6,
  },
  {
    slug: 'directions-getting-around',
    title: 'Hỏi đường & di chuyển',
    englishTitle: 'Directions & getting around',
    summary: 'Hỏi đường, hiểu chỉ dẫn, dùng phương tiện công cộng, taxi & ridesharing.',
    level: 'B1+',
    variant: 'daily-life',
    lessons: [],
    placeholder: true,
    plannedLessonCount: 6,
  },
  {
    slug: 'phone-video-calls',
    title: 'Gọi điện & gọi video',
    englishTitle: 'Phone & video calls',
    summary: 'Mở/kết thúc cuộc gọi, để lại tin nhắn, xử lý kết nối kém, video call etiquette.',
    level: 'B1+',
    variant: 'daily-life',
    lessons: [],
    placeholder: true,
    plannedLessonCount: 6,
  },
  {
    slug: 'travel-airport',
    title: 'Du lịch & sân bay',
    englishTitle: 'Travel & airport',
    summary: 'Check-in, an ninh, lên máy bay, hải quan, hành lý thất lạc và delay.',
    level: 'B1+',
    variant: 'daily-life',
    lessons: [],
    placeholder: true,
    plannedLessonCount: 6,
  },
  {
    slug: 'hotel',
    title: 'Khách sạn & nơi ở',
    englishTitle: 'Hotel & accommodation',
    summary: 'Đặt phòng, check-in, hỏi tiện nghi, xử lý vấn đề trong phòng và check-out.',
    level: 'B1+',
    variant: 'daily-life',
    lessons: [],
    placeholder: true,
    plannedLessonCount: 6,
  },
  {
    slug: 'doctor-health',
    title: 'Khám bệnh & sức khoẻ',
    englishTitle: 'Doctor & health',
    summary: 'Đặt lịch, mô tả triệu chứng, hiểu chẩn đoán, hiệu thuốc và tình huống khẩn cấp.',
    level: 'B1+',
    variant: 'daily-life',
    lessons: [],
    placeholder: true,
    plannedLessonCount: 6,
  },
  {
    slug: 'plans-invitations',
    title: 'Hẹn hò & lời mời',
    englishTitle: 'Plans & invitations',
    summary: 'Đề xuất kế hoạch, mời, nhận lời, từ chối lịch sự, đổi lịch.',
    level: 'B1+',
    variant: 'daily-life',
    lessons: [],
    placeholder: true,
    plannedLessonCount: 6,
  },
  {
    slug: 'apologies-complaints',
    title: 'Xin lỗi & phàn nàn',
    englishTitle: 'Apologies & complaints',
    summary: 'Xin lỗi nhẹ và xin lỗi thật, phàn nàn lịch sự, leo thang đúng mức, giải quyết mâu thuẫn.',
    level: 'B1+',
    variant: 'daily-life',
    lessons: [],
    placeholder: true,
    plannedLessonCount: 6,
  },
  {
    slug: 'office-small-talk',
    title: 'Trò chuyện ở văn phòng',
    englishTitle: 'Office small talk',
    summary: 'Chào buổi sáng, cuối tuần, mời ăn trưa, "office chat" mà không vượt giới hạn.',
    level: 'B1+',
    variant: 'work',
    lessons: [],
    placeholder: true,
    plannedLessonCount: 6,
  },
  {
    slug: 'meetings',
    title: 'Họp',
    englishTitle: 'Meetings',
    summary: 'Mở đầu, cập nhật/đề xuất, đồng ý/không đồng ý lịch sự, ngắt lời, chốt action items.',
    level: 'B1+',
    variant: 'work',
    lessons: [],
    placeholder: true,
    plannedLessonCount: 6,
  },
  {
    slug: 'job-interview',
    title: 'Phỏng vấn xin việc',
    englishTitle: 'Job interview',
    summary: 'Tự giới thiệu, kinh nghiệm, điểm yếu, câu hỏi cho nhà tuyển dụng, lương & bước tiếp theo.',
    level: 'B2+',
    variant: 'work',
    lessons: [],
    placeholder: true,
    plannedLessonCount: 6,
  },
  {
    slug: 'presentations',
    title: 'Thuyết trình',
    englishTitle: 'Presentations',
    summary: 'Mở bài, dẫn dắt, trình bày dữ liệu, xử lý Q&A, chốt với call-to-action.',
    level: 'B2+',
    variant: 'work',
    lessons: [],
    placeholder: true,
    plannedLessonCount: 6,
  },
];
```

- [ ] **Step 2: Add to the registry**

Replace `content/english/index.ts` with:

```ts
// content/english/index.ts
import type { EnglishTopic } from './types';
import { topic as restaurantCafe } from './restaurant-cafe/topic';
import { placeholderTopics } from './_placeholders';

export const allEnglishTopics: EnglishTopic[] = [
  // Topic 1 (placeholder)
  placeholderTopics.find((t) => t.slug === 'greetings-introductions')!,
  // Topic 2 (placeholder)
  placeholderTopics.find((t) => t.slug === 'small-talk')!,
  // Topic 3 (real — pilot)
  restaurantCafe,
  // Topics 4–11 (placeholders, daily-life)
  placeholderTopics.find((t) => t.slug === 'shopping-money')!,
  placeholderTopics.find((t) => t.slug === 'directions-getting-around')!,
  placeholderTopics.find((t) => t.slug === 'phone-video-calls')!,
  placeholderTopics.find((t) => t.slug === 'travel-airport')!,
  placeholderTopics.find((t) => t.slug === 'hotel')!,
  placeholderTopics.find((t) => t.slug === 'doctor-health')!,
  placeholderTopics.find((t) => t.slug === 'plans-invitations')!,
  placeholderTopics.find((t) => t.slug === 'apologies-complaints')!,
  // Topics 12–15 (placeholders, work)
  placeholderTopics.find((t) => t.slug === 'office-small-talk')!,
  placeholderTopics.find((t) => t.slug === 'meetings')!,
  placeholderTopics.find((t) => t.slug === 'job-interview')!,
  placeholderTopics.find((t) => t.slug === 'presentations')!,
];
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`
Expected: passes.

- [ ] **Step 4: Commit**

```bash
git add content/english/_placeholders/index.ts content/english/index.ts
git commit -m "feat(english): add 14 placeholder topic stubs to v0.1"
```

---

## Phase 3 — Final verification

### Task 21: Clean build & smoke

**Files:** none modified.

- [ ] **Step 1: Clean build from scratch**

Run: `rm -rf .next && npm run build`
(On Windows PowerShell: `Remove-Item -Recurse -Force .next; npm run build`.)
Expected: build succeeds. Confirm in the route table that it includes:

- `/english`
- `/english/restaurant-cafe`
- `/english/restaurant-cafe/lessons/01-getting-seated`
- `/english/restaurant-cafe/lessons/02-menu-and-dietary`
- `/english/restaurant-cafe/lessons/03-ordering-customizing`
- `/english/restaurant-cafe/lessons/04-during-the-meal`
- `/english/restaurant-cafe/lessons/05-paying-tipping-leaving`
- `/english/restaurant-cafe/lessons/06-cultural-notes-idioms`

(Total: 8 new prerendered routes for v0.1.)

Placeholder topics are *not* prerendered as topic-landing pages — `generateStaticParams` filters them out. They only appear as cards on `/english`.

- [ ] **Step 2: Run the test suite**

Run: `npm test`
Expected: all tests pass — both the existing `lib/courses.test.ts` and the new `lib/english.test.ts`.

- [ ] **Step 3: Smoke test in dev**

Run: `npm run dev`. Open in a browser:

- `http://localhost:3000` — homepage. Verify the top nav shows `Courses · English · About`.
- `http://localhost:3000/english` — verify hero renders, 15 cards in 3-column grid at `lg`, 11 daily-life cards have the cyan/teal wash, 4 work cards have the indigo/slate wash. Verify placeholder cards say "Sắp có" and are not clickable; the Restaurant card links.
- `http://localhost:3000/english/restaurant-cafe` — verify topic landing renders 6 lessons, with read time per lesson and a "Bắt đầu bài 1" CTA.
- `http://localhost:3000/english/restaurant-cafe/lessons/01-getting-seated` — verify the lesson renders cleanly: sidebar, breadcrumb, MDX body with all 8 sections, Pattern/Vocab/Dialogue/Mistake/Callout/Recap components all visible and styled. Click through prev/next.
- Click placeholder card on `/english` and verify nothing happens (the link is wrapped in a `div`, not an `<a>`).

Stop dev server.

- [ ] **Step 4: No commit needed**

Verification only — no files changed.

If anything failed, fix the underlying issue (don't create a new task on the fly), commit the fix with a descriptive message, then rerun this task.

---

## Self-review checklist (run before declaring v0.1 done)

- [ ] All 21 tasks committed individually with feature-prefixed messages.
- [ ] Build: `npm run build` clean, 8 new English routes visible in the route table.
- [ ] Tests: `npm test` green.
- [ ] Typecheck: `npm run typecheck` green.
- [ ] Visual: manual smoke through `/english`, the topic landing, and 2 lessons (01 + 06) confirms styling, sidebar, prev/next, and bilingual rendering all behave correctly.
- [ ] Spec coverage: every section of `docs/superpowers/specs/2026-05-06-learn-english-section-design.md` maps to a task in this plan.

## Spec coverage map

| Spec section | Implemented in |
|---|---|
| Routing (3 levels) | Tasks 9, 10 |
| Top nav | Task 11 |
| File layout (`content/english/`) | Tasks 1, 2, 13, 20 |
| Type system & registry | Tasks 1, 2, 3 (lib helpers + tests) |
| Per-lesson MDX template | Task 14 (full example), Tasks 15–19 (specs that reference it) |
| New MDX components (Pattern/Dialogue/Vocab/Mistake) | Tasks 5, 6, 7 |
| `/english` landing | Task 9 |
| Topic card variants (daily-life / work) | Task 12 |
| Topic page | Task 10 |
| Lesson page | Task 10 (route) + Task 8 (sidebar) |
| 15 topics, ~89 lessons | Pilot (Tasks 13–19) + 14 placeholders (Task 20) |
| v0.1 = Phase 0 + Phase 1 | All tasks 1–21 |
