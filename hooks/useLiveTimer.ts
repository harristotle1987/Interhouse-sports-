import { useState, useEffect, useRef } from 'react';

/**
 * SOVEREIGN LIVE TIMER ENGINE
 * Purpose: Provides high-precision countdown supporting PAUSE/RESUME logic.
 * Strategy: Localized calculation against start_time compensated by metadata offsets.
 * Optimized for low-latency synchronization with minimal re-renders.
 */
export const useLiveTimer = (startTime: string | null, durationMinutes: number, status?: string, metadata?: any) => {
  const [timeLeft, setTimeLeft] = useState<string>('--:--');
  const [isFinished, setIsFinished] = useState(false);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (!startTime) {
      setTimeLeft('--:--');
      return;
    }

    const calculate = () => {
      const durationMs = durationMinutes * 60000;
      let diff: number;

      if (status === 'paused') {
        // If paused, use the offset stored in metadata to show frozen time
        const elapsedAtPause = metadata?.elapsed_ms || 0;
        diff = durationMs - elapsedAtPause;
      } else {
        // If live, calculate based on master start time vs local system clock
        const start = new Date(startTime).getTime();
        const now = Date.now();
        diff = durationMs - (now - start);
      }

      if (diff <= 0) {
        setTimeLeft('00:00');
        setIsFinished(true);
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
        setIsFinished(false);
      }
    };

    // Initial sync
    calculate();
    
    // Clear existing interval to prevent overlapping heartbeats
    if (timerRef.current) clearInterval(timerRef.current);
    
    // High-frequency heartbeat for 1-second precision
    if (status === 'live') {
      timerRef.current = setInterval(calculate, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTime, durationMinutes, status, metadata]);

  return { timeLeft, isFinished };
};