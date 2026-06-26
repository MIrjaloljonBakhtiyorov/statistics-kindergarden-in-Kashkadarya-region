import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Filter, Eye, ClipboardEdit, CheckSquare, ChevronRight, FolderOpen } from "lucide-react";
import { JudgeShell } from "../components/layout/JudgeShell";
import { ProjectStatusBadge } from "../components/ui/ProjectStatusBadge";
import type { JudgeProject } from "../types";

const API = "/api/judge";

const STAGES = ["OTM bosqichi", "Tuman bosqichi", "Shahar bosqichi", "Viloyat final bosqichi"];
const DIRECTIONS = [
  "IT va Sun'iy intellekt", "Agrotexnologiyalar", "Ta'lim texnologiyalari",
  "Tibbiyot va ijtimoiy xizmatlar", "Fintex", "Yashil texnologiyalar",
  "Sanoat va logistika", "Boshqa innovatsion loyihalar"
];

function fmtDate(d?: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function isOverdue(deadline?: string) {
  if (!deadline) return false;
  return new Date(deadline) < new Date();
}

const DEMO_PROJECTS: JudgeProject[] = [
  { id: "1", applicationNumber: "QSL-2026-001", projectName: "AgroTech Solution", direction: "Agrotexnologiyalar", stage: "Viloyat final bosqichi", region: "Qarshi", institution: "QDU", evalDeadline: "2026-07-30", assignedDate: "2026-07-16", evalStatus: "pending", teamName: "AgroTeam" },
  { id: "2", applicationNumber: "QSL-2026-002", projectName: "EcoWater AI", direction: "Yashil texnologiyalar", stage: "Viloyat final bosqichi", region: "Shahrisabz", institution: "TDTU filiali", evalDeadline: "2026-07-30", assignedDate: "2026-07-16", evalStatus: "draft", teamName: "EcoSolutions" },
  { id: "3", applicationNumber: "QSL-2026-003", projectName: "EduAI Platform", direction: "Ta'lim texnologiyalari", stage: "Viloyat final bosqichi", region: "Qarshi", institution: "TATU filiali", evalDeadline: "2026-07-30", assignedDate: "2026-07-16", evalStatus: "submitted", teamName: "EduTech" },
  { id: "4", applicationNumber: "QSL-2026-004", projectName: "MedTech Innovation", direction: "Tibbiyot va ijtimoiy xizmatlar", stage: "Viloyat final bosqichi", region: "Muborak", institution: "ToshDTU filiali", evalDeadline: "2026-07-30", assignedDate: "2026-07-16", evalStatus: "pending", teamName: "MedTeam" },
  { id: "5", applicationNumber: "QSL-2026-005", projectName: "Smart Logistics", direction: "Sanoat va logistika", stage: "Viloyat final bosqichi", region: "Qarshi", institution: "QDU", evalDeadline: "2026-07-30", assignedDate: "2026-07-16", evalStatus: "pending", teamName: "LogiTeam" },
];

interface Props { pendingOnly?: boolean; }

export function JudgeProjectsPage({ pendingOnly = false }: Props) {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<JudgeProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stageFilter, setStageFilter] = useState("");
  const [directionFilter, setDirectionFilter] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (stageFilter) params.set("stage", stageFilter);
    if (directionFilter) params.set("direction", directionFilter);
    if (statusFilter !== "all") params.set("status", statusFilter);

    fetch(`${API}/projects?${params}`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(j => {
        if (j?.data && j.data.length > 0) {
          let list = j.data.map((p: any) => ({
            id: p.id, applicationNumber: p.application_number,
            projectName: p.project_name, teamName: p.team_name,
            direction: p.direction, stage: p.stage, region: p.region,
            institution: p.institution, evalDeadline: p.eval_deadline,
            assignedDate: p.assigned_date, evalStatus: p.eval_status,
            evalId: p.eval_id,
          }));
          if (pendingOnly) list = list.filter((p: JudgeProject) => p.evalStatus === "pending" || p.evalStatus === "draft");
          setProjects(list);
        } else {
          // Use demo data
          let demo = DEMO_PROJECTS;
          if (pendingOnly) demo = demo.filter(p => p.evalStatus === "pending" || p.evalStatus === "draft");
          setProjects(demo);
        }
      })
      .catch(() => {
        let demo = DEMO_PROJECTS;
        if (pendingOnly) demo = demo.filter(p => p.evalStatus === "pending" || p.evalStatus === "draft");
        setProjects(demo);
      })
      .finally(() => setLoading(false));
  }, [search, statusFilter, stageFilter, directionFilter, pendingOnly]);

  const filtered = projects.filter(p => {
    if (search && !p.projectName.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const actionButton = (p: JudgeProject) => {
    if (p.evalStatus === "submitted") {
      return (
        <Link to={`/judge/projects/${p.id}`} style={btnStyle("#F9FAFB", "#344054")}>
          <Eye size={14} /> Ko'rish
        </Link>
      );
    }
    if (p.evalStatus === "draft") {
      return (
        <Link to={`/judge/projects/${p.id}/evaluate`} style={btnStyle("#EFF6FF", "#1E40AF")}>
          <ClipboardEdit size={14} /> Davom ettirish
        </Link>
      );
    }
    return (
      <Link to={`/judge/projects/${p.id}/evaluate`} style={btnStyle("#FFF7DF", "#92400E")}>
        <CheckSquare size={14} /> Baholashni boshlash
      </Link>
    );
  };

  return (
    <JudgeShell pageTitle={pendingOnly ? "Baholanmagan loyihalar" : "Menga biriktirilgan loyihalar"}>
      <div style={{ marginBottom: 16 }}>
        <p style={{ fontSize: 14, color: "#667085", margin: 0 }}>
          {pendingOnly
            ? "Baholashni kutayotgan yoki jarayondagi loyihalar"
            : "Sizga baholash uchun biriktirilgan barcha startap loyihalari"}
        </p>
      </div>

      {/* Filters */}
      <div style={{
        background: "white", borderRadius: 12, padding: "16px 20px",
        border: "1px solid #E4E7EC", marginBottom: 20,
        display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flex: "1 1 200px" }}>
          <Search size={16} color="#9CA3AF" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Loyiha nomini qidirish..."
            style={{ border: "none", outline: "none", fontSize: 14, color: "#101828", width: "100%", background: "transparent" }}
          />
        </div>

        <select value={stageFilter} onChange={e => setStageFilter(e.target.value)}
          style={selectStyle}>
          <option value="">Barcha bosqichlar</option>
          {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>

        <select value={directionFilter} onChange={e => setDirectionFilter(e.target.value)}
          style={selectStyle}>
          <option value="">Barcha yo'nalishlar</option>
          {DIRECTIONS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>

        {!pendingOnly && (
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
            style={selectStyle}>
            <option value="all">Barcha holatlar</option>
            <option value="pending">Baholanmagan</option>
            <option value="draft">Ko'rib chiqilmoqda</option>
            <option value="submitted">Yakunlangan</option>
          </select>
        )}
      </div>

      {/* Table */}
      <div style={{ background: "white", borderRadius: 14, border: "1px solid #E4E7EC", overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#667085" }}>Yuklanmoqda...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 60, textAlign: "center" }}>
            <FolderOpen size={40} color="#E4E7EC" style={{ display: "block", margin: "0 auto 12px" }} />
            <div style={{ color: "#667085", fontSize: 14 }}>Loyihalar topilmadi</div>
          </div>
        ) : (
          <>
            {/* Desktop table header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "100px 1fr 160px 120px 140px 100px 90px 160px",
              padding: "12px 20px", background: "#F9FAFB",
              borderBottom: "1px solid #E4E7EC", gap: 12
            }} className="judge-table-header">
              {["Ariza raqami", "Loyiha nomi", "Yo'nalish", "Bosqich", "OTM/Hudud", "Muddati", "Holati", "Amal"].map(h => (
                <div key={h} style={{ fontSize: 11, fontWeight: 700, color: "#667085", letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</div>
              ))}
            </div>
            {filtered.map((p, idx) => (
              <div key={p.id} style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr 160px 120px 140px 100px 90px 160px",
                padding: "14px 20px", gap: 12, alignItems: "center",
                borderBottom: idx < filtered.length - 1 ? "1px solid #F3F4F6" : "none",
                background: isOverdue(p.evalDeadline) && p.evalStatus !== "submitted" ? "#FFF8F8" : "transparent"
              }} className="judge-table-row">
                <div style={{ fontSize: 12, color: "#667085", fontFamily: "monospace" }}>{p.applicationNumber}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#101828" }}>{p.projectName}</div>
                  {p.teamName && <div style={{ fontSize: 11, color: "#9CA3AF" }}>{p.teamName}</div>}
                </div>
                <div style={{ fontSize: 12, color: "#344054" }}>{p.direction}</div>
                <div style={{ fontSize: 12, color: "#344054" }}>{p.stage}</div>
                <div style={{ fontSize: 12, color: "#344054" }}>{p.institution || p.region || "—"}</div>
                <div style={{ fontSize: 12, color: isOverdue(p.evalDeadline) ? "#DC2626" : "#344054", fontWeight: isOverdue(p.evalDeadline) ? 600 : 400 }}>
                  {fmtDate(p.evalDeadline)}
                </div>
                <div>
                  <ProjectStatusBadge
                    status={isOverdue(p.evalDeadline) && p.evalStatus !== "submitted" ? "overdue" : p.evalStatus}
                    size="sm"
                  />
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {actionButton(p)}
                  <Link to={`/judge/projects/${p.id}`} style={btnStyle("#F9FAFB", "#667085")}>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .judge-table-header { display: none !important; }
          .judge-table-row {
            display: flex !important;
            flex-direction: column;
            gap: 8px !important;
          }
        }
      `}</style>
    </JudgeShell>
  );
}

const btnStyle = (bg: string, color: string): React.CSSProperties => ({
  display: "inline-flex", alignItems: "center", gap: 4,
  padding: "5px 10px", borderRadius: 7, fontSize: 12, fontWeight: 600,
  background: bg, color, textDecoration: "none", border: "1px solid " + color + "33",
  whiteSpace: "nowrap"
});

const selectStyle: React.CSSProperties = {
  border: "1px solid #E4E7EC", borderRadius: 8, padding: "7px 12px",
  fontSize: 13, color: "#344054", background: "white", cursor: "pointer", outline: "none"
};
