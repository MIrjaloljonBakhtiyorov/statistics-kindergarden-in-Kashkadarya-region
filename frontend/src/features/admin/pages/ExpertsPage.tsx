import { AdminShell } from "../components/layout/AdminShell";
import { AdminPageHeader } from "../components/ui/AdminPageHeader";
import { useState, useEffect } from "react";
import { Plus, Search, Eye, GraduationCap, CheckCircle, Clock, Download } from "lucide-react";
import { getFromStorage, saveToStorage, STORAGE_KEYS } from "../utils/localStorage";

interface Expert {
  id: string;
  name: string;
  organization: string;
  specialization: string;
  expertType: "technical" | "financial" | "legal" | "market" | "sectoral";
  directions: string[];
  assigned: number;
  completed: number;
  status: "active" | "busy" | "completed";
}

const initialExperts: Expert[] = [
  { id: "exp_001", name: "Dr. Aziz Mahmudov", organization: "IT Park", specialization: "Texnik ekspertiza", expertType: "technical", directions: ["IT", "AI"], assigned: 8, completed: 6, status: "active" },
  { id: "exp_002", name: "Sherzod Karimov", organization: "O'zRIFB", specialization: "Moliyaviy tahlil", expertType: "financial", directions: ["Fintech"], assigned: 12, completed: 10, status: "active" },
  { id: "exp_003", name: "Nodira Yusupova", organization: "Advokatlar kollegiyasi", specialization: "Huquqiy ekspertiza", expertType: "legal", directions: ["Barcha"], assigned: 15, completed: 15, status: "completed" },
  { id: "exp_004", name: "Bekzod Rahimov", organization: "Marketing agentligi", specialization: "Bozor tahlili", expertType: "market", directions: ["Biznes"], assigned: 10, completed: 8, status: "active" },
  { id: "exp_005", name: "Malika Toshmatova", organization: "Agro universitet", specialization: "Qishloq xo'jaligi", expertType: "sectoral", directions: ["Agro"], assigned: 6, completed: 6, status: "completed" },
];

const expertTypeConfig = {
  technical: { label: "Texnik", color: "text-blue-400" },
  financial: { label: "Moliyaviy", color: "text-green-400" },
  legal: { label: "Huquqiy", color: "text-purple-400" },
  market: { label: "Bozor", color: "text-amber-400" },
  sectoral: { label: "Sohaviy", color: "text-cyan-400" },
};

const statusConfig = {
  active: { label: "Faol", color: "bg-green-500/20 text-green-400" },
  busy: { label: "Band", color: "bg-amber-500/20 text-amber-400" },
  completed: { label: "Yakunlagan", color: "bg-blue-500/20 text-blue-400" },
};

export function ExpertsPage() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [filteredExperts, setFilteredExperts] = useState<Expert[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  useEffect(() => {
    const saved = getFromStorage<Expert[]>(STORAGE_KEYS.EXPERTS, []);
    if (saved.length === 0) {
      saveToStorage(STORAGE_KEYS.EXPERTS, initialExperts);
      setExperts(initialExperts);
    } else {
      setExperts(saved);
    }
  }, []);

  useEffect(() => {
    let filtered = experts;
    if (searchQuery) {
      filtered = filtered.filter((e) => e.name.toLowerCase().includes(searchQuery.toLowerCase()) || e.specialization.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (typeFilter !== "all") filtered = filtered.filter((e) => e.expertType === typeFilter);
    setFilteredExperts(filtered);
  }, [experts, searchQuery, typeFilter]);

  const stats = [
    { label: "Jami ekspertlar", value: experts.length, icon: GraduationCap, color: "text-blue-400" },
    { label: "Faol", value: experts.filter((e) => e.status === "active").length, icon: CheckCircle, color: "text-green-400" },
    { label: "Band", value: experts.filter((e) => e.status === "busy").length, icon: Clock, color: "text-amber-400" },
    { label: "Yakunlagan", value: experts.filter((e) => e.status === "completed").length, icon: CheckCircle, color: "text-blue-400" },
  ];

  return (
    <AdminShell>
      <AdminPageHeader
        title="Ekspertlar"
        subtitle="Texnik, moliyaviy va boshqa ekspertlarni boshqarish"
        actions={
          <>
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors text-sm">
              <Download size={16} />
              <span>Eksport</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium">
              <Plus size={16} />
              <span>Ekspert qo'shish</span>
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
              placeholder="Ekspert yoki mutaxassislik bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="all">Barcha turlar</option>
            {Object.entries(expertTypeConfig).map(([key, config]) => (
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
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Ekspert</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Tashkilot</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Mutaxassislik</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Tur</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Biriktirilgan</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Yakunlangan</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Holat</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredExperts.map((expert) => {
                const typeCfg = expertTypeConfig[expert.expertType];
                const statusCfg = statusConfig[expert.status];
                return (
                  <tr key={expert.id} className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-bg)] transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-white">{expert.name}</div>
                    </td>
                    <td className="py-4 px-6 text-[var(--admin-text-secondary)]">{expert.organization}</td>
                    <td className="py-4 px-6 text-[var(--admin-text-secondary)]">{expert.specialization}</td>
                    <td className="py-4 px-6">
                      <span className={`font-medium ${typeCfg.color}`}>{typeCfg.label}</span>
                    </td>
                    <td className="py-4 px-6 font-semibold text-white">{expert.assigned}</td>
                    <td className="py-4 px-6 font-semibold text-white">{expert.completed}</td>
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

        {filteredExperts.length === 0 && (
          <div className="py-12 text-center text-[var(--admin-text-muted)]">
            <GraduationCap size={48} className="mx-auto mb-4 opacity-50" />
            <p>Ekspertlar topilmadi</p>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
