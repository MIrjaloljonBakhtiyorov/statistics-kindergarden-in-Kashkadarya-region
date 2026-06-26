import { AdminShell } from "../components/layout/AdminShell";
import { AdminPageHeader } from "../components/ui/AdminPageHeader";
import { useState, useEffect } from "react";
import { Plus, Search, Eye, MessageSquare, CheckCircle, XCircle, Clock, AlertCircle, Download } from "lucide-react";
import { getFromStorage, saveToStorage, STORAGE_KEYS, formatDate } from "../utils/localStorage";

interface Appeal {
  id: string;
  applicationId: string;
  participant: string;
  projectName: string;
  reason: string;
  submittedAt: string;
  deadline: string;
  responsible?: string;
  status: "new" | "accepted" | "under_review" | "need_info" | "approved" | "rejected" | "expired";
}

const initialAppeals: Appeal[] = [
  { id: "appeal_001", applicationId: "app_009", participant: "Dilshod Xolmatov", projectName: "Water Saver IoT", reason: "Baholash mezonlari noto'g'ri qo'llanilgan", submittedAt: "2024-06-20", deadline: "2024-06-27", responsible: "Nodira Aliyeva", status: "under_review" },
  { id: "appeal_002", applicationId: "app_012", participant: "Ravshan Mirzayev", projectName: "AI Learning App", reason: "Texnik xatolik tufayli ball kamaygan", submittedAt: "2024-06-21", deadline: "2024-06-28", status: "new" },
  { id: "appeal_003", applicationId: "app_015", participant: "Zarina Abdullayeva", projectName: "Tourism Platform", reason: "Hakamlar ball qo'yishda xatolik qilgan", submittedAt: "2024-06-19", deadline: "2024-06-26", responsible: "Aziz Yusupov", status: "approved" },
  { id: "appeal_004", applicationId: "app_018", participant: "Bekzod Nurmatov", projectName: "Smart Logistics", reason: "MVP taqdim etilmagan deb noto'g'ri baholangan", submittedAt: "2024-06-18", deadline: "2024-06-25", responsible: "Sherzod Karimov", status: "rejected" },
  { id: "appeal_005", applicationId: "app_021", participant: "Gulnoza Xasanova", projectName: "EcoFarm System", reason: "Qo'shimcha ma'lumotlar so'ralgan", submittedAt: "2024-06-22", deadline: "2024-06-29", responsible: "Jasur Rahmonov", status: "need_info" },
];

const statusConfig = {
  new: { label: "Yangi", color: "bg-blue-500/20 text-blue-400" },
  accepted: { label: "Qabul qilingan", color: "bg-cyan-500/20 text-cyan-400" },
  under_review: { label: "Ko'rib chiqilmoqda", color: "bg-purple-500/20 text-purple-400" },
  need_info: { label: "Qo'shimcha ma'lumot", color: "bg-amber-500/20 text-amber-400" },
  approved: { label: "Qanoatlantirilgan", color: "bg-green-500/20 text-green-400" },
  rejected: { label: "Rad etilgan", color: "bg-red-500/20 text-red-400" },
  expired: { label: "Muddati o'tgan", color: "bg-gray-500/20 text-gray-400" },
};

export function AppealsPage() {
  const [appeals, setAppeals] = useState<Appeal[]>([]);
  const [filteredAppeals, setFilteredAppeals] = useState<Appeal[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const saved = getFromStorage<Appeal[]>(STORAGE_KEYS.APPEALS, []);
    if (saved.length === 0) {
      saveToStorage(STORAGE_KEYS.APPEALS, initialAppeals);
      setAppeals(initialAppeals);
    } else {
      setAppeals(saved);
    }
  }, []);

  useEffect(() => {
    let filtered = appeals;
    if (searchQuery) {
      filtered = filtered.filter(
        (a) =>
          a.participant.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }
    setFilteredAppeals(filtered);
  }, [appeals, searchQuery, statusFilter]);

  const stats = [
    { label: "Jami apellyatsiyalar", value: appeals.length, icon: MessageSquare, color: "text-blue-400" },
    { label: "Yangi", value: appeals.filter((a) => a.status === "new").length, icon: AlertCircle, color: "text-cyan-400" },
    { label: "Ko'rib chiqilmoqda", value: appeals.filter((a) => a.status === "under_review").length, icon: Clock, color: "text-purple-400" },
    { label: "Qanoatlantirilgan", value: appeals.filter((a) => a.status === "approved").length, icon: CheckCircle, color: "text-green-400" },
  ];

  return (
    <AdminShell>
      <AdminPageHeader
        title="Apellyatsiyalar"
        subtitle="Ishtirokchilar apellyatsiyalarini ko'rish va hal qilish"
        actions={
          <>
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors text-sm">
              <Download size={16} />
              <span>Hisobot</span>
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
              placeholder="ID, ishtirokchi yoki loyiha bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="all">Barcha holatlar</option>
            {Object.entries(statusConfig).map(([key, config]) => (
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
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">ID</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Ariza</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Ishtirokchi</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Loyiha</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Sabab</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Yuborilgan</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Deadline</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Mas'ul</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Holat</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppeals.map((appeal) => {
                const statusCfg = statusConfig[appeal.status];
                return (
                  <tr key={appeal.id} className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-bg)] transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-mono text-xs text-[var(--admin-text-muted)]">{appeal.id}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-mono text-xs text-[var(--admin-text-muted)]">{appeal.applicationId}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-white">{appeal.participant}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-[var(--admin-text-secondary)]">{appeal.projectName}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-[var(--admin-text-secondary)] max-w-xs truncate">{appeal.reason}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-[var(--admin-text-secondary)]">{formatDate(appeal.submittedAt)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-[var(--admin-text-secondary)]">{formatDate(appeal.deadline)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-[var(--admin-text-secondary)]">{appeal.responsible || "—"}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-[var(--admin-surface-2)] rounded-lg transition-colors" title="Ko'rish">
                          <Eye size={16} />
                        </button>
                        {appeal.status === "under_review" && (
                          <>
                            <button className="p-2 hover:bg-green-500/10 text-green-400 rounded-lg transition-colors" title="Qanoatlantirish">
                              <CheckCircle size={16} />
                            </button>
                            <button className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors" title="Rad etish">
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredAppeals.length === 0 && (
          <div className="py-12 text-center text-[var(--admin-text-muted)]">
            <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
            <p>Apellyatsiyalar topilmadi</p>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
