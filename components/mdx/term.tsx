import type { ReactNode } from 'react';

export function Term({ def, children }: { def: string; children: ReactNode }) {
  return (
    <span className="term" tabIndex={0} aria-describedby="term-tooltip">
      <span className="term-label">{children}</span>
      <span className="term-tooltip" role="tooltip">
        {def}
      </span>
    </span>
  );
}
