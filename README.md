# IT Courses

A personal-portfolio site that publishes hands-on technology courses.

## Available courses

- **AI in Your Project** (24 lessons, 17 demos, 1 final project) — How to wire LangChain + LangGraph + Ollama into a real app, with confirmation per write action.
- **Drag and Drop in React** (18 lessons, 13 demos, 1 final project) — From native HTML5 DnD to @dnd-kit, ending in a Restaurant Table Booking Manager.

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

The AI course's demos live in `components/demos/ai-in-your-project/` and import shared mock data (customers, products, orders, promotions, email drafts) from `lib/ai-mock-cms.ts` so every demo speaks the same domain.

## Authoring a lesson

A lesson MDX file looks like:

````mdx
import { Callout } from '@/components/mdx/callout';
import { Recap } from '@/components/mdx/recap';

Lesson body — short prose paragraphs.

## A section heading

More prose, with `inline code`.

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
````

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
