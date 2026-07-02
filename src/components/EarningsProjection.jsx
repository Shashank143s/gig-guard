import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { Plus, Minus, Zap, Info } from "lucide-react";
import { projectEarnings, calculateAdjustment } from "../lib/wages";

const fmtAxis = (n) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    maximumFractionDigits: 0,
  }).format(n || 0);

const fmt = (n) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(n || 0);

const MAX_EXTRA = 30;

export default function EarningsProjection({ inputs, accent }) {
  const [extra, setExtra] = useState(5);

  const baseline = useMemo(
    () => calculateAdjustment(inputs),
    [inputs]
  );

  const data = useMemo(() => {
    const steps = [];
    for (let h = 0; h <= MAX_EXTRA; h++) {
      const r = projectEarnings({ ...inputs, extraHours: h });
      steps.push({
        hours: h,
        total: r.total,
        adjustment: r.adjustment,
        base: r.basePay,
        topUpDelta: +(r.adjustment - baseline.adjustment).toFixed(2),
        totalDelta: +(r.total - baseline.total).toFixed(2),
      });
    }
    return steps;
  }, [inputs, baseline]);

  const selected = data[extra] || data[0];

  const dec = () => setExtra((v) => Math.max(0, v - 1));
  const inc = () => setExtra((v) => Math.min(MAX_EXTRA, v + 1));

  const baseRate = baseline.baseRate;
  const minWage = baseline.floorWage;
  const perHourTopUp = Math.max(0, +(minWage - baseRate).toFixed(2));
  const mileageBonus = baseline.mileageAdjustment || 0;

  return (
    <div className="nb-card p-6" data-testid="earnings-projection">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" strokeWidth={3} />
            <span className="text-xs font-black uppercase tracking-widest">
              What if I work more?
            </span>
          </div>
          <h3 className="display-font text-2xl md:text-3xl font-black tracking-tight mt-1">
            Project extra hours → extra cash
          </h3>
        </div>
        <div
          className="nb-card-sm px-4 py-2 min-w-[160px]"
          style={{ background: accent, color: accent === "#00CC99" ? "#0a0a0a" : "#fff" }}
          data-testid="projection-delta"
        >
          <div className="text-[10px] font-black uppercase tracking-widest">
            +{extra}h · extra top-up
          </div>
          <div className="num text-2xl leading-none mt-0.5" data-testid="projection-topup-delta">
            +{fmt(selected.topUpDelta)}
          </div>
          <div className="text-[10px] font-bold mt-1 opacity-90">
            Total take-home +{fmt(selected.totalDelta)}
          </div>
        </div>
      </div>

      {/* Disclaimer based on entered base pay */}
      <div className="mt-4 nb-card-sm p-3 bg-[#FFF3B0] dark:!bg-[#FFF3B0] flex items-start gap-2">
        <Info className="w-4 h-4 mt-0.5 shrink-0 text-black" strokeWidth={3} />
        <p className="text-[11px] font-bold leading-snug text-black">
          Based on your entered base pay of{" "}
          <span className="num">{fmt(baseRate)}</span>/active hour. The legal
          floor in {baseline.province.name} is{" "}
          <span className="num">{fmt(minWage)}</span>/hr, so every extra active
          hour adds about <span className="num">{fmt(perHourTopUp)}</span> in
          adjustment top-up (on top of your normal base pay)
          {baseline.province.code === "BC" && mileageBonus > 0 ? (
            <>
              , plus <span className="num">{fmt(mileageBonus)}</span> in mileage
              reimbursement
            </>
          ) : null}
          {Number(inputs.tips) > 0 ? (
            baseline.includeTips ? (
              <>
                , and includes <span className="num">{fmt(inputs.tips)}</span> in tips
              </>
            ) : (
              <>
                . Tips of <span className="num">{fmt(inputs.tips)}</span> are entered
                but excluded from this projection
              </>
            )
          ) : (
            "."
          )}
        </p>
      </div>

      {/* Slider control */}
      <div className="mt-5">
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <span className="text-xs font-black uppercase tracking-widest">
            Active hours increment
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={dec}
              data-testid="extra-decrement-btn"
              className="nb-btn bg-white px-3 py-1 text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:bg-[#1c1c1e]"
              aria-label="Decrease hours"
            >
              <Minus className="w-4 h-4" strokeWidth={3} />
            </button>
            <input
              type="number"
              min={0}
              max={MAX_EXTRA}
              value={extra}
              onChange={(e) => {
                const v = Math.min(MAX_EXTRA, Math.max(0, Number(e.target.value) || 0));
                setExtra(v);
              }}
              className="nb-input w-20 text-center px-2 py-1 text-lg"
              data-testid="extra-hours-input"
            />
            <button
              onClick={inc}
              data-testid="extra-increment-btn"
              className="nb-btn bg-white px-3 py-1 text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:bg-[#1c1c1e]"
              aria-label="Increase hours"
            >
              <Plus className="w-4 h-4" strokeWidth={3} />
            </button>
          </div>
        </div>

        <input
          type="range"
          min={0}
          max={MAX_EXTRA}
          value={extra}
          onChange={(e) => setExtra(Number(e.target.value))}
          data-testid="extra-hours-slider"
          className="w-full"
          style={{ accentColor: accent }}
        />
        <div className="flex justify-between mt-1 text-[10px] font-bold text-[#666] dark:text-[#aaa]">
          <span>+0h</span>
          <span>+10h</span>
          <span>+20h</span>
          <span>+{MAX_EXTRA}h</span>
        </div>
      </div>

      {/* Chart */}
      <div className="mt-6 h-72 -ml-3" data-testid="projection-chart">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
            <CartesianGrid stroke="currentColor" strokeDasharray="4 4" opacity={0.18} />
            <XAxis
              dataKey="hours"
              tick={{ fontFamily: "Chivo", fontWeight: 700, fontSize: 11, fill: "currentColor" }}
              stroke="currentColor"
              tickFormatter={(v) => `+${v}h`}
              interval={4}
            />
            <YAxis
              tick={{ fontFamily: "Chivo", fontWeight: 700, fontSize: 11, fill: "currentColor" }}
              stroke="currentColor"
              tickFormatter={(v) => fmtAxis(v)}
              width={60}
            />
            <Tooltip
              contentStyle={{
                background: "#fff",
                border: "3px solid #000",
                borderRadius: 8,
                boxShadow: "4px 4px 0 #000",
                fontFamily: "DM Sans",
                fontWeight: 700,
                color: "#111",
              }}
              formatter={(value, key) => {
                if (key === "total") return [fmt(value), "Total Pay"];
                if (key === "adjustment") return [fmt(value), "Adjustment"];
                return [fmt(value), key];
              }}
              labelFormatter={(v) => `+${v} active hour${v === 1 ? "" : "s"}`}
            />
            <ReferenceLine
              x={extra}
              stroke="currentColor"
              strokeWidth={3}
              strokeDasharray="6 4"
              ifOverflow="visible"
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="currentColor"
              strokeWidth={4}
              dot={false}
              activeDot={{ r: 7, fill: accent, stroke: "currentColor", strokeWidth: 3 }}
            />
            <Line
              type="monotone"
              dataKey="adjustment"
              stroke={accent}
              strokeWidth={3}
              strokeDasharray="6 4"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 mt-2 text-xs font-bold flex-wrap">
        <Legend label="Total Pay" />
        <Legend color={accent} dashed label="Adjustment Top-Up" />
      </div>

      {/* Quick scenarios — show top-up delta as headline */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
        {[1, 3, 5, 10].map((h) => {
          const p = data[Math.min(h, MAX_EXTRA)];
          return (
            <button
              key={h}
              onClick={() => setExtra(h)}
              data-testid={`quick-scenario-${h}h`}
              className="nb-card-sm p-3 text-left hover:bg-[#FFF3B0] dark:hover:!bg-[#FFF3B0] dark:hover:!text-black transition-colors"
            >
              <div className="text-[10px] font-black uppercase tracking-widest">
                +{h} hour{h === 1 ? "" : "s"}
              </div>
              <div className="num text-xl leading-none mt-1 break-words">
                +{fmt(p.topUpDelta)}
              </div>
              <div className="text-[9px] font-bold mt-1 opacity-70 leading-tight">
                top-up · total +{fmt(p.totalDelta)}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Legend({ color, dashed, label }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className="w-6 h-1"
        style={{
          background: dashed ? "transparent" : color || "currentColor",
          borderTop: dashed ? `3px dashed ${color}` : "none",
        }}
      />
      <span className="uppercase tracking-wider">{label}</span>
    </div>
  );
}
