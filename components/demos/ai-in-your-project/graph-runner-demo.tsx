'use client';
import { useState } from 'react';
import { useTimeoutQueue } from '@/lib/use-timeout-queue';

type NodeId = 'agent' | 'tools' | 'end';

type Step = {
  node: NodeId;
  message: string;
};

const SCRIPT: Step[] = [
  { node: 'agent', message: 'step: agent → produced tool_calls (customers.search)' },
  { node: 'tools', message: 'step: tools → executed customers.search → 7 rows' },
  { node: 'agent', message: 'step: agent → produced tool_calls (orders.totals_by_segment)' },
  { node: 'tools', message: 'step: tools → executed orders.totals_by_segment → AOV $47.60' },
  { node: 'agent', message: 'step: agent → produced final message (no tool_calls)' },
  { node: 'end', message: 'step: __end__ → graph halted, returning state' },
];

const STEP_MS = 700;

const NODES: { id: NodeId; label: string; cx: number; cy: number }[] = [
  { id: 'agent', label: 'agent', cx: 90, cy: 70 },
  { id: 'tools', label: 'tools', cx: 290, cy: 70 },
  { id: 'end', label: '__end__', cx: 490, cy: 70 },
];

const NODE_W = 110;
const NODE_H = 50;

export function GraphRunnerDemo() {
  const [running, setRunning] = useState(false);
  const [stepIdx, setStepIdx] = useState(-1);
  const [messages, setMessages] = useState<string[]>([]);
  const { schedule, clear } = useTimeoutQueue();

  function run() {
    clear();
    setRunning(true);
    setStepIdx(-1);
    setMessages([]);

    SCRIPT.forEach((s, i) => {
      schedule(() => {
        setStepIdx(i);
        setMessages((prev) => [...prev, s.message]);
      }, STEP_MS * (i + 1));
    });

    schedule(() => {
      setRunning(false);
    }, STEP_MS * (SCRIPT.length + 1));
  }

  const currentNode: NodeId | null = stepIdx >= 0 ? SCRIPT[stepIdx].node : null;
  const visitedNodes = new Set<NodeId>();
  for (let i = 0; i <= stepIdx; i += 1) visitedNodes.add(SCRIPT[i].node);

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

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={run}
          disabled={running}
          className="text-[0.78rem] uppercase tracking-wider px-3 py-1.5 rounded-full bg-[color:var(--color-accent)] text-white font-semibold disabled:opacity-50 focus:outline focus:outline-2 focus:outline-[color:var(--color-accent)] focus:outline-offset-2"
        >
          {running ? 'Running…' : 'Run graph'}
        </button>
        <span className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-text-faint)]">
          iterations: <span className="font-mono text-[color:var(--color-pine)]">{stepIdx + 1}</span> / {SCRIPT.length}
        </span>
      </div>

      <div className="rounded border border-[color:var(--color-rule)] bg-white p-3">
        <svg
          viewBox="0 0 580 140"
          role="img"
          aria-label="Graph: agent loops through tools and exits via __end__"
          className="w-full h-auto"
        >
          {/* Curved arrow: agent → tools (top loop) */}
          <path
            d={`M ${NODES[0].cx + NODE_W / 2} ${NODES[0].cy} Q ${(NODES[0].cx + NODES[1].cx) / 2} 20 ${NODES[1].cx - NODE_W / 2} ${NODES[1].cy}`}
            stroke="var(--color-rule)"
            strokeWidth="1.5"
            fill="none"
            markerEnd="url(#arrowhead)"
          />
          {/* Curved arrow: tools → agent (bottom loop back) */}
          <path
            d={`M ${NODES[1].cx - NODE_W / 2} ${NODES[1].cy} Q ${(NODES[0].cx + NODES[1].cx) / 2} 120 ${NODES[0].cx + NODE_W / 2} ${NODES[0].cy}`}
            stroke="var(--color-rule)"
            strokeWidth="1.5"
            fill="none"
            markerEnd="url(#arrowhead)"
          />
          {/* Straight arrow: agent → __end__ (lower edge) */}
          <path
            d={`M ${NODES[1].cx + NODE_W / 2} ${NODES[1].cy} Q ${(NODES[1].cx + NODES[2].cx) / 2} 70 ${NODES[2].cx - NODE_W / 2} ${NODES[2].cy}`}
            stroke="var(--color-rule)"
            strokeWidth="1.5"
            fill="none"
            markerEnd="url(#arrowhead)"
            strokeDasharray="4 3"
          />
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="8"
              refX="7"
              refY="4"
              orient="auto"
            >
              <path d="M 0 0 L 8 4 L 0 8 z" fill="var(--color-rule)" />
            </marker>
          </defs>

          {/* Edge labels */}
          <text x={(NODES[0].cx + NODES[1].cx) / 2} y={26} textAnchor="middle" fontSize="10" fill="var(--color-text-faint)" fontFamily="ui-monospace, SFMono-Regular, monospace">
            tool_calls
          </text>
          <text x={(NODES[0].cx + NODES[1].cx) / 2} y={120} textAnchor="middle" fontSize="10" fill="var(--color-text-faint)" fontFamily="ui-monospace, SFMono-Regular, monospace">
            ToolMessages
          </text>
          <text x={(NODES[1].cx + NODES[2].cx) / 2} y={62} textAnchor="middle" fontSize="10" fill="var(--color-text-faint)" fontFamily="ui-monospace, SFMono-Regular, monospace">
            no tool_calls
          </text>

          {/* Nodes */}
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
                fontSize="14"
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

      <div className="rounded border border-[color:var(--color-rule)] bg-[color:var(--color-code-bg)] text-[color:var(--color-code-text)] p-3 font-mono text-xs min-h-40" aria-live="polite">
        <p className="text-[color:var(--color-code-soft)] mb-2">{'>'} message log</p>
        {messages.length === 0 && (
          <p className="opacity-50">— click &ldquo;Run graph&rdquo; to step the agent through the loop —</p>
        )}
        {messages.map((m, i) => (
          <p key={i} className={i === stepIdx ? 'text-[color:var(--color-accent)] leading-5' : 'leading-5 opacity-80'}>
            {m}
          </p>
        ))}
      </div>
    </div>
  );
}
