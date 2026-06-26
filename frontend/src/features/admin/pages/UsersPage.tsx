import { AdminShell } from "../components/layout/AdminShell";
import { AdminPageHeader } from "../components/ui/AdminPageHeader";
import { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Eye,
  Edit,
  Shield,
  Ban,
  CheckCircle,
  XCircle,
  Users as UsersIcon,
  Clock,
  Mail,
  Phone,
  Download,
} from "lucide-react";
import { getFromStorage, saveToStorage, STORAGE_KEYS, addAuditLog, generateId, formatDate } from "../utils/localStorage";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string | null;
  role: "participant" | "coordinator" | "judge" | "admin";
  participationType?: "university" | "independent" | "team";
  institution?: string;
  region?: string;
  status: "active" | "unverified" | "temp_blocked" | "blocked";
  registeredAt: string;
  lastLogin?: string;
}

const initialUsers: User[] = [
  {
    id: "user_001",
    firstName: "Alisher",
    lastName: "Karimov",
    phone: "+998901234567",
    email: "alisher.k@example.com",
    role: "participant",
    institution: "Qarshi DU",
    status: "active",
    registeredAt: "2024-03-15",
    lastLogin: "2024-06-20",
  },
  {
    id: "user_002",
    firstName: "Nodira",
    lastName: "Toshmatova",
    phone: "+998907654321",
    email: "nodira.t@example.com",
    role: "participant",
    institution: "Qashqadaryo viloyat IIB",
    status: "active",
    registeredAt: "2024-03-18",
    lastLogin: "2024-06-21",
  },
  {
    id: "user_003",
    firstName: "Jasur",
    lastName: "Rahmonov",
    phone: "+998909876543",
    email: "jasur.r@example.com",
    role: "coordinator",
    institution: "Qarshi DU",
    status: "active",
    registeredAt: "2024-02-10",
    lastLogin: "2024-06-22",
  },
  {
    id: "user_004",
    firstName: "Malika",
    lastName: "Yusupova",
    phone: "+998903456789",
    email: "malika.y@example.com",
    role: "judge",
    institution: "Toshkent Politexnika Instituti",
    status: "active",
    registeredAt: "2024-03-20",
    lastLogin: "2024-06-19",
  },
  {
    id: "user_005",
    firstName: "Sardor",
    lastName: "Ismoilov",
    phone: "+998905432198",
    email: "sardor.i@example.com",
    role: "participant",
    region: "Qarshi shahar",
    status: "unverified",
    registeredAt: "2024-06-22",
  },
  {
    id: "user_006",
    firstName: "Dilshod",
    lastName: "Xolmatov",
    phone: "+998902345678",
    email: "dilshod.x@example.com",
    role: "participant",
    institution: "Qarshi IB",
    status: "temp_blocked",
    registeredAt: "2024-04-05",
    lastLogin: "2024-05-15",
  },
  {
    id: "user_007",
    firstName: "Zarina",
    lastName: "Abdullayeva",
    phone: "+998908765432",
    email: "zarina.a@example.com",
    role: "participant",
    institution: "TDIU Qarshi filiali",
    status: "active",
    registeredAt: "2024-03-25",
    lastLogin: "2024-06-21",
  },
  {
    id: "user_008",
    firstName: "Bekzod",
    lastName: "Nurmatov",
    phone: "+998904567890",
    email: "bekzod.n@example.com",
    role: "coordinator",
    region: "Shahrisabz shahar",
    status: "active",
    registeredAt: "2024-02-20",
    lastLogin: "2024-06-22",
  },
  {
    id: "user_009",
    firstName: "Feruza",
    lastName: "Qodirov",
    phone: "+998906789012",
    email: "feruza.q@example.com",
    role: "participant",
    institution: "Qarshi DU",
    status: "active",
    registeredAt: "2024-04-10",
    lastLogin: "2024-06-20",
  },
  {
    id: "user_010",
    firstName: "Umid",
    lastName: "Sharipov",
    phone: "+998901112233",
    email: "umid.s@example.com",
    role: "judge",
    institution: "O'zbekiston Milliy Universiteti",
    status: "active",
    registeredAt: "2024-03-01",
    lastLogin: "2024-06-21",
  },
  {
    id: "user_011",
    firstName: "Gulnoza",
    lastName: "Xasanova",
    phone: "+998903334455",
    email: "gulnoza.x@example.com",
    role: "participant",
    region: "Koson tumani",
    status: "active",
    registeredAt: "2024-04-15",
    lastLogin: "2024-06-18",
  },
  {
    id: "user_012",
    firstName: "Ravshan",
    lastName: "Mirzayev",
    phone: "+998905556677",
    email: "ravshan.m@example.com",
    role: "participant",
    institution: "Qarshi IB",
    status: "blocked",
    registeredAt: "2024-03-12",
    lastLogin: "2024-05-10",
  },
];

const statusConfig = {
  active: { label: "Faol", color: "bg-green-500/20 text-green-400" },
  unverified: { label: "Tasdiqlanmagan", color: "bg-amber-500/20 text-amber-400" },
  temp_blocked: { label: "Vaqtinchalik bloklangan", color: "bg-red-500/20 text-red-400" },
  blocked: { label: "Bloklangan", color: "bg-red-600/20 text-red-500" },
};

const roleConfig = {
  participant: { label: "Ishtirokchi", color: "text-blue-400" },
  coordinator: { label: "Koordinator", color: "text-purple-400" },
  judge: { label: "Hakam", color: "text-amber-400" },
  admin: { label: "Administrator", color: "text-red-400" },
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "/api";

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    variant?: "danger" | "warning" | "info";
  }>({ isOpen: false, title: "", message: "", onConfirm: () => {} });

  useEffect(() => {
    let isMounted = true;

    async function loadUsers() {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/users`);
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error?.message ?? "Foydalanuvchilar yuklanmadi");
        }

        if (isMounted) {
          setUsers(payload.data);
          saveToStorage(STORAGE_KEYS.USERS, payload.data);
          setLoadError("");
        }
      } catch (error) {
        const saved = getFromStorage<User[]>(STORAGE_KEYS.USERS, []);
        if (isMounted) {
          setUsers(saved.length === 0 ? initialUsers : saved);
          setLoadError(error instanceof Error ? error.message : "Foydalanuvchilar yuklanmadi");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadUsers();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchQuery) {
      filtered = filtered.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.email ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (user.phone ?? "").includes(searchQuery)
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchQuery, roleFilter, statusFilter]);

  const updateUser = async (id: string, updates: Partial<User>) => {
    if (updates.status) {
      try {
        const response = await fetch(`${API_BASE_URL}/admin/users/${id}/status`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: updates.status })
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error?.message ?? "Foydalanuvchi holati yangilanmadi");
        }

        const updated = users.map((user) => (user.id === id ? payload.data : user));
        setUsers(updated);
        saveToStorage(STORAGE_KEYS.USERS, updated);
        setLoadError("");
        return;
      } catch (error) {
        setLoadError(error instanceof Error ? error.message : "Foydalanuvchi holati yangilanmadi");
      }
    }

    const updated = users.map((user) => (user.id === id ? { ...user, ...updates } : user));
    setUsers(updated);
    saveToStorage(STORAGE_KEYS.USERS, updated);
  };

  const handleBlock = (user: User, isTemp: boolean) => {
    setConfirmDialog({
      isOpen: true,
      title: isTemp ? "Vaqtinchalik bloklash" : "Doimiy bloklash",
      message: `${user.firstName} ${user.lastName} foydalanuvchisini ${isTemp ? "vaqtinchalik" : "doimiy"} bloklashni xohlaysizmi?`,
      onConfirm: () => {
        void updateUser(user.id, { status: isTemp ? "temp_blocked" : "blocked" });
        addAuditLog({
          user: "mister_italiano",
          action: isTemp ? "temp_block" : "block",
          module: "users",
          objectType: "user",
          objectId: user.id,
          status: "success",
          severity: "high",
        });
      },
      variant: "danger",
    });
  };

  const handleUnblock = (user: User) => {
    setConfirmDialog({
      isOpen: true,
      title: "Qayta faollashtirish",
      message: `${user.firstName} ${user.lastName} foydalanuvchisini qayta faollashtirishni xohlaysizmi?`,
      onConfirm: () => {
        void updateUser(user.id, { status: "active" });
        addAuditLog({
          user: "mister_italiano",
          action: "unblock",
          module: "users",
          objectType: "user",
          objectId: user.id,
          status: "success",
          severity: "medium",
        });
      },
      variant: "info",
    });
  };

  const stats = [
    {
      label: "Jami foydalanuvchilar",
      value: users.length,
      icon: UsersIcon,
      color: "text-blue-400",
    },
    {
      label: "Faol",
      value: users.filter((u) => u.status === "active").length,
      icon: CheckCircle,
      color: "text-green-400",
    },
    {
      label: "Tasdiqlanmagan",
      value: users.filter((u) => u.status === "unverified").length,
      icon: Clock,
      color: "text-amber-400",
    },
    {
      label: "Bloklangan",
      value: users.filter((u) => u.status === "blocked" || u.status === "temp_blocked").length,
      icon: XCircle,
      color: "text-red-400",
    },
  ];

  return (
    <AdminShell>
      <AdminPageHeader
        title="Foydalanuvchilar"
        subtitle="Platformadagi barcha foydalanuvchilarni boshqarish"
        actions={
          <>
            <button className="flex items-center gap-2 px-4 py-2 bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-lg hover:bg-[var(--admin-surface-2)] transition-colors text-sm">
              <Download size={16} />
              <span>Eksport</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-medium">
              <Plus size={16} />
              <span>Yangi foydalanuvchi</span>
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
        {loadError && (
          <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            {loadError}. Lokal saqlangan ma'lumotlar ko'rsatilmoqda.
          </div>
        )}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--admin-text-muted)]" size={18} />
            <input
              type="text"
              placeholder="Ism yoki email bo'yicha qidirish..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white placeholder:text-[var(--admin-text-muted)] focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 bg-[var(--admin-bg)] border border-[var(--admin-border)] rounded-lg text-white focus:outline-none focus:border-blue-500 transition-colors"
          >
            <option value="all">Barcha rollar</option>
            {Object.entries(roleConfig).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
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

      <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--admin-bg)] border-b border-[var(--admin-border)]">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">F.I.Sh.</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Aloqa</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Rol</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">OTM/Hudud</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Holat</th>
                <th className="text-left py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Ro'yxatdan o'tgan</th>
                <th className="text-right py-4 px-6 text-sm font-medium text-[var(--admin-text-secondary)]">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const statusCfg = statusConfig[user.status];
                const roleCfg = roleConfig[user.role];
                return (
                  <tr key={user.id} className="border-b border-[var(--admin-border)] hover:bg-[var(--admin-bg)] transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-white">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-[var(--admin-text-muted)] mt-1">{user.id}</div>
                    </td>
                    <td className="py-4 px-6">
                      {user.phone && (
                        <div className="flex items-center gap-1.5 text-sm text-[var(--admin-text-secondary)] mb-1">
                          <Phone size={12} />
                          {user.phone}
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-sm text-[var(--admin-text-secondary)]">
                        <Mail size={12} />
                        {user.email || "-"}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-medium ${roleCfg.color}`}>{roleCfg.label}</span>
                    </td>
                    <td className="py-4 px-6 text-[var(--admin-text-secondary)]">{user.institution || user.region || "-"}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}>
                        {statusCfg.label}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-[var(--admin-text-secondary)]">{formatDate(user.registeredAt)}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-[var(--admin-surface-2)] rounded-lg transition-colors" title="Ko'rish">
                          <Eye size={16} />
                        </button>
                        <button className="p-2 hover:bg-[var(--admin-surface-2)] rounded-lg transition-colors" title="Tahrirlash">
                          <Edit size={16} />
                        </button>
                        {user.status === "active" || user.status === "unverified" ? (
                          <button
                            onClick={() => handleBlock(user, true)}
                            className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                            title="Bloklash"
                          >
                            <Ban size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnblock(user)}
                            className="p-2 hover:bg-green-500/10 text-green-400 rounded-lg transition-colors"
                            title="Qayta faollashtirish"
                          >
                            <CheckCircle size={16} />
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

        {filteredUsers.length === 0 && (
          <div className="py-12 text-center text-[var(--admin-text-muted)]">
            <UsersIcon size={48} className="mx-auto mb-4 opacity-50" />
            <p>{isLoading ? "Foydalanuvchilar yuklanmoqda..." : "Foydalanuvchilar topilmadi"}</p>
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
