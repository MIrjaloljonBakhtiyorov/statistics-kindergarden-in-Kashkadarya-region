import { Rocket, Plane, ArrowRight, Star, Zap, Target, Check } from "lucide-react";
import { Card, GradientText, Button } from "../ui/exports";

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export function CTASection() {
  return (
    <section className="relative py-20 lg:py-28 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-purple-950/20 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <Card className="p-8 lg:p-12 bg-gradient-to-br from-slate-900/50 via-slate-900/30 to-transparent border-white/10 backdrop-blur-xl overflow-hidden">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-purple-500/10 rounded-full blur-3xl" />

          <div className="grid lg:grid-cols-2 gap-12 relative z-10">
            {/* Left Content */}
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-300 text-sm font-semibold mb-4">
                  <Zap size={16} />
                  <span>YANGI MAVSUM</span>
                </div>
                
                <h2 className="text-4xl lg:text-5xl font-bold text-white leading-[1.1] mb-6">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                    Imkoniyatni boy bermang
                  </span>
                </h2>
                
                <p className="text-lg text-slate-400 leading-relaxed">
                  Qashqadaryo Startup Ligasiga ariza topshiring, g'oyangizni ekspertlar oldida taqdim eting 
                  va hududning eng yaxshi startaplari qatoriga kiring.
                </p>
              </div>

              {/* Benefits */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                  <Check size={20} className="text-green-400" />
                  <div>
                    <div className="text-sm font-semibold text-white">50 mln so'm</div>
                    <div className="text-xs text-slate-400">Asosiy mukofot</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                  <Check size={20} className="text-green-400" />
                  <div>
                    <div className="text-sm font-semibold text-white">Akseleratsiya</div>
                    <div className="text-xs text-slate-400">Mentorlik dasturi</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                  <Check size={20} className="text-green-400" />
                  <div>
                    <div className="text-sm font-semibold text-white">Investitsiya</div>
                    <div className="text-xs text-slate-400">Imkoniyatlari</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5">
                  <Check size={20} className="text-green-400" />
                  <div>
                    <div className="text-sm font-semibold text-white">Sertifikat</div>
                    <div className="text-xs text-slate-400">+ hujjatlar</div>
                  </div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button variant="primary" size="xl" className="group">
                  <Plane size={22} />
                  <span className="text-lg">Hoziroq ro'yxatdan o'tish</span>
                  <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button variant="outline" size="xl">
                  <Star size={22} />
                  <span className="text-lg">Tanlov haqida batafsil</span>
                </Button>
              </div>
            </div>

            {/* Right Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-6 text-center hover:bg-gradient-to-br hover:from-blue-500/20 hover:to-blue-600/20">
                <div className="text-5xl font-bold text-white mb-2">50M+</div>
                <div className="text-sm text-slate-400">so'm asosiy mukofot</div>
                <div className="mt-2 text-xs text-green-400 font-semibold">
                  <Target size={16} className="inline mr-1" />
                  Asosiy tanlov
                </div>
              </Card>
              
              <Card className="p-6 text-center hover:bg-gradient-to-br hover:from-purple-500/20 hover:to-pink-500/20">
                <div className="text-5xl font-bold text-white mb-2">10</div>
                <div className="text-sm text-slate-400">yo'nalish</div>
                <div className="mt-2 text-xs text-blue-400 font-semibold">
                  <Star size={16} className="inline mr-1" />
                  Turli sohalar
                </div>
              </Card>
              
              <Card className="p-6 text-center hover:bg-gradient-to-br hover:from-green-500/20 hover:to-teal-500/20">
                <div className="text-5xl font-bold text-white mb-2">100</div>
                <div className="text-sm text-slate-400">ballik baholash</div>
                <div className="mt-2 text-xs text-yellow-400 font-semibold">
                  <Zap size={16} className="inline mr-1" />
                  Shaffof baholash
                </div>
              </Card>
              
              <Card className="p-6 text-center hover:bg-gradient-to-br hover:from-yellow-500/20 hover:to-orange-500/20">
                <div className="flex items-center justify-center text-5xl font-bold text-white mb-2">
                  <Rocket size={48} className="text-blue-400" />
                </div>
                <div className="text-sm text-slate-400">Akseleratsiya imkoniyati</div>
                <div className="mt-2 text-xs text-purple-400 font-semibold">
                  <Check size={16} className="inline mr-1" />
                  Mentorlik dasturi
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
