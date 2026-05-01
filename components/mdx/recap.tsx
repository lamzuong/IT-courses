import type { ReactNode } from 'react';

export function Recap({ children, title = 'Coda' }: { children: ReactNode; title?: string }) {
  return (
    <section aria-labelledby="recap-heading" className="coda">
      <p className="coda-label">In closing</p>
      <h2 id="recap-heading" className="coda-title">{title}</h2>
      <div>{children}</div>
    </section>
  );
}
