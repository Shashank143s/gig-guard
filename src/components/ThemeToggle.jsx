import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const KEY = "gigguard.theme.v1";

export default function ThemeToggle() {
  const [dark, setDark] = useState(() => {
    try {
      const v = localStorage.getItem(KEY);
      if (v) return v === "dark";
      return window.matchMedia?.("(prefers-color-scheme: dark)").matches ?? false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    try {
      localStorage.setItem(KEY, dark ? "dark" : "light");
    } catch {}
  }, [dark]);

  return (
    <button
      onClick={() => setDark((v) => !v)}
      data-testid="theme-toggle"
      aria-label="Toggle theme"
      className="nb-btn bg-white dark:bg-[#1c1c1e] text-black dark:text-white px-3 py-2 text-sm flex items-center gap-2"
    >
      {dark ? (
        <Sun className="w-4 h-4" strokeWidth={3} />
      ) : (
        <Moon className="w-4 h-4" strokeWidth={3} />
      )}
      <span className="hidden sm:inline font-black uppercase tracking-widest text-xs">
        {dark ? "Light" : "Dark"}
      </span>
    </button>
  );
}
