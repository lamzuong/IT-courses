import type { ReactNode } from 'react';

export function Mistake({
  wrong,
  right,
  why,
}: {
  wrong: string;
  right: string;
  why: ReactNode;
}) {
  return (
    <div className="en-mistake" role="note" aria-label="Common mistake">
      <div className="en-mistake-row">
        <span className="en-mistake-label en-mistake-label--wrong">Sai</span>
        <p className="en-mistake-wrong">{wrong}</p>
      </div>
      <div className="en-mistake-row">
        <span className="en-mistake-label en-mistake-label--right">Đúng</span>
        <p className="en-mistake-right">{right}</p>
      </div>
      <p className="en-mistake-why">{why}</p>
    </div>
  );
}
