'use client';
import { useState } from 'react';

const ITEMS = [
  { id: 'a', label: 'Card A' },
  { id: 'b', label: 'Card B' },
  { id: 'c', label: 'Card C' },
];

export function Html5BinDemo() {
  const [items, setItems] = useState(ITEMS);
  const [bin, setBin] = useState<typeof ITEMS>([]);
  const [overBin, setOverBin] = useState(false);

  function onDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  }

  function onDragOver(e: React.DragEvent) {
    e.preventDefault(); // required to allow drop
    e.dataTransfer.dropEffect = 'move';
    setOverBin(true);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const moved = items.find((i) => i.id === id);
    if (!moved) return;
    setItems((cur) => cur.filter((i) => i.id !== id));
    setBin((cur) => [...cur, moved]);
    setOverBin(false);
  }

  function reset() {
    setItems(ITEMS);
    setBin([]);
  }

  return (
    <div className="flex gap-4 items-start">
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wider text-[color:var(--color-text-soft)] mb-2">Cards</p>
        <ul className="space-y-2 min-h-32">
          {items.map((it) => (
            <li
              key={it.id}
              draggable
              onDragStart={(e) => onDragStart(e, it.id)}
              className="rounded border border-[color:var(--color-border)] bg-white px-3 py-2 cursor-grab active:cursor-grabbing select-none"
            >
              {it.label}
            </li>
          ))}
          {items.length === 0 && <li className="text-xs italic opacity-60">All cards moved.</li>}
        </ul>
      </div>
      <div
        onDragOver={onDragOver}
        onDragLeave={() => setOverBin(false)}
        onDrop={onDrop}
        aria-label="Drop bin"
        className={`flex-1 min-h-32 rounded border-2 border-dashed p-3 transition ${overBin ? 'border-black bg-black/5' : 'border-[color:var(--color-border)]'}`}
      >
        <p className="text-xs uppercase tracking-wider text-[color:var(--color-text-soft)] mb-2">Bin</p>
        <ul className="space-y-2">
          {bin.map((it) => (
            <li key={it.id} className="rounded border border-[color:var(--color-border)] bg-white/80 px-3 py-2">{it.label}</li>
          ))}
          {bin.length === 0 && <li className="text-xs italic opacity-60">Drop cards here.</li>}
        </ul>
      </div>
      <button type="button" onClick={reset} className="text-xs px-2 py-1 rounded border border-[color:var(--color-border)] hover:bg-white/40">
        Reset
      </button>
    </div>
  );
}
