import { AdminShell } from "../components/layout/AdminShell";
import { AdminPageHeader } from "../components/ui/AdminPageHeader";
import { useState, useEffect } from "react";
import { Search, Eye, Building2, CheckCircle, Download, FileUp, Video, Link as LinkIcon, GitBranch } from "lucide-react";

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? "/api";

interface Institution {
  id: string;
  name: string;
  shortName: string;
  applicationsCount: number;
  acceptedCount: number;
  lastApplicationAt?: string | null;
  status: "active";
}

interface InstitutionApplication {
  id: string;
  applicationNumber?: string;
  userName: string;
  projectName: string;
  direction: string;
  goal: string;
  problem: string;
  presentationUrl?: string;
  videoUrl?: string;
  demoUrl?: string;
  presentationExists?: boolean;
  videoExists?: boolean;
  demoExists?: boolean;
  githubUrl?: string;
  websiteUrl?: string;
  status: "submitted" | "under_review" | "needs_correction" | "accepted" | "rejected" | "next_stage";
  createdAt: string;
  phone?: string;
  email?: string;
  faculty?: string;
  educationDirection?: string;
  course?: number;
  adminComment?: string;
  updatedAt?: string;
}

const applicationStatusConfig = {
  submitted: { label: "Qabul qilish bosqichida", color: "bg-blue-500/20 text-blue-400" },
  under_review: { label: "Ko'rib chiqilmoqda", color: "bg-cyan-500/20 text-cyan-400" },
  needs_correction: { label: "Tuzatish kerak", color: "bg-amber-500/20 text-amber-400" },
  accepted: { label: "Admin loyihani qabul qildi", color: "bg-green-500/20 text-green-400" },
  rejected: { label: "Rad etildi", color: "bg-red-500/20 text-red-400" },
  next_stage: { label: "Keyingi bosqichga o'tdi", color: "bg-purple-500/20 text-purple-400" },
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("uz-UZ");
};

const ApplicationLink = ({ href, label, icon: Icon, exists = true }: { href?: string; label: string; icon: typeof LinkIcon; exists?: boolean }) => {
  if (!href) return null;
  const canDownload = href.startsWith("/uploads/") || href.startsWith("http://") || href.startsWith("https://");
  return (
    <div className="inline-flex items-center gap-2 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-3 py-2 text-xs text-[var(--admin-text-secondary)]">
      <Icon size={14} />
      {label}
      {canDownload && exists ? (
        <a href={normalizeHref(href)} download={href.startsWith("/uploads/") || undefined} target="_blank" rel="noreferrer" className="font-semibold text-green-300 hover:text-green-200">
          Yuklab olish
        </a>
      ) : (
        <span className="font-semibold text-red-300">Fayl serverda topilmadi</span>
      )}
    </div>
  );
};

export function InstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [filteredInstitutions, setFilteredInstitutions] = useState<Institution[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [institutionApplications, setInstitutionApplications] = useState<InstitutionApplication[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<InstitutionApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplicationsLoading, setIsApplicationsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setLoadError("");
        const response = await fetch(`${API_BASE_URL}/admin/institutions-summary`);
        const json = await response.json();
        if (!response.ok) throw new Error(json?.error?.message ?? "OTMlar yuklanmadi");
        setInstitutions(json.data ?? []);
      } catch (error) {
        console.error("OTMlar yuklanishda xatolik:", error);
        setInstitutions([]);
        setLoadError("OTMlar ma'lumotini backenddan yuklab bo'lmadi.");
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    let filtered = institutions;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (i) => i.name.toLowerCase().includes(query) || i.shortName.toLowerCase().includes(query)
      );
    }
    setFilteredInstitutions(filtered);
  }, [institutions, searchQuery]);

  const handleViewApplications = async (inst: Institution) => {
    setSelectedInstitution(inst);
    setIsApplicationsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/admin/user-applications?groupType=institution&groupValue=${encodeURIComponent(inst.name)}`);
      const json = await response.json();
      if (!response.ok) throw new Error(json?.error?.message ?? "Arizalar yuklanmadi");
      setInstitutionApplications(json.data ?? []);
    } catch (error) {
      console.error("OTM arizalari yuklanishda xatolik:", error);
      setInstitutionApplications([]);
    } finally {
      setIsApplicationsLoading(false);
    }
  };

  const stats = [
    { label: "Jami OTMlar", value: institutions.length, icon: Building2, color: "text-blue-400" },
    { label: "Arizali OTMlar", value: institutions.filter((i) => i.applicationsCount > 0).length, icon: CheckCircle, color: "text-green-400" },
    { label: "Jami arizalar", value: institutions.reduce((s, i) => s + i.applicationsCount, 0), icon: Building2, color: "text-purple-400" },
    { label: "Qabul qilingan", value: institutions.reduce((s, i) => s + i.acceptedCount, 0), icon: CheckCircle, color: "text-cyan-400" },
  ];

  return (
    <AdminShell>
      <AdminPageHeader
        title="OTMlar"
        subtitle="OTM talabalari yuborgan arizalar real vaqt rejimida saralanadi"
        actions={
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors text-sm">
            <Download size={16} /><span>Eksport</span>
          </button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4"><stat.icon className={stat.color} size={24} /></div>
            <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-[var(--admin-text-secondary)]">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" size={18} />
          <input
            type="text"
            placeholder="OTM nomi bo'yicha qidirish..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {loadError && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {loadError}
        </div>
      )}

      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--admin-bg)] border-b border-[var(--admin-border)]">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">OTM</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Qisqartma</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Jami arizalar</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Qabul qilingan</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Oxirgi ariza</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredInstitutions.map((inst) => (
                <tr key={inst.id} className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-bg)] transition-colors">
                  <td className="py-4 px-6"><div className="font-medium text-white">{inst.name}</div></td>
                  <td className="py-4 px-6"><span className="font-mono text-sm font-semibold text-blue-400">{inst.shortName}</span></td>
                  <td className="py-4 px-6"><span className="font-semibold text-white">{inst.applicationsCount}</span></td>
                  <td className="py-4 px-6"><span className="font-semibold text-green-300">{inst.acceptedCount}</span></td>
                  <td className="py-4 px-6 text-sm text-[var(--admin-text-secondary)]">{formatDate(inst.lastApplicationAt)}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end">
                      <button onClick={() => handleViewApplications(inst)} className="p-2 hover:bg-[var(--admin-surface-2)] rounded-lg transition-colors" title="Arizalarni ko'rish"><Eye size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {isLoading ? (
          <div className="py-12 text-center text-[var(--admin-text-muted)]">OTMlar yuklanmoqda...</div>
        ) : filteredInstitutions.length === 0 && (
          <div className="py-12 text-center text-[var(--admin-text-muted)]"><Building2 size={48} className="mx-auto mb-4 opacity-50" /><p>OTMlar bo'yicha real ariza hali yo'q</p></div>
        )}
      </div>

      {selectedInstitution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-2xl max-w-5xl w-full max-h-[88vh] overflow-y-auto">
            <div className="sticky top-0 bg-[var(--admin-surface)] border-b border-[var(--admin-border)] px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{selectedInstitution.name}</h2>
                <p className="text-sm text-[var(--admin-text-secondary)]">{institutionApplications.length} ta ariza</p>
              </div>
              <button onClick={() => setSelectedInstitution(null)} className="p-2 hover:bg-[var(--admin-bg)] rounded-lg">✕</button>
            </div>
            <div className="p-6 space-y-4">
              {isApplicationsLoading ? (
                <p className="text-center text-[var(--admin-text-muted)] py-8">Arizalar yuklanmoqda...</p>
              ) : institutionApplications.length === 0 ? (
                <p className="text-center text-[var(--admin-text-muted)] py-8">Bu OTM bo'yicha ariza topilmadi</p>
              ) : institutionApplications.map((app) => {
                const status = applicationStatusConfig[app.status] ?? applicationStatusConfig.submitted;
                return (
                  <div key={app.id} className="bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-xl p-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="font-semibold text-white">{app.projectName}</p>
                        <p className="mt-1 text-sm text-[var(--admin-text-secondary)]">{app.userName} · {app.direction}</p>
                        <p className="mt-1 text-xs text-[var(--admin-text-muted)]">
                          {app.applicationNumber ?? app.id} · {formatDate(app.createdAt)}
                        </p>
                      </div>
                      <span className={`w-fit rounded-full px-2.5 py-1 text-xs font-medium ${status.color}`}>{status.label}</span>
                    </div>
                    <div className="mt-4 grid gap-4 lg:grid-cols-2">
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">Maqsad</p>
                        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--admin-text-secondary)]">{app.goal || "-"}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-[var(--admin-text-muted)]">Muammo</p>
                        <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[var(--admin-text-secondary)]">{app.problem || "-"}</p>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-2 text-sm text-[var(--admin-text-secondary)] sm:grid-cols-2 lg:grid-cols-4">
                      <span>Telefon: {app.phone || "-"}</span>
                      <span>Email: {app.email || "-"}</span>
                      <span>Fakultet: {app.faculty || "-"}</span>
                      <span>Kurs: {app.course || "-"}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <ApplicationLink href={app.presentationUrl} label="Taqdimot" icon={FileUp} exists={app.presentationExists} />
                      <ApplicationLink href={app.videoUrl} label="Video" icon={Video} exists={app.videoExists} />
                      <ApplicationLink href={app.demoUrl} label="Demo" icon={FileUp} exists={app.demoExists} />
                      <ApplicationLink href={app.githubUrl} label="GitHub" icon={GitBranch} />
                      <ApplicationLink href={app.websiteUrl} label="Sayt" icon={LinkIcon} />
                    </div>
                    <div className="mt-4 flex justify-end">
                      <button
                        onClick={() => setSelectedApplication(app)}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        <Eye size={16} />
                        To'liq ko'rish
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {selectedApplication && (
        <ApplicationDetailModal
          app={selectedApplication}
          onClose={() => setSelectedApplication(null)}
        />
      )}
    </AdminShell>
  );
}

function ApplicationDetailModal({ app, onClose }: { app: InstitutionApplication; onClose: () => void }) {
  const status = applicationStatusConfig[app.status] ?? applicationStatusConfig.submitted;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60">
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[var(--admin-surface)] border-b border-[var(--admin-border)] px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{app.projectName}</h2>
            <p className="text-sm text-[var(--admin-text-secondary)]">{app.applicationNumber ?? app.id}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[var(--admin-bg)] rounded-lg">✕</button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Info label="Foydalanuvchi" value={app.userName} />
            <Info label="Yo'nalish" value={app.direction} />
            <Info label="Holat" value={status.label} />
            <Info label="Yaratilgan sana" value={formatDate(app.createdAt)} />
            <Info label="Telefon" value={app.phone} />
            <Info label="Email" value={app.email} />
            <Info label="Fakultet" value={app.faculty} />
            <Info label="Ta'lim yo'nalishi" value={app.educationDirection} />
            <Info label="Kurs" value={app.course ? `${app.course}-kurs` : undefined} />
            <Info label="Yangilangan sana" value={formatDate(app.updatedAt)} />
          </div>

          <TextBlock label="Loyiha maqsadi" value={app.goal} />
          <TextBlock label="Hal qilinadigan muammo / mazmun-mohiyati" value={app.problem} />
          {app.adminComment && <TextBlock label="Admin izohi" value={app.adminComment} />}

          <div>
            <h3 className="mb-3 text-lg font-semibold text-white">Fayllar va havolalar</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <ResourceCard href={app.presentationUrl} label="Taqdimot materiali" icon={FileUp} exists={app.presentationExists} />
              <ResourceCard href={app.videoUrl} label="Video material" icon={Video} exists={app.videoExists} />
              <ResourceCard href={app.demoUrl} label="Demo versiyasi" icon={FileUp} exists={app.demoExists} />
              <ResourceCard href={app.githubUrl} label="GitHub" icon={GitBranch} />
              <ResourceCard href={app.websiteUrl} label="Yaratilgan sayt" icon={LinkIcon} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] p-4">
      <p className="text-xs font-semibold text-[var(--admin-text-muted)] mb-1">{label}</p>
      <p className="text-sm text-white break-words">{value || "-"}</p>
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold text-[var(--admin-text-secondary)]">{label}</p>
      <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] p-4 text-sm leading-6 text-white whitespace-pre-wrap break-words">
        {value || "-"}
      </div>
    </div>
  );
}

function ResourceCard({ href, label, icon: Icon, exists = true }: { href?: string | null; label: string; icon: typeof LinkIcon; exists?: boolean }) {
  if (!href) {
    return (
      <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] p-4">
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="mt-1 text-xs text-[var(--admin-text-muted)]">Yuklanmagan</p>
      </div>
    );
  }
  const downloadable = href.startsWith("/uploads/") || href.startsWith("http://") || href.startsWith("https://");
  return (
    <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)] p-4">
      <div className="flex items-start gap-3">
        <Icon size={18} className="mt-0.5 text-blue-300" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="mt-1 break-all text-xs text-[var(--admin-text-muted)]">{getFileName(href)}</p>
          {downloadable && exists ? (
            <a href={normalizeHref(href)} download={href.startsWith("/uploads/") || undefined} target="_blank" rel="noreferrer" className="mt-3 inline-flex text-xs font-semibold text-green-300 hover:text-green-200">
              Yuklab olish
            </a>
          ) : !exists ? (
            <p className="mt-3 text-xs text-red-300">Fayl serverda topilmadi. Uni qayta yuklash kerak.</p>
          ) : (
            <p className="mt-3 text-xs text-amber-300">Fayl yo'li mavjud, lekin yuklab olish manzili noto'g'ri.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function normalizeHref(href: string) {
  if (href.startsWith("/uploads/") || href.startsWith("http://") || href.startsWith("https://")) return href;
  return `https://${href.replace(/^\/+/, "")}`;
}

function getFileName(href: string) {
  try {
    return decodeURIComponent(href.split("/").pop()?.split("?")[0] || href);
  } catch {
    return href;
  }
}
