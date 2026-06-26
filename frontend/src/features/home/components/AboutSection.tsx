import { Check, ShieldCheck, Users, Target, Award, Zap } from "lucide-react";
import { useRef, useEffect, useState, useCallback } from "react";
import { Section, SectionHead, Button } from "./ui/exports";
import { aboutHighlights } from "../data/siteData";

// ─── SMALL CARDS DATA ─────────────────────────────────────────────────────────

const smallCardDescriptions = [
  "Mezonlar aniq va ochiq, natijalar real vaqtda.",
  "Sanoat sohasi va ta'lim mutaxassislari.",
  "Finalchilar uchun maxsus trening va mentorlik.",
  "Qashqadaryoda amalda sinovdan o'tkazish.",
  "Investorlar va hamkorlar bilan uchrashuv.",
  "Viloyatning innovatsion imkoniyatlarini oshirish.",
];

const bigCards = [
  {
    icon: ShieldCheck,
    color: "blue",
    iconBg: "bg-blue-500/10 text-blue-400",
    hoverBg: "hover:bg-gradient-to-br hover:from-blue-500/15 hover:to-purple-500/15",
    activeBorderColor: "rgb(59, 130, 246)",
    title: "Hukumat ko'magi",
    text: "Viloyat hokimligi va rahbarlik qo'llab-quvvatlaydi. Resurslar va imkoniyatlar bilan ta'minlanadi.",
  },
  {
    icon: Users,
    color: "green",
    iconBg: "bg-green-500/10 text-green-400",
    hoverBg: "hover:bg-gradient-to-br hover:from-green-500/15 hover:to-teal-500/15",
    activeBorderColor: "rgb(34, 197, 94)",
    title: "500+ ishtirokchi",
    text: "Viloyat bo'ylab barcha tumanlardan yoshlar, talabalar va tadbirkorlar qatnashadi.",
  },
  {
    icon: Target,
    color: "orange",
    iconBg: "bg-orange-500/10 text-orange-400",
    hoverBg: "hover:bg-gradient-to-br hover:from-orange-500/15 hover:to-yellow-500/15",
    activeBorderColor: "rgb(249, 115, 22)",
    title: "100 ballik baholash",
    text: "Aniq mezonlar, shaffof jarayon. Hakamlar hay'ati sanoat mutaxassislaridan iborat.",
  },
  {
    icon: Award,
    color: "purple",
    iconBg: "bg-purple-500/10 text-purple-400",
    hoverBg: "hover:bg-gradient-to-br hover:from-purple-500/15 hover:to-pink-500/15",
    activeBorderColor: "rgb(168, 85, 247)",
    title: "Sertifikat + investitsiya",
    text: "Finalchilar elektron sertifikat va investitsiya imkoniyatlariga ega bo'ladi.",
  },
];

// ─── AUTO-SCROLL HOOK ─────────────────────────────────────────────────────────

function useAutoScroll(speed = 0.6, reverse = false) {
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

        if (reverse) {
          if (posRef.current === 0) posRef.current = half;
          posRef.current -= speed;
          if (posRef.current <= 0) posRef.current = half;
        } else {
          posRef.current += speed;
          if (posRef.current >= half) posRef.current = 0;
        }

        viewport.scrollLeft = posRef.current;
      }
      rafRef.current = requestAnimationFrame(step);
    };

    rafRef.current = requestAnimationFrame(step);
  }, [speed, reverse]);

  useEffect(() => {
    start();
    return () => cancelAnimationFrame(rafRef.current);
  }, [start]);

  const pause = () => { isPaused.current = true; };
  const resume = () => { isPaused.current = false; };

  return { viewportRef, pause, resume };
}

// ─── SMALL CARDS AUTO-SCROLL ROW ─────────────────────────────────────────────

function SmallCardsRow() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const { viewportRef, pause, resume } = useAutoScroll(0.5, false); // left to right

  // Duplicate items for seamless loop
  const items = [...aboutHighlights, ...aboutHighlights];

  return (
    <div
      ref={viewportRef}
      className="overflow-x-auto overflow-y-hidden px-2 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onMouseEnter={pause}
      onMouseLeave={() => { setActiveIdx(null); resume(); }}
      onFocus={pause}
      onBlur={() => { setActiveIdx(null); resume(); }}
    >
      <div
        className="flex gap-6 will-change-transform"
        style={{ width: "max-content" }}
      >
        {items.map((highlight, idx) => {
          const realIdx = idx % aboutHighlights.length;
          const isActive = activeIdx === idx;

          return (
            <div
              key={idx}
              tabIndex={idx < aboutHighlights.length ? 0 : -1}
              onMouseEnter={() => setActiveIdx(idx)}
              onFocus={() => { pause(); setActiveIdx(idx); }}
              onBlur={() => setActiveIdx(null)}
              style={{
                borderWidth: '3px',
                borderStyle: 'solid',
                borderColor: isActive ? 'rgb(59, 130, 246)' : 'rgba(255, 255, 255, 0.1)'
              }}
              className={`
                flex-shrink-0 w-[320px] p-6 rounded-2xl cursor-pointer
                transition-all duration-300 outline-none
                ${isActive
                  ? "bg-blue-500/10 shadow-[0_0_32px_rgba(59,130,246,0.5)] scale-[1.03]"
                  : "bg-white/5 hover:bg-white/8"
                }
              `}
            >
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl flex-shrink-0 transition-colors duration-300 ${isActive ? "bg-blue-500/20 text-blue-300" : "bg-green-500/10 text-green-400"}`}>
                  <Check size={20} />
                </div>
                <div>
                  <h4 className={`text-base font-semibold mb-2 transition-colors duration-300 ${isActive ? "text-blue-300" : "text-white"}`}>
                    {highlight}
                  </h4>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {smallCardDescriptions[realIdx]}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── BIG CARDS AUTO-SCROLL ROW ────────────────────────────────────────────────

function BigCardsRow() {
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const { viewportRef, pause, resume } = useAutoScroll(0.4, true); // right to left (reverse)

  // Duplicate for seamless loop
  const items = [...bigCards, ...bigCards];

  return (
    <div
      ref={viewportRef}
      className="overflow-x-auto overflow-y-hidden px-2 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      onMouseEnter={pause}
      onMouseLeave={() => { setActiveIdx(null); resume(); }}
      onFocus={pause}
      onBlur={() => { setActiveIdx(null); resume(); }}
    >
      <div
        className="flex gap-6 will-change-transform"
        style={{ width: "max-content" }}
      >
        {items.map((card, idx) => {
          const isActive = activeIdx === idx;
          const Icon = card.icon;

          return (
            <div
              key={idx}
              tabIndex={idx < bigCards.length ? 0 : -1}
              onMouseEnter={() => setActiveIdx(idx)}
              onFocus={() => { pause(); setActiveIdx(idx); }}
              onBlur={() => setActiveIdx(null)}
              style={{
                borderWidth: "3px",
                borderStyle: "solid",
                borderColor: isActive ? card.activeBorderColor : "rgba(255, 255, 255, 0.1)"
              }}
              className={`
                flex-shrink-0 w-[340px] p-7 rounded-2xl cursor-pointer
                transition-all duration-300 backdrop-blur-xl outline-none
                ${isActive
                  ? "bg-white/10 shadow-[0_0_40px_rgba(139,92,246,0.6)] scale-[1.02]"
                  : "bg-white/5 hover:bg-white/8"
                }
              `}
            >
              <div className={`p-3 rounded-xl w-fit mb-4 transition-all duration-300 ${isActive ? "scale-110" : ""} ${card.iconBg}`}>
                <Icon size={24} />
              </div>
              <h3 className={`text-xl font-bold mb-2 transition-colors duration-300 ${isActive ? "text-white" : "text-white/90"}`}>
                {card.title}
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                {card.text}
              </p>

              {/* Active indicator bar */}
              <div className={`mt-4 h-0.5 rounded-full transition-all duration-500 ${isActive ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 w-full" : "bg-white/10 w-8"}`} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export function AboutSection() {
  return (
    <Section id="about">
      {/* Container chap-o'ngdan 5% joy qoldirish */}
      <div style={{ paddingLeft: '5vw', paddingRight: '5vw' }}>
        <SectionHead
          eyebrow="Tanlov haqida"
          title="Qashqadaryo Startup Ligasi"
          subtitle="Qashqadaryo viloyati hokimligi, Oliy ta'lim, fan va innovatsiyalar boshqarmasi, IT Park, OTMlar va hamkor tashkilotlar tomonidan o'tkaziladigan hududiy startap tanlovi."
        />

        <div className="space-y-10">
          {/* Small Cards — 6 ta, auto-scroll chap → o'ng */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Tanlov afzalliklari
            </p>
            <SmallCardsRow />
          </div>

          {/* Big Cards — 4 ta, auto-scroll o'ng → chap (teskari) */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Asosiy ko'rsatkichlar
            </p>
            <BigCardsRow />
          </div>

          {/* CTA */}
          <div className="pt-2">
            <Button variant="outline" className="group">
              <span>Tanlov haqida batafsil</span>
              <Zap size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </div>
    </Section>
  );
}
