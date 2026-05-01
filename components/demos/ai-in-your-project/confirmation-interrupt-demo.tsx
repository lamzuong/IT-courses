'use client';
import { useEffect, useRef, useState } from 'react';

// ──────────────────────────────────────────────────────────────────────────
// types
// ──────────────────────────────────────────────────────────────────────────

type State =
  | 'idle'
  | 'planning'
  | 'awaiting_confirm_1'
  | 'executing_1'
  | 'executing_2'
  | 'awaiting_confirm_3'
  | 'executing_3'
  | 'done'
  | 'cancelled';

type StepStatus = 'pending' | 'running' | 'done';

type PlanStep = {
  id: 1 | 2 | 3;
  label: string;
  tool: string;
  kind: 'write' | 'read';
  status: StepStatus;
};

type Message =
  | { id: number; role: 'user'; text: string }
  | { id: number; role: 'assistant'; text: string }
  | { id: number; role: 'system'; text: string };

const PRESET_PROMPT = 'Create a 15% promo for lapsed customers and draft them an email.';

const RECIPIENTS = [
  'Anika Patel',
  'Phuoc Vuong',
  'Ada Okafor',
  'Sofia Russo',
  'Mateo Diaz',
  'Femi Adeyemi',
  'Theo Martin',
];

// ──────────────────────────────────────────────────────────────────────────
// component
// ──────────────────────────────────────────────────────────────────────────

export function ConfirmationInterruptDemo() {
  const [state, setState] = useState<State>('idle');
  const [messages, setMessages] = useState<Message[]>([]);
  const [plan, setPlan] = useState<PlanStep[]>([]);
  const timeoutsRef = useRef<number[]>([]);
  const msgIdRef = useRef(0);

  function clearAll() {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
  }

  useEffect(() => () => clearAll(), []);

  function nextMsgId() {
    msgIdRef.current += 1;
    return msgIdRef.current;
  }

  function pushMessage(m: Omit<Message, 'id'>) {
    setMessages((prev) => [...prev, { ...m, id: nextMsgId() } as Message]);
  }

  function setStepStatus(id: PlanStep['id'], status: StepStatus) {
    setPlan((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  }

  function start() {
    clearAll();
    msgIdRef.current = 0;
    setMessages([]);
    setPlan([]);
    setState('idle');

    // 0. user message
    pushMessage({ role: 'user', text: PRESET_PROMPT });
    setState('planning');

    // 1. plan rows fill in over ~1.8s
    const planRows: PlanStep[] = [
      { id: 1, label: 'Create promo LAPSED15 (15% off)',  tool: 'promotions.create',     kind: 'write', status: 'pending' },
      { id: 2, label: 'Find lapsed customers (60d)',      tool: 'customers.lapsed',      kind: 'read',  status: 'pending' },
      { id: 3, label: 'Draft re-engagement emails',       tool: 'emails.draft_bulk',     kind: 'write', status: 'pending' },
    ];
    timeoutsRef.current.push(window.setTimeout(() => setPlan([planRows[0]]),                        500));
    timeoutsRef.current.push(window.setTimeout(() => setPlan([planRows[0], planRows[1]]),           1100));
    timeoutsRef.current.push(window.setTimeout(() => setPlan(planRows),                             1700));

    // 2. interrupt before step 1
    timeoutsRef.current.push(window.setTimeout(() => setState('awaiting_confirm_1'),                2200));
  }

  function approveStep1() {
    setState('executing_1');
    setStepStatus(1, 'running');
    timeoutsRef.current.push(
      window.setTimeout(() => {
        setStepStatus(1, 'done');
        // step 2 (read) auto-runs
        setState('executing_2');
        setStepStatus(2, 'running');
      }, 1100),
    );
    timeoutsRef.current.push(
      window.setTimeout(() => {
        setStepStatus(2, 'done');
        // interrupt before step 3 (multi-customer write)
        setState('awaiting_confirm_3');
      }, 2200),
    );
  }

  function approveStep3() {
    setState('executing_3');
    setStepStatus(3, 'running');
    timeoutsRef.current.push(
      window.setTimeout(() => {
        setStepStatus(3, 'done');
        pushMessage({
          role: 'assistant',
          text: `Done. ${RECIPIENTS.length} drafts saved. None sent yet.`,
        });
        setState('done');
      }, 1300),
    );
  }

  function reject() {
    clearAll();
    pushMessage({ role: 'system', text: 'Cancelled — no changes committed.' });
    setState('cancelled');
  }

  function reset() {
    clearAll();
    msgIdRef.current = 0;
    setMessages([]);
    setPlan([]);
    setState('idle');
  }

  const isRunning =
    state !== 'idle' && state !== 'done' && state !== 'cancelled';

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={start}
          disabled={isRunning}
          className="text-[0.78rem] uppercase tracking-wider px-3 py-1.5 rounded-full bg-[color:var(--color-accent)] text-white font-semibold disabled:opacity-50 focus:outline focus:outline-2 focus:outline-[color:var(--color-accent)] focus:outline-offset-2"
        >
          {isRunning ? 'Running…' : state === 'done' || state === 'cancelled' ? 'Run again' : 'Run preset'}
        </button>
        {(state === 'done' || state === 'cancelled') && (
          <button
            type="button"
            onClick={reset}
            className="text-[0.72rem] uppercase tracking-wider px-2 py-1 rounded text-[color:var(--color-text-faint)] hover:text-[color:var(--color-accent)]"
          >
            clear
          </button>
        )}
        {state === 'done' && (
          <span className="text-[0.7rem] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[color:var(--color-pine)] text-white font-semibold">
            Done
          </span>
        )}
        {state === 'cancelled' && (
          <span className="text-[0.7rem] uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-700 text-white font-semibold">
            Cancelled
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4 items-start">
        {/* LEFT: chat transcript */}
        <div className="rounded border border-[color:var(--color-rule)] bg-[color:var(--color-bg-soft)] p-3 min-h-80" aria-live="polite">
          <p className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-text-faint)] mb-2">
            transcript
          </p>
          {messages.length === 0 && (
            <p className="italic text-sm text-[color:var(--color-text-faint)]">
              — click &ldquo;Run preset&rdquo; to send the prompt —
            </p>
          )}
          <ul className="space-y-2">
            {messages.map((m) => (
              <li key={m.id}>
                {m.role === 'user' && (
                  <div className="rounded-lg bg-white border border-[color:var(--color-rule)] px-3 py-2 text-[0.9rem]">
                    <p className="text-[0.65rem] uppercase tracking-wider text-[color:var(--color-text-faint)] mb-1">
                      you
                    </p>
                    <p>{m.text}</p>
                  </div>
                )}
                {m.role === 'assistant' && (
                  <div className="rounded-lg bg-white border border-[color:var(--color-pine)] px-3 py-2 text-[0.9rem]">
                    <p className="text-[0.65rem] uppercase tracking-wider text-[color:var(--color-pine)] mb-1">
                      AI Operator
                    </p>
                    <p>{m.text}</p>
                  </div>
                )}
                {m.role === 'system' && (
                  <p className="text-[0.8rem] italic text-red-700 px-2">{m.text}</p>
                )}
              </li>
            ))}
          </ul>

          {state === 'planning' && (
            <p className="mt-3 text-[0.78rem] text-[color:var(--color-text-faint)] flex items-center gap-2">
              <Spinner /> planning…
            </p>
          )}

          {plan.length > 0 && (
            <div className="mt-3 rounded border border-[color:var(--color-rule)] bg-white p-2">
              <p className="text-[0.65rem] uppercase tracking-wider text-[color:var(--color-text-faint)] mb-1">
                plan
              </p>
              <ol className="space-y-1 text-[0.85rem] font-mono">
                {plan.map((s) => (
                  <li key={s.id} className="flex items-center gap-2">
                    <StatusGlyph status={s.status} />
                    <span className={s.status === 'done' ? 'text-[color:var(--color-pine)]' : ''}>
                      {s.id}. {s.label}
                    </span>
                    <span className="text-[0.7rem] text-[color:var(--color-text-faint)]">
                      [{s.tool}]
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* RIGHT: confirmation panel stack */}
        <div className="rounded border border-[color:var(--color-rule)] bg-white p-3 min-h-80">
          <p className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-text-faint)] mb-2">
            confirmation panel
          </p>
          {state === 'idle' && (
            <p className="italic text-sm text-[color:var(--color-text-faint)]">
              — interrupts will appear here —
            </p>
          )}
          {state === 'planning' && (
            <p className="text-sm text-[color:var(--color-text-faint)]">
              waiting for the model to produce a plan…
            </p>
          )}

          {state === 'awaiting_confirm_1' && (
            <ConfirmCard
              title="AI wants to create a promo"
              detail={
                <>
                  <p className="font-mono text-[0.85rem]">
                    promotions.create({'{'} code: <span className="text-[color:var(--color-accent)]">&quot;LAPSED15&quot;</span>, discountType: <span className="text-[color:var(--color-accent)]">&quot;pct&quot;</span>, discountValue: <span className="text-[color:var(--color-accent)]">15</span> {'}'})
                  </p>
                  <p className="text-[0.78rem] text-[color:var(--color-text-soft)] mt-1">
                    Active for 30 days. Audience: lapsed-60d.
                  </p>
                </>
              }
              onApprove={approveStep1}
              onReject={reject}
            />
          )}

          {(state === 'executing_1' || state === 'executing_2') && (
            <p className="text-[0.85rem] text-[color:var(--color-pine)] flex items-center gap-2">
              <Spinner />
              {state === 'executing_1' ? 'executing promotions.create…' : 'executing customers.lapsed…'}
            </p>
          )}

          {state === 'awaiting_confirm_3' && (
            <ConfirmCard
              title="AI wants to draft emails"
              detail={
                <>
                  <p className="font-mono text-[0.85rem] mb-1">
                    emails.draft_bulk({'{'} promoCode: &quot;LAPSED15&quot;, recipients: [{RECIPIENTS.length}] {'}'})
                  </p>
                  <p className="text-[0.78rem] text-[color:var(--color-text-soft)]">
                    Drafts only — nothing is sent until you say so.
                  </p>
                  <ul className="mt-2 max-h-28 overflow-auto text-[0.78rem] text-[color:var(--color-text-soft)] divide-y divide-[color:var(--color-rule)]">
                    {RECIPIENTS.map((name) => (
                      <li key={name} className="py-1 flex justify-between">
                        <span>{name}</span>
                        <span className="font-mono text-[color:var(--color-text-faint)]">draft</span>
                      </li>
                    ))}
                  </ul>
                </>
              }
              onApprove={approveStep3}
              onReject={reject}
            />
          )}

          {state === 'executing_3' && (
            <p className="text-[0.85rem] text-[color:var(--color-pine)] flex items-center gap-2">
              <Spinner /> executing emails.draft_bulk…
            </p>
          )}

          {state === 'done' && (
            <div className="rounded border border-[color:var(--color-pine)] bg-[color:var(--color-bg-soft)] p-3">
              <p className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-pine)] font-semibold">
                Workflow committed
              </p>
              <p className="text-[0.85rem] mt-1">
                1 promo created, {RECIPIENTS.length} drafts saved. The graph reached <span className="font-mono">END</span>.
              </p>
            </div>
          )}

          {state === 'cancelled' && (
            <div className="rounded border border-red-700 bg-red-50 p-3">
              <p className="text-[0.7rem] uppercase tracking-wider text-red-700 font-semibold">
                Plan rejected
              </p>
              <p className="text-[0.85rem] mt-1">
                The graph aborted at the interrupt. No mutations ran.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// subcomponents
// ──────────────────────────────────────────────────────────────────────────

function ConfirmCard({
  title,
  detail,
  onApprove,
  onReject,
}: {
  title: string;
  detail: React.ReactNode;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="rounded border-2 border-[color:var(--color-accent)] bg-[color:var(--color-bg-soft)] p-3 space-y-2">
      <p className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-pine)] font-semibold">
        Confirmation required
      </p>
      <p className="font-serif text-[0.95rem]">{title}</p>
      <div className="text-[0.85rem]">{detail}</div>
      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onApprove}
          className="text-[0.78rem] uppercase tracking-wider px-3 py-1.5 rounded-full bg-[color:var(--color-accent)] text-white font-semibold focus:outline focus:outline-2 focus:outline-[color:var(--color-pine)] focus:outline-offset-2"
        >
          Approve
        </button>
        <button
          type="button"
          onClick={onReject}
          className="text-[0.78rem] uppercase tracking-wider px-3 py-1.5 rounded-full border border-[color:var(--color-rule)] hover:bg-white focus:outline focus:outline-2 focus:outline-[color:var(--color-accent)] focus:outline-offset-2"
        >
          Reject
        </button>
        <button
          type="button"
          disabled
          title="Edit args (out of scope for this demo)"
          className="text-[0.78rem] uppercase tracking-wider px-3 py-1.5 rounded-full border border-[color:var(--color-rule)] text-[color:var(--color-text-faint)] cursor-not-allowed"
        >
          Edit args
        </button>
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <span
      className="inline-block w-3 h-3 rounded-full border-2 border-[color:var(--color-accent)] border-t-transparent animate-spin"
      aria-hidden
    />
  );
}

function StatusGlyph({ status }: { status: StepStatus }) {
  if (status === 'done') {
    return <span className="text-[color:var(--color-pine)] font-bold" aria-label="done">✓</span>;
  }
  if (status === 'running') {
    return <Spinner />;
  }
  return <span className="text-[color:var(--color-text-faint)]" aria-label="pending">○</span>;
}
