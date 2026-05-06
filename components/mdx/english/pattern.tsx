import type { ReactNode } from 'react';

export function Pattern({
  en,
  vi,
  variations = [],
  note,
}: {
  en: string;
  vi: string;
  variations?: string[];
  note?: ReactNode;
}) {
  return (
    <div className="en-pattern">
      <p className="en-pattern-en">{en}</p>
      <p className="en-pattern-vi">{vi}</p>
      {variations.length > 0 && (
        <ul className="en-pattern-variations">
          {variations.map((v) => (
            <li key={v}>{v}</li>
          ))}
        </ul>
      )}
      {note && <p className="en-pattern-note">{note}</p>}
    </div>
  );
}
