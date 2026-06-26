import { AdminShell } from "../components/layout/AdminShell";
import { AdminPageHeader } from "../components/ui/AdminPageHeader";
import { useState, useEffect } from "react";
import { Plus, Search, Eye, Award, Download, Send, FileCheck, XCircle } from "lucide-react";
import { getFromStorage, saveToStorage, STORAGE_KEYS, formatDate } from "../utils/localStorage";

interface Certificate {
  id: string;
  certificateNumber: string;
  participant: string;
  team?: string;
  projectName: string;
  stage: string;
  result: string;
  issuedAt: string;
  status: "generated" | "sent" | "downloaded" | "cancelled";
}

const initialCertificates: Certificate[] = [
  { id: "cert_001", certificateNumber: "QSL-2024-001", participant: "Alisher Karimov", team: "Smart Agro Solutions", projectName: "Smart Agro Monitor", stage: "Viloyat finali", result: "1-o'rin g'olibi", issuedAt: "2024-09-30", status: "sent" },
  { id: "cert_002", certificateNumber: "QSL-2024-002", participant: "Nodira Toshmatova", team: "EduTech Innovators", projectName: "EduLearn Platform", stage: "Viloyat finali", result: "2-o'rin g'olibi", issuedAt: "2024-09-30", status: "sent" },
  { id: "cert_003", certificateNumber: "QSL-2024-003", participant: "Malika Yusupova", team: "HealthCare AI", projectName: "HealthAI Diagnostic", stage: "Viloyat finali", result: "3-o'rin g'olibi", issuedAt: "2024-09-30", status: "downloaded" },
  { id: "cert_004", certificateNumber: "QSL-2024-004", participant: "Sardor Ismoilov", team: "Fintech Pro", projectName: "MicroCredit App", stage: "Viloyat finali", result: "Maxsus nominatsiya", issuedAt: "2024-09-30", status: "generated" },
  { id: "cert_005", certificateNumber: "QSL-2024-005", participant: "Jasur Rahmonov", team: "Smart City Solutions", projectName: "Smart City Dashboard", stage: "Viloyat finali", result: "Finalchi", issuedAt: "2024-09-30", status: "sent" },
  { id: "cert_006", certificateNumber: "QSL-2024-006", participant: "Umid Sharipov", team: "Logistics Hub", projectName: "Logistics Optimizer", stage: "Viloyat finali", result: "Finalchi", issuedAt: "2024-09-30", status: "downloaded" },
  { id: "cert_007", certificateNumber: "QSL-2024-007", participant: "Zarina Abdullayeva", team: "Tourism Boost", projectName: "Tourism Navigator", stage: "OTM saralashi", result: "OTM g'olibi", issuedAt: "2024-08-20", status: "sent" },
  { id: "cert_008", certificateNumber: "QSL-2024-008", participant: "Gulnoza Xasanova", team: "E-Government", projectName: "E-Gov Services", stage: "Viloyat finali", result: "Finalchi", issuedAt: "2024-09-30", status: "generated" },
];

const statusConfig = {
  generated: { label: "Yaratilgan", color: "bg-blue-500/20 text-blue-400" },
  sent: { label: "Yuborilgan", color: "bg-green-500/20 text-green-400" },
  downloaded: { label: "Yuklab olingan", color: "bg-cyan-500/20 text-cyan-400" },
  cancelled: { label: "Bekor qilingan", color: "bg-red-500/20 text-red-400" },
};

export function CertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [filteredCertificates, setFilteredCertificates] = useState<Certificate[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  useEffect(() => {
    const saved = getFromStorage<Certificate[]>(STORAGE_KEYS.CERTIFICATES, []);
    if (saved.length === 0) {
      saveToStorage(STORAGE_KEYS.CERTIFICATES, initialCertificates);
      setCertificates(initialCertificates);
    } else {
      setCertificates(saved);
    }
  }, []);

  useEffect(() => {
    let filtered = certificates;
    if (searchQuery) {
      filtered = filtered.filter(
        (c) =>
          c.participant.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.certificateNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    if (statusFilter !== "all") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }
    setFilteredCertificates(filtered);
  }, [certificates, searchQuery, statusFilter]);

  const stats = [
    { label: "Jami sertifikatlar", value: certificates.length, icon: Award, color: "text-blue-400" },
    { label: "Yaratilgan", value: certificates.filter((c) => c.status === "generated").length, icon: FileCheck, color: "text-cyan-400" },
    { label: "Yuborilgan", value: certificates.filter((c) => c.status === "sent").length, icon: Send, color: "text-green-400" },
    { label: "Yuklab olingan", value: certificates.filter((c) => c.status === "downloaded").length, icon: Download, color: "text-purple-400" },
  ];

  return (
    <AdminShell>
      <AdminPageHeader
        title="Sertifikatlar"
        subtitle="Ishtirokchilar sertifikatlarini boshqarish"
        actions={
          <>
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors text-sm">
              <Download size={16} />
              <span>Ommaviy yuklab olish</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium">
              <Plus size={16} />
              <span>Ommaviy yaratish</span>
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
              placeholder="Raqam, ishtirokchi yoki loyiha bo'yicha qidirish..."
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
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Raqam</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Ishtirokchi</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Jamoa</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Loyiha</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Bosqich</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Natija</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Sana</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Holat</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredCertificates.map((cert) => {
                const statusCfg = statusConfig[cert.status];
                return (
                  <tr key={cert.id} className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-bg)] transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-mono text-sm font-semibold text-white">{cert.certificateNumber}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-white">{cert.participant}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-[var(--admin-text-secondary)]">{cert.team || "—"}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-[var(--admin-text-secondary)]">{cert.projectName}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-[var(--admin-text-secondary)]">{cert.stage}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm font-medium text-white">{cert.result}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-[var(--admin-text-secondary)]">{formatDate(cert.issuedAt)}</div>
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
                        <button className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors" title="PDF yuklab olish">
                          <Download size={16} />
                        </button>
                        <button className="p-2 hover:bg-green-500/10 text-green-400 rounded-lg transition-colors" title="Email yuborish">
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

        {filteredCertificates.length === 0 && (
          <div className="py-12 text-center text-[var(--admin-text-muted)]">
            <Award size={48} className="mx-auto mb-4 opacity-50" />
            <p>Sertifikatlar topilmadi</p>
          </div>
        )}
      </div>
    </AdminShell>
  );
}
