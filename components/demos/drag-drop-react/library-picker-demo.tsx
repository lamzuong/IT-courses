'use client';
import { useState } from 'react';

type Mark = 'yes' | 'no' | 'partial';
type NeedKey =
  | 'touch'
  | 'keyboard'
  | 'sortable'
  | 'multiContainer'
  | 'freeForm2D'
  | 'animations'
  | 'smallBundle'
  | 'maintained'
  | 'gridLayout';

type Library = {
  name: string;
  npm: string;
  blurb: string;
  caps: Record<NeedKey, Mark>;
  notes: Partial<Record<NeedKey, string>>;
};

const NEEDS: { key: NeedKey; label: string }[] = [
  { key: 'touch',          label: 'Touch / mobile' },
  { key: 'keyboard',       label: 'Keyboard a11y' },
  { key: 'sortable',       label: 'Sortable lists' },
  { key: 'multiContainer', label: 'Multi-container drag' },
  { key: 'freeForm2D',     label: 'Free-form 2D drag' },
  { key: 'animations',     label: 'Smooth animations' },
  { key: 'smallBundle',    label: 'Small bundle (< 25kb)' },
  { key: 'maintained',     label: 'Actively maintained' },
  { key: 'gridLayout',     label: 'Dashboard grid layout' },
];

const LIBRARIES: Library[] = [
  {
    name: '@dnd-kit',
    npm: '@dnd-kit/core',
    blurb: 'Hooks-first, modular, accessible by design.',
    caps: {
      touch: 'yes', keyboard: 'yes', sortable: 'yes', multiContainer: 'yes',
      freeForm2D: 'yes', animations: 'yes', smallBundle: 'yes', maintained: 'yes',
      gridLayout: 'no',
    },
    notes: { sortable: 'via @dnd-kit/sortable' },
  },
  {
    name: 'react-dnd',
    npm: 'react-dnd',
    blurb: 'Older but stable. HOC-heavy API and a separate touch backend.',
    caps: {
      touch: 'partial', keyboard: 'no', sortable: 'yes', multiContainer: 'yes',
      freeForm2D: 'yes', animations: 'partial', smallBundle: 'no', maintained: 'yes',
      gridLayout: 'no',
    },
    notes: {
      touch: 'requires a separate backend',
      keyboard: 'no built-in keyboard story',
      smallBundle: '~50kb with a backend',
    },
  },
  {
    name: 'react-beautiful-dnd',
    npm: 'react-beautiful-dnd',
    blurb: 'Once the gold standard. Now archived; do not start new projects with it.',
    caps: {
      touch: 'yes', keyboard: 'yes', sortable: 'yes', multiContainer: 'yes',
      freeForm2D: 'no', animations: 'yes', smallBundle: 'partial', maintained: 'no',
      gridLayout: 'no',
    },
    notes: { maintained: 'archived 2024 — breaks in concurrent React' },
  },
  {
    name: 'react-grid-layout',
    npm: 'react-grid-layout',
    blurb: 'Specialized: dashboard tile grids only.',
    caps: {
      touch: 'yes', keyboard: 'no', sortable: 'no', multiContainer: 'no',
      freeForm2D: 'no', animations: 'partial', smallBundle: 'partial', maintained: 'yes',
      gridLayout: 'yes',
    },
    notes: {
      sortable: 'not its purpose',
      keyboard: 'no built-in keyboard story',
    },
  },
];

function MarkGlyph({ m }: { m: Mark }) {
  if (m === 'yes')     return <span className="text-[color:var(--color-accent)] font-bold">✓</span>;
  if (m === 'no')      return <span className="text-[color:var(--color-text-faint)] font-bold opacity-60">✗</span>;
  return <span className="text-[color:var(--color-pine)] font-bold">△</span>;
}

function score(lib: Library, selected: Set<NeedKey>): { ok: boolean; missing: NeedKey[]; partials: NeedKey[] } {
  const missing: NeedKey[] = [];
  const partials: NeedKey[] = [];
  for (const k of selected) {
    const m = lib.caps[k];
    if (m === 'no') missing.push(k);
    else if (m === 'partial') partials.push(k);
  }
  return { ok: missing.length === 0, missing, partials };
}

export function LibraryPickerDemo() {
  const [selected, setSelected] = useState<Set<NeedKey>>(new Set(['touch', 'keyboard']));

  function toggle(k: NeedKey) {
    setSelected((cur) => {
      const next = new Set(cur);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
  }

  const scored = LIBRARIES.map((lib) => ({ lib, ...score(lib, selected) }));
  const fits = scored.filter((s) => s.ok && s.lib.caps.maintained !== 'no');
  const recommended = fits.length > 0
    ? fits.sort((a, b) => a.partials.length - b.partials.length)[0]?.lib
    : null;

  return (
    <div className="grid md:grid-cols-[200px_1fr] gap-5">
      <div>
        <p className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)] mb-2">My needs</p>
        <ul className="space-y-1.5">
          {NEEDS.map((n) => (
            <li key={n.key}>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={selected.has(n.key)}
                  onChange={() => toggle(n.key)}
                />
                <span>{n.label}</span>
              </label>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setSelected(new Set())}
          className="mt-3 text-[0.72rem] uppercase tracking-wider text-[color:var(--color-text-soft)] hover:text-[color:var(--color-ink)] underline-offset-2 hover:underline"
        >
          clear
        </button>
      </div>

      <div className="space-y-2.5">
        {scored.map(({ lib, ok, missing, partials }) => {
          const isRecommended = recommended === lib;
          const dimmed = !ok || lib.caps.maintained === 'no';
          return (
            <div
              key={lib.name}
              className={`rounded border p-3 transition ${
                isRecommended
                  ? 'border-[color:var(--color-accent)] bg-[color:var(--color-bg-soft)] shadow-sm'
                  : dimmed
                    ? 'border-[color:var(--color-border)] bg-white opacity-55'
                    : 'border-[color:var(--color-border)] bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <p className="font-mono text-[0.78rem] text-[color:var(--color-text-faint)]">{lib.npm}</p>
                  <p className="font-serif text-[1.05rem] font-semibold mt-0.5">{lib.name}</p>
                  <p className="text-[0.82rem] text-[color:var(--color-text-soft)] mt-0.5">{lib.blurb}</p>
                </div>
                {isRecommended && (
                  <span className="shrink-0 inline-flex items-center text-[0.66rem] uppercase tracking-wider text-[color:var(--color-accent)] font-semibold border border-[color:var(--color-accent)] rounded-full px-2.5 py-0.5">
                    Best fit
                  </span>
                )}
                {lib.caps.maintained === 'no' && (
                  <span className="shrink-0 inline-flex items-center text-[0.66rem] uppercase tracking-wider text-[color:var(--color-text-faint)] font-semibold border border-[color:var(--color-rule)] rounded-full px-2.5 py-0.5 line-through decoration-1">
                    Deprecated
                  </span>
                )}
              </div>

              {selected.size > 0 && (
                <ul className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[0.78rem] font-mono">
                  {Array.from(selected).map((k) => {
                    const need = NEEDS.find((n) => n.key === k)!;
                    const note = lib.notes[k];
                    return (
                      <li key={k} className="flex items-baseline gap-1.5">
                        <MarkGlyph m={lib.caps[k]} />
                        <span className="truncate">
                          {need.label}
                          {note && <span className="text-[color:var(--color-text-faint)]"> — {note}</span>}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          );
        })}

        {recommended && (
          <p className="font-serif italic text-sm text-[color:var(--color-text-soft)] pt-1">
            Based on your selection, <strong className="not-italic text-[color:var(--color-ink)]">{recommended.name}</strong> is the cleanest fit.
          </p>
        )}
        {selected.size > 0 && !recommended && (
          <p className="font-serif italic text-sm text-[color:var(--color-pine)] pt-1">
            No library fully meets every selected need without compromise. Drop one of the constraints, or build the gap yourself.
          </p>
        )}
      </div>
    </div>
  );
}
