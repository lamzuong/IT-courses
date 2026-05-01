'use client';
import { useRef, useState } from 'react';
import { useTimeoutQueue } from '@/lib/use-timeout-queue';

type Decision = 'inserted' | 'deduped';

type Attempt = {
  attempt: number;
  requestKey: string;
  decision: Decision;
};

type Side = 'naive' | 'dedup';

type ColumnState = {
  attempts: Attempt[];
  rowCount: number;
};

const EMPTY: ColumnState = { attempts: [], rowCount: 0 };

function makeReqKey() {
  return 'req_' + Math.random().toString(36).slice(2, 8);
}

export function IdempotencyDemo() {
  const [naive, setNaive] = useState<ColumnState>(EMPTY);
  const [dedup, setDedup] = useState<ColumnState>(EMPTY);
  const [running, setRunning] = useState(false);
  const { schedule, clear } = useTimeoutQueue();
  const seenKeysRef = useRef<Set<string>>(new Set());

  function reset() {
    clear();
    setNaive(EMPTY);
    setDedup(EMPTY);
    seenKeysRef.current = new Set();
    setRunning(false);
  }

  function recordAttempt(side: Side, attempt: Attempt) {
    const setter = side === 'naive' ? setNaive : setDedup;
    setter((prev) => ({
      attempts: [...prev.attempts, attempt],
      rowCount: prev.rowCount + (attempt.decision === 'inserted' ? 1 : 0),
    }));
  }

  function run() {
    reset();
    setRunning(true);
    // Both columns share the SAME requestKey across the 3 retries
    // (simulating the orchestrator's logical operation key).
    const sharedKey = makeReqKey();

    for (let i = 1; i <= 3; i += 1) {
      schedule(() => {
        // naive: every attempt inserts a new row, with a fresh per-call request id.
        recordAttempt('naive', {
          attempt: i,
          requestKey: makeReqKey(),
          decision: 'inserted',
        });

        // dedup: same logical key; insert only the first time.
        const seen = seenKeysRef.current.has(sharedKey);
        if (!seen) {
          seenKeysRef.current.add(sharedKey);
          recordAttempt('dedup', {
            attempt: i,
            requestKey: sharedKey,
            decision: 'inserted',
          });
        } else {
          recordAttempt('dedup', {
            attempt: i,
            requestKey: sharedKey,
            decision: 'deduped',
          });
        }

        if (i === 3) {
          schedule(() => setRunning(false), 200);
        }
      }, i * 300);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        <button
          type="button"
          onClick={run}
          disabled={running}
          className="text-[0.78rem] uppercase tracking-wider px-3 py-1.5 rounded-full bg-[color:var(--color-accent)] text-white font-semibold disabled:opacity-50 focus:outline focus:outline-2 focus:outline-[color:var(--color-pine)] focus:outline-offset-2"
        >
          Create promo LAPSED15
        </button>
        <button
          type="button"
          onClick={reset}
          className="text-[0.72rem] uppercase tracking-wider px-2 py-1 rounded text-[color:var(--color-text-faint)] hover:text-[color:var(--color-accent)]"
        >
          clear
        </button>
        <p className="text-xs text-[color:var(--color-text-soft)] italic">
          The model retries the same logical call 3× (300ms apart).
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4 items-start">
        <Column
          title="Without idempotency key"
          tone="danger"
          state={naive}
          tableLabel="promotions"
        />
        <Column
          title="With idempotency key"
          tone="ok"
          state={dedup}
          tableLabel="promotions"
        />
      </div>
    </div>
  );
}

function Column({
  title,
  tone,
  state,
  tableLabel,
}: {
  title: string;
  tone: 'ok' | 'danger';
  state: ColumnState;
  tableLabel: string;
}) {
  const headerColor = tone === 'ok' ? 'var(--color-accent)' : '#b91c1c';
  return (
    <div className="space-y-2">
      <p
        className="text-[0.7rem] uppercase tracking-wider font-semibold"
        style={{ color: headerColor }}
      >
        {title}
      </p>
      <div className="rounded border border-[color:var(--color-border)] bg-[color:var(--color-code-bg)] text-[color:var(--color-code-text)] p-3 font-mono text-xs min-h-40">
        <p className="text-[color:var(--color-code-soft)] mb-2">{'>'} attempts</p>
        {state.attempts.length === 0 && <p className="opacity-50">— idle —</p>}
        {state.attempts.map((a) => (
          <p
            key={a.attempt + ':' + a.requestKey + ':' + a.decision}
            className={
              a.decision === 'inserted'
                ? 'text-[color:var(--color-accent)] leading-6'
                : 'text-amber-300 leading-6'
            }
          >
            {a.decision === 'inserted' ? '→ ' : '↺ '}
            attempt {a.attempt}: {a.requestKey} → {a.decision === 'inserted' ? 'INSERT' : 'dedup hit, returned existing'}
          </p>
        ))}
      </div>
      <p className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-text-faint)]">
        {tableLabel} table — {state.rowCount} {state.rowCount === 1 ? 'row' : 'rows'}
      </p>
      {state.rowCount > 0 && (
        <ul className="rounded border border-[color:var(--color-border)] bg-white text-[0.85rem] divide-y divide-[color:var(--color-border)]">
          {Array.from({ length: state.rowCount }).map((_, i) => (
            <li key={i} className="px-3 py-1.5 flex justify-between">
              <span>
                <span className="font-mono font-semibold">LAPSED15</span>{' '}
                <span className="text-[color:var(--color-text-soft)]">— 15% off</span>
              </span>
              <span className="font-mono text-[0.7rem] text-[color:var(--color-text-faint)]">
                #{i + 1}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
