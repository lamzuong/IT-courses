'use client';
import { useRef, useState } from 'react';

const BINS = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta' },
  { id: 'c', label: 'Gamma' },
];

type Pos = { x: number; y: number };

export function DropBinsDemo() {
  const [pos, setPos] = useState<Pos>({ x: 16, y: 16 });
  const [dragging, setDragging] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [count, setCount] = useState<Record<string, number>>({ a: 0, b: 0, c: 0 });
  const start = useRef<{ pointerId: number; offsetX: number; offsetY: number } | null>(null);

  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    start.current = { pointerId: e.pointerId, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
  }

  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const s = start.current;
    if (!s || s.pointerId !== e.pointerId) return;
    const parent = e.currentTarget.parentElement!.getBoundingClientRect();
    setPos({ x: e.clientX - parent.left - s.offsetX, y: e.clientY - parent.top - s.offsetY });
    const hits = document.elementsFromPoint(e.clientX, e.clientY);
    const zone = hits.find((el) => el.hasAttribute('data-bin'))?.getAttribute('data-bin') ?? null;
    setHover(zone);
  }

  function end() {
    if (hover) setCount((c) => ({ ...c, [hover]: (c[hover] ?? 0) + 1 }));
    start.current = null;
    setDragging(false);
    setHover(null);
    setPos({ x: 16, y: 16 });
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-3 gap-3 mb-3">
        {BINS.map((b) => (
          <div
            key={b.id}
            data-bin={b.id}
            className={`rounded border-2 border-dashed p-4 text-center transition ${hover === b.id ? 'border-[color:var(--color-accent)] bg-[color:var(--color-bg-soft)]' : 'border-[color:var(--color-border)]'}`}
          >
            <p className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)]">Bin</p>
            <p className="font-serif text-lg">{b.label}</p>
            <p className="font-mono text-sm mt-1 text-[color:var(--color-text-soft)]">{count[b.id]}</p>
          </div>
        ))}
      </div>
      <div className="relative h-32 rounded bg-[color:var(--color-bg-soft)] border border-[color:var(--color-border)]">
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={end}
          onPointerCancel={end}
          style={{
            position: 'absolute',
            left: pos.x,
            top: pos.y,
            touchAction: 'none',
            cursor: dragging ? 'grabbing' : 'grab',
            pointerEvents: dragging ? 'none' : 'auto',
            width: 140,
          }}
          className={`rounded border bg-white px-3 py-2 select-none shadow-sm ${dragging ? 'opacity-70' : ''}`}
        >
          <p className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)]">Token</p>
          <p className="font-serif">drop in any bin</p>
        </div>
        {/* invisible re-anchor for the source so we can drag past the parent's edges */}
        {dragging && (
          <div
            onPointerMove={onPointerMove}
            onPointerUp={end}
            onPointerCancel={end}
            className="fixed inset-0"
            style={{ touchAction: 'none' }}
          />
        )}
      </div>
    </div>
  );
}
