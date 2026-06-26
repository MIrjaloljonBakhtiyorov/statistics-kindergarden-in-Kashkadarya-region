import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Bell, CheckCheck, Trash2, Settings, Inbox } from "lucide-react";
import { ProfileShell } from "../components/layout/ProfileShell";
import { ProfileTabs } from "../components/ui/ProfileTabs";
import { showToast, ToastContainer } from "../components/ui/ProfileToast";
import { type Notification, type NotificationType } from "../data/notifications";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

const typeIcons: Record<NotificationType, string> = {
  application: "📋",
  team: "👥",
  sorting: "🏆",
  result: "🎖️",
  monitoring: "📊",
  system: "🔔",
};

const tabs = [
  { id: "all", label: "Barchasi" },
  { id: "application", label: "Arizalar" },
  { id: "team", label: "Jamoa" },
  { id: "sorting", label: "Saralash" },
  { id: "result", label: "Natijalar" },
];

export function NotificationsPage() {
  const { userId } = useParams();
  const storedUser = useMemo(
    () => JSON.parse(localStorage.getItem("profileUser") ?? "null") as { id?: string } | null,
    []
  );
  const profileId = userId ?? storedUser?.id;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadNotifications() {
      if (!profileId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/users/${profileId}/notifications`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error?.message ?? "Bildirishnomalar yuklanmadi");
        }

        if (isMounted) setNotifications(payload.data ?? []);
      } catch (error) {
        if (isMounted) {
          showToast(error instanceof Error ? error.message : "Bildirishnomalar yuklanmadi", "error");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadNotifications();
    return () => {
      isMounted = false;
    };
  }, [profileId]);

  const filtered = activeTab === "all"
    ? notifications
    : notifications.filter((n) => n.type === activeTab);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const markRead = async (id: string) => {
    if (!profileId) return;
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    try {
      await fetch(`${API_BASE_URL}/users/${profileId}/notifications/${id}/read`, { method: "PATCH" });
    } catch {
      showToast("Bildirishnoma holati saqlanmadi", "error");
    }
  };

  const markAllRead = async () => {
    if (!profileId) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      const response = await fetch(`${API_BASE_URL}/users/${profileId}/notifications/read-all`, { method: "PATCH" });
      if (!response.ok) throw new Error();
      showToast("Barcha xabarlar o'qilgan deb belgilandi", "success");
    } catch {
      showToast("Bildirishnomalar holati saqlanmadi", "error");
    }
  };

  const deleteNotif = async (id: string) => {
    if (!profileId) return;
    const previous = notifications;
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      const response = await fetch(`${API_BASE_URL}/users/${profileId}/notifications/${id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      showToast("Xabar o'chirildi", "info");
    } catch {
      setNotifications(previous);
      showToast("Xabar o'chirilmadi", "error");
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000 / 60);
    if (diff < 60) return `${diff} daqiqa oldin`;
    if (diff < 1440) return `${Math.floor(diff / 60)} soat oldin`;
    return d.toLocaleDateString("uz-UZ");
  };

  return (
    <ProfileShell>
      <ToastContainer />

      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Bildirishnomalar</h1>
          <p className="text-sm text-[#aab6c9]">
            {isLoading
              ? "Bildirishnomalar yuklanmoqda..."
              : unreadCount > 0
                ? `${unreadCount} ta o'qilmagan xabar`
                : "Barcha xabarlar o'qilgan"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-2 px-3 py-2 bg-[#07172b] border border-[rgba(112,145,190,.25)] rounded-xl text-xs font-medium text-[#aab6c9] hover:text-white transition-colors">
              <CheckCheck size={14} /> Barchasini o'qish
            </button>
          )}
          <button onClick={() => showToast("Bildirishnoma sozlamalari (demo)", "info")} className="p-2 bg-[#07172b] border border-[rgba(112,145,190,.25)] rounded-xl text-[#aab6c9] hover:text-white transition-colors">
            <Settings size={16} />
          </button>
        </div>
      </div>

      <ProfileTabs
        tabs={tabs.map((t) => ({
          ...t,
          badge: t.id === "all" ? unreadCount || undefined : notifications.filter((n) => n.type === t.id && !n.isRead).length || undefined,
        }))}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        className="mb-5"
      />

      <div className="space-y-2">
        {isLoading ? (
          <div className="py-20 text-center bg-[#0a1b30] border border-[rgba(112,145,190,.18)] rounded-2xl">
            <Bell size={56} className="mx-auto mb-4 text-[#718096] opacity-40 animate-pulse" />
            <h3 className="text-lg font-bold text-white mb-2">Yuklanmoqda...</h3>
          </div>
        ) : filtered.length === 0 ? (
          // Bo'sh holat
          <div className="py-20 text-center bg-[#0a1b30] border border-[rgba(112,145,190,.18)] rounded-2xl">
            <Inbox size={56} className="mx-auto mb-4 text-[#718096] opacity-40" />
            <h3 className="text-lg font-bold text-white mb-2">
              {activeTab === "all" ? "Bildirishnomalar yo'q" : "Bu kategoriyada xabar yo'q"}
            </h3>
            <p className="text-sm text-[#718096] max-w-md mx-auto">
              {activeTab === "all" 
                ? "Hozircha sizga bildirishnomalar kelmagan. Yangi xabarlar kelganda bu yerda ko'rsatiladi."
                : "Ushbu kategoriya bo'yicha hali bildirishnomalar yo'q."}
            </p>
          </div>
        ) : (
          filtered.map((notif) => (
          <div
            key={notif.id}
            className={`flex items-start gap-4 p-4 rounded-2xl border transition-all ${
              !notif.isRead
                ? "bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/8"
                : "bg-[#0a1b30] border-[rgba(112,145,190,.18)] hover:bg-[#0d223b]"
            }`}
          >
            {/* Icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-[#07172b] flex items-center justify-center text-xl">
              {typeIcons[notif.type]}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm font-semibold ${!notif.isRead ? "text-white" : "text-[#aab6c9]"}`}>
                  {notif.title}
                </p>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {!notif.isRead && <span className="w-2 h-2 bg-blue-400 rounded-full" aria-label="O'qilmagan" />}
                  <span className="text-[11px] text-[#718096] whitespace-nowrap">{formatDate(notif.createdAt)}</span>
                </div>
              </div>
              <p className="text-xs text-[#718096] mt-1 line-clamp-2">{notif.body}</p>
              {notif.actionUrl && (
                <a href={notif.actionUrl} className="inline-block mt-2 text-xs text-blue-400 hover:text-blue-300 transition-colors">
                  {notif.actionLabel} →
                </a>
              )}
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1.5 flex-shrink-0">
              {!notif.isRead && (
                <button onClick={() => markRead(notif.id)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors" title="O'qilgan deb belgilash">
                  <CheckCheck size={14} className="text-[#718096] hover:text-green-400" />
                </button>
              )}
              <button onClick={() => deleteNotif(notif.id)} className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors" title="O'chirish">
                <Trash2 size={14} className="text-[#718096] hover:text-red-400" />
              </button>
            </div>
          </div>
        ))
        )}
      </div>

      {/* Eski bo'sh holat o'chirildi - yuqorida mavjud */}
    </ProfileShell>
  );
}
