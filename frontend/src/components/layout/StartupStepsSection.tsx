import { Search, Lightbulb, Cuboid, BarChart3, Rocket, ArrowRight, Check } from "lucide-react";
import { Section, SectionHead, Card, GradientText } from "../ui/exports";
import { steps } from "../../data/siteData";

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export function StartupStepsSection() {
  return (
    <Section id="steps" className="relative">
      <SectionHead
        eyebrow="Startap qanday quriladi?"
        title="5 bosqichli rivojlanish yo'li"
        subtitle="G'oyadan tortib investitsiyagacha — har bir bosqich aniq va izchil tuzilgan."
      />

      {/* Timeline Connector */}
      <div className="hidden lg:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] h-0.5 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-transparent" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {steps.map((step, idx) => (
          <div key={idx} className="relative group">
            {/* Step Number */}
            <div className="absolute -top-4 -left-4 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold text-lg shadow-lg shadow-blue-500/20">
              {step.number}
            </div>

            <Card 
              className={`h-full p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(139,92,246,0.25)] ${
                idx === 0 ? "hover:border-blue-500/50" :
                idx === 1 ? "hover:border-indigo-500/50" :
                idx === 2 ? "hover:border-purple-500/50" :
                idx === 3 ? "hover:border-pink-500/50" :
                "hover:border-yellow-500/50"
              }`}
              hover
              glow
            >
              {/* Icon */}
              <div className={`p-4 rounded-2xl w-fit mb-4 ${
                idx === 0 ? "bg-blue-500/10 text-blue-400" :
                idx === 1 ? "bg-indigo-500/10 text-indigo-400" :
                idx === 2 ? "bg-purple-500/10 text-purple-400" :
                idx === 3 ? "bg-pink-500/10 text-pink-400" :
                "bg-yellow-500/10 text-yellow-400"
              }`}>
                <step.icon size={28} />
              </div>

              {/* Content */}
              <div className="space-y-3">
                <h3 className="text-xl font-bold text-white leading-tight">
                  {step.title}
                </h3>
                
                {step.description && (
                  <p className="text-sm text-slate-400 leading-relaxed">
                    {step.description}
                  </p>
                )}
              </div>

              {/* Checkmark */}
              <div className="mt-6 flex items-center gap-2 text-sm text-green-400">
                <Check size={16} />
                <span className="font-medium">Tayyor</span>
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Timeline Progress Bar */}
      <div className="mt-12 relative">
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full w-full bg-gradient-to-r from-blue-500 via-purple-500 to-yellow-500 animate-gradient-x" />
        </div>
        
        <div className="flex justify-between mt-4">
          {["Boshlanish", "Tahlil", "Rivojlanish", "Sinov", "Muvaffaqiyat"].map((label, idx) => (
            <div key={idx} className="text-center">
              <div className="w-3 h-3 rounded-full bg-white border-2 border-blue-500 mx-auto mb-2" />
              <span className="text-xs font-semibold text-slate-400">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}
