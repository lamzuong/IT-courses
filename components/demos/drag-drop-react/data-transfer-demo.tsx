'use client';
import { useState } from 'react';

const MIME_TYPES = ['text/plain', 'application/json', 'text/uri-list'] as const;

const PAYLOADS: Record<typeof MIME_TYPES[number], string> = {
  'text/plain':       'Card #42',
  'application/json': JSON.stringify({ id: 42, title: 'Hello', tags: ['drag', 'drop'] }, null, 2),
  'text/uri-list':    'https://example.com/cards/42',
};

export function DataTransferDemo() {
  const [received, setReceived] = useState<Record<string, string> | null>(null);
  const [over, setOver] = useState(false);

  function onDragStart(e: React.DragEvent) {
    for (const mime of MIME_TYPES) e.dataTransfer.setData(mime, PAYLOADS[mime]);
    e.dataTransfer.effectAllowed = 'copy';
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setOver(true);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const out: Record<string, string> = {};
    for (const mime of MIME_TYPES) out[mime] = e.dataTransfer.getData(mime);
    setReceived(out);
    setOver(false);
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-3">
        <div
          draggable
          onDragStart={onDragStart}
          className="rounded border border-[color:var(--color-border)] bg-white px-4 py-3 cursor-grab active:cursor-grabbing select-none inline-block"
        >
          <p className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)]">Source</p>
          <p className="font-serif text-lg">Card #42</p>
          <p className="text-[0.72rem] text-[color:var(--color-text-soft)] mt-1">3 MIME types attached</p>
        </div>
        <div
          onDragOver={onDragOver}
          onDragLeave={() => setOver(false)}
          onDrop={onDrop}
          className={`rounded border-2 border-dashed p-5 transition ${over ? 'border-[color:var(--color-accent)] bg-[color:var(--color-bg-soft)]' : 'border-[color:var(--color-border)]'}`}
        >
          <p className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)]">Target</p>
          <p className="font-serif text-lg">Drop to read all types</p>
        </div>
      </div>

      <div className="rounded border border-[color:var(--color-border)] bg-[color:var(--color-code-bg)] p-3 font-mono text-xs space-y-3 overflow-auto">
        <p className="text-[color:var(--color-code-soft)] uppercase tracking-wider text-[0.65rem]">getData() returned:</p>
        {!received && <p className="opacity-50 italic">— drop to inspect —</p>}
        {received && MIME_TYPES.map((m) => (
          <div key={m}>
            <p className="text-[color:var(--color-accent)] mb-1">{m}</p>
            <pre className="whitespace-pre-wrap text-[color:var(--color-code-text)] break-all">{received[m] || <em className="opacity-50">(empty)</em>}</pre>
          </div>
        ))}
      </div>
    </div>
  );
}
