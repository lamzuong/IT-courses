# IT Courses Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the IT Courses website platform end-to-end and ship the Drag-and-Drop in React course (18 lessons + Restaurant Table Booking Manager final project) deployed to Vercel.

**Architecture:** Next.js 16 App Router + MDX + Tailwind v4. Course content lives in the repo as MDX files. Demo components are React components imported into MDX. Lesson and course pages are statically rendered (`generateStaticParams`). No backend, no database.

**Tech Stack:** Next.js 16, TypeScript, Tailwind CSS v4, `@next/mdx`, `remark-gfm`, `rehype-slug`, `rehype-autolink-headings`, `@shikijs/rehype` (Shiki), `@dnd-kit/core`, `@dnd-kit/sortable`, Vitest, Playwright, `@axe-core/playwright`. Deployed to Vercel.

**Scope notes:**
- Tasks 1–16 implement the platform end-to-end with **one worked sample lesson** and the project guideline page. After Task 16 the platform is deployable and the loop is proven.
- Task 17 is a content-authoring checklist for the remaining 16 lessons + their demos. It's writing work, not engineering — track each lesson with a checkbox and check off as you author.

---

## File Map

What this plan creates or modifies:

```
IT-courses/
├── app/
│   ├── layout.tsx                                      # T6
│   ├── page.tsx                                        # T8
│   ├── globals.css                                     # T2
│   ├── sitemap.ts                                      # T15
│   ├── robots.ts                                       # T15
│   ├── courses/[course]/
│   │   ├── page.tsx                                    # T9
│   │   ├── lessons/[lesson]/page.tsx                   # T11
│   │   └── project/page.tsx                            # T12
├── components/
│   ├── site/
│   │   ├── nav.tsx                                     # T6
│   │   ├── footer.tsx                                  # T6
│   │   ├── skip-link.tsx                               # T6
│   │   ├── breadcrumb.tsx                              # T11
│   │   ├── prev-next.tsx                               # T11
│   │   └── lesson-sidebar.tsx                          # T10
│   ├── mdx/
│   │   ├── components.tsx                              # T7
│   │   ├── code-block.tsx                              # T7
│   │   ├── callout.tsx                                 # T7
│   │   ├── demo.tsx                                    # T7
│   │   └── recap.tsx                                   # T7
│   └── demos/
│       └── drag-drop-react/
│           └── html5-bin-demo.tsx                      # T13
├── content/
│   └── courses/
│       ├── index.ts                                    # T4
│       └── drag-drop-react/
│           ├── course.ts                               # T4
│           ├── project.mdx                             # T14
│           └── lessons/
│               ├── 01-intro-and-landscape.mdx          # T13
│               ├── 04-html5-hands-on.mdx               # T13
│               └── 02..18 (all others)                 # T17
├── lib/
│   ├── courses.ts                                      # T5
│   ├── courses.test.ts                                 # T5
│   └── mdx.ts                                          # T3
├── tests/e2e/
│   ├── homepage.spec.ts                                # T8
│   ├── course-detail.spec.ts                           # T9
│   ├── lesson.spec.ts                                  # T11
│   ├── project.spec.ts                                 # T12
│   ├── a11y.spec.ts                                    # T16
│   └── mobile-drawer.spec.ts                           # T10
├── public/og/default.png                               # T15 (placeholder)
├── README.md                                           # T16
├── next.config.mjs                                     # T3
├── tailwind.config.ts                                  # T2
├── postcss.config.mjs                                  # T1
├── tsconfig.json                                       # T1
├── vitest.config.ts                                    # T1
├── playwright.config.ts                                # T1
└── package.json                                        # T1, T3
```

---

## Task 1: Bootstrap Next.js 16 + tooling

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `vitest.config.ts`, `playwright.config.ts`, `.gitignore`, `app/page.tsx` (placeholder)

- [ ] **Step 1: Init Next.js project**

Run from inside the empty `IT-courses/` directory:

```bash
npx --yes create-next-app@latest . \
  --ts --app --tailwind --eslint \
  --src-dir=false --import-alias='@/*' \
  --use-npm --turbopack=false --no-git
```

Accept any prompts. This creates the Next.js scaffold with TypeScript, App Router, Tailwind v4, and ESLint.

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install \
  @next/mdx@latest @mdx-js/loader@latest @mdx-js/react@latest @types/mdx@latest \
  remark-gfm rehype-slug rehype-autolink-headings @shikijs/rehype \
  @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities \
  clsx
```

- [ ] **Step 3: Install dev dependencies**

```bash
npm install -D \
  vitest @vitest/ui \
  @playwright/test @axe-core/playwright \
  @types/node
npx playwright install --with-deps chromium
```

- [ ] **Step 4: Add scripts to `package.json`**

In `package.json`, replace the `scripts` block with:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test",
  "typecheck": "tsc --noEmit"
}
```

- [ ] **Step 5: Add `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  resolve: { alias: { '@': path.resolve(__dirname, '.') } },
  test: { environment: 'node', include: ['**/*.test.ts'] },
});
```

- [ ] **Step 6: Add `playwright.config.ts`**

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: 'http://localhost:3000', trace: 'retain-on-failure' },
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-chrome',    use: { ...devices['Pixel 5'] } },
  ],
});
```

- [ ] **Step 7: Verify the empty scaffold runs**

```bash
npm run dev
```
Expected: dev server starts, `http://localhost:3000` shows the default Next page. Stop with Ctrl-C.

- [ ] **Step 8: Verify typecheck passes**

```bash
npm run typecheck
```
Expected: zero errors.

---

## Task 2: Theme, fonts, and globals.css

**Files:**
- Modify: `app/layout.tsx`, `app/globals.css`
- Create: `tailwind.config.ts` (if not present from scaffold)

- [ ] **Step 1: Replace `app/globals.css`**

Tailwind v4 uses `@import "tailwindcss"` plus a `@theme` block. Replace the entire file with:

```css
@import "tailwindcss";

@theme {
  --color-bg: #fbf9f6;
  --color-bg-soft: #f5f1ea;
  --color-text: #1a1a1a;
  --color-text-soft: #5a5a5a;
  --color-border: #e8e2d8;
  --color-code-bg: #1a1a1a;
  --color-code-text: #e8e8e8;

  --font-serif: 'Fraunces', Georgia, 'Times New Roman', serif;
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, monospace;

  --container-prose: 720px;
}

@layer base {
  html { color-scheme: light; }
  body {
    background: var(--color-bg);
    color: var(--color-text);
    font-family: var(--font-sans);
    font-feature-settings: 'kern', 'liga', 'cv11';
    -webkit-font-smoothing: antialiased;
  }
  h1, h2, h3 { font-family: var(--font-serif); letter-spacing: -0.01em; }
  pre { font-family: var(--font-mono); }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
}

.skip-link {
  position: absolute; top: -40px; left: 8px;
  padding: 8px 12px; background: #000; color: #fff;
  border-radius: 4px; z-index: 100;
}
.skip-link:focus { top: 8px; }
```

- [ ] **Step 2: Wire fonts via `next/font`**

Replace `app/layout.tsx` with:

```tsx
import type { Metadata } from 'next';
import { Inter, Fraunces, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const fraunces = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono-jb', display: 'swap' });

export const metadata: Metadata = {
  title: { default: 'IT Courses', template: '%s · IT Courses' },
  description: 'Hands-on courses on the parts of frontend I find interesting.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable} ${mono.variable}`}>
      <body>
        <a href="#main-content" className="skip-link">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
```

Adjust `globals.css` `--font-sans`, `--font-serif`, `--font-mono` to use `var(--font-inter)`, `var(--font-fraunces)`, `var(--font-mono-jb)` respectively (they fall back to Georgia/system-ui if loading fails).

- [ ] **Step 3: Stub homepage so app builds**

Replace `app/page.tsx` with:

```tsx
export default function Home() {
  return (
    <main id="main-content" className="p-12">
      <h1 className="text-4xl">IT Courses</h1>
      <p className="mt-2 text-[color:var(--color-text-soft)]">Coming together…</p>
    </main>
  );
}
```

- [ ] **Step 4: Run dev and verify**

```bash
npm run dev
```
Open `http://localhost:3000`. Expected: cream background `#fbf9f6`, serif "IT Courses" headline, sans subtitle. Stop with Ctrl-C.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "chore: bootstrap Next.js 16 + Tailwind theme + fonts"
```

(If git was not initialized, run `git init && git add -A && git commit -m "..."`.)

---

## Task 3: MDX pipeline

**Files:**
- Modify: `next.config.mjs`, `package.json` (add `mdx` to pageExtensions)
- Create: `lib/mdx.ts`, `mdx-components.tsx`

- [ ] **Step 1: Configure `next.config.mjs`**

```js
import createMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeShiki from '@shikijs/rehype';

const withMDX = createMDX({
  options: {
    remarkPlugins: [remarkGfm],
    rehypePlugins: [
      rehypeSlug,
      [rehypeAutolinkHeadings, { behavior: 'wrap', properties: { className: ['heading-anchor'] } }],
      [rehypeShiki, { themes: { light: 'github-light', dark: 'github-dark-dimmed' } }],
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
};

export default withMDX(nextConfig);
```

- [ ] **Step 2: Create `mdx-components.tsx` at repo root**

This is the App Router convention for global MDX component overrides. Stub for now — populated in Task 7.

```tsx
import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return { ...components };
}
```

- [ ] **Step 3: Create `lib/mdx.ts`**

```ts
// Re-export the MDX components map so server pages can import it.
export { useMDXComponents } from '@/mdx-components';
```

- [ ] **Step 4: Smoke-test MDX with a fixture**

Create `app/_test-mdx/page.mdx`:

```mdx
# MDX works

This is a heading and `inline code`.

```ts
const x: number = 1;
```
```

Run `npm run dev`, visit `http://localhost:3000/_test-mdx`. Expected: heading renders, code block has Shiki syntax highlighting. Then **delete `app/_test-mdx/`** before commit.

- [ ] **Step 5: Run typecheck**

```bash
npm run typecheck
```
Expected: zero errors.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: configure MDX with Shiki, GFM, autolinked headings"
```

---

## Task 4: Course manifest types + drag-drop manifest + registry

**Files:**
- Create: `content/courses/types.ts`, `content/courses/drag-drop-react/course.ts`, `content/courses/index.ts`

- [ ] **Step 1: Create the manifest type**

`content/courses/types.ts`:

```ts
export type LessonMeta = {
  slug: string;        // matches the MDX filename without extension, e.g., '01-intro-and-landscape'
  title: string;
  summary?: string;    // one-line description shown on the course detail page
};

export type CoursePart = {
  title: string;       // e.g., 'Foundations'
  lessons: LessonMeta[];
};

export type ProjectMeta = {
  slug: 'project';     // always 'project' — the URL is /courses/<course>/project
  title: string;
};

export type Course = {
  slug: string;
  title: string;
  summary: string;
  longDescription: string;
  whatYoullLearn: string[];   // 3-5 bullets shown on course detail page
  whatYoullBuild: string;     // sentence describing the project
  parts: CoursePart[];        // ordered parts; lessons are flattened in order
  project: ProjectMeta;
};
```

- [ ] **Step 2: Create the drag-drop course manifest**

`content/courses/drag-drop-react/course.ts`:

```ts
import type { Course } from '@/content/courses/types';

export const course: Course = {
  slug: 'drag-drop-react',
  title: 'Drag and Drop in React',
  summary: 'From native HTML5 DnD to @dnd-kit, ending in a real-world restaurant table-booking app.',
  longDescription:
    'A hands-on course that takes you from the browser\'s native drag-and-drop primitives all the way to building production-grade React drag interactions with @dnd-kit. You\'ll build cross-device drag from scratch using Pointer Events, then learn the modern library approach, and put it all together by building a Trello-style restaurant table-booking app.',
  whatYoullLearn: [
    'How the browser\'s HTML5 DnD API works — and why it falls apart on mobile',
    'How to use Pointer Events to build cross-device drag from scratch',
    'How to use @dnd-kit/core, sortable lists, multi-container drag, sensors, modifiers, and custom collision detection',
    'How to make drag interactions accessible with keyboard navigation and screen-reader announcements',
  ],
  whatYoullBuild:
    'A Restaurant Table Booking Manager — drag reservations onto tables, drag tables on a snap-to-grid floor plan, and drag-to-connect tables for large parties. Works on desktop, touch, and keyboard.',
  parts: [
    {
      title: 'Foundations (native, every device)',
      lessons: [
        { slug: '01-intro-and-landscape',     title: 'Intro & DnD landscape',                   summary: 'What drag-and-drop is, the browser\'s native options, and the library ecosystem.' },
        { slug: '02-html5-events',            title: 'HTML5 DnD: events & lifecycle',           summary: 'draggable, dragstart → dragover → drop → dragend, event order, gotchas.' },
        { slug: '03-html5-data-transfer',     title: 'HTML5 DnD: dataTransfer, dropEffect, drag image', summary: 'MIME types, effectAllowed/dropEffect, setDragImage, ghost styling.' },
        { slug: '04-html5-hands-on',          title: 'Hands-on: vanilla HTML5 drag-into-bin',   summary: 'Build a working HTML5 DnD demo with no React.' },
        { slug: '05-html5-limitations',       title: 'Limitations of HTML5 DnD',                summary: 'Why it fails on mobile, accessibility issues, custom UI pain.' },
        { slug: '06-pointer-events',          title: 'Pointer Events API',                      summary: 'Unified mouse/touch/pen, setPointerCapture, scroll prevention.' },
        { slug: '07-cross-device-drag-1',     title: 'Cross-device drag from scratch — part 1', summary: 'Make one element draggable on desktop, touch, and pen.' },
        { slug: '08-cross-device-drag-2',     title: 'Cross-device drag from scratch — part 2', summary: 'Drop zones, hit-testing, edge auto-scroll.' },
        { slug: '09-accessibility-from-scratch', title: 'Accessibility from scratch',           summary: 'Keyboard nav, ARIA live announcements, focus management.' },
      ],
    },
    {
      title: '@dnd-kit (the modern React way)',
      lessons: [
        { slug: '10-library-landscape',       title: 'Library landscape',                       summary: '@dnd-kit vs react-dnd vs deprecated react-beautiful-dnd vs react-grid-layout.' },
        { slug: '11-dnd-kit-first-drag',      title: '@dnd-kit/core first drag',                summary: 'DndContext, useDraggable, useDroppable.' },
        { slug: '12-sensors',                 title: 'Sensors & activation constraints',        summary: 'Pointer/touch/keyboard sensors, distance/delay, debouncing.' },
        { slug: '13-modifiers',               title: 'Modifiers',                               summary: 'restrictToWindowEdges, axis locks, snap-to-grid.' },
        { slug: '14-sortable-lists',          title: 'Sortable lists',                          summary: '@dnd-kit/sortable, SortableContext, arrayMove.' },
        { slug: '15-multi-container',         title: 'Multi-container DnD',                     summary: 'Moving items between lists, onDragOver vs onDragEnd.' },
        { slug: '16-drag-overlay',            title: 'DragOverlay & animations',                summary: 'Separating the rendered drag from the source, drop animations.' },
        { slug: '17-custom-collision',        title: 'Custom collision detection',              summary: 'closestCenter, closestCorners, pointerWithin, writing your own.' },
        { slug: '18-accessibility-dnd-kit',   title: 'Accessibility in @dnd-kit',               summary: 'Keyboard navigation, screen-reader announcements, customizing them.' },
      ],
    },
  ],
  project: { slug: 'project', title: 'Restaurant Table Booking Manager' },
};
```

- [ ] **Step 3: Create the course registry**

`content/courses/index.ts`:

```ts
import { course as dragDropReact } from './drag-drop-react/course';
import type { Course } from './types';

export const allCourses: Course[] = [dragDropReact];

export const placeholderCourses: { title: string; summary: string }[] = [
  { title: 'Coming soon', summary: 'Another course is in the works.' },
  { title: 'Coming soon', summary: 'Another course is in the works.' },
];
```

- [ ] **Step 4: Typecheck**

```bash
npm run typecheck
```
Expected: zero errors.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: course manifest types + drag-drop course + registry"
```

---

## Task 5: lib/courses.ts (TDD)

**Files:**
- Create: `lib/courses.ts`, `lib/courses.test.ts`

- [ ] **Step 1: Write the failing tests**

`lib/courses.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  getAllCourses,
  getCourse,
  getLesson,
  flattenLessons,
} from './courses';

describe('getAllCourses', () => {
  it('returns at least the drag-drop course', () => {
    const courses = getAllCourses();
    expect(courses.some((c) => c.slug === 'drag-drop-react')).toBe(true);
  });
});

describe('getCourse', () => {
  it('returns the course by slug', () => {
    const course = getCourse('drag-drop-react');
    expect(course?.title).toBe('Drag and Drop in React');
  });

  it('returns null for an unknown slug', () => {
    expect(getCourse('nonexistent')).toBeNull();
  });
});

describe('flattenLessons', () => {
  it('returns lessons in part order, preserving array order', () => {
    const course = getCourse('drag-drop-react')!;
    const flat = flattenLessons(course);
    expect(flat).toHaveLength(18);
    expect(flat[0].slug).toBe('01-intro-and-landscape');
    expect(flat[8].slug).toBe('09-accessibility-from-scratch');
    expect(flat[9].slug).toBe('10-library-landscape');
    expect(flat[17].slug).toBe('18-accessibility-dnd-kit');
  });
});

describe('getLesson', () => {
  it('returns lesson + neighbors for a middle lesson', () => {
    const result = getLesson('drag-drop-react', '06-pointer-events');
    expect(result).not.toBeNull();
    expect(result!.lesson.title).toBe('Pointer Events API');
    expect(result!.prev?.slug).toBe('05-html5-limitations');
    expect(result!.next?.slug).toBe('07-cross-device-drag-1');
    expect(result!.index).toBe(5); // zero-based
    expect(result!.total).toBe(18);
  });

  it('returns null prev for the first lesson', () => {
    const result = getLesson('drag-drop-react', '01-intro-and-landscape');
    expect(result!.prev).toBeNull();
    expect(result!.next?.slug).toBe('02-html5-events');
  });

  it('returns null next for the last lesson', () => {
    const result = getLesson('drag-drop-react', '18-accessibility-dnd-kit');
    expect(result!.prev?.slug).toBe('17-custom-collision');
    expect(result!.next).toBeNull();
  });

  it('returns null for unknown course or lesson', () => {
    expect(getLesson('nope', '01-intro-and-landscape')).toBeNull();
    expect(getLesson('drag-drop-react', 'nope')).toBeNull();
  });
});
```

- [ ] **Step 2: Run the tests — they should fail**

```bash
npm test
```
Expected: all 8 tests fail with "Cannot find module './courses'" or similar.

- [ ] **Step 3: Implement `lib/courses.ts`**

```ts
import { allCourses } from '@/content/courses';
import type { Course, LessonMeta } from '@/content/courses/types';

export function getAllCourses(): Course[] {
  return allCourses;
}

export function getCourse(slug: string): Course | null {
  return allCourses.find((c) => c.slug === slug) ?? null;
}

export function flattenLessons(course: Course): LessonMeta[] {
  return course.parts.flatMap((part) => part.lessons);
}

export type LessonContext = {
  course: Course;
  lesson: LessonMeta;
  prev: LessonMeta | null;
  next: LessonMeta | null;
  index: number;   // zero-based position in flattened list
  total: number;
};

export function getLesson(courseSlug: string, lessonSlug: string): LessonContext | null {
  const course = getCourse(courseSlug);
  if (!course) return null;
  const lessons = flattenLessons(course);
  const index = lessons.findIndex((l) => l.slug === lessonSlug);
  if (index === -1) return null;
  return {
    course,
    lesson: lessons[index],
    prev: index > 0 ? lessons[index - 1] : null,
    next: index < lessons.length - 1 ? lessons[index + 1] : null,
    index,
    total: lessons.length,
  };
}
```

- [ ] **Step 4: Run the tests — they should pass**

```bash
npm test
```
Expected: all 8 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(lib): courses lookup with prev/next neighbors"
```

---

## Task 6: Root layout, nav, footer, skip-link

**Files:**
- Modify: `app/layout.tsx`
- Create: `components/site/nav.tsx`, `components/site/footer.tsx`, `components/site/skip-link.tsx`

- [ ] **Step 1: Create `components/site/skip-link.tsx`**

```tsx
export function SkipLink() {
  return (
    <a href="#main-content" className="skip-link">
      Skip to content
    </a>
  );
}
```

- [ ] **Step 2: Create `components/site/nav.tsx`**

```tsx
import Link from 'next/link';

export function SiteNav() {
  return (
    <header className="border-b border-[color:var(--color-border)]">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link href="/" className="font-serif text-lg font-bold tracking-tight">
          IT Courses
        </Link>
        <nav aria-label="Site" className="flex gap-6 text-sm">
          <Link href="/" className="hover:underline">Courses</Link>
          <Link href="/about" className="hover:underline opacity-70">About</Link>
        </nav>
      </div>
    </header>
  );
}
```

(`/about` is intentionally a 404 in v1 — link is dimmed. Removing the About link is also fine; keeping it as a visual anchor.)

- [ ] **Step 3: Create `components/site/footer.tsx`**

```tsx
export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-[color:var(--color-border)]">
      <div className="mx-auto max-w-6xl px-6 py-8 flex flex-wrap items-center justify-between gap-4 text-sm text-[color:var(--color-text-soft)]">
        <p>© {new Date().getFullYear()} Phuoc Luu</p>
        <div className="flex gap-4">
          <a href="https://github.com" className="hover:underline">GitHub</a>
          <a href="mailto:vophuoc.luu@savyu.com" className="hover:underline">Contact</a>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 4: Update `app/layout.tsx` to use them**

Replace the `<body>` content with:

```tsx
<body>
  <SkipLink />
  <SiteNav />
  {children}
  <SiteFooter />
</body>
```

Add the imports at the top:
```tsx
import { SkipLink } from '@/components/site/skip-link';
import { SiteNav } from '@/components/site/nav';
import { SiteFooter } from '@/components/site/footer';
```

- [ ] **Step 5: Verify visually**

```bash
npm run dev
```
Open `http://localhost:3000`. Expected: nav at top with serif "IT Courses" + right-side links, footer at bottom with © + GitHub/Contact. Tab once with keyboard — skip link should appear top-left.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat(site): root layout, nav, footer, skip link"
```

---

## Task 7: MDX styled primitives

**Files:**
- Create: `components/mdx/code-block.tsx`, `components/mdx/callout.tsx`, `components/mdx/demo.tsx`, `components/mdx/recap.tsx`, `components/mdx/components.tsx`
- Modify: `mdx-components.tsx`

- [ ] **Step 1: Create the copy-to-clipboard code block**

`components/mdx/code-block.tsx`:

```tsx
'use client';
import { useRef, useState, type ReactNode } from 'react';

export function CodeBlock({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = ref.current?.innerText ?? '';
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="relative group my-6">
      <pre
        ref={ref}
        className="rounded-md bg-[color:var(--color-code-bg)] text-[color:var(--color-code-text)] p-4 overflow-x-auto text-sm leading-6"
      >
        {children}
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Copied' : 'Copy code'}
        className="absolute top-3 right-3 text-xs px-2 py-1 rounded bg-white/10 text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <span aria-live="polite" className="sr-only">{copied ? 'Code copied to clipboard' : ''}</span>
    </div>
  );
}
```

Note: Shiki produces a `<pre>` with classed children. We wrap it so the existing Shiki-generated `<pre>` becomes our `pre`'s child via the MDX components map. See Step 5.

- [ ] **Step 2: Create `components/mdx/callout.tsx`**

```tsx
import type { ReactNode } from 'react';

const styles = {
  note:    'border-blue-300/60 bg-blue-50/50',
  warning: 'border-amber-300/60 bg-amber-50/50',
  tip:     'border-emerald-300/60 bg-emerald-50/50',
} as const;

export function Callout({
  type = 'note',
  title,
  children,
}: {
  type?: keyof typeof styles;
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside className={`my-6 rounded-md border-l-4 px-4 py-3 ${styles[type]}`} role="note">
      {title && <p className="font-semibold mb-1">{title}</p>}
      <div className="prose-sm">{children}</div>
    </aside>
  );
}
```

- [ ] **Step 3: Create `components/mdx/demo.tsx`**

```tsx
'use client';
import { useState, type ReactNode, isValidElement, cloneElement } from 'react';

export function Demo({ title, children }: { title?: string; children: ReactNode }) {
  const [resetKey, setResetKey] = useState(0);
  const child =
    isValidElement(children)
      ? cloneElement(children, { key: resetKey } as Record<string, unknown>)
      : children;

  return (
    <figure className="my-8 rounded-md border border-[color:var(--color-border)] bg-white/40 overflow-hidden">
      <figcaption className="flex items-center justify-between text-xs uppercase tracking-wider text-[color:var(--color-text-soft)] px-4 py-2 border-b border-[color:var(--color-border)]">
        <span>{title ?? 'Live demo'}</span>
        <button
          type="button"
          onClick={() => setResetKey((k) => k + 1)}
          className="text-xs px-2 py-1 rounded border border-[color:var(--color-border)] hover:bg-[color:var(--color-bg-soft)]"
          aria-label="Reset demo"
        >
          Reset
        </button>
      </figcaption>
      <div className="p-6">{child}</div>
    </figure>
  );
}
```

- [ ] **Step 4: Create `components/mdx/recap.tsx`**

```tsx
import type { ReactNode } from 'react';

export function Recap({ children }: { children: ReactNode }) {
  return (
    <section
      aria-labelledby="recap-heading"
      className="my-12 rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg-soft)] p-6"
    >
      <h2 id="recap-heading" className="text-lg font-serif font-semibold mb-3">Recap</h2>
      <div className="prose-sm">{children}</div>
    </section>
  );
}
```

- [ ] **Step 5: Wire components into the MDX map**

Replace `mdx-components.tsx` at repo root:

```tsx
import type { MDXComponents } from 'mdx/types';
import { CodeBlock } from '@/components/mdx/code-block';
import { Callout } from '@/components/mdx/callout';
import { Demo } from '@/components/mdx/demo';
import { Recap } from '@/components/mdx/recap';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    pre: (props) => <CodeBlock>{props.children}</CodeBlock>,
    Callout,
    Demo,
    Recap,
  };
}
```

- [ ] **Step 6: Smoke-test with a fixture**

Create `app/_test-mdx/page.mdx`:

```mdx
import { Callout } from '@/components/mdx/callout';
import { Recap } from '@/components/mdx/recap';

# MDX primitives

```ts
const greeting = 'hi';
```

<Callout type="warning" title="Be careful">
This is a warning callout.
</Callout>

<Recap>
- Code blocks render with copy button
- Callouts work
- Recap works
</Recap>
```

Run `npm run dev` and visit `/_test-mdx`. Hover the code block — copy button appears. Reset button on Demo (test by adding a `<Demo>`). Once verified, **delete `app/_test-mdx/`**.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(mdx): code block with copy, Callout, Demo, Recap primitives"
```

---

## Task 8: Homepage `/`

**Files:**
- Modify: `app/page.tsx`
- Create: `tests/e2e/homepage.spec.ts`

- [ ] **Step 1: Write Playwright smoke test**

`tests/e2e/homepage.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('homepage renders the drag-drop course card', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: /Drag and Drop in React/i })).toBeVisible();
});

test('homepage shows at least one Coming soon placeholder', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/Coming soon/i).first()).toBeVisible();
});
```

- [ ] **Step 2: Run the test — it should fail**

```bash
npm run test:e2e -- homepage
```
Expected: tests fail (homepage stub still in place from Task 2).

- [ ] **Step 3: Implement the homepage**

Replace `app/page.tsx`:

```tsx
import Link from 'next/link';
import { getAllCourses } from '@/lib/courses';
import { placeholderCourses } from '@/content/courses';
import { flattenLessons } from '@/lib/courses';

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
```

- [ ] **Step 4: Run the test — it should pass**

```bash
npm run test:e2e -- homepage
```
Expected: both tests PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(home): course grid + coming-soon placeholders"
```

---

## Task 9: Course detail page `/courses/[course]`

**Files:**
- Create: `app/courses/[course]/page.tsx`, `tests/e2e/course-detail.spec.ts`

- [ ] **Step 1: Write the test**

`tests/e2e/course-detail.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('course detail renders title, parts, and final project card', async ({ page }) => {
  await page.goto('/courses/drag-drop-react');
  await expect(page.getByRole('heading', { level: 1, name: /Drag and Drop in React/i })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: /Foundations/i })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: /@dnd-kit/i })).toBeVisible();
  await expect(page.getByText(/Restaurant Table Booking Manager/i)).toBeVisible();
});

test('course detail returns 404 for unknown course', async ({ page }) => {
  const res = await page.goto('/courses/nonexistent');
  expect(res?.status()).toBe(404);
});
```

- [ ] **Step 2: Run — should fail**

```bash
npm run test:e2e -- course-detail
```
Expected: fail (page does not exist).

- [ ] **Step 3: Implement the page**

`app/courses/[course]/page.tsx`:

```tsx
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

  return (
    <main id="main-content" className="mx-auto max-w-4xl px-6 py-16">
      <header className="mb-12">
        <p className="text-xs uppercase tracking-widest text-[color:var(--color-text-soft)] mb-3">Course</p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight leading-tight">{course.title}</h1>
        <p className="mt-4 text-lg text-[color:var(--color-text-soft)]">{course.longDescription}</p>

        <div className="mt-10 grid md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xs uppercase tracking-widest text-[color:var(--color-text-soft)] mb-3">What you'll learn</h2>
            <ul className="space-y-2 text-sm">
              {course.whatYoullLearn.map((b) => <li key={b} className="flex gap-2"><span aria-hidden>·</span><span>{b}</span></li>)}
            </ul>
          </div>
          <div>
            <h2 className="text-xs uppercase tracking-widest text-[color:var(--color-text-soft)] mb-3">What you'll build</h2>
            <p className="text-sm">{course.whatYoullBuild}</p>
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
          <p className="mt-2 text-sm text-[color:var(--color-text-soft)]">{course.whatYoullBuild}</p>
        </Link>
      </section>
    </main>
  );
}
```

- [ ] **Step 4: Run — should pass**

```bash
npm run test:e2e -- course-detail
```
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(course): course detail page with parts + lessons + project card"
```

---

## Task 10: Lesson sidebar (desktop sticky + mobile drawer)

**Files:**
- Create: `components/site/lesson-sidebar.tsx`, `tests/e2e/mobile-drawer.spec.ts`

- [ ] **Step 1: Write the drawer test**

`tests/e2e/mobile-drawer.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 375, height: 812 } });

test('mobile drawer opens, traps focus, closes on Escape', async ({ page }) => {
  await page.goto('/courses/drag-drop-react/lessons/01-intro-and-landscape');
  const toggle = page.getByRole('button', { name: /Lessons/i });
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');

  // Drawer is visible
  const drawer = page.getByRole('dialog', { name: /Course lessons/i });
  await expect(drawer).toBeVisible();

  // Escape closes
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});
```

- [ ] **Step 2: Implement the sidebar**

`components/site/lesson-sidebar.tsx`:

```tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { Course } from '@/content/courses/types';

export function LessonSidebar({
  course,
  currentLessonSlug,
  isProject = false,
}: {
  course: Course;
  currentLessonSlug?: string;
  isProject?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus trap + Escape
  useEffect(() => {
    if (!open) return;
    const dlg = dialogRef.current;
    if (!dlg) return;
    const focusable = dlg.querySelectorAll<HTMLElement>('a, button');
    focusable[0]?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key !== 'Tab' || focusable.length === 0) return;
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) { last.focus(); e.preventDefault(); }
      else if (!e.shiftKey && document.activeElement === last) { first.focus(); e.preventDefault(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const list = (
    <nav aria-label="Course lessons">
      {course.parts.map((part, partIdx) => (
        <div key={part.title} className="mb-6">
          <p className="text-xs uppercase tracking-widest text-[color:var(--color-text-soft)] mb-2">
            Part {partIdx + 1} · {part.title}
          </p>
          <ul className="space-y-0.5">
            {part.lessons.map((lesson, idx) => {
              const active = lesson.slug === currentLessonSlug;
              return (
                <li key={lesson.slug}>
                  <Link
                    href={`/courses/${course.slug}/lessons/${lesson.slug}`}
                    onClick={() => setOpen(false)}
                    aria-current={active ? 'page' : undefined}
                    className={`block px-2 py-1 rounded text-sm leading-snug ${active ? 'bg-white font-semibold border-l-2 border-black -ml-[2px]' : 'text-[color:var(--color-text-soft)] hover:text-black hover:bg-white/40'}`}
                  >
                    <span className="font-mono text-[10px] mr-2">{String(idx + 1 + (partIdx === 0 ? 0 : course.parts[0].lessons.length)).padStart(2, '0')}</span>
                    {lesson.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <div className="mt-6 pt-6 border-t border-[color:var(--color-border)]">
        <Link
          href={`/courses/${course.slug}/project`}
          onClick={() => setOpen(false)}
          aria-current={isProject ? 'page' : undefined}
          className={`block px-2 py-1 rounded text-sm ${isProject ? 'bg-white font-semibold border-l-2 border-black -ml-[2px]' : 'text-[color:var(--color-text-soft)] hover:text-black hover:bg-white/40'}`}
        >
          <span className="text-xs uppercase tracking-widest mr-2">Project</span>
          {course.project.title}
        </Link>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 shrink-0 sticky top-4 self-start max-h-[calc(100vh-2rem)] overflow-y-auto px-2">
        {list}
      </aside>

      {/* Mobile toggle + drawer */}
      <div className="md:hidden border-b border-[color:var(--color-border)] px-4 py-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-controls="lesson-drawer"
          className="text-sm font-medium underline-offset-2 hover:underline"
        >
          {open ? 'Hide lessons' : 'Lessons'}
        </button>
      </div>
      {open && (
        <div
          id="lesson-drawer"
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Course lessons"
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

- [ ] **Step 3: Note**

The drawer test runs against the lesson page (Task 11). Skip running it until Task 11 is done.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(site): lesson sidebar with sticky desktop + mobile drawer"
```

---

## Task 11: Lesson reader page

**Files:**
- Create: `app/courses/[course]/lessons/[lesson]/page.tsx`, `components/site/breadcrumb.tsx`, `components/site/prev-next.tsx`, `tests/e2e/lesson.spec.ts`

- [ ] **Step 1: Create breadcrumb**

`components/site/breadcrumb.tsx`:

```tsx
import Link from 'next/link';

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-[color:var(--color-text-soft)]">
      <ol className="flex flex-wrap gap-1">
        {items.map((item, i) => (
          <li key={i} className="flex gap-1">
            {item.href ? <Link href={item.href} className="hover:text-black hover:underline">{item.label}</Link> : <span aria-current="page">{item.label}</span>}
            {i < items.length - 1 && <span aria-hidden>/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

- [ ] **Step 2: Create prev/next**

`components/site/prev-next.tsx`:

```tsx
import Link from 'next/link';
import type { LessonMeta } from '@/content/courses/types';

export function PrevNext({
  courseSlug,
  prev,
  next,
}: {
  courseSlug: string;
  prev: LessonMeta | null;
  next: LessonMeta | null;
}) {
  return (
    <nav aria-label="Lesson navigation" className="mt-12 grid grid-cols-2 gap-3">
      {prev ? (
        <Link href={`/courses/${courseSlug}/lessons/${prev.slug}`} className="rounded-md border border-[color:var(--color-border)] p-4 hover:border-black/30">
          <span className="block text-xs uppercase tracking-widest text-[color:var(--color-text-soft)]">← Previous</span>
          <span className="block mt-1 font-medium">{prev.title}</span>
        </Link>
      ) : <div aria-hidden />}
      {next ? (
        <Link href={`/courses/${courseSlug}/lessons/${next.slug}`} className="rounded-md border border-[color:var(--color-border)] p-4 hover:border-black/30 text-right">
          <span className="block text-xs uppercase tracking-widest text-[color:var(--color-text-soft)]">Next →</span>
          <span className="block mt-1 font-medium">{next.title}</span>
        </Link>
      ) : <div aria-hidden />}
    </nav>
  );
}
```

- [ ] **Step 3: Write the lesson test**

`tests/e2e/lesson.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('lesson page renders body, breadcrumb, sidebar, prev/next', async ({ page }) => {
  await page.goto('/courses/drag-drop-react/lessons/01-intro-and-landscape');
  await expect(page.getByRole('heading', { level: 1, name: /Intro & DnD landscape/i })).toBeVisible();
  await expect(page.getByRole('navigation', { name: /Breadcrumb/i })).toBeVisible();
  await expect(page.getByRole('navigation', { name: /Course lessons/i })).toBeVisible();
  await expect(page.getByRole('navigation', { name: /Lesson navigation/i })).toBeVisible();
});

test('lesson 404s for unknown slug', async ({ page }) => {
  const res = await page.goto('/courses/drag-drop-react/lessons/nope');
  expect(res?.status()).toBe(404);
});
```

- [ ] **Step 4: Implement the lesson page**

`app/courses/[course]/lessons/[lesson]/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllCourses, getCourse, getLesson, flattenLessons } from '@/lib/courses';
import { LessonSidebar } from '@/components/site/lesson-sidebar';
import { Breadcrumb } from '@/components/site/breadcrumb';
import { PrevNext } from '@/components/site/prev-next';

export async function generateStaticParams() {
  return getAllCourses().flatMap((course) =>
    flattenLessons(course).map((lesson) => ({ course: course.slug, lesson: lesson.slug }))
  );
}

export async function generateMetadata(
  { params }: { params: Promise<{ course: string; lesson: string }> }
): Promise<Metadata> {
  const p = await params;
  const ctx = getLesson(p.course, p.lesson);
  if (!ctx) return {};
  return {
    title: `${ctx.lesson.title} · ${ctx.course.title}`,
    description: ctx.lesson.summary,
  };
}

type Params = { course: string; lesson: string };

export default async function LessonPage({ params }: { params: Promise<Params> }) {
  const { course: courseSlug, lesson: lessonSlug } = await params;
  const ctx = getLesson(courseSlug, lessonSlug);
  if (!ctx) notFound();

  // Dynamically import the MDX file. Path matches content/courses/<course>/lessons/<lesson>.mdx
  let MDXContent: React.ComponentType;
  try {
    MDXContent = (await import(`@/content/courses/${courseSlug}/lessons/${lessonSlug}.mdx`)).default;
  } catch {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl md:flex md:gap-10 md:px-6 md:py-8">
      <LessonSidebar course={ctx.course} currentLessonSlug={lessonSlug} />
      <main id="main-content" className="flex-1 min-w-0 px-6 py-6 md:py-2">
        <Breadcrumb
          items={[
            { label: 'Courses', href: '/' },
            { label: ctx.course.title, href: `/courses/${ctx.course.slug}` },
            { label: ctx.lesson.title },
          ]}
        />
        <article className="mx-auto max-w-[var(--container-prose)] mt-6">
          <p className="text-xs uppercase tracking-widest text-[color:var(--color-text-soft)]">
            Lesson {ctx.index + 1} / {ctx.total}
          </p>
          <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mt-2 leading-tight">
            {ctx.lesson.title}
          </h1>
          {ctx.lesson.summary && (
            <p className="mt-3 text-lg text-[color:var(--color-text-soft)]">{ctx.lesson.summary}</p>
          )}

          <div className="mt-10 prose-lesson">
            <MDXContent />
          </div>

          <PrevNext courseSlug={ctx.course.slug} prev={ctx.prev} next={ctx.next} />
        </article>
      </main>
    </div>
  );
}
```

- [ ] **Step 5: Add prose styles to `globals.css`**

Append to `globals.css`:

```css
.prose-lesson { font-size: 1rem; line-height: 1.7; }
.prose-lesson h2 { font-size: 1.5rem; font-weight: 600; margin: 2.5rem 0 1rem; padding-bottom: .25rem; border-bottom: 1px solid var(--color-border); }
.prose-lesson h3 { font-size: 1.2rem; font-weight: 600; margin: 2rem 0 .75rem; }
.prose-lesson p { margin: 1rem 0; }
.prose-lesson a { color: #1a1a1a; text-decoration: underline; text-underline-offset: 2px; }
.prose-lesson code { background: var(--color-bg-soft); padding: 1px 5px; border-radius: 3px; font-size: .9em; font-family: var(--font-mono); }
.prose-lesson pre code { background: transparent; padding: 0; font-size: 1em; }
.prose-lesson ul, .prose-lesson ol { margin: 1rem 0; padding-left: 1.5rem; }
.prose-lesson li { margin: .25rem 0; }
.heading-anchor { color: inherit; text-decoration: none; }
.heading-anchor:hover::after { content: ' #'; color: var(--color-text-soft); }
```

- [ ] **Step 6: Note — tests need a real lesson MDX file to pass**

Skip running the test until Task 13 creates the actual lesson MDX. Add a TODO note in your terminal if needed.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(lesson): reader page with breadcrumb, sidebar, prev/next, prose styles"
```

---

## Task 12: Final project page `/courses/[course]/project`

**Files:**
- Create: `app/courses/[course]/project/page.tsx`, `tests/e2e/project.spec.ts`

- [ ] **Step 1: Write the test**

`tests/e2e/project.spec.ts`:

```ts
import { test, expect } from '@playwright/test';

test('project page renders title and sections', async ({ page }) => {
  await page.goto('/courses/drag-drop-react/project');
  await expect(page.getByRole('heading', { level: 1, name: /Restaurant Table Booking Manager/i })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: /Requirements/i })).toBeVisible();
});
```

- [ ] **Step 2: Implement**

`app/courses/[course]/project/page.tsx`:

```tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getAllCourses, getCourse } from '@/lib/courses';
import { LessonSidebar } from '@/components/site/lesson-sidebar';
import { Breadcrumb } from '@/components/site/breadcrumb';

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
```

- [ ] **Step 3: Note** — test will fail until project.mdx exists (Task 14). Defer.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "feat(project): final project guideline page shell"
```

---

## Task 13: Sample lesson + sample demo (proves the loop)

**Files:**
- Create: `content/courses/drag-drop-react/lessons/01-intro-and-landscape.mdx`
- Create: `content/courses/drag-drop-react/lessons/04-html5-hands-on.mdx`
- Create: `components/demos/drag-drop-react/html5-bin-demo.tsx`

- [ ] **Step 1: Author lesson 1 (no demo, prose-only)**

`content/courses/drag-drop-react/lessons/01-intro-and-landscape.mdx`:

```mdx
import { Callout } from '@/components/mdx/callout';
import { Recap } from '@/components/mdx/recap';

Drag and drop is one of those interactions that *seems* trivial until you actually try to build it. The browser ships a "drag and drop API" with the platform, but it has serious limitations — it doesn't work on touch, it's awkward to style, and it has no built-in accessibility story. To build something that actually works for real users, you almost always reach for a library, or build your own from lower-level primitives.

This course teaches both. You'll learn what the browser gives you, why those primitives aren't enough on their own, how to build cross-device drag from scratch using Pointer Events, and finally the modern React way with `@dnd-kit`. We'll wrap it all up by building a real Restaurant Table Booking Manager — drag reservations onto tables, drag tables on a snap-to-grid floor plan, and drag tables together to combine them for large parties.

## What the browser ships

Modern browsers offer two relevant APIs for building drag interactions:

1. **HTML5 Drag and Drop API** — declarative-ish, fires `dragstart` / `dragover` / `drop` events. Doesn't work on touch.
2. **Pointer Events API** — low-level unified mouse/touch/pen events. You build "drag" yourself on top of `pointerdown` / `pointermove` / `pointerup`.

We'll cover both in Part 1.

## The library landscape

In React, the practical choices in 2026 are:

- **`@dnd-kit`** — modern, modular, accessible, the recommended default
- **`react-dnd`** — older, still maintained, more verbose API
- **`react-beautiful-dnd`** — popular for years, now deprecated and unmaintained
- **`react-grid-layout`** — specialized: grid-based dashboard layouts

Part 2 of this course focuses on `@dnd-kit`.

<Callout type="tip" title="When to skip libraries">
For very simple interactions — a single draggable element with one drop zone, no need for keyboard or sortable lists — native APIs are fine. As soon as you need sortable lists, accessibility, animations, or anything cross-container, reach for a library.
</Callout>

## What you'll build

The course finale is a **Restaurant Table Booking Manager**. It exercises every concept: sortable lists (the reservation sidebar), free-form 2D drag (tables on the floor), cross-container drag (reservation → table), custom collision detection (table-to-table proximity for connecting), keyboard accessibility, and persistence. You'll have a portfolio piece by the end.

<Recap>
- Drag-and-drop is harder than it looks because of mobile, accessibility, and styling constraints.
- The browser gives us HTML5 DnD (desktop only) and Pointer Events (everywhere, low-level).
- In React, `@dnd-kit` is the modern default in 2026.
- Part 1 builds your foundations from the platform up; Part 2 teaches `@dnd-kit`; the final project ties it together.
</Recap>
```

- [ ] **Step 2: Build the html5-bin-demo component**

`components/demos/drag-drop-react/html5-bin-demo.tsx`:

```tsx
'use client';
import { useState } from 'react';

const ITEMS = [
  { id: 'a', label: 'Card A' },
  { id: 'b', label: 'Card B' },
  { id: 'c', label: 'Card C' },
];

export function Html5BinDemo() {
  const [items, setItems] = useState(ITEMS);
  const [bin, setBin] = useState<typeof ITEMS>([]);
  const [overBin, setOverBin] = useState(false);

  function onDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault(); // required to allow drop
    e.dataTransfer.dropEffect = 'move';
    setOverBin(true);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const moved = items.find((i) => i.id === id);
    if (!moved) return;
    setItems((cur) => cur.filter((i) => i.id !== id));
    setBin((cur) => [...cur, moved]);
    setOverBin(false);
  }

  function reset() {
    setItems(ITEMS);
    setBin([]);
  }

  return (
    <div className="flex gap-4 items-start">
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wider text-[color:var(--color-text-soft)] mb-2">Cards</p>
        <ul className="space-y-2 min-h-32">
          {items.map((it) => (
            <li
              key={it.id}
              draggable
              onDragStart={(e) => onDragStart(e, it.id)}
              className="rounded border border-[color:var(--color-border)] bg-white px-3 py-2 cursor-grab active:cursor-grabbing select-none"
            >
              {it.label}
            </li>
          ))}
          {items.length === 0 && <li className="text-xs italic opacity-60">All cards moved.</li>}
        </ul>
      </div>
      <div
        onDragOver={onDragOver}
        onDragLeave={() => setOverBin(false)}
        onDrop={onDrop}
        aria-label="Drop bin"
        className={`flex-1 min-h-32 rounded border-2 border-dashed p-3 transition ${overBin ? 'border-black bg-black/5' : 'border-[color:var(--color-border)]'}`}
      >
        <p className="text-xs uppercase tracking-wider text-[color:var(--color-text-soft)] mb-2">Bin</p>
        <ul className="space-y-2">
          {bin.map((it) => (
            <li key={it.id} className="rounded border border-[color:var(--color-border)] bg-white/80 px-3 py-2">{it.label}</li>
          ))}
          {bin.length === 0 && <li className="text-xs italic opacity-60">Drop cards here.</li>}
        </ul>
      </div>
      <button type="button" onClick={reset} className="text-xs px-2 py-1 rounded border border-[color:var(--color-border)] hover:bg-white/40">
        Reset
      </button>
    </div>
  );
}
```

<Callout type="warning">
This demo is desktop-only on purpose — it uses HTML5 DnD which doesn't fire on touch. We'll fix that in Lesson 6+.
</Callout>

- [ ] **Step 3: Author lesson 4 (HTML5 hands-on, with demo)**

`content/courses/drag-drop-react/lessons/04-html5-hands-on.mdx`:

```mdx
import { Callout } from '@/components/mdx/callout';
import { Recap } from '@/components/mdx/recap';
import { Html5BinDemo } from '@/components/demos/drag-drop-react/html5-bin-demo';

We've seen the events (Lesson 2) and the data flow (Lesson 3). Time to put them together. We'll build a tiny "drag a card into a bin" demo using only the HTML5 DnD API — no library, no React magic beyond `useState`.

## The five rules

To make HTML5 DnD work, you need:

1. **Mark the source `draggable={true}`** so the browser will start a drag on it.
2. **In `dragstart`, set `dataTransfer.setData()`** so something travels with the drag.
3. **In `dragover` on the target, call `e.preventDefault()`** — this signals "I accept the drop." Without it, the drop event never fires.
4. **In `drop`, call `preventDefault()` and read `dataTransfer.getData()`** to figure out what was dropped.
5. **Set `dataTransfer.effectAllowed` and `dropEffect`** so the cursor shows the right feedback.

## The demo

Drag a card into the bin. Inspect the events in DevTools to see the order they fire.

<Demo title="HTML5 drag-into-bin">
  <Html5BinDemo />
</Demo>

## Why this won't work on your phone

If you opened this on a touch device, you noticed: nothing happens. HTML5 DnD ignores touch. The browser fires `touchstart` and starts a scroll, never a drag. We'll address this in Lesson 6 with Pointer Events.

<Callout type="warning" title="Don't ship this to production">
This pattern is fine for desktop-only internal tools but breaks on mobile and has no keyboard or screen-reader story. For real apps, use `@dnd-kit` (Part 2) or build cross-device drag from scratch (Lessons 6–9).
</Callout>

<Recap>
- HTML5 DnD requires `draggable={true}`, `setData` in `dragstart`, `preventDefault` in `dragover`, and reading `getData` in `drop`.
- Without `preventDefault` in `dragover`, the drop event never fires — this is the #1 gotcha.
- HTML5 DnD does not work on touch. That's the gap Pointer Events will close.
</Recap>
```

- [ ] **Step 4: Run e2e tests against built site**

```bash
npm run test:e2e
```
Expected: lesson, course-detail, project, mobile-drawer, homepage all PASS. (`project.spec.ts` will still fail — Task 14.)

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(content): sample lesson 1 + lesson 4 + html5-bin-demo"
```

---

## Task 14: Project guideline MDX

**Files:**
- Create: `content/courses/drag-drop-react/project.mdx`

- [ ] **Step 1: Author the project guideline**

`content/courses/drag-drop-react/project.mdx`:

```mdx
import { Callout } from '@/components/mdx/callout';

You've made it through 18 lessons. Now you're going to build a real app that puts everything together: a **Restaurant Table Booking Manager**.

## What you'll build

A small floor-plan tool a restaurant host could realistically use. The screen has two regions:

- **A floor plan canvas** showing tables (rectangles or circles) placed in 2D space.
- **A reservations sidebar** listing pending bookings (party name, party size, time).

The host can: drag a reservation onto a table to assign it, drag tables to reposition them on the floor (snapping to a grid), and drag two tables together to **connect** them — creating a single linked group with a combined seat count for large parties.

It must work on desktop, on touch (the host might be using a tablet), and via keyboard (for accessibility).

## Requirements (must-haves)

- A floor plan canvas with at least 6 tables of varying capacities (2-, 4-, 6-seat) placed in 2D
- A reservations sidebar that's a sortable list (drag to reorder reservations)
- Drag a reservation onto a table → reservation is assigned, table is marked occupied
- Drag tables on the floor → snap to a 20px grid
- **Drag-to-connect:** drag table A within ~24px of table B → they auto-link with a visible connector. Combined seat count is shown on either table. Click the connector to disconnect.
- Works on desktop, touch, and keyboard
- localStorage persistence: floor plan layout, reservation assignments, and connections survive a page refresh

## Suggested file structure

```
src/
├── App.tsx
├── components/
│   ├── FloorPlan.tsx          # the canvas + DndContext
│   ├── Table.tsx              # one draggable table
│   ├── Reservation.tsx        # one draggable reservation card
│   ├── Sidebar.tsx            # the sortable reservations list
│   └── Connector.tsx          # visual link between two connected tables
├── hooks/
│   ├── useTables.ts           # state: positions, occupants, connections
│   └── usePersistence.ts      # read/write to localStorage
├── lib/
│   ├── grid.ts                # snap-to-grid math
│   └── collision.ts           # custom proximity-based collision detection
└── types.ts
```

## Step-by-step guideline

Build it in this order — each step is a working app you can test before moving to the next.

1. **Hardcoded floor plan canvas.** Put 6 tables on the screen with absolute positioning. No dragging yet. Just get the visual right.

2. **Drag tables to reposition.** Wrap the floor in `DndContext`. Each table gets `useDraggable`. On `onDragEnd`, update the table's position in state. Add the snap-to-grid modifier from `@dnd-kit`.

3. **Reservations sidebar (sortable).** Build the sidebar using `@dnd-kit/sortable`. Each reservation is a `useSortable` item. Reordering should work via mouse, touch, and keyboard.

4. **Drag reservations onto tables.** Each table also gets `useDroppable`. In `onDragEnd`, if a reservation lands on a table, assign it. The table visually changes to show it's occupied.

5. **Drag-to-connect tables.** This is the hardest step. You need custom collision detection — when one table's center is within ~24px of another's, they should connect. Look at `pointerWithin` and write your own collision algorithm based on it. Render a `<Connector>` line/box between connected tables.

6. **Keyboard accessibility pass.** Make sure all three drag interactions (tables, reservations, drag-to-connect) work via keyboard. Add screen-reader announcements via `<DndContext announcements={...}>`.

7. **localStorage persistence.** Wrap the whole state in `usePersistence`. Read on mount, write on change.

## Common pitfalls

- **Forgetting `preventDefault` in dragover** — only relevant if you're mixing in HTML5 DnD. With `@dnd-kit` you won't hit this, but it's the #1 gotcha if you ever drop down a layer.
- **Stale closures in `onDragEnd`** — keep your handlers using functional state updates (`setTables(prev => ...)`) so you don't capture stale state.
- **Custom collision detection running too often** — collision runs on every move event. Keep it cheap. Don't iterate every table on every pixel of movement; cache something.
- **Connector lines that don't update on table drag** — the connector position needs to derive from the two table positions in render, not be stored separately.
- **Mobile drag stealing scroll** — when wrapping a table in `useDraggable`, the touch sensor may need a small `activationConstraint: { delay: 150 }` so a quick swipe can still scroll the page.

## Stretch goals

- **Multi-select with shift-click** — move several tables together
- **Undo/redo** — keep an action history in state
- **Time-based reservation filtering** — show only reservations for the next 2 hours
- **Different table shapes** — round, square, rectangle, with capacity tied to shape
- **Capacity warnings** — flag a connected group whose combined capacity is less than the assigned party size

## Reference

Once a reference implementation is published it'll be linked here.
```

- [ ] **Step 2: Run project tests**

```bash
npm run test:e2e -- project
```
Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git add -A && git commit -m "feat(content): final project guideline (Restaurant Table Booking Manager)"
```

---

## Task 15: Sitemap, robots, OG metadata, JSON-LD

**Files:**
- Create: `app/sitemap.ts`, `app/robots.ts`, `public/og/default.png` (placeholder)
- Modify: `app/layout.tsx`, course/lesson pages (add JSON-LD)

- [ ] **Step 1: Create `app/sitemap.ts`**

```ts
import type { MetadataRoute } from 'next';
import { getAllCourses, flattenLessons } from '@/lib/courses';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://it-courses.vercel.app';
  const entries: MetadataRoute.Sitemap = [{ url: base, changeFrequency: 'weekly', priority: 1.0 }];
  for (const course of getAllCourses()) {
    entries.push({ url: `${base}/courses/${course.slug}`, changeFrequency: 'weekly', priority: 0.9 });
    entries.push({ url: `${base}/courses/${course.slug}/project`, changeFrequency: 'monthly', priority: 0.7 });
    for (const lesson of flattenLessons(course)) {
      entries.push({ url: `${base}/courses/${course.slug}/lessons/${lesson.slug}`, changeFrequency: 'monthly', priority: 0.7 });
    }
  }
  return entries;
}
```

- [ ] **Step 2: Create `app/robots.ts`**

```ts
import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://it-courses.vercel.app';
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `${base}/sitemap.xml`,
  };
}
```

- [ ] **Step 3: Add a placeholder OG image**

Create `public/og/default.png` — a 1200×630 cream-colored placeholder with "IT Courses" in the center. (Use any image editor; a solid `#fbf9f6` rectangle with serif "IT Courses" centered is fine.)

- [ ] **Step 4: Add JSON-LD to course detail page**

In `app/courses/[course]/page.tsx`, inside the `<main>` (top), add:

```tsx
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
```

- [ ] **Step 5: Add JSON-LD to lesson page**

In `app/courses/[course]/lessons/[lesson]/page.tsx`, inside the article wrapper (top), add:

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'LearningResource',
      name: ctx.lesson.title,
      isPartOf: { '@type': 'Course', name: ctx.course.title },
      learningResourceType: 'Lesson',
    }),
  }}
/>
```

- [ ] **Step 6: Verify**

```bash
npm run build && npm run start
```

Visit:
- `http://localhost:3000/sitemap.xml` — expect XML with all 21 URLs (1 home + 1 course + 1 project + 18 lessons)
- `http://localhost:3000/robots.txt` — expect allow + sitemap line

Stop the server.

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "feat(seo): sitemap, robots, OG default image, JSON-LD on course + lesson"
```

---

## Task 16: Accessibility, Lighthouse, README, deploy

**Files:**
- Create: `tests/e2e/a11y.spec.ts`, `README.md`
- Configure: Vercel project

- [ ] **Step 1: Add automated a11y test**

`tests/e2e/a11y.spec.ts`:

```ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const pages = [
  '/',
  '/courses/drag-drop-react',
  '/courses/drag-drop-react/lessons/01-intro-and-landscape',
  '/courses/drag-drop-react/lessons/04-html5-hands-on',
  '/courses/drag-drop-react/project',
];

for (const path of pages) {
  test(`${path} has no detectable a11y violations`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .disableRules(['color-contrast']) // re-enable after design tweak pass if needed
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
```

- [ ] **Step 2: Run all e2e tests**

```bash
npm run test:e2e
```
Expected: all tests PASS. Fix any a11y violations the axe scan turns up before continuing — common issues are missing alt text, missing form labels, or invalid ARIA attributes.

- [ ] **Step 3: Run Lighthouse manually**

```bash
npm run build && npm run start
```

In a new terminal:
```bash
npx lighthouse http://localhost:3000/courses/drag-drop-react/lessons/04-html5-hands-on --view --preset=desktop
```
Expected: Performance ≥ 95, Accessibility ≥ 95. If either is below, fix the flagged issues — most likely candidates are unoptimized images, missing focus indicators, or third-party fonts blocking render. Stop server.

- [ ] **Step 4: Test mobile drawer on a real phone**

Deploy a preview (Step 6) and test the mobile drawer on an actual phone. Verify: drawer opens, focus moves into it, Escape closes it, lesson links inside the drawer navigate correctly.

- [ ] **Step 5: Write `README.md`**

```md
# IT Courses

A personal-portfolio site that publishes hands-on technology courses, starting with **Drag and Drop in React**.

## Stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS v4
- MDX (`@next/mdx`) with Shiki, GFM, autolinked headings
- Vitest (unit) + Playwright (e2e)
- Deployed on Vercel

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # unit tests (vitest)
npm run test:e2e     # end-to-end tests (playwright)
npm run typecheck    # tsc --noEmit
```

## Authoring a new course

1. Create the folder: `content/courses/<slug>/`
2. Add `course.ts` exporting a `Course`-typed manifest. See `content/courses/drag-drop-react/course.ts` for the shape.
3. Author one MDX file per lesson under `content/courses/<slug>/lessons/`. File names must be `NN-<lesson-slug>.mdx` and the slug must match the manifest.
4. Author the final-project guideline at `content/courses/<slug>/project.mdx`.
5. Register the course by importing it in `content/courses/index.ts` and adding it to `allCourses`.
6. (Optional) Add live demo components under `components/demos/<slug>/`.

## Authoring a lesson

A lesson MDX file looks like:

```mdx
import { Callout } from '@/components/mdx/callout';
import { Recap } from '@/components/mdx/recap';

Lesson body — short prose paragraphs.

## A section heading

More prose. ` ` `inline code` ` `.

```ts
// fenced code blocks render with Shiki + a copy button
const x = 1;
```

<Callout type="tip" title="Optional title">
A callout. Types: note, warning, tip.
</Callout>

<Recap>
- Bullet 1
- Bullet 2
</Recap>
```

For lessons with an embedded interactive demo:

```mdx
import { MyDemo } from '@/components/demos/<slug>/my-demo';

Some prose introducing the demo.

<Demo title="Try it">
  <MyDemo />
</Demo>
```

Demo components must work on desktop, touch, and keyboard, and respect `prefers-reduced-motion`.

## Deployment

Pushed to Vercel. Set `NEXT_PUBLIC_SITE_URL` to your deployment URL for correct sitemap/robots output.
```

- [ ] **Step 6: Deploy to Vercel**

```bash
npm i -g vercel
vercel login
vercel        # for preview
vercel --prod # for production
```

After deploy, set the `NEXT_PUBLIC_SITE_URL` env var in Vercel to the production URL, then redeploy so the sitemap/robots use the right base URL:

```bash
vercel env add NEXT_PUBLIC_SITE_URL production
# paste the URL when prompted
vercel --prod
```

Verify:
- `https://<your-domain>/sitemap.xml` — XML
- `https://<your-domain>/robots.txt` — text
- `https://<your-domain>/courses/drag-drop-react/lessons/04-html5-hands-on` — lesson 4 with demo working
- Open the deployed lesson URL on a phone — drawer works

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "chore: README, a11y test, Vercel deploy"
```

---

## Task 17: Author the remaining 16 lessons + their demos

This is content-authoring work, not engineering. The platform from Tasks 1–16 supports all of it; you just write the MDX files and build the demo components as you go.

For each lesson below: create the MDX file at the listed path, follow the lesson template (intro paragraph → ## section headings → optional `<Demo>` → `<Recap>`), and build a demo component if marked **(demo)**. Build, run e2e tests, and commit after each one.

**Authoring template** (paste at top of each new lesson MDX):

```mdx
import { Callout } from '@/components/mdx/callout';
import { Recap } from '@/components/mdx/recap';
// import { YourDemo } from '@/components/demos/drag-drop-react/your-demo';

Opening paragraph: what this lesson teaches and why it matters.

## First section heading

Body prose.

```ts
// optional fenced code
```

## Second section heading

More body prose.

<Recap>
- Bullet
- Bullet
- Bullet
</Recap>
```

**Lesson checklist:**

- [ ] **02 — HTML5 DnD: events & lifecycle** — `content/courses/drag-drop-react/lessons/02-html5-events.mdx`
- [ ] **03 — HTML5 DnD: dataTransfer, dropEffect, drag image** — `03-html5-data-transfer.mdx`
- [ ] **05 — Limitations of HTML5 DnD** — `05-html5-limitations.mdx`
- [ ] **06 — Pointer Events API** — `06-pointer-events.mdx` **(demo: pointer-events-cross-device)**
- [ ] **07 — Cross-device drag from scratch — part 1** — `07-cross-device-drag-1.mdx` **(demo: cross-device-one-element)**
- [ ] **08 — Cross-device drag from scratch — part 2** — `08-cross-device-drag-2.mdx` **(demo: cross-device-with-drop-zones)**
- [ ] **09 — Accessibility from scratch** — `09-accessibility-from-scratch.mdx` **(demo: keyboard-accessible-drag)**
- [ ] **10 — Library landscape** — `10-library-landscape.mdx`
- [ ] **11 — `@dnd-kit/core` first drag** — `11-dnd-kit-first-drag.mdx` **(demo: dnd-kit-first-drag)**
- [ ] **12 — Sensors & activation constraints** — `12-sensors.mdx` **(demo: dnd-kit-sensors)**
- [ ] **13 — Modifiers** — `13-modifiers.mdx` **(demo: dnd-kit-modifiers)**
- [ ] **14 — Sortable lists** — `14-sortable-lists.mdx` **(demo: dnd-kit-sortable)**
- [ ] **15 — Multi-container DnD** — `15-multi-container.mdx` **(demo: dnd-kit-multi-container)**
- [ ] **16 — DragOverlay & animations** — `16-drag-overlay.mdx` **(demo: dnd-kit-drag-overlay)**
- [ ] **17 — Custom collision detection** — `17-custom-collision.mdx` **(demo: dnd-kit-custom-collision)**
- [ ] **18 — Accessibility in `@dnd-kit`** — `18-accessibility-dnd-kit.mdx` **(demo: dnd-kit-a11y)**

**For each demo component:** create `components/demos/drag-drop-react/<demo-name>.tsx`, make sure it works on desktop + touch + keyboard, respects `prefers-reduced-motion`. After authoring each lesson:

```bash
npm run test:e2e
git add -A && git commit -m "content: lesson NN — <title>"
```

When all 16 lessons are done, redeploy:

```bash
vercel --prod
```

Site is fully shipped.

---

## Self-Review

**Spec coverage:**
- §2 Goals (static-friendly, embedded demos, project guideline, easy authoring, accessibility, mobile) — Tasks 1–16 cover all five.
- §4 Tech stack (Next.js 16, MDX, Tailwind v4, Shiki, rehype-slug/autolink-headings, @dnd-kit, Vercel) — Task 1 (deps), Task 3 (MDX pipeline), Task 13 (@dnd-kit usage).
- §5 Content model (course folder + manifest + MDX + registry) — Task 4.
- §6 Folder structure — File Map at top of plan.
- §7.1 Homepage — Task 8.
- §7.2 Course detail — Task 9.
- §7.3 Lesson reader (sidebar, breadcrumb, prev/next, drawer) — Tasks 10, 11.
- §7.4 Final project page — Task 12.
- §8 Demo pattern + `<Demo>` primitive — Task 7 (Demo component), Task 13 (worked example).
- §9 Visual design (cream bg, serif headings, dark code blocks, mono code) — Task 2.
- §10 Mobile/responsive — Task 10 (drawer), Task 11 (responsive layout), Task 16 Step 4 (real-phone test).
- §11 Accessibility (skip link, aria-current, focus trap, copy-button live region, heading outline, prefers-reduced-motion) — Tasks 2, 6, 7, 10, 16.
- §12 SEO (metadata, sitemap, robots, JSON-LD) — Task 15.
- §13 Course content scope (18 lessons + project) — Tasks 13, 14 (samples), Task 17 (rest).
- §14 Definition of done (deploy, all 18 lessons, Lighthouse ≥95, mobile verified, README, sitemap/robots) — Task 16, Task 17.

**Placeholder scan:** No "TBD" / "TODO" / "implement later" remaining. The single `(Optional)` in README is a real-optional, not a deferral.

**Type consistency:** `getAllCourses`/`getCourse`/`getLesson`/`flattenLessons` signatures defined in Task 5 are used identically in Tasks 8, 9, 11, 12, 15. `Course` / `LessonMeta` / `LessonContext` types are imported consistently.

**Scope check:** Single subsystem (one platform). Plan does not need to be split.

---

## Execution Handoff

**Plan complete and saved to `docs/superpowers/plans/2026-04-30-it-courses.md`. Two execution options:**

1. **Subagent-Driven (recommended)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints.

**Which approach?**
