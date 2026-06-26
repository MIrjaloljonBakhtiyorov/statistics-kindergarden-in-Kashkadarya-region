import { AdminShell } from "../components/layout/AdminShell";
import { AdminPageHeader } from "../components/ui/AdminPageHeader";
import { useState, useEffect } from "react";
import { Plus, Search, Edit, Compass, CheckCircle, XCircle, Download, GripVertical } from "lucide-react";
import { getFromStorage, saveToStorage, STORAGE_KEYS, addAuditLog } from "../utils/localStorage";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";

interface Direction {
  id: string;
  name: string;
  description: string;
  order: number;
  applicationsCount: number;
  judgesCount: number;
  status: "active" | "inactive";
}

const initialDirections: Direction[] = [
  { id: "dir_001", name: "IT va sun'iy intellekt", description: "Dasturlash, AI, ML, IoT va boshqa IT texnologiyalari", order: 1, applicationsCount: 45, judgesCount: 8, status: "active" },
  { id: "dir_002", name: "Agrotexnologiyalar", description: "Qishloq xo'jaligi va suv tejamkor yechimlar", order: 2, applicationsCount: 32, judgesCount: 6, status: "active" },
  { id: "dir_003", name: "Ta'lim texnologiyalari", description: "Zamonaviy ta'lim va o'qitish usullari", order: 3, applicationsCount: 28, judgesCount: 5, status: "active" },
  { id: "dir_004", name: "Tibbiyot va ijtimoiy xizmatlar", description: "Sog'liqni saqlash va ijtimoiy xizmatlar", order: 4, applicationsCount: 24, judgesCount: 7, status: "active" },
  { id: "dir_005", name: "Moliyaviy texnologiyalar", description: "Fintech, to'lov tizimlari, blockchain", order: 5, applicationsCount: 38, judgesCount: 6, status: "active" },
  { id: "dir_006", name: "Davlat xizmatlari", description: "Elektron davlat va hudud boshqaruvi", order: 6, applicationsCount: 19, judgesCount: 4, status: "active" },
  { id: "dir_007", name: "Yashil texnologiyalar", description: "Ekologiya va qayta ishlash texnologiyalari", order: 7, applicationsCount: 22, judgesCount: 5, status: "active" },
  { id: "dir_008", name: "Turizm va xizmatlar", description: "Turizm, mehmonxona va xizmat ko'rsatish", order: 8, applicationsCount: 15, judgesCount: 3, status: "active" },
  { id: "dir_009", name: "Sanoat va logistika", description: "Ishlab chiqarish va yuk tashish", order: 9, applicationsCount: 18, judgesCount: 4, status: "active" },
  { id: "dir_010", name: "Boshqa innovatsiyalar", description: "Qolgan barcha innovatsion yo'nalishlar", order: 10, applicationsCount: 12, judgesCount: 2, status: "active" },
];

const statusConfig = {
  active: { label: "Faol", color: "bg-green-500/20 text-green-400" },
  inactive: { label: "Nofaol", color: "bg-gray-500/20 text-gray-400" },
};

export function DirectionsPage() {
  const [directions, setDirections] = useState<Direction[]>([]);
  const [filteredDirections, setFilteredDirections] = useState<Direction[]>([]);
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
    const saved = getFromStorage<Direction[]>(STORAGE_KEYS.DIRECTIONS, []);
    if (saved.length === 0) {
      saveToStorage(STORAGE_KEYS.DIRECTIONS, initialDirections);
      setDirections(initialDirections);
    } else {
      setDirections(saved);
    }
  }, []);

  useEffect(() => {
    let filtered = directions.sort((a, b) => a.order - b.order);
    if (searchQuery) {
      filtered = filtered.filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.description.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    if (statusFilter !== "all") filtered = filtered.filter((d) => d.status === statusFilter);
    setFilteredDirections(filtered);
  }, [directions, searchQuery, statusFilter]);

  const updateDirection = (id: string, updates: Partial<Direction>) => {
    const updated = directions.map((d) => (d.id === id ? { ...d, ...updates } : d));
    setDirections(updated);
    saveToStorage(STORAGE_KEYS.DIRECTIONS, updated);
  };

  const handleToggleStatus = (direction: Direction) => {
    const newStatus = direction.status === "active" ? "inactive" : "active";
    if (direction.status === "active" && direction.applicationsCount > 0) {
      setConfirmDialog({
        isOpen: true,
        title: "Yo'nalishni nofaol qilish",
        message: `"${direction.name}" yo'nalishida ${direction.applicationsCount} ta ariza mavjud. Nofaol qilishni xohlaysizmi?`,
        onConfirm: () => {
          updateDirection(direction.id, { status: newStatus });
          addAuditLog({
            user: "mister_italiano",
            action: "toggle_direction_status",
            module: "directions",
            objectType: "direction",
            objectId: direction.id,
            oldValue: direction.status,
            newValue: newStatus,
            status: "success",
            severity: "medium",
          });
        },
        variant: "warning",
      });
    } else {
      updateDirection(direction.id, { status: newStatus });
      addAuditLog({
        user: "mister_italiano",
        action: "toggle_direction_status",
        module: "directions",
        objectType: "direction",
        objectId: direction.id,
        oldValue: direction.status,
        newValue: newStatus,
        status: "success",
        severity: "low",
      });
    }
  };

  const stats = [
    { label: "Jami yo'nalishlar", value: directions.length, icon: Compass, color: "text-blue-400" },
    { label: "Faol", value: directions.filter((d) => d.status === "active").length, icon: CheckCircle, color: "text-green-400" },
    { label: "Jami arizalar", value: directions.reduce((sum, d) => sum + d.applicationsCount, 0), icon: Compass, color: "text-cyan-400" },
    { label: "Jami hakamlar", value: directions.reduce((sum, d) => sum + d.judgesCount, 0), icon: Compass, color: "text-purple-400" },
  ];

  return (
    <AdminShell>
      <AdminPageHeader
        title="Yo'nalishlar"
        subtitle="Tanlov yo'nalishlarini boshqarish"
        actions={
          <>
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors text-sm">
              <Download size={16} />
              <span>Eksport</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium">
              <Plus size={16} />
              <span>Yo'nalish qo'shish</span>
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
              placeholder="Yo'nalish bo'yicha qidirish..."
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
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)] w-12"></th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">№</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Yo'nalish</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Tavsif</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Arizalar</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Hakamlar</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Holat</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredDirections.map((direction) => {
                const statusCfg = statusConfig[direction.status];
                return (
                  <tr key={direction.id} className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-bg)] transition-colors">
                    <td className="py-4 px-6">
                      <button className="text-[var(--admin-text-muted)] hover:text-white transition-colors cursor-move" title="Tartibni o'zgartirish">
                        <GripVertical size={16} />
                      </button>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-white">{direction.order}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-white">{direction.name}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-[var(--admin-text-secondary)] max-w-md">{direction.description}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-white">{direction.applicationsCount}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-white">{direction.judgesCount}</span>
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
                        <button
                          onClick={() => handleToggleStatus(direction)}
                          className={`p-2 rounded-lg transition-colors ${
                            direction.status === "active"
                              ? "hover:bg-red-500/10 text-red-400"
                              : "hover:bg-green-500/10 text-green-400"
                          }`}
                          title={direction.status === "active" ? "Nofaol qilish" : "Faollashtirish"}
                        >
                          {direction.status === "active" ? <XCircle size={16} /> : <CheckCircle size={16} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredDirections.length === 0 && (
          <div className="py-12 text-center text-[var(--admin-text-muted)]">
            <Compass size={48} className="mx-auto mb-4 opacity-50" />
            <p>Yo'nalishlar topilmadi</p>
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
