import type { Course } from '@/content/courses/types';

export const course: Course = {
  slug: 'langchain-langgraph-toolkit',
  title: 'LangChain & LangGraph',
  summary:
    'The framework primitives — chat models, tools, graphs, checkpoints — taught on their own so you can drop them into any project.',
  longDescription:
    'A framework-first walk through LangChain and LangGraph. Where the AI in Your Project course wired one app end to end, this one teaches the building blocks in isolation: chat models, prompts, structured output, tools, retrievers, RAG, then state graphs, checkpoints, interrupts, multi-agent supervision, and production concerns. Each lesson stands alone with a runnable snippet. By the end you have a personal patterns library you can copy into any TypeScript project.',
  whatYoullLearn: [
    'How LangChain\'s core abstractions — runnables, chat models, prompts, output parsers — actually compose',
    'How to design tools, retrievers, and a minimal RAG pipeline you can swap providers in and out of',
    'How to model real workflows as LangGraph state graphs with conditional routing and streaming',
    'How checkpointers, interrupts, and subgraphs turn a one-shot agent into a long-running, resumable, human-supervised workflow',
    'How to ship: tracing with callbacks/LangSmith, testing with FakeListChatModel, retries, and cost accounting',
  ],
  whatYoullBuild:
    'A Patterns Playground — a Next.js app with a sidebar of every pattern from the course (RAG, ReAct, supervisor, handoff, map-reduce, interrupt, streaming). Pick a pattern, run it against sample data, see the trace, copy the snippet into your own project.',
  parts: [
    {
      title: 'Primitives',
      lessons: [
        { slug: '01-what-this-teaches',      title: 'What this course teaches',          summary: 'Toolkit, not an app. How this differs from the AI in Your Project course.' },
        { slug: '02-setup-ollama-providers', title: 'Setup: Ollama and the swap pattern', summary: 'Local model in dev, hosted in prod. One import boundary, two backends.' },
        { slug: '03-chat-models',            title: 'Chat models: invoke, stream, batch', summary: 'The three call shapes; when to use each; runnables under the hood.' },
        { slug: '04-messages-prompts',       title: 'Messages and prompt templates',     summary: 'Message types, ChatPromptTemplate, partial(), MessagesPlaceholder.' },
        { slug: '05-structured-output',      title: 'Structured output with Zod',        summary: 'withStructuredOutput, schema as source of truth, strictness gotchas.' },
      ],
    },
    {
      title: 'Tools and retrieval',
      lessons: [
        { slug: '06-first-tool',          title: 'Your first tool',                   summary: 'tool() with a Zod schema; the call envelope; inspecting tool_calls.' },
        { slug: '07-bind-tools-loop',     title: 'bindTools and the bare agent loop', summary: 'Build the manual ReAct loop so the LangGraph version makes sense.' },
        { slug: '08-document-loaders',    title: 'Document loaders and splitters',    summary: 'Loaders, RecursiveCharacterTextSplitter, chunk size as a knob.' },
        { slug: '09-embeddings-vectors',  title: 'Embeddings and vector stores',      summary: 'OllamaEmbeddings + MemoryVectorStore; what similarity actually means.' },
        { slug: '10-retrievers-rag',      title: 'Retrievers and a minimal RAG chain', summary: 'asRetriever(), the RAG four-liner, when to add a re-ranker.' },
      ],
    },
    {
      title: 'LangGraph fundamentals',
      lessons: [
        { slug: '11-state-nodes-edges',    title: 'State, nodes, edges',                  summary: 'Annotation.Root, reducers, the mental model that makes everything else click.' },
        { slug: '12-first-stategraph',     title: 'Your first StateGraph',                summary: 'A two-node graph, compile(), invoke(); seeing state thread through.' },
        { slug: '13-conditional-edges',    title: 'Conditional edges',                    summary: 'addConditionalEdges, the routing function, END as a target.' },
        { slug: '14-react-graph',          title: 'The ReAct graph pattern',              summary: 'agent → tools → agent, rebuilt as a graph; why this is a one-pager now.' },
        { slug: '15-streaming-graph',      title: 'Streaming graph state',                summary: 'stream(), streamEvents(), values vs updates vs messages mode.' },
      ],
    },
    {
      title: 'Stateful and human-in-the-loop',
      lessons: [
        { slug: '16-checkpointers',     title: 'Checkpointers and persistence', summary: 'MemorySaver, PostgresSaver; thread_id; why a graph without one resets.' },
        { slug: '17-memory-sessions',   title: 'Memory across sessions',        summary: 'Long-term vs short-term, summarising the transcript, sliding windows.' },
        { slug: '18-interrupt-hitl',    title: '`interrupt` and human approval', summary: 'Pause-resume; pattern for any "review before commit" flow.' },
        { slug: '19-subgraphs',         title: 'Subgraphs and composition',     summary: 'Embedding a graph as a node; shared vs scoped state.' },
      ],
    },
    {
      title: 'Advanced patterns',
      lessons: [
        { slug: '20-supervisor',  title: 'Multi-agent: supervisor pattern', summary: 'One coordinator, several specialists; routing by intent.' },
        { slug: '21-handoff',     title: 'Multi-agent: handoff pattern',    summary: 'Peer-to-peer agents; Command and goto for explicit transfers.' },
        { slug: '22-map-reduce',  title: 'Map-reduce with `Send`',          summary: 'Fan-out per item; collect; aggregate. The escape hatch from sequential graphs.' },
      ],
    },
    {
      title: 'Production',
      lessons: [
        { slug: '23-tracing-langsmith',  title: 'Callbacks, tracing, LangSmith', summary: 'Per-call hooks, run trees, what to log, how to read a trace.' },
        { slug: '24-testing-fake-llm',   title: 'Testing with FakeListChatModel', summary: 'Deterministic chains; snapshot tests; testing tool calls without a model.' },
        { slug: '25-errors-retries-cost', title: 'Errors, retries, and cost',     summary: 'withRetry, fallbacks, token-budget guards, deadlines.' },
      ],
    },
  ],
  project: { slug: 'project', title: 'Patterns Playground' },
};
