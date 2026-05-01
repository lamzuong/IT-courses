'use client';
import { useState } from 'react';

export function TouchVsPointerDemo() {
  const [dragFires, setDragFires] = useState(0);
  const [pointerFires, setPointerFires] = useState(0);
  const [lastPointerType, setLastPointerType] = useState<string | null>(null);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData('text/plain', 'x');
          setDragFires((c) => c + 1);
        }}
        className={`rounded border-2 p-5 cursor-grab active:cursor-grabbing select-none transition ${dragFires > 0 ? 'border-[color:var(--color-accent)] bg-[color:var(--color-bg-soft)]' : 'border-[color:var(--color-border)] bg-white'}`}
      >
        <p className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)]">HTML5 DnD</p>
        <p className="font-serif text-lg mt-1">press here</p>
        <p className="font-mono text-[0.78rem] mt-3">
          dragstart fired:{' '}
          <span className={`font-semibold ${dragFires > 0 ? 'text-[color:var(--color-accent)]' : 'text-[color:var(--color-text-faint)]'}`}>
            {dragFires}× {dragFires === 0 && '— silent'}
          </span>
        </p>
      </div>

      <div
        onPointerDown={(e) => {
          setPointerFires((c) => c + 1);
          setLastPointerType(e.pointerType);
        }}
        style={{ touchAction: 'none' }}
        className={`rounded border-2 p-5 select-none transition cursor-pointer ${pointerFires > 0 ? 'border-[color:var(--color-accent)] bg-[color:var(--color-bg-soft)]' : 'border-[color:var(--color-border)] bg-white'}`}
      >
        <p className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)]">Pointer Events</p>
        <p className="font-serif text-lg mt-1">press here</p>
        <p className="font-mono text-[0.78rem] mt-3">
          pointerdown fired:{' '}
          <span className={`font-semibold ${pointerFires > 0 ? 'text-[color:var(--color-accent)]' : 'text-[color:var(--color-text-faint)]'}`}>
            {pointerFires}× {lastPointerType ? `(${lastPointerType})` : ''}
          </span>
        </p>
      </div>

      <p className="md:col-span-2 font-serif italic text-sm text-[color:var(--color-text-soft)]">
        On a desktop with a mouse, both boxes fire. <strong>On a phone or tablet, only the right one fires</strong> — the
        left box reports zero because the browser interprets your touch as a scroll, not a drag.
      </p>
    </div>
  );
}
