'use client';
import { useState } from 'react';
import { useTimeoutQueue } from '@/lib/use-timeout-queue';

type Build = { name?: string; email?: string | null; segment?: 'active' | 'dormant' | 'lapsed' };

export function StructuredOutputDemo() {
  const [build, setBuild] = useState<Build>({});
  const [running, setRunning] = useState(false);
  const { schedule, clear } = useTimeoutQueue();

  function run() {
    clear();
    setBuild({});
    setRunning(true);
    schedule(() => setBuild((b) => ({ ...b, name: 'Phuoc Vuong' })), 350);
    schedule(() => setBuild((b) => ({ ...b, email: null })), 900);
    schedule(() => setBuild((b) => ({ ...b, segment: 'lapsed' })), 1500);
    schedule(() => setRunning(false), 1700);
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <p className="font-serif italic text-sm text-[color:var(--color-text-soft)]">
          Prompt: "Extract the customer's name, email, and segment from this draft: 'Hi Phuoc, we miss you — your last order was 4 months ago…'"
        </p>
        <button
          type="button"
          onClick={run}
          disabled={running}
          className="text-[0.78rem] uppercase tracking-wider px-3 py-1.5 rounded-full bg-[color:var(--color-accent)] text-white font-semibold disabled:opacity-50"
        >
          {running ? 'Building…' : 'Run'}
        </button>
        <pre className="rounded bg-[color:var(--color-code-bg)] border border-[color:var(--color-code-border)] p-3 text-[0.72rem] font-mono">
{`z.object({
  name: z.string(),
  email: z.string().email().nullable(),
  segment: z.enum(['active','dormant','lapsed']),
})`}
        </pre>
      </div>
      <div className="rounded border border-[color:var(--color-border)] bg-white p-3 min-h-32 font-mono text-xs">
        <p className="text-[color:var(--color-text-faint)] uppercase tracking-wider text-[0.65rem] mb-2">Structured output</p>
        <pre className="whitespace-pre-wrap">{JSON.stringify(build, null, 2)}</pre>
      </div>
    </div>
  );
}
