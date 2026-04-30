'use client';
import { useRef, useState, type ReactNode } from 'react';

export function CodeBlock({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  async function copy() {
    const text = ref.current?.innerText ?? '';
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="relative group my-6">
      <pre
        ref={ref}
        tabIndex={0}
        role="region"
        aria-label="Code sample"
        className="rounded-md bg-[color:var(--color-code-bg)] text-[color:var(--color-code-text)] p-4 overflow-x-auto text-sm leading-6 focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-[color:var(--color-link)]"
      >
        {children}
      </pre>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Copied' : 'Copy code'}
        className="absolute top-3 right-3 text-xs px-2 py-1 rounded bg-white/10 text-white opacity-0 group-hover:opacity-100 focus:opacity-100 transition"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <span aria-live="polite" className="sr-only">{copied ? 'Code copied to clipboard' : ''}</span>
    </div>
  );
}
