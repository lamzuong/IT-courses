'use client';
import { useEffect, useRef, useState } from 'react';

const RESPONSE = `"Welcome Back" feels right — it's direct, low-pressure, and reads as warm rather than salesy. Alternatives: "We've Missed You" (more emotional), "Your Spot Is Open" (a touch more transactional). I'd go with "Welcome Back".`;

export function StreamingTextDemo() {
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [tokens, setTokens] = useState(0);
  const intervalRef = useRef<number | null>(null);

  function start() {
    setOutput('');
    setTokens(0);
    setRunning(true);
    let i = 0;
    intervalRef.current = window.setInterval(() => {
      i += 1;
      if (i > RESPONSE.length) {
        if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
        intervalRef.current = null;
        setRunning(false);
        return;
      }
      setOutput(RESPONSE.slice(0, i));
      // approximate: 1 token per ~4 chars
      if (i % 4 === 0) setTokens((t) => t + 1);
    }, 25);
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="font-serif italic text-sm text-[color:var(--color-text-soft)]">
        {`Prompt: "Suggest a name for our re-engagement campaign."`}
      </div>
      <button
        type="button"
        onClick={start}
        disabled={running}
        className="text-[0.78rem] uppercase tracking-wider px-3 py-1.5 rounded-full bg-[color:var(--color-accent)] text-white font-semibold disabled:opacity-50"
      >
        {running ? 'Streaming…' : 'Run'}
      </button>
      <div
        className="rounded border border-[color:var(--color-border)] bg-white p-3 min-h-32 font-serif text-[0.95rem] leading-relaxed"
        aria-live="polite"
      >
        {output || <span className="italic text-[color:var(--color-text-faint)]">— output will stream here —</span>}
      </div>
      <p className="text-[0.72rem] uppercase tracking-wider text-[color:var(--color-text-faint)]">
        Tokens: <span className="font-mono text-[color:var(--color-accent)]">{tokens}</span>
      </p>
    </div>
  );
}
