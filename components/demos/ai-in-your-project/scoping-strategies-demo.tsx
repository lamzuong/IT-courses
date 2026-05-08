'use client';
import { useEffect, useMemo, useState } from 'react';
import { useTimeoutQueue } from '@/lib/use-timeout-queue';

type Domain = 'billing' | 'support' | 'schedule' | 'inv' | 'report';

type Tool = { name: string; domain: Domain };

const CATALOG: Tool[] = [
  // Billing — 10
  { name: 'billing.refunds.create',         domain: 'billing' },
  { name: 'billing.charges.create',         domain: 'billing' },
  { name: 'billing.charges.list',           domain: 'billing' },
  { name: 'billing.invoices.send',          domain: 'billing' },
  { name: 'billing.invoices.list',          domain: 'billing' },
  { name: 'billing.subscriptions.update',   domain: 'billing' },
  { name: 'billing.payment_methods.add',    domain: 'billing' },
  { name: 'billing.payment_methods.list',   domain: 'billing' },
  { name: 'billing.disputes.list',          domain: 'billing' },
  { name: 'billing.contact_email',          domain: 'billing' },
  // Support — 10
  { name: 'support.tickets.create',         domain: 'support' },
  { name: 'support.tickets.list',           domain: 'support' },
  { name: 'support.tickets.assign',         domain: 'support' },
  { name: 'support.tickets.close',          domain: 'support' },
  { name: 'support.tickets.byId',           domain: 'support' },
  { name: 'support.customers.search',       domain: 'support' },
  { name: 'support.customers.byId',         domain: 'support' },
  { name: 'support.notes.add',              domain: 'support' },
  { name: 'support.escalate',               domain: 'support' },
  { name: 'support.csat.send',              domain: 'support' },
  // Scheduling — 10
  { name: 'schedule.calendar.list',         domain: 'schedule' },
  { name: 'schedule.calendar.create',       domain: 'schedule' },
  { name: 'schedule.calendar.update',       domain: 'schedule' },
  { name: 'schedule.calendar.delete',       domain: 'schedule' },
  { name: 'schedule.availability.check',    domain: 'schedule' },
  { name: 'schedule.meetings.send_invite',  domain: 'schedule' },
  { name: 'schedule.meetings.cancel',       domain: 'schedule' },
  { name: 'schedule.time_off.request',      domain: 'schedule' },
  { name: 'schedule.holidays.list',         domain: 'schedule' },
  { name: 'schedule.rooms.list',            domain: 'schedule' },
  // Inventory — 10
  { name: 'inv.products.list',              domain: 'inv' },
  { name: 'inv.products.search',            domain: 'inv' },
  { name: 'inv.products.byId',              domain: 'inv' },
  { name: 'inv.products.create',            domain: 'inv' },
  { name: 'inv.stock.byProduct',            domain: 'inv' },
  { name: 'inv.stock.adjust',               domain: 'inv' },
  { name: 'inv.suppliers.list',             domain: 'inv' },
  { name: 'inv.suppliers.byId',             domain: 'inv' },
  { name: 'inv.purchase_orders.create',     domain: 'inv' },
  { name: 'inv.audit.log',                  domain: 'inv' },
  // Reporting — 10
  { name: 'report.daily',                   domain: 'report' },
  { name: 'report.weekly',                  domain: 'report' },
  { name: 'report.monthly',                 domain: 'report' },
  { name: 'report.exports.csv',             domain: 'report' },
  { name: 'report.charts.spend',            domain: 'report' },
  { name: 'report.charts.users',            domain: 'report' },
  { name: 'report.dashboards.list',         domain: 'report' },
  { name: 'report.kpis.fetch',              domain: 'report' },
  { name: 'report.alerts.list',             domain: 'report' },
  { name: 'report.budgets.compare',         domain: 'report' },
];

const DOMAIN_LABEL: Record<Domain, string> = {
  billing: 'Billing',
  support: 'Support',
  schedule: 'Scheduling',
  inv: 'Inventory',
  report: 'Reporting',
};

const TASKS: { id: string; label: string; domain: Domain; prompt: string }[] = [
  { id: 'refund',  label: 'Refund a charge',          domain: 'billing',  prompt: "Refund customer 7041's last charge of $48 from yesterday." },
  { id: 'ticket',  label: 'Open a support ticket',    domain: 'support',  prompt: 'Open a P2 ticket about the search filter dropping the date range.' },
  { id: 'meeting', label: 'Schedule a meeting',       domain: 'schedule', prompt: 'Find a 30-minute slot tomorrow with Ana and book a meeting room.' },
  { id: 'product', label: 'Find products under $50',  domain: 'inv',      prompt: 'List in-stock products under $50 in the home category.' },
];

type Strategy = 'all' | 'scope' | 'retrieval' | 'subagents';

const TOKENS_PER_TOOL = 60; // rough mean cost of a tool definition in the prompt

// Deterministic but task-aware "similarity": tools in the same domain as the task
// score high; others score lower. A few near-domain tools also score moderately.
function similarityScore(tool: Tool, taskDomain: Domain): number {
  const seed = (tool.name.length * 13 + tool.name.charCodeAt(0)) % 100;
  const noise = seed / 100; // 0..1
  if (tool.domain === taskDomain) {
    return 0.55 + 0.4 * noise; // 0.55 .. 0.95
  }
  // billing ↔ support and schedule ↔ inv get small affinity bumps
  const adjacent =
    (taskDomain === 'billing' && tool.domain === 'support') ||
    (taskDomain === 'support' && tool.domain === 'billing') ||
    (taskDomain === 'schedule' && tool.domain === 'inv') ||
    (taskDomain === 'inv' && tool.domain === 'schedule');
  if (adjacent) return 0.2 + 0.2 * noise; // 0.20 .. 0.40
  return 0.05 + 0.1 * noise; // 0.05 .. 0.15
}

const ROUTER_TOOLS: { name: string; domain: Domain }[] = [
  { name: 'router.delegate.billing',  domain: 'billing'  },
  { name: 'router.delegate.support',  domain: 'support'  },
  { name: 'router.delegate.schedule', domain: 'schedule' },
  { name: 'router.delegate.inv',      domain: 'inv'      },
  { name: 'router.delegate.report',   domain: 'report'   },
];

export function ScopingStrategiesDemo() {
  const [strategy, setStrategy] = useState<Strategy>('all');
  const [taskId, setTaskId] = useState<string>(TASKS[0].id);
  const [phase, setPhase] = useState<'idle' | 'running' | 'done'>('idle');
  const [boundNames, setBoundNames] = useState<Set<string>>(new Set());
  const [scoredCount, setScoredCount] = useState(0);
  const [routedTo, setRoutedTo] = useState<Domain | null>(null);
  const [scores, setScores] = useState<Map<string, number>>(new Map());
  const { schedule, clear } = useTimeoutQueue();

  const task = TASKS.find((t) => t.id === taskId)!;

  // Reset run state when strategy or task changes.
  useEffect(() => {
    clear();
    setPhase('idle');
    setBoundNames(new Set());
    setScoredCount(0);
    setRoutedTo(null);
    setScores(new Map());
  }, [strategy, taskId, clear]);

  function run() {
    clear();
    setPhase('running');
    setBoundNames(new Set());
    setScoredCount(0);
    setRoutedTo(null);
    setScores(new Map());

    if (strategy === 'all') {
      // Bind everything immediately, no animation.
      setBoundNames(new Set(CATALOG.map((t) => t.name)));
      setPhase('done');
      return;
    }

    if (strategy === 'scope') {
      // 350ms beat then bind the task's domain (10 tools).
      schedule(() => {
        const next = new Set(CATALOG.filter((t) => t.domain === task.domain).map((t) => t.name));
        setBoundNames(next);
        setPhase('done');
      }, 350);
      return;
    }

    if (strategy === 'retrieval') {
      // Score each tool with a small stagger; then keep the top 10.
      const ranked = CATALOG.map((t) => ({ tool: t, score: similarityScore(t, task.domain) }))
        .sort((a, b) => b.score - a.score);
      const newScores = new Map(ranked.map((r) => [r.tool.name, r.score]));
      ranked.forEach((_r, i) => {
        schedule(() => {
          setScoredCount(i + 1);
          // Reveal the score on the cell as it's computed (in ranked order).
          setScores((prev) => {
            const next = new Map(prev);
            next.set(ranked[i].tool.name, newScores.get(ranked[i].tool.name)!);
            return next;
          });
        }, 35 * (i + 1));
      });
      schedule(() => {
        const top = new Set(ranked.slice(0, 10).map((r) => r.tool.name));
        setBoundNames(top);
        setPhase('done');
      }, 35 * (CATALOG.length + 4));
      return;
    }

    if (strategy === 'subagents') {
      // Router sees 5 delegate tools, picks the matching one, then the sub-agent's 10 tools bind.
      schedule(() => {
        setRoutedTo(task.domain);
      }, 400);
      schedule(() => {
        const subTools = new Set(CATALOG.filter((t) => t.domain === task.domain).map((t) => t.name));
        setBoundNames(subTools);
        setPhase('done');
      }, 900);
      return;
    }
  }

  const boundCount = boundNames.size;
  const tokenSpend = useMemo(() => {
    if (strategy === 'all') return CATALOG.length * TOKENS_PER_TOOL;
    if (strategy === 'scope') return phase === 'done' ? boundCount * TOKENS_PER_TOOL : 0;
    if (strategy === 'retrieval') return phase === 'done' ? 10 * TOKENS_PER_TOOL : 0;
    if (strategy === 'subagents') {
      // Router pays 5 delegates of cost; sub-agent pays its own 10.
      const router = ROUTER_TOOLS.length * TOKENS_PER_TOOL;
      const sub = phase === 'done' ? 10 * TOKENS_PER_TOOL : 0;
      return router + sub;
    }
    return 0;
  }, [strategy, phase, boundCount]);

  const allCost = CATALOG.length * TOKENS_PER_TOOL;
  const savingsPct = allCost ? Math.round((1 - tokenSpend / allCost) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(
          [
            { id: 'all',       label: 'Bind all 50' },
            { id: 'scope',     label: 'Scope per session' },
            { id: 'retrieval', label: 'Tool retrieval' },
            { id: 'subagents', label: 'Sub-agents' },
          ] as { id: Strategy; label: string }[]
        ).map((opt) => {
          const active = strategy === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setStrategy(opt.id)}
              className={`text-[0.78rem] uppercase tracking-wider px-3 py-1.5 rounded-full font-semibold border transition-colors ${
                active
                  ? 'bg-[color:var(--color-accent)] text-white border-[color:var(--color-accent)]'
                  : 'bg-white text-[color:var(--color-text)] border-[color:var(--color-border)] hover:border-[color:var(--color-accent)]'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-text-faint)]">User asks:</span>
        {TASKS.map((t) => {
          const active = taskId === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTaskId(t.id)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                active
                  ? 'border-[color:var(--color-accent)] bg-[color:var(--color-bg-soft)] text-[color:var(--color-accent)] font-semibold'
                  : 'border-[color:var(--color-border)] bg-white hover:border-[color:var(--color-accent)]'
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="rounded border border-[color:var(--color-border)] bg-white px-3 py-2 font-serif text-[0.92rem]">
        <span className="text-[0.68rem] uppercase tracking-wider text-[color:var(--color-text-faint)] block mb-1">
          Prompt
        </span>
        {task.prompt}
      </div>

      <button
        type="button"
        onClick={run}
        disabled={phase === 'running'}
        className="text-[0.78rem] uppercase tracking-wider px-3 py-1.5 rounded-full bg-[color:var(--color-accent)] text-white font-semibold disabled:opacity-50"
      >
        {phase === 'running' ? 'Binding…' : 'Bind tools for this turn'}
      </button>

      {/* Sub-agent router visualisation */}
      {strategy === 'subagents' && (
        <div className="rounded border border-[color:var(--color-border)] bg-[color:var(--color-bg-soft)] p-3">
          <p className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-text-faint)] mb-2">
            Router agent — 5 delegate tools
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ROUTER_TOOLS.map((rt) => {
              const picked = routedTo === rt.domain;
              return (
                <span
                  key={rt.name}
                  className={`text-[0.7rem] font-mono px-2 py-1 rounded border transition-colors ${
                    picked
                      ? 'bg-[color:var(--color-accent)] text-white border-[color:var(--color-accent)] font-semibold'
                      : 'bg-white text-[color:var(--color-text-soft)] border-[color:var(--color-border)]'
                  }`}
                >
                  {rt.name}
                </span>
              );
            })}
          </div>
          {routedTo && (
            <p className="mt-2 text-xs text-[color:var(--color-text-soft)]">
              Router picked <code className="font-mono">router.delegate.{routedTo}</code> →
              activating the {DOMAIN_LABEL[routedTo]} sub-agent's 10 tools.
            </p>
          )}
        </div>
      )}

      <div>
        <p className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-text-faint)] mb-2">
          Tool catalog ({CATALOG.length} tools) — bound for this turn:{' '}
          <strong className="text-[color:var(--color-accent)]">{boundCount}</strong>
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-1.5">
          {CATALOG.map((tool) => {
            const bound = boundNames.has(tool.name);
            const score = scores.get(tool.name);
            return (
              <div
                key={tool.name}
                className={`text-[0.66rem] font-mono px-2 py-1 rounded border leading-tight transition-all ${
                  bound
                    ? 'bg-[color:var(--color-bg-soft)] border-[color:var(--color-accent)] text-[color:var(--color-text)]'
                    : phase === 'idle' && strategy !== 'all'
                      ? 'bg-white border-[color:var(--color-border)] text-[color:var(--color-text-soft)]'
                      : 'bg-white border-[color:var(--color-border)] text-[color:var(--color-text-faint)] opacity-50'
                }`}
                title={DOMAIN_LABEL[tool.domain]}
              >
                <span className="block truncate">{tool.name}</span>
                {strategy === 'retrieval' && score !== undefined && (
                  <span
                    className={`block text-[0.6rem] mt-0.5 ${
                      bound ? 'text-[color:var(--color-accent)] font-semibold' : 'text-[color:var(--color-text-faint)]'
                    }`}
                  >
                    sim {score.toFixed(2)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        {strategy === 'retrieval' && phase === 'running' && (
          <p className="mt-2 text-xs italic text-[color:var(--color-text-soft)]">
            Scoring tools against the prompt… {scoredCount}/{CATALOG.length}
          </p>
        )}
      </div>

      <div className="rounded border border-[color:var(--color-border)] bg-[color:var(--color-bg-soft)] p-3 text-sm">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-text-faint)]">
              Tools sent to model
            </p>
            <p className="text-base font-semibold mt-0.5">
              {strategy === 'subagents' && phase === 'done'
                ? `${ROUTER_TOOLS.length} (router) + ${boundCount} (sub-agent)`
                : `${strategy === 'all' || phase === 'done' ? boundCount : 0} of ${CATALOG.length}`}
            </p>
          </div>
          <div>
            <p className="text-[0.7rem] uppercase tracking-wider text-[color:var(--color-text-faint)]">
              ~Prompt tokens for tool defs
            </p>
            <p className="text-base font-semibold mt-0.5">
              {tokenSpend.toLocaleString()}{' '}
              {strategy !== 'all' && phase === 'done' && (
                <span className="text-xs font-normal text-[color:var(--color-text-soft)]">
                  ({savingsPct}% lower than bind-all)
                </span>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
