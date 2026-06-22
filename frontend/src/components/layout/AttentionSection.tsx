import { TrendingUp } from "lucide-react";
import { Section, SectionHead, Card } from "../ui/exports";
import { importanceItems } from "../../data/siteData";

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export function AttentionSection() {
  return (
    <Section id="importance" className="bg-gradient-to-b from-slate-950/30 to-transparent">
      <SectionHead
        eyebrow="Bugungi kunda startaplarga e'tibor"
        title="Nega startaplar dolzarb?"
        subtitle="Innovatsion g'oyalar va startaplar nafaqat iqtisodiyot, balki jamiyat hamda kelajak uchun muhim."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {importanceItems.map((item, idx) => (
          <Card 
            key={idx} 
            className="p-6 hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-purple-500/10 group"
            hover
            glow
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl flex-shrink-0 ${
                idx === 0 ? "bg-green-500/10 text-green-400" :
                idx === 1 ? "bg-blue-500/10 text-blue-400" :
                idx === 2 ? "bg-purple-500/10 text-purple-400" :
                idx === 3 ? "bg-orange-500/10 text-orange-400" :
                idx === 4 ? "bg-yellow-500/10 text-yellow-400" :
                "bg-pink-500/10 text-pink-400"
              }`}>
                <item.icon size={24} />
              </div>
              
              <div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {item.text}
                </p>
                
                {/* Stats */}
                <div className="mt-4 flex items-center gap-3">
                  <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
                    <TrendingUp size={14} />
                    <span>+84%</span>
                  </div>
                  <div className="text-xs text-slate-500">
                    {/* Decorative line */}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-6 text-center hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-blue-600/10">
          <div className="text-3xl font-bold text-white mb-2">5000+</div>
          <div className="text-sm text-slate-400">Yangi ish o'rinlari</div>
        </Card>
        
        <Card className="p-6 text-center hover:bg-gradient-to-br hover:from-green-500/10 hover:to-teal-500/10">
          <div className="text-3xl font-bold text-white mb-2">$2.5M+</div>
          <div className="text-sm text-slate-400">Investitsiya potensiali</div>
        </Card>
        
        <Card className="p-6 text-center hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-pink-500/10">
          <div className="text-3xl font-bold text-white mb-2">84%</div>
          <div className="text-sm text-slate-400">O'sish darajasi</div>
        </Card>
        
        <Card className="p-6 text-center hover:bg-gradient-to-br hover:from-yellow-500/10 hover:to-orange-500/10">
          <div className="text-3xl font-bold text-white mb-2">18–30</div>
          <div className="text-sm text-slate-400">Yoshlar imkoniyati</div>
        </Card>
      </div>
    </Section>
  );
}
