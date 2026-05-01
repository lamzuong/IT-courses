'use client';
import { useState } from 'react';

type Entry = { evt: string; t: number; on: 'source' | 'target' };

export function EventLogDemo() {
  const [log, setLog] = useState<Entry[]>([]);
  const [target, setTarget] = useState(false);
  const start = log.length ? log[0].t : 0;

  function record(evt: string, on: Entry['on']) {
    setLog((cur) => [...cur, { evt, t: Date.now(), on }].slice(-12));
  }

  return (
    <div className="grid md:grid-cols-2 gap-4 items-start">
      <div className="space-y-3">
        <div
          draggable
          onDragStart={(e) => { e.dataTransfer.setData('text/plain', 'card'); record('dragstart', 'source'); }}
          onDragEnd={() => record('dragend', 'source')}
          className="rounded border border-[color:var(--color-border)] bg-white px-4 py-3 cursor-grab active:cursor-grabbing select-none"
        >
          <p className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)]">Source</p>
          <p className="font-serif text-lg">Drag this</p>
        </div>
        <div
          onDragEnter={() => { record('dragenter', 'target'); setTarget(true); }}
          onDragOver={(e) => { e.preventDefault(); record('dragover', 'target'); }}
          onDragLeave={() => { record('dragleave', 'target'); setTarget(false); }}
          onDrop={(e) => { e.preventDefault(); record('drop', 'target'); setTarget(false); }}
          className={`rounded border-2 border-dashed p-5 transition ${target ? 'border-[color:var(--color-accent)] bg-[color:var(--color-bg-soft)]' : 'border-[color:var(--color-border)]'}`}
        >
          <p className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)]">Target</p>
          <p className="font-serif text-lg">Drop here</p>
        </div>
      </div>
      <div className="rounded border border-[color:var(--color-border)] bg-[color:var(--color-code-bg)] text-[color:var(--color-code-text)] p-3 font-mono text-xs h-64 overflow-auto">
        <p className="text-[color:var(--color-code-soft)] mb-2">{'>'} live event log</p>
        {log.length === 0 && <p className="opacity-50">— nothing yet, start dragging —</p>}
        {log.map((e, i) => (
          <p key={i} className="leading-6">
            <span className="text-[color:var(--color-code-soft)]">{String(e.t - start).padStart(4, ' ')}ms</span>
            {' '}<span className={e.on === 'source' ? 'text-lime-400' : 'text-[color:var(--color-accent)]'}>{e.on.padEnd(7, ' ')}</span>
            {' '}{e.evt}
          </p>
        ))}
      </div>
    </div>
  );
}
