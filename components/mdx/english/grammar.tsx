import type { ReactNode } from 'react';

export type GrammarExample = { en: string; vi?: string };

export function Grammar({
  point,
  structure,
  examples,
  contrast,
}: {
  point: string;
  structure: string;
  examples: GrammarExample[];
  contrast?: ReactNode;
}) {
  return (
    <div className="en-grammar" role="note" aria-label="Grammar focus">
      <p className="en-grammar-point">
        <span className="en-grammar-label">Ngữ pháp</span>
        <span className="en-grammar-point-text">{point}</span>
      </p>
      <p className="en-grammar-structure">{structure}</p>
      <ul className="en-grammar-examples">
        {examples.map((ex) => (
          <li key={ex.en}>
            <span className="en-grammar-ex-en">{ex.en}</span>
            {ex.vi && <span className="en-grammar-ex-vi"> — {ex.vi}</span>}
          </li>
        ))}
      </ul>
      {contrast && <p className="en-grammar-contrast">{contrast}</p>}
    </div>
  );
}
