'use client';
import { useState } from 'react';

type Entry = { kind: 'enter' | 'leave'; on: string; t: number };

export function DragleaveNoiseDemo() {
  const [log, setLog] = useState<Entry[]>([]);
  const [active, setActive] = useState(false);
  const start = log.length ? log[0].t : Date.now();

  function record(kind: Entry['kind'], on: string) {
    setLog((cur) => [...cur, { kind, t: Date.now(), on }].slice(-14));
  }

  function reset() {
    setLog([]);
    setActive(false);
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <div
          draggable
          onDragStart={(e) => { e.dataTransfer.setData('text/plain', 'x'); reset(); }}
          className="rounded border border-[color:var(--color-border)] bg-white px-4 py-3 cursor-grab active:cursor-grabbing select-none inline-block"
        >
          <p className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)]">Source</p>
          <p className="font-serif">drag this →</p>
        </div>

        <div
          onDragEnter={(e) => {
            e.preventDefault();
            record('enter', (e.target as HTMLElement).dataset.label ?? 'parent');
            setActive(true);
          }}
          onDragLeave={(e) => {
            record('leave', (e.target as HTMLElement).dataset.label ?? 'parent');
            setActive(false);
          }}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); reset(); }}
          data-label="parent"
          className={`rounded border-2 border-dashed p-4 transition ${active ? 'border-[color:var(--color-accent)] bg-[color:var(--color-bg-soft)]' : 'border-[color:var(--color-border)]'}`}
        >
          <p className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)] mb-2">Drop zone (with children)</p>
          <div className="space-y-1.5">
            <div data-label="child A" className="rounded border border-[color:var(--color-border)] bg-white px-3 py-2 text-sm">Child A</div>
            <div data-label="child B" className="rounded border border-[color:var(--color-border)] bg-white px-3 py-2 text-sm">Child B</div>
            <div data-label="child C" className="rounded border border-[color:var(--color-border)] bg-white px-3 py-2 text-sm">Child C</div>
          </div>
        </div>
      </div>

      <div className="rounded border border-[color:var(--color-border)] bg-[color:var(--color-code-bg)] p-3 font-mono text-xs h-72 overflow-auto">
        <p className="text-[color:var(--color-code-soft)] uppercase tracking-wider text-[0.65rem] mb-2">enter / leave log</p>
        {log.length === 0 && <p className="opacity-50 italic">— start dragging into the zone, then move over the children —</p>}
        {log.map((e, i) => (
          <p key={i} className={e.kind === 'enter' ? 'text-[color:var(--color-accent)]' : 'text-[color:var(--color-text-faint)] line-through decoration-1'}>
            <span className="text-[color:var(--color-code-soft)]">{String(e.t - start).padStart(4, ' ')}ms</span>
            {' '}{e.kind.padEnd(5, ' ')} {e.on}
          </p>
        ))}
      </div>

      <p className="md:col-span-2 font-serif italic text-sm text-[color:var(--color-text-soft)]">
        Drag the source over the parent, then over a child. You&rsquo;ll see <code>dragleave</code> fire <strong>even though you&rsquo;re still inside the drop zone</strong> — because the pointer crossed from the parent into a child element. The parent&rsquo;s border flickers off as a result.
      </p>
    </div>
  );
}
