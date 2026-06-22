import {
  Award,
  Check,
  ChevronRight,
  Grid3X3,
  Lightbulb,
  Plane,
  Rocket,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  Zap
} from "lucide-react";
import { Button } from "../ui/exports";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const stats = [
  { icon: Grid3X3, label: "10 yo'nalish" },
  { icon: Star, label: "100 ballik baholash" },
  { icon: Award, label: "Sertifikat" },
  { icon: ShieldCheck, label: "Shaffof baholash" }
];

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export function HeroSection() {
  return (
    <section id="top" className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-[#0a1128] to-[#050a1a]" />
        <div className="absolute top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-blue-900/20 to-transparent" />
        <div className="absolute bottom-0 right-0 w-[1000px] h-[1000px] bg-purple-900/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-3xl" />
      </div>

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none z-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.15) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px'
        }}
      />

      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-in slide-in-from-left duration-1000 fade-in">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm">
              <ShieldCheck size={16} className="text-blue-400" />
              <span className="text-sm font-semibold text-blue-300 uppercase tracking-wider">
                Hukumat ko'magidagi hududiy startap tanlovi
              </span>
            </div>

            {/* Heading */}
            <div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                G'oyangizni{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 animate-gradient-x">
                  startapga
                </span>
                {" "}aylantiring!
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-2xl">
              Qashqadaryo Startup Ligasi — yoshlar, talabalar, tadbirkorlar va innovatorlar uchun 
              hududiy startap tanlovi. G'oyangizni taqdim eting, mutaxassislar bilan ishlang va 
              mukofotni qo'lga kiriting.
            </p>

            {/* Info Cards */}
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { 
                  icon: Lightbulb, 
                  title: "Startap nima?", 
                  desc: "Innovatsion g'oya asosida yaratiladigan va tez o'sishga yo'naltirilgan loyiha." 
                },
                { 
                  icon: Zap, 
                  title: "Qanday quriladi?", 
                  desc: "Muammo aniqlanadi, yechim ishlab chiqiladi, MVP yaratiladi va sinovdan o'tkaziladi." 
                },
                { 
                  icon: Users, 
                  title: "Kimlar qatnashadi?", 
                  desc: "Talabalar, yosh tadqiqotchilar, tadbirkorlar, mustaqil ishtirokchilar va jamoalar." 
                }
              ].map((card, idx) => (
                <div 
                  key={idx} 
                  className="group relative p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                      <card.icon size={22} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-1">{card.title}</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">{card.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="primary" size="xl" className="group">
                <Plane size={20} />
                <span>Ariza topshirish</span>
                <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="xl">
                <TrendingUp size={20} />
                Yo'nalishlarni ko'rish
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-3 pt-4">
              {stats.map((stat, idx) => (
                <div 
                  key={idx} 
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm"
                >
                  <stat.icon size={18} className="text-blue-400" />
                  <span className="text-sm font-medium text-slate-300">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative hidden lg:block h-[600px] animate-in slide-in-from-right duration-1000 fade-in">
            {/* Main Dashboard Mockup */}
            <div className="relative z-10 transform perspective-[1200px] rotate-y-[-12deg] rotate-x-[6deg] hover:rotate-y-0 hover:rotate-x-0 transition-transform duration-700">
              <div className="relative w-full max-w-[520px] mx-auto h-[400px] bg-gradient-to-br from-slate-900 to-[#0a1128] rounded-3xl border border-white/20 shadow-2xl shadow-blue-500/20 overflow-hidden">
                {/* Screen Header */}
                <div className="h-12 border-b border-white/10 flex items-center px-4 gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg">
                    <Rocket size={14} className="text-blue-400" />
                    <span className="text-xs text-slate-400 font-medium">Qashqadaryo Startup Dashboard</span>
                  </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6 space-y-6">
                  {/* Header */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Innovatsiya</p>
                    <h3 className="text-2xl font-bold text-white">Kelajakni yarating</h3>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 p-4 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/20">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm text-slate-400">G'oya qiymati</span>
                        <span className="text-xs font-bold text-green-400">+12%</span>
                      </div>
                      <div className="text-3xl font-bold text-white mb-2">92 / 100</div>
                      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-[92%] bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-sm text-slate-400 mb-1">Bozor sinovi</div>
                      <div className="text-2xl font-bold text-white mb-1">78%</div>
                      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full w-[78%] bg-green-500 rounded-full" />
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-sm text-slate-400 mb-1">MVP</div>
                      <div className="text-2xl font-bold text-green-400 mb-1">Tayyor</div>
                      <div className="flex items-center gap-1 text-xs text-green-400/80">
                        <Check size={14} />
                        <span>Hammasi to'g'ri</span>
                      </div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-semibold text-slate-300">Rivojlanish趋势</span>
                      <span className="text-xs text-green-400 font-bold">+84%</span>
                    </div>
                    <div className="flex items-end justify-between gap-2 h-24">
                      {[40, 65, 50, 78, 62, 84].map((h, i) => (
                        <div key={i} className="w-full bg-gradient-to-t from-blue-600/40 to-blue-400 rounded-t-lg transition-all hover:from-blue-500/60" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>

                  {/* Team Mini */}
                  <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-sm font-semibold text-slate-300 mb-3 block">Jamoa</span>
                    <div className="flex items-center gap-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="relative">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${i === 1 ? 'bg-blue-500' : i === 2 ? 'bg-purple-500' : 'bg-yellow-500'}`}>
                            {String.fromCharCode(64 + i)}
                          </div>
                        </div>
                      ))}
                      <div className="w-8 h-8 rounded-full border-2 border-slate-900 flex items-center justify-center text-xs font-bold bg-slate-700 text-white">
                        +12
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Cards */}
              <div className="absolute -top-12 -right-12 animate-bounce-slow">
                <div className="p-4 rounded-xl bg-slate-900/90 border border-white/20 shadow-xl backdrop-blur-sm">
                  <div className="text-xs text-slate-400 mb-1">Startaplar soni</div>
                  <div className="text-2xl font-bold text-white">500+</div>
                </div>
              </div>

              <div className="absolute -bottom-12 -left-12 animate-bounce-slow" style={{ animationDelay: "1s" }}>
                <div className="p-4 rounded-xl bg-slate-900/90 border border-white/20 shadow-xl backdrop-blur-sm">
                  <div className="text-xs text-slate-400 mb-1">Yoshlar imkoniyati</div>
                  <div className="text-2xl font-bold text-white">18–30 yosh</div>
                </div>
              </div>

              <div className="absolute -top-12 -left-12 animate-bounce-slow" style={{ animationDelay: "0.5s" }}>
                <div className="p-4 rounded-xl bg-slate-900/90 border border-white/20 shadow-xl backdrop-blur-sm">
                  <div className="text-xs text-slate-400 mb-1">G'oya - Startap</div>
                  <div className="flex items-center gap-1 text-sm font-bold text-blue-400">
                    <TrendingUp size={18} />
                    <span>Rivojlanish yo'li</span>
                  </div>
                </div>
              </div>

              {/* Glow Effects */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-[200px] h-[200px] bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
    </section>
  );
}
