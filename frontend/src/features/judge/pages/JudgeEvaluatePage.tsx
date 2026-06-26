import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Save, CheckCircle2, AlertCircle, Info,
  Target, Lightbulb, Layers, BarChart3, Rocket, DollarSign, Users, Presentation,
  ChevronUp, ChevronDown
} from "lucide-react";
import { JudgeShell } from "../components/layout/JudgeShell";
import { EVAL_CRITERIA, type JudgeProject, type Recommendation } from "../types";

const API = "/api/judge";

const CRITERION_ICONS: Record<string, React.ElementType> = {
  Target, Lightbulb, Layers, BarChart3, Rocket, DollarSign, Users, Presentation,
};

const CONCLUSION_FIELDS = [
  { key: "strengths", label: "Loyihaning kuchli tomonlari" },
  { key: "weaknesses", label: "Loyihaning asosiy kamchiliklari" },
  { key: "techRisks", label: "Texnik xavflar" },
  { key: "marketRisks", label: "Bozor bilan bog'liq xavflar" },
  { key: "businessModelIssues", label: "Biznes modelidagi kamchiliklar" },
  { key: "teamAssessment", label: "Jamoa salohiyati bo'yicha xulosa" },
  { key: "improvements", label: "Loyihani takomillashtirish bo'yicha tavsiyalar" },
  { key: "pilotFeasibility", label: "Pilot loyiha sifatida sinab ko'rish imkoniyati" },
  { key: "regionalRelevance", label: "Qashqadaryo viloyati uchun amaliy ahamiyati" },
  { key: "nextSteps", label: "Keyingi rivojlanish bo'yicha tavsiya" },
];

export function JudgeEvaluatePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<JudgeProject | null>(null);
  const [evalId, setEvalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [started, setStarted] = useState(false);

  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [conclusions, setConclusions] = useState<Record<string, string>>({});
  const [recommendation, setRecommendation] = useState<Recommendation | "">("");
  const [justification, setJustification] = useState("");

  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const [finalizeModal, setFinalizeModal] = useState(false);
  const [conflictModal, setConflictModal] = useState(false);
  const [finalizeConfirmed, setFinalizeConfirmed] = useState(false);
  const [finalizeError, setFinalizeError] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalScore = EVAL_CRITERIA.reduce((sum, c) => sum + (scores[c.key] ?? 0), 0);

  useEffect(() => {
    fetch(`${API}/projects/${projectId}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(j => {
        if (j?.data) {
          const d = j.data;
          setProject(d);
          if (d.eval_id || d.evalId) {
            setEvalId(d.eval_id || d.evalId);
            setStarted(true);
          }
          if (d.status === "submitted" || d.eval_status === "submitted") setIsSubmitted(true);
          if (d.scores && Object.keys(d.scores).length > 0) { setScores(d.scores); setStarted(true); }
          if (d.comments) setComments(d.comments);
          if (d.recommendation) setRecommendation(d.recommendation);
          if (d.justification) setJustification(d.justification);
          const conc: Record<string, string> = {};
          CONCLUSION_FIELDS.forEach(f => { if ((d as any)[f.key]) conc[f.key] = (d as any)[f.key]; });
          setConclusions(conc);
        } else {
          setProject({ id: projectId!, applicationNumber: "QSL-2026-001", projectName: "AgroTech Solution", direction: "Agrotexnologiyalar", stage: "Viloyat final bosqichi", evalStatus: "pending", assignedDate: new Date().toISOString(), evalDeadline: "2026-07-30" });
        }
      })
      .catch(() => {
        setProject({ id: projectId!, applicationNumber: "QSL-2026-001", projectName: "AgroTech Solution", direction: "Agrotexnologiyalar", stage: "Viloyat final bosqichi", evalStatus: "pending", assignedDate: new Date().toISOString(), evalDeadline: "2026-07-30" });
      })
      .finally(() => setLoading(false));
  }, [projectId]);

  const startEval = async () => {
    try {
      const r = await fetch(`${API}/projects/${projectId}/start`, { method: "POST", credentials: "include" });
      const j = await r.json();
      if (j?.data?.evalId) setEvalId(j.data.evalId);
      setStarted(true);
    } catch { setStarted(true); }
  };

  const buildPayload = () => ({
    scores, comments, totalScore,
    ...Object.fromEntries(CONCLUSION_FIELDS.map(f => [f.key, conclusions[f.key] ?? ""])),
    recommendation: recommendation || undefined,
    justification,
  });

  const saveDraft = useCallback(async () => {
    if (!evalId || isSubmitted) return;
    setSaving(true);
    try {
      await fetch(`${API}/evaluations/${evalId}/draft`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload())
      });
      setSavedAt(new Date().toLocaleTimeString("uz-UZ"));
    } finally { setSaving(false); }
  }, [evalId, scores, comments, conclusions, recommendation, justification, isSubmitted]);

  useEffect(() => {
    if (!started || !evalId || isSubmitted) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => { saveDraft(); }, 2000);
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current); };
  }, [scores, comments, conclusions, recommendation, justification]);

  const setScore = (key: string, val: number) => {
    const criterion = EVAL_CRITERIA.find(c => c.key === key);
    if (!criterion) return;
    const clamped = Math.max(0, Math.min(criterion.maxScore, Math.round(val)));
    setScores(s => ({ ...s, [key]: clamped }));
  };

  if (loading) return <JudgeShell pageTitle="Baholash"><div style={{ textAlign: "center", padding: 60, color: "#667085" }}>Yuklanmoqda...</div></JudgeShell>;

  return (
    <JudgeShell pageTitle="Loyihani baholash">
      <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#667085", fontSize: 13, marginBottom: 16, padding: 0 }}>
        <ArrowLeft size={16} /> Orqaga
      </button>
      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 20, alignItems: "start" }} className="eval-layout">
        {/* LEFT */}
        <div>
          {/* Project info header */}
          <div style={{ background: "white", borderRadius: 14, padding: "20px 24px", border: "1px solid #E4E7EC", marginBottom: 20, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "monospace" }}>{project?.applicationNumber}</div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#101828", margin: "4px 0 8px" }}>{project?.projectName}</h2>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[project?.direction, project?.stage].filter(Boolean).map(t => (
                <span key={t} style={{ background: "#F3F4F6", color: "#344054", padding: "3px 10px", borderRadius: 6, fontSize: 12 }}>{t}</span>
              ))}
            </div>
          </div>

          {/* Agreement step */}
          {!started && !isSubmitted && (
            <div style={{ background: "white", borderRadius: 14, padding: "28px 28px", border: "1px solid #E4E7EC", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#101828", margin: "0 0 8px" }}>Baholashni boshlashdan oldin</h3>
              <p style={{ fontSize: 13, color: "#667085", margin: "0 0 20px" }}>Davom etish uchun quyidagi shartlarni tasdiqlang:</p>
              {[
                "Baholash mezonlari bilan tanishdim",
                "Loyihani xolis va mustaqil baholayman",
                "Manfaatlar to'qnashuvi mavjud emas",
                "Maxfiylik talablariga rioya qilaman",
              ].map((text, i) => (
                <label key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12, cursor: "pointer" }}>
                  <input type="checkbox" checked={agreed && i === 3 || i < 3 && agreed} onChange={() => {}} style={{ marginTop: 2 }} />
                  <span style={{ fontSize: 13, color: "#344054" }}>{text}</span>
                </label>
              ))}
              <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20, cursor: "pointer" }}>
                <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ marginTop: 2 }} />
                <span style={{ fontSize: 13, color: "#344054", fontWeight: 600 }}>Barcha shartlarni qabul qilaman va baholashni boshlayman</span>
              </label>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => { if (agreed) startEval(); }}
                  disabled={!agreed}
                  style={{
                    background: agreed ? "#D6A21E" : "#F3F4F6", color: agreed ? "white" : "#9CA3AF",
                    border: "none", borderRadius: 10, padding: "12px 24px",
                    fontSize: 14, fontWeight: 700, cursor: agreed ? "pointer" : "not-allowed"
                  }}>
                  Baholashni boshlash
                </button>
                <button onClick={() => setConflictModal(true)}
                  style={{ background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Manfaatlar to'qnashuvini bildirish
                </button>
              </div>
            </div>
          )}

          {/* Criteria cards */}
          {(started || isSubmitted) && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {EVAL_CRITERIA.map(criterion => {
                const Icon = CRITERION_ICONS[criterion.icon] ?? Target;
                const score = scores[criterion.key] ?? 0;
                const pct = Math.round((score / criterion.maxScore) * 100);
                return (
                  <div key={criterion.id} style={{ background: "white", borderRadius: 14, padding: "20px 24px", border: "1px solid #E4E7EC", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                        background: "#F5F7FA", display: "flex", alignItems: "center", justifyContent: "center"
                      }}>
                        <Icon size={18} color="#071B33" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "#101828" }}>{criterion.id}. {criterion.name}</div>
                            <div style={{ fontSize: 12, color: "#667085", marginTop: 2 }}>{criterion.description}</div>
                          </div>
                          <div style={{ background: "#071B33", color: "#D6A21E", padding: "4px 10px", borderRadius: 8, fontSize: 12, fontWeight: 700, flexShrink: 0, marginLeft: 12 }}>
                            maks. {criterion.maxScore}
                          </div>
                        </div>
                        <div style={{ marginTop: 14 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                            <div style={{ fontSize: 13, color: "#344054", fontWeight: 600 }}>Ball:</div>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <button onClick={() => !isSubmitted && setScore(criterion.key, score - 1)}
                                disabled={isSubmitted || score <= 0}
                                style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #E4E7EC", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#344054" }}>
                                <ChevronDown size={14} />
                              </button>
                              <input type="number" value={score} readOnly={isSubmitted}
                                onChange={e => setScore(criterion.key, Number(e.target.value))}
                                min={0} max={criterion.maxScore}
                                style={{
                                  width: 60, textAlign: "center", padding: "5px 8px",
                                  border: "1px solid #E4E7EC", borderRadius: 8, fontSize: 16,
                                  fontWeight: 800, color: "#071B33", outline: "none", background: isSubmitted ? "#F9FAFB" : "white"
                                }} />
                              <button onClick={() => !isSubmitted && setScore(criterion.key, score + 1)}
                                disabled={isSubmitted || score >= criterion.maxScore}
                                style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #E4E7EC", background: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#344054" }}>
                                <ChevronUp size={14} />
                              </button>
                              <span style={{ fontSize: 12, color: "#9CA3AF" }}>/ {criterion.maxScore}</span>
                            </div>
                          </div>
                          <div style={{ height: 6, background: "#F3F4F6", borderRadius: 99, overflow: "hidden", marginBottom: 12 }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: pct >= 70 ? "#16A34A" : pct >= 40 ? "#D6A21E" : "#DC2626", borderRadius: 99, transition: "width 0.3s" }} />
                          </div>
                          <textarea
                            value={comments[criterion.key] ?? ""} readOnly={isSubmitted}
                            onChange={e => setComments(c => ({ ...c, [criterion.key]: e.target.value }))}
                            placeholder="Bu mezon bo'yicha izoh kiriting (ixtiyoriy)..."
                            rows={2}
                            style={{ width: "100%", padding: "8px 12px", border: "1px solid #E4E7EC", borderRadius: 8, fontSize: 13, color: "#344054", outline: "none", resize: "vertical", boxSizing: "border-box", background: isSubmitted ? "#F9FAFB" : "white" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Conclusion fields */}
              <div style={{ background: "white", borderRadius: 14, padding: "24px 28px", border: "1px solid #E4E7EC", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#101828", margin: "0 0 4px" }}>Umumiy ekspert xulosasi</h3>
                <p style={{ fontSize: 13, color: "#667085", margin: "0 0 20px" }}>Har bir bo'limni to'ldiring</p>
                {CONCLUSION_FIELDS.map(f => (
                  <div key={f.key} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#344054", marginBottom: 6 }}>{f.label}</div>
                    <textarea
                      value={conclusions[f.key] ?? ""} readOnly={isSubmitted}
                      onChange={e => setConclusions(c => ({ ...c, [f.key]: e.target.value }))}
                      rows={3} maxLength={2000}
                      placeholder="Fikr-mulohazangizni yozing..."
                      style={{ width: "100%", padding: "10px 12px", border: "1px solid #E4E7EC", borderRadius: 8, fontSize: 13, color: "#344054", outline: "none", resize: "vertical", boxSizing: "border-box", background: isSubmitted ? "#F9FAFB" : "white" }}
                    />
                    <div style={{ fontSize: 11, color: "#9CA3AF", textAlign: "right" }}>{(conclusions[f.key] ?? "").length}/2000</div>
                  </div>
                ))}
                {/* Recommendation */}
                <div style={{ marginTop: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#344054", marginBottom: 10 }}>Yakuniy tavsiya</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    {[
                      { v: "promising" as const, label: "Istiqbolli", color: "#16A34A", bg: "#DCFCE7" },
                      { v: "not_promising" as const, label: "Istiqbolsiz", color: "#DC2626", bg: "#FEE2E2" },
                    ].map(opt => (
                      <button key={opt.v} disabled={isSubmitted}
                        onClick={() => setRecommendation(recommendation === opt.v ? "" : opt.v)}
                        style={{
                          padding: "10px 20px", borderRadius: 8, fontWeight: 700, fontSize: 14,
                          border: `2px solid ${recommendation === opt.v ? opt.color : "#E4E7EC"}`,
                          background: recommendation === opt.v ? opt.bg : "white",
                          color: recommendation === opt.v ? opt.color : "#667085",
                          cursor: isSubmitted ? "not-allowed" : "pointer"
                        }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: "#667085", marginTop: 8 }}>
                    <Info size={12} style={{ display: "inline", marginRight: 4 }} />
                    Bu tavsiya ekspert xulosasi hisoblanadi va loyihani avtomatik ravishda keyingi bosqichga o'tkazmaydi.
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#344054", marginBottom: 6 }}>Asoslantiruvchi izoh</div>
                    <textarea value={justification} readOnly={isSubmitted}
                      onChange={e => setJustification(e.target.value)}
                      rows={3} placeholder="Nima sababdan ushbu tavsiyani berdingiz?"
                      style={{ width: "100%", padding: "10px 12px", border: "1px solid #E4E7EC", borderRadius: 8, fontSize: 13, color: "#344054", outline: "none", resize: "vertical", boxSizing: "border-box", background: isSubmitted ? "#F9FAFB" : "white" }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT sticky panel */}
        <div style={{ position: "sticky", top: 88 }}>
          {/* Score card */}
          <div style={{ background: "linear-gradient(135deg, #071B33 0%, #0d2845 100%)", borderRadius: 14, padding: "24px", boxShadow: "0 4px 20px rgba(7,27,51,0.2)", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}>Jami ball</div>
            <div style={{ fontSize: 48, fontWeight: 900, color: totalScore >= 70 ? "#16A34A" : totalScore >= 40 ? "#D6A21E" : "white", lineHeight: 1 }}>
              {totalScore}
              <span style={{ fontSize: 20, fontWeight: 500, color: "rgba(255,255,255,0.4)" }}> / 100</span>
            </div>
            <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: 99, overflow: "hidden", marginTop: 12 }}>
              <div style={{
                height: "100%", width: `${totalScore}%`,
                background: totalScore >= 70 ? "#16A34A" : totalScore >= 40 ? "#D6A21E" : "#DC2626",
                borderRadius: 99, transition: "width 0.5s"
              }} />
            </div>
            {savedAt && (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 10, display: "flex", alignItems: "center", gap: 4 }}>
                <CheckCircle2 size={11} /> Qoralama saqlangan: {savedAt}
              </div>
            )}
            {saving && <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 10 }}>Saqlanmoqda...</div>}
          </div>

          {/* Per-criterion scores */}
          <div style={{ background: "white", borderRadius: 14, border: "1px solid #E4E7EC", padding: "16px", marginBottom: 16, boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#344054", marginBottom: 10 }}>Mezonlar bo'yicha</div>
            {EVAL_CRITERIA.map(c => (
              <div key={c.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontSize: 11, color: "#667085", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: 8 }}>{c.name}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: scores[c.key] !== undefined ? "#071B33" : "#E4E7EC", flexShrink: 0 }}>
                  {scores[c.key] ?? "—"}/{c.maxScore}
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          {(started || isSubmitted) && !isSubmitted && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={saveDraft} disabled={saving}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px", borderRadius: 10, border: "1px solid #E4E7EC", background: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#344054" }}>
                <Save size={16} /> {saving ? "Saqlanmoqda..." : "Qoralamani saqlash"}
              </button>
              <button onClick={() => setFinalizeModal(true)}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "12px", borderRadius: 10, border: "none", background: "#D6A21E", color: "white", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                <CheckCircle2 size={16} /> Baholashni yakunlash
              </button>
            </div>
          )}

          {isSubmitted && (
            <div style={{ background: "#DCFCE7", border: "1px solid #86EFAC", borderRadius: 12, padding: "16px", textAlign: "center" }}>
              <CheckCircle2 size={24} color="#16A34A" style={{ display: "block", margin: "0 auto 8px" }} />
              <div style={{ fontSize: 14, fontWeight: 700, color: "#14532D" }}>Baholash yakunlandi</div>
              <div style={{ fontSize: 12, color: "#166534", marginTop: 4 }}>Barcha maydonlar read-only holatda</div>
            </div>
          )}
        </div>
      </div>

      {/* Finalize modal */}
      {finalizeModal && (
        <FinalizeModal
          totalScore={totalScore}
          scores={scores}
          recommendation={recommendation}
          onConfirm={async () => {
            setFinalizeError("");
            if (!recommendation) { setFinalizeError("Yakuniy tavsiya tanlanmagan"); return; }
            const allScored = EVAL_CRITERIA.every(c => scores[c.key] !== undefined && scores[c.key] !== null);
            if (!allScored) { setFinalizeError("Barcha mezonlarga ball qo'ying"); return; }
            if (!finalizeConfirmed) { setFinalizeError("Tasdiqlash flagini belgilang"); return; }
            try {
              const id = evalId;
              if (!id) { setIsSubmitted(true); setFinalizeModal(false); return; }
              await fetch(`${API}/evaluations/${id}/finalize`, {
                method: "POST", credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...buildPayload(), recommendation })
              });
              setIsSubmitted(true);
              setFinalizeModal(false);
            } catch (e) { setFinalizeError("Xatolik yuz berdi. Qayta urinib ko'ring."); }
          }}
          error={finalizeError}
          confirmed={finalizeConfirmed}
          onConfirmedChange={setFinalizeConfirmed}
          onClose={() => setFinalizeModal(false)}
        />
      )}

      {conflictModal && <ConflictModal projectId={project?.id ?? ""} onClose={() => setConflictModal(false)} onConfirm={() => { setConflictModal(false); navigate(-1); }} />}

      <style>{`
        @media (max-width: 1024px) { .eval-layout { grid-template-columns: 1fr !important; } }
      `}</style>
    </JudgeShell>
  );
}

// ─── FinalizeModal ───────────────────────────────────────────────────────────
function FinalizeModal({
  totalScore, scores, recommendation, onConfirm, onClose,
  error, confirmed, onConfirmedChange
}: {
  totalScore: number; scores: Record<string, number>;
  recommendation: string;
  onConfirm: () => void; onClose: () => void;
  error: string; confirmed: boolean; onConfirmedChange: (v: boolean) => void;
}) {
  const allScored = EVAL_CRITERIA.every(c => (scores[c.key] ?? -1) >= 0);
  const checks = [
    { label: "Barcha mezonlarga ball qo'yilgan", ok: allScored },
    { label: "Ballar maksimal chegaradan oshmagan", ok: true },
    { label: "Yakuniy tavsiya tanlangan", ok: !!recommendation },
    { label: "Loyiha materiallari o'rganilgan", ok: true },
    { label: "Manfaatlar to'qnashuvi mavjud emas", ok: true },
  ];

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 16, padding: "32px", width: "100%", maxWidth: 520, maxHeight: "90vh", overflowY: "auto" }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#101828", margin: "0 0 6px" }}>Baholashni yakuniy tasdiqlash</h2>
        <p style={{ fontSize: 13, color: "#667085", margin: "0 0 20px" }}>Quyidagi tekshiruvni ko'rib chiqing</p>

        <div style={{ background: "#F9FAFB", borderRadius: 10, padding: "16px", marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#344054", marginBottom: 10 }}>Tekshiruv ro'yxati</div>
          {checks.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", background: c.ok ? "#DCFCE7" : "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ fontSize: 10, color: c.ok ? "#16A34A" : "#DC2626" }}>{c.ok ? "✓" : "✗"}</span>
              </div>
              <span style={{ fontSize: 13, color: c.ok ? "#344054" : "#DC2626" }}>{c.label}</span>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16, background: "#F5F7FA", borderRadius: 10, padding: "12px 16px" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#344054" }}>Jami ball:</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#071B33" }}>{totalScore} / 100</span>
        </div>

        <div style={{ background: "#FFF7DF", border: "1px solid #F0D882", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 13, color: "#92400E" }}>
          ⚠️ Yakuniy tasdiqlangandan keyin bahoni mustaqil ravishda o'zgartira olmaysiz.
        </div>

        {error && (
          <div style={{ background: "#FEE2E2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", marginBottom: 12, fontSize: 13, color: "#DC2626" }}>{error}</div>
        )}

        <label style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 20, cursor: "pointer" }}>
          <input type="checkbox" checked={confirmed} onChange={e => onConfirmedChange(e.target.checked)} style={{ marginTop: 2 }} />
          <span style={{ fontSize: 13, color: "#344054", fontWeight: 600 }}>Baholashni yakuniy tasdiqlayman.</span>
        </label>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px", borderRadius: 10, border: "1px solid #E4E7EC", background: "white", fontSize: 14, fontWeight: 600, cursor: "pointer", color: "#344054" }}>
            Ortga qaytish
          </button>
          <button onClick={onConfirm} disabled={!confirmed || !allScored || !recommendation}
            style={{
              flex: 1, padding: "12px", borderRadius: 10, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer",
              background: confirmed && allScored && recommendation ? "#D6A21E" : "#F3F4F6",
              color: confirmed && allScored && recommendation ? "white" : "#9CA3AF",
            }}>
            Yakuniy tasdiqlash
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ConflictModal ────────────────────────────────────────────────────────────
function ConflictModal({ projectId, onClose, onConfirm }: { projectId: string; onClose: () => void; onConfirm: () => void; }) {
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!reason.trim()) return;
    setSending(true);
    try {
      await fetch(`/api/judge/projects/${projectId}/conflict-of-interest`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason })
      });
      setDone(true);
    } finally { setSending(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 16, padding: "28px 32px", width: "100%", maxWidth: 480 }}>
        {done ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#344054", marginBottom: 6 }}>Xabar yuborildi</div>
            <div style={{ fontSize: 13, color: "#667085", marginBottom: 20 }}>Administratorga manfaatlar to'qnashuvi haqida xabar yuborildi. Bu loyiha sizga qayta biriktirilmaydi.</div>
            <button onClick={onConfirm} style={{ padding: "10px 24px", borderRadius: 8, background: "#071B33", color: "white", border: "none", cursor: "pointer", fontWeight: 700 }}>Tushundim</button>
          </div>
        ) : (
          <>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#101828", margin: "0 0 6px" }}>Manfaatlar to'qnashuvini bildirish</h3>
            <p style={{ fontSize: 13, color: "#667085", margin: "0 0 16px" }}>Ushbu loyiha bilan shaxsiy manfaatlar to'qnashuvi mavjud bo'lsa, administratorga xabar bering.</p>
            <textarea value={reason} onChange={e => setReason(e.target.value)}
              rows={4} placeholder="Manfaatlar to'qnashuvi sababini yozing..."
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #E4E7EC", borderRadius: 8, fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box", marginBottom: 16 }}
            />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={onClose} style={{ flex: 1, padding: "11px", borderRadius: 8, border: "1px solid #E4E7EC", background: "white", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>Bekor qilish</button>
              <button onClick={submit} disabled={sending || !reason.trim()} style={{ flex: 1, padding: "11px", borderRadius: 8, border: "none", background: "#DC2626", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 700, opacity: !reason.trim() ? 0.5 : 1 }}>
                {sending ? "Yuborilmoqda..." : "Yuborish"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
