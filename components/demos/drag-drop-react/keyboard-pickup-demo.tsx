'use client';
import { useEffect, useRef, useState } from 'react';

const SEED = ['Buy groceries', 'Pick up laundry', 'Call mom', 'Ship the PR'];

export function KeyboardPickupDemo() {
  const [items, setItems] = useState(SEED);
  const [picked, setPicked] = useState<number | null>(null);
  const [origin, setOrigin] = useState<number | null>(null);
  const [status, setStatus] = useState('Tab to an item, then press Space to pick it up.');
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function pick(idx: number) {
    setPicked(idx);
    setOrigin(idx);
    setStatus(`Picked up "${items[idx]}". Use ↑/↓ to move, Space to drop, Escape to cancel.`);
  }

  function move(delta: number) {
    if (picked === null) return;
    const target = Math.max(0, Math.min(items.length - 1, picked + delta));
    if (target === picked) return;
    setItems((cur) => {
      const next = [...cur];
      const [m] = next.splice(picked, 1);
      next.splice(target, 0, m);
      return next;
    });
    setPicked(target);
    setStatus(`Moved "${items[picked]}" to position ${target + 1} of ${items.length}.`);
  }

  function drop() {
    if (picked === null) return;
    setStatus(`Dropped "${items[picked]}" at position ${picked + 1}.`);
    const dropped = picked;
    setPicked(null);
    setOrigin(null);
    requestAnimationFrame(() => refs.current[dropped]?.focus());
  }

  function cancel() {
    if (picked === null || origin === null) return;
    setItems((cur) => {
      const next = [...cur];
      const [m] = next.splice(picked, 1);
      next.splice(origin, 0, m);
      return next;
    });
    setStatus(`Movement cancelled. "${items[picked]}" returned to position ${origin + 1}.`);
    const orig = origin;
    setPicked(null);
    setOrigin(null);
    requestAnimationFrame(() => refs.current[orig]?.focus());
  }

  useEffect(() => {
    if (picked === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); drop(); }
      else if (e.key === 'Escape') { e.preventDefault(); cancel(); }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [picked, items]);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <ol className="space-y-1.5" aria-label="Sortable list">
        {items.map((label, i) => (
          <li key={label}>
            <button
              ref={(el) => { refs.current[i] = el; }}
              type="button"
              aria-roledescription="sortable item"
              aria-pressed={picked === i}
              onKeyDown={(e) => { if (picked === null && (e.key === ' ' || e.key === 'Enter')) { e.preventDefault(); pick(i); } }}
              className={`w-full text-left rounded border px-3 py-2 font-serif transition focus-visible:outline-2 focus-visible:outline focus-visible:outline-[color:var(--color-link)] focus-visible:outline-offset-2 ${
                picked === i
                  ? 'border-[color:var(--color-accent)] bg-[color:var(--color-bg-soft)] shadow-sm'
                  : 'border-[color:var(--color-border)] bg-white hover:border-[color:var(--color-text-soft)]'
              }`}
            >
              <span className="font-mono text-xs text-[color:var(--color-text-faint)] mr-2">{String(i + 1).padStart(2, '0')}</span>
              {label}
              {picked === i && <span className="ml-2 text-xs uppercase tracking-wider text-[color:var(--color-accent)]">picked</span>}
            </button>
          </li>
        ))}
      </ol>
      <div>
        <p className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)] mb-2">aria-live announcer</p>
        <div role="status" aria-live="assertive" className="rounded border border-[color:var(--color-border)] bg-white p-4 font-serif italic text-sm min-h-32">
          {status}
        </div>
        <p className="text-xs text-[color:var(--color-text-soft)] mt-3 leading-relaxed">
          Tab into the list, then: <kbd className="font-mono text-[0.78em] bg-[color:var(--color-bg-soft)] border border-[color:var(--color-border)] rounded px-1">Space</kbd> pick · <kbd className="font-mono text-[0.78em] bg-[color:var(--color-bg-soft)] border border-[color:var(--color-border)] rounded px-1">↑↓</kbd> move · <kbd className="font-mono text-[0.78em] bg-[color:var(--color-bg-soft)] border border-[color:var(--color-border)] rounded px-1">Space</kbd> drop · <kbd className="font-mono text-[0.78em] bg-[color:var(--color-bg-soft)] border border-[color:var(--color-border)] rounded px-1">Esc</kbd> cancel.
        </p>
      </div>
    </div>
  );
}
