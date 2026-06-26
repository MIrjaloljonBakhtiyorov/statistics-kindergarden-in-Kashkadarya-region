import { AdminShell } from "../components/layout/AdminShell";
import { AdminPageHeader } from "../components/ui/AdminPageHeader";
import { useState, useEffect } from "react";
import { Search, Eye, Trophy, Medal, Star, Download, CheckCircle, Send } from "lucide-react";
import { getFromStorage, saveToStorage, STORAGE_KEYS } from "../utils/localStorage";

interface Result {
  id: string;
  rank: number;
  projectName: string;
  team: string;
  direction: string;
  location: string;
  averageScore: number;
  hasMVP: boolean;
  hasImplementation: boolean;
  status: "final" | "winner_1" | "winner_2" | "winner_3" | "special" | "promising";
  stage: "otm" | "region" | "city" | "province";
}

const initialResults: Result[] = [
  { id: "res_001", rank: 1, projectName: "Smart Agro Monitor", team: "Smart Agro Solutions", direction: "Agrotexnologiyalar", location: "Qarshi DU", averageScore: 94.5, hasMVP: true, hasImplementation: true, status: "winner_1", stage: "province" },
  { id: "res_002", rank: 2, projectName: "EduLearn Platform", team: "EduTech Innovators", direction: "Ta'lim", location: "Qarshi DU", averageScore: 92.8, hasMVP: true, hasImplementation: true, status: "winner_2", stage: "province" },
  { id: "res_003", rank: 3, projectName: "HealthAI Diagnostic", team: "HealthCare AI", direction: "Tibbiyot", location: "TDIU Qarshi", averageScore: 90.2, hasMVP: false, hasImplementation: true, status: "winner_3", stage: "province" },
  { id: "res_004", rank: 4, projectName: "MicroCredit App", team: "Fintech Pro", direction: "Fintech", location: "Qarshi IB", averageScore: 88.7, hasMVP: true, hasImplementation: false, status: "special", stage: "province" },
  { id: "res_005", rank: 5, projectName: "Smart City Dashboard", team: "Smart City Solutions", direction: "IT", location: "Qarshi DU", averageScore: 87.5, hasMVP: true, hasImplementation: true, status: "promising", stage: "province" },
  { id: "res_006", rank: 6, projectName: "Logistics Optimizer", team: "Logistics Hub", direction: "Logistika", location: "Shahrisabz", averageScore: 86.3, hasMVP: true, hasImplementation: false, status: "promising", stage: "province" },
  { id: "res_007", rank: 7, projectName: "E-Gov Services", team: "E-Government", direction: "Davlat xizmatlari", location: "Qarshi IB", averageScore: 85.1, hasMVP: true, hasImplementation: true, status: "promising", stage: "province" },
  { id: "res_008", rank: 8, projectName: "Green Energy System", team: "Green Energy", direction: "Yashil texnologiyalar", location: "Qarshi shahar", averageScore: 83.9, hasMVP: false, hasImplementation: false, status: "final", stage: "province" },
];

const statusConfig = {
  winner_1: { label: "1-o'rin", color: "bg-amber-500/20 text-amber-400", icon: Trophy },
  winner_2: { label: "2-o'rin", color: "bg-gray-400/20 text-gray-300", icon: Medal },
  winner_3: { label: "3-o'rin", color: "bg-orange-600/20 text-orange-400", icon: Medal },
  special: { label: "Maxsus nominatsiya", color: "bg-purple-500/20 text-purple-400", icon: Star },
  promising: { label: "Istiqbolli loyiha", color: "bg-blue-500/20 text-blue-400", icon: Star },
  final: { label: "Finalchi", color: "bg-green-500/20 text-green-400", icon: CheckCircle },
};

export function ResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [filteredResults, setFilteredResults] = useState<Result[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("province");

  useEffect(() => {
    const saved = getFromStorage<Result[]>(STORAGE_KEYS.RESULTS, []);
    if (saved.length === 0) {
      saveToStorage(STORAGE_KEYS.RESULTS, initialResults);
      setResults(initialResults);
    } else {
      setResults(saved);
    }
  }, []);

  useEffect(() => {
    let filtered = results;
    if (searchQuery) {
      filtered = filtered.filter((r) => r.projectName.toLowerCase().includes(searchQuery.toLowerCase()) || r.team.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (stageFilter !== "all") {
      filtered = filtered.filter((r) => r.stage === stageFilter);
    }
    setFilteredResults(filtered.sort((a, b) => a.rank - b.rank));
  }, [results, searchQuery, stageFilter]);

  const stats = [
    { label: "Jami finalchilar", value: results.length, icon: Trophy, color: "text-blue-400" },
    { label: "G'oliblar", value: results.filter((r) => r.status.startsWith("winner")).length, icon: Trophy, color: "text-amber-400" },
    { label: "Maxsus nominatsiya", value: results.filter((r) => r.status === "special").length, icon: Star, color: "text-purple-400" },
    { label: "Istiqbolli", value: results.filter((r) => r.status === "promising").length, icon: Star, color: "text-blue-400" },
  ];

  return (
    <AdminShell>
      <AdminPageHeader
        title="Natijalar"
        subtitle="Tanlov natijalari va g'oliblar"
        actions={
          <>
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors text-sm">
              <Download size={16} />
              <span>Hisobot</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium">
              <Send size={16} />
              <span>Natijalarni e'lon qilish</span>
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
          <div className="flex gap-2">
            {["otm", "region", "city", "province"].map((stage) => (
              <button
                key={stage}
                onClick={() => setStageFilter(stage)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  stageFilter === stage
                    ? "bg-blue-600 text-white"
                    : "bg-[var(--admin-bg)] text-[var(--admin-text-secondary)] hover:text-white"
                }`}
              >
                {stage === "otm" ? "OTM" : stage === "region" ? "Tuman" : stage === "city" ? "Shahar" : "Viloyat finali"}
              </button>
            ))}
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" size={18} />
            <input
              type="text"
              placeholder="Loyiha yoki jamoa bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--admin-bg)] border-b border-[var(--admin-border)]">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">O'rin</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Loyiha</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Jamoa</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Yo'nalish</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">OTM/Hudud</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">O'rtacha ball</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">MVP</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Natija</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((result) => {
                const statusCfg = statusConfig[result.status];
                const StatusIcon = statusCfg.icon;
                return (
                  <tr key={result.id} className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-bg)] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <StatusIcon size={20} className={statusCfg.color.split(" ")[1].replace("text-", "text-")} />
                        <span className="text-2xl font-bold text-white">{result.rank}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-white">{result.projectName}</div>
                    </td>
                    <td className="py-4 px-6 text-[var(--admin-text-secondary)]">{result.team}</td>
                    <td className="py-4 px-6 text-[var(--admin-text-secondary)]">{result.direction}</td>
                    <td className="py-4 px-6 text-[var(--admin-text-secondary)]">{result.location}</td>
                    <td className="py-4 px-6">
                      <span className="text-xl font-bold text-white">{result.averageScore}</span>
                    </td>
                    <td className="py-4 px-6">
                      {result.hasMVP ? (
                        <CheckCircle size={16} className="text-green-400" />
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
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

        {filteredResults.length === 0 && (
          <div className="py-12 text-center text-[var(--admin-text-muted)]">
            <Trophy size={48} className="mx-auto mb-4 opacity-50" />
            <p>Natijalar topilmadi</p>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
