import { ArrowRight, Bike, Pizza, Sparkles } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function AppSelector({ onSelect }) {
  return (
    <div className="min-h-screen w-full bg-[#F4F4F0] dark:bg-[#0E0E10] bg-grid relative overflow-hidden transition-colors">
      {/* Top bar with theme toggle */}
      <div className="absolute top-5 right-5 md:top-8 md:right-10 z-10 flex items-center gap-3">
        <div
          className="anim-pulse-tag hidden sm:block"
          data-testid="floating-tag"
        >
          <div className="nb-card-sm px-3 py-1.5 text-xs font-black uppercase tracking-widest" style={{ background: "#FFF3B0", color: "#000" }}>
            <Sparkles className="inline w-3 h-3 mr-1" strokeWidth={3} />
            For Gig Heroes
          </div>
        </div>
        <ThemeToggle />
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-12 py-12 md:py-20">
        <header className="mb-10 md:mb-16 anim-slide-up">
          <div
            className="inline-block nb-card-sm px-3 py-1 mb-5"
            style={{ background: "#D4C4FB", color: "#000" }}
            data-testid="brand-pill"
          >
            <span className="text-xs font-black uppercase tracking-widest">
              GigGuard · Pay Floor Calculator
            </span>
          </div>
          <h1
            className="text-5xl sm:text-6xl md:text-7xl font-black tracking-tighter uppercase leading-[0.9]"
            data-testid="app-selector-heading"
          >
            Know what
            <br />
            <span className="bg-[#00CC99] px-3 border-4 border-black inline-block -rotate-1 mt-2">
              you're owed.
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl font-medium max-w-2xl opacity-80">
            Calculate the minimum-wage pay adjustment you should receive
            this cycle. Pick your app to get started.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          <button
            onClick={() => onSelect("doordash")}
            data-testid="select-doordash-btn"
            className="nb-btn nb-card-hover bg-[#FF4B3A] text-white p-8 text-left anim-slide-up delay-100 group"
            style={{ animationDelay: "100ms" }}
          >
            <div className="flex items-start justify-between">
              <Pizza className="w-12 h-12" strokeWidth={3} />
              <div className="nb-card-sm bg-white text-black px-3 py-1 -rotate-2">
                <span className="text-xs font-black uppercase">Weekly</span>
              </div>
            </div>
            <div className="mt-12">
              <div className="text-3xl md:text-4xl font-black tracking-tighter">
                DoorDash
              </div>
              <div className="mt-1 text-sm font-bold uppercase tracking-wider opacity-90">
                Mon → Sun · 7-day cycle
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm font-black uppercase">
              Calculate Pay
              <ArrowRight
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                strokeWidth={3}
              />
            </div>
          </button>

          <button
            onClick={() => onSelect("uber")}
            data-testid="select-uber-btn"
            className="nb-btn nb-card-hover bg-[#00CC99] text-black p-8 text-left anim-slide-up group"
            style={{ animationDelay: "200ms" }}
          >
            <div className="flex items-start justify-between">
              <Bike className="w-12 h-12" strokeWidth={3} />
              <div className="nb-card-sm bg-white text-black px-3 py-1 rotate-2">
                <span className="text-xs font-black uppercase">Bi-Weekly</span>
              </div>
            </div>
            <div className="mt-12">
              <div className="text-3xl md:text-4xl font-black tracking-tighter">
                Uber Eats
              </div>
              <div className="mt-1 text-sm font-bold uppercase tracking-wider opacity-80">
                14-day pay cycle
              </div>
            </div>
            <div className="mt-6 flex items-center gap-2 text-sm font-black uppercase">
              Calculate Pay
              <ArrowRight
                className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                strokeWidth={3}
              />
            </div>
          </button>
        </div>

        <div className="mt-12 grid sm:grid-cols-3 gap-4 anim-slide-up delay-300">
          {[
            { label: "Provinces", value: "2", note: "Ontario + BC" },
            { label: "Local-Only", value: "100%", note: "No login. No tracking." },
            { label: "Built For", value: "Gigs", note: "Part-time hustlers" },
          ].map((s) => (
            <div key={s.label} className="nb-card-sm p-4">
              <div className="text-xs font-bold uppercase opacity-70 tracking-widest">
                {s.label}
              </div>
              <div className="num text-3xl mt-1">{s.value}</div>
              <div className="text-xs font-medium opacity-80 mt-1">{s.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
