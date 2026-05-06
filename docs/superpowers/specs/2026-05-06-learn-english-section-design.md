# Learn English Section — Design

**Date:** 2026-05-06
**Status:** Approved (brainstorming complete)

## Problem

The site currently hosts four IT courses under `/courses/...`. The author wants to add a parallel **Learn English** section for Vietnamese learners at **CEFR B1 and above**, focused on common sentence patterns used in everyday life and at work. Each topic should be substantial — not a phrasebook — and structured around real situations rather than grammar drills.

## Goals

- A new `/english` section with its own browse/listing surface, distinct from `/courses`.
- 15 topics covering daily life and work English.
- Each topic is course-shaped: 5–6 scene-driven lessons authored as MDX.
- Bilingual content: surrounding prose in Vietnamese, English material with Vietnamese glosses inline.
- Reuse the existing MDX pipeline, layout primitives, and read-time helper.
- v0.1 ships with infrastructure + one fully-realized pilot topic. Remaining 14 fill in over time.

## Non-goals (v1)

- Audio recordings.
- Interactive practice / graded exercises (the "Try it yourself" section in lessons is *prompts*, not autograded).
- Per-learner progress tracking.
- A homepage shelf or homepage card. The section is reachable from the top nav only.
- Mixing English material into the IT-courses navigation.

## Approach

### Routing

Three new route levels:

- **`/english`** — section landing. A grid of 15 topic cards; brief Vietnamese intro at the top stating the level (B1+) and the topic-by-scene structure. No homepage shelf; reachable from a top-nav link only.
- **`/english/<topic-slug>`** — topic landing. Vietnamese description, list of 5–6 lessons with scene tags, total reading time, "Bắt đầu" CTA on lesson 1.
- **`/english/<topic-slug>/lessons/<lesson-slug>`** — lesson page. Same MDX renderer the IT courses use, plus prev/next navigation within the topic and a "Back to topic" breadcrumb.

### Top nav

A single `English` link added to the global header next to `Courses`. The link points at `/english`. Active state matches the existing nav styling. No homepage card; the nav addition is the only homepage-visible change.

### File layout

Mirrors `content/courses/` exactly, in a parallel tree so neither side has to know the other exists:

```
content/english/
  index.ts                        # registers all topics
  types.ts                        # EnglishTopic / EnglishLesson types
  greetings-introductions/
    topic.ts                      # metadata + lesson list
    lessons/
      01-meeting-someone-new.mdx
      02-introducing-others.mdx
      03-…
      04-…
      05-cultural-notes-idioms.mdx
  small-talk/
    topic.ts
    lessons/…
  …
```

### Type system & registry

A parallel registry (`getAllEnglishTopics`, `flattenEnglishLessons`) with its own type (`EnglishTopic`) shaped *similarly* to `Course` so existing helpers like `getCourseStats` can be lifted for read-time. The decision is **parallel-not-shared** types because English topics will grow fields the IT courses don't need (CEFR level, scene tags, register tags, future audio refs), and we don't want those bleeding into `Course`. The shape is *similar* so `flattenLessons`-style helpers work without rewriting.

**Reused unchanged:** the MDX pipeline, `Callout`, `Recap`, the prose layout/typography, the read-time helper.

**Tradeoff accepted:** ~50 lines of duplicated glue (a second `index.ts`, second loader). The alternative (forcing English into the `Course` type) couples two content domains that should evolve independently.

### Per-lesson MDX template

Every lesson is built around **one scene**. Eight internal sections, sized to that scene (not padded). Section headers are in Vietnamese; English material sits inside.

```
1. Bối cảnh (Scene)             — 2-4 sentences in VN: who, where, what's happening
2. Từ vựng (Vocabulary)         — ~8-12 words/collocations, EN with VN gloss
3. Mẫu câu (Sentence patterns)  — 5-8 patterns, each: EN + VN gloss + 2-3 variations
4. Hội thoại mẫu (Dialogue)     — short realistic exchange, EN with VN under each line
5. Lỗi thường gặp (Common mistake) — 1-2 VN-speaker pitfalls, "wrong → right"
6. Văn hoá & sắc thái (Cultural / register note) — when this fits, when it doesn't
7. Idiom & cụm từ tự nhiên (Idioms & collocations) — 3-5 native-sounding phrases
8. Tự luyện (Try it yourself)   — 3 prompts: speak it, write it, swap it
```

Target **~1,500–2,000 words per lesson**. Section 1 (scene) is the linchpin — every pattern below is shown landing in *that* scene, not in the abstract.

### New MDX components

Four small components in `components/mdx/english/`:

- **`<Pattern>`** — a single sentence pattern. Props: `en`, `vi` (gloss), `variations: string[]`, optional `note`. Renders a card with the pattern, gloss, and 2–3 example variations. The workhorse.
- **`<Dialogue>`** — a multi-line scene. Props: `lines: { speaker, en, vi }[]`. Renders speaker labels, English line, Vietnamese translation muted underneath.
- **`<Vocab>`** — a compact word list. Props: `items: { en, ipa?, vi, example? }[]`. Renders a definition-list-style table.
- **`<Mistake>`** — wrong-vs-right pair. Props: `wrong`, `right`, `why` (VN explanation). Side-by-side cards with a strikethrough on `wrong`.

The two existing components — `<Callout>` and `<Recap>` — stay as-is and get used in roughly the same places they do in IT lessons.

**Why component-shaped, not just markdown.** The bilingual rendering (English with VN underneath, glosses tied to specific patterns) is fiddly enough that hand-rolled markdown would drift. Components keep the *shape* of every pattern and dialogue identical across ~89 lessons, which is what makes a learner stop having to re-orient on each page.

### `/english` landing page

```
┌──────────────────────────────────────────────────────────┐
│  Tiếng Anh giao tiếp — B1+                               │
│  Mỗi chủ đề là một loạt bài theo tình huống thực tế.     │
│  15 chủ đề · ~89 bài học · …                              │
└──────────────────────────────────────────────────────────┘

  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ Topic 01 │  │ Topic 02 │  │ Topic 03 │     ← daily-life palette
  └──────────┘  └──────────┘  └──────────┘
   …rows…
  ┌──────────┐  ┌──────────┐  ┌──────────┐
  │ Topic 12 │  │ Topic 13 │  │ Topic 14 │     ← work palette
  └──────────┘  └──────────┘
```

A 3-column grid at `lg`, 2 at `md`, 1 at `sm`. A 2–3 sentence Vietnamese intro above the grid stating the level (B1+) and the topic-by-scene structure. Aggregate stats (topics, lessons, total reading time) under that.

### Topic card variants

Same structural shape as the IT course card (`course-card-fill` + footer) but a separate variant family so the section reads as visually different from the IT shelf:

- **Daily-life palette** (topics 1–11): one calmer wash — soft cyan/teal range.
- **Work palette** (topics 12–15): a slightly warmer, more focused tone — muted indigo/slate.

Two variants, not 15. Cards stay scannable; the palette split also tells a learner at-a-glance which topics are daily-life vs work without reading.

Each card shows: topic title in Vietnamese, one-line VN summary, lesson count, total read-time, "Bắt đầu" CTA.

### Topic page (`/english/<topic-slug>`)

Mirrors the existing course landing page (`/courses/<slug>`):

- **Header:** topic title (VN), 2–3 sentence VN description, level badge ("B1+"), reading-time and lesson-count stats.
- **Lesson list:** numbered list of 5–6 lessons. Each row shows lesson number, lesson title (VN), scene tag (e.g., "Đặt món · Nhà hàng"), and read time. Click → lesson page.
- **Footer CTA:** "Bắt đầu bài 1".

### Lesson page (`/english/<topic-slug>/lessons/<lesson-slug>`)

Reuses the existing course-lesson layout:

- Sticky breadcrumb at top: `English / <topic title> / Lesson <n>`.
- MDX body (the 8-section template).
- Footer with **Prev** / **Next** within the topic (no cross-topic next).
- "Back to topic" link in the breadcrumb.

## Topic & lesson plan

15 topics, ~89 lessons. Final lesson of every topic is the cultural-notes/idioms capstone — that placement keeps idioms feeling like a *capstone* on patterns the learner has just seen used, not a standalone phrasebook.

### Daily-life palette (topics 1–11)

**1. Chào hỏi & giới thiệu** *(Greetings & introductions)* — 5 lessons
1. Meeting someone new — formal vs casual openers
2. Introducing yourself in different contexts (work, party, online)
3. Introducing others
4. Saying goodbye gracefully
5. Văn hoá & idioms — handshakes, "How are you?" isn't literal, "nice to e-meet you"

**2. Trò chuyện xã giao** *(Small talk)* — 6 lessons
1. Starting a conversation (weather, surroundings)
2. Asking about someone's day/weekend
3. Hobbies & interests
4. Keeping it going — follow-up questions
5. Exiting gracefully
6. Văn hoá & idioms

**3. Nhà hàng & quán cà phê** *(Restaurant & café)* — 6 lessons — **PILOT**
1. Getting seated & first orders
2. Menu questions & dietary needs
3. Ordering & customizing
4. During the meal — small talk, issues, requests
5. Paying, tipping, leaving
6. Văn hoá & idioms

**4. Mua sắm & tiền bạc** *(Shopping & money)* — 6 lessons
1. Browsing & asking for help
2. Trying on & asking about products
3. Discounts & price questions
4. Paying & receipts
5. Returns, exchanges, complaints
6. Văn hoá & idioms — haggle culture, tax

**5. Hỏi đường & di chuyển** *(Directions & getting around)* — 6 lessons
1. Asking for directions on the street
2. Understanding directions (left/right, blocks, landmarks)
3. Public transport — bus, metro, train
4. Taxis & rideshares
5. Lost / clarifying
6. Văn hoá & idioms

**6. Gọi điện & gọi video** *(Phone & video calls)* — 6 lessons
1. Starting calls — formal vs casual
2. Asking for someone, leaving messages
3. Bad connection, can't hear
4. Video call etiquette (mute, speaking up)
5. Ending calls
6. Văn hoá & idioms

**7. Du lịch & sân bay** *(Travel & airport)* — 6 lessons
1. Check-in & baggage
2. Security & boarding
3. On the plane
4. Immigration & customs
5. Lost luggage, delays
6. Văn hoá & idioms

**8. Khách sạn & nơi ở** *(Hotel)* — 6 lessons
1. Booking & check-in
2. Asking about facilities
3. Issues with the room
4. Room service
5. Check-out
6. Văn hoá & idioms

**9. Khám bệnh & sức khoẻ** *(Doctor & health)* — 6 lessons
1. Booking an appointment
2. Describing symptoms
3. Understanding diagnosis & treatment
4. At the pharmacy
5. Emergencies
6. Văn hoá & idioms

**10. Hẹn hò & lời mời** *(Plans & invitations)* — 6 lessons
1. Suggesting plans
2. Inviting someone
3. Accepting & declining politely
4. Rescheduling & cancelling
5. Confirming
6. Văn hoá & idioms

**11. Xin lỗi & phàn nàn** *(Apologies & complaints)* — 6 lessons
1. Light apologies — bumping into someone, being late
2. Real apologies — mistakes, hurt feelings
3. Making a complaint politely
4. Escalating
5. Resolving conflict
6. Văn hoá & idioms — *sorry* vs admitting fault

### Work palette (topics 12–15)

**12. Trò chuyện ở văn phòng** *(Office small talk)* — 6 lessons
1. Morning greetings & catching up
2. Talking about the weekend
3. Lunch invitations
4. Office chat without crossing lines
5. End-of-day goodbyes
6. Văn hoá & idioms

**13. Họp** *(Meetings)* — 6 lessons
1. Starting & welcoming
2. Giving updates / presenting an idea
3. Agreeing & disagreeing politely
4. Interrupting & holding the floor
5. Wrapping up & action items
6. Văn hoá & idioms

**14. Phỏng vấn xin việc** *(Job interview)* — 6 lessons
1. Self-introduction — the elevator pitch
2. Experience & strengths
3. Weaknesses & failures
4. Your questions for the interviewer
5. Salary & next steps
6. Văn hoá & idioms

**15. Thuyết trình** *(Presentations)* — 6 lessons
1. Opening — hook, agenda, expectations
2. Signposting & transitions
3. Explaining data & visuals
4. Handling Q&A (including hostile/unclear questions)
5. Closing & call-to-action
6. Văn hoá & idioms — pause, eye contact, "let me circle back"

**Total:** 15 topics, 89 lessons (1 topic at 5 lessons, 14 topics at 6 lessons).

## Authoring example (excerpt)

What one section of one lesson looks like in MDX:

```mdx
## 03 — Mẫu câu

<Pattern
  en="Could I get the check, please?"
  vi="Cho tôi xin hoá đơn được không?"
  variations={[
    "Could we have the bill, please?",
    "Can I settle up?",
    "Are we ready to pay?",
  ]}
  note="`check` (US) ↔ `bill` (UK). Cả hai đều lịch sự."
/>
```

## Build phases

**Phase 0 — Infrastructure (no content yet).**
1. `content/english/types.ts` — `EnglishTopic`, `EnglishLesson` types.
2. `content/english/index.ts` — registry, helpers (`getAllEnglishTopics`, `flattenEnglishLessons`).
3. `components/mdx/english/` — `Pattern`, `Dialogue`, `Vocab`, `Mistake` components.
4. Routes — `app/english/page.tsx`, `app/english/[topic]/page.tsx`, `app/english/[topic]/lessons/[lesson]/page.tsx`.
5. Top-nav link.
6. CSS — daily-life and work card variants.

**Phase 1 — Pilot topic (Topic 3 — Nhà hàng & quán cà phê).** Concrete, scene-rich, B1-friendly. Write all 6 lessons end-to-end before touching another topic. The pilot is the *template* — every later topic copies its rhythm, section pacing, and the visual feel of the dialogues and pattern cards.

**Phase 2 — Daily-life topics (1, 2, 4–11).** Ten topics × ~6 lessons. Write topic-by-topic; don't half-finish three at once. Estimated 1–2 hours per lesson at B1+ depth, so each topic is roughly a weekend.

**Phase 3 — Work topics (12–15).** Four topics × ~6 lessons. Same cadence.

**Build verification at every phase.** `npx next build` should produce one page per route at every step. Pre-rendering the lesson pages catches bad MDX (unescaped `{ }`, undefined component props) before deploy.

**v0.1 ships with Phase 0 + Phase 1.** A working `/english` section with one fully-realized pilot topic and 14 placeholder topic cards (the placeholder cards are visible but unclickable — same pattern as disabled course cards on the homepage). v0.1 is the proof the shape works; the remaining 14 topics fill in over time.

## Risks & open questions

- **Authoring scope.** ~89 lessons × ~1,500–2,000 words = a real writing investment. The build phases mitigate by pacing topic-by-topic and shipping value at v0.1.
- **Visual differentiation.** Two-variant palette is the minimum; if the daily-life shelf feels monotonous after seeing 11 cards in the same wash, we can split it into 2 sub-variants in a follow-up. Not blocking v0.1.
- **Vietnamese authoring quality.** The MDX components only render what authors put in. Establishing the pilot topic's tone is the long-term consistency anchor.
