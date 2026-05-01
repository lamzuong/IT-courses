'use client';
import { useMemo, useRef, useState } from 'react';
import { lapsedCustomers, type Customer } from '@/lib/ai-mock-cms';
import { useTimeoutQueue } from '@/lib/use-timeout-queue';

// ──────────────────────────────────────────────────────────────────────────
// types
// ──────────────────────────────────────────────────────────────────────────

type State =
  | 'idle'
  | 'planning'
  | 'awaiting_promo'
  | 'executing_promo'
  | 'executing_find'
  | 'awaiting_emails'
  | 'executing_emails'
  | 'awaiting_tag'
  | 'executing_tag'
  | 'done'
  | 'cancelled';

type StepStatus = 'pending' | 'running' | 'done';

type PlanStep = {
  id: 1 | 2 | 3 | 4;
  label: string;
  tool: string;
  status: StepStatus;
};

type AuditEntry = {
  id: number;
  ts: string;
  query: string;
  rowsAffected: number;
};

// ──────────────────────────────────────────────────────────────────────────
// component
// ──────────────────────────────────────────────────────────────────────────

const PROMO_CODE = 'LAPSED15';

// Deterministic clock — every audit entry shows a stable, reproducible timestamp
// derived from a fixed start time. Resetting and re-running shows the same log.
const FIXED_START = '14:03:17';
function stampAt(secondsFromStart: number) {
  const [h, m, s] = FIXED_START.split(':').map(Number);
  const total = h * 3600 + m * 60 + s + secondsFromStart;
  const hh = String(Math.floor(total / 3600) % 24).padStart(2, '0');
  const mm = String(Math.floor(total / 60) % 60).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

export function LapsedCustomerDemo() {
  const [state, setState] = useState<State>('idle');
  const [plan, setPlan] = useState<PlanStep[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [recipients, setRecipients] = useState<Customer[]>([]);
  const { schedule, clear } = useTimeoutQueue();
  const auditIdRef = useRef(0);
  const auditClockRef = useRef(0);

  const lapsed = useMemo(() => lapsedCustomers(60), []);

  function pushAudit(query: string, rowsAffected: number) {
    auditIdRef.current += 1;
    auditClockRef.current += 1;
    setAudit((prev) => [
      ...prev,
      { id: auditIdRef.current, ts: stampAt(auditClockRef.current), query, rowsAffected },
    ]);
  }

  function setStepStatus(id: PlanStep['id'], status: StepStatus) {
    setPlan((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)));
  }

  function start() {
    clear();
    setAudit([]);
    auditIdRef.current = 0;
    auditClockRef.current = 0;
    setRecipients([]);
    setState('planning');

    const planRows: PlanStep[] = [
      { id: 1, label: `Create promo ${PROMO_CODE} (15% off, lapsed-60d audience)`, tool: 'promotions.create',  status: 'pending' },
      { id: 2, label: 'Find lapsed customers (last order > 60 days ago)',           tool: 'customers.lapsed',   status: 'pending' },
      { id: 3, label: 'Draft re-engagement emails to recipients',                   tool: 'emails.draft_bulk',  status: 'pending' },
      { id: 4, label: 'Tag recipients as lapsed-q4',                                tool: 'customers.tag_bulk', status: 'pending' },
    ];

    schedule(() => setPlan([planRows[0]]),                              500);
    schedule(() => setPlan([planRows[0], planRows[1]]),                 1000);
    schedule(() => setPlan([planRows[0], planRows[1], planRows[2]]),    1500);
    schedule(() => setPlan(planRows),                                   2000);
    schedule(() => setState('awaiting_promo'),                          2400);
  }

  function approvePromo() {
    setState('executing_promo');
    setStepStatus(1, 'running');
    schedule(() => {
      setStepStatus(1, 'done');
      pushAudit(
        `INSERT INTO promotions (code, discount_type, discount_value, audience) VALUES ('${PROMO_CODE}','pct',15,'lapsed-60d')`,
        1,
      );
      // step 2 (read) auto-runs
      setState('executing_find');
      setStepStatus(2, 'running');
    }, 900);
    schedule(() => {
      setRecipients(lapsed);
      setStepStatus(2, 'done');
      // read tools don't audit-log (no mutation), but we still narrate
      setState('awaiting_emails');
    }, 1900);
  }

  function approveEmails() {
    setState('executing_emails');
    setStepStatus(3, 'running');
    schedule(() => {
      setStepStatus(3, 'done');
      pushAudit(
        `INSERT INTO email_drafts (customer_id, subject, body) — ${recipients.length} rows`,
        recipients.length,
      );
      setState('awaiting_tag');
    }, 1100);
  }

  function approveTag() {
    setState('executing_tag');
    setStepStatus(4, 'running');
    schedule(() => {
      setStepStatus(4, 'done');
      pushAudit(
        `UPDATE customers SET tags = tags || ARRAY['lapsed-q4'] WHERE id IN (${recipients.length} ids)`,
        recipients.length,
      );
      setState('done');
    }, 1100);
  }

  function reject() {
    clear();
    setState('cancelled');
  }

  function reset() {
    clear();
    setState('idle');
    setPlan([]);
    setAudit([]);
    setRecipients([]);
    auditIdRef.current = 0;
  }

  const isRunning = state !== 'idle' && state !== 'done' && state !== 'cancelled';

  return (
    <div className="space-y-3">
      <div className="rounded border border-[color:var(--color-rule)] bg-[color:var(--color-bg-soft)] p-3">
        <p className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-text-faint)] mb-1">
          operator prompt
        </p>
        <p className="font-serif text-[0.95rem]">
          &ldquo;Create a 15% promo for customers who haven&rsquo;t ordered in 60 days, draft them a
          re-engagement email, and tag them <span className="font-mono">lapsed-q4</span>.&rdquo;
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={start}
          disabled={isRunning}
          className="text-[0.78rem] uppercase tracking-wider px-3 py-1.5 rounded-full bg-[color:var(--color-accent)] text-white font-semibold disabled:opacity-50 focus:outline focus:outline-2 focus:outline-[color:var(--color-accent)] focus:outline-offset-2"
        >
          {isRunning
            ? 'Running…'
            : state === 'done' || state === 'cancelled'
              ? 'Run again'
              : 'Run the lapsed-customer workflow'}
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
            Workflow committed
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4 items-start">
        {/* LEFT: plan + confirmation */}
        <div className="rounded border border-[color:var(--color-rule)] bg-white p-3 min-h-80">
          <p className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-text-faint)] mb-2">
            plan
          </p>
          {plan.length === 0 && (
            <p className="italic text-sm text-[color:var(--color-text-faint)]">
              — click run to see the model&rsquo;s plan —
            </p>
          )}
          {plan.length > 0 && (
            <ol className="space-y-1 text-[0.85rem] font-mono mb-3">
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
          )}

          {state === 'awaiting_promo' && (
            <ConfirmCard
              title={`Create promo ${PROMO_CODE}`}
              body={
                <>
                  <p className="font-mono text-[0.82rem]">
                    promotions.create({'{'} code: <span className="text-[color:var(--color-accent)]">{`"${PROMO_CODE}"`}</span>, discountType: &quot;pct&quot;, discountValue: 15 {'}'})
                  </p>
                  <p className="text-[0.78rem] text-[color:var(--color-text-soft)] mt-1">
                    1 row will be inserted into <span className="font-mono">promotions</span>.
                  </p>
                </>
              }
              onApprove={approvePromo}
              onReject={reject}
            />
          )}

          {state === 'awaiting_emails' && (
            <ConfirmCard
              title="Draft re-engagement emails"
              body={
                <>
                  <p className="font-mono text-[0.82rem]">
                    emails.draft_bulk({'{'} promoCode: &quot;{PROMO_CODE}&quot;, recipients: {recipients.length} {'}'})
                  </p>
                  <ul className="mt-2 max-h-32 overflow-auto text-[0.8rem] divide-y divide-[color:var(--color-rule)]">
                    {recipients.map((r) => (
                      <li key={r.id} className="py-1 flex justify-between">
                        <span>{r.name}</span>
                        <span className="font-mono text-[color:var(--color-text-faint)]">{r.email}</span>
                      </li>
                    ))}
                  </ul>
                </>
              }
              onApprove={approveEmails}
              onReject={reject}
            />
          )}

          {state === 'awaiting_tag' && (
            <ConfirmCard
              title="Tag recipients as lapsed-q4"
              body={
                <>
                  <p className="font-mono text-[0.82rem]">
                    customers.tag_bulk({'{'} ids: [{recipients.length}], tag: &quot;lapsed-q4&quot; {'}'})
                  </p>
                  <p className="text-[0.78rem] text-[color:var(--color-text-soft)] mt-1">
                    {recipients.length} customer rows will be updated.
                  </p>
                </>
              }
              onApprove={approveTag}
              onReject={reject}
            />
          )}

          <div role="status" aria-live="polite" aria-atomic="true">
            {(state === 'executing_promo' || state === 'executing_find' || state === 'executing_emails' || state === 'executing_tag') && (
              <p className="text-[0.85rem] text-[color:var(--color-pine)] flex items-center gap-2">
                <Spinner /> running step…
              </p>
            )}

            {state === 'done' && (
              <div className="rounded border border-[color:var(--color-pine)] bg-[color:var(--color-bg-soft)] p-3">
                <p className="text-[0.85rem]">
                  Workflow committed. {audit.length} mutations logged below.
                </p>
              </div>
            )}

            {state === 'cancelled' && (
              <div className="rounded border border-red-700 bg-red-50 p-3">
                <p className="text-[0.85rem] text-red-800">
                  Cancelled — no further changes committed. Earlier steps that already ran remain in the audit log.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: audit log */}
        <div className="rounded border border-[color:var(--color-rule)] bg-[color:var(--color-code-bg)] text-[color:var(--color-code-text)] p-3 font-mono text-xs min-h-80">
          <p className="text-[color:var(--color-code-soft)] mb-2">{'>'} audit log</p>
          {audit.length === 0 && <p className="opacity-50">— no mutations committed yet —</p>}
          {audit.map((a) => (
            <div key={a.id} className="mb-2 leading-5">
              <p className="text-[color:var(--color-accent)]">
                <span className="opacity-60">[{a.ts}]</span> {a.query}
              </p>
              <p className="opacity-60 pl-2">
                → {a.rowsAffected} row{a.rowsAffected === 1 ? '' : 's'} affected · by AI Operator
              </p>
            </div>
          ))}
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
  body,
  onApprove,
  onReject,
}: {
  title: string;
  body: React.ReactNode;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="rounded border-2 border-[color:var(--color-accent)] bg-[color:var(--color-bg-soft)] p-3 space-y-2">
      <p className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-pine)] font-semibold">
        Confirmation required
      </p>
      <p className="font-serif text-[0.95rem]">{title}</p>
      <div className="text-[0.85rem]">{body}</div>
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
  if (status === 'running') return <Spinner />;
  return <span className="text-[color:var(--color-text-faint)]" aria-label="pending">○</span>;
}
