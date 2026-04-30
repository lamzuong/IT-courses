import type { ReactNode } from 'react';

export function Recap({ children }: { children: ReactNode }) {
  return (
    <section
      aria-labelledby="recap-heading"
      className="my-12 rounded-md border border-[color:var(--color-border)] bg-[color:var(--color-bg-soft)] p-6"
    >
      <h2 id="recap-heading" className="text-lg font-serif font-semibold mb-3">Recap</h2>
      <div className="prose-sm">{children}</div>
    </section>
  );
}
