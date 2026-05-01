'use client';
import { useState } from 'react';
import { useTimeoutQueue } from '@/lib/use-timeout-queue';

type NodeId = 'agent' | 'read_tools' | 'await_confirmation' | 'write_tools';

type Preset = 'read' | 'write' | 'mixed';

type Step = {
  node: NodeId;
  message: string;
};

type EdgeKey =
  | 'agent->read_tools'
  | 'agent->await_confirmation'
  | 'read_tools->agent'
  | 'await_confirmation->write_tools'
  | 'write_tools->agent';

const SCRIPTS: Record<Preset, Step[]> = {
  read: [
    { node: 'agent', message: 'agent → tool_calls: [customers.search]' },
    { node: 'read_tools', message: 'read_tools → executed customers.search → 7 rows (no confirm)' },
    { node: 'agent', message: 'agent → final message (no tool_calls) → END' },
  ],
  write: [
    { node: 'agent', message: 'agent → tool_calls: [promotions.create]' },
    { node: 'await_confirmation', message: 'await_confirmation → interrupt() — paused for user' },
    { node: 'write_tools', message: 'write_tools → user APPROVED — executed promotions.create' },
    { node: 'agent', message: 'agent → final message → END' },
  ],
  mixed: [
    { node: 'agent', message: 'agent → tool_calls: [customers.search, promotions.create]' },
    { node: 'read_tools', message: 'read_tools → executed customers.search → 7 rows' },
    { node: 'agent', message: 'agent → still pending: [promotions.create]' },
    { node: 'await_confirmation', message: 'await_confirmation → interrupt() — paused for user' },
    { node: 'write_tools', message: 'write_tools → user APPROVED — executed promotions.create' },
    { node: 'agent', message: 'agent → final message → END' },
  ],
};

const PRESET_LABEL: Record<Preset, string> = {
  read: 'read-only prompt',
  write: 'single-write prompt',
  mixed: 'mixed prompt',
};

const PRESET_PROMPT: Record<Preset, string> = {
  read: '"Who hasn\'t ordered in 60 days?"',
  write: '"Create a 15% promo code LAPSED15."',
  mixed: '"Find lapsed customers and create LAPSED15 for them."',
};

const STEP_MS = 850;

const NODES: { id: NodeId; label: string; cx: number; cy: number }[] = [
  { id: 'agent',              label: 'agent',              cx:  90, cy: 100 },
  { id: 'read_tools',         label: 'read_tools',         cx: 310, cy:  40 },
  { id: 'await_confirmation', label: 'await_confirmation', cx: 310, cy: 160 },
  { id: 'write_tools',        label: 'write_tools',        cx: 530, cy: 160 },
];

const NODE_W = 130;
const NODE_H = 44;

// Which edges each preset traverses, used to fade non-traversed ones.
const TRAVERSED: Record<Preset, Set<EdgeKey>> = {
  read: new Set<EdgeKey>(['agent->read_tools', 'read_tools->agent']),
  write: new Set<EdgeKey>([
    'agent->await_confirmation',
    'await_confirmation->write_tools',
    'write_tools->agent',
  ]),
  mixed: new Set<EdgeKey>([
    'agent->read_tools',
    'read_tools->agent',
    'agent->await_confirmation',
    'await_confirmation->write_tools',
    'write_tools->agent',
  ]),
};

function nodeById(id: NodeId) {
  const n = NODES.find((x) => x.id === id);
  if (!n) throw new Error(`unknown node ${id}`);
  return n;
}

export function ConditionalRoutingDemo() {
  const [preset, setPreset] = useState<Preset | null>(null);
  const [running, setRunning] = useState(false);
  const [stepIdx, setStepIdx] = useState(-1);
  const [messages, setMessages] = useState<string[]>([]);
  const { schedule, clear } = useTimeoutQueue();

  function run(p: Preset) {
    clear();
    setPreset(p);
    setRunning(true);
    setStepIdx(-1);
    setMessages([]);

    const script = SCRIPTS[p];
    script.forEach((s, i) => {
      schedule(() => {
        setStepIdx(i);
        setMessages((prev) => [...prev, s.message]);
      }, STEP_MS * (i + 1));
    });

    schedule(() => setRunning(false), STEP_MS * (script.length + 1));
  }

  const script = preset ? SCRIPTS[preset] : null;
  const currentNode: NodeId | null = script && stepIdx >= 0 ? script[stepIdx].node : null;
  const visitedNodes = new Set<NodeId>();
  if (script) {
    for (let i = 0; i <= stepIdx; i += 1) visitedNodes.add(script[i].node);
  }

  function nodeFill(id: NodeId): string {
    if (currentNode === id) return 'var(--color-accent)';
    if (visitedNodes.has(id)) return 'var(--color-bg-soft)';
    return 'white';
  }
  function nodeStroke(id: NodeId): string {
    if (currentNode === id) return 'var(--color-accent)';
    if (visitedNodes.has(id)) return 'var(--color-pine)';
    return 'var(--color-rule)';
  }
  function nodeText(id: NodeId): string {
    if (currentNode === id) return 'white';
    if (visitedNodes.has(id)) return 'var(--color-pine)';
    return 'var(--color-text-soft)';
  }

  function edgeOpacity(key: EdgeKey): number {
    if (!preset) return 1;
    return TRAVERSED[preset].has(key) ? 1 : 0.3;
  }

  function edgeColor(key: EdgeKey): string {
    if (!preset) return 'var(--color-rule)';
    return TRAVERSED[preset].has(key) ? 'var(--color-pine)' : 'var(--color-rule)';
  }

  // Edge geometry helpers.
  function edgePath(from: NodeId, to: NodeId, opts: { dy?: number } = {}): string {
    const a = nodeById(from);
    const b = nodeById(to);
    const ax = a.cx;
    const bx = b.cx;
    const ay = a.cy;
    const by = b.cy;
    const mx = (ax + bx) / 2;
    const my = (ay + by) / 2 + (opts.dy ?? 0);
    return `M ${ax} ${ay} Q ${mx} ${my} ${bx} ${by}`;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {(['read', 'write', 'mixed'] as Preset[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => run(p)}
            disabled={running}
            className={`text-[0.78rem] uppercase tracking-wider px-3 py-1.5 rounded-full font-semibold disabled:opacity-50 focus:outline focus:outline-2 focus:outline-[color:var(--color-accent)] focus:outline-offset-2 ${
              preset === p
                ? 'bg-[color:var(--color-accent)] text-white'
                : 'border border-[color:var(--color-rule)] text-[color:var(--color-pine)] hover:bg-[color:var(--color-bg-soft)]'
            }`}
          >
            {PRESET_LABEL[p]}
          </button>
        ))}
        <span className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-text-faint)]">
          {preset ? PRESET_PROMPT[preset] : '— pick a preset to route —'}
        </span>
      </div>

      <div className="rounded border border-[color:var(--color-rule)] bg-white p-3">
        <svg
          viewBox="0 0 640 220"
          role="img"
          aria-label="Routing graph: agent dispatches read tools, write tools through await_confirmation"
          className="w-full h-auto"
        >
          <defs>
            <marker id="arrowR" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M 0 0 L 8 4 L 0 8 z" fill="var(--color-pine)" />
            </marker>
            <marker id="arrowG" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M 0 0 L 8 4 L 0 8 z" fill="var(--color-rule)" />
            </marker>
          </defs>

          {/* edges (drawn before nodes) */}
          {([
            { k: 'agent->read_tools',           from: 'agent',              to: 'read_tools',         label: 'read',     dy: -30 },
            { k: 'read_tools->agent',           from: 'read_tools',         to: 'agent',              label: 'ToolMessage', dy:  30 },
            { k: 'agent->await_confirmation',   from: 'agent',              to: 'await_confirmation', label: 'write',    dy:  20 },
            { k: 'await_confirmation->write_tools', from: 'await_confirmation', to: 'write_tools',    label: 'approve',  dy:  20 },
            { k: 'write_tools->agent',          from: 'write_tools',        to: 'agent',              label: 'ToolMessage', dy:  60 },
          ] as { k: EdgeKey; from: NodeId; to: NodeId; label: string; dy: number }[]).map((e) => {
            const op = edgeOpacity(e.k);
            const col = edgeColor(e.k);
            const a = nodeById(e.from);
            const b = nodeById(e.to);
            return (
              <g key={e.k} style={{ opacity: op, transition: 'opacity 250ms' }}>
                <path
                  d={edgePath(e.from, e.to, { dy: e.dy })}
                  stroke={col}
                  strokeWidth="1.5"
                  fill="none"
                  markerEnd={op === 1 ? 'url(#arrowR)' : 'url(#arrowG)'}
                />
                <text
                  x={(a.cx + b.cx) / 2}
                  y={(a.cy + b.cy) / 2 + e.dy - 4}
                  textAnchor="middle"
                  fontSize="10"
                  fontFamily="ui-monospace, SFMono-Regular, monospace"
                  fill="var(--color-text-faint)"
                >
                  {e.label}
                </text>
              </g>
            );
          })}

          {/* nodes */}
          {NODES.map((n) => (
            <g key={n.id}>
              <rect
                x={n.cx - NODE_W / 2}
                y={n.cy - NODE_H / 2}
                width={NODE_W}
                height={NODE_H}
                rx={10}
                fill={nodeFill(n.id)}
                stroke={nodeStroke(n.id)}
                strokeWidth={currentNode === n.id ? 2 : 1.5}
                style={{ transition: 'fill 250ms, stroke 250ms' }}
              />
              <text
                x={n.cx}
                y={n.cy + 4}
                textAnchor="middle"
                fontSize="13"
                fontFamily="ui-monospace, SFMono-Regular, monospace"
                fill={nodeText(n.id)}
                style={{ transition: 'fill 250ms' }}
              >
                {n.label}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div
        className="rounded border border-[color:var(--color-rule)] bg-[color:var(--color-code-bg)] text-[color:var(--color-code-text)] p-3 font-mono text-xs min-h-32"
        aria-live="polite"
      >
        <p className="text-[color:var(--color-code-soft)] mb-2">{'>'} routing log</p>
        {messages.length === 0 && (
          <p className="opacity-50">— pick a preset to see how the router dispatches —</p>
        )}
        {messages.map((m, i) => (
          <p
            key={i}
            className={i === stepIdx ? 'text-[color:var(--color-accent)] leading-5' : 'leading-5 opacity-80'}
          >
            {m}
          </p>
        ))}
      </div>
    </div>
  );
}
