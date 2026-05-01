'use client';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  SEED_CUSTOMERS,
  SEED_PRODUCTS,
  SEED_PROMOTIONS,
  lapsedCustomers,
  type Customer,
} from '@/lib/ai-mock-cms';

// ──────────────────────────────────────────────────────────────────────────
// types
// ──────────────────────────────────────────────────────────────────────────

type StepKind = 'read' | 'write';
type StepStatus = 'pending' | 'running' | 'done';

type Step = {
  id: number;
  name: string;
  summary: string;
  argsPreview: string;
  kind: StepKind;
  status: StepStatus;
  // For write steps: what to record in the audit log on approve.
  audit?: { query: string; rowsAffected: number };
  // For read steps: a small prose result rendered in the transcript.
  readResult?: ReactNode;
};

type Message =
  | { id: number; role: 'user'; text: string }
  | { id: number; role: 'assistant'; text: ReactNode }
  | { id: number; role: 'system'; text: string };

type AuditEntry = {
  id: number;
  ts: string;
  query: string;
  rowsAffected: number;
};

type Phase =
  | { kind: 'idle' }
  | { kind: 'planning' }
  | { kind: 'awaiting_confirm'; stepIdx: number }
  | { kind: 'executing'; stepIdx: number }
  | { kind: 'done'; committed: number }
  | { kind: 'cancelled' };

type PresetId = 'lapsed-promo' | 'top-spenders' | 'tag-home' | 'slow-products' | 'thank-vips';

type Preset = {
  id: PresetId;
  prompt: string;
  buildPlan: () => Step[];
  finalMessage: (committed: number) => ReactNode;
};

// ──────────────────────────────────────────────────────────────────────────
// deterministic clock — anchored at 14:03:17, identical across resets
// ──────────────────────────────────────────────────────────────────────────

const FIXED_START = '14:03:17';
function stampAt(secondsFromStart: number): string {
  const [h, m, s] = FIXED_START.split(':').map(Number);
  const total = h * 3600 + m * 60 + s + secondsFromStart;
  const hh = String(Math.floor(total / 3600) % 24).padStart(2, '0');
  const mm = String(Math.floor(total / 60) % 60).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

// ──────────────────────────────────────────────────────────────────────────
// derived audiences for the scripted scenarios (computed once)
// ──────────────────────────────────────────────────────────────────────────

function vipCustomers(): Customer[] {
  return SEED_CUSTOMERS.filter((c) => c.tags.includes('vip'));
}

function topSpenders(): Customer[] {
  // Deterministic mock: pick the four most recently active.
  return [...SEED_CUSTOMERS]
    .filter((c) => c.lastOrderAt !== null)
    .sort((a, b) => (b.lastOrderAt ?? '').localeCompare(a.lastOrderAt ?? ''))
    .slice(0, 4);
}

function homeBuyers(): Customer[] {
  // Mock: customers 2, 6, 9, 13 are framed as having bought home goods.
  const ids = new Set([2, 6, 9, 13]);
  return SEED_CUSTOMERS.filter((c) => ids.has(c.id));
}

function slowMovingProducts() {
  // Mock: candles, brass openers, throws — three not sold in 30 days.
  const slowSkus = new Set(['BRS-BO-01', 'WAX-CD-01', 'WOL-TH-01']);
  return SEED_PRODUCTS.filter((p) => slowSkus.has(p.sku));
}

// ──────────────────────────────────────────────────────────────────────────
// preset scenarios
// ──────────────────────────────────────────────────────────────────────────

const PRESETS: Preset[] = [
  {
    id: 'lapsed-promo',
    prompt:
      "Create a 15% promo for customers who haven't ordered in 60 days and draft them a re-engagement email",
    buildPlan: () => {
      const lapsed = lapsedCustomers(60);
      return [
        {
          id: 1,
          name: 'promotions.create',
          summary: 'Create promo LAPSED15 (15% off, lapsed-60d audience)',
          argsPreview:
            'promotions.create({ code: "LAPSED15", discountType: "pct", discountValue: 15, audience: "lapsed-60d" })',
          kind: 'write',
          status: 'pending',
          audit: {
            query:
              "INSERT INTO promotions (code, discount_type, discount_value, audience) VALUES ('LAPSED15','pct',15,'lapsed-60d')",
            rowsAffected: 1,
          },
        },
        {
          id: 2,
          name: 'customers.lapsed',
          summary: `Find lapsed customers (last order > 60 days ago) — ${lapsed.length} matched`,
          argsPreview: 'customers.lapsed({ days: 60 })',
          kind: 'read',
          status: 'pending',
          readResult: (
            <span>
              Read returned <strong>{lapsed.length} customers</strong>:{' '}
              {lapsed
                .slice(0, 3)
                .map((c) => c.name)
                .join(', ')}
              {lapsed.length > 3 ? ` and ${lapsed.length - 3} more` : ''}.
            </span>
          ),
        },
        {
          id: 3,
          name: 'emails.draft_bulk',
          summary: `Draft re-engagement emails for ${lapsed.length} recipients`,
          argsPreview: `emails.draft_bulk({ promoCode: "LAPSED15", recipients: [${lapsed.length}] })`,
          kind: 'write',
          status: 'pending',
          audit: {
            query: `INSERT INTO email_drafts (customer_id, subject, body) — ${lapsed.length} rows`,
            rowsAffected: lapsed.length,
          },
        },
      ];
    },
    finalMessage: (n) => (
      <span>
        Done — <strong>{n}</strong> changes committed. The promo is live; drafts are saved but
        nothing has been sent.
      </span>
    ),
  },
  {
    id: 'top-spenders',
    prompt: 'Show me top spenders this quarter',
    buildPlan: () => {
      const top = topSpenders();
      return [
        {
          id: 1,
          name: 'orders.recent',
          summary: `Aggregate spend across last 90 days — ${top.length} customers ranked`,
          argsPreview: 'orders.recent({ days: 90, groupBy: "customerId", orderBy: "totalCents desc" })',
          kind: 'read',
          status: 'pending',
          readResult: (
            <span>
              Top spenders:{' '}
              {top.map((c, i) => (
                <span key={c.id}>
                  {i > 0 ? ', ' : ''}
                  <strong>{c.name}</strong>
                </span>
              ))}
              . No mutations were proposed; this is a read-only summary.
            </span>
          ),
        },
      ];
    },
    finalMessage: () => (
      <span>
        Read complete — no writes were planned, so nothing required confirmation. The result is in the
        transcript above.
      </span>
    ),
  },
  {
    id: 'tag-home',
    prompt: "Tag customers who bought home goods as 'home-buyer'",
    buildPlan: () => {
      const buyers = homeBuyers();
      return [
        {
          id: 1,
          name: 'customers.search',
          summary: `Find customers with orders containing category="home" — ${buyers.length} matched`,
          argsPreview: 'customers.search({ orderedCategoryIn: ["home"] })',
          kind: 'read',
          status: 'pending',
          readResult: (
            <span>
              Matched <strong>{buyers.length} customers</strong>:{' '}
              {buyers.map((b) => b.name).join(', ')}.
            </span>
          ),
        },
        {
          id: 2,
          name: 'customers.tag_bulk',
          summary: `Tag ${buyers.length} customers as "home-buyer"`,
          argsPreview: `customers.tag_bulk({ ids: [${buyers
            .map((b) => b.id)
            .join(', ')}], tag: "home-buyer" })`,
          kind: 'write',
          status: 'pending',
          audit: {
            query: `UPDATE customers SET tags = tags || ARRAY['home-buyer'] WHERE id IN (${buyers
              .map((b) => b.id)
              .join(', ')})`,
            rowsAffected: buyers.length,
          },
        },
      ];
    },
    finalMessage: (n) => (
      <span>
        Done — <strong>{n}</strong> change committed. Future segment queries can now filter on{' '}
        <code className="font-mono text-[0.85em]">tag = &quot;home-buyer&quot;</code>.
      </span>
    ),
  },
  {
    id: 'slow-products',
    prompt: "Find products that haven't sold in 30 days",
    buildPlan: () => {
      const slow = slowMovingProducts();
      return [
        {
          id: 1,
          name: 'products.list',
          summary: `Find products with zero sales in the last 30 days — ${slow.length} matched`,
          argsPreview: 'products.list({ noSalesSinceDays: 30 })',
          kind: 'read',
          status: 'pending',
          readResult: (
            <span>
              Slow movers:{' '}
              {slow.map((p, i) => (
                <span key={p.id}>
                  {i > 0 ? ', ' : ''}
                  <strong>{p.name}</strong>{' '}
                  <span className="font-mono text-[color:var(--color-text-faint)]">({p.sku})</span>
                </span>
              ))}
              . Consider a promotion or de-listing.
            </span>
          ),
        },
      ];
    },
    finalMessage: () => (
      <span>
        Read complete — three slow-moving SKUs surfaced. No changes were proposed; you decide the
        next move.
      </span>
    ),
  },
  {
    id: 'thank-vips',
    prompt: 'Send a thank-you email to all VIP customers',
    buildPlan: () => {
      const vips = vipCustomers();
      return [
        {
          id: 1,
          name: 'customers.search',
          summary: `Find VIPs (tag = "vip") — ${vips.length} matched`,
          argsPreview: 'customers.search({ tagIn: ["vip"] })',
          kind: 'read',
          status: 'pending',
          readResult: (
            <span>
              Found <strong>{vips.length} VIPs</strong>: {vips.map((v) => v.name).join(', ')}.
            </span>
          ),
        },
        {
          id: 2,
          name: 'emails.draft_bulk',
          summary: `Draft thank-you emails for ${vips.length} VIPs`,
          argsPreview: `emails.draft_bulk({ template: "thank-you-vip", recipients: [${vips.length}] })`,
          kind: 'write',
          status: 'pending',
          audit: {
            query: `INSERT INTO email_drafts (customer_id, subject, body) — ${vips.length} rows`,
            rowsAffected: vips.length,
          },
        },
      ];
    },
    finalMessage: (n) => (
      <span>
        Done — <strong>{n}</strong> change committed. The drafts wait in your outbox; review and
        send when you&rsquo;re ready.
      </span>
    ),
  },
];

// ──────────────────────────────────────────────────────────────────────────
// component
// ──────────────────────────────────────────────────────────────────────────

export function AiOperatorDemo() {
  const [transcript, setTranscript] = useState<Message[]>([]);
  const [plan, setPlan] = useState<Step[] | null>(null);
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [activePreset, setActivePreset] = useState<PresetId | null>(null);
  const [textareaValue, setTextareaValue] = useState('');
  const [showTypingHint, setShowTypingHint] = useState(false);

  const timeoutsRef = useRef<number[]>([]);
  const msgIdRef = useRef(0);
  const auditIdRef = useRef(0);
  const auditClockRef = useRef(0);
  const typingTimerRef = useRef<number | null>(null);

  const counts = useMemo(
    () => ({
      customers: SEED_CUSTOMERS.length,
      products: SEED_PRODUCTS.length,
      promotions: SEED_PROMOTIONS.length,
    }),
    [],
  );

  function clearTimers() {
    timeoutsRef.current.forEach((id) => window.clearTimeout(id));
    timeoutsRef.current = [];
    if (typingTimerRef.current !== null) {
      window.clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
  }

  useEffect(() => () => clearTimers(), []);

  function nextMsgId(): number {
    msgIdRef.current += 1;
    return msgIdRef.current;
  }

  function pushUser(text: string) {
    setTranscript((prev) => [...prev, { id: nextMsgId(), role: 'user', text }]);
  }
  function pushAssistant(text: ReactNode) {
    setTranscript((prev) => [...prev, { id: nextMsgId(), role: 'assistant', text }]);
  }
  function pushSystem(text: string) {
    setTranscript((prev) => [...prev, { id: nextMsgId(), role: 'system', text }]);
  }

  function pushAudit(query: string, rowsAffected: number) {
    auditIdRef.current += 1;
    auditClockRef.current += 1;
    setAuditLog((prev) => [
      ...prev,
      {
        id: auditIdRef.current,
        ts: stampAt(auditClockRef.current),
        query,
        rowsAffected,
      },
    ]);
  }

  function setStepStatus(stepIdx: number, status: StepStatus) {
    setPlan((prev) => {
      if (!prev) return prev;
      const next = prev.slice();
      next[stepIdx] = { ...next[stepIdx], status };
      return next;
    });
  }

  function fullReset() {
    clearTimers();
    setTranscript([]);
    setPlan(null);
    setPhase({ kind: 'idle' });
    setAuditLog([]);
    setActivePreset(null);
    setTextareaValue('');
    setShowTypingHint(false);
    msgIdRef.current = 0;
    auditIdRef.current = 0;
    auditClockRef.current = 0;
  }

  function runPreset(preset: Preset) {
    clearTimers();
    setTranscript([]);
    setPlan(null);
    setAuditLog([]);
    msgIdRef.current = 0;
    auditIdRef.current = 0;
    auditClockRef.current = 0;
    setActivePreset(preset.id);

    pushUser(preset.prompt);
    setPhase({ kind: 'planning' });

    const builtPlan = preset.buildPlan();

    // Plan rows fade in one at a time.
    builtPlan.forEach((_, i) => {
      timeoutsRef.current.push(
        window.setTimeout(() => setPlan(builtPlan.slice(0, i + 1)), 450 + i * 500),
      );
    });

    // After all rows are visible, advance to the first step.
    timeoutsRef.current.push(
      window.setTimeout(
        () => advanceTo(builtPlan, 0, preset),
        450 + builtPlan.length * 500 + 300,
      ),
    );
  }

  function advanceTo(currentPlan: Step[], idx: number, preset: Preset) {
    if (idx >= currentPlan.length) {
      // All steps done.
      const committed = currentPlan.filter(
        (s) => s.kind === 'write' && s.status === 'done',
      ).length;
      pushAssistant(preset.finalMessage(committed));
      setPhase({ kind: 'done', committed });
      return;
    }
    const step = currentPlan[idx];
    if (step.kind === 'write') {
      setPhase({ kind: 'awaiting_confirm', stepIdx: idx });
    } else {
      // Read steps auto-execute; no gate.
      setPhase({ kind: 'executing', stepIdx: idx });
      setStepStatus(idx, 'running');
      timeoutsRef.current.push(
        window.setTimeout(() => {
          setStepStatus(idx, 'done');
          if (step.readResult) {
            pushAssistant(step.readResult);
          }
          // Continue to next step, with the latest plan reference.
          setPlan((prev) => {
            const next = prev ? prev.slice() : currentPlan.slice();
            next[idx] = { ...next[idx], status: 'done' };
            timeoutsRef.current.push(
              window.setTimeout(() => advanceTo(next, idx + 1, preset), 450),
            );
            return next;
          });
        }, 1100),
      );
    }
  }

  function approveCurrent() {
    if (phase.kind !== 'awaiting_confirm') return;
    const idx = phase.stepIdx;
    const preset = PRESETS.find((p) => p.id === activePreset);
    if (!preset || !plan) return;
    const step = plan[idx];
    setPhase({ kind: 'executing', stepIdx: idx });
    setStepStatus(idx, 'running');
    timeoutsRef.current.push(
      window.setTimeout(() => {
        setStepStatus(idx, 'done');
        if (step.audit) {
          pushAudit(step.audit.query, step.audit.rowsAffected);
        }
        setPlan((prev) => {
          const next = prev ? prev.slice() : plan.slice();
          next[idx] = { ...next[idx], status: 'done' };
          timeoutsRef.current.push(
            window.setTimeout(() => advanceTo(next, idx + 1, preset), 400),
          );
          return next;
        });
      }, 1200),
    );
  }

  function rejectCurrent() {
    clearTimers();
    pushSystem('Plan rejected — no further changes committed.');
    setPhase({ kind: 'cancelled' });
  }

  function onTextareaChange(value: string) {
    setTextareaValue(value);
    if (typingTimerRef.current !== null) {
      window.clearTimeout(typingTimerRef.current);
      typingTimerRef.current = null;
    }
    if (value.trim().length === 0) {
      setShowTypingHint(false);
      return;
    }
    typingTimerRef.current = window.setTimeout(() => setShowTypingHint(true), 700);
  }

  const isInteractive = phase.kind === 'idle' || phase.kind === 'done' || phase.kind === 'cancelled';
  const currentStep =
    phase.kind === 'awaiting_confirm' || phase.kind === 'executing'
      ? plan?.[phase.stepIdx]
      : undefined;

  return (
    <div className="space-y-4">
      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-[color:var(--color-rule)] pb-3">
        <div>
          <h3 className="font-serif text-2xl font-semibold leading-tight">AI Operator</h3>
          <p className="text-[0.78rem] text-[color:var(--color-text-soft)] mt-0.5">
            Mock CMS · {counts.customers} customers · {counts.products} products ·{' '}
            {counts.promotions} promotions
          </p>
        </div>
        <button
          type="button"
          onClick={fullReset}
          className="text-[0.7rem] uppercase tracking-wider px-2.5 py-1 rounded border border-[color:var(--color-rule)] text-[color:var(--color-text-soft)] hover:bg-[color:var(--color-bg-soft)] focus:outline focus:outline-2 focus:outline-[color:var(--color-accent)] focus:outline-offset-2"
        >
          Reset console
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,4fr)_minmax(0,3fr)]">
        {/* ── LEFT: Quick prompts ───────────────────────────────── */}
        <aside className="rounded border border-[color:var(--color-rule)] bg-[color:var(--color-bg-soft)] p-3 flex flex-col gap-3">
          <div>
            <p className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-text-faint)] mb-2">
              Quick prompts
            </p>
            <ul className="space-y-1.5">
              {PRESETS.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => runPreset(p)}
                    disabled={!isInteractive}
                    aria-pressed={activePreset === p.id}
                    className={`w-full text-left text-[0.82rem] leading-snug rounded border px-2.5 py-2 transition-colors focus:outline focus:outline-2 focus:outline-[color:var(--color-accent)] focus:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      activePreset === p.id
                        ? 'border-[color:var(--color-accent)] bg-white'
                        : 'border-[color:var(--color-rule)] bg-white/70 hover:bg-white hover:border-[color:var(--color-accent)]'
                    }`}
                  >
                    {p.prompt}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-[color:var(--color-rule)] pt-3">
            <label
              htmlFor="ai-operator-textarea"
              className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-text-faint)] mb-1 block"
            >
              Or type your own
            </label>
            <textarea
              id="ai-operator-textarea"
              value={textareaValue}
              onChange={(e) => onTextareaChange(e.target.value)}
              rows={3}
              placeholder="Ask the operator something…"
              className="w-full rounded border border-[color:var(--color-rule)] bg-white px-2 py-1.5 text-[0.85rem] font-serif resize-none focus:outline focus:outline-2 focus:outline-[color:var(--color-accent)] focus:outline-offset-1"
            />
            <p
              role="status"
              aria-live="polite"
              className="text-[0.7rem] text-[color:var(--color-text-soft)] mt-1 min-h-4 italic"
            >
              {showTypingHint
                ? 'Scripted demo — pick a preset above to play a scenario.'
                : ' '}
            </p>
          </div>
        </aside>

        {/* ── CENTER: Transcript + confirmation ─────────────────── */}
        <section className="rounded border border-[color:var(--color-rule)] bg-white p-3 min-h-[28rem] flex flex-col gap-3">
          <p className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-text-faint)]">
            Transcript
          </p>
          <ol className="space-y-2 flex-1 min-h-0">
            {transcript.length === 0 && (
              <li className="italic text-sm text-[color:var(--color-text-faint)]">
                — pick a quick prompt to start a workflow —
              </li>
            )}
            {transcript.map((m) => (
              <li key={m.id}>
                {m.role === 'user' && (
                  <div className="rounded-lg bg-[color:var(--color-bg-soft)] border border-[color:var(--color-rule)] px-3 py-2 text-[0.9rem]">
                    <p className="text-[0.65rem] uppercase tracking-wider text-[color:var(--color-text-faint)] mb-0.5">
                      you
                    </p>
                    <p className="font-serif leading-snug">{m.text}</p>
                  </div>
                )}
                {m.role === 'assistant' && (
                  <div className="rounded-lg bg-white border border-[color:var(--color-pine)] px-3 py-2 text-[0.9rem]">
                    <p className="text-[0.65rem] uppercase tracking-wider text-[color:var(--color-pine)] mb-0.5 font-semibold">
                      AI Operator
                    </p>
                    <div className="font-serif leading-snug">{m.text}</div>
                  </div>
                )}
                {m.role === 'system' && (
                  <p className="text-[0.78rem] italic text-red-700 px-2">{m.text}</p>
                )}
              </li>
            ))}
          </ol>

          {/* Narrow live region — planning indicator only */}
          <div role="status" aria-live="polite" className="min-h-5">
            {phase.kind === 'planning' && (
              <p className="text-[0.78rem] text-[color:var(--color-text-faint)] flex items-center gap-2">
                <Spinner /> planning…
              </p>
            )}
            {phase.kind === 'executing' && currentStep && (
              <p className="text-[0.82rem] text-[color:var(--color-pine)] flex items-center gap-2">
                <Spinner /> running{' '}
                <span className="font-mono">{currentStep.name}</span>…
              </p>
            )}
          </div>

          {/* Plan card */}
          {plan && plan.length > 0 && (
            <div className="rounded border border-[color:var(--color-rule)] bg-[color:var(--color-bg-soft)] p-2.5">
              <p className="text-[0.65rem] uppercase tracking-wider text-[color:var(--color-text-faint)] mb-1">
                Plan
              </p>
              <ol className="space-y-1 text-[0.84rem]">
                {plan.map((s) => (
                  <li key={s.id} className="flex items-start gap-2">
                    <span className="mt-0.5 shrink-0">
                      <StatusGlyph status={s.status} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span
                        className={
                          s.status === 'done'
                            ? 'text-[color:var(--color-pine)]'
                            : ''
                        }
                      >
                        {s.id}. {s.summary}
                      </span>
                      <span className="ml-1.5 inline-block px-1.5 py-0.5 rounded-full text-[0.66rem] uppercase tracking-wider bg-white border border-[color:var(--color-rule)] text-[color:var(--color-text-soft)] font-mono">
                        {s.name}
                      </span>
                      <KindPill kind={s.kind} />
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Confirmation panel — NOT inside aria-live region */}
          {phase.kind === 'awaiting_confirm' && currentStep && (
            <ConfirmCard
              title={currentStep.summary}
              detail={
                <>
                  <p className="font-mono text-[0.82rem] break-words">
                    {currentStep.argsPreview}
                  </p>
                  {currentStep.audit && (
                    <p className="text-[0.78rem] text-[color:var(--color-text-soft)] mt-1">
                      Will affect{' '}
                      <strong>
                        {currentStep.audit.rowsAffected} row
                        {currentStep.audit.rowsAffected === 1 ? '' : 's'}
                      </strong>
                      .
                    </p>
                  )}
                </>
              }
              onApprove={approveCurrent}
              onReject={rejectCurrent}
            />
          )}

          {phase.kind === 'cancelled' && (
            <div className="rounded border border-red-700 bg-red-50 p-2.5">
              <p className="text-[0.7rem] uppercase tracking-wider text-red-700 font-semibold">
                Cancelled
              </p>
              <p className="text-[0.85rem] mt-1">
                The graph stopped at the interrupt. Earlier committed steps remain in the audit log
                — they can&rsquo;t be undone from the AI side.
              </p>
            </div>
          )}

          {phase.kind === 'done' && (
            <div className="rounded border border-[color:var(--color-pine)] bg-[color:var(--color-bg-soft)] p-2.5">
              <p className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-pine)] font-semibold">
                Workflow complete
              </p>
              <p className="text-[0.85rem] mt-1">
                {phase.committed} mutation{phase.committed === 1 ? '' : 's'} committed. See the
                audit log on the right.
              </p>
            </div>
          )}
        </section>

        {/* ── RIGHT: Audit log ───────────────────────────────────── */}
        <aside className="rounded border border-[color:var(--color-rule)] bg-[color:var(--color-code-bg)] text-[color:var(--color-code-text)] p-3 font-mono text-xs min-h-[28rem]">
          <p className="text-[color:var(--color-code-soft)] mb-2 flex items-center justify-between">
            <span>{'>'} audit log</span>
            <span className="opacity-60">
              {auditLog.length} entr{auditLog.length === 1 ? 'y' : 'ies'}
            </span>
          </p>
          {auditLog.length === 0 && (
            <p className="opacity-50 italic">— no mutations committed yet —</p>
          )}
          <ol className="space-y-2">
            {auditLog.map((a) => (
              <li key={a.id} className="leading-5">
                <p className="text-[color:var(--color-accent)] break-words">
                  <span className="opacity-60">[{a.ts}]</span> {a.query}
                </p>
                <p className="opacity-60 pl-2 text-[0.7rem]">
                  → {a.rowsAffected} row{a.rowsAffected === 1 ? '' : 's'} affected · by AI Operator
                </p>
              </li>
            ))}
          </ol>
        </aside>
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
  detail: ReactNode;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="rounded border-2 border-[color:var(--color-accent)] bg-[color:var(--color-bg-soft)] p-3 space-y-2">
      <p className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-pine)] font-semibold">
        Confirmation required
      </p>
      <p className="font-serif text-[0.95rem] leading-snug">{title}</p>
      <div className="text-[0.85rem]">{detail}</div>
      <div className="flex flex-wrap gap-2 pt-1">
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

function KindPill({ kind }: { kind: StepKind }) {
  const isWrite = kind === 'write';
  return (
    <span
      className={`ml-1 inline-block px-1.5 py-0.5 rounded-full text-[0.62rem] uppercase tracking-wider font-semibold ${
        isWrite
          ? 'bg-[color:var(--color-accent)] text-white'
          : 'bg-white border border-[color:var(--color-rule)] text-[color:var(--color-text-soft)]'
      }`}
    >
      {kind}
    </span>
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
    return (
      <span className="text-[color:var(--color-pine)] font-bold" aria-label="done">
        ✓
      </span>
    );
  }
  if (status === 'running') return <Spinner />;
  return (
    <span className="text-[color:var(--color-text-faint)]" aria-label="pending">
      ○
    </span>
  );
}
