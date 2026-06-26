import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Eye, FileText, RotateCcw, ClipboardList } from "lucide-react";
import { JudgeShell } from "../components/layout/JudgeShell";

const API = "/api/judge";

function fmtDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const DEMO = [
  { id: "1", application_number: "QSL-2026-001", project_name: "AgroTech Solution", direction: "Agrotexnologiyalar", stage: "Viloyat final bosqichi", total_score: 78, recommendation: "promising", submitted_at: "2026-07-20T14:22:00Z", status: "submitted" },
  { id: "3", application_number: "QSL-2026-003", project_name: "EduAI Platform", direction: "Ta'lim texnologiyalari", stage: "Viloyat final bosqichi", total_score: 65, recommendation: "not_promising", submitted_at: "2026-07-19T10:05:00Z", status: "submitted" },
];

export function JudgeCompletedPage() {
  const [evals, setEvals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reopenModal, setReopenModal] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/evaluations/completed`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(j => { setEvals((j?.data?.length ? j.data : DEMO)); })
      .catch(() => setEvals(DEMO))
      .finally(() => setLoading(false));
  }, []);

  return (
    <JudgeShell pageTitle="Yakunlangan baholar">
      <p style={{ fontSize: 14, color: "#667085", margin: "0 0 20px" }}>
        Siz yakuniy tasdiqlagan barcha loyihalar bahosi
      </p>

      <div style={{ background: "white", borderRadius: 14, border: "1px solid #E4E7EC", overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#667085" }}>Yuklanmoqda...</div>
        ) : evals.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <ClipboardList size={40} color="#E4E7EC" style={{ display: "block", margin: "0 auto 12px" }} />
            <div style={{ color: "#667085", fontSize: 14 }}>Yakunlangan baholar yo'q</div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{
              display: "grid", gridTemplateColumns: "100px 1fr 160px 120px 90px 120px 120px 90px 180px",
              padding: "12px 20px", background: "#F9FAFB", borderBottom: "1px solid #E4E7EC", gap: 10
            }} className="completed-header">
              {["Ariza raqami", "Loyiha nomi", "Yo'nalish", "Bosqich", "Ball", "Yakunlangan", "Tavsiya", "Holat", "Amal"].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "#667085", letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</div>
              ))}
            </div>
            {evals.map((e, idx) => (
              <div key={e.id} style={{
                display: "grid", gridTemplateColumns: "100px 1fr 160px 120px 90px 120px 120px 90px 180px",
                padding: "14px 20px", gap: 10, alignItems: "center",
                borderBottom: idx < evals.length - 1 ? "1px solid #F3F4F6" : "none"
              }} className="completed-row">
                <div style={{ fontSize: 12, color: "#667085", fontFamily: "monospace" }}>{e.application_number}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#101828" }}>{e.project_name}</div>
                <div style={{ fontSize: 12, color: "#344054" }}>{e.direction}</div>
                <div style={{ fontSize: 12, color: "#344054" }}>{e.stage}</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: e.total_score >= 70 ? "#16A34A" : e.total_score >= 50 ? "#D97706" : "#DC2626" }}>
                  {e.total_score}
                </div>
                <div style={{ fontSize: 12, color: "#667085" }}>{fmtDate(e.submitted_at)}</div>
                <div>
                  <span style={{
                    display: "inline-flex", alignItems: "center", gap: 4,
                    padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600,
                    background: e.recommendation === "promising" ? "#DCFCE7" : "#FEE2E2",
                    color: e.recommendation === "promising" ? "#14532D" : "#991B1B"
                  }}>
                    {e.recommendation === "promising" ? "Istiqbolli" : "Istiqbolsiz"}
                  </span>
                </div>
                <div>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", borderRadius: 99, fontSize: 12, fontWeight: 600, background: "#DCFCE7", color: "#14532D" }}>
                    <CheckCircle2 size={11} /> Yakunlangan
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <Link to={`/judge/projects/${e.id}`} style={btnS("#F9FAFB", "#344054")}>
                    <Eye size={12} /> Ko'rish
                  </Link>
                  <Link to={`/judge/projects/${e.id}/evaluate`} style={btnS("#EFF6FF", "#1E40AF")}>
                    <FileText size={12} /> Xulosa
                  </Link>
                  <button onClick={() => setReopenModal(e.id)} style={{ ...btnS("#FEF2F2", "#DC2626"), border: "none", cursor: "pointer" }}>
                    <RotateCcw size={12} /> Qayta ochish
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {reopenModal && (
        <ReopenModal evalId={reopenModal} onClose={() => setReopenModal(null)} />
      )}

      <style>{`
        @media (max-width: 1024px) {
          .completed-header { display: none !important; }
          .completed-row { display: flex !important; flex-direction: column; gap: 6px !important; }
        }
      `}</style>
    </JudgeShell>
  );
}

function ReopenModal({ evalId, onClose }: { evalId: string; onClose: () => void }) {
  const [reasonType, setReasonType] = useState("");
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!reasonType || !reason.trim()) return;
    setSending(true);
    try {
      await fetch(`${API}/evaluations/${evalId}/reopen-request`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reasonType, reason })
      });
      setDone(true);
    } finally { setSending(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 16, padding: "28px 32px", width: "100%", maxWidth: 480 }}>
        {done ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📨</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#344054", marginBottom: 6 }}>Murojaat yuborildi</div>
            <div style={{ fontSize: 13, color: "#667085", marginBottom: 20 }}>Administrator ko'rib chiqqanidan so'ng xabar olasiz.</div>
            <button onClick={onClose} style={{ padding: "9px 24px", borderRadius: 8, background: "#071B33", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}>Yopish</button>
          </div>
        ) : (
          <>
            <h3 style={{ fontSize: 17, fontWeight: 700, color: "#101828", margin: "0 0 6px" }}>Bahoni qayta ochish uchun murojaat</h3>
            <p style={{ fontSize: 13, color: "#667085", margin: "0 0 16px" }}>Administrator ruxsatisiz baho qayta tahrirlanmaydi.</p>
            <select value={reasonType} onChange={e => setReasonType(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #E4E7EC", borderRadius: 8, fontSize: 13, marginBottom: 12, outline: "none" }}>
              <option value="">Sabab turini tanlang</option>
              {["Texnik xato", "Mazmuniy xato", "Noto'g'ri ball", "Noto'g'ri izoh", "Boshqa sabab"].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <textarea value={reason} onChange={e => setReason(e.target.value)}
              rows={4} placeholder="Batafsil asoslantiring..."
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #E4E7EC", borderRadius: 8, fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", marginBottom: 16 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #E4E7EC", background: "white", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Bekor qilish</button>
              <button onClick={submit} disabled={sending || !reasonType || !reason.trim()} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "#D6A21E", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 700, opacity: !reasonType || !reason.trim() ? 0.5 : 1 }}>
                {sending ? "Yuborilmoqda..." : "Yuborish"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const btnS = (bg: string, color: string): React.CSSProperties => ({
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "5px 10px", borderRadius: 7, fontSize: 12, fontWeight: 600,
  background: bg, color, textDecoration: "none", whiteSpace: "nowrap"
});
