import { Award, Check, Handshake, Rocket, Sparkles, Trophy } from "lucide-react";
import { useRef, useEffect, useCallback, useState } from "react";
import { prizes } from "../data/siteData";
import { Section, SectionHead } from "./ui/exports";


const toneStyles = {
  gold: {
    border: "border-yellow-400/55",
    activeBorder: "rgb(250,204,21)",
    bg: "from-yellow-400/20 via-amber-400/10 to-white/[0.04]",
    icon: "bg-yellow-400/15 text-yellow-300",
    text: "text-yellow-300",
    badge: "bg-yellow-400/12 text-yellow-200 border-yellow-400/40",
  },
  silver: {
    border: "border-sky-200/35",
    activeBorder: "rgb(186,230,253)",
    bg: "from-slate-200/12 via-white/[0.05] to-white/[0.03]",
    icon: "bg-slate-200/12 text-slate-200",
    text: "text-slate-200",
    badge: "bg-slate-200/10 text-slate-200 border-sky-200/30",
  },
  bronze: {
    border: "border-orange-400/45",
    activeBorder: "rgb(251,146,60)",
    bg: "from-orange-400/15 via-white/[0.05] to-white/[0.03]",
    icon: "bg-orange-400/15 text-orange-300",
    text: "text-orange-300",
    badge: "bg-orange-400/12 text-orange-200 border-orange-400/35",
  },
  special: {
    border: "border-violet-400/45",
    activeBorder: "rgb(167,139,250)",
    bg: "from-violet-500/15 via-sky-500/10 to-white/[0.03]",
    icon: "bg-violet-400/15 text-violet-300",
    text: "text-violet-300",
    badge: "bg-violet-400/12 text-violet-200 border-violet-400/35",
  },
};

const opportunities = [
  "Mentorlik va akseleratsiya",
  "Investorlar bilan uchrashuv",
  "Elektron sertifikat",
  "Hamkorlik shartnomalari",
];

// ─── AUTO-SCROLL HOOK ─────────────────────────────────────────────────────────

function useAutoScroll(speed = 0.7) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const isPaused = useRef(false);
  const rafRef = useRef<number>(0);
  const posRef = useRef(0);

  const start = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const step = () => {
      if (!isPaused.current && viewport) {
        const half = viewport.scrollWidth / 2;
        posRef.current += speed;
        if (posRef.current >= half) posRef.current = 0;
        viewport.scrollLeft = posRef.current;
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  }, [speed]);

  useEffect(() => {
    start();
    return () => cancelAnimationFrame(rafRef.current);
  }, [start]);

  const pause = useCallback(() => { isPaused.current = true; }, []);
  const resume = useCallback(() => { isPaused.current = false; }, []);

  return { viewportRef, pause, resume };
}

// ─── PRIZES SCROLL ROW ───────────────────────────────────────────────────────

function PrizesScrollRow() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const { viewportRef, pause, resume } = useAutoScroll(0.6);
  const allPrizes = [...prizes, ...prizes]; // duplicate for seamless loop

  return (
    <div
      ref={viewportRef}
      className="overflow-x-auto overflow-y-hidden px-2 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onMouseEnter={pause}
      onMouseLeave={() => { setActiveIdx(null); resume(); }}
      onFocus={pause}
      onBlur={() => { setActiveIdx(null); resume(); }}
    >
      <div className="flex gap-5 will-change-transform" style={{ width: "max-content" }}>
        {allPrizes.map((prize, idx) => {
          const style = toneStyles[prize.tone];
          const isActive = activeIdx === idx;
          const isMain = prize.tone === "gold";

          return (
            <article
              key={idx}
              tabIndex={idx < prizes.length ? 0 : -1}
              onMouseEnter={() => setActiveIdx(idx)}
              onFocus={() => { pause(); setActiveIdx(idx); }}
              onBlur={() => setActiveIdx(null)}
              style={{
                borderWidth: "3px",
                borderStyle: "solid",
                borderColor: isActive ? style.activeBorder : "rgba(255,255,255,0.1)",
                width: isMain ? "min(680px, 82vw)" : "min(320px, 76vw)",
                minHeight: "420px",
              }}
              className={`
                relative flex-shrink-0 rounded-[2rem] p-6 sm:p-8 cursor-pointer
                bg-gradient-to-br ${style.bg}
                backdrop-blur-xl outline-none
                transition-all duration-300 overflow-hidden
                ${isActive
                  ? "shadow-[0_0_40px_rgba(255,255,255,0.12)] scale-[1.015] -translate-y-1"
                  : "shadow-[0_24px_60px_rgba(0,0,0,0.28)] hover:-translate-y-1"
                }
              `}
            >
              {/* Top shimmer line */}
              <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

              {isMain ? (
                /* ── BIG (Gold) card ── */
                <div className="relative z-10 flex h-full flex-col justify-between gap-8">
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${style.icon}`}>
                        <prize.icon size={34} />
                      </div>
                      <span className={`rounded-full border px-4 py-2 text-sm font-bold ${style.badge}`}>
                        Asosiy mukofot
                      </span>
                    </div>
                    <div className="mt-8">
                      <p className="text-sm font-bold uppercase tracking-[0.18em] text-slate-400">
                        {prize.place}
                      </p>
                      <h3 className={`mt-3 text-5xl font-black leading-none tracking-tight ${style.text} sm:text-6xl`}>
                        {prize.amount}
                      </h3>
                      <p className="mt-5 max-w-xl text-base leading-7 text-slate-300">
                        Eng kuchli loyiha moliyaviy rag'bat, ekspertlar bilan ishlash va keyingi bosqichga chiqish
                        imkoniyatini qo'lga kiritadi.
                      </p>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {["Pitch tayyorlash", "MVP kuchaytirish", "Bozor sinovi"].map((item) => (
                      <div key={item} className="rounded-2xl border border-emerald-300/20 bg-slate-950/35 p-4">
                        <Check size={18} className="text-emerald-300" />
                        <p className="mt-3 text-sm font-semibold leading-5 text-white">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* ── SMALL card ── */
                <div className="relative z-10 flex h-full flex-col gap-5 justify-between">
                  <div className={`flex h-14 w-14 flex-none items-center justify-center rounded-2xl ${style.icon}`}>
                    <prize.icon size={28} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-xl font-black text-white">{prize.place}</h3>
                      <span className={`rounded-full border px-3 py-1 text-xs font-bold ${style.badge}`}>
                        Mukofot
                      </span>
                    </div>
                    <p className={`mt-2 text-3xl font-black ${style.text}`}>{prize.amount}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-400">{prize.description}</p>
                  </div>

                  {/* Active indicator bar */}
                  <div
                    className={`h-0.5 rounded-full transition-all duration-500 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 w-full"
                        : "bg-white/10 w-8"
                    }`}
                  />
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function PrizesSection() {
  return (
    <Section
      id="prizes"
      className="relative overflow-hidden bg-gradient-to-b from-slate-950/30 via-slate-950/10 to-transparent"
    >
      <SectionHead
        eyebrow="Mukofotlar"
        title="Asosiy mukofotlar va imkoniyatlar"
        subtitle="G'oliblar pul mukofoti bilan birga mentorlik, akseleratsiya va investitsiya imkoniyatlariga ham ega bo'ladi."
      />

      {/* Auto-scroll prizes row */}
      <PrizesScrollRow />

      {/* Bottom info cards */}
      <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-sky-400/35 bg-sky-500/10 p-6 backdrop-blur-xl">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-400/10 text-sky-300">
              <Rocket size={24} />
            </div>
            <div>
              <h4 className="text-lg font-black text-white">Akseleratsiya dasturi</h4>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                Finalchilar loyiha modeli, taqdimot va bozor strategiyasini ekspertlar bilan kuchaytiradi.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {opportunities.map((item, index) => {
            const icons = [Award, Handshake, Trophy, Sparkles];
            const Icon = icons[index];
            return (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-sky-300/20 bg-white/[0.05] p-4"
              >
                <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-white/10 text-sky-300">
                  <Icon size={20} />
                </div>
                <span className="text-sm font-semibold text-slate-200">{item}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
}
