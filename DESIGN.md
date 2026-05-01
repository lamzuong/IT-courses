# DESIGN.md

The aesthetic, type system, and component conventions for the IT-courses platform. This document is the source of truth for design decisions — when you're adding a page, lesson, or component, follow it. When you're tempted to deviate, write down why and update this file.

---

## 1. Aesthetic direction

**Botanical Library — editorial reading on sage-tinted paper.** The reading surface should feel like a printed long-form essay in a botanist's notebook — sage-undertoned parchment, deep forest ink, vivid persimmon for accents that need to grab the eye, evergreen and ocean-teal for quiet structural roles. Serif headings, generous space, color used sparingly but with confidence. The visual hierarchy is built from typography first, color second.

What it is **not**:
- Not a SaaS dashboard. No card-everything. No avatars in headers. No shadow-heavy chrome.
- Not a startup landing page. No big gradients, no purple-on-white, no oversized hero illustrations.
- Not a generic doc site. No flat-blue theme, no "Inter on white."
- Not maximalist. Restraint is the point.

The single sentence: **a small, well-set book of essays you can read and try.**

---

## 2. Color tokens

Defined in `app/globals.css` under `@theme`. Use the tokens, never hex.

| Token | Value | Use |
|---|---|---|
| `--color-bg` | `#f1ede0` | Page background. Sage-tinted parchment. |
| `--color-bg-soft` | `#e7e2d2` | Inline code background, muted panels, plate captions |
| `--color-bg-deep` | `#d8d2bf` | Selection background, deep fills |
| `--color-text` | `#1a2722` | Body text — deep forest, not pure black |
| `--color-text-soft` | `#4d5a52` | Secondary text, summaries, captions |
| `--color-text-faint` | `#7a8278` | Tertiary — eyebrows, meta, list markers |
| `--color-border` | `#d4ccb5` | Card and panel edges |
| `--color-rule` | `#b8b09a` | Horizontal rules, dashed dividers |
| `--color-ink` | `#0f1815` | Display headings, deepest forest |
| `--color-accent` | `#c75d28` | **Persimmon orange.** Vivid by design — used for warning callouts, drag-active borders, the homepage CTA, course-card "Best fit" badges, and the hover-state on prev/next CTAs. Demands attention. |
| `--color-link` | `#a64a1f` | Deeper persimmon for inline links — passes WCAG AA against `--color-bg`. |
| `--color-pine` | `#3a6b48` | Deep evergreen — secondary accent for tip callouts, code-block syntax highlights, sage-card progress bar. |
| `--color-teal` | `#2f5d63` | Ocean teal — note callouts and the eucalyptus-card variant. |
| `--color-accent-soft` | `#f0c4a4` | Pale persimmon for soft fills — used in SVG illustrations and gradient stops. |
| `--color-code-bg` | `#fcf6e6` | Pale buttercream — distinctly warmer than the page bg, so code reads as a different paper stock. |
| `--color-code-text` | `#1a2722` | Vitesse-light foreground (mapped via `colorReplacements` in `next.config.mjs`). |
| `--color-code-soft` | `#7a8278` | Code comments, soft ink. |
| `--color-code-border` | `#e3dac0` | Code block edge. |

**Accent rule of thumb**: at most one accent element per visual field. If a Callout, a link, and a Demo "Live" pulse are all visible at once, that's already a lot — don't add more.

**No black backgrounds anywhere.** The dark code theme was retired specifically because it broke the page rhythm.

---

## 3. Typography

Three font families, loaded via `next/font/google`:

| Variable | Family | Use |
|---|---|---|
| `--font-serif` | **Fraunces** | Display headings, lesson titles, drop caps, recap items, callout decks. Activates ss01/ss02 stylistic sets. |
| `--font-sans` | **Inter** | Body text, navigation, eyebrows, metadata, buttons |
| `--font-mono` | **JetBrains Mono** | Code (block + inline), numerals in counters, technical identifiers in prose |

### Type scale (lessons)

| Element | Size | Family | Weight | Line height | Tracking |
|---|---|---|---|---|---|
| Lesson eyebrow | 0.7rem | Inter | 600 | 1 | 0.18em |
| Lesson title | clamp(2.25rem, 4vw + 1rem, 3.5rem) | Fraunces | 700 | 1.05 | -0.025em |
| Lesson deck (subtitle) | 1.2rem | Fraunces italic | 400 | 1.5 | 0 |
| Lesson meta | 0.78rem | Inter | 400 | 1 | 0 |
| H2 (§) | 1.625rem | Fraunces | 600 | 1.2 | -0.015em |
| H2 numbering label | 0.65rem | Inter | 600 | 1 | 0.18em |
| H3 | 1.18rem | Fraunces | 600 | 1.3 | 0 |
| Body | 1.0625rem | Inter | 400 | 1.72 | 0 |
| Inline code | 0.88em | JetBrains Mono | 400 | inherit | 0 |
| Code block | 0.88rem | JetBrains Mono | 400 | 1.7 | 0 |

### Editorial flourishes

- **Drop cap**: first paragraph of every lesson. `::first-letter` of `.prose-lesson > p:first-of-type`. Fraunces 4.2em, weight 700, floats left, hangs into margin.
- **Section numbering**: H2 elements get an automatic counter like `§ 01`, `§ 02` via CSS `counter-increment`. Don't number manually in MDX.
- **Hover anchor**: H2/H3 wrapped by rehype-autolink-headings. On hover, append `¶` glyph in faint ink — gives a quiet permalink affordance.
- **Selection**: warm-deep cream `--color-bg-deep` with ink text. Avoids the default OS blue.
- **Code ligatures**: **off**. `font-feature-settings: 'liga' 0, 'calt' 0`. `==`, `=>`, `!=` should render as discrete characters; ligatures hurt scan speed in code.

---

## 4. Layout

### Containers

| Token | Value | Use |
|---|---|---|
| `max-w-6xl` | 72rem | Site-wide outer max for course pages, headers |
| `--container-prose` | 720px | Reading column. **Lessons must use this.** |

### Lesson page anatomy

```
┌──────────── reading-progress hairline (fixed top, 2px) ─────────┐
│ Sidebar  │  Breadcrumb                                          │
│          │                                                       │
│ (sticky) │  Lesson eyebrow (Lesson 02 / 18)                     │
│          │  Lesson title (Fraunces display)                     │
│          │  Lesson deck (italic serif)                          │
│          │  Meta line: Part · X min read · Y words              │
│          │  ───────────                                          │
│          │  prose-lesson { drop cap, §-numbered H2s, body }     │
│          │  ┌─ Demo plate ─┐                                    │
│          │  │              │                                    │
│          │  └──────────────┘                                    │
│          │  more prose                                           │
│          │  Coda (recap)                                        │
│          │  Prev/Next preview cards                             │
└──────────┴───────────────────────────────────────────────────────┘
```

### Spacing rhythm

- Section spacing inside prose: H2 `margin-top: 3.5rem`, H3 `2rem`. **Generous breathing room** is part of the aesthetic.
- Demo plates and Recap have ~2.5–4rem of vertical air around them.
- Don't compress vertical spacing for "more above the fold." This site is for reading, not skimming.

---

## 5. Component patterns

### Callout — marginalia

Used for asides, gotchas, and warnings. Three flavors:

| `type` | Border color | Title | When to use |
|---|---|---|---|
| `note` (default) | Steel blue | "Note" | Neutral information |
| `warning` | Amber-rust | "Heads up" | Mistakes that bite, gotchas |
| `tip` | Pine green | "Aside" | Optional context, design tradeoffs |

**Style**: thin colored left border, no background fill, small geometric square next to the title. **No icons.** Title in tracked all-caps Inter. Body inherits prose styling.

```mdx
<Callout type="warning" title="Optional title override">
  Body…
</Callout>
```

Don't stack callouts. One per concept. If you have three, you have a list — write it as prose.

### Demo plate

Wraps an interactive figure with editorial chrome.

- **Caption bar**: pulsing red "Live" tag · italic figure number ("Figure 03 — *Title*") · Reset button
- **Frame**: cream gradient, hairline border, soft drop shadow at the bottom
- **Body**: 1.5rem padding

Reset auto-remounts the inner component via `key` prop, so demo state is wiped without unmounting parent.

```mdx
<Demo title="Sortable list">
  <SortableListDemo />
</Demo>
```

**Demos must be `'use client'`** components in `components/demos/<course-slug>/`. They're intentionally small (~80–120 lines). One demo per lesson is the norm; two if there's a clear conceptual reason.

### Coda — the recap

Replaces a generic "Recap" block. Centered ◆ ornament, "In closing" eyebrow, Fraunces title, dashed-divider rows with accent bullet `·`. Each lesson ends with one.

```mdx
<Recap>
- Point one.
- Point two.
- Point three.
</Recap>
```

3–6 bullets. Full sentences, takeaway-shaped, not "what we covered."

### Code block

Light theme — `vitesse-light` from Shiki, with the white background remapped via `colorReplacements` to `#f8f1df` (warm paper). Border in soft cream. Inset white highlight at top, like ink absorbed into paper.

The `<CodeBlock>` MDX wrapper adds:
- Tab-focusable `<pre>` with `role="region"` and `aria-label="Code sample"` (axe `scrollable-region-focusable`)
- Hover-revealed Copy button with backdrop blur
- ARIA live announcement on copy

Don't introduce a second code theme or a "dark mode toggle" — the project is light-only by design.

### Prev/Next preview cards

Larger than typical doc-site arrows. Direction label (tracked all-caps), serif title, summary line. Hover lifts with a soft shadow. Single column on mobile.

### Reading progress

A 2px hairline fixed at the top of the viewport, gradient from accent to ink. Updates via `requestAnimationFrame` from a scroll listener. `position: fixed`, z-index 50, `pointer-events: none`. Only on lesson pages.

---

## 6. Motion

Sparingly applied. The default is **no animation** unless it serves comprehension or feedback.

| Where | What | Duration |
|---|---|---|
| Hover on links | Underline color fade | 120ms |
| Hover on prev/next card | Lift + soft shadow | 140ms ease |
| Drag-active state on demos | Border color swap to accent | 120ms |
| Demo "Live" tag | Pulse opacity 1 → 0.4 → 1 | 2.4s ease-in-out infinite |
| Reset button hover | Border darken | 120ms ease |

**Hard rule**: the entire site honors `prefers-reduced-motion`. The base CSS clamps animation/transition to `0.01ms` when set.

No parallax. No scroll-triggered reveals. No mouse-position effects. Drop-cap doesn't animate in. The Demo's pulse dot is the only ambient animation.

---

## 7. Accessibility

Non-negotiable commitments:

1. **WCAG 2.1 AA** on all pages. Verified via `@axe-core/playwright` in `tests/e2e/a11y.spec.ts` across desktop + mobile-chrome.
2. **Keyboard-first**. Every interactive element is reachable by Tab. Focus rings are styled, never suppressed (`focus-visible: outline 2px solid var(--color-link)` with offset).
3. **Skip link** is the first focusable element on every page. Lives inside `SiteNav`'s `<header>` so we have one banner landmark.
4. **Single landmark of each type per page** — one `<header>`, one `<main>`, one `<footer>`.
5. **Code blocks are focusable** (`tabIndex={0}` + `role="region"` + `aria-label="Code sample"`) so keyboard users can scroll horizontally inside long lines.
6. **Drag interactions ship with keyboard alternatives.** This is enforced in lesson curriculum (lesson 9, 18) and demonstrated in every demo: `KeyboardSensor` is always paired with `PointerSensor`.
7. **Live region announcements** for any state change a screen reader needs to know about — mobile drawer open/close, drag pick-up/drop, code-copied confirmation.
8. **No motion required for understanding.** The pulse dot, the lift hover, etc. are decorative; the same information is available without them.

---

## 8. Conventions for new content

When you add a lesson, follow this checklist:

- [ ] Add slug + title + summary to `content/courses/<course>/course.ts` in the right `parts` block. Don't reorder existing slugs.
- [ ] Create `content/courses/<course>/lessons/<NN>-slug.mdx`.
- [ ] Imports at top: `Callout`, `Recap`, and any demo components.
- [ ] First paragraph: write so the drop cap looks good. Avoid starting with a digit, a quote, or a single short word.
- [ ] Use `##` for sections — they auto-number via `§ 01`. Don't number manually.
- [ ] Code blocks: pick the most boring TypeScript dialect that explains the point. Don't sprawl.
- [ ] Callouts: at most 2 per lesson. Each must point to a real trap or tradeoff, not a restatement.
- [ ] Demo: one per lesson when the concept is *interactive* (event order, drag mechanics, dnd-kit hooks). Skip for purely conceptual lessons (library landscapes, "step back" essays).
- [ ] Recap: 3–6 sentences. Cover what changed in the reader's mental model, not what topics were "covered."

When you add a new course, copy `content/courses/drag-drop-react/` as the template, change `slug` in `course.ts`, and add the new course to `content/courses/index.ts`.

---

## 9. Things to avoid

A short don't-list, in priority order. These are mistakes the project has consciously rejected.

- ❌ **Card-on-card-on-card.** If you can communicate the hierarchy with whitespace and a horizontal rule, do that.
- ❌ **Generic AI-design tells**: purple-blue gradients, Inter-everywhere, oversized rounded buttons, every-element-shadowed.
- ❌ **Dark mode**. Light-only. The cream is the brand.
- ❌ **Decorative icons**. Lucide / heroicons / emoji in headings → no. We use type, ornaments (◆, §, ¶), and pulses.
- ❌ **Hero illustrations**. The lesson title is the hero.
- ❌ **Toast notifications**. Use ARIA live regions.
- ❌ **Modal-everything**. The project has zero modals as of this writing. Mobile drawer is the only overlay UI.
- ❌ **Animated entrances**. Content appears at full opacity. The reader is here to read, not watch.
- ❌ **Tracking-pixel-style "engagement" UI**. No notification dots, no fake counters, no "You're 30% through!" gamification beyond the calm reading-progress hairline.
- ❌ **Markdown blockquote `>` as a fake callout.** Use the `<Callout>` component.

---

## 10. Where things live

```
app/
  globals.css                  # design tokens, prose styles, components base CSS
  layout.tsx                   # SiteNav (with SkipLink) + children + SiteFooter
  page.tsx                     # homepage
  courses/[course]/
    page.tsx                   # course detail
    lessons/[lesson]/page.tsx  # lesson reader (hero + MDX + prev/next)
    project/page.tsx           # final project page
components/
  site/                        # SiteNav, SiteFooter, SkipLink, Breadcrumb, LessonSidebar,
                               # PrevNext, ReadingProgress
  mdx/                         # CodeBlock, Callout, Demo, Recap (used inside .mdx)
  demos/<course-slug>/         # interactive demo components for that course's lessons
content/
  courses/
    types.ts                   # Course, CoursePart, LessonMeta, ProjectMeta types
    index.ts                   # registry of all courses
    <course-slug>/
      course.ts                # manifest
      lessons/NN-slug.mdx      # lesson content
      project.mdx              # final project guide
lib/
  courses.ts                   # getAllCourses, getCourse, getLesson, flattenLessons
  lesson-stats.ts              # getLessonStats — words + read minutes from MDX source
mdx-components.tsx             # MDX components map (pre → CodeBlock, Callout, Demo, Recap)
next.config.mjs                # MDX wrapper, Shiki vitesse-light theme + colorReplacements
```

`mdx-components.tsx` lives at the repo root — that's an App Router convention, not a typo.

---

## Revision log

| Date | Change |
|---|---|
| 2026-04-30 | Initial design: cream + Fraunces + dark code (`github-dark-dimmed`). |
| 2026-05-01 | Editorial deepening: drop cap, §-numbered sections, marginalia callouts, Coda recap, demo plates, reading-progress hairline, prev/next preview cards. |
| 2026-05-01 | Code theme switched to `vitesse-light` on warm paper background. Dark code retired. |
| 2026-05-01 | **Botanical Library palette.** Replaced warm muted cream + rust with sage-tinted parchment + persimmon + evergreen + teal. Callouts now color-coded across three accents (note=teal, warning=persimmon, tip=pine). Course-card variants harmonized to match. |
