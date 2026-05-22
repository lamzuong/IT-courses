import type { Course } from '@/content/courses/types';

export const course: Course = {
  slug: 'ai-concierge',
  title: 'AI Concierge for E-commerce',
  summary: 'Build a customer-facing concierge that answers FAQs, looks up live orders, recommends products, and safely creates orders — bilingual VI/EN, deployable to a single VPS in four weeks.',
  longDescription:
    'A focused course on shipping a customer-facing AI concierge into a real e-commerce site. Walks you from a fresh Next.js + Postgres + Redis stack to a production concierge that handles FAQ retrieval, live order lookups, hybrid product recommendations, and gated write actions (orders, bookings, emails). Bilingual Vietnamese/English throughout. Pairs with the AI in Your Project course for the LLM foundations — this course is the e-commerce-specific build on top.',
  whatYoullLearn: [
    'When to use RAG vs tool calling for each kind of customer question, and the hybrid pattern that uses both',
    'How to set up Postgres + pgvector as the single source of truth — no separate vector database',
    'How to integrate with an existing backend\'s JWT auth so the concierge respects user identity safely',
    'How to build a product recommendation engine on top of the embeddings and orders you already have',
    'How to ship to a single VPS with a soft-launch ramp, kill switches, and a monitoring loop you actually check',
  ],
  whatYoullBuild:
    'A production-ready bilingual concierge for a real shop — answers policy questions from your FAQ markdown, looks up orders and stock through tools, recommends products with reasons, drafts orders/bookings/emails behind a confirmation gate, and runs on one VPS with daily cost caps and audit logs.',
  parts: [
    {
      title: 'Orientation',
      lessons: [
        { slug: '00-overview-and-prereqs',  title: 'Overview and prerequisites',                 summary: 'What this course assumes you know, and what the AI in Your Project course covers that this one builds on.' },
        { slug: '01-concierge-architecture', title: 'The concierge architecture',                summary: 'Reading-side and writing-side, RAG and tools, gateway and audit log — what fits where, in one diagram.' },
      ],
    },
    {
      title: 'Build',
      lessons: [
        { slug: '02-week-one-quickstart',            title: 'Week one quickstart — chat + RAG',         summary: 'Docker Postgres, ingestion script, chat route, first answered FAQ. End-to-end in a single sitting.' },
        { slug: '03-from-foundations-to-concierge',  title: 'From foundations to concierge',            summary: 'A reading guide through Part 6 of AI in Your Project — what to study in what order for the next three weeks.' },
      ],
    },
    {
      title: 'Ship',
      lessons: [
        { slug: '04-going-live-checklist',   title: 'Going-live checklist',                       summary: 'Soft-launch ramp, monitoring loop, runbook items. The final inventory before turning the rollout knob to 100%.' },
      ],
    },
  ],
  project: { slug: 'project', title: 'Your shop\'s concierge' },
};
