import { BrainCircuit, Sprout, GraduationCap, HeartHandshake, WalletCards, Landmark, Leaf, MapPin, Briefcase, Cpu } from "lucide-react";
import { Section, SectionHead, Card } from "./ui/exports";
import { directions } from "../data/siteData";
import type { Direction } from "../../../shared/types";

// ─── DATA ─────────────────────────────────────────────────────────────────────

const directionsData: Direction[] = directions;

// ─── COMPONENT ────────────────────────────────────────────────────────────────

export function CategoriesSection() {
  return (
    <Section id="directions">
      <SectionHead
        eyebrow="Tanlov yo'nalishlari"
        title="Qaysi yo'nalishdagi startaplar qatnashadi?"
        subtitle="IT dan agroga, ta'limdan sog'liqgacha — barcha innovatsion sohalarda qatnashish mumkin. 10 ta asosiy yo'nalishda tanlov o'tkaziladi."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {directionsData.map((direction) => (
          <Card 
            key={direction.title} 
            hover 
            glow
            className="group"
          >
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl" style={{ 
                    backgroundColor: `${direction.color}15`,
                    color: direction.color 
                  }}>
                    <direction.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                      {direction.title}
                    </h3>
                  </div>
                </div>
              </div>
              
              {direction.description && (
                <p className="text-sm text-slate-400 leading-relaxed">
                  {direction.description}
                </p>
              )}
            </div>
          </Card>
        ))}
      </div>
    </Section>
  );
}