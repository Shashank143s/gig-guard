import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Calculator as CalcIcon,
  Bookmark,
  MapPin,
  DollarSign,
  Clock4,
  Route,
  Banknote,
} from "lucide-react";
import { toast } from "sonner";
import { PROVINCES, calculateAdjustment, toDecimalHours, fromDecimalHours } from "../lib/wages";
import { APP_CONFIG } from "../lib/cycles";
import CountdownTimer from "./CountdownTimer";
import PayResults from "./PayResults";
import EarningsProjection from "./EarningsProjection";
import HistoryList from "./HistoryList";
import GoalWidget from "./GoalWidget";
import ThemeToggle from "./ThemeToggle";

const STORAGE_KEY = "gigguard.history.v1";
const PREFS_KEY = "gigguard.prefs.v1";
const VALID_PROVINCES = new Set(PROVINCES.map((p) => p.code));

function normalizeProvinceCode(code) {
  return VALID_PROVINCES.has(code) ? code : "ON";
}

export default function Calculator({ appId, onBack }) {
  const cfg = APP_CONFIG[appId];
  const [basePay, setBasePay] = useState(() => readPrefs().basePay ?? "");
  const initialPrefs = readPrefs();
  const initialHM = fromDecimalHours(Number(initialPrefs.activeHours) || 0);
  const [hoursPart, setHoursPart] = useState(
    initialPrefs.activeHours != null && initialPrefs.activeHours !== "" ? String(initialHM.h) : ""
  );
  const [minutesPart, setMinutesPart] = useState(
    initialPrefs.activeHours != null && initialPrefs.activeHours !== "" ? String(initialHM.m) : ""
  );
  const [provinceCode, setProvinceCode] = useState(() =>
    normalizeProvinceCode(readPrefs().provinceCode)
  );
  const [mileageKm, setMileageKm] = useState(() => readPrefs().mileageKm ?? "");
  const [tips, setTips] = useState(() => readPrefs().tips ?? "");
  const [includeTips, setIncludeTips] = useState(() => readPrefs().includeTips ?? false);
  const [history, setHistory] = useState(readHistory);

  const activeHours = useMemo(
    () => toDecimalHours(hoursPart, minutesPart),
    [hoursPart, minutesPart]
  );

  useEffect(() => {
    localStorage.setItem(
      PREFS_KEY,
      JSON.stringify({ basePay, activeHours, provinceCode, mileageKm, tips, includeTips })
    );
  }, [basePay, activeHours, provinceCode, mileageKm, tips, includeTips]);

  const hasInput =
    Number(basePay) >= 0 &&
    activeHours > 0 &&
    basePay !== "" &&
    (hoursPart !== "" || minutesPart !== "");

  const result = useMemo(() => {
    if (!hasInput) return null;
    return calculateAdjustment({
      basePay,
      activeHours,
      provinceCode,
      mileageKm,
      tips,
      includeTips,
    });
  }, [basePay, activeHours, provinceCode, mileageKm, tips, includeTips, hasInput]);

  const inputs = { basePay, activeHours, provinceCode, mileageKm, tips, includeTips };

  const saveResult = () => {
    if (!result) {
      toast.error("Enter base pay and active hours first.");
      return;
    }
    const entry = {
      id: cryptoId(),
      appId,
      ...result,
      savedAt: Date.now(),
    };
    const next = [entry, ...history].slice(0, 50);
    setHistory(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    toast.success("Calculation saved to history.");
  };

  const clearAll = () => {
    setHistory([]);
    localStorage.removeItem(STORAGE_KEY);
    toast("History cleared.");
  };

  const removeOne = (id) => {
    const next = history.filter((h) => h.id !== id);
    setHistory(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const loadOne = (h) => {
    setBasePay(String(h.basePay));
    const hm = fromDecimalHours(h.activeHours);
    setHoursPart(String(hm.h));
    setMinutesPart(String(hm.m));
    setProvinceCode(normalizeProvinceCode(h.province?.code));
    setMileageKm(h.province?.code === "BC" ? String(h.mileageKm ?? "") : "");
    setTips(String(h.tips ?? ""));
    setIncludeTips(Boolean(h.includeTips));
    toast(`Loaded ${APP_CONFIG[h.appId].name} entry.`);
  };

  return (
    <div className="min-h-screen w-full bg-[#F4F4F0] dark:bg-[#0E0E10] bg-dots transition-colors">
      <div className="max-w-6xl mx-auto px-5 md:px-12 py-6 md:py-10">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6 md:mb-10">
          <button
            onClick={onBack}
            data-testid="back-btn"
            className="nb-btn bg-white dark:bg-[#1c1c1e] px-4 py-2 text-sm flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={3} />
            Switch App
          </button>
          <div className="flex items-center gap-3 flex-wrap">
            <div
              className="nb-card-sm px-4 py-2 flex items-center gap-3"
              style={{ background: cfg.accent, color: cfg.textOnAccent }}
              data-testid="app-context"
            >
              <span className="text-xs font-black uppercase tracking-widest">
                {cfg.name}
              </span>
              <span className="text-xs font-bold opacity-90">·</span>
              <span className="text-xs font-bold uppercase tracking-wider opacity-90">
                {cfg.cycleLabel}
              </span>
            </div>
            <ThemeToggle />
          </div>
        </div>

        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-6 md:gap-8">
          {/* LEFT */}
          <div className="grid gap-6 anim-slide-up">
            <CountdownTimer appId={appId} />

            <div className="nb-card p-6">
              <div className="flex items-center gap-2 mb-4">
                <CalcIcon className="w-4 h-4" strokeWidth={3} />
                <h2 className="text-xs font-black uppercase tracking-widest">
                  Your numbers
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field
                  label="Base Pay (CAD)"
                  icon={<DollarSign className="w-4 h-4" strokeWidth={3} />}
                >
                  <input
                    data-testid="base-pay-input"
                    type="number"
                    min={0}
                    step="0.01"
                    inputMode="decimal"
                    value={basePay}
                    onChange={(e) => setBasePay(e.target.value)}
                    placeholder="e.g. 180.50"
                    className="nb-input w-full px-4 py-3 text-lg"
                  />
                </Field>

                <Field
                  label="Tips (CAD)"
                  icon={<Banknote className="w-4 h-4" strokeWidth={3} />}
                >
                  <input
                    data-testid="tips-input"
                    type="number"
                    min={0}
                    step="0.01"
                    inputMode="decimal"
                    value={tips}
                    onChange={(e) => setTips(e.target.value)}
                    placeholder="e.g. 22.00"
                    className="nb-input w-full px-4 py-3 text-lg"
                  />
                </Field>

                <Field
                  label="Active Time (hh : mm)"
                  icon={<Clock4 className="w-4 h-4" strokeWidth={3} />}
                >
                  <div className="flex items-center gap-2">
                    <input
                      data-testid="active-hours-input"
                      type="number"
                      min={0}
                      step={1}
                      inputMode="numeric"
                      value={hoursPart}
                      onChange={(e) => setHoursPart(e.target.value)}
                      placeholder="12"
                      className="nb-input w-full px-3 py-3 text-lg text-center"
                      aria-label="Hours"
                    />
                    <span className="num text-2xl">:</span>
                    <input
                      data-testid="active-minutes-input"
                      type="number"
                      min={0}
                      max={59}
                      step={1}
                      inputMode="numeric"
                      value={minutesPart}
                      onChange={(e) => {
                        const v = e.target.value;
                        if (v === "") return setMinutesPart("");
                        const n = Math.min(59, Math.max(0, Number(v) || 0));
                        setMinutesPart(String(n));
                      }}
                      placeholder="30"
                      className="nb-input w-full px-3 py-3 text-lg text-center"
                      aria-label="Minutes"
                    />
                  </div>
                  {activeHours > 0 && (
                    <div className="mt-1 text-[10px] font-bold text-[#666] dark:text-[#aaa] num">
                      = {activeHours.toFixed(2)} h
                    </div>
                  )}
                </Field>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between gap-4 nb-card-sm p-4">
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-widest">
                      Include tips
                    </div>
                    <div className="text-xs font-bold opacity-75 mt-1">
                      Count tips in your calculation, projections, and goal tracker.
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={includeTips}
                    data-testid="include-tips-toggle"
                    onClick={() => setIncludeTips((v) => !v)}
                    className={`nb-card relative inline-flex h-8 w-14 items-center rounded-full border-4 border-black transition-colors ${
                      includeTips ? "bg-[#00CC99]" : "bg-white dark:bg-[#1c1c1e]"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-black dark:bg-white transition-transform ${
                        includeTips ? "translate-x-3.5" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <Field
                  label="Province"
                  icon={<MapPin className="w-4 h-4" strokeWidth={3} />}
                >
                  <select
                    data-testid="province-select"
                    value={provinceCode}
                    onChange={(e) => setProvinceCode(e.target.value)}
                    className="nb-input w-full px-4 py-3 text-lg appearance-none cursor-pointer"
                  >
                    {PROVINCES.map((p) => {
                      const rate = p.gigWage && p.gigWage > p.minWage ? p.gigWage : p.minWage;
                      const tag = p.code === "BC" ? " · gig + mileage" : " · gig";
                      return (
                        <option key={p.code} value={p.code}>
                          {p.name} — ${rate.toFixed(2)}/hr{tag}
                        </option>
                      );
                    })}
                  </select>
                </Field>
              </div>

              {provinceCode === "BC" && (
                <div className="mt-4">
                  <Field
                    label="Mileage (km)"
                    icon={<Route className="w-4 h-4" strokeWidth={3} />}
                  >
                    <input
                      data-testid="mileage-input"
                      type="number"
                      min={0}
                      step="0.1"
                      inputMode="decimal"
                      value={mileageKm}
                      onChange={(e) => setMileageKm(e.target.value)}
                      placeholder="e.g. 24.5"
                      className="nb-input w-full px-4 py-3 text-lg"
                    />
                  </Field>
                  <div className="mt-1 text-[10px] font-bold text-[#666] dark:text-[#aaa]">
                    BC mileage reimbursement is added at $0.35/km.
                  </div>
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={saveResult}
                  disabled={!result}
                  data-testid="save-result-btn"
                  className="nb-btn bg-black dark:bg-white text-white dark:text-black px-5 py-3 text-sm flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Bookmark className="w-4 h-4" strokeWidth={3} />
                  Save Calculation
                </button>
                <button
                  onClick={() => {
                    setBasePay("");
                    setHoursPart("");
                    setMinutesPart("");
                    setMileageKm("");
                    setTips("");
                    setIncludeTips(false);
                    toast("Inputs reset.");
                  }}
                  data-testid="reset-inputs-btn"
                  className="nb-btn bg-white dark:bg-[#1c1c1e] px-5 py-3 text-sm"
                >
                  Reset
                </button>
              </div>
            </div>

            {result ? (
              <PayResults result={result} accent={cfg.accent} />
            ) : (
              <EmptyState accent={cfg.accent} />
            )}
          </div>

          {/* RIGHT */}
          <div className="grid gap-6 anim-slide-up delay-200">
            <GoalWidget
              appId={appId}
              basePay={basePay}
              activeHours={activeHours}
              provinceCode={provinceCode}
              mileageKm={mileageKm}
              tips={tips}
              includeTips={includeTips}
              accent={cfg.accent}
            />

            {hasInput ? (
              <EarningsProjection inputs={inputs} accent={cfg.accent} />
            ) : (
              <div className="nb-card p-6">
                <div className="text-xs font-black uppercase tracking-widest mb-2">
                  Projection chart
                </div>
                <div className="nb-card-sm p-6" style={{ background: "#D4C4FB", color: "#000" }}>
                  <div className="text-sm font-bold">
                    Enter your base pay and active hours to see how more hours
                    multiply your take-home.
                  </div>
                </div>
              </div>
            )}

            <HistoryList
              history={history}
              onClear={clearAll}
              onRemove={removeOne}
              onLoad={loadOne}
            />
          </div>
        </div>

        <footer className="mt-10 text-center text-[11px] font-bold uppercase tracking-widest text-[#666] dark:text-[#888]">
          GigGuard · For estimation only. Always cross-check with your app's pay statement.
        </footer>
      </div>
    </div>
  );
}

function Field({ label, icon, children }) {
  return (
    <label className="block">
      <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-80">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}

function EmptyState({ accent }) {
  return (
    <div className="nb-card p-8 text-center" data-testid="empty-results">
      <div
        className="inline-block nb-card-sm px-3 py-1 mb-3 -rotate-2"
        style={{ background: accent, color: accent === "#00CC99" ? "#000" : "#fff" }}
      >
        <span className="text-xs font-black uppercase tracking-widest">Ready</span>
      </div>
      <h3 className="display-font text-2xl md:text-3xl font-black tracking-tight">
        Plug in your numbers above
      </h3>
      <p className="text-sm font-medium opacity-80 mt-2 max-w-md mx-auto">
        We'll instantly calculate what the law says you should be earning at your
        province's minimum wage — and how to stack more.
      </p>
    </div>
  );
}

function readHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function readPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function cryptoId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
