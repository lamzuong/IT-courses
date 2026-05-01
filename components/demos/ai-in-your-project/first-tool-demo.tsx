'use client';
import { useEffect, useRef, useState } from 'react';
import { SEED_CUSTOMERS, lapsedCustomers, type Customer } from '@/lib/ai-mock-cms';

type Scenario = 'lapsed' | 'vip' | 'name';
type Step = 'idle' | 'calling' | 'results' | 'responding' | 'done';

type ScenarioSpec = {
  label: string;
  userMsg: string;
  args: Record<string, unknown>;
  rows: () => Customer[];
  reply: (rows: Customer[]) => string;
};

const SCENARIOS: Record<Scenario, ScenarioSpec> = {
  lapsed: {
    label: 'Find lapsed customers',
    userMsg: 'Who hasn\'t ordered in the last 60 days?',
    args: { filter: { lapsedDays: 60 } },
    rows: () => lapsedCustomers(60),
    reply: (rows) =>
      `I found ${rows.length} customers who haven't ordered in 60+ days. The longest-lapsed are ${rows.slice(0, 2).map((r) => r.name).join(' and ')}. Want me to draft a re-engagement email?`,
  },
  vip: {
    label: 'Find VIPs',
    userMsg: 'Who are our VIP customers?',
    args: { filter: { tagIn: ['vip'] } },
    rows: () => SEED_CUSTOMERS.filter((c) => c.tags.includes('vip')),
    reply: (rows) =>
      `You have ${rows.length} VIP customers: ${rows.map((r) => r.name).join(', ')}. Both have ordered recently — they're worth keeping warm.`,
  },
  name: {
    label: 'Search by name: Phuoc',
    userMsg: 'Find the customer named Phuoc.',
    args: { filter: { nameContains: 'Phuoc' } },
    rows: () => SEED_CUSTOMERS.filter((c) => c.name.toLowerCase().includes('phuoc')),
    reply: (rows) =>
      rows.length > 0
        ? `Found ${rows[0].name} (id ${rows[0].id}). Last order was ${rows[0].lastOrderAt?.slice(0, 10) ?? 'never'}.`
        : 'No customer matched that name.',
  },
};

function truncate(rows: Customer[]): { shown: Customer[]; more: number } {
  return { shown: rows.slice(0, 5), more: Math.max(0, rows.length - 5) };
}

export function FirstToolDemo() {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [step, setStep] = useState<Step>('idle');
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

  function run(s: Scenario) {
    clearAll();
    setScenario(s);
    setStep('idle');
    setOutput('');
    const spec = SCENARIOS[s];

    timeoutsRef.current.push(window.setTimeout(() => setStep('calling'), 300));
    timeoutsRef.current.push(window.setTimeout(() => setStep('results'), 800));
    timeoutsRef.current.push(window.setTimeout(() => {
      setStep('responding');
      const rows = spec.rows();
      const reply = spec.reply(rows);
      let i = 0;
      intervalRef.current = window.setInterval(() => {
        i += 1;
        if (i > reply.length) {
          if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
          intervalRef.current = null;
          setStep('done');
          return;
        }
        setOutput(reply.slice(0, i));
      }, 18);
    }, 2000));
  }

  useEffect(() => () => clearAll(), []);

  const spec = scenario ? SCENARIOS[scenario] : null;
  const rows = spec ? spec.rows() : [];
  const { shown, more } = truncate(rows);
  const showCalling = scenario && (step === 'calling' || step === 'results' || step === 'responding' || step === 'done');
  const showResults = scenario && (step === 'results' || step === 'responding' || step === 'done');
  const showAssistant = scenario && (step === 'responding' || step === 'done');

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(SCENARIOS) as Scenario[]).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => run(s)}
            className="text-[0.78rem] uppercase tracking-wider px-3 py-1.5 rounded-full border border-[color:var(--color-border)] hover:bg-[color:var(--color-bg-soft)] focus:outline focus:outline-2 focus:outline-[color:var(--color-accent)] focus:outline-offset-2"
          >
            {SCENARIOS[s].label}
          </button>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-4 items-start">
        <div className="space-y-2 min-h-64" aria-live="polite">
          <p className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-text-faint)]">Transcript</p>
          {!scenario && (
            <p className="italic text-sm text-[color:var(--color-text-faint)]">— pick a scenario above —</p>
          )}
          {spec && (
            <div className="rounded border border-[color:var(--color-border)] bg-white p-3 font-serif text-[0.92rem]">
              <span className="text-[0.68rem] uppercase tracking-wider text-[color:var(--color-text-faint)] block mb-1">User</span>
              {spec.userMsg}
            </div>
          )}
          {showCalling && (
            <p className="text-xs italic text-[color:var(--color-text-soft)]">
              Model is calling <code className="font-mono">customers.search</code>…
            </p>
          )}
          {showAssistant && (
            <div className="rounded border border-[color:var(--color-accent)] bg-[color:var(--color-bg-soft)] p-3 font-serif text-[0.92rem] leading-relaxed">
              <span className="text-[0.68rem] uppercase tracking-wider text-[color:var(--color-text-faint)] block mb-1">Assistant</span>
              {output}
            </div>
          )}
        </div>
        <div className="rounded border border-[color:var(--color-border)] bg-[color:var(--color-code-bg)] text-[color:var(--color-code-text)] p-3 font-mono text-xs h-72 overflow-auto">
          <p className="text-[color:var(--color-code-soft)] mb-2">{'>'} tool calls</p>
          {!scenario && <p className="opacity-50">— inspector idle —</p>}
          {showCalling && spec && (
            <>
              <p className="text-[color:var(--color-accent)] leading-6">→ customers.search</p>
              <pre className="leading-5 whitespace-pre-wrap">{JSON.stringify(spec.args, null, 2)}</pre>
            </>
          )}
          {showResults && spec && (
            <>
              <p className="text-lime-400 mt-3 leading-6">← result ({rows.length} {rows.length === 1 ? 'row' : 'rows'})</p>
              <pre className="leading-5 whitespace-pre-wrap">{JSON.stringify(shown.map((c) => ({ id: c.id, name: c.name, lastOrderAt: c.lastOrderAt?.slice(0, 10) ?? null, tags: c.tags })), null, 2)}</pre>
              {more > 0 && <p className="opacity-60 leading-6">…and {more} more</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
