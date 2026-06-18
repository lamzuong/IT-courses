'use client';
import { useEffect, useRef, useState } from 'react';

type Persona = 'default' | 'friendly' | 'terse';

const RESPONSES: Record<Persona, string> = {
  default:
    'Customer #7 is Sofia Russo. Her last order was about 6 months ago. She placed 3 orders total, mostly home goods.',
  friendly:
    "Sofia Russo (customer #7) hasn't shopped with us in a while — her last visit was about 6 months ago! She's a loyal home-goods buyer with 3 orders on record. Maybe a perfect candidate for a re-engagement note.",
  terse:
    '{"id":7,"name":"Sofia Russo","last_order_days":180,"order_count":3,"top_category":"home"}',
};

const SYSTEM_PROMPTS: Record<Persona, string> = {
  default: '(no system prompt)',
  friendly: 'You are a friendly customer-service assistant. Use warm, conversational language.',
  terse: 'You are a terse data analyst. Output JSON only, no commentary.',
};

export function SystemPromptToggleDemo() {
  const [persona, setPersona] = useState<Persona>('default');
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  function run() {
    setOutput('');
    setRunning(true);
    const target = RESPONSES[persona];
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
      <div>
        <p className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-text-faint)] mb-1">System prompt</p>
        <div className="flex flex-wrap gap-2">
          {(['default','friendly','terse'] as Persona[]).map((p) => (
            <label key={p} className={`text-xs px-3 py-1.5 rounded-full border cursor-pointer transition focus-within:outline focus-within:outline-2 focus-within:outline-[color:var(--color-accent)] focus-within:outline-offset-2 ${persona === p ? 'border-[color:var(--color-accent)] bg-[color:var(--color-bg-soft)] text-[color:var(--color-accent)]' : 'border-[color:var(--color-border)]'}`}>
              <input type="radio" name="persona" value={p} checked={persona === p} onChange={() => setPersona(p)} className="sr-only" />
              {p}
            </label>
          ))}
        </div>
        <p className="font-mono text-[0.72rem] mt-2 text-[color:var(--color-text-soft)]">{SYSTEM_PROMPTS[persona]}</p>
      </div>
      <p className="font-serif italic text-sm text-[color:var(--color-text-soft)]">
        {`User: "Tell me about customer 7."`}
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
        className="rounded border border-[color:var(--color-border)] bg-white p-3 min-h-24 font-serif text-[0.92rem] leading-relaxed whitespace-pre-wrap"
        aria-live="polite"
      >
        {output || <span className="italic text-[color:var(--color-text-faint)]">— output will stream here —</span>}
      </div>
    </div>
  );
}
