import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ClipboardList, Clock, FileEdit, CheckCircle2, BookOpen,
  ChevronRight, Target, Lightbulb, Layers, BarChart3,
  Rocket, DollarSign, Users, Presentation, ArrowRight
} from "lucide-react";
import { JudgeShell } from "../components/layout/JudgeShell";
import { JudgeStatCard } from "../components/ui/JudgeStatCard";
import { DeadlineCard } from "../components/ui/DeadlineCard";
import { ProjectStatusBadge } from "../components/ui/ProjectStatusBadge";
import { ImportantNoticeBanner } from "../components/ui/ImportantNoticeBanner";
import { useJudgeAuth } from "../context/JudgeAuthContext";
import { EVAL_CRITERIA } from "../types";

const API = "/api/judge";

const CRITERION_ICONS: Record<string, React.ElementType> = {
  Target, Lightbulb, Layers, BarChart3, Rocket, DollarSign, Users, Presentation,
};

export function JudgeDashboard() {
  const { judge } = useJudgeAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/dashboard`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(j => { if (j) setData(j.data); })
      .finally(() => setLoading(false));
  }, []);

  const stats = data?.stats ?? { total: 0, pending: 0, draft: 0, submitted: 0 };
  const recentProjects: any[] = data?.recentProjects ?? [];

  return (
    <JudgeShell pageTitle="Bosh sahifa">
      <ImportantNoticeBanner />

      {/* Welcome + Guide */}
      <div style={{ display: "flex", gap: 20, marginBottom: 28, flexWrap: "wrap", alignItems: "stretch" }}>
        <div style={{ flex: 1, minWidth: 280 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#101828", margin: "0 0 6px" }}>
            Xush kelibsiz, {judge?.firstName ?? "Hakam"}!
          </h1>
          <p style={{ fontSize: 14, color: "#667085", margin: 0, lineHeight: 1.6 }}>
            Qashqadaryo startap ligasi hakamlar paneliga xush kelibsiz. Sizga biriktirilgan loyihalarni
            baholang va natijalarni qayd eting.
          </p>
        </div>
        <div style={{
          background: "linear-gradient(135deg, #071B33 0%, #0d2845 100%)",
          borderRadius: 14, padding: "20px 24px",
          minWidth: 260, display: "flex", flexDirection: "column", justifyContent: "space-between",
          boxShadow: "0 4px 20px rgba(7,27,51,0.15)"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <BookOpen size={18} color="#D6A21E" />
              <span style={{ color: "#D6A21E", fontSize: 13, fontWeight: 700 }}>Baholash bo'yicha yo'riqnoma</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, margin: 0, lineHeight: 1.5 }}>
              Baholash tartibi va mezonlari bilan tanishing
            </p>
          </div>
          <Link to="/judge/guidelines" style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "#D6A21E", color: "white", textDecoration: "none",
            padding: "8px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600,
            marginTop: 16, width: "fit-content"
          }}>
            Yo'riqnomani ko'rish <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
        <JudgeStatCard
          title="Jami biriktirilgan"
          value={loading ? "—" : stats.total}
          subtitle="Baholash uchun berilgan loyihalar"
          icon={<ClipboardList size={22} />}
          accent="#071B33"
        />
        <JudgeStatCard
          title="Baholanmagan"
          value={loading ? "—" : stats.pending}
          subtitle="Baholashni kutmoqda"
          icon={<Clock size={22} />}
          accent="#D97706"
        />
        <JudgeStatCard
          title="Ko'rib chiqilmoqda"
          value={loading ? "—" : stats.draft}
          subtitle="Qoralama baholar"
          icon={<FileEdit size={22} />}
          accent="#2563EB"
        />
        <JudgeStatCard
          title="Yakunlangan"
          value={loading ? "—" : stats.submitted}
          subtitle="Yakuniy tasdiqlangan baholar"
          icon={<CheckCircle2 size={22} />}
          accent="#16A34A"
        />
      </div>

      {/* Deadline */}
      <div style={{ marginBottom: 28 }}>
        <DeadlineCard
          startDate={data?.evalStartDate ?? judge?.evalStartDate}
          endDate={data?.evalEndDate ?? judge?.evalEndDate}
          totalProjects={stats.total}
          doneProjects={stats.submitted}
        />
      </div>

      {/* Two column */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: 20, alignItems: "start" }}
        className="judge-grid-2">
        {/* Criteria preview */}
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #E4E7EC", overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #E4E7EC" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#101828", marginBottom: 2 }}>Baholash mezonlari</div>
            <div style={{ fontSize: 13, color: "#667085" }}>Loyiha jami 100 ballik tizim asosida baholanadi</div>
          </div>
          <div style={{ padding: "4px 0" }}>
            {EVAL_CRITERIA.map((c, idx) => {
              const Icon = CRITERION_ICONS[c.icon] ?? Target;
              return (
                <div key={c.id} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 24px", borderBottom: idx < EVAL_CRITERIA.length - 1 ? "1px solid #F3F4F6" : "none"
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 8,
                    background: "#F5F7FA", display: "flex", alignItems: "center",
                    justifyContent: "center", flexShrink: 0
                  }}>
                    <Icon size={14} color="#071B33" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#101828" }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: "#667085", marginTop: 1 }}>{c.description}</div>
                  </div>
                  <div style={{
                    background: "#F5F7FA", borderRadius: 6, padding: "3px 8px",
                    fontSize: 12, fontWeight: 700, color: "#071B33", flexShrink: 0
                  }}>
                    {c.maxScore} ball
                  </div>
                </div>
              );
            })}
            <div style={{
              padding: "12px 24px", background: "#F9FAFB",
              display: "flex", justifyContent: "space-between", alignItems: "center"
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#344054" }}>Jami maksimal ball</span>
              <span style={{ fontSize: 16, fontWeight: 800, color: "#071B33" }}>100 ball</span>
            </div>
          </div>
        </div>

        {/* Recent projects */}
        <div style={{ background: "white", borderRadius: 14, border: "1px solid #E4E7EC", overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
          <div style={{ padding: "20px 24px", borderBottom: "1px solid #E4E7EC", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#101828" }}>Biriktirilgan loyihalar</div>
            <Link to="/judge/projects" style={{ fontSize: 13, color: "#D6A21E", textDecoration: "none", fontWeight: 600 }}>
              Barchasini ko'rish
            </Link>
          </div>
          <div>
            {loading ? (
              <div style={{ padding: "32px 24px", textAlign: "center", color: "#667085", fontSize: 13 }}>Yuklanmoqda...</div>
            ) : recentProjects.length === 0 ? (
              <div style={{ padding: "32px 24px", textAlign: "center", color: "#667085", fontSize: 13 }}>
                <ClipboardList size={32} color="#E4E7EC" style={{ display: "block", margin: "0 auto 8px" }} />
                Loyihalar biriktirilmagan
              </div>
            ) : recentProjects.map((p: any, idx: number) => (
              <Link key={p.id} to={`/judge/projects/${p.id}`}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "14px 24px", textDecoration: "none",
                  borderBottom: idx < recentProjects.length - 1 ? "1px solid #F3F4F6" : "none"
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F9FAFB"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 8,
                  background: "linear-gradient(135deg, #071B33, #1a3a5c)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#D6A21E", fontWeight: 800, fontSize: 12, flexShrink: 0
                }}>
                  {p.project_name?.[0] ?? "L"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#101828", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {p.project_name}
                  </div>
                  <div style={{ fontSize: 11, color: "#667085", marginTop: 2 }}>{p.direction} · {p.stage}</div>
                </div>
                <div style={{ flexShrink: 0 }}>
                  <ProjectStatusBadge status={p.eval_status ?? "pending"} size="sm" />
                </div>
                <ChevronRight size={14} color="#D0D5DD" />
              </Link>
            ))}

            {/* Demo data if no real data */}
            {!loading && recentProjects.length === 0 && (
              <div style={{ padding: "0 24px 16px" }}>
                {["AgroTech Solution", "EcoWater AI", "EduAI Platform"].map((name, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 0", borderBottom: i < 2 ? "1px solid #F3F4F6" : "none",
                    opacity: 0.5
                  }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 8, background: "#F3F4F6",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 700, color: "#667085"
                    }}>{name[0]}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#344054" }}>{name}</div>
                      <div style={{ fontSize: 11, color: "#9CA3AF" }}>Demo ma'lumot</div>
                    </div>
                    <ProjectStatusBadge status="pending" size="sm" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .judge-grid-2 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </JudgeShell>
  );
}
