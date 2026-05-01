'use client';
import { useState } from 'react';

type Info = { type: string; isPrimary: boolean; pressure: number; x: number; y: number };

export function PointerTypeDemo() {
  const [info, setInfo] = useState<Info | null>(null);
  const [active, setActive] = useState(false);

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div
        onPointerDown={(e) => {
          (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
          setActive(true);
          setInfo({ type: e.pointerType, isPrimary: e.isPrimary, pressure: e.pressure, x: e.clientX, y: e.clientY });
        }}
        onPointerMove={(e) => {
          if (!active) return;
          setInfo({ type: e.pointerType, isPrimary: e.isPrimary, pressure: e.pressure, x: e.clientX, y: e.clientY });
        }}
        onPointerUp={() => setActive(false)}
        onPointerCancel={() => setActive(false)}
        style={{ touchAction: 'none' }}
        className={`rounded border-2 border-dashed p-6 h-48 flex items-center justify-center text-center transition ${active ? 'border-[color:var(--color-accent)] bg-[color:var(--color-bg-soft)]' : 'border-[color:var(--color-border)]'}`}
      >
        <p className="font-serif italic text-[color:var(--color-text-soft)]">
          {active ? 'sensing…' : 'press anywhere with mouse, finger, or pen'}
        </p>
      </div>
      <dl className="font-mono text-xs grid grid-cols-2 gap-x-4 gap-y-2 self-center">
        <dt className="text-[color:var(--color-text-faint)] uppercase tracking-wider">pointerType</dt>
        <dd className="text-[color:var(--color-accent)] font-semibold">{info?.type ?? '—'}</dd>
        <dt className="text-[color:var(--color-text-faint)] uppercase tracking-wider">isPrimary</dt>
        <dd>{info ? String(info.isPrimary) : '—'}</dd>
        <dt className="text-[color:var(--color-text-faint)] uppercase tracking-wider">pressure</dt>
        <dd>{info ? info.pressure.toFixed(3) : '—'}</dd>
        <dt className="text-[color:var(--color-text-faint)] uppercase tracking-wider">clientX</dt>
        <dd>{info ? Math.round(info.x) : '—'}</dd>
        <dt className="text-[color:var(--color-text-faint)] uppercase tracking-wider">clientY</dt>
        <dd>{info ? Math.round(info.y) : '—'}</dd>
      </dl>
    </div>
  );
}
