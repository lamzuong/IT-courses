import type { Course } from '@/content/courses/types';

export const course: Course = {
  slug: 'claude-effectively',
  title: 'Claude, Effectively',
  summary:
    'How to use Claude well — at the API, in Claude Code, and as a daily collaborator.',
  longDescription:
    'A field guide to working with Claude across every surface: the Anthropic SDK (prompt caching, tool use, extended thinking, the Agent SDK, MCP), Claude Code (slash commands, hooks, subagents, plan mode, worktrees), and the meta-skills (briefing, reading the model, structured output, designing for refusal). The course is opinionated where the docs are neutral — when to cache, when to switch models, when to write a hook instead of begging the model in prose. Ends with the Workbench: a personal toolkit you check into your dotfiles and reuse on every project.',
  whatYoullLearn: [
    'How to brief Claude well — context cost, output shape, the patterns that lift quality without bloating the prompt',
    'How to use the Claude API\'s highest-leverage features: prompt caching, tool use, extended thinking, structured output',
    'How to build agents on top of Claude — the Agent SDK, MCP servers, multi-turn loops, and where to put the human',
    'How to live in Claude Code daily — slash commands, hooks, subagents, plan mode, worktrees, ultrareview',
    'How to compose your own toolkit — slash commands + subagents + hooks + MCP + a CLAUDE.md that scales',
  ],
  whatYoullBuild:
    'Your Claude Workbench — a personal dotfiles bundle: 3 custom slash commands, 2 subagents, 2 hooks, an MCP server, and a CLAUDE.md template. Every piece comes with the rationale for when it fires and the tradeoff it makes.',
  parts: [
    {
      title: 'Briefing Claude (meta-skills)',
      lessons: [
        { slug: '01-what-this-teaches',     title: 'What this course teaches',                    summary: 'Three surfaces, one collaborator. How to read the rest of the course.' },
        { slug: '02-briefing-not-prompting', title: 'Briefing > prompting',                       summary: 'The context-cost-quality triangle and why most "prompt engineering" advice is wrong.' },
        { slug: '03-reading-the-weather',   title: 'Reading the model\'s weather',                summary: 'When to retry, when to switch models, when to change shape.' },
        { slug: '04-output-shape',          title: 'Output shape: free-form vs structured',       summary: 'Pick the wrong shape and the rest of your code suffers. Pick the right one and it disappears.' },
        { slug: '05-refusal-uncertainty',   title: 'Designing for refusal and uncertainty',       summary: 'Make "I don\'t know" a first-class output. Saves more incidents than any guardrail.' },
      ],
    },
    {
      title: 'The Claude API: building blocks',
      lessons: [
        { slug: '06-messages-api',          title: 'The Messages API and the SDK shape',          summary: 'The ten lines you\'ll write a thousand times. Where every other feature attaches.' },
        { slug: '07-prompt-caching',        title: 'Prompt caching — the highest-leverage lever', summary: '90% latency cut, 90% cost cut. The single change worth more than every other optimisation combined.' },
        { slug: '08-tool-use',              title: 'Tool use, end to end',                        summary: 'Tools as typed functions. The call envelope, parallel calls, error envelopes.' },
        { slug: '09-structured-output',     title: 'Structured output with JSON & Zod',           summary: 'Native JSON mode, tool-call coercion, when each shape wins.' },
        { slug: '10-extended-thinking',     title: 'Extended thinking — when, when not, how',     summary: 'Read the trace. Cache around it. Don\'t pay for thinking you don\'t need.' },
      ],
    },
    {
      title: 'The Claude API: agentic and advanced',
      lessons: [
        { slug: '11-agent-sdk',             title: 'The Agent SDK: a loop you trust',             summary: 'Built-in tool runner, lifecycle hooks, the agent loop without the bare-loop bugs.' },
        { slug: '12-mcp-as-tool-surface',   title: 'MCP servers as Claude\'s tool surface',       summary: 'Why "give Claude an MCP server" beats "give Claude five tools" for many workloads.' },
        { slug: '13-files-vision-citations', title: 'Files, vision, and citations',               summary: 'PDFs, images, retrieval-grounded answers. Where each is the right primitive.' },
        { slug: '14-batch-cost-shaping',    title: 'Batch API and cost shaping',                  summary: 'Half the cost on async workloads. Pricing math you can do in your head.' },
      ],
    },
    {
      title: 'Claude Code: daily usage',
      lessons: [
        { slug: '15-settings-permissions',  title: 'Settings, permissions, and the harness',      summary: 'How Claude Code is wired. settings.json, permissions, what the harness does that the model can\'t.' },
        { slug: '16-slash-commands',        title: 'Slash commands (and when to write one)',      summary: 'Project-level vs user-level, args, when a command beats a CLAUDE.md instruction.' },
        { slug: '17-hooks',                 title: 'Hooks — the behavior layer',                  summary: 'Make the harness, not the model, enforce the rule. Pre-tool-use, post-tool-use, session-start.' },
        { slug: '18-subagents',             title: 'Subagents — when a fresh context wins',       summary: 'The Agent tool, custom subagent definitions, isolation modes, when to dispatch.' },
        { slug: '19-mcp-in-claude-code',    title: 'MCP in Claude Code',                          summary: 'Adding servers, scoping, the moment your shell tools become safe.' },
      ],
    },
    {
      title: 'Claude Code: power moves',
      lessons: [
        { slug: '20-plan-mode-plans',       title: 'Plan mode and writing plans',                 summary: 'When the spec earns its weight. Plan-mode flow, executing-plans, review checkpoints.' },
        { slug: '21-worktrees-ultrareview', title: 'Worktrees, parallel work, ultrareview',       summary: 'Isolated branches, parallel agents, multi-agent cloud review on demand.' },
        { slug: '22-memory-auto-memory',    title: 'Memory and the auto-memory system',           summary: 'What to save, what to skip, how memories compose with CLAUDE.md.' },
        { slug: '23-output-styles-statuslines', title: 'Output styles, statuslines, and the rest', summary: 'Customising the shell: model defaults, statuslines, custom prompts, /config.' },
      ],
    },
    {
      title: 'Putting it together',
      lessons: [
        { slug: '24-team-workflow',         title: 'Designing a Claude-native team workflow',     summary: 'Where Claude fits in PR review, code authoring, planning, oncall. What to standardise.' },
        { slug: '25-cost-observability',    title: 'Cost, observability, and when not to use Claude', summary: 'Per-call accounting, what to log, where Claude is the wrong tool.' },
        { slug: '26-workbench-preview',     title: 'The Workbench: project preview & build sequence', summary: 'What you\'re about to build and the order to build it in.' },
      ],
    },
  ],
  project: { slug: 'project', title: 'Your Claude Workbench' },
};
