import { TrendingUp, ShieldCheck, AlertTriangle } from "lucide-react";

const fmt = (n) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(n || 0);

export default function PayResults({ result, accent }) {
  if (!result) return null;
  const {
    basePay,
    guaranteed,
    adjustment,
    mileageAdjustment,
    mileageKm,
    mileageRate,
    tips,
    tipsAdjustment,
    includeTips,
    total,
    effectiveRate,
    baseRate,
    floorWage,
    province,
    usesGigRate,
    wageAdjustment,
  } = result;

  const showMileage = province.code === "BC";
  const showTips = Number(tips) > 0;
  const gridCols = showMileage && showTips
    ? "md:grid-cols-6"
    : showMileage || showTips
      ? "md:grid-cols-5"
      : "md:grid-cols-4";
  const hasAnyAdjustment = adjustment > 0;
  const heroLabel = wageAdjustment > 0 && mileageAdjustment > 0
    ? "Pay adjustment + mileage owed"
    : mileageAdjustment > 0
      ? "Mileage reimbursement owed"
      : "Pay adjustment owed";

  return (
    <div className="grid gap-4" data-testid="pay-results">
      {/* Hero adjustment card */}
      <div
        className="nb-card p-6 anim-pop"
        style={{ background: hasAnyAdjustment ? accent : "#FFF3B0", color: "#000" }}
      >
        <div className="flex items-center gap-2">
          {hasAnyAdjustment ? (
            <ShieldCheck className="w-5 h-5" strokeWidth={3} />
          ) : (
            <AlertTriangle className="w-5 h-5" strokeWidth={3} />
          )}
          <span className="text-xs font-black uppercase tracking-widest">
            {hasAnyAdjustment ? heroLabel : "No adjustment — you're above floor"}
          </span>
        </div>
        <div
          className="num text-5xl sm:text-6xl md:text-7xl mt-2 leading-none break-words"
          data-testid="adjustment-amount"
        >
          {fmt(adjustment)}
        </div>
        <div className="mt-3 text-sm font-bold">
          {wageAdjustment > 0 ? (
            <>
              Top-up to reach {province.name}'s {usesGigRate ? "gig-worker " : ""}
              floor of <span className="num">{fmt(floorWage)}</span>/hr.
              Your effective base pay is{" "}
              <span className="num">{fmt(baseRate)}</span>/active hour.
            </>
          ) : (
            <>
              Your base pay <span className="num">{fmt(baseRate)}</span>/hr already
              beats {province.name}'s floor of{" "}
              <span className="num">{fmt(floorWage)}</span>/hr.
            </>
          )}
        </div>
        {showMileage && mileageAdjustment > 0 && (
          <div className="mt-2 text-sm font-bold">
            Includes <span className="num">{fmt(mileageAdjustment)}</span> for{" "}
            <span className="num">{Number(mileageKm || 0).toFixed(1)}</span> km at{" "}
            <span className="num">{fmt(mileageRate)}</span>/km.
          </div>
        )}
        {showTips && (
          <div className="mt-2 text-sm font-bold">
            {includeTips ? (
              <>
                Includes <span className="num">{fmt(tipsAdjustment)}</span> in tips.
              </>
            ) : (
              <>
                Tips entered: <span className="num">{fmt(tips)}</span> (excluded from calculations).
              </>
            )}
          </div>
        )}
      </div>

      {/* Breakdown grid — 2 cols on mobile, 4 on md+ to prevent overflow */}
      <div className={`grid grid-cols-2 ${gridCols} gap-3`}>
        <StatTile label="Base Pay" value={fmt(basePay)} testid="stat-base-pay" />
        <StatTile
          label="Floor"
          value={fmt(guaranteed)}
          testid="stat-guaranteed"
          highlight="#FFF3B0"
        />
        {showMileage && (
          <StatTile
            label="Mileage"
            value={fmt(mileageAdjustment)}
            testid="stat-mileage"
            highlight="#D4C4FB"
          />
        )}
        {showTips && (
          <StatTile
            label="Tips"
            value={includeTips ? fmt(tipsAdjustment) : fmt(0)}
            testid="stat-tips"
            highlight="#FFF3B0"
          />
        )}
        <StatTile
          label="Take-Home"
          value={fmt(total)}
          testid="stat-total"
          highlight="#D4C4FB"
        />
        <StatTile
          label="$/hr"
          value={fmt(effectiveRate)}
          testid="stat-effective-rate"
          icon={<TrendingUp className="w-3.5 h-3.5" strokeWidth={3} />}
        />
      </div>
    </div>
  );
}

function StatTile({ label, value, highlight, testid, icon }) {
  return (
    <div
      className="nb-card-sm p-3 min-w-0"
      style={highlight ? { background: highlight, color: "#000" } : undefined}
      data-testid={testid}
    >
      <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest opacity-80">
        {icon}
        {label}
      </div>
      <div className="num text-lg sm:text-xl md:text-2xl mt-1 leading-none break-words">
        {value}
      </div>
    </div>
  );
}
