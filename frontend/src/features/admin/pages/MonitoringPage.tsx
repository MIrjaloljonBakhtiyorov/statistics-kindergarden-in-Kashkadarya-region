import { AdminShell } from "../components/layout/AdminShell";
import { AdminPageHeader } from "../components/ui/AdminPageHeader";
import { useState, useEffect } from "react";
import { Search, Eye, Activity, CheckCircle, Clock, TrendingUp, Download } from "lucide-react";
import { getFromStorage, saveToStorage, STORAGE_KEYS } from "../utils/localStorage";

interface MonitoringProject {
  id: string;
  projectName: string;
  winner: string;
  place: string;
  month: number;
  roadmapSubmitted: boolean;
  mvpCreated: boolean;
  hasCustomers: boolean;
  revenue: string;
  jobs: number;
  investment: string;
  progress: number;
  status: "on_track" | "delayed" | "at_risk" | "completed";
}

const initialMonitoring: MonitoringProject[] = [
  { id: "mon_001", projectName: "Smart Agro Monitor", winner: "Alisher Karimov", place: "1-o'rin", month: 3, roadmapSubmitted: true, mvpCreated: true, hasCustomers: true, revenue: "5,000,000", jobs: 2, investment: "0", progress: 75, status: "on_track" },
  { id: "mon_002", projectName: "EduLearn Platform", winner: "Nodira Toshmatova", place: "2-o'rin", month: 3, roadmapSubmitted: true, mvpCreated: true, hasCustomers: false, revenue: "0", jobs: 1, investment: "0", progress: 60, status: "on_track" },
  { id: "mon_003", projectName: "HealthAI Diagnostic", winner: "Malika Yusupova", place: "3-o'rin", month: 2, roadmapSubmitted: true, mvpCreated: false, hasCustomers: false, revenue: "0", jobs: 0, investment: "0", progress: 40, status: "delayed" },
  { id: "mon_004", projectName: "MicroCredit App", winner: "Sardor Ismoilov", place: "Maxsus", month: 3, roadmapSubmitted: true, mvpCreated: true, hasCustomers: true, revenue: "8,500,000", jobs: 3, investment: "15,000,000", progress: 85, status: "on_track" },
  { id: "mon_005", projectName: "Smart City Dashboard", winner: "Jasur Rahmonov", place: "Finalchi", month: 1, roadmapSubmitted: false, mvpCreated: false, hasCustomers: false, revenue: "0", jobs: 0, investment: "0", progress: 20, status: "at_risk" },
];

const statusConfig = {
  on_track: { label: "O'z vaqtida", color: "bg-green-500/20 text-green-400" },
  delayed: { label: "Kechikmoqda", color: "bg-amber-500/20 text-amber-400" },
  at_risk: { label: "Xavf ostida", color: "bg-red-500/20 text-red-400" },
  completed: { label: "Yakunlangan", color: "bg-blue-500/20 text-blue-400" },
};

export function MonitoringPage() {
  const [monitoring, setMonitoring] = useState<MonitoringProject[]>([]);
  const [filteredMonitoring, setFilteredMonitoring] = useState<MonitoringProject[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const saved = getFromStorage<MonitoringProject[]>(STORAGE_KEYS.MONITORING, []);
    if (saved.length === 0) {
      saveToStorage(STORAGE_KEYS.MONITORING, initialMonitoring);
      setMonitoring(initialMonitoring);
    } else {
      setMonitoring(saved);
    }
  }, []);

  useEffect(() => {
    let filtered = monitoring;
    if (searchQuery) {
      filtered = filtered.filter((m) => m.projectName.toLowerCase().includes(searchQuery.toLowerCase()) || m.winner.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((m) => m.status === statusFilter);
    }
    setFilteredMonitoring(filtered);
  }, [monitoring, searchQuery, statusFilter]);

  const stats = [
    { label: "Monitoringdagi loyihalar", value: monitoring.length, icon: Activity, color: "text-blue-400" },
    { label: "O'z vaqtida", value: monitoring.filter((m) => m.status === "on_track").length, icon: CheckCircle, color: "text-green-400" },
    { label: "MVP yaratgan", value: monitoring.filter((m) => m.mvpCreated).length, icon: TrendingUp, color: "text-purple-400" },
    { label: "Kechikmoqda", value: monitoring.filter((m) => m.status === "delayed").length, icon: Clock, color: "text-amber-400" },
  ];

  return (
    <AdminShell>
      <AdminPageHeader
        title="Monitoring"
        subtitle="G'oliblar loyihalarini 6 oylik monitoring"
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
              placeholder="Loyiha yoki g'olib bo'yicha qidirish..."
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
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Loyiha</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">G'olib</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Oy</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">MVP</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Mijozlar</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Tushum</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Ish o'rinlari</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Progress</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Holat</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredMonitoring.map((project) => {
                const statusCfg = statusConfig[project.status];
                return (
                  <tr key={project.id} className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-bg)] transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-white">{project.projectName}</div>
                      <div className="text-xs text-[var(--admin-text-muted)] mt-1">{project.place}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-[var(--admin-text-secondary)]">{project.winner}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-semibold text-white">{project.month}/6</div>
                    </td>
                    <td className="py-4 px-6">
                      {project.mvpCreated ? (
                        <CheckCircle size={16} className="text-green-400" />
                      ) : (
                        <Clock size={16} className="text-gray-500" />
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {project.hasCustomers ? (
                        <CheckCircle size={16} className="text-green-400" />
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-semibold text-white">{project.revenue}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-semibold text-white">{project.jobs}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-[60px]">
                          <div className="h-1.5 bg-[var(--admin-bg)] rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${project.progress}%` }} />
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-white">{project.progress}%</span>
                      </div>
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
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredMonitoring.length === 0 && (
          <div className="py-12 text-center text-[var(--admin-text-muted)]">
            <Activity size={48} className="mx-auto mb-4 opacity-50" />
            <p>Monitoring ma'lumotlari topilmadi</p>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
