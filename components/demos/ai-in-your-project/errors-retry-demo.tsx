'use client';
import { useState } from 'react';
import { useTimeoutQueue } from '@/lib/use-timeout-queue';

type Scenario = 'validation' | 'unique' | 'timeout';
type Status = 'error' | 'ok';

type Attempt = {
  n: number;
  args: Record<string, unknown>;
  status: Status;
  message: string;
};

type ScenarioSpec = {
  label: string;
  blurb: string;
  attempts: Attempt[];
  finalNote: string;
};

const SCENARIOS: Record<Scenario, ScenarioSpec> = {
  validation: {
    label: 'Validation error',
    blurb: 'AI passed discountValue: 150 for a pct-discount; Zod rejects.',
    attempts: [
      {
        n: 1,
        args: { code: 'LAPSED15', discountType: 'pct', discountValue: 150 },
        status: 'error',
        message: 'ZodError: discountValue must be <= 100 when discountType is "pct".',
      },
      {
        n: 2,
        args: { code: 'LAPSED15', discountType: 'pct', discountValue: 15 },
        status: 'ok',
        message: 'inserted promo LAPSED15 (15%).',
      },
    ],
    finalNote: 'Recoverable: the model read the error and corrected its args.',
  },
  unique: {
    label: 'Unique constraint',
    blurb: 'AI tried code WELCOME10 — already in seed data.',
    attempts: [
      {
        n: 1,
        args: { code: 'WELCOME10', discountType: 'pct', discountValue: 10 },
        status: 'error',
        message: 'UniqueConstraintError: promo code "WELCOME10" already exists. Pick a different code.',
      },
      {
        n: 2,
        args: { code: 'WELCOME10-V2', discountType: 'pct', discountValue: 10 },
        status: 'ok',
        message: 'inserted promo WELCOME10-V2 (10%).',
      },
    ],
    finalNote: 'Business-rule errors should name the constraint AND suggest a fix.',
  },
  timeout: {
    label: 'Network timeout',
    blurb: 'Tool times out twice; orchestrator retries with backoff; third try wins.',
    attempts: [
      {
        n: 1,
        args: { code: 'LAPSED15', discountType: 'pct', discountValue: 15 },
        status: 'error',
        message: 'TransientError: upstream timeout after 3000ms. Retry safe.',
      },
      {
        n: 2,
        args: { code: 'LAPSED15', discountType: 'pct', discountValue: 15 },
        status: 'error',
        message: 'TransientError: upstream timeout after 3000ms. Retry safe.',
      },
      {
        n: 3,
        args: { code: 'LAPSED15', discountType: 'pct', discountValue: 15 },
        status: 'ok',
        message: 'inserted promo LAPSED15 (15%).',
      },
    ],
    finalNote: 'Infrastructure errors: retry the SAME args with backoff; never alter intent.',
  },
};

export function ErrorsRetryDemo() {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [revealed, setRevealed] = useState(0);
  const { schedule, clear } = useTimeoutQueue();

  function run(s: Scenario) {
    clear();
    setScenario(s);
    setRevealed(0);
    const total = SCENARIOS[s].attempts.length;
    for (let i = 1; i <= total; i += 1) {
      schedule(() => setRevealed(i), i * 700);
    }
  }

  const spec = scenario ? SCENARIOS[scenario] : null;
  const shown = spec ? spec.attempts.slice(0, revealed) : [];
  const done = spec && revealed >= spec.attempts.length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(SCENARIOS) as Scenario[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => run(s)}
            className={`text-[0.78rem] uppercase tracking-wider px-3 py-1.5 rounded-full border transition focus:outline focus:outline-2 focus:outline-[color:var(--color-accent)] focus:outline-offset-2 ${
              scenario === s
                ? 'border-[color:var(--color-accent)] bg-[color:var(--color-bg-soft)] text-[color:var(--color-accent)]'
                : 'border-[color:var(--color-border)] hover:bg-[color:var(--color-bg-soft)]'
            }`}
          >
            {SCENARIOS[s].label}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-2 min-h-72" aria-live="polite">
          <p className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-text-faint)]">
            attempts log
          </p>
          {!spec && (
            <p className="italic text-sm text-[color:var(--color-text-faint)]">— pick a scenario —</p>
          )}
          {spec && (
            <p className="text-xs text-[color:var(--color-text-soft)] italic">{spec.blurb}</p>
          )}
          <ul className="space-y-2">
            {shown.map((a) => (
              <li
                key={a.n}
                className={`rounded border p-3 ${
                  a.status === 'ok'
                    ? 'border-[color:var(--color-accent)] bg-[color:var(--color-bg-soft)]'
                    : 'border-red-300 bg-red-50'
                }`}
              >
                <p className="text-[0.7rem] uppercase tracking-wider mb-1">
                  <span
                    className={
                      a.status === 'ok'
                        ? 'text-[color:var(--color-accent)] font-semibold'
                        : 'text-red-700 font-semibold'
                    }
                  >
                    Attempt {a.n} · {a.status === 'ok' ? 'success' : 'error'}
                  </span>
                </p>
                <p className="font-serif text-[0.92rem] mb-1">
                  promotions.create(<span className="font-mono text-xs">
                    {JSON.stringify(a.args)}
                  </span>)
                </p>
                <p className={`text-[0.85rem] ${a.status === 'ok' ? 'text-[color:var(--color-text-soft)]' : 'text-red-800'}`}>
                  {a.status === 'ok' ? '→ ' : '× '}{a.message}
                </p>
              </li>
            ))}
          </ul>
          {done && spec && (
            <p className="text-xs italic text-[color:var(--color-pine)] mt-2">{spec.finalNote}</p>
          )}
        </div>
        <div className="rounded border border-[color:var(--color-border)] bg-[color:var(--color-code-bg)] text-[color:var(--color-code-text)] p-3 font-mono text-xs h-72 overflow-auto">
          <p className="text-[color:var(--color-code-soft)] mb-2">{'>'} error stream sent back to model</p>
          {!spec && <p className="opacity-50">— inspector idle —</p>}
          {shown.map((a) => (
            <div key={a.n} className="mb-2">
              <p className="opacity-60 leading-5">// attempt {a.n}</p>
              <p
                className={
                  a.status === 'ok'
                    ? 'text-[color:var(--color-accent)] leading-5'
                    : 'text-red-400 leading-5'
                }
              >
                {a.status === 'ok' ? '{ ok: true,' : '{ ok: false,'}
              </p>
              <pre className="leading-5 whitespace-pre-wrap pl-3 opacity-90">
{a.status === 'ok' ? '  data: "' + a.message + '"' : '  error: "' + a.message + '"'}
              </pre>
              <p className={a.status === 'ok' ? 'text-[color:var(--color-accent)] leading-5' : 'text-red-400 leading-5'}>
                {'}'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
