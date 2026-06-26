import { AdminShell } from "../components/layout/AdminShell";
import { AdminPageHeader } from "../components/ui/AdminPageHeader";
import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  RotateCcw,
  Link as LinkIcon,
  FileUp,
  Video,
  GitBranch,
  ExternalLink,
} from "lucide-react";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? "/api";

interface UserApplication {
  id: string;
  userId: string;
  userName: string;
  applicationNumber?: string;
  projectName: string;
  direction: string;
  goal: string;
  problem: string;
  presentationUrl?: string;
  videoUrl?: string;
  demoUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  status: "submitted" | "under_review" | "needs_correction" | "accepted" | "rejected" | "next_stage";
  adminComment?: string;
  participationType?: "otm" | "independent" | "team";
  institution?: string;
  region?: string;
  district?: string;
  phone?: string;
  email?: string;
  faculty?: string;
  educationDirection?: string;
  course?: number;
  createdAt: string;
  updatedAt: string;
}

const statusConfig = {
  submitted: { label: "Qabul qilish bosqichida", color: "bg-blue-500/20 text-blue-400" },
  under_review: { label: "Ko'rib chiqilmoqda", color: "bg-cyan-500/20 text-cyan-400" },
  needs_correction: { label: "Tuzatish kerak", color: "bg-amber-500/20 text-amber-400" },
  accepted: { label: "Admin loyihani qabul qildi", color: "bg-green-500/20 text-green-400" },
  rejected: { label: "Rad etildi", color: "bg-red-500/20 text-red-400" },
  next_stage: { label: "Keyingi bosqichga o'tdi", color: "bg-purple-500/20 text-purple-400" },
};

export function ApplicationsPage() {
  const [applications, setApplications] = useState<UserApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<UserApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [directionFilter, setDirectionFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<UserApplication | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [previewResource, setPreviewResource] = useState<ResourcePreview | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: "danger" | "warning" | "info";
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  // Arizalarni yuklash
  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/user-applications`);
      
      if (!response.ok) {
        throw new Error("Arizalar yuklanmadi");
      }

      const data = await response.json();
      setApplications(data.data || []);
    } catch (error) {
      console.error("Arizalar yuklanishda xatolik:", error);
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filterlash
  useEffect(() => {
    let filtered = applications;

    if (searchQuery) {
      filtered = filtered.filter(
        (app) =>
          app.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.direction.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (app.institution ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (app.district ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (app.applicationNumber ?? "").toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((app) => app.status === statusFilter);
    }

    if (directionFilter !== "all") {
      filtered = filtered.filter((app) => app.direction === directionFilter);
    }
    if (sourceFilter !== "all") {
      filtered = filtered.filter((app) => sourceFilter === "otm" ? app.participationType === "otm" : app.participationType !== "otm");
    }

    setFilteredApplications(filtered);
  }, [applications, searchQuery, statusFilter, directionFilter, sourceFilter]);

  // Holat o'zgartirish
  const handleStatusChange = async (app: UserApplication, newStatus: UserApplication["status"], comment?: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/user-applications/${app.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          status: newStatus,
          adminComment: comment || ""
        }),
      });

      if (!response.ok) {
        throw new Error("Holat o'zgartirilmadi");
      }

      const data = await response.json();
      setApplications((prev) => prev.map((a) => (a.id === app.id ? data.data : a)));
    } catch (error) {
      console.error("Holat o'zgartirishda xatolik:", error);
      alert("Holat o'zgartirilmadi");
    }
  };

  const handleReview = (app: UserApplication) => {
    setConfirmDialog({
      isOpen: true,
      title: "Arizani ko'rib chiqish",
      message: `"${app.projectName}" arizasini ko'rib chiqish holatiga o'tkazasizmi?`,
      onConfirm: () => {
        handleStatusChange(app, "under_review");
      },
      variant: "info",
    });
  };

  const handleAccept = (app: UserApplication) => {
    setConfirmDialog({
      isOpen: true,
      title: "Arizani qabul qilish",
      message: `"${app.projectName}" arizasini qabul qilasizmi?`,
      onConfirm: () => {
        handleStatusChange(app, "accepted", "Admin loyihani qabul qildi.");
      },
      variant: "info",
    });
  };

  const handleNextStage = (app: UserApplication) => {
    setConfirmDialog({
      isOpen: true,
      title: "Keyingi bosqichga o'tkazish",
      message: `"${app.projectName}" arizasini keyingi bosqichga o'tkazasizmi? Loyiha hakamlar paneliga materiallari bilan yuboriladi.`,
      onConfirm: () => {
        handleStatusChange(app, "next_stage", "Loyiha keyingi bosqichga o'tkazildi.");
      },
      variant: "info",
    });
  };

  const handleReject = (app: UserApplication) => {
    const reason = prompt("Rad etish sababini kiriting:");
    if (reason) {
      setConfirmDialog({
        isOpen: true,
        title: "Arizani rad etish",
        message: `"${app.projectName}" arizasini rad etasizmi? Bu amalni qaytarib bo'lmaydi.`,
        onConfirm: () => {
          handleStatusChange(app, "rejected", reason);
        },
        variant: "danger",
      });
    }
  };

  // Tuzatishga qaytarish
  const handleNeedsCorrection = (app: UserApplication) => {
    const comment = prompt("Tuzatish kerak bo'lgan joylarni kiriting:");
    if (comment) {
      setConfirmDialog({
        isOpen: true,
        title: "Tuzatishga qaytarish",
        message: `"${app.projectName}" arizasini tuzatishga qaytarasizmi?`,
        onConfirm: () => {
          handleStatusChange(app, "needs_correction", comment);
        },
        variant: "warning",
      });
    }
  };

  // Batafsil ko'rish
  const handleViewDetails = (app: UserApplication) => {
    setSelectedApp(app);
    setIsDetailModalOpen(true);
  };

  const directions = Array.from(new Set(applications.map((a) => a.direction)));

  const stats = [
    {
      label: "Jami arizalar",
      value: applications.length,
      icon: FileText,
      color: "text-blue-400",
    },
    {
      label: "Qabul qilish bosqichida",
      value: applications.filter((a) => a.status === "submitted").length,
      icon: Clock,
      color: "text-blue-400",
    },
    {
      label: "Ko'rib chiqilmoqda",
      value: applications.filter((a) => a.status === "under_review").length,
      icon: Eye,
      color: "text-cyan-400",
    },
    {
      label: "Qabul qilindi",
      value: applications.filter((a) => a.status === "accepted" || a.status === "next_stage").length,
      icon: CheckCircle,
      color: "text-green-400",
    },
  ];

  return (
    <AdminShell>
      <AdminPageHeader
        title="Arizalar"
        subtitle="Foydalanuvchilar tomonidan topshirilgan arizalar"
        actions={
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors text-sm">
            <Download size={16} />
            <span>Eksport</span>
          </button>
        }
      />

      {/* Statistics Cards */}
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

      {/* Search and Filter */}
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" size={18} />
            <input
              type="text"
              placeholder="Loyiha, foydalanuvchi yoki yo'nalish bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <select
            value={directionFilter}
            onChange={(e) => setDirectionFilter(e.target.value)}
            className="px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="all">Barcha yo'nalishlar</option>
            {directions.map((dir) => (
              <option key={dir} value={dir}>
                {dir}
              </option>
            ))}
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="all">Barcha manbalar</option>
            <option value="otm">OTM talabalari</option>
            <option value="region">Hudud ishtirokchilari</option>
          </select>
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

      {/* Applications Table */}
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--admin-bg)] border-b border-[var(--admin-border)]">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Foydalanuvchi</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Loyiha</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Yo'nalish</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">OTM/Hudud</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Fayllar</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Holat</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Sana</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[var(--admin-text-muted)]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : filteredApplications.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[var(--admin-text-muted)]">
                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Arizalar topilmadi</p>
                  </td>
                </tr>
              ) : (
                filteredApplications.map((app) => {
                  const statusCfg = statusConfig[app.status];
                  return (
                    <tr key={app.id} className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-bg)] transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-medium text-white">{app.userName}</div>
                        <div className="text-xs text-[var(--admin-text-muted)] mt-1">{app.applicationNumber ?? `ID: ${app.userId.slice(0, 8)}...`}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-white">{app.projectName}</div>
                        <div className="text-xs text-[var(--admin-text-muted)] mt-1 line-clamp-1">{app.goal}</div>
                      </td>
                      <td className="py-4 px-6 text-[var(--admin-text-secondary)]">{app.direction}</td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-white">{app.participationType === "otm" ? app.institution : app.district}</div>
                        <div className="text-xs text-[var(--admin-text-muted)] mt-1">{app.participationType === "otm" ? "OTM" : "Hudud"}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1">
                          {app.presentationUrl && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs">
                              <FileUp size={10} />
                            </span>
                          )}
                          {app.videoUrl && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/10 text-red-400 rounded text-xs">
                              <Video size={10} />
                            </span>
                          )}
                          {app.demoUrl && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-500/10 text-purple-400 rounded text-xs">
                              <FileUp size={10} />
                            </span>
                          )}
                          {app.githubUrl && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-500/10 text-gray-400 rounded text-xs">
                              <GitBranch size={10} />
                            </span>
                          )}
                          {app.websiteUrl && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs">
                              <LinkIcon size={10} />
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}>
                          {statusCfg.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-[var(--admin-text-secondary)] text-sm">
                        {new Date(app.createdAt).toLocaleDateString("uz-UZ")}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            onClick={() => handleViewDetails(app)}
                            className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors" 
                            title="Batafsil"
                          >
                            <Eye size={16} />
                          </button>
                          {app.status === "submitted" && (
                            <button
                              onClick={() => handleReview(app)}
                              className="p-2 hover:bg-cyan-500/10 text-cyan-400 rounded-lg transition-colors"
                              title="Ko'rib chiqish"
                            >
                              <Search size={16} />
                            </button>
                          )}
                          {!["accepted", "next_stage", "rejected"].includes(app.status) && (
                            <>
                              <button
                                onClick={() => handleAccept(app)}
                                className="p-2 hover:bg-green-500/10 text-green-400 rounded-lg transition-colors"
                                title="Qabul qilish"
                              >
                                <CheckCircle size={16} />
                              </button>
                              {app.status === "under_review" && (
                                <button
                                  onClick={() => handleNeedsCorrection(app)}
                                  className="p-2 hover:bg-amber-500/10 text-amber-400 rounded-lg transition-colors"
                                  title="Tuzatish kerak"
                                >
                                  <RotateCcw size={16} />
                                </button>
                              )}
                              <button
                                onClick={() => handleReject(app)}
                                className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                                title="Rad etish"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          {app.status === "accepted" && (
                            <button
                              onClick={() => handleNextStage(app)}
                              className="p-2 hover:bg-purple-500/10 text-purple-400 rounded-lg transition-colors"
                              title="Keyingi bosqichga o'tkazish"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[var(--admin-surface)] border-b border-[var(--admin-border)] px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Ariza tafsilotlari</h2>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="p-2 hover:bg-[var(--admin-bg)] rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Asosiy ma'lumotlar</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">Ariza raqami</label>
                      <p className="text-white">{selectedApp.applicationNumber ?? "Raqam berilmagan"}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">Foydalanuvchi</label>
                      <p className="text-white">{selectedApp.userName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">Telefon / email</label>
                      <p className="text-white">{selectedApp.phone || "—"} {selectedApp.email ? `· ${selectedApp.email}` : ""}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">Manba</label>
                      <p className="text-white">
                        {selectedApp.participationType === "otm"
                          ? `${selectedApp.institution || "OTM ko'rsatilmagan"}${selectedApp.faculty ? ` · ${selectedApp.faculty}` : ""}${selectedApp.course ? ` · ${selectedApp.course}-kurs` : ""}`
                          : `${selectedApp.district || "Hudud ko'rsatilmagan"}`}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">Loyiha nomi</label>
                      <p className="text-white">{selectedApp.projectName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">Yo'nalish</label>
                      <p className="text-white">{selectedApp.direction}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-1">Holat</label>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusConfig[selectedApp.status].color}`}>
                        {statusConfig[selectedApp.status].label}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Fayllar va havolalar</h3>
                  <div className="space-y-2">
                    <ResourceRow href={selectedApp.presentationUrl} label="Taqdimot materiali" icon={FileUp} onPreview={setPreviewResource} />
                    <ResourceRow href={selectedApp.videoUrl} label="Video material" icon={Video} onPreview={setPreviewResource} />
                    <ResourceRow href={selectedApp.demoUrl} label="Demo versiyasi" icon={FileUp} onPreview={setPreviewResource} />
                    <ResourceRow href={selectedApp.githubUrl} label="GitHub" icon={GitBranch} onPreview={setPreviewResource} />
                    <ResourceRow href={selectedApp.websiteUrl} label="Yaratilgan sayt" icon={LinkIcon} onPreview={setPreviewResource} />
                    {!selectedApp.presentationUrl && !selectedApp.videoUrl && !selectedApp.demoUrl && !selectedApp.githubUrl && !selectedApp.websiteUrl && (
                      <p className="text-sm text-[var(--admin-text-muted)]">Fayl yoki havola biriktirilmagan</p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Loyiha maqsadi</label>
                <p className="text-white bg-[var(--admin-bg)] p-4 rounded-lg whitespace-pre-wrap break-words leading-6">{selectedApp.goal}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Hal qilinadigan muammo / mazmun-mohiyati</label>
                <p className="text-white bg-[var(--admin-bg)] p-4 rounded-lg whitespace-pre-wrap break-words leading-6">{selectedApp.problem}</p>
              </div>

              {selectedApp.adminComment && (
                <div>
                  <label className="block text-sm font-medium text-[var(--admin-text-secondary)] mb-2">Admin izohi</label>
                  <p className="text-amber-300 bg-[var(--admin-bg)] p-4 rounded-lg whitespace-pre-wrap break-words leading-6">{selectedApp.adminComment}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        message={confirmDialog.message}
        variant={confirmDialog.variant}
      />
      <ResourcePreviewModal resource={previewResource} onClose={() => setPreviewResource(null)} />
    </AdminShell>
  );
}

type ResourcePreview = {
  label: string;
  href: string;
  kind: "video" | "document" | "archive" | "link";
};

type PreviewData =
  | { type: "pptx"; fileName: string; slides: Array<{ number: number; text: string }> }
  | { type: "zip"; fileName: string; entries: Array<{ name: string; size: number }> }
  | { type: "unsupported"; fileName: string };

function ResourceRow({ href, label, icon: Icon, onPreview }: { href?: string | null; label: string; icon: typeof LinkIcon; onPreview: (resource: ResourcePreview) => void }) {
  if (!href) return null;
  const isUploadedFile = href.startsWith("/uploads/");
  const openHref = normalizeHref(href);

  return (
    <div className="rounded-lg border border-[var(--admin-border)] bg-[var(--admin-bg)] p-3">
      <div className="flex items-start gap-2">
        <Icon size={16} className="text-blue-400 mt-0.5" />
        <div className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-white">{label}</span>
          <span className="block text-xs text-[var(--admin-text-muted)] break-all">{getFileName(href)}</span>
          {isUploadedFile && (
            <div className="mt-2">
              <a href={openHref} download className="text-xs font-semibold text-green-300 hover:text-green-200">
                Yuklab olish
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ResourcePreviewModal({ resource, onClose }: { resource: ResourcePreview | null; onClose: () => void }) {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [previewError, setPreviewError] = useState("");

  useEffect(() => {
    if (!resource || !resource.href.startsWith("/uploads/") || resource.kind === "video") {
      setPreviewData(null);
      setPreviewError("");
      return;
    }

    let ignore = false;
    setPreviewData(null);
    setPreviewError("");

    fetch(`${API_BASE_URL}/file-preview?path=${encodeURIComponent(resource.href)}`)
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(payload?.error?.message || "Faylni o'qib bo'lmadi");
        if (!ignore) setPreviewData(payload.data);
      })
      .catch((error) => {
        if (!ignore) setPreviewError(error instanceof Error ? error.message : "Faylni o'qib bo'lmadi");
      });

    return () => {
      ignore = true;
    };
  }, [resource]);

  if (!resource) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--admin-border)] px-6 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-white">{resource.label}</h2>
            <p className="mt-1 truncate text-sm text-[var(--admin-text-muted)]">{getFileName(resource.href)}</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-2 text-[var(--admin-text-muted)] hover:bg-[var(--admin-bg)] hover:text-white">
            ✕
          </button>
        </div>

        <div className="p-6">
          <div className="min-h-[58vh] overflow-hidden rounded-xl border border-[var(--admin-border)] bg-[var(--admin-bg)]">
            {resource.kind === "video" ? (
              <video src={resource.href} controls className="h-full min-h-[58vh] w-full bg-black" />
            ) : resource.href.startsWith("/uploads/") ? (
              <UploadedPreview data={previewData} error={previewError} kind={resource.kind} />
            ) : (
              <div className="flex h-[58vh] flex-col">
                <div className="border-b border-[var(--admin-border)] px-4 py-3 text-sm text-[var(--admin-text-secondary)]">
                  Agar sayt xavfsizlik sababli ichkarida ochilmasa, "Alohida ochish" tugmasidan foydalaning.
                </div>
                <iframe src={resource.href} title={resource.label} className="min-h-0 flex-1 w-full bg-white" />
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <a href={resource.href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-[var(--admin-bg)] px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
              <ExternalLink size={16} /> Alohida ochish
            </a>
            {resource.href.startsWith("/uploads/") && (
              <a href={resource.href} download className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                <Download size={16} /> Yuklab olish
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function UploadedPreview({ data, error, kind }: { data: PreviewData | null; error: string; kind: ResourcePreview["kind"] }) {
  if (error) {
    return (
      <div className="flex min-h-[58vh] flex-col items-center justify-center p-6 text-center">
        <FileUp className="mb-4 text-red-300" size={42} />
        <p className="text-base font-semibold text-white">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[58vh] items-center justify-center text-sm text-[var(--admin-text-secondary)]">
        Fayl o'qilmoqda...
      </div>
    );
  }

  if (data.type === "pptx") {
    return (
      <div className="max-h-[58vh] overflow-y-auto p-5 space-y-4">
        {data.slides.length === 0 ? (
          <p className="text-sm text-[var(--admin-text-secondary)]">Slaydlarda o'qiladigan matn topilmadi.</p>
        ) : data.slides.map((slide) => (
          <div key={slide.number} className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-blue-300">Slayd {slide.number}</div>
            <p className="whitespace-pre-wrap text-sm leading-6 text-white">{slide.text}</p>
          </div>
        ))}
      </div>
    );
  }

  if (data.type === "zip") {
    return (
      <div className="max-h-[58vh] overflow-y-auto p-5">
        <div className="mb-4 rounded-xl border border-purple-500/20 bg-purple-500/10 p-4 text-sm text-purple-100">
          Demo arxiv ichidagi fayllar ro'yxati.
        </div>
        <div className="space-y-2">
          {data.entries.map((entry) => (
            <div key={entry.name} className="flex items-center justify-between gap-3 rounded-lg border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3">
              <span className="min-w-0 break-all text-sm text-white">{entry.name}</span>
              <span className="shrink-0 text-xs text-[var(--admin-text-muted)]">{formatBytes(entry.size)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[58vh] flex-col items-center justify-center p-6 text-center">
      <FileUp className="mb-4 text-purple-300" size={42} />
      <p className="text-base font-semibold text-white">
        {kind === "archive" ? "RAR arxivni brauzer ichida o'qib bo'lmaydi." : "Bu fayl turi uchun ichki ko'rish mavjud emas."}
      </p>
      <p className="mt-2 max-w-md text-sm text-[var(--admin-text-secondary)]">Faylni yuklab oling yoki alohida oynada oching.</p>
    </div>
  );
}

function getResourceKind(href: string): ResourcePreview["kind"] {
  const clean = href.split("?")[0].toLowerCase();
  if (/\.(mp4|webm|ogg|mov)$/i.test(clean)) return "video";
  if (/\.(zip|rar|7z)$/i.test(clean)) return "archive";
  if (href.startsWith("http://") || href.startsWith("https://")) return "link";
  return "document";
}

function normalizeHref(href: string) {
  if (href.startsWith("/uploads/") || href.startsWith("http://") || href.startsWith("https://")) {
    return href;
  }
  return `https://${href.replace(/^\/+/, "")}`;
}

function getFileName(href: string) {
  try {
    return decodeURIComponent(href.split("/").pop()?.split("?")[0] || href);
  } catch {
    return href;
  }
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}
