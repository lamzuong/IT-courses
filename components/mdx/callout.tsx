import type { ReactNode } from 'react';

const styles = {
  note:    'border-blue-300/60 bg-blue-50/50',
  warning: 'border-amber-300/60 bg-amber-50/50',
  tip:     'border-emerald-300/60 bg-emerald-50/50',
} as const;

export function Callout({
  type = 'note',
  title,
  children,
}: {
  type?: keyof typeof styles;
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside className={`my-6 rounded-md border-l-4 px-4 py-3 ${styles[type]}`} role="note">
      {title && <p className="font-semibold mb-1">{title}</p>}
      <div className="prose-sm">{children}</div>
    </aside>
  );
}
