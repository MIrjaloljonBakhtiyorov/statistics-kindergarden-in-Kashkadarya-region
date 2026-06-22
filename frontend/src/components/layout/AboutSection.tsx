 import { Check, ShieldCheck, Users, Target, Award, Zap } from "lucide-react";
import { Section, SectionHead, Card, Button } from "../ui/exports";
import { aboutHighlights } from "../../data/siteData";

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export function AboutSection() {
  return (
    <Section id="about">
      <SectionHead
        eyebrow="Tanlov haqida"
        title="Qashqadaryo Startup Ligasi"
        subtitle="Qashqadaryo viloyati hokimligi, Oliy ta'lim, fan va innovatsiyalar boshqarmasi, IT Park, OTMlar va hamkor tashkilotlar tomonidan o'tkaziladigan hududiy startap tanlovi."
      />

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Left - Highlights */}
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {aboutHighlights.map((highlight, idx) => (
              <Card key={idx} className="p-5 hover:bg-white/10">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-green-500/10 text-green-400">
                    <Check size={18} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">{highlight}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {idx === 0 && "Mezonlar aniq va ochiq, natijalar real vaqtda."}
                      {idx === 1 && "Sanoat sohasi va ta'lim mutaxassislari."}
                      {idx === 2 && "Finalchilar uchun maxsus trening va mentorlik."}
                      {idx === 3 && "Qashqadaryoda amalda sinovdan o'tkazish."}
                      {idx === 4 && "Investorlar va hamkorlar bilan uchrashuv."}
                      {idx === 5 && "Viloyatning innovatsion imkoniyatlarini oshirish."}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Button variant="outline" className="group">
            <span>Tanlov haqida batafsil</span>
            <Zap size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

        {/* Right - Stats */}
        <div className="grid grid-cols-2 gap-6">
          <Card className="p-6 hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-purple-500/10">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 w-fit mb-4">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Hukumat ko'magi</h3>
            <p className="text-sm text-slate-400">
              Viloyat hokimligi va rahbarlik qo'llab-quvvatlaydi. Resurslar va imkoniyatlar bilan ta'minlanadi.
            </p>
          </Card>

          <Card className="p-6 hover:bg-gradient-to-br hover:from-green-500/10 hover:to-teal-500/10">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-400 w-fit mb-4">
              <Users size={24} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">500+ ishtirokchi</h3>
            <p className="text-sm text-slate-400">
              Viloyat bo'ylab barcha tumanlardan yoshlar, talabalar va tadbirkorlar qatnashadi.
            </p>
          </Card>

          <Card className="p-6 hover:bg-gradient-to-br hover:from-orange-500/10 hover:to-yellow-500/10">
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 w-fit mb-4">
              <Target size={24} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">100 ballik baholash</h3>
            <p className="text-sm text-slate-400">
              Aniq mezonlar, shaffof jarayon. Hakamlar hay'ati sanoat mutaxassislaridan iborat.
            </p>
          </Card>

          <Card className="p-6 hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-pink-500/10">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 w-fit mb-4">
              <Award size={24} />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Sertifikat + investitsiya</h3>
            <p className="text-sm text-slate-400">
              Finalchilar elektron sertifikat va investitsiya imkoniyatlariga ega bo'ladi.
            </p>
          </Card>
        </div>
      </div>
    </Section>
  );
}
