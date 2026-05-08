import { useCallback, useEffect, useRef } from 'react';

/**
 * Tracks setTimeout handles in a ref so they can be cleared together —
 * on reset, on early-exit, and on unmount. Use this in any demo that
 * schedules multiple timers and might unmount or restart mid-run.
 *
 * `clear` and `schedule` are wrapped in useCallback so callers can list
 * them in dep arrays without re-running effects on every render.
 */
export function useTimeoutQueue() {
  const ids = useRef<number[]>([]);

  const clear = useCallback(() => {
    ids.current.forEach((id) => window.clearTimeout(id));
    ids.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = window.setTimeout(fn, ms);
    ids.current.push(id);
    return id;
  }, []);

  useEffect(() => clear, [clear]);

  return { schedule, clear };
}
