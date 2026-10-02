"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Rolls the displayed number from its previous value down (or up) to the new
 * one over ~1s, like an odometer — used for the credits balance so spending
 * 2,800 credits on a generation visibly ticks the counter down instead of
 * just snapping to the new number.
 */
export function AnimatedCounter({ value, className }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;

    const start = performance.now();
    const duration = 900;

    function tick(now: number) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        fromRef.current = to;
      }
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [value]);

  return <span className={`tabular-nums ${className ?? ""}`}>{display.toLocaleString()}</span>;
}
