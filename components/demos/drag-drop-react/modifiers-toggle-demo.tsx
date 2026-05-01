'use client';
import { DndContext, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useMemo, useState } from 'react';
import {
  restrictToParentElement,
  restrictToVerticalAxis,
  restrictToHorizontalAxis,
  createSnapModifier,
} from '@dnd-kit/modifiers';

function Card() {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: 'c' });
  return (
    <button
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        touchAction: 'none',
      }}
      {...attributes}
      {...listeners}
      className="absolute left-3 top-3 rounded border border-[color:var(--color-border)] bg-white px-3 py-2 cursor-grab active:cursor-grabbing font-serif"
    >
      drag me
    </button>
  );
}

export function ModifiersToggleDemo() {
  const [opts, setOpts] = useState({ parent: true, vertical: false, horizontal: false, snap: false });

  const modifiers = useMemo(() => {
    const m = [];
    if (opts.parent) m.push(restrictToParentElement);
    if (opts.vertical) m.push(restrictToVerticalAxis);
    if (opts.horizontal) m.push(restrictToHorizontalAxis);
    if (opts.snap) m.push(createSnapModifier(20));
    return m;
  }, [opts]);

  // grid background to visualize snapping
  const gridBg = opts.snap
    ? 'linear-gradient(to right, color-mix(in oklab, var(--color-rule), transparent 60%) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--color-rule), transparent 60%) 1px, transparent 1px)'
    : undefined;

  return (
    <div className="grid md:grid-cols-[1fr_220px] gap-4">
      <DndContext modifiers={modifiers}>
        <div
          className="relative h-64 rounded border border-[color:var(--color-border)] bg-[color:var(--color-bg-soft)]"
          style={{ backgroundImage: gridBg, backgroundSize: '20px 20px' }}
        >
          <Card />
        </div>
      </DndContext>
      <div className="space-y-2 text-sm">
        <p className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)]">Modifiers</p>
        {(['parent','vertical','horizontal','snap'] as const).map((k) => (
          <label key={k} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={opts[k]}
              onChange={(e) => setOpts((o) => ({ ...o, [k]: e.target.checked }))}
            />
            <span className="font-mono text-xs">
              {k === 'parent' && 'restrictToParentElement'}
              {k === 'vertical' && 'restrictToVerticalAxis'}
              {k === 'horizontal' && 'restrictToHorizontalAxis'}
              {k === 'snap' && 'createSnapModifier(20)'}
            </span>
          </label>
        ))}
        <p className="text-xs text-[color:var(--color-text-soft)] leading-relaxed pt-2 border-t border-[color:var(--color-rule)]">
          Toggle each rule and feel how the drag behaves. Snap shows the 20px grid.
        </p>
      </div>
    </div>
  );
}
