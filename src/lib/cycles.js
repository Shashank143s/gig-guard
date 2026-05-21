// Period cycle calculation for DoorDash (weekly Mon-Sun) and Uber (bi-weekly Mon-Sun).
// Returns the current cycle start, end, and time remaining.

export const APP_CONFIG = {
    doordash: {
      id: "doordash",
      name: "DoorDash",
      accent: "#FF4B3A",
      textOnAccent: "#FFFFFF",
      cycleDays: 7,
      cycleLabel: "Weekly",
      description: "Mon → Sun pay cycle",
    },
    uber: {
      id: "uber",
      name: "Uber Eats",
      accent: "#00CC99",
      textOnAccent: "#0a0a0a",
      cycleDays: 14,
      cycleLabel: "Bi-Weekly",
      description: "2-week pay cycle",
    },
  };
  
  // Anchor reference Monday (used to lock bi-weekly cycles to a consistent parity).
  // Monday, 2024-01-01 — every cycle aligns from this date.
  const ANCHOR = new Date(Date.UTC(2024, 0, 1, 0, 0, 0));
  
  function startOfWeekMonday(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0 Sun .. 6 Sat
    const diff = (day === 0 ? -6 : 1 - day);
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }
  
  export function getCurrentCycle(appId, now = new Date()) {
    const cfg = APP_CONFIG[appId];
    const cycleDays = cfg.cycleDays;
    const weekStart = startOfWeekMonday(now);
  
    let cycleStart = weekStart;
    if (cycleDays === 14) {
      const daysFromAnchor = Math.floor((weekStart - ANCHOR) / (1000 * 60 * 60 * 24));
      const offset = ((daysFromAnchor % 14) + 14) % 14;
      cycleStart = new Date(weekStart);
      cycleStart.setDate(weekStart.getDate() - offset);
    }
    const cycleEnd = new Date(cycleStart);
    cycleEnd.setDate(cycleStart.getDate() + cycleDays);
    cycleEnd.setHours(0, 0, 0, 0);
  
    const totalMs = cycleEnd - cycleStart;
    const elapsedMs = now - cycleStart;
    const remainingMs = Math.max(0, cycleEnd - now);
    const progress = Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));
  
    return {
      appId,
      config: cfg,
      cycleStart,
      cycleEnd,
      progress,
      remainingMs,
      totalMs,
    };
  }
  
  export function formatRemaining(ms) {
    if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    const totalSec = Math.floor(ms / 1000);
    const days = Math.floor(totalSec / 86400);
    const hours = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;
    return { days, hours, minutes, seconds };
  }
  
  export function formatDateShort(d) {
    return d.toLocaleDateString("en-CA", {
      month: "short",
      day: "numeric",
    });
  }
  