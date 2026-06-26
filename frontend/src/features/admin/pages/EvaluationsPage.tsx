import { AdminShell } from "../components/layout/AdminShell";
import { AdminPageHeader } from "../components/ui/AdminPageHeader";
import { useState, useEffect } from "react";
import { Search, Eye, BarChart3, CheckCircle, Clock, AlertTriangle, Download } from "lucide-react";
import { getFromStorage, saveToStorage, STORAGE_KEYS } from "../utils/localStorage";

interface Evaluation {
  id: string;
  projectName: string;
  judgesAssigned: number;
  judgesCompleted: number;
  averageScore?: number;
  minScore?: number;
  maxScore?: number;
  scoreDiff?: number;
  status: "not_started" | "in_progress" | "completed" | "conflict" | "awaiting_comment";
}

const initialEvaluations: Evaluation[] = [
  { id: "eval_001", projectName: "Smart Agro Monitor", judgesAssigned: 3, judgesCompleted: 3, averageScore: 94.5, minScore: 92, maxScore: 97, scoreDiff: 5, status: "completed" },
  { id: "eval_002", projectName: "EduLearn Platform", judgesAssigned: 3, judgesCompleted: 3, averageScore: 92.8, minScore: 90, maxScore: 95, scoreDiff: 5, status: "completed" },
  { id: "eval_003", projectName: "HealthAI Diagnostic", judgesAssigned: 3, judgesCompleted: 2, averageScore: 88.5, minScore: 85, maxScore: 92, scoreDiff: 7, status: "in_progress" },
  { id: "eval_004", projectName: "MicroCredit App", judgesAssigned: 3, judgesCompleted: 3, averageScore: 87.0, minScore: 82, maxScore: 105, scoreDiff: 23, status: "conflict" },
  { id: "eval_005", projectName: "Smart City Dashboard", judgesAssigned: 3, judgesCompleted: 0, status: "not_started" },
  { id: "eval_006", projectName: "Logistics Optimizer", judgesAssigned: 3, judgesCompleted: 3, averageScore: 86.3, minScore: 84, maxScore: 89, scoreDiff: 5, status: "completed" },
  { id: "eval_007", projectName: "Green Energy System", judgesAssigned: 3, judgesCompleted: 2, averageScore: 83.5, minScore: 80, maxScore: 87, scoreDiff: 7, status: "in_progress" },
  { id: "eval_008", projectName: "Tourism Navigator", judgesAssigned: 3, judgesCompleted: 1, status: "in_progress" },
];

const statusConfig = {
  not_started: { label: "Boshlanmagan", color: "bg-gray-500/20 text-gray-400" },
  in_progress: { label: "Jarayonda", color: "bg-blue-500/20 text-blue-400" },
  completed: { label: "Yakunlangan", color: "bg-green-500/20 text-green-400" },
  conflict: { label: "20+ tafovut", color: "bg-red-500/20 text-red-400" },
  awaiting_comment: { label: "Izoh kutilmoqda", color: "bg-amber-500/20 text-amber-400" },
};

export function EvaluationsPage() {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [filteredEvaluations, setFilteredEvaluations] = useState<Evaluation[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const saved = getFromStorage<Evaluation[]>(STORAGE_KEYS.EVALUATIONS, []);
    if (saved.length === 0) {
      saveToStorage(STORAGE_KEYS.EVALUATIONS, initialEvaluations);
      setEvaluations(initialEvaluations);
    } else {
      setEvaluations(saved);
    }
  }, []);

  useEffect(() => {
    let filtered = evaluations;
    if (searchQuery) {
      filtered = filtered.filter((e) => e.projectName.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((e) => e.status === statusFilter);
    }
    setFilteredEvaluations(filtered);
  }, [evaluations, searchQuery, statusFilter]);

  const stats = [
    { label: "Jami loyihalar", value: evaluations.length, icon: BarChart3, color: "text-blue-400" },
    { label: "Baholangan", value: evaluations.filter((e) => e.status === "completed").length, icon: CheckCircle, color: "text-green-400" },
    { label: "Jarayonda", value: evaluations.filter((e) => e.status === "in_progress").length, icon: Clock, color: "text-amber-400" },
    { label: "20+ tafovut", value: evaluations.filter((e) => e.status === "conflict").length, icon: AlertTriangle, color: "text-red-400" },
  ];

  return (
    <AdminShell>
      <AdminPageHeader
        title="Baholash"
        subtitle="Hakamlar baholashi va monitoring"
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
              placeholder="Loyiha bo'yicha qidirish..."
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
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Hakamlar</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Yakunlangan</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">O'rtacha</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Min / Max</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Tafovut</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Holat</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvaluations.map((evaluation) => {
                const statusCfg = statusConfig[evaluation.status];
                const progress = evaluation.judgesAssigned > 0 ? (evaluation.judgesCompleted / evaluation.judgesAssigned) * 100 : 0;
                return (
                  <tr key={evaluation.id} className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-bg)] transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-white">{evaluation.projectName}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-white">{evaluation.judgesAssigned}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{evaluation.judgesCompleted}</span>
                        <div className="flex-1 min-w-[60px]">
                          <div className="h-1.5 bg-[var(--admin-bg)] rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {evaluation.averageScore ? (
                        <span className="text-lg font-bold text-white">{evaluation.averageScore}</span>
                      ) : (
                        <span className="text-[var(--admin-text-muted)]">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {evaluation.minScore && evaluation.maxScore ? (
                        <span className="text-sm text-[var(--admin-text-secondary)]">
                          {evaluation.minScore} / {evaluation.maxScore}
                        </span>
                      ) : (
                        <span className="text-[var(--admin-text-muted)]">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {evaluation.scoreDiff !== undefined ? (
                        <span className={`font-semibold ${evaluation.scoreDiff > 20 ? "text-red-400" : "text-white"}`}>
                          {evaluation.scoreDiff}
                        </span>
                      ) : (
                        <span className="text-[var(--admin-text-muted)]">—</span>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-[var(--admin-surface-2)} rounded-lg transition-colors" title="Ko'rish">
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

        {filteredEvaluations.length === 0 && (
          <div className="py-12 text-center text-[var(--admin-text-muted)]">
            <BarChart3 size={48} className="mx-auto mb-4 opacity-50" />
            <p>Baholash ma'lumotlari topilmadi</p>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
