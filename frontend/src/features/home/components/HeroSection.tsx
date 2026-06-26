import {
  Award,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Grid3X3,
  Lightbulb,
  Plane,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";

const stats = [
  { icon: Grid3X3, value: "10", label: "yo'nalish" },
  { icon: Star, value: "100", label: "ballik baholash" },
  { icon: Award, value: "500+", label: "ishtirokchi maqsadi" }
];

const featureCards = [
  {
    icon: Lightbulb,
    title: "G'oya",
    desc: "Muammo va yechim aniq ifodalanadi."
  },
  {
    icon: Zap,
    title: "MVP",
    desc: "Birinchi ishlaydigan talqin tayyorlanadi."
  },
  {
    icon: Users,
    title: "Jamoa",
    desc: "Mentorlar bilan loyiha himoyaga olib chiqiladi."
  }
];

const milestones = ["Ro'yxatdan o'tish", "Mentorlik", "Demo Day"];

export function HeroSection() {
  return (
    <section id="top" className="relative isolate min-h-screen overflow-hidden pt-24 lg:pt-28">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,#020617_0%,#07122f_46%,#0b1024_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(14,165,233,0.22),transparent_34%,rgba(245,185,66,0.08)_66%,rgba(34,197,94,0.1))]" />
        <div
          className="absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(125, 173, 255, 0.24) 1px, transparent 1px),
              linear-gradient(90deg, rgba(125, 173, 255, 0.24) 1px, transparent 1px)
            `,
            backgroundSize: "64px 64px"
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-slate-950 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto w-[90%]">
        <div className="grid min-h-[calc(100vh-7rem)] items-center gap-12 py-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 lg:py-8">
          <div className="animate-in slide-in-from-left duration-1000 fade-in">
            <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-blue-200 shadow-[0_12px_40px_rgba(14,165,233,0.12)] backdrop-blur-sm">
              <ShieldCheck size={16} className="text-blue-400" />
              <span className="text-xs font-bold uppercase tracking-[0.16em] sm:text-sm">
                Hukumat ko'magidagi hududiy startap tanlovi
              </span>
            </div>

            <h1 className="mt-8 max-w-3xl text-5xl font-black leading-[0.98] tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-[82px]">
              G'oyangizni{" "}
              <span className="block bg-gradient-to-r from-sky-300 via-blue-400 to-violet-300 bg-clip-text text-transparent">
                startapga
              </span>
              aylantiring!
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
              Qashqadaryo Startup Ligasi — yoshlar, talabalar, tadbirkorlar va innovatorlar uchun
              hududiy startap tanlovi. G'oyangizni taqdim eting, mutaxassislar bilan ishlang va
              mukofotni qo'lga kiriting.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {featureCards.map((card) => (
                <article
                  key={card.title}
                  className="min-h-[132px] rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.18)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-blue-300/30 hover:bg-white/[0.09]"
                >
                  <div className="flex h-full flex-col gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
                      <card.icon size={22} />
                    </div>
                    <h3 className="text-base font-bold text-white">{card.title}</h3>
                    <p className="text-sm leading-6 text-slate-400">{card.desc}</p>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <a
                href="/register"
                className="group inline-flex min-h-[60px] items-center justify-center gap-3 rounded-2xl border border-white/10 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 px-8 py-4 text-lg font-bold text-white shadow-[0_22px_56px_rgba(37,99,235,0.32)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_26px_70px_rgba(37,99,235,0.42)]"
              >
                <Plane size={20} />
                <span>Ariza topshirish</span>
                <ChevronRight size={20} className="transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="#directions"
                className="inline-flex min-h-[60px] items-center justify-center gap-3 rounded-2xl border border-sky-400/40 bg-slate-950/35 px-8 py-4 text-lg font-bold text-sky-200 backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-500/10"
              >
                <TrendingUp size={20} />
                Yo'nalishlarni ko'rish
              </a>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              {milestones.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3.5 py-2 text-sm font-semibold text-slate-300"
                >
                  <CheckCircle2 size={16} className="text-emerald-300" />
                  {item}
                </span>
              ))}
            </div>
          </div>

          <div className="relative animate-in slide-in-from-right duration-1000 fade-in">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.06] p-3 shadow-[0_32px_90px_rgba(0,0,0,0.36)] backdrop-blur-xl sm:p-4">
              <div className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-slate-950/70">
                <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-200">
                    <CalendarDays size={14} />
                    1-15 iyul
                  </span>
                </div>

                <div className="relative">
                  <img
                    src="/illustrations/hero png.png"
                    alt="Qashqadaryo Startup Ligasi ishtirokchilari"
                    className="aspect-[16/10] w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/36 to-transparent p-5 pt-24">
                    <div className="max-w-sm">
                      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-sky-200">Demo Day</p>
                      <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                        Loyihangizni sahnaga olib chiqing
                      </h2>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 pt-3 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-white/10 bg-slate-950/45 p-4">
                    <stat.icon size={20} className="text-sky-300" />
                    <div className="mt-3 text-2xl font-black text-white">{stat.value}</div>
                    <div className="mt-1 text-sm leading-5 text-slate-400">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="absolute -left-3 top-10 hidden max-w-[210px] rounded-2xl border border-white/10 bg-slate-950/85 p-4 shadow-2xl backdrop-blur-xl xl:block">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">G'oya - Startap</p>
              <div className="mt-2 flex items-center gap-2 text-sm font-black text-sky-300">
                <TrendingUp size={18} />
                Rivojlanish yo'li
              </div>
            </div>

            <div className="absolute -right-3 bottom-24 hidden rounded-2xl border border-white/10 bg-slate-950/85 p-4 shadow-2xl backdrop-blur-xl xl:block">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Yoshlar imkoniyati</p>
              <div className="mt-2 text-2xl font-black text-white">18-30 yosh</div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 pb-8 sm:grid-cols-3 lg:hidden">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-400/10 text-sky-300">
                  <stat.icon size={20} />
                </div>
                <div>
                  <div className="text-xl font-black text-white">{stat.value}</div>
                  <div className="text-sm text-slate-400">{stat.label}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
