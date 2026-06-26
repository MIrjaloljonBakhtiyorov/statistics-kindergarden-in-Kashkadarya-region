import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Clock, FolderOpen, AlertCircle, Info } from "lucide-react";
import { JudgeShell } from "../components/layout/JudgeShell";
import type { JudgeNotification } from "../types";

const API = "/api/judge";

const TYPE_CONFIG: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  project_assigned:  { icon: FolderOpen, color: "#2563EB", bg: "#EFF6FF" },
  deadline_reminder: { icon: Clock, color: "#D97706", bg: "#FEF3C7" },
  eval_complete:     { icon: CheckCircle2, color: "#16A34A", bg: "#DCFCE7" },
  reopen_decision:   { icon: AlertCircle, color: "#DC2626", bg: "#FEE2E2" },
  system:            { icon: Info, color: "#667085", bg: "#F3F4F6" },
};

const DEMO_NOTIFS: JudgeNotification[] = [
  { id: "1", type: "project_assigned", title: "Yangi loyiha biriktirildi", body: "Sizga 'AgroTech Solution' loyihasi baholash uchun biriktirildi.", actionUrl: "/judge/projects/1", actionLabel: "Ko'rish", read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "2", type: "deadline_reminder", title: "Baholash muddati yaqinlashmoqda", body: "'EcoWater AI' loyihasini baholash muddati 3 kun ichida tugaydi.", actionUrl: "/judge/projects/2", actionLabel: "Baholashni davom ettirish", read: false, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: "3", type: "system", title: "Tizimga xush kelibsiz", body: "Qashqadaryo Startap Ligasi hakamlar paneliga xush kelibsiz. Yo'riqnomani o'qib chiqishni unutmang.", read: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: "4", type: "eval_complete", title: "Baholash yakunlandi", body: "'EduAI Platform' loyihasiga baholashingiz muvaffaqiyatli tasdiqlandi.", actionUrl: "/judge/evaluations/completed", actionLabel: "Ko'rish", read: true, createdAt: new Date(Date.now() - 259200000).toISOString() },
];

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} daqiqa oldin`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.floor(hours / 24);
  return `${days} kun oldin`;
}

export function JudgeNotificationsPage() {
  const [notifs, setNotifs] = useState<JudgeNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/notifications`, { credentials: "include" })
      .then(r => r.ok ? r.json() : null)
      .then(j => {
        if (j?.data?.length) {
          setNotifs(j.data.map((n: any) => ({
            id: n.id, type: n.type, title: n.title, body: n.body,
            actionUrl: n.action_url, actionLabel: n.action_label,
            read: n.read, createdAt: n.created_at
          })));
        } else {
          setNotifs(DEMO_NOTIFS);
        }
      })
      .catch(() => setNotifs(DEMO_NOTIFS))
      .finally(() => setLoading(false));
  }, []);

  const markRead = async (id: string) => {
    setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
    await fetch(`${API}/notifications/${id}/read`, { method: "PATCH", credentials: "include" }).catch(() => {});
  };

  const unreadCount = notifs.filter(n => !n.read).length;

  return (
    <JudgeShell pageTitle="Bildirishnomalar">
      <div style={{ maxWidth: 700 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Bell size={20} color="#071B33" />
            <span style={{ fontSize: 16, fontWeight: 700, color: "#101828" }}>
              Bildirishnomalar
            </span>
            {unreadCount > 0 && (
              <span style={{ background: "#DC2626", color: "white", borderRadius: 99, padding: "2px 8px", fontSize: 11, fontWeight: 700 }}>
                {unreadCount} yangi
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => { notifs.filter(n => !n.read).forEach(n => markRead(n.id)); }}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#2563EB", fontWeight: 600 }}>
              Barchasini o'qilgan deb belgilash
            </button>
          )}
        </div>

        <div style={{ background: "white", borderRadius: 14, border: "1px solid #E4E7EC", overflow: "hidden", boxShadow: "0 1px 8px rgba(0,0,0,0.05)" }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#667085" }}>Yuklanmoqda...</div>
          ) : notifs.length === 0 ? (
            <div style={{ padding: 60, textAlign: "center" }}>
              <Bell size={40} color="#E4E7EC" style={{ display: "block", margin: "0 auto 12px" }} />
              <div style={{ color: "#667085", fontSize: 14 }}>Bildirishnomalar yo'q</div>
            </div>
          ) : (
            notifs.map((n, idx) => {
              const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system;
              const Icon = cfg.icon;
              return (
                <div key={n.id}
                  onClick={() => !n.read && markRead(n.id)}
                  style={{
                    display: "flex", gap: 14, padding: "16px 20px",
                    borderBottom: idx < notifs.length - 1 ? "1px solid #F3F4F6" : "none",
                    background: n.read ? "white" : "#FAFBFF",
                    cursor: n.read ? "default" : "pointer",
                    transition: "background 0.15s"
                  }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Icon size={18} color={cfg.color} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ fontSize: 14, fontWeight: n.read ? 500 : 700, color: "#101828" }}>{n.title}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0, marginLeft: 12 }}>
                        {!n.read && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#2563EB" }} />}
                        <span style={{ fontSize: 12, color: "#9CA3AF" }}>{timeAgo(n.createdAt)}</span>
                      </div>
                    </div>
                    <div style={{ fontSize: 13, color: "#667085", marginTop: 3, lineHeight: 1.5 }}>{n.body}</div>
                    {n.actionUrl && n.actionLabel && (
                      <a href={n.actionUrl} style={{ display: "inline-block", marginTop: 8, fontSize: 12, color: "#2563EB", fontWeight: 600, textDecoration: "none" }}>
                        {n.actionLabel} →
                      </a>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </JudgeShell>
  );
}
