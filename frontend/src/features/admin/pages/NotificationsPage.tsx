import { AdminShell } from "../components/layout/AdminShell";
import { AdminPageHeader } from "../components/ui/AdminPageHeader";
import { useState, useEffect } from "react";
import { Plus, Search, Send, Bell, CheckCircle, Clock, XCircle, Download } from "lucide-react";
import { getFromStorage, saveToStorage, STORAGE_KEYS, formatDateTime } from "../utils/localStorage";

interface Notification {
  id: string;
  name: string;
  subject: string;
  channel: "sms" | "email" | "telegram" | "in_app";
  audience: string;
  sentAt: string;
  delivered: number;
  failed: number;
  status: "draft" | "scheduled" | "sending" | "sent" | "failed";
}

const initialNotifications: Notification[] = [
  { id: "notif_001", name: "Tanlov e'lon qilinishi", subject: "Qashqadaryo Startup Ligasi 2024 boshlandi", channel: "email", audience: "Barcha foydalanuvchilar", sentAt: "2024-03-01 10:00", delivered: 856, failed: 4, status: "sent" },
  { id: "notif_002", name: "Ariza deadline eslatmasi", subject: "Ariza topshirish muddati 1-iyul", channel: "sms", audience: "Ro'yxatdan o'tganlar", sentAt: "2024-06-20 09:00", delivered: 423, failed: 2, status: "sent" },
  { id: "notif_003", name: "Texnik tekshiruv natijasi", subject: "Arizangiz qabul qilindi", channel: "email", audience: "Qabul qilinganlar", sentAt: "2024-07-05 14:30", delivered: 142, failed: 0, status: "sent" },
  { id: "notif_004", name: "Saralash boshlandi", subject: "Loyihangiz baholanmoqda", channel: "telegram", audience: "Saralashdagilar", sentAt: "2024-07-16 11:00", delivered: 85, failed: 1, status: "sent" },
  { id: "notif_005", name: "Final eslatmasi", subject: "Final taqdimoti 20-avgust", channel: "sms", audience: "Finalchilar", sentAt: "2024-08-10 10:00", delivered: 0, failed: 0, status: "scheduled" },
  { id: "notif_006", name: "G'oliblar e'loni", subject: "Tabriklaymiz, siz g'olib bo'ldingiz!", channel: "email", audience: "G'oliblar", sentAt: "2024-09-25 16:00", delivered: 0, failed: 0, status: "draft" },
];

const channelConfig = {
  sms: { label: "SMS", color: "text-green-400" },
  email: { label: "Email", color: "text-blue-400" },
  telegram: { label: "Telegram", color: "text-cyan-400" },
  in_app: { label: "In-app", color: "text-purple-400" },
};

const statusConfig = {
  draft: { label: "Qoralama", color: "bg-gray-500/20 text-gray-400" },
  scheduled: { label: "Rejalashtirilgan", color: "bg-blue-500/20 text-blue-400" },
  sending: { label: "Yuborilmoqda", color: "bg-purple-500/20 text-purple-400" },
  sent: { label: "Yuborilgan", color: "bg-green-500/20 text-green-400" },
  failed: { label: "Xatolik", color: "bg-red-500/20 text-red-400" },
};

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<Notification[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("all");

  useEffect(() => {
    const saved = getFromStorage<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);
    if (saved.length === 0) {
      saveToStorage(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
      setNotifications(initialNotifications);
    } else {
      setNotifications(saved);
    }
  }, []);

  useEffect(() => {
    let filtered = notifications;
    if (searchQuery) {
      filtered = filtered.filter((n) => n.name.toLowerCase().includes(searchQuery.toLowerCase()) || n.subject.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (channelFilter !== "all") {
      filtered = filtered.filter((n) => n.channel === channelFilter);
    }
    setFilteredNotifications(filtered);
  }, [notifications, searchQuery, channelFilter]);

  const totalSent = notifications.filter((n) => n.status === "sent").reduce((sum, n) => sum + n.delivered, 0);
  const totalFailed = notifications.filter((n) => n.status === "sent").reduce((sum, n) => sum + n.failed, 0);

  const stats = [
    { label: "Jami xabarlar", value: notifications.length, icon: Bell, color: "text-blue-400" },
    { label: "Yuborilgan", value: notifications.filter((n) => n.status === "sent").length, icon: CheckCircle, color: "text-green-400" },
    { label: "Yetkazilgan", value: totalSent, icon: CheckCircle, color: "text-cyan-400" },
    { label: "Xatolik", value: totalFailed, icon: XCircle, color: "text-red-400" },
  ];

  return (
    <AdminShell>
      <AdminPageHeader
        title="Xabarlar"
        subtitle="SMS, email va Telegram xabarlarni yuborish"
        actions={
          <>
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors text-sm">
              <Download size={16} />
              <span>Logs</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium">
              <Plus size={16} />
              <span>Yangi xabar</span>
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`${stat.color}`} size={24} />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-[var(--admin-text-secondary)]">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" size={18} />
            <input
              type="text"
              placeholder="Nom yoki mavzu bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="all">Barcha kanallar</option>
            {Object.entries(channelConfig).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--admin-bg)] border-b border-[var(--admin-border)]">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Nom</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Mavzu</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Kanal</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Auditoriya</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Yuborilgan</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Yetkazilgan</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Xatolik</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Holat</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotifications.map((notif) => {
                const channelCfg = channelConfig[notif.channel];
                const statusCfg = statusConfig[notif.status];
                return (
                  <tr key={notif.id} className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-bg)] transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-white">{notif.name}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-[var(--admin-text-secondary)] max-w-xs truncate">{notif.subject}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-medium ${channelCfg.color}`}>{channelCfg.label}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-[var(--admin-text-secondary)]">{notif.audience}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-xs text-[var(--admin-text-muted)]">{formatDateTime(notif.sentAt)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-semibold text-green-400">{notif.delivered}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-semibold text-red-400">{notif.failed}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors" title="Yuborish">
                          <Send size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredNotifications.length === 0 && (
          <div className="py-12 text-center text-[var(--admin-text-muted)]">
            <Bell size={48} className="mx-auto mb-4 opacity-50" />
            <p>Xabarlar topilmadi</p>
          </div>
        )}
      </div>

      <div className="mt-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Clock size={20} className="text-amber-400 mt-0.5" />
          <div>
            <div className="font-medium text-amber-300 mb-1">Demo rejim</div>
            <div className="text-sm text-amber-400/80">
              Bu static demo versiyada real SMS/Email/Telegram xabarlari yuborilmaydi. Faqat mock delivery status yaratiladi.
            </div>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
