import { useEffect, useRef } from 'react';

/**
 * Tracks setTimeout handles in a ref so they can be cleared together —
 * on reset, on early-exit, and on unmount. Use this in any demo that
 * schedules multiple timers and might unmount or restart mid-run.
 */
export function useTimeoutQueue() {
  const ids = useRef<number[]>([]);

  function clear() {
    ids.current.forEach((id) => window.clearTimeout(id));
    ids.current = [];
  }

  function schedule(fn: () => void, ms: number) {
    const id = window.setTimeout(fn, ms);
    ids.current.push(id);
    return id;
  }

  useEffect(() => clear, []);

  return { schedule, clear };
}
