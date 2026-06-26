import { AdminShell } from "../components/layout/AdminShell";
import { AdminPageHeader } from "../components/ui/AdminPageHeader";
import { useState, useEffect } from "react";
import { Plus, Search, Edit, Layers, CheckCircle, Clock, Download, Play, Pause } from "lucide-react";
import { getFromStorage, saveToStorage, STORAGE_KEYS, addAuditLog, formatDate } from "../utils/localStorage";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";

interface Stage {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "planned" | "active" | "paused" | "completed";
  responsible: string;
  projectsCount: number;
  judgesCount: number;
  quota?: number;
  progress: number;
}

const initialStages: Stage[] = [
  { id: "stage_001", name: "Ariza qabuli", startDate: "2024-03-01", endDate: "2024-07-01", status: "active", responsible: "Nodira Aliyeva", projectsCount: 142, judgesCount: 0, progress: 75 },
  { id: "stage_002", name: "Texnik tekshiruv", startDate: "2024-07-02", endDate: "2024-07-15", status: "active", responsible: "Aziz Yusupov", projectsCount: 85, judgesCount: 5, progress: 45 },
  { id: "stage_003", name: "OTM saralashi", startDate: "2024-07-16", endDate: "2024-08-15", status: "planned", responsible: "Jasur Rahmonov", projectsCount: 0, judgesCount: 8, quota: 50, progress: 0 },
  { id: "stage_004", name: "Tuman saralashi", startDate: "2024-07-16", endDate: "2024-08-15", status: "planned", responsible: "Bekzod Nurmatov", projectsCount: 0, judgesCount: 6, quota: 30, progress: 0 },
  { id: "stage_005", name: "Viloyat finali", startDate: "2024-08-20", endDate: "2024-09-10", status: "planned", responsible: "Sherzod Karimov", projectsCount: 0, judgesCount: 12, quota: 20, progress: 0 },
  { id: "stage_006", name: "Apellyatsiya", startDate: "2024-09-11", endDate: "2024-09-20", status: "planned", responsible: "Nodira Aliyeva", projectsCount: 0, judgesCount: 5, progress: 0 },
  { id: "stage_007", name: "Natijalar e'lon qilish", startDate: "2024-09-25", endDate: "2024-09-30", status: "planned", responsible: "Sherzod Karimov", projectsCount: 0, judgesCount: 0, progress: 0 },
  { id: "stage_008", name: "Taqdirlash marosimi", startDate: "2024-10-05", endDate: "2024-10-05", status: "planned", responsible: "Nodira Aliyeva", projectsCount: 0, judgesCount: 0, progress: 0 },
];

const statusConfig = {
  planned: { label: "Rejalashtirilgan", color: "bg-gray-500/20 text-gray-400" },
  active: { label: "Faol", color: "bg-green-500/20 text-green-400" },
  paused: { label: "To'xtatilgan", color: "bg-amber-500/20 text-amber-400" },
  completed: { label: "Yakunlangan", color: "bg-blue-500/20 text-blue-400" },
};

export function StagesPage() {
  const [stages, setStages] = useState<Stage[]>([]);
  const [filteredStages, setFilteredStages] = useState<Stage[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: "danger" | "warning" | "info";
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  useEffect(() => {
    const saved = getFromStorage<Stage[]>(STORAGE_KEYS.STAGES, []);
    if (saved.length === 0) {
      saveToStorage(STORAGE_KEYS.STAGES, initialStages);
      setStages(initialStages);
    } else {
      setStages(saved);
    }
  }, []);

  useEffect(() => {
    let filtered = stages;
    if (searchQuery) {
      filtered = filtered.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.responsible.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (statusFilter !== "all") filtered = filtered.filter((s) => s.status === statusFilter);
    setFilteredStages(filtered);
  }, [stages, searchQuery, statusFilter]);

  const updateStage = (id: string, updates: Partial<Stage>) => {
    const updated = stages.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setStages(updated);
    saveToStorage(STORAGE_KEYS.STAGES, updated);
  };

  const handleToggleStatus = (stage: Stage) => {
    const newStatus = stage.status === "active" ? "paused" : "active";
    setConfirmDialog({
      isOpen: true,
      title: stage.status === "active" ? "Bosqichni to'xtatish" : "Bosqichni ochish",
      message: `"${stage.name}" bosqichini ${stage.status === "active" ? "to'xtatishni" : "ochishni"} xohlaysizmi?`,
      onConfirm: () => {
        updateStage(stage.id, { status: newStatus });
        addAuditLog({
          user: "mister_italiano",
          action: "toggle_stage_status",
          module: "stages",
          objectType: "stage",
          objectId: stage.id,
          oldValue: stage.status,
          newValue: newStatus,
          status: "success",
          severity: "high",
        });
      },
      variant: "info",
    });
  };

  const stats = [
    { label: "Jami bosqichlar", value: stages.length, icon: Layers, color: "text-blue-400" },
    { label: "Faol bosqichlar", value: stages.filter((s) => s.status === "active").length, icon: CheckCircle, color: "text-green-400" },
    { label: "Rejalashtirilgan", value: stages.filter((s) => s.status === "planned").length, icon: Clock, color: "text-amber-400" },
    { label: "Yakunlangan", value: stages.filter((s) => s.status === "completed").length, icon: CheckCircle, color: "text-blue-400" },
  ];

  return (
    <AdminShell>
      <AdminPageHeader
        title="Bosqichlar"
        subtitle="Tanlov bosqichlarini boshqarish va monitoring"
        actions={
          <>
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors text-sm">
              <Download size={16} />
              <span>Eksport</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium">
              <Plus size={16} />
              <span>Bosqich qo'shish</span>
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
              placeholder="Bosqich yoki mas'ul bo'yicha qidirish..."
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
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Bosqich</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Muddat</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Mas'ul</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Loyihalar</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Hakamlar</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Progress</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Holat</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredStages.map((stage) => {
                const statusCfg = statusConfig[stage.status];
                return (
                  <tr key={stage.id} className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-bg)] transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-white">{stage.name}</div>
                      {stage.quota && <div className="text-xs text-[var(--admin-text-muted)] mt-1">Kvota: {stage.quota}</div>}
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-[var(--admin-text-secondary)]">
                        {formatDate(stage.startDate)} - {formatDate(stage.endDate)}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-[var(--admin-text-secondary)]">{stage.responsible}</td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-white">{stage.projectsCount}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-white">{stage.judgesCount}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-[80px]">
                          <div className="h-2 bg-[var(--admin-bg)] rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${stage.progress}%` }} />
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-white min-w-[40px]">{stage.progress}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-[var(--admin-surface-2)] rounded-lg transition-colors" title="Tahrirlash">
                          <Edit size={16} />
                        </button>
                        {(stage.status === "active" || stage.status === "paused") && (
                          <button
                            onClick={() => handleToggleStatus(stage)}
                            className="p-2 hover:bg-[var(--admin-surface-2)] rounded-lg transition-colors"
                            title={stage.status === "active" ? "To'xtatish" : "Ochish"}
                          >
                            {stage.status === "active" ? <Pause size={16} /> : <Play size={16} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredStages.length === 0 && (
          <div className="py-12 text-center text-[var(--admin-text-muted)]">
            <Layers size={48} className="mx-auto mb-4 opacity-50" />
            <p>Bosqichlar topilmadi</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
      />
    </AdminShell>
  );
}
