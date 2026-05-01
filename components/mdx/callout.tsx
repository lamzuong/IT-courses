import type { ReactNode } from 'react';

const labels = {
  note: 'Note',
  warning: 'Heads up',
  tip: 'Aside',
} as const;

export function Callout({
  type = 'note',
  title,
  children,
}: {
  type?: keyof typeof labels;
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside className={`callout callout-${type}`} role="note">
      <p className="callout-title">{title ?? labels[type]}</p>
      <div>{children}</div>
    </aside>
  );
}
