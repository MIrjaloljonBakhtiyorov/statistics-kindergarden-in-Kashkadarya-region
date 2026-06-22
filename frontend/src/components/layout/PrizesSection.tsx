import { Trophy, Award, Star, Check, Zap, Rocket } from "lucide-react";
import { Section, SectionHead, Card, GradientText } from "../ui/exports";
import { prizes } from "../../data/siteData";

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export function PrizesSection() {
  return (
    <Section id="prizes" className="bg-gradient-to-b from-slate-950/30 to-transparent">
      <SectionHead
        eyebrow="Mukofotlar"
        title="Asosiy mukofotlar va imkoniyatlar"
        subtitle="G'oliblar nafaqat pul mukofotiga, balki mentorlik, akseleratsiya va investitsiya imkoniyatlariga ham ega bo'ladi."
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
        {prizes.map((prize) => (
          <Card 
            key={prize.id}
            className={`relative overflow-hidden group ${
              prize.tone === "gold" 
                ? "lg:col-span-2 hover:border-yellow-500/50 hover:shadow-[0_0_60px_rgba(251,191,36,0.25)]" 
                : "hover:shadow-[0_0_40px_rgba(139,92,246,0.15)]"
            }`}
            hover
            glow
          >
            {prize.tone === "gold" && (
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-yellow-400/5 to-transparent pointer-events-none" />
            )}
            
            <div className="relative z-10 p-6">
              <div className="flex items-start justify-between mb-6">
                <div className={`p-4 rounded-2xl ${
                  prize.tone === "gold" ? "bg-yellow-500/15 text-yellow-400" :
                  prize.tone === "silver" ? "bg-slate-500/15 text-slate-400" :
                  prize.tone === "bronze" ? "bg-orange-500/15 text-orange-400" :
                  "bg-purple-500/15 text-purple-400"
                }`}>
                  <prize.icon size={32} />
                </div>
                
                <div className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  prize.tone === "gold" ? "bg-yellow-500/20 text-yellow-300" :
                  prize.tone === "silver" ? "bg-slate-500/20 text-slate-300" :
                  prize.tone === "bronze" ? "bg-orange-500/20 text-orange-300" :
                  "bg-purple-500/20 text-purple-300"
                }`}>
                  {prize.tone === "gold" && "🏆 Asosiy"}
                  {prize.tone === "silver" && "🥈 2-o'rin"}
                  {prize.tone === "bronze" && "🥉 3-o'rin"}
                  {prize.tone === "special" && "⭐ Maxsus"}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">{prize.place}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className={`text-3xl font-bold ${
                      prize.tone === "gold" ? "text-yellow-400" :
                      prize.tone === "silver" ? "text-slate-400" :
                      prize.tone === "bronze" ? "text-orange-400" :
                      "text-purple-400"
                    }`}>
                      {prize.amount}
                    </span>
                  </div>
                </div>

                {prize.description && (
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {prize.description}
                  </p>
                )}

                {prize.highlights && (
                  <div className="space-y-2">
                    {prize.highlights.map((highlight, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="p-1 rounded bg-white/5">
                          <Check size={14} className="text-green-400" />
                        </div>
                        <span className="text-slate-300">{highlight}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {prize.tone === "gold" && (
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Prize Note Bar */}
      <Card className="p-6 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-white/10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/10">
              <Award size={24} className="text-blue-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-1">Barcha finalchilar uchun</h4>
              <p className="text-sm text-slate-400">
                <GradientText>Elektron sertifikat</GradientText>, hujjatlar, investitsiya imkoniyatlari va hamkorlik shartnomalari.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <Rocket size={18} className="text-blue-400" />
            <span className="text-sm font-medium text-slate-300">Akseleratsiya dasturi mavjud</span>
          </div>
        </div>
      </Card>
    </Section>
  );
}
