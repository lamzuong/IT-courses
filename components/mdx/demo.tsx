'use client';
import { useState, type ReactNode, isValidElement, cloneElement } from 'react';

export function Demo({ title, children }: { title?: string; children: ReactNode }) {
  const [resetKey, setResetKey] = useState(0);
  const child =
    isValidElement(children)
      ? cloneElement(children, { key: resetKey } as Record<string, unknown>)
      : children;

  return (
    <figure className="my-8 rounded-md border border-[color:var(--color-border)] bg-white/40 overflow-hidden">
      <figcaption className="flex items-center justify-between text-xs uppercase tracking-wider text-[color:var(--color-text-soft)] px-4 py-2 border-b border-[color:var(--color-border)]">
        <span>{title ?? 'Live demo'}</span>
        <button
          type="button"
          onClick={() => setResetKey((k) => k + 1)}
          className="text-xs px-2 py-1 rounded border border-[color:var(--color-border)] hover:bg-[color:var(--color-bg-soft)]"
          aria-label="Reset demo"
        >
          Reset
        </button>
      </figcaption>
      <div className="p-6">{child}</div>
    </figure>
  );
}
