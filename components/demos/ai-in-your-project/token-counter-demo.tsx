'use client';
import { useState } from 'react';

type Scenario = 'quick' | 'tool' | 'plan';

type Breakdown = {
  systemPrompt: number;
  history: number;
  toolDefs: number;
  output: number;
};

const SCENARIOS: Record<Scenario, { label: string; subtitle: string; input: Breakdown }> = {
  quick: {
    label: 'Quick chat',
    subtitle: 'One user message, plain text answer.',
    input: { systemPrompt: 800, history: 120, toolDefs: 0, output: 180 },
  },
  tool: {
    label: 'Tool call',
    subtitle: 'Model picks one tool, runs it, responds.',
    input: { systemPrompt: 800, history: 320, toolDefs: 1_400, output: 240 },
  },
  plan: {
    label: 'Multi-step plan',
    subtitle: 'Plan → 4 tool calls → confirmation → final reply.',
    input: { systemPrompt: 800, history: 4_200, toolDefs: 1_400, output: 1_900 },
  },
};

// Claude Sonnet 4 sample rates: $3 / 1M input, $15 / 1M output.
const RATE_INPUT = 3 / 1_000_000;
const RATE_OUTPUT = 15 / 1_000_000;

const COLORS: Record<keyof Breakdown, string> = {
  systemPrompt: '#1f4d3a',
  history: '#3a7a5e',
  toolDefs: '#5fa380',
  output: '#a8d4ba',
};

const LABELS: Record<keyof Breakdown, string> = {
  systemPrompt: 'System prompt',
  history: 'Conversation history',
  toolDefs: 'Tool definitions',
  output: 'Model output',
};

function fmtUsd(n: number) {
  if (n < 0.01) return '$' + n.toFixed(4);
  return '$' + n.toFixed(3);
}

export function TokenCounterDemo() {
  const [scenario, setScenario] = useState<Scenario>('quick');
  const b = SCENARIOS[scenario].input;
  const inputTokens = b.systemPrompt + b.history + b.toolDefs;
  const totalTokens = inputTokens + b.output;
  const cost = inputTokens * RATE_INPUT + b.output * RATE_OUTPUT;

  const keys: (keyof Breakdown)[] = ['systemPrompt', 'history', 'toolDefs', 'output'];

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-text-faint)] mb-1">Scenario</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(SCENARIOS) as Scenario[]).map((s) => (
            <label
              key={s}
              className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer transition focus-within:outline focus-within:outline-2 focus-within:outline-[color:var(--color-accent)] focus-within:outline-offset-2 ${
                scenario === s
                  ? 'border-[color:var(--color-accent)] bg-[color:var(--color-bg-soft)] text-[color:var(--color-accent)]'
                  : 'border-[color:var(--color-border)] bg-white'
              }`}
            >
              <input
                type="radio"
                name="scenario"
                value={s}
                checked={scenario === s}
                onChange={() => setScenario(s)}
                className="sr-only"
              />
              {SCENARIOS[s].label}
            </label>
          ))}
        </div>
        <p className="font-serif italic text-[0.85rem] mt-2 text-[color:var(--color-text-soft)]">
          {SCENARIOS[scenario].subtitle}
        </p>
      </div>

      <div className="rounded border border-[color:var(--color-border)] bg-white p-3 space-y-3">
        <div>
          <div className="flex justify-between items-baseline mb-1">
            <p className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-text-faint)]">Token mix</p>
            <p className="font-mono text-[0.72rem] text-[color:var(--color-text-soft)]">
              {totalTokens.toLocaleString()} tokens total
            </p>
          </div>
          <div className="flex h-6 w-full rounded overflow-hidden border border-[color:var(--color-border)]">
            {keys.map((k) => {
              const w = totalTokens === 0 ? 0 : (b[k] / totalTokens) * 100;
              if (w === 0) return null;
              return (
                <div
                  key={k}
                  style={{ width: `${w}%`, background: COLORS[k] }}
                  title={`${LABELS[k]}: ${b[k].toLocaleString()} tokens`}
                />
              );
            })}
          </div>
        </div>

        <ul className="space-y-1 text-xs">
          {keys.map((k) => (
            <li key={k} className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded" style={{ background: COLORS[k] }} aria-hidden />
              <span className="flex-1">{LABELS[k]}</span>
              <span className="font-mono text-[color:var(--color-text-soft)]">{b[k].toLocaleString()}</span>
            </li>
          ))}
        </ul>

        <div className="border-t border-[color:var(--color-border)] pt-2 grid grid-cols-3 gap-2 text-xs">
          <div>
            <p className="text-[0.65rem] uppercase tracking-wider text-[color:var(--color-text-faint)]">Input</p>
            <p className="font-mono">{inputTokens.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[0.65rem] uppercase tracking-wider text-[color:var(--color-text-faint)]">Output</p>
            <p className="font-mono">{b.output.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[0.65rem] uppercase tracking-wider text-[color:var(--color-text-faint)]">Cost / call</p>
            <p className="font-mono text-[color:var(--color-accent)] font-semibold">{fmtUsd(cost)}</p>
          </div>
        </div>

        <p className="text-[0.7rem] text-[color:var(--color-text-faint)] italic">
          Rates: $3 / 1M input, $15 / 1M output (Claude Sonnet, May 2026 sample). Costs scale linearly with traffic — 10K runs/day of the multi-step plan ≈ {fmtUsd(cost * 10_000)}/day.
        </p>
      </div>
    </div>
  );
}
