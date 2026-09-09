import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  formatSparkCountdown,
  getMsUntilNextSpark,
} from "@/lib/daily-countdown";

/**
 * Tick cadence: 15s is plenty for a minute-granularity countdown and is
 * battery-friendly (one tiny state write every 15 seconds while mounted).
 */
const TICK_MS = 15_000;

/**
 * Live "New Spark in Xh Ym" label.
 *
 * Ticks in the background and, when the local date rolls over (midnight),
 * invalidates the quote caches so the fresh Quote of the Day is revealed
 * automatically without a manual refresh.
 */
export function useNextSparkCountdown(): string {
  const queryClient = useQueryClient();
  const [label, setLabel] = useState<string>(
    () => formatSparkCountdown(getMsUntilNextSpark())
  );
  const mountDayRef = useRef<string>(new Date().toDateString());
  const [rollovers, setRollovers] = useState(0);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const today = now.toDateString();
      setLabel(formatSparkCountdown(getMsUntilNextSpark(now)));
      if (today !== mountDayRef.current) {
        mountDayRef.current = today;
        setRollovers((r) => r + 1);
      }
    };
    tick();
    const id = setInterval(tick, TICK_MS);
    return () => clearInterval(id);
  }, []);

  // A new day started while the app was open → reveal today's Quote of the Day.
  useEffect(() => {
    if (rollovers === 0) return;
    queryClient.invalidateQueries({ queryKey: ["quotes"] });
    queryClient.invalidateQueries({ queryKey: ["daily-quote"] });
  }, [rollovers, queryClient]);

  return label;
}