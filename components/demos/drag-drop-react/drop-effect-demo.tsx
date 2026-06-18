'use client';
import { useState } from 'react';

type EffectAllowed = 'none' | 'copy' | 'move' | 'link' | 'copyMove' | 'copyLink' | 'linkMove' | 'all';
type DropEffect = 'none' | 'copy' | 'move' | 'link';

const ALLOWED: EffectAllowed[] = ['none', 'copy', 'move', 'link', 'copyMove', 'copyLink', 'linkMove', 'all'];
const EFFECTS: DropEffect[] = ['none', 'copy', 'move', 'link'];

// matrix: which dropEffect values are accepted by each effectAllowed?
function compatible(allowed: EffectAllowed, effect: DropEffect): boolean {
  if (effect === 'none') return false;
  if (allowed === 'none') return false;
  if (allowed === 'all') return true;
  if (allowed === 'copyMove') return effect === 'copy' || effect === 'move';
  if (allowed === 'copyLink') return effect === 'copy' || effect === 'link';
  if (allowed === 'linkMove') return effect === 'link' || effect === 'move';
  return allowed === effect;
}

export function DropEffectDemo() {
  const [allowed, setAllowed] = useState<EffectAllowed>('copyMove');
  const [effect, setEffect] = useState<DropEffect>('copy');
  const [last, setLast] = useState<string | null>(null);
  const [over, setOver] = useState(false);

  const ok = compatible(allowed, effect);

  function onDragStart(e: React.DragEvent) {
    e.dataTransfer.setData('text/plain', 'token');
    e.dataTransfer.effectAllowed = allowed;
    setLast(null);
  }
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = effect;
    setOver(true);
  }
  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setLast(`drop fired with effect: ${effect}`);
    setOver(false);
  }
  function onDragEnd() {
    if (!last) setLast(`drop suppressed (effects didn't match)`);
  }

  return (
    <div className="grid md:grid-cols-[1fr_220px] gap-4">
      <div className="space-y-3">
        <div
          draggable
          onDragStart={onDragStart}
          onDragEnd={onDragEnd}
          className="rounded border border-[color:var(--color-border)] bg-white px-4 py-3 cursor-grab active:cursor-grabbing select-none inline-block"
        >
          <p className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)]">Source</p>
          <p className="font-serif text-lg">drag me</p>
          <p className="font-mono text-[0.7rem] text-[color:var(--color-text-soft)] mt-1">
            effectAllowed = &quot;{allowed}&quot;
          </p>
        </div>
        <div
          onDragOver={onDragOver}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
          className={`rounded border-2 border-dashed p-5 transition ${over ? 'border-[color:var(--color-accent)] bg-[color:var(--color-bg-soft)]' : 'border-[color:var(--color-border)]'}`}
        >
          <p className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)]">Target</p>
          <p className="font-serif text-lg">drop here</p>
          <p className="font-mono text-[0.7rem] text-[color:var(--color-text-soft)] mt-1">
            dropEffect = &quot;{effect}&quot;
          </p>
        </div>
        <div role="status" aria-live="polite" className="font-serif italic text-sm text-[color:var(--color-text-soft)] min-h-5">
          {last ?? 'Watch the cursor change as you drag.'}
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)] block mb-1">effectAllowed (source)</span>
          <select
            value={allowed}
            onChange={(e) => setAllowed(e.target.value as EffectAllowed)}
            className="w-full rounded border border-[color:var(--color-border)] bg-white px-2 py-1.5 font-mono text-xs"
          >
            {ALLOWED.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)] block mb-1">dropEffect (target)</span>
          <select
            value={effect}
            onChange={(e) => setEffect(e.target.value as DropEffect)}
            className="w-full rounded border border-[color:var(--color-border)] bg-white px-2 py-1.5 font-mono text-xs"
          >
            {EFFECTS.map((e) => <option key={e} value={e}>{e}</option>)}
          </select>
        </label>
        <div className={`rounded border p-2.5 text-xs leading-relaxed ${ok ? 'border-[color:var(--color-accent)] bg-[color:var(--color-bg-soft)] text-[color:var(--color-accent)]' : 'border-[color:var(--color-pine)] bg-white text-[color:var(--color-pine)]'}`}>
          <span className="font-semibold">{ok ? '✓ compatible' : '✗ incompatible'}</span>
          <br />
          {ok ? 'Drop will fire. Cursor shows the effect.' : 'Browser shows a "no entry" cursor; drop is suppressed.'}
        </div>
      </div>
    </div>
  );
}
