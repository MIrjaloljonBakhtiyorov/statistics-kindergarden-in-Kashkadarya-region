import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft, FileText, Users, Target, BarChart3, Rocket, Map,
  ExternalLink, Download, AlertTriangle, Calendar, Clock
} from "lucide-react";
import { JudgeShell } from "../components/layout/JudgeShell";
import { ProjectStatusBadge } from "../components/ui/ProjectStatusBadge";
import type { JudgeProject } from "../types";

const API = "/api/judge";

const TABS = [
  { id: "overview", label: "Umumiy ma'lumot", icon: FileText },
  { id: "problem", label: "Muammo va yechim", icon: Target },
  { id: "mvp", label: "MVP va prototip", icon: Rocket },
  { id: "market", label: "Bozor va biznes modeli", icon: BarChart3 },
  { id: "team", label: "Jamoa", icon: Users },
  { id: "implementation", label: "Joriy etish va pilot", icon: Map },
  { id: "materials", label: "Materiallar", icon: Download },
  { id: "schedule", label: "Taqdimot jadvali", icon: Calendar },
];

function fmtDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("uz-UZ", { day: "numeric", month: "long", year: "numeric" });
}

function InfoRow({ label, value }: { label: string; value?: string | boolean | null }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div style={{ display: "flex", gap: 16, padding: "10px 0", borderBottom: "1px solid #F3F4F6" }}>
      <div style={{ width: 220, fontSize: 13, color: "#667085", flexShrink: 0 }}>{label}</div>
      <div style={{ fontSize: 13, color: "#101828", fontWeight: 500 }}>
        {typeof value === "boolean" ? (value ? "Ha" : "Yo'q") : value}
      </div>
    </div>
  );
}

const DEMO_PROJECT: JudgeProject = {
  id: "1", applicationNumber: "QSL-2026-001",
  projectName: "AgroTech Solution", teamName: "AgroTeam",
  direction: "Agrotexnologiyalar", stage: "Viloyat final bosqichi",
  region: "Qarshi shahri", institution: "Qashqadaryo davlat universiteti",
  evalDeadline: "2026-07-30", assignedDate: "2026-07-16", evalStatus: "pending",
  summary: "AgroTech Solution - Qashqadaryo viloyatidagi dehqon xo'jaliklari uchun sun'iy intellekt asosida tuproq va iqlim tahlili qiluvchi mobil ilova. Dehqonlar ekin rejasini, sug'orish va o'g'itlash jadvalini avtomatik tuzib olishlari mumkin.",
  problem: "Qashqadaryo viloyatida 120,000 ga yaqin dehqon xo'jaligi mavjud. Ularning ko'pchiligi zamonaviy agrotexnologiyalarga ruxsat etmaydi va tuproq holati, iqlim ma'lumotlariga asoslangan qarorlar qabul qila olmaydi. Bu yillik hosildorlikning 30-40%ga kamayishiga olib kelmoqda.",
  problemRelevance: "Viloyat iqtisodiyotining 40%i qishloq xo'jaligiga asoslangan. Hosildorlikning pasayishi bevosita aholining daromadiga ta'sir qiladi.",
  solution: "Tuproq sensori + sun'iy intellekt + mobil ilova yechimi. Dehqon har hafta tuproq tahlili natijalarini oladi va avtomatik tavsiyalar asosida ishlaydi.",
  solutionInnovation: "O'zbekistonda birinchi marta mahalliy iqlim va tuproq ma'lumotlariga asoslangan AI model yaratilgan.",
  mvpExists: true, prototypeExists: true,
  demoUrl: "https://agrotech.demo.uz",
  githubUrl: "https://github.com/agrotech/solution",
  targetCustomers: "Qashqadaryo viloyatidagi kichik va o'rta fermer xo'jaliklari (10-500 ga yer)",
  marketSize: "Viloyatda 120,000 fermer xo'jaligi. Yillik potensial bozor: 5 mlrd so'm",
  competitors: "Xalqaro: Crop.one, Granular. Mahalliy: analog yechimlar mavjud emas",
  businessModel: "Obuna modeli: oyiga 50,000 so'm. Premium: 150,000 so'm",
  revenueSources: "Obuna to'lovlari, ma'lumotlar sotish (anonimlashtirgan holda), korporativ litsenziyalar",
  pilotRegion: "Qarshi tumani, 50 ta fermer xo'jaligi",
  scalability: "Viloyat bo'ylab kengaytirish imkoniyati mavjud. Keyinchalik barcha O'zbekiston bo'ylab",
  teamMembers: [
    { name: "Bahodir Rahimov", role: "CEO va texnik rahbar", specialization: "Sun'iy intellekt", experience: "5 yil", responsibility: "Strategiya va AI model" },
    { name: "Malika Xasanova", role: "CTO", specialization: "Backend dasturlash", experience: "4 yil", responsibility: "Server va API" },
    { name: "Jasur Toshmatov", role: "Agrotexnolog", specialization: "Qishloq xo'jaligi", experience: "8 yil", responsibility: "Qishloq xo'jaligi bo'yicha ekspert" },
  ],
  materials: [
    { id: "1", type: "presentation", title: "Loyiha taqdimoti (PDF)", url: "#", fileSize: "2.4 MB" },
    { id: "2", type: "video", title: "Demo video", url: "https://youtu.be/example", fileSize: "" },
    { id: "3", type: "business_plan", title: "Biznes-reja", url: "#", fileSize: "1.1 MB" },
  ],
  presentationDate: "2026-07-25",
  presentationTime: "10:00",
  presentationVenue: "Qarshi shahar hokimligi majlis zali",
  presentationDuration: 10,
  qaDuration: 5,
};

function mapJudgeProject(row: any): JudgeProject {
  return {
    id: row.id,
    applicationNumber: row.application_number ?? row.applicationNumber,
    projectName: row.project_name ?? row.projectName,
    teamName: row.team_name ?? row.teamName,
    direction: row.direction,
    stage: row.stage,
    region: row.region,
    institution: row.institution,
    evalDeadline: row.eval_deadline ?? row.evalDeadline,
    assignedDate: row.assigned_date ?? row.assignedDate,
    evalStatus: row.eval_status ?? row.evalStatus ?? "pending",
    evalId: row.eval_id ?? row.evalId,
    evalUpdated: row.eval_updated ?? row.evalUpdated,
    summary: row.summary,
    problem: row.problem,
    problemRelevance: row.problem_relevance ?? row.problemRelevance,
    problemScale: row.problem_scale ?? row.problemScale,
    solution: row.solution,
    solutionInnovation: row.solution_innovation ?? row.solutionInnovation,
    mvpExists: row.mvp_exists ?? row.mvpExists,
    prototypeExists: row.prototype_exists ?? row.prototypeExists,
    demoUrl: row.demo_url ?? row.demoUrl,
    githubUrl: row.github_url ?? row.githubUrl,
    targetCustomers: row.target_customers ?? row.targetCustomers,
    marketSize: row.market_size ?? row.marketSize,
    competitors: row.competitors,
    businessModel: row.business_model ?? row.businessModel,
    revenueSources: row.revenue_sources ?? row.revenueSources,
    financialNeed: row.financial_need ?? row.financialNeed,
    pilotRegion: row.pilot_region ?? row.pilotRegion,
    pilotOrg: row.pilot_org ?? row.pilotOrg,
    scalability: row.scalability,
    teamMembers: row.team_members ?? row.teamMembers ?? [],
    materials: row.materials ?? [],
    presentationDate: row.presentation_date ?? row.presentationDate,
    presentationTime: row.presentation_time ?? row.presentationTime,
    presentationVenue: row.presentation_venue ?? row.presentationVenue,
    presentationLink: row.presentation_link ?? row.presentationLink,
    presentationDuration: row.presentation_duration ?? row.presentationDuration,
    qaDuration: row.qa_duration ?? row.qaDuration,
    scores: row.scores,
    comments: row.comments,
    totalScore: row.total_score ?? row.totalScore,
    strengths: row.strengths,
    weaknesses: row.weaknesses,
    techRisks: row.tech_risks ?? row.techRisks,
    marketRisks: row.market_risks ?? row.marketRisks,
    businessModelIssues: row.business_model_issues ?? row.businessModelIssues,
    teamAssessment: row.team_assessment ?? row.teamAssessment,
    improvements: row.improvements,
    pilotFeasibility: row.pilot_feasibility ?? row.pilotFeasibility,
    regionalRelevance: row.regional_relevance ?? row.regionalRelevance,
    nextSteps: row.next_steps ?? row.nextSteps,
    recommendation: row.recommendation,
    justification: row.justification,
    submittedAt: row.submitted_at ?? row.submittedAt,
  };
}

export function JudgeProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<JudgeProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showIssueModal, setShowIssueModal] = useState(false);

  useEffect(() => {
    fetch(`${API}/projects/${projectId}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(j => { if (j?.data) setProject(mapJudgeProject(j.data)); else setProject(DEMO_PROJECT); })
      .catch(() => setProject(DEMO_PROJECT))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) return (
    <JudgeShell pageTitle="Loyiha tafsilotlari">
      <div style={{ textAlign: "center", padding: 60, color: "#667085" }}>Yuklanmoqda...</div>
    </JudgeShell>
  );

  if (!project) return (
    <JudgeShell pageTitle="Loyiha tafsilotlari">
      <div style={{ textAlign: "center", padding: 60, color: "#DC2626" }}>Loyiha topilmadi</div>
    </JudgeShell>
  );

  return (
    <JudgeShell pageTitle="Loyiha tafsilotlari">
      {/* Back + Header */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => navigate(-1)}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", color: "#667085", fontSize: 13, marginBottom: 16, padding: 0 }}>
          <ArrowLeft size={16} /> Orqaga
        </button>
        <div style={{
          background: "white", borderRadius: 14, padding: "24px 28px",
          border: "1px solid #E4E7EC", boxShadow: "0 1px 8px rgba(0,0,0,0.05)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "monospace", marginBottom: 4 }}>{project.applicationNumber}</div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#101828", margin: "0 0 8px" }}>{project.projectName}</h1>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <span style={tagStyle}>{project.direction}</span>
                <span style={tagStyle}>{project.stage}</span>
                {(project.institution || project.region) && <span style={tagStyle}>{project.institution || project.region}</span>}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
              <ProjectStatusBadge status={project.evalStatus} />
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Clock size={14} color="#667085" />
                <span style={{ fontSize: 12, color: "#667085" }}>Muddat: {fmtDate(project.evalDeadline)}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {project.evalStatus !== "submitted" && (
                  <Link to={`/judge/projects/${project.id}/evaluate`} style={{
                    background: "#D6A21E", color: "white", textDecoration: "none",
                    padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
                    display: "flex", alignItems: "center", gap: 6
                  }}>
                    {project.evalStatus === "draft" ? "Davom ettirish" : "Baholashni boshlash"}
                  </Link>
                )}
                <button onClick={() => setShowIssueModal(true)} style={{
                  background: "#FEF2F2", color: "#DC2626", border: "1px solid #FECACA",
                  padding: "8px 12px", borderRadius: 8, fontSize: 12, fontWeight: 600,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: 4
                }}>
                  <AlertTriangle size={13} /> Muammo haqida xabar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        background: "white", borderRadius: 12, padding: "4px",
        border: "1px solid #E4E7EC", marginBottom: 20,
        display: "flex", flexWrap: "wrap", gap: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
      }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 14px", borderRadius: 8, fontSize: 13,
              border: "none", cursor: "pointer", fontWeight: activeTab === tab.id ? 600 : 400,
              background: activeTab === tab.id ? "#071B33" : "transparent",
              color: activeTab === tab.id ? "white" : "#667085",
              transition: "all 0.15s"
            }}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ background: "white", borderRadius: 14, border: "1px solid #E4E7EC", padding: "24px 28px", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
        {activeTab === "overview" && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#101828", margin: "0 0 16px" }}>Umumiy ma'lumot</h3>
            <InfoRow label="Loyiha nomi" value={project.projectName} />
            <InfoRow label="Yo'nalish" value={project.direction} />
            <InfoRow label="Qisqacha mazmun" value={project.summary} />
            <InfoRow label="Rivojlanish bosqichi" value={project.stage} />
            <InfoRow label="Hudud/OTM" value={project.institution || project.region} />
          </div>
        )}

        {activeTab === "problem" && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#101828", margin: "0 0 16px" }}>Muammo va yechim</h3>
            <InfoRow label="Loyiha hal qiladigan muammo" value={project.problem} />
            <InfoRow label="Muammoning dolzarbligi" value={project.problemRelevance} />
            <InfoRow label="Muammoning ko'lami" value={project.problemScale} />
            <InfoRow label="Taklif etilayotgan yechim" value={project.solution} />
            <InfoRow label="Yechimning innovatsionligi" value={project.solutionInnovation} />
          </div>
        )}

        {activeTab === "mvp" && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#101828", margin: "0 0 16px" }}>MVP va prototip</h3>
            <InfoRow label="MVP mavjudligi" value={project.mvpExists} />
            <InfoRow label="Prototip mavjudligi" value={project.prototypeExists} />
            {project.demoUrl && (
              <div style={{ display: "flex", gap: 16, padding: "10px 0", borderBottom: "1px solid #F3F4F6" }}>
                <div style={{ width: 220, fontSize: 13, color: "#667085" }}>Demo havolasi</div>
                <a href={project.demoUrl} target="_blank" rel="noreferrer"
                  style={{ color: "#2563EB", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
                  <ExternalLink size={13} /> Demo ko'rish
                </a>
              </div>
            )}
            {project.githubUrl && (
              <div style={{ display: "flex", gap: 16, padding: "10px 0", borderBottom: "1px solid #F3F4F6" }}>
                <div style={{ width: 220, fontSize: 13, color: "#667085" }}>GitHub havolasi</div>
                <a href={project.githubUrl} target="_blank" rel="noreferrer"
                  style={{ color: "#2563EB", fontSize: 13, display: "flex", alignItems: "center", gap: 4 }}>
                  <ExternalLink size={13} /> Kodni ko'rish
                </a>
              </div>
            )}
          </div>
        )}

        {activeTab === "market" && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#101828", margin: "0 0 16px" }}>Bozor va biznes modeli</h3>
            <InfoRow label="Maqsadli mijozlar" value={project.targetCustomers} />
            <InfoRow label="Bozor hajmi" value={project.marketSize} />
            <InfoRow label="Raqobatchilar" value={project.competitors} />
            <InfoRow label="Biznes modeli" value={project.businessModel} />
            <InfoRow label="Daromad manbalari" value={project.revenueSources} />
            <InfoRow label="Moliyaviy ehtiyoj" value={project.financialNeed} />
          </div>
        )}

        {activeTab === "team" && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#101828", margin: "0 0 16px" }}>Jamoa a'zolari</h3>
            {(project.teamMembers ?? []).map((m, i) => (
              <div key={i} style={{
                display: "flex", gap: 14, padding: "14px 0",
                borderBottom: "1px solid #F3F4F6"
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                  background: "linear-gradient(135deg, #071B33, #1a3a5c)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#D6A21E", fontWeight: 700, fontSize: 16
                }}>
                  {m.name?.[0] ?? "?"}
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#101828" }}>{m.name}</div>
                  <div style={{ fontSize: 12, color: "#D6A21E", fontWeight: 600 }}>{m.role}</div>
                  {m.specialization && <div style={{ fontSize: 12, color: "#667085" }}>{m.specialization} · {m.experience}</div>}
                  {m.responsibility && <div style={{ fontSize: 12, color: "#344054", marginTop: 2 }}>{m.responsibility}</div>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "implementation" && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#101828", margin: "0 0 16px" }}>Joriy etish va pilot</h3>
            <InfoRow label="Pilot hudud" value={project.pilotRegion} />
            <InfoRow label="Pilot tashkilot" value={project.pilotOrg} />
            <InfoRow label="Kengaytirish imkoniyati" value={project.scalability} />
          </div>
        )}

        {activeTab === "materials" && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#101828", margin: "0 0 16px" }}>Materiallar</h3>
            {(project.materials ?? []).map(m => (
              <div key={m.id} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px 0", borderBottom: "1px solid #F3F4F6"
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 8, background: "#F3F4F6",
                  display: "flex", alignItems: "center", justifyContent: "center"
                }}>
                  <FileText size={18} color="#667085" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#101828" }}>{m.title}</div>
                  {m.fileSize && <div style={{ fontSize: 11, color: "#9CA3AF" }}>{m.fileSize}</div>}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <a href={m.url} target="_blank" rel="noreferrer" style={{ ...tagStyle, color: "#2563EB", background: "#EFF6FF" }}>
                    <ExternalLink size={12} /> Ko'rish
                  </a>
                  {m.url?.startsWith("/uploads/") && (
                    <a href={m.url} download style={{ ...tagStyle, color: "#047857", background: "#ECFDF3" }}>
                      <Download size={12} /> Yuklab olish
                    </a>
                  )}
                </div>
              </div>
            ))}
            {(!project.materials || project.materials.length === 0) && (
              <div style={{ color: "#9CA3AF", fontSize: 13 }}>Materiallar yuklanmagan</div>
            )}
          </div>
        )}

        {activeTab === "schedule" && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#101828", margin: "0 0 16px" }}>Taqdimot jadvali</h3>
            <InfoRow label="Taqdimot sanasi" value={fmtDate(project.presentationDate)} />
            <InfoRow label="Boshlanish vaqti" value={project.presentationTime} />
            <InfoRow label="Tadbir joyi" value={project.presentationVenue} />
            <InfoRow label="Taqdimot davomiyligi" value={project.presentationDuration ? `${project.presentationDuration} daqiqa` : undefined} />
            <InfoRow label="Savol-javob davomiyligi" value={project.qaDuration ? `${project.qaDuration} daqiqa` : undefined} />
          </div>
        )}
      </div>

      {/* Issue modal */}
      {showIssueModal && (
        <IssueReportModal projectId={project.id} onClose={() => setShowIssueModal(false)} />
      )}
    </JudgeShell>
  );
}

function IssueReportModal({ projectId, onClose }: { projectId: string; onClose: () => void }) {
  const [issueType, setIssueType] = useState("");
  const [description, setDescription] = useState("");
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!issueType || !description) return;
    setSending(true);
    try {
      await fetch(`${API}/projects/${projectId}/report-issue`, {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issueType, description })
      });
      setDone(true);
    } finally { setSending(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "white", borderRadius: 16, padding: "28px 32px", width: "100%", maxWidth: 480 }}>
        <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700, color: "#101828" }}>Muammo haqida xabar berish</h3>
        {done ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ color: "#16A34A", fontSize: 36, marginBottom: 8 }}>✓</div>
            <div style={{ fontSize: 14, color: "#344054" }}>Xabaringiz yuborildi. Administrator ko'rib chiqadi.</div>
            <button onClick={onClose} style={{ marginTop: 16, padding: "8px 20px", borderRadius: 8, background: "#071B33", color: "white", border: "none", cursor: "pointer", fontWeight: 600 }}>Yopish</button>
          </div>
        ) : (
          <>
            <select value={issueType} onChange={e => setIssueType(e.target.value)} style={{ width: "100%", padding: "10px 12px", border: "1px solid #E4E7EC", borderRadius: 8, marginBottom: 12, fontSize: 13, color: "#344054", outline: "none" }}>
              <option value="">Muammo turini tanlang</option>
              {["Fayl ochilmayapti", "Noto'g'ri havola", "Video ishlamayapti", "Ma'lumotlarda qarama-qarshilik", "Shubhali ma'lumot", "Boshqa texnik muammo"].map(o => <option key={o} value={o}>{o}</option>)}
            </select>
            <textarea
              value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Muammoni batafsil yozing..."
              rows={4}
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #E4E7EC", borderRadius: 8, fontSize: 13, color: "#344054", outline: "none", resize: "vertical", boxSizing: "border-box" }}
            />
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button onClick={onClose} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid #E4E7EC", background: "white", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#344054" }}>Bekor qilish</button>
              <button onClick={submit} disabled={sending || !issueType || !description} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "#DC2626", color: "white", cursor: "pointer", fontSize: 13, fontWeight: 600, opacity: sending ? 0.6 : 1 }}>
                {sending ? "Yuborilmoqda..." : "Yuborish"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const tagStyle: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 500,
  background: "#F3F4F6", color: "#344054", textDecoration: "none"
};
