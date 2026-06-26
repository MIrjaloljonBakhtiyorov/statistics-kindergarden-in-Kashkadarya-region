import { AdminShell } from "../components/layout/AdminShell";
import { AdminPageHeader } from "../components/ui/AdminPageHeader";
import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Archive,
  Trophy,
  CheckCircle,
  Clock,
  Play,
  X,
  Trash2,
} from "lucide-react";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? "/api";

interface Competition {
  id: string;
  name: string;
  year: number;
  description: string;
  applicationDeadline: string;
  currentStage: string;
  applicationsCount: number;
  responsible: string;
  status:
    | "draft"
    | "pending_approval"
    | "announced"
    | "applications_open"
    | "sorting"
    | "final"
    | "completed"
    | "cancelled"
    | "archived";
  createdAt: string;
  updatedAt: string;
}

const statusConfig = {
  draft: { label: "Qoralama", color: "bg-gray-500/20 text-gray-400" },
  pending_approval: { label: "Tasdiqlash kutilmoqda", color: "bg-amber-500/20 text-amber-400" },
  announced: { label: "E'lon qilingan", color: "bg-blue-500/20 text-blue-400" },
  applications_open: { label: "Ariza qabuli ochiq", color: "bg-green-500/20 text-green-400" },
  sorting: { label: "Saralash", color: "bg-cyan-500/20 text-cyan-400" },
  final: { label: "Final", color: "bg-purple-500/20 text-purple-400" },
  completed: { label: "Yakunlangan", color: "bg-green-600/20 text-green-500" },
  cancelled: { label: "Bekor qilingan", color: "bg-red-500/20 text-red-400" },
  archived: { label: "Arxivlangan", color: "bg-gray-600/20 text-gray-500" },
};

export function CompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [filteredCompetitions, setFilteredCompetitions] = useState<Competition[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    name: "",
    applicationStartDate: "",
    applicationEndDate: "",
    resultsAnnouncementDate: "",
    firstPlacePrize: "",
    secondPlacePrize: "",
    thirdPlacePrize: "",
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: "danger" | "warning" | "info";
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  // Tanlovlarni yuklash
  useEffect(() => {
    loadCompetitions();
  }, []);

  const loadCompetitions = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/admin/competitions`);
      
      if (!response.ok) {
        throw new Error("Tanlovlar yuklanmadi");
      }

      const data = await response.json();
      setCompetitions(data.data || []);
    } catch (error) {
      console.error("Tanlovlar yuklanishda xatolik:", error);
      setCompetitions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Filterlash
  useEffect(() => {
    let filtered = competitions;

    if (searchQuery) {
      filtered = filtered.filter(
        (comp) =>
          comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          comp.responsible.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((comp) => comp.status === statusFilter);
    }

    setFilteredCompetitions(filtered);
  }, [competitions, searchQuery, statusFilter]);

  // Yangi tanlov yaratish yoki tahrirlash
  const handleCreateCompetition = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = "Tadbir nomini kiriting";
    if (!form.applicationStartDate) errors.applicationStartDate = "Boshlanish sanasini tanlang";
    if (!form.applicationEndDate) errors.applicationEndDate = "Tugash sanasini tanlang";
    if (!form.resultsAnnouncementDate) errors.resultsAnnouncementDate = "Natijalar e'lon qilish sanasini tanlang";
    if (!form.firstPlacePrize.trim()) errors.firstPlacePrize = "1-o'rin mukofotini kiriting";
    if (!form.secondPlacePrize.trim()) errors.secondPlacePrize = "2-o'rin mukofotini kiriting";
    if (!form.thirdPlacePrize.trim()) errors.thirdPlacePrize = "3-o'rin mukofotini kiriting";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsSubmitting(true);

    try {
      const url = editingId 
        ? `${API_BASE_URL}/admin/competitions/${editingId}`
        : `${API_BASE_URL}/admin/competitions`;
      
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Tanlov saqlanmadi");
      }

      const data = await response.json();
      
      if (editingId) {
        setCompetitions((prev) => prev.map(c => c.id === editingId ? data.data : c));
      } else {
        setCompetitions((prev) => [data.data, ...prev]);
      }
      
      setIsModalOpen(false);
      setEditingId(null);
      setForm({
        name: "",
        applicationStartDate: "",
        applicationEndDate: "",
        resultsAnnouncementDate: "",
        firstPlacePrize: "",
        secondPlacePrize: "",
        thirdPlacePrize: "",
      });
      setFormErrors({});
    } catch (error) {
      console.error("Tanlov saqlashda xatolik:", error);
      alert(error instanceof Error ? error.message : "Tanlov saqlanmadi");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tahrirlash uchun ochish
  const handleEdit = (comp: Competition) => {
    setEditingId(comp.id);
    // Description dan mukofotlarni ajratib olish
    const prizeMatch = comp.description.match(/Mukofotlar: 1-o'rin - (.+?), 2-o'rin - (.+?), 3-o'rin - (.+?)$/);
    const dateMatch = comp.description.match(/Tadbir: (.+?) - (.+?)\. Natijalar: (.+?)\./);
    
    setForm({
      name: comp.name,
      applicationStartDate: dateMatch ? new Date(dateMatch[1]).toISOString().split('T')[0] : "",
      applicationEndDate: new Date(comp.applicationDeadline).toISOString().split('T')[0],
      resultsAnnouncementDate: dateMatch ? new Date(dateMatch[3]).toISOString().split('T')[0] : "",
      firstPlacePrize: prizeMatch?.[1] || "",
      secondPlacePrize: prizeMatch?.[2] || "",
      thirdPlacePrize: prizeMatch?.[3] || "",
    });
    setIsModalOpen(true);
  };

  // O'chirish
  const handleDelete = (comp: Competition) => {
    setConfirmDialog({
      isOpen: true,
      title: "Tanlovni o'chirish",
      message: `"${comp.name}" tanlovini butunlay o'chirib tashlaysizmi? Bu amalni qaytarib bo'lmaydi!`,
      onConfirm: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/admin/competitions/${comp.id}`, {
            method: "DELETE",
          });

          if (!response.ok) {
            throw new Error("Tanlov o'chirilmadi");
          }

          setCompetitions((prev) => prev.filter((c) => c.id !== comp.id));
        } catch (error) {
          console.error("Tanlov o'chirishda xatolik:", error);
          alert("Tanlov o'chirilmadi");
        }
      },
      variant: "danger",
    });
  };

  // Holat o'zgartirish
  const handleStatusChange = async (comp: Competition, newStatus: Competition["status"]) => {
    setConfirmDialog({
      isOpen: true,
      title: "Holatni o'zgartirish",
      message: `"${comp.name}" tanlovining holatini "${statusConfig[newStatus].label}" ga o'zgartirmoqchimisiz?`,
      onConfirm: async () => {
        try {
          const response = await fetch(`${API_BASE_URL}/admin/competitions/${comp.id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: newStatus }),
          });

          if (!response.ok) {
            throw new Error("Holat o'zgartirilmadi");
          }

          const data = await response.json();
          setCompetitions((prev) => prev.map((c) => (c.id === comp.id ? data.data : c)));
        } catch (error) {
          console.error("Holat o'zgartirishda xatolik:", error);
          alert("Holat o'zgartirilmadi");
        }
      },
      variant: "info",
    });
  };

  const stats = [
    {
      label: "Jami tanlovlar",
      value: competitions.length,
      icon: Trophy,
      color: "text-blue-400",
    },
    {
      label: "Faol tanlovlar",
      value: competitions.filter((c) => c.status === "applications_open" || c.status === "sorting" || c.status === "final").length,
      icon: CheckCircle,
      color: "text-green-400",
    },
    {
      label: "Tasdiqlash kutilmoqda",
      value: competitions.filter((c) => c.status === "pending_approval").length,
      icon: Clock,
      color: "text-amber-400",
    },
    {
      label: "Yakunlangan",
      value: competitions.filter((c) => c.status === "completed").length,
      icon: Archive,
      color: "text-gray-400",
    },
  ];

  return (
    <AdminShell>
      <AdminPageHeader
        title="Tanlovlar"
        subtitle="Tanlovlarni boshqarish va monitoring"
        actions={
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium"
          >
            <Plus size={16} />
            <span>Yangi tanlov</span>
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
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" size={18} />
            <input
              type="text"
              placeholder="Tanlov nomi yoki mas'ul bo'yicha qidirish..."
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

      {/* Competitions Table */}
      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--admin-bg)] border-b border-[var(--admin-border)]">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Tanlov nomi</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Yili</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Arizalar</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Mas'ul</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Holat</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[var(--admin-text-muted)]">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    Yuklanmoqda...
                  </td>
                </tr>
              ) : filteredCompetitions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[var(--admin-text-muted)]">
                    <Trophy size={48} className="mx-auto mb-4 opacity-50" />
                    <p>Tanlovlar topilmadi</p>
                  </td>
                </tr>
              ) : (
                filteredCompetitions.map((comp) => {
                  const config = statusConfig[comp.status];
                  return (
                    <tr key={comp.id} className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-bg)] transition-colors">
                      <td className="py-4 px-6">
                        <div className="font-medium text-white">{comp.name}</div>
                        <div className="text-xs text-[var(--admin-text-muted)] mt-1">{comp.currentStage}</div>
                      </td>
                      <td className="py-4 px-6 text-[var(--admin-text-secondary)]">{comp.year}</td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-white">{comp.applicationsCount}</span>
                      </td>
                      <td className="py-4 px-6 text-[var(--admin-text-secondary)]">{comp.responsible}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}>
                          {config.label}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-1">
                          <button 
                            className="p-2 hover:bg-[var(--admin-surface-2)] rounded-lg transition-colors text-[var(--admin-text-secondary)] hover:text-white" 
                            title="Ko'rish"
                          >
                            <Eye size={16} />
                          </button>
                          <button 
                            onClick={() => handleEdit(comp)}
                            className="p-2 hover:bg-blue-500/10 text-blue-400 rounded-lg transition-colors" 
                            title="Tahrirlash"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(comp)}
                            className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                            title="O'chirish"
                          >
                            <Trash2 size={16} />
                          </button>
                          {comp.status === "draft" && (
                            <button
                              onClick={() => handleStatusChange(comp, "applications_open")}
                              className="p-2 hover:bg-green-500/10 text-green-400 rounded-lg transition-colors ml-1"
                              title="Ochish"
                            >
                              <Play size={16} />
                            </button>
                          )}
                          {(comp.status === "applications_open" || comp.status === "sorting") && (
                            <button
                              onClick={() => handleStatusChange(comp, "completed")}
                              className="p-2 hover:bg-purple-500/10 text-purple-400 rounded-lg transition-colors ml-1"
                              title="Yakunlash"
                            >
                              <CheckCircle size={16} />
                            </button>
                          )}
                          {comp.status === "completed" && (
                            <button
                              onClick={() => handleStatusChange(comp, "archived")}
                              className="p-2 hover:bg-gray-500/10 text-gray-400 rounded-lg transition-colors ml-1"
                              title="Arxivlash"
                            >
                              <Archive size={16} />
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

      {/* Create Competition Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-[var(--admin-surface)] border-b border-[var(--admin-border)] px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                {editingId ? "Tanlovni tahrirlash" : "Yangi tanlov yaratish"}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingId(null);
                  setFormErrors({});
                }}
                className="p-2 hover:bg-[var(--admin-bg)] rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCompetition} className="p-6 space-y-5">
              {/* Tadbir nomi */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Tadbir nomi <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Masalan: Qashqadaryo Startup Ligasi 2024"
                />
                {formErrors.name && <p className="mt-1 text-xs text-red-400">{formErrors.name}</p>}
              </div>

              {/* Arizalarni qabul qilish davri */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Qabul boshlanishi <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.applicationStartDate}
                    onChange={(e) => setForm({ ...form, applicationStartDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  {formErrors.applicationStartDate && <p className="mt-1 text-xs text-red-400">{formErrors.applicationStartDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-white mb-2">
                    Qabul tugashi <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.applicationEndDate}
                    onChange={(e) => setForm({ ...form, applicationEndDate: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  {formErrors.applicationEndDate && <p className="mt-1 text-xs text-red-400">{formErrors.applicationEndDate}</p>}
                </div>
              </div>

              {/* Natijalarni e'lon qilish */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Natijalarni e'lon qilish <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={form.resultsAnnouncementDate}
                  onChange={(e) => setForm({ ...form, resultsAnnouncementDate: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
                {formErrors.resultsAnnouncementDate && <p className="mt-1 text-xs text-red-400">{formErrors.resultsAnnouncementDate}</p>}
              </div>

              {/* Mukofotlar */}
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Mukofotlar <span className="text-red-400">*</span>
                </label>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">1-o'rin</label>
                    <input
                      type="text"
                      value={form.firstPlacePrize}
                      onChange={(e) => setForm({ ...form, firstPlacePrize: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Masalan: 50 000 000 so'm"
                    />
                    {formErrors.firstPlacePrize && <p className="mt-1 text-xs text-red-400">{formErrors.firstPlacePrize}</p>}
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">2-o'rin</label>
                    <input
                      type="text"
                      value={form.secondPlacePrize}
                      onChange={(e) => setForm({ ...form, secondPlacePrize: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Masalan: 30 000 000 so'm"
                    />
                    {formErrors.secondPlacePrize && <p className="mt-1 text-xs text-red-400">{formErrors.secondPlacePrize}</p>}
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--admin-text-secondary)] mb-1">3-o'rin</label>
                    <input
                      type="text"
                      value={form.thirdPlacePrize}
                      onChange={(e) => setForm({ ...form, thirdPlacePrize: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Masalan: 20 000 000 so'm"
                    />
                    {formErrors.thirdPlacePrize && <p className="mt-1 text-xs text-red-400">{formErrors.thirdPlacePrize}</p>}
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--admin-border)]">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingId(null);
                    setFormErrors({});
                  }}
                  className="px-5 py-2.5 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white hover:bg-[var(--admin-surface-2)] transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed rounded-lg text-white font-medium transition-colors"
                >
                  {isSubmitting ? (editingId ? "Saqlanmoqda..." : "Yaratilmoqda...") : (editingId ? "Saqlash" : "Tanlov yaratish")}
                </button>
              </div>
            </form>
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
    </AdminShell>
  );
}
