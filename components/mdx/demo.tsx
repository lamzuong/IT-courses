'use client';
import { useEffect, useState, type ReactNode, isValidElement, cloneElement } from 'react';

// Figure numbers are assigned client-side after hydration so the server's
// shared module counter (which persists across renders in dev/Fluid Compute)
// can't disagree with the client's freshly-loaded counter and trip a
// hydration mismatch. Render path: server emits no number; once mounted,
// the client claims the next number from this counter.
let clientCounter = 0;

export function Demo({ title, children }: { title?: string; children: ReactNode }) {
  const [resetKey, setResetKey] = useState(0);
  const [figureNum, setFigureNum] = useState<number | null>(null);

  useEffect(() => {
    clientCounter = (clientCounter % 99) + 1;
    setFigureNum(clientCounter);
  }, []);

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
              {figureNum !== null ? (
                <>
                  Figure {String(figureNum).padStart(2, '0')}
                  {title ? <> — <em>{title}</em></> : null}
                </>
              ) : title ? (
                <em>{title}</em>
              ) : null}
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
