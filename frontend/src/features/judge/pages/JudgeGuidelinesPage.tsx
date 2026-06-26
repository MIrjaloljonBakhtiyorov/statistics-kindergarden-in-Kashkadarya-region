import { useState } from "react";
import { CheckCircle2, Download, BookOpen, Shield, Eye, Target, Lightbulb, Layers, BarChart3, Rocket, DollarSign, Users, Presentation } from "lucide-react";
import { JudgeShell } from "../components/layout/JudgeShell";
import { EVAL_CRITERIA } from "../types";

const CRITERION_ICONS: Record<string, React.ElementType> = {
  Target, Lightbulb, Layers, BarChart3, Rocket, DollarSign, Users, Presentation,
};

const RULES = [
  { icon: Shield, title: "Xolislik prinsipi", text: "Har bir hakam loyihani shaxsiy manfaatlar, tanishlik yoki do'stlik asosida emas, balki belgilangan mezonlar asosida baholashi shart. Shaxsiy munosabatlar baholashga ta'sir qilmasligi kerak." },
  { icon: Eye, title: "Mustaqillik prinsipi", text: "Hakam boshqa hakamlarning ballari, izohlari yoki xulosalarini bilmagan holda, mustaqil ravishda baholash amalga oshirishi lozim. Bahoni birgalikda muhokama qilish taqiqlanadi." },
  { icon: Shield, title: "Maxfiylik talabi", text: "Loyiha ma'lumotlari, ishtirokchilarning shaxsiy ma'lumotlari va baholash natijalari uchinchi shaxslarga oshkor qilinmasligi shart. Maxfiylik buzilishi intizomiy choralar ko'rishga asos bo'ladi." },
  { icon: BookOpen, title: "Manfaatlar to'qnashuvi", text: "Agar hakam biror loyiha bilan shaxsiy, moliyaviy yoki kasbiy manfaatlar to'qnashuvi borligini aniqlasa, darhol administratorga xabar berishi va baholashdan chetlashishi shart." },
];

export function JudgeGuidelinesPage() {
  const [readConfirmed, setReadConfirmed] = useState(
    () => localStorage.getItem("judge-guidelines-read") === "1"
  );

  const confirm = () => {
    setReadConfirmed(true);
    localStorage.setItem("judge-guidelines-read", "1");
  };

  return (
    <JudgeShell pageTitle="Baholash mezonlari va yo'riqnoma">
      <div style={{ maxWidth: 900 }}>
        {/* Header card */}
        <div style={{
          background: "linear-gradient(135deg, #071B33 0%, #0d2845 100%)",
          borderRadius: 16, padding: "28px 32px", marginBottom: 24,
          display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <BookOpen size={24} color="#D6A21E" />
              <h1 style={{ fontSize: 20, fontWeight: 800, color: "white", margin: 0 }}>Hakamlar uchun yo'riqnoma</h1>
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", margin: 0, lineHeight: 1.5 }}>
              Qashqadaryo Startap Ligasi 2026 · Baholash bo'yicha rasmiy yo'riqnoma
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => window.print()} style={{
              display: "flex", alignItems: "center", gap: 6,
              background: "rgba(255,255,255,0.1)", color: "white",
              border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8,
              padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer"
            }}>
              <Download size={15} /> PDF yuklab olish
            </button>
          </div>
        </div>

        {/* Confirmed badge */}
        {readConfirmed && (
          <div style={{ background: "#DCFCE7", border: "1px solid #86EFAC", borderRadius: 12, padding: "12px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
            <CheckCircle2 size={18} color="#16A34A" />
            <span style={{ fontSize: 14, fontWeight: 600, color: "#14532D" }}>Yo'riqnomani o'qib chiqqaningiz tasdiqlangan</span>
          </div>
        )}

        {/* General rules */}
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #E4E7EC", padding: "24px 28px", marginBottom: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#101828", margin: "0 0 16px" }}>Baholashning umumiy qoidalari</h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="rules-grid">
            {RULES.map((rule, i) => (
              <div key={i} style={{ background: "#F9FAFB", borderRadius: 10, padding: "16px", border: "1px solid #E4E7EC" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: "#FFF7DF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <rule.icon size={16} color="#D6A21E" />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#101828" }}>{rule.title}</span>
                </div>
                <p style={{ fontSize: 12, color: "#667085", margin: 0, lineHeight: 1.6 }}>{rule.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Evaluation criteria */}
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #E4E7EC", overflow: "hidden", marginBottom: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ padding: "20px 28px", borderBottom: "1px solid #E4E7EC", background: "#F9FAFB" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#101828", margin: "0 0 4px" }}>8 ta baholash mezoni</h2>
            <p style={{ fontSize: 13, color: "#667085", margin: 0 }}>Loyiha jami 100 ballik tizim asosida baholanadi</p>
          </div>
          {EVAL_CRITERIA.map((c, idx) => {
            const Icon = CRITERION_ICONS[c.icon] ?? Target;
            return (
              <div key={c.id} style={{
                display: "flex", alignItems: "flex-start", gap: 16,
                padding: "18px 28px", borderBottom: idx < EVAL_CRITERIA.length - 1 ? "1px solid #F3F4F6" : "none"
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: "#F5F7FA", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={18} color="#071B33" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#101828" }}>{c.id}. {c.name}</div>
                      <div style={{ fontSize: 13, color: "#667085", marginTop: 4 }}>{c.description}</div>
                    </div>
                    <div style={{ background: "#071B33", color: "#D6A21E", padding: "5px 12px", borderRadius: 8, fontSize: 13, fontWeight: 700, flexShrink: 0, marginLeft: 16 }}>
                      {c.maxScore} ball
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div style={{ padding: "16px 28px", background: "#F9FAFB", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#344054" }}>Jami maksimal ball</span>
            <span style={{ fontSize: 20, fontWeight: 900, color: "#071B33" }}>100 ball</span>
          </div>
        </div>

        {/* Process guide */}
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #E4E7EC", padding: "24px 28px", marginBottom: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#101828", margin: "0 0 16px" }}>Baholash jarayoni tartibi</h2>
          {[
            { n: "1", title: "Materiallarni o'rganish", text: "Loyiha tafsilotlari sahifasida barcha tablarni ko'rib chiqing: mazmun, jamoa, materiallar, taqdimot jadvali." },
            { n: "2", title: "Mustaqil baholash", text: "Har bir mezon bo'yicha 0 dan maksimal ballgacha ball qo'ying. Boshqa hakamlar bilan maslahat qilmang." },
            { n: "3", title: "Izoh yozish", text: "Har bir mezon uchun qisqa izoh yozing. Bu sizning baholashingizni asoslaydi." },
            { n: "4", title: "Ekspert xulosasi", text: "10 ta maydonni to'ldiring: kuchli tomonlar, kamchiliklar, xavflar, tavsiyalar va boshqalar." },
            { n: "5", title: "Yakuniy tavsiya", text: "'Istiqbolli' yoki 'Istiqbolsiz' ni tanlang. Bu avtomatik qaror qabul qilmaydi." },
            { n: "6", title: "Yakuniy tasdiqlash", text: "Barcha maydonlarni tekshirib, yakuniy tasdiqlash tugmasini bosing. Bu amal qaytarib bo'lmaydi." },
          ].map(s => (
            <div key={s.n} style={{ display: "flex", gap: 14, marginBottom: 16 }}>
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#071B33", color: "#D6A21E", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, flexShrink: 0, marginTop: 2 }}>
                {s.n}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#101828" }}>{s.title}</div>
                <div style={{ fontSize: 13, color: "#667085", marginTop: 2 }}>{s.text}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Read confirmation */}
        {!readConfirmed && (
          <div style={{ background: "#FFF7DF", border: "1px solid #F0D882", borderRadius: 14, padding: "20px 24px", textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "#92400E", margin: "0 0 16px", lineHeight: 1.5 }}>
              Yo'riqnomani to'liq o'qib chiqdingizmi? Tasdiqlash tugmasini bosing.
            </p>
            <button onClick={confirm} style={{
              background: "#D6A21E", color: "white", border: "none", borderRadius: 10,
              padding: "12px 28px", fontSize: 14, fontWeight: 700, cursor: "pointer",
              display: "inline-flex", alignItems: "center", gap: 8
            }}>
              <CheckCircle2 size={16} /> Yo'riqnomani o'qib chiqdim
            </button>
          </div>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) { .rules-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </JudgeShell>
  );
}
