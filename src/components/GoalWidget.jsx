import { useEffect, useState } from "react";
import { Target, Trophy, Flame } from "lucide-react";
import { calculateAdjustment, getFloorWage, getProvince } from "../lib/wages";

const fmt = (n) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(n || 0);

const STORAGE = "gigguard.goal.v1";

export default function GoalWidget({ appId, basePay, activeHours, provinceCode, mileageKm, accent }) {
  const [goal, setGoal] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      if (!raw) return "";
      const parsed = JSON.parse(raw);
      return parsed[appId] ?? "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE);
      const parsed = raw ? JSON.parse(raw) : {};
      parsed[appId] = goal;
      localStorage.setItem(STORAGE, JSON.stringify(parsed));
    } catch {}
  }, [goal, appId]);

  const g = Number(goal) || 0;
  const hasInputs =
    g > 0 &&
    Number(activeHours) > 0 &&
    basePay !== "" &&
    activeHours !== "";

  let current = 0;
  let baseRate = 0;
  let hoursToGo = 0;
  let achieved = false;
  let progress = 0;
  let minPerHour = 0;

  if (hasInputs) {
    const r = calculateAdjustment({ basePay, activeHours, provinceCode, mileageKm });
    current = r.total;
    baseRate = r.baseRate;
    minPerHour = r.floorWage;
    const perExtraHour = Math.max(baseRate, minPerHour);
    achieved = current >= g;
    hoursToGo = achieved ? 0 : (g - current) / perExtraHour;
    progress = Math.min(100, (current / g) * 100);
  } else if (g > 0) {
    const province = getProvince(provinceCode);
    minPerHour = getFloorWage(province);
  }

  const wh = Math.floor(hoursToGo);
  const wm = Math.round((hoursToGo - wh) * 60);

  return (
    <div className="nb-card p-6 bg-white dark:bg-[#1c1c1e]" data-testid="goal-widget">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4" strokeWidth={3} />
          <h3 className="text-xs font-black uppercase tracking-widest">
            Cycle Goal
          </h3>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-widest text-[#666] dark:text-[#aaa]">
          {hasInputs ? "Live tracking" : "Set a target"}
        </span>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-2xl font-black num">$</span>
        <input
          data-testid="goal-input"
          type="number"
          inputMode="decimal"
          min={0}
          step={10}
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="500"
          className="nb-input w-32 px-3 py-2 text-2xl num"
        />
        <span className="text-xs font-bold uppercase tracking-widest text-[#444] dark:text-[#bbb]">
          this cycle
        </span>
      </div>

      {hasInputs && (
        <>
          <div className="mt-5">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest mb-1">
              <span>Earned · {fmt(current)}</span>
              <span data-testid="goal-progress-pct">{progress.toFixed(0)}%</span>
            </div>
            <div className="h-4 w-full bg-white dark:bg-[#2a2a2c] border-2 border-black dark:border-white overflow-hidden">
              <div
                className="h-full transition-all duration-500"
                style={{ width: `${progress}%`, background: accent }}
                data-testid="goal-progress-bar"
              />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            {achieved ? (
              <div
                className="nb-card-sm p-3 col-span-2"
                style={{ background: accent, color: accent === "#00CC99" ? "#000" : "#fff" }}
              >
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" strokeWidth={3} />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Goal smashed
                  </span>
                </div>
                <div className="num text-2xl mt-1 leading-none">
                  +{fmt(current - g)}
                </div>
                <div className="text-xs font-bold mt-1">
                  You're {fmt(current - g)} over target — keep stacking.
                </div>
              </div>
            ) : (
              <>
                <div className="nb-card-sm p-3 bg-[#FFF3B0]" data-testid="goal-hours-needed">
                  <div className="text-[10px] font-black uppercase tracking-widest text-black">
                    Hours to go
                  </div>
                  <div className="num text-2xl leading-none mt-1 text-black">
                    {wh}h {String(wm).padStart(2, "0")}m
                  </div>
                  <div className="text-[10px] font-bold mt-1 text-black/70">
                    at {fmt(Math.max(baseRate, minPerHour))}/hr effective
                  </div>
                </div>
                <div className="nb-card-sm p-3 bg-[#D4C4FB]">
                  <div className="text-[10px] font-black uppercase tracking-widest text-black">
                    Still owed
                  </div>
                  <div className="num text-2xl leading-none mt-1 text-black">
                    {fmt(g - current)}
                  </div>
                  <div className="text-[10px] font-bold mt-1 text-black/70 flex items-center gap-1">
                    <Flame className="w-3 h-3" strokeWidth={3} />
                    keep going
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}

      {!hasInputs && (
        <p className="mt-4 text-xs font-medium text-[#444] dark:text-[#bbb]">
          Enter your base pay and active hours above to track real-time progress
          toward your goal.
        </p>
      )}
    </div>
  );
}
