import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { getCurrentCycle, formatRemaining, formatDateShort } from "../lib/cycles";

export default function CountdownTimer({ appId }) {
  const [cycle, setCycle] = useState(() => getCurrentCycle(appId));

  useEffect(() => {
    setCycle(getCurrentCycle(appId));
    const t = setInterval(() => setCycle(getCurrentCycle(appId)), 1000);
    return () => clearInterval(t);
  }, [appId]);

  const r = formatRemaining(cycle.remainingMs);
  const cfg = cycle.config;

  return (
    <div
      className="nb-card p-6"
      data-testid="countdown-timer"
      style={{ borderLeftWidth: "16px", borderLeftColor: cfg.accent }}
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" strokeWidth={3} />
          <span className="text-xs font-black uppercase tracking-widest">
            {cfg.cycleLabel} Cycle · Time Left
          </span>
        </div>
        <span className="text-xs font-bold opacity-70">
          {formatDateShort(cycle.cycleStart)} →{" "}
          {formatDateShort(new Date(cycle.cycleEnd.getTime() - 1))}
        </span>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2 md:gap-3">
        {[
          { k: "Days", v: r.days },
          { k: "Hrs", v: r.hours },
          { k: "Min", v: r.minutes },
          { k: "Sec", v: r.seconds },
        ].map((unit) => (
          <div
            key={unit.k}
            className="nb-card-sm p-2 md:p-3 text-center"
            style={{ background: cfg.accent, color: cfg.textOnAccent }}
            data-testid={`countdown-${unit.k.toLowerCase()}`}
          >
            <div
              className="num text-2xl md:text-4xl leading-none"
              key={unit.v}
            >
              {String(unit.v).padStart(2, "0")}
            </div>
            <div className="text-[10px] md:text-xs font-black uppercase tracking-widest mt-1">
              {unit.k}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <div className="h-3 w-full bg-white dark:bg-[#2a2a2c] border-2 border-black dark:border-white overflow-hidden">
          <div
            className="h-full transition-all duration-500"
            style={{
              width: `${cycle.progress}%`,
              background: cfg.accent,
            }}
            data-testid="cycle-progress-bar"
          />
        </div>
        <div className="flex justify-between mt-1 text-[10px] font-bold uppercase opacity-70 tracking-wider">
          <span>Cycle Start</span>
          <span>{cycle.progress.toFixed(0)}% elapsed</span>
          <span>Payout</span>
        </div>
      </div>
    </div>
  );
}
