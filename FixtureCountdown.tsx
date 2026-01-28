import React, { useState, useEffect } from 'react';

interface FixtureCountdownProps {
  startTime: string;
}

/**
 * SOVEREIGN FIXTURE COUNTDOWN [cite: 2026-01-15]
 * High-precision T-Minus delta tracking for scheduled events.
 * Transitions to Emerald Ready-State upon completion.
 */
export const FixtureCountdown: React.FC<FixtureCountdownProps> = ({ startTime }) => {
  const [timer, setTimer] = useState({ hours: 0, mins: 0, secs: 0, isReady: false });

  useEffect(() => {
    const calculate = () => {
      // Use absolute UTC comparison for stadium-wide synchronization
      const now = new Date().getTime();
      const kickoff = new Date(startTime).getTime();
      const diff = kickoff - now;

      if (diff <= 0) {
        setTimer({ hours: 0, mins: 0, secs: 0, isReady: true });
        return;
      }

      setTimer({
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / (1000 * 60)) % 60),
        secs: Math.floor((diff / 1000) % 60),
        isReady: false
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);

    // Strict unmount protocol to prevent memory drift [cite: 2026-01-15]
    return () => clearInterval(interval);
  }, [startTime]);

  if (timer.isReady) {
    return (
      <div className="flex items-center gap-2 bg-emerald-500 text-black px-2 py-0.5 border border-black animate-pulse">
        <span className="text-[8px] font-black uppercase tracking-tighter italic">READY_FOR_LAUNCH</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 font-mono text-emerald-500 font-black text-[10px] md:text-xs">
      <span className="text-zinc-600 text-[8px] uppercase tracking-tighter mr-0.5">T-MINUS</span>
      <span>{timer.hours.toString().padStart(2, '0')}H</span>
      <span className="opacity-30">:</span>
      <span>{timer.mins.toString().padStart(2, '0')}M</span>
      <span className="opacity-30">:</span>
      <span>{timer.secs.toString().padStart(2, '0')}S</span>
    </div>
  );
};