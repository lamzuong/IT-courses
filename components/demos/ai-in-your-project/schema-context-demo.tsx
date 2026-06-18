'use client';
import { useEffect, useRef, useState } from 'react';
import { SEED_CUSTOMERS } from '@/lib/ai-mock-cms';

const SCHEMA = `customers (
  id INTEGER PRIMARY KEY,
  name TEXT,
  email TEXT,
  last_order_at TEXT,
  tags TEXT  -- JSON array
)`;

const vipCount = SEED_CUSTOMERS.filter((c) => c.tags.includes('vip')).length;
const totalCount = SEED_CUSTOMERS.length;

const WITH_SCHEMA = `You have ${totalCount} customers, of which ${vipCount} are tagged "vip". The rest are ordinary customers without special tags.`;
const WITHOUT_SCHEMA = `I don't have direct access to your database, so I can't give you a precise count. If you share the schema or a query, I can help interpret the result.`;

export function SchemaContextDemo() {
  const [withSchema, setWithSchema] = useState(true);
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  function run() {
    setOutput('');
    setRunning(true);
    const target = withSchema ? WITH_SCHEMA : WITHOUT_SCHEMA;
    let i = 0;
    intervalRef.current = window.setInterval(() => {
      i += 1;
      if (i > target.length) {
        if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
        intervalRef.current = null;
        setRunning(false);
        return;
      }
      setOutput(target.slice(0, i));
    }, 22);
  }

  useEffect(() => () => { if (intervalRef.current !== null) window.clearInterval(intervalRef.current); }, []);

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={withSchema} onChange={(e) => setWithSchema(e.target.checked)} />
        <span>Pass schema to the model in the system prompt</span>
      </label>
      {withSchema && (
        <pre className="rounded bg-[color:var(--color-code-bg)] border border-[color:var(--color-code-border)] p-3 text-[0.72rem] font-mono">
          {SCHEMA}
        </pre>
      )}
      <p className="font-serif italic text-sm text-[color:var(--color-text-soft)]">
        {`User: "How many customers do we have?"`}
      </p>
      <button
        type="button"
        onClick={run}
        disabled={running}
        className="text-[0.78rem] uppercase tracking-wider px-3 py-1.5 rounded-full bg-[color:var(--color-accent)] text-white font-semibold disabled:opacity-50"
      >
        Run
      </button>
      <div
        className="rounded border border-[color:var(--color-border)] bg-white p-3 min-h-24 font-serif text-[0.92rem] leading-relaxed"
        aria-live="polite"
      >
        {output || <span className="italic text-[color:var(--color-text-faint)]">— output will stream here —</span>}
      </div>
    </div>
  );
}
