'use client';
import { useEffect, useRef, useState } from 'react';

const WITHOUT_EXAMPLES =
  'This sounds like a complaint about product damage. The customer is upset that their mug arrived in a chipped condition. You should probably reach out and offer a replacement or refund.';

const WITH_EXAMPLES =
  '{"category":"damaged_product","severity":"medium","action":"offer_replacement"}';

const EXAMPLES = `Few-shot examples in the prompt:

Input: "The shirt is too small."
Output: {"category":"sizing_issue","severity":"low","action":"offer_exchange"}

Input: "Package never arrived."
Output: {"category":"shipping_issue","severity":"high","action":"investigate_and_resend"}

Input: "Wrong color sent."
Output: {"category":"order_error","severity":"medium","action":"offer_replacement"}`;

export function FewShotToggleDemo() {
  const [withExamples, setWithExamples] = useState(false);
  const [output, setOutput] = useState('');
  const [running, setRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);

  function run() {
    setOutput('');
    setRunning(true);
    const target = withExamples ? WITH_EXAMPLES : WITHOUT_EXAMPLES;
    let i = 0;
    intervalRef.current = window.setInterval(() => {
      i += 1;
      if (i > target.length) {
        if (intervalRef.current !== null) window.clearInterval(intervalRef.current);
        intervalRef.current = null;
        setRunning(false);
        return;
      }
      setOutput(target.slice(0, i));
    }, 22);
  }

  useEffect(() => () => { if (intervalRef.current !== null) window.clearInterval(intervalRef.current); }, []);

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 text-sm cursor-pointer">
        <input type="checkbox" checked={withExamples} onChange={(e) => setWithExamples(e.target.checked)} />
        <span>Include 3 few-shot examples in the prompt</span>
      </label>
      {withExamples && (
        <pre className="rounded bg-[color:var(--color-code-bg)] border border-[color:var(--color-code-border)] p-3 text-[0.72rem] font-mono whitespace-pre-wrap">
          {EXAMPLES}
        </pre>
      )}
      <p className="font-serif italic text-sm text-[color:var(--color-text-soft)]">
        {`User: "Classify this customer feedback: 'My mug arrived chipped.'"`}
      </p>
      <button
        type="button"
        onClick={run}
        disabled={running}
        className="text-[0.78rem] uppercase tracking-wider px-3 py-1.5 rounded-full bg-[color:var(--color-accent)] text-white font-semibold disabled:opacity-50"
      >
        Run
      </button>
      <div
        className="rounded border border-[color:var(--color-border)] bg-white p-3 min-h-24 font-serif text-[0.92rem] leading-relaxed whitespace-pre-wrap"
        aria-live="polite"
      >
        {output || <span className="italic text-[color:var(--color-text-faint)]">— output will stream here —</span>}
      </div>
    </div>
  );
}
