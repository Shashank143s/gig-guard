import { Trash2, History, Pizza, Bike } from "lucide-react";
import { APP_CONFIG } from "../lib/cycles";

const fmt = (n) =>
  new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 2,
  }).format(n || 0);

export default function HistoryList({ history, onClear, onRemove, onLoad }) {
  return (
    <div className="nb-card p-6" data-testid="history-list">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4" strokeWidth={3} />
          <span className="text-xs font-black uppercase tracking-widest">
            Saved Calculations · {history.length}
          </span>
        </div>
        {history.length > 0 && (
          <button
            onClick={onClear}
            data-testid="clear-history-btn"
            className="text-xs font-black uppercase tracking-widest underline hover:text-[#FF4B3A] transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="nb-card-sm p-6 text-center" style={{ background: "#FFF3B0", color: "#000" }}>
          <div className="text-sm font-bold">
            No saved calculations yet. Hit{" "}
            <span className="px-2 py-0.5 bg-black text-white text-xs font-black uppercase">
              Save
            </span>{" "}
            to start tracking your cycles.
          </div>
        </div>
      ) : (
        <div className="grid gap-3">
          {history.map((h) => {
            const cfg = APP_CONFIG[h.appId];
            const Icon = h.appId === "doordash" ? Pizza : Bike;
            return (
              <div
                key={h.id}
                className="nb-card-sm p-4 flex items-center justify-between gap-3"
                data-testid={`history-item-${h.id}`}
              >
                <button
                  onClick={() => onLoad(h)}
                  className="flex items-center gap-3 text-left flex-1 min-w-0"
                >
                  <div
                    className="w-10 h-10 border-2 border-black flex items-center justify-center shrink-0"
                    style={{ background: cfg.accent, color: cfg.textOnAccent }}
                  >
                    <Icon className="w-5 h-5" strokeWidth={3} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-black uppercase tracking-widest truncate">
                      {cfg.name} · {h.province.name}
                    </div>
                    <div className="text-xs font-bold opacity-70 truncate">
                      {h.activeHours}h · base {fmt(h.basePay)} → adj {fmt(h.adjustment)}
                    </div>
                    {h.province?.code === "BC" && Number(h.mileageKm) > 0 && (
                      <div className="text-xs font-bold opacity-70 truncate">
                        Mileage {Number(h.mileageKm).toFixed(1)} km → {fmt(h.mileageAdjustment)}
                      </div>
                    )}
                    <div className="text-[10px] opacity-60">
                      {new Date(h.savedAt).toLocaleString("en-CA", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => onRemove(h.id)}
                  data-testid={`remove-history-${h.id}`}
                  className="nb-btn bg-white dark:bg-[#1c1c1e] p-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  aria-label="Remove"
                >
                  <Trash2 className="w-4 h-4" strokeWidth={3} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
