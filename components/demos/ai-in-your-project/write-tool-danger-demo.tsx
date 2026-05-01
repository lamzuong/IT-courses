'use client';
import { useEffect, useRef, useState } from 'react';

type PromoRow = {
  id: number;
  code: string;
  discount: string;
  createdAt: string;
  requestKey: string;
};

type Pending = {
  requestKey: string;
  code: string;
  discount: string;
};

type LogEntry = { kind: 'info' | 'write' | 'block'; text: string };

function makeReqKey() {
  return 'req_' + Math.random().toString(36).slice(2, 8);
}

function nowStamp() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour12: false });
}

export function WriteToolDangerDemo() {
  const [gate, setGate] = useState(true);
  const [rows, setRows] = useState<PromoRow[]>([]);
  const [pending, setPending] = useState<Pending | null>(null);
  const [log, setLog] = useState<LogEntry[]>([]);
  const timeoutsRef = useRef<number[]>([]);
  const nextIdRef = useRef(1);

  function clearAll() {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  }

  useEffect(() => () => clearAll(), []);

  function pushLog(entry: LogEntry) {
    setLog((prev) => [...prev, entry].slice(-8));
  }

  function commit(code: string, discount: string, requestKey: string) {
    setRows((prev) => [
      ...prev,
      { id: nextIdRef.current++, code, discount, createdAt: nowStamp(), requestKey },
    ]);
    pushLog({ kind: 'write', text: `INSERT promotions (${code}, ${discount}) [${requestKey}]` });
  }

  function attempt(code: string, discount: string, requestKey: string) {
    if (!gate) {
      commit(code, discount, requestKey);
      return;
    }
    // gate ON: dedupe pending confirmations by code+discount while one is open
    setPending((prev) => {
      if (prev) {
        pushLog({ kind: 'block', text: `dedup: confirmation already pending for ${code} [${requestKey}]` });
        return prev;
      }
      pushLog({ kind: 'info', text: `confirm requested: ${code} ${discount} [${requestKey}]` });
      return { requestKey, code, discount };
    });
  }

  function runOnce() {
    clearAll();
    const requestKey = makeReqKey();
    attempt('LAPSED15', '15% off', requestKey);
  }

  function runTwiceRapidly() {
    clearAll();
    const k1 = makeReqKey();
    const k2 = makeReqKey();
    timeoutsRef.current.push(
      window.setTimeout(() => attempt('LAPSED15', '15% off', k1), 50),
    );
    timeoutsRef.current.push(
      window.setTimeout(() => attempt('LAPSED15', '15% off', k2), 250),
    );
  }

  function approve() {
    if (!pending) return;
    commit(pending.code, pending.discount, pending.requestKey);
    pushLog({ kind: 'info', text: `user APPROVED ${pending.code}` });
    setPending(null);
  }

  function reject() {
    if (!pending) return;
    pushLog({ kind: 'block', text: `user REJECTED ${pending.code} — no row written` });
    setPending(null);
  }

  function reset() {
    clearAll();
    setRows([]);
    setPending(null);
    setLog([]);
    nextIdRef.current = 1;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-xs px-3 py-1.5 rounded-full border cursor-pointer transition focus-within:outline focus-within:outline-2 focus-within:outline-[color:var(--color-accent)] focus-within:outline-offset-2 border-[color:var(--color-border)] bg-[color:var(--color-code-bg)]">
          <input
            type="checkbox"
            checked={gate}
            onChange={(e) => { reset(); setGate(e.target.checked); }}
            className="sr-only"
          />
          <span className="font-semibold text-[color:var(--color-accent)]">Confirmation gate:</span>{' '}
          <span className={gate ? 'text-[color:var(--color-accent)]' : 'text-red-700'}>
            {gate ? 'ON' : 'OFF'}
          </span>
        </label>
        <button
          type="button"
          onClick={runOnce}
          className="text-[0.78rem] uppercase tracking-wider px-3 py-1.5 rounded-full border border-[color:var(--color-border)] hover:bg-[color:var(--color-bg-soft)] focus:outline focus:outline-2 focus:outline-[color:var(--color-accent)] focus:outline-offset-2"
        >
          Run with current settings
        </button>
        <button
          type="button"
          onClick={runTwiceRapidly}
          className="text-[0.78rem] uppercase tracking-wider px-3 py-1.5 rounded-full border border-[color:var(--color-border)] hover:bg-[color:var(--color-bg-soft)] focus:outline focus:outline-2 focus:outline-[color:var(--color-accent)] focus:outline-offset-2"
        >
          Run twice rapidly
        </button>
        <button
          type="button"
          onClick={reset}
          className="text-[0.72rem] uppercase tracking-wider px-2 py-1 rounded text-[color:var(--color-text-faint)] hover:text-[color:var(--color-accent)]"
        >
          clear
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-2 min-h-64" aria-live="polite">
          <p className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-text-faint)]">
            promotions table ({rows.length} {rows.length === 1 ? 'row' : 'rows'})
          </p>
          {rows.length === 0 && (
            <p className="italic text-sm text-[color:var(--color-text-faint)]">— empty —</p>
          )}
          {rows.length > 0 && (
            <ul className="rounded border border-[color:var(--color-border)] bg-white divide-y divide-[color:var(--color-border)] text-[0.85rem]">
              {rows.map((r) => (
                <li key={r.id} className="px-3 py-2 flex justify-between gap-3">
                  <span>
                    <span className="font-mono font-semibold">{r.code}</span>{' '}
                    <span className="text-[color:var(--color-text-soft)]">— {r.discount}</span>
                  </span>
                  <span className="font-mono text-[0.7rem] text-[color:var(--color-text-faint)]">
                    #{r.id} · {r.createdAt}
                  </span>
                </li>
              ))}
            </ul>
          )}
          {pending && (
            <div className="rounded border-2 border-[color:var(--color-accent)] bg-[color:var(--color-bg-soft)] p-3">
              <p className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-pine)] mb-1">
                Confirmation required
              </p>
              <p className="font-serif text-[0.95rem] mb-3">
                AI wants to create promo <span className="font-mono font-semibold">{pending.code}</span>{' '}
                ({pending.discount}).
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={approve}
                  className="text-[0.78rem] uppercase tracking-wider px-3 py-1.5 rounded-full bg-[color:var(--color-accent)] text-white font-semibold focus:outline focus:outline-2 focus:outline-[color:var(--color-pine)] focus:outline-offset-2"
                >
                  Approve
                </button>
                <button
                  type="button"
                  onClick={reject}
                  className="text-[0.78rem] uppercase tracking-wider px-3 py-1.5 rounded-full border border-[color:var(--color-border)] hover:bg-white focus:outline focus:outline-2 focus:outline-[color:var(--color-accent)] focus:outline-offset-2"
                >
                  Reject
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="rounded border border-[color:var(--color-border)] bg-[color:var(--color-code-bg)] text-[color:var(--color-code-text)] p-3 font-mono text-xs h-72 overflow-auto">
          <p className="text-[color:var(--color-code-soft)] mb-2">{'>'} tool log</p>
          {log.length === 0 && <p className="opacity-50">— inspector idle —</p>}
          {log.map((entry, i) => (
            <p
              key={i}
              className={
                entry.kind === 'write'
                  ? 'text-[color:var(--color-accent)] leading-6'
                  : entry.kind === 'block'
                    ? 'text-red-400 leading-6'
                    : 'opacity-80 leading-6'
              }
            >
              {entry.kind === 'write' ? '→ ' : entry.kind === 'block' ? '× ' : '· '}
              {entry.text}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
