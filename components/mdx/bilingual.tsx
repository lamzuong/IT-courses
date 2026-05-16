import type { ReactNode } from 'react';

export function EN({ children }: { children: ReactNode }) {
  return (
    <div className="lang-block lang-en" lang="en">
      {children}
    </div>
  );
}

export function VI({ children }: { children: ReactNode }) {
  return (
    <div className="lang-block lang-vi" lang="vi">
      {children}
    </div>
  );
}
