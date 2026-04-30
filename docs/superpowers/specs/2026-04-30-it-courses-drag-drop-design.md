# IT Courses — Design Spec

**Date:** 2026-04-30
**Author:** Phuoc Luu
**Status:** Approved (pending implementation)

## 1. Overview

A personal-portfolio website that publishes hands-on technology courses, starting with one course on **Drag and Drop in React**. Each course is a sequence of lessons that teach a topic, ending with a real-world project the learner builds locally using a written guideline.

The site is multi-course by design (more courses will be added over time), but the v1 deliverable is the platform shell plus one fully authored course.

## 2. Goals and non-goals

### Goals
- A public, static-friendly site that reads as a polished portfolio piece.
- Lessons that combine prose, code, and inline live React demos so concepts can be experienced, not just read.
- A final-project page per course that gives the learner a real specification and guideline to build something they can put in their own portfolio.
- Easy authoring: a new lesson is one MDX file, a new course is a folder.
- Strong accessibility, fast page loads, mobile-first responsiveness — including all drag demos working on touch.

### Non-goals (v1)
- No user accounts, auth, or login.
- No database or backend.
- No progress tracking, completion state, or "courses completed" indicator.
- No comments, discussion, or social features.
- No search (only one course in v1).
- No payments or paid content.
- No in-browser code editor / IDE per lesson — demos are read-only.
- No internationalization.
- No dark-mode toggle (light theme only for v1).
- No analytics provider wired in by default.

## 3. Audience

The primary audience is **the author** — this is a portfolio piece. The secondary audience is any developer who lands on a lesson via search or a shared link and wants to learn drag-and-drop in React. There is no expectation of repeat visitors or learner accounts.

## 4. Tech stack

- **Next.js 16** with the App Router
- **MDX** via `@next/mdx`, so lessons can `import` React components into prose
- **Tailwind CSS v4**
- **Shiki** for syntax highlighting at build time (no client JS for code blocks)
- **rehype-slug** + **rehype-autolink-headings** for anchor links on section headings
- **`@dnd-kit/core` + `@dnd-kit/sortable`** as both course material and what powers the embedded demos
- **Vercel** for hosting (zero-config deploy, static-rendered lesson pages with `generateStaticParams`)

Runtime: Node 24 LTS, Fluid Compute (default).

## 5. Architecture and content model

Content lives in the repository as MDX files. There is no CMS. A course is a folder under `content/courses/<slug>/` with:

- `course.ts` — typed manifest (title, summary, ordered lesson list, project metadata)
- `lessons/NN-<slug>.mdx` — one MDX file per lesson
- `project.mdx` — the final-project guideline

Live demo components live alongside the rest of the codebase in `components/demos/<course-slug>/<demo-name>.tsx` and are imported into MDX where needed.

The `course.ts` manifest is the authoritative ordering for the lesson list, prev/next navigation, and the sidebar. MDX file names are prefixed with a number so the on-disk order matches.

## 6. Folder structure

```
IT-courses/
├── app/
│   ├── page.tsx                          # homepage (course grid)
│   ├── courses/[course]/
│   │   ├── page.tsx                      # course detail (lesson list)
│   │   ├── lessons/[lesson]/page.tsx     # lesson reader
│   │   └── project/page.tsx              # final project guideline
│   ├── layout.tsx                        # root layout (nav, footer, fonts)
│   ├── globals.css
│   ├── sitemap.ts
│   └── robots.ts
├── content/
│   └── courses/
│       └── drag-drop-react/
│           ├── course.ts
│           ├── project.mdx
│           └── lessons/
│               ├── 01-intro-and-landscape.mdx
│               ├── 02-html5-events.mdx
│               ├── ... (18 total)
│               └── 18-accessibility-dnd-kit.mdx
├── components/
│   ├── site/                             # nav, footer, sidebar, prev-next, breadcrumb, drawer
│   ├── mdx/                              # styled MDX primitives (Pre, Code, Callout, Demo, Recap)
│   └── demos/
│       └── drag-drop-react/              # one folder per course
│           ├── html5-bin-demo.tsx
│           ├── pointer-events-cross-device.tsx
│           ├── dnd-kit-first-drag.tsx
│           └── ... (one demo per key-concept lesson)
├── lib/
│   ├── courses.ts                        # load manifests, list lessons, find prev/next
│   └── mdx.ts                            # MDX compile config + plugins
├── public/
│   └── og/                               # static OG image placeholders for v1
├── docs/
│   └── superpowers/specs/                # this file lives here
├── next.config.mjs
├── tailwind.config.ts
├── package.json
└── README.md
```

`course.ts` shape:

```ts
// content/courses/drag-drop-react/course.ts
export const course = {
  slug: 'drag-drop-react',
  title: 'Drag and Drop in React',
  summary:
    'From native HTML5 DnD to @dnd-kit, ending in a real-world restaurant table-booking app.',
  lessons: [
    { slug: '01-intro-and-landscape', title: 'Intro & DnD landscape' },
    // ... 18 entries in order
  ],
  project: {
    slug: 'project',
    title: 'Restaurant Table Booking Manager',
  },
} as const;
```

A small registry file `content/courses/index.ts` re-exports every course manifest in build order — this is how `getAllCourses()` discovers which courses exist (no filesystem scanning at runtime). Adding a new course = create the folder + import its `course` from this index file.

`lib/courses.ts` exposes:
- `getAllCourses()` — reads the registry, for the homepage grid
- `getCourse(slug)` — for the course detail and lesson pages
- `getLesson(courseSlug, lessonSlug)` — returns lesson metadata + neighbors (prev/next)
- Each lesson MDX file is resolved at build time by Next.js's MDX loader; `generateStaticParams` enumerates lesson slugs from the course manifest.

## 7. Routes and pages

### 7.1 Homepage `/`
- Top nav: site name (left), `Courses · About` (right)
- Hero: serif headline, one-line subtitle, primary CTA → first course
- Section "Available courses": 2-column grid of course cards. Each card shows title, one-line summary, lesson count + "Project" badge, and a gradient/illustration thumbnail. In v1 only the drag-and-drop course card is real; one or two dimmed "Coming soon" placeholder cards are rendered alongside it from a small static array in the homepage component, for visual rhythm. They convert to real manifests as courses are authored.
- Footer: GitHub link, contact, copyright.

### 7.2 Course detail `/courses/[course]`
- Course hero: title, longer summary, **"What you'll learn"** (3–5 bullets), **"What you'll build"** (the table-booking app, with a small thumbnail).
- Lesson list: numbered, grouped by Part 1 / Part 2 (or whatever parts the course manifest defines), each row shows title and a one-line description. Clicking a row opens the lesson reader.
- Final-project card at the bottom, visually distinct (different background, "Project" label).

### 7.3 Lesson reader `/courses/[course]/lessons/[lesson]`
The workhorse page. Two-column layout above 768px:

- **Left sidebar (sticky):** full course lesson list, current lesson highlighted with `aria-current="page"`, grouped by part. Mobile: collapses to a top "Lessons" button that opens a slide-down drawer.
- **Main column** (max ~720px wide for prose readability):
  - Breadcrumb: `Drag & Drop in React / Lesson 6`
  - Lesson number label (e.g., `LESSON 6 / 18`), serif title, one-line subtitle
  - Body: MDX prose, code blocks (Shiki + copy button), callouts for `Note` / `Warning` / `Tip`, and embedded interactive demos
  - Demos render in a bordered "Live demo" container with an optional reset button
  - End of body: **Recap** box (3–5 bullets) + **Next steps** link to next lesson
  - Footer: prev / next nav buttons, disabled at boundaries

No on-page table of contents in v1 — lessons are scoped tightly enough that scrolling is fine.

### 7.4 Final project `/courses/[course]/project`
Same shell as a lesson page (sidebar + main). The project's own entry appears in the sidebar at the very bottom, visually distinct. Body sections:

1. **What you'll build** — short pitch + screenshot/GIF of the finished app
2. **Requirements** — must-haves checklist:
   - Floor plan with tables placed in 2D (snap-to-grid)
   - Reservations sidebar (sortable list)
   - Drag a reservation onto a table → assigned and table marked occupied
   - Drag tables to reposition them
   - **Drag-to-connect**: dragging table A close to table B auto-links them; combined seat count; click a connector to disconnect
   - Works on desktop + touch + keyboard
   - localStorage persistence (layout + reservations survive a refresh)
3. **Suggested file structure** — a starting skeleton
4. **Step-by-step guideline** — milestones in build order:
   1. Floor plan canvas with hardcoded tables
   2. Drag tables to reposition (snap-to-grid)
   3. Reservations sidebar (sortable list)
   4. Drag reservations onto tables
   5. Drag-to-connect tables
   6. Keyboard accessibility pass
   7. localStorage persistence
5. **Common pitfalls** — gotchas the author has hit
6. **Stretch goals** — multi-select, undo, time-based reservation filtering, table shapes (round / square / rectangle), capacity warnings
7. **Reference repo** — link to a complete reference implementation on GitHub (added once the author writes one)

## 8. Lesson MDX and demo component pattern

Every interactive demo is a self-contained client component. The MDX imports it and wraps it in a `<Demo>` primitive that provides the bordered container, optional reset button, and consistent spacing:

```mdx
import { Html5BinDemo } from '@/components/demos/drag-drop-react/html5-bin-demo';

The HTML5 DnD API exposes a sequence of events fired in a strict order...

<Demo title="Drag a card into the bin">
  <Html5BinDemo />
</Demo>

The key event order is `dragstart` → `dragover` → `drop` → `dragend`.
```

`<Demo>` lives in `components/mdx/demo.tsx`. Demo components themselves are plain React — no shared state with the rest of the page, no global context. Each demo is independently mountable so it can be tested in isolation.

A demo component must:
- Work on desktop, touch, and keyboard (the course teaches DnD that works everywhere — examples must reflect that)
- Respect `prefers-reduced-motion`
- Reset cleanly when the page unmounts

## 9. Visual design

- **Theme:** light editorial. Background `#fbf9f6` (warm cream), text near-black, sidebar slightly darker cream, code blocks dark on dark.
- **Type:** serif headings (Fraunces or Georgia), Inter for body, JetBrains Mono for code.
- **Hierarchy:** large serif h1, medium h2 with subtle bottom rule, smaller h3 unruled. Generous line-height (1.6) for body prose.
- **Color accent:** none in v1 — monochrome with code blocks providing the only chromatic contrast. Can be added later.
- **Components:** rounded-md borders, subtle shadows, no gradients in chrome.

## 10. Mobile and responsive behavior

- Breakpoint: `768px`. Below that:
  - Sidebar collapses into a top "Lessons" button that opens a slide-down drawer. Drawer closes when a lesson is selected. Drawer traps focus while open, closes on Escape, has `aria-expanded` on the toggle.
  - Homepage course grid → single column.
  - Course detail hero stacks vertically.
- All drag demos must remain functional on touch.
- Final-project guideline includes screenshots/GIFs of both desktop and mobile views of the finished project.

## 11. Accessibility

- Skip-to-content link at top of every page.
- Sidebar wrapped in `<nav aria-label="Course lessons">`; current lesson marked `aria-current="page"`.
- Mobile drawer: focus trap when open, Escape closes, `aria-expanded` reflects state.
- Code blocks have a real `<button aria-label="Copy code">`; copy success announces via an `aria-live="polite"` region.
- Demos must include keyboard support, ARIA live announcements where appropriate, and visible focus rings.
- Heading outline is strict: one `h1` per page (the lesson title), `h2` for section headings, `h3` only nested under an `h2`. No skipped levels.
- Color contrast meets WCAG AA against the cream background.
- `prefers-reduced-motion` is respected for any drag animations and for the mobile drawer transition.

## 12. SEO and metadata

- Per-page `<title>` and `<meta name="description">` via Next.js `generateMetadata`.
- Open Graph + Twitter card meta on every page.
- Static OG image placeholders for v1; per-lesson generated OG images deferred to v2.
- `sitemap.xml` and `robots.txt` generated via App Router conventions (`app/sitemap.ts`, `app/robots.ts`).
- JSON-LD `Course` schema on the course-detail page; `LearningResource` on lesson pages.

## 13. Course content scope (drag-and-drop course)

**Part 1 — Foundations (native, every device) — 9 lessons**
1. Intro & DnD landscape
2. HTML5 DnD: events & lifecycle
3. HTML5 DnD: dataTransfer, dropEffect, drag image
4. Hands-on: vanilla HTML5 drag-into-bin demo
5. Limitations of HTML5 DnD (mobile, accessibility, custom UI)
6. Pointer Events API
7. Cross-device drag from scratch — part 1 (one element)
8. Cross-device drag from scratch — part 2 (drop zones, hit-testing, edge auto-scroll)
9. Accessibility from scratch (keyboard nav, ARIA live announcements)

**Part 2 — `@dnd-kit` (the modern React way) — 9 lessons**
10. Library landscape — `@dnd-kit` vs. `react-dnd` vs. deprecated `react-beautiful-dnd` vs. `react-grid-layout`
11. `@dnd-kit/core` first drag — `DndContext`, `useDraggable`, `useDroppable`
12. Sensors & activation constraints (pointer/touch/keyboard, distance/delay)
13. Modifiers — `restrictToWindowEdges`, axis locks, snap-to-grid
14. Sortable lists — `@dnd-kit/sortable`, `SortableContext`, `arrayMove`
15. Multi-container DnD (kanban pattern), `onDragOver` vs `onDragEnd`
16. `DragOverlay` and drop animations
17. Custom collision detection (`closestCenter`, `closestCorners`, `pointerWithin`, custom)
18. Accessibility in `@dnd-kit` — keyboard nav, custom screen-reader announcements

**Final project: Restaurant Table Booking Manager** (separate page, no lesson number).

## 14. Definition of done for v1

1. Site deployed to Vercel; reachable on `vercel.app` (custom domain optional).
2. Drag-and-drop course fully authored: 18 lessons + final project page, all rendering, all embedded demos working on desktop + touch + keyboard.
3. Lighthouse on a representative lesson page: Performance ≥ 95, Accessibility ≥ 95.
4. Mobile drawer + responsive layouts verified on a real phone.
5. README documents how to author a new course (drop in a `course.ts` file, add lesson MDX files, add demo components).
6. `sitemap.xml` and `robots.txt` resolve in production.

## 15. Future / explicitly deferred

- Per-lesson generated OG images
- Theme toggle (dark mode)
- Progress tracking via localStorage ("you've read 6 of 18 lessons")
- Search across all courses (when there are multiple)
- Comments / Q&A
- Newsletter signup
- Analytics provider integration
- A second course (the user will propose the next one once this one ships)
