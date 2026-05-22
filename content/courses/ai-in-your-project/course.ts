import type { Course } from '@/content/courses/types';

export const course: Course = {
  slug: 'ai-in-your-project',
  title: 'AI in Your Project',
  summary: 'How to wire an LLM agent into your existing app — with confirmation, safety, and the patterns that make it shippable.',
  longDescription:
    'A practical course on adding AI to a real project. Start with what to do before any LLM code — schema review, action inventory — then walk through wiring text, then tools, then stateful workflows with human-in-the-loop confirmation. Built on LangChain + LangGraph + Ollama so you can complete every lesson and the final project for free on your laptop. End with an AI Operator console for a mock CMS — drag every lesson\'s pattern into one shippable build.',
  whatYoullLearn: [
    'How to inventory the AI-callable surface of an existing app before writing any LLM code',
    'How to wire LangChain to a local Ollama model for free, then swap to a hosted provider when you ship',
    'How to design read tools, write tools, and the confirmation gate between them',
    'How LangGraph\'s `interrupt` node turns "AI plans" into "AI plans, user confirms, AI executes"',
    'How to test, observe, and safely deploy an AI integration to production',
  ],
  whatYoullBuild:
    'An AI Operator console — a small admin where users prompt natural-language workflows ("create a 15% promo for customers who haven\'t ordered in 60 days, draft them a re-engagement email") and the system asks for confirmation on each write before executing.',
  parts: [
    {
      title: 'Before you touch AI',
      lessons: [
        { slug: '00-technical-terms',       title: 'Technical terms — a glossary',              summary: 'Skim once, keep open: every LLM, LangChain and LangGraph term used in the course.' },
        { slug: '01-what-this-teaches',     title: 'What this course teaches',                  summary: 'Agents vs chat, tool calling, why human-in-the-loop matters.' },
        { slug: '02-inventory-domain',      title: 'Inventory your domain',                     summary: 'What\'s AI-callable in your app — schema, intents, actions.' },
        { slug: '03-setup-ollama-skeleton', title: 'Setup: Ollama + project skeleton',          summary: 'Install Ollama, pull a model, scaffold the route handler.' },
        { slug: 'recap-part-1',             title: 'Part I recap — Before you touch AI',         summary: 'Mind map of glossary, course shape, domain inventory, and Ollama setup.' },
      ],
    },
    {
      title: 'First conversations',
      lessons: [
        { slug: '04-streaming-text',        title: 'Streaming text from the model',             summary: 'stream API, SSE, minimal React UI.' },
        { slug: '05-system-prompts',        title: 'System prompts: defining the agent',        summary: 'Role, tone, hard limits.' },
        { slug: '06-prompt-engineering',    title: 'Prompt engineering basics',                 summary: 'Few-shot examples, formatting, what works versus folklore.' },
        { slug: '07-feeding-data',          title: 'Feeding the model your data',               summary: 'Schema and samples in context; the token-cost warning.' },
        { slug: 'recap-part-2',             title: 'Part II recap — First conversations',        summary: 'Mind map of streaming, prompts, few-shot, and data feeding.' },
      ],
    },
    {
      title: 'Tools: AI that does things',
      lessons: [
        { slug: '08-structured-output',     title: 'Structured output with Zod',                summary: 'withStructuredOutput, typed JSON, schema strictness — the tool-call prerequisite.' },
        { slug: '09-first-tool',            title: 'Your first tool',                           summary: 'tool() with a Zod schema; inspecting the tool call payload.' },
        { slug: '10-read-tools-at-scale',   title: 'Read tools at scale',                       summary: 'Pagination, filtering, aggregations.' },
        { slug: '11-tool-design-principles',title: 'Tool design principles',                    summary: 'Narrow, idempotent, well-described.' },
        { slug: '12-write-tools-danger',    title: 'Write tools & the danger zone',             summary: 'Why writes need a confirmation gate.' },
        { slug: '13-idempotency',           title: 'Idempotency & duplicate-action guards',     summary: 'Request keys, dedup, double-fire defenses.' },
        { slug: '14-errors-retries',        title: 'Errors & retries',                          summary: 'Failed tool calls, validation errors, recovery.' },
        { slug: 'recap-part-3',             title: 'Part III recap — Tools',                     summary: 'Mind map of read scaling, tool design, write danger, idempotency, and recovery.' },
      ],
    },
    {
      title: 'LangGraph & confirmation',
      lessons: [
        { slug: '15-multi-turn-loop-limits',  title: 'Multi-turn conversations & where the loop breaks', summary: 'BaseMessage[], trimming, when bare bindTools stops scaling.' },
        { slug: '16-welcome-langgraph',       title: 'Welcome to LangGraph',                             summary: 'State, nodes, edges; why graphs fit confirmable workflows.' },
        { slug: '17-first-graph',             title: 'Your first graph: agent → tools → agent',          summary: 'Rebuild the tool-calling loop as a ReAct graph.' },
        { slug: '18-state-conditional-routing', title: 'State & conditional routing',                    summary: 'Branch on tool type — read auto-runs, write requires confirmation.' },
        { slug: '19-interrupt-confirmation',  title: 'interrupt: pausing for confirmation',              summary: 'LangGraph\'s killer feature; pause, get approval, resume.' },
        { slug: '20-lapsed-customer-workflow',title: 'The lapsed-customer workflow end to end',          summary: 'Full walkthrough; every prior lesson\'s piece slots in.' },
        { slug: 'recap-part-4',               title: 'Part IV recap — LangGraph & confirmation',         summary: 'Mind map of state, nodes, edges, conditional routing, and interrupt().' },
      ],
    },
    {
      title: 'Production-grade AI',
      lessons: [
        { slug: '21-safety-injection',      title: 'Safety: prompt injection & output validation', summary: 'Input guards, output validation, jailbreak resistance.' },
        { slug: '22-testing-evaluation',    title: 'Testing & evaluation',                         summary: 'Golden tests, snapshot regression, fake LLMs.' },
        { slug: '23-observability-cost',    title: 'Observability & cost',                         summary: 'Tracing every call, token accounting, budgets.' },
        { slug: 'recap-part-5',             title: 'Part V recap — Production-grade AI',            summary: 'Mind map of safety, testing, and observability — the production hygiene layer.' },
      ],
    },
    {
      title: 'Vector databases & embeddings',
      lessons: [
        { slug: '25-embeddings-101',          title: 'Embeddings 101 — vectors that mean things',     summary: 'Semantic vs lexical, cosine/dot/L2, which embedding models handle Vietnamese well.' },
        { slug: '26-chunking-strategies',     title: 'Chunking strategies that don\'t lose meaning',    summary: 'Fixed vs recursive vs semantic vs section-aware; overlap math; metadata that pays off later.' },
        { slug: '27-vector-index-types',      title: 'Index types: flat, IVF, HNSW',                   summary: 'Recall vs latency; HNSW M / ef_construction / ef_search; when each index wins.' },
        { slug: '28-pgvector-vs-qdrant',      title: 'pgvector vs Qdrant, side by side',               summary: 'Same dataset, same query, same metric — and the decision matrix for picking one.' },
        { slug: '29-qdrant-hands-on',         title: 'Qdrant hands-on — Docker, collections, payload filters', summary: 'docker-compose, collection config, upsert, payload filters, snapshots.' },
        { slug: '30-eval-retrieval',          title: 'Did your retrieval actually work?',              summary: 'Build a 20-row eval set; recall@k, MRR; rerankers and when they pay for themselves.' },
        { slug: 'recap-part-6',               title: 'Part VI recap — Vector databases & embeddings', summary: 'Mind map of embeddings, chunking, indexes, the pgvector/Qdrant decision, and evaluation.' },
      ],
    },
    {
      title: 'Building a Customer-Facing Concierge',
      lessons: [
        { slug: '31-rag-vs-tools',                   title: 'RAG vs Tools — the decision that splits the build',  summary: 'When prose retrieval beats a function call, and the hybrid pattern that uses both.' },
        { slug: '32-pgvector-and-ingestion',         title: 'pgvector + idempotent ingestion',                     summary: 'Schema, HNSW index, markdown-driven ingestion, separate DB user.' },
        { slug: '33-hybrid-retrieval-multilingual',  title: 'Hybrid retrieval + Vietnamese/English locales',       summary: 'Vector + keyword + Reciprocal Rank Fusion; mixed-language queries; optional reranking.' },
        { slug: '34-session-and-auth',               title: 'Session and auth with a separate backend',            summary: 'Verify JWTs via /auth/me + Redis cache; the LLM never picks user_id.' },
        { slug: '35-recommend-engine',               title: 'A hybrid recommendation tool',                        summary: 'Content + collaborative + popularity, scored and exposed as one tool.' },
        { slug: '36-cost-routing-gateway',           title: 'Cost, routing, and the AI Gateway',                   summary: 'One gateway, multi-provider fallback, model routing by task, daily kill switch.' },
        { slug: '37-deploy-concierge',               title: 'Deploying the concierge to a VPS',                    summary: 'Three containers, secrets as files, backups, soft-launch ramp, runbook.' },
        { slug: 'recap-part-7',                      title: 'Part VII recap — Customer-Facing Concierge',          summary: 'Mind map of the six new pieces on top of the Part IV operator.' },
      ],
    },
  ],
  project: { slug: 'project', title: 'AI Operator Console' },
};
