import { Calendar, Clock, CalendarDays, Award, Trophy, Rocket } from "lucide-react";
import { Section, SectionHead, Card, Button } from "./ui/exports";
import { importantDates } from "../data/siteData";

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export function DatesSection() {
  return (
    <Section id="dates">
      <SectionHead
        eyebrow="Muhim sanalar"
        title="Tanlov jadvali"
        subtitle="Ariza topshirishdan g'oliblarni taqdirlashgacha — hamma bosqichlar rejalashtirilgan."
        action={
          <div className="flex items-center gap-2 text-sm">
            <Clock size={16} className="text-blue-400" />
            <span className="text-slate-400">Muddod: 1 iyul - 30 avgust</span>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {importantDates.map((date) => (
          <Card 
            key={date.id}
            className="p-6 hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-purple-500/10 group"
            hover
            glow
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                <CalendarDays size={24} />
              </div>
              
              <div className="px-3 py-1 rounded-full bg-white/5 text-xs font-semibold text-slate-400">
                {date.id === "application" && "Ro'yxatdan o'tish"}
                {date.id === "selection" && "Saralash"}
                {date.id === "final" && "Final"}
                {date.id === "awards" && "Taqdimot"}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">{date.date}</span>
                <span className="text-sm text-slate-500">•</span>
                <span className="text-sm text-blue-400 font-semibold">2026</span>
              </div>
              
              <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                {date.title}
              </h3>
              
              {date.description && (
                <p className="text-sm text-slate-400 leading-relaxed">
                  {date.description}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* Countdown Bar */}
      <Card className="mt-8 p-6 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-white/10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/10">
              <Rocket size={24} className="text-blue-400" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-1">Arizalar ochiladi</h4>
              <p className="text-sm text-slate-400">
                1-iyul kuni platformada ariza topshirish ochiladi
              </p>
            </div>
          </div>
          
          <Button variant="primary" className="group">
            <Calendar size={18} />
            <span>Batafsil jadval</span>
          </Button>
        </div>
      </Card>
    </Section>
  );
}
