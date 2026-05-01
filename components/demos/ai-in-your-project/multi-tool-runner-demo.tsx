'use client';
import { useEffect, useRef, useState } from 'react';
import { SEED_PRODUCTS, lapsedCustomers } from '@/lib/ai-mock-cms';

type ToolCall = {
  name: string;
  args: Record<string, unknown>;
  result: unknown;
};

const LAPSED = lapsedCustomers(60).slice(0, 7);
const HOME_PRODUCTS = SEED_PRODUCTS.filter((p) => p.category === 'home').slice(0, 4);

const TOOL_CALLS: ToolCall[] = [
  {
    name: 'customers.search',
    args: { filter: { lapsedDays: 60 } },
    result: LAPSED.map((c) => ({ id: c.id, name: c.name, lastOrderAt: c.lastOrderAt?.slice(0, 10) ?? null })),
  },
  {
    name: 'orders.totals_by_segment',
    args: { tag: 'lapsed-pre-q4' },
    result: { totalRevenue: 142800, avgOrderValue: 4760, currency: 'USD-cents' },
  },
  {
    name: 'products.list',
    args: { category: 'home' },
    result: HOME_PRODUCTS.map((p) => ({ id: p.id, name: p.name, sku: p.sku, priceCents: p.priceCents })),
  },
];

const FINAL_REPLY =
  "I found 7 lapsed customers. Their average order value was $47.60 and they bought home goods most often. I'd suggest a 15% promo featuring the wool throw and ceramic pour-over.";

const USER_MSG = 'Plan a re-engagement campaign for our lapsed customers.';

type Phase = 'idle' | 'calling' | 'streaming' | 'done';

export function MultiToolRunnerDemo() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [visibleCalls, setVisibleCalls] = useState(0);
  const [output, setOutput] = useState('');
  const timeoutsRef = useRef<number[]>([]);
  const intervalRef = useRef<number | null>(null);

  function clearAll() {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  function run() {
    clearAll();
    setPhase('calling');
    setVisibleCalls(0);
    setOutput('');

    TOOL_CALLS.forEach((_, idx) => {
      timeoutsRef.current.push(window.setTimeout(() => {
        setVisibleCalls(idx + 1);
      }, 500 * (idx + 1)));
    });

    timeoutsRef.current.push(window.setTimeout(() => {
      setPhase('streaming');
      let i = 0;
      intervalRef.current = window.setInterval(() => {
        i += 1;
        if (i > FINAL_REPLY.length) {
          if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
          intervalRef.current = null;
          setPhase('done');
          return;
        }
        setOutput(FINAL_REPLY.slice(0, i));
      }, 18);
    }, 500 * (TOOL_CALLS.length + 1)));
  }

  useEffect(() => () => clearAll(), []);

  const showAssistant = phase === 'streaming' || phase === 'done';
  const showUser = phase !== 'idle';

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={run}
        disabled={phase === 'calling' || phase === 'streaming'}
        className="text-[0.78rem] uppercase tracking-wider px-3 py-1.5 rounded-full bg-[color:var(--color-accent)] text-white font-semibold disabled:opacity-50 focus:outline focus:outline-2 focus:outline-[color:var(--color-accent)] focus:outline-offset-2"
      >
        Plan a re-engagement campaign
      </button>
      <div className="grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-2 min-h-72" aria-live="polite">
          <p className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-text-faint)]">Transcript</p>
          {!showUser && (
            <p className="italic text-sm text-[color:var(--color-text-faint)]">— click the button to start —</p>
          )}
          {showUser && (
            <div className="rounded border border-[color:var(--color-border)] bg-white p-3 font-serif text-[0.92rem]">
              <span className="text-[0.68rem] uppercase tracking-wider text-[color:var(--color-text-faint)] block mb-1">User</span>
              {USER_MSG}
            </div>
          )}
          {phase === 'calling' && visibleCalls < TOOL_CALLS.length && (
            <p className="text-xs italic text-[color:var(--color-text-soft)]">
              Model is calling <code className="font-mono">{TOOL_CALLS[visibleCalls]?.name ?? '…'}</code>…
            </p>
          )}
          {phase === 'calling' && visibleCalls === TOOL_CALLS.length && (
            <p className="text-xs italic text-[color:var(--color-text-soft)]">Synthesizing answer…</p>
          )}
          {showAssistant && (
            <div className="rounded border border-[color:var(--color-accent)] bg-[color:var(--color-bg-soft)] p-3 font-serif text-[0.92rem] leading-relaxed">
              <span className="text-[0.68rem] uppercase tracking-wider text-[color:var(--color-text-faint)] block mb-1">Assistant</span>
              {output}
            </div>
          )}
        </div>
        <div className="rounded border border-[color:var(--color-border)] bg-[color:var(--color-code-bg)] text-[color:var(--color-code-text)] p-3 font-mono text-xs h-80 overflow-auto">
          <p className="text-[color:var(--color-code-soft)] mb-2">{'>'} tool calls</p>
          {visibleCalls === 0 && <p className="opacity-50">— inspector idle —</p>}
          {TOOL_CALLS.slice(0, visibleCalls).map((call, idx) => (
            <div key={idx} className="mb-3">
              <p className="text-[color:var(--color-accent)] leading-6">→ {call.name}</p>
              <pre className="leading-5 whitespace-pre-wrap">{JSON.stringify(call.args, null, 2)}</pre>
              <p className="text-lime-400 leading-6 mt-1">← result</p>
              <pre className="leading-5 whitespace-pre-wrap">{JSON.stringify(call.result, null, 2)}</pre>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
