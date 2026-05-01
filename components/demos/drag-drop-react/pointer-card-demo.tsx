'use client';
import { useRef, useState } from 'react';

type Pos = { x: number; y: number };

export function PointerCardDemo() {
  const [pos, setPos] = useState<Pos>({ x: 24, y: 24 });
  const [dragging, setDragging] = useState(false);
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
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const parent = e.currentTarget.parentElement!.getBoundingClientRect();
    setPos({
      x: Math.max(0, Math.min(parent.width - 140, e.clientX - parent.left - s.offsetX)),
      y: Math.max(0, Math.min(parent.height - 64, e.clientY - parent.top - s.offsetY)),
    });
  }

  function end() {
    start.current = null;
    setDragging(false);
  }

  return (
    <div className="demo-canvas relative h-64 rounded border border-[color:var(--color-border)] overflow-hidden">
      <p className="absolute inset-0 flex items-center justify-center font-serif italic text-[color:var(--color-text-faint)] pointer-events-none">
        {dragging ? '' : 'try with mouse, finger, or pen'}
      </p>
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
          width: 140,
        }}
        className={`rounded border bg-white px-4 py-3 select-none shadow-sm transition ${dragging ? 'border-[color:var(--color-accent)] shadow-md' : 'border-[color:var(--color-border)]'}`}
      >
        <p className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)]">Card</p>
        <p className="font-serif">drag me</p>
      </div>
    </div>
  );
}
