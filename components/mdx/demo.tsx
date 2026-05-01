'use client';
import { useState, type ReactNode, isValidElement, cloneElement } from 'react';

let counter = 0;
function nextFigureNum() {
  counter = (counter % 99) + 1;
  return counter;
}

export function Demo({ title, children }: { title?: string; children: ReactNode }) {
  const [resetKey, setResetKey] = useState(0);
  const [figureNum] = useState(() => nextFigureNum());
  const child =
    isValidElement(children)
      ? cloneElement(children, { key: resetKey } as Record<string, unknown>)
      : children;

  return (
    <figure className="plate">
      <div className="plate-frame">
        <figcaption className="plate-caption">
          <span className="plate-caption-left">
            <span className="plate-tag">Live</span>
            <span className="plate-figure-num">
              Figure {String(figureNum).padStart(2, '0')}
              {title ? <> — <em>{title}</em></> : null}
            </span>
          </span>
          <button
            type="button"
            onClick={() => setResetKey((k) => k + 1)}
            className="plate-reset"
            aria-label="Reset figure"
          >
            Reset
          </button>
        </figcaption>
        <div className="plate-body">{child}</div>
      </div>
    </figure>
  );
}
