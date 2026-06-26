import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  BadgeCheck,
  Users,
  Files,
  Award,
  Gavel,
  Route,
  Activity,
  Bell,
  Settings,
  Trophy,
  ChevronRight,
  Calendar,
} from "lucide-react";
import { useUnreadNotifications } from "../../hooks/useUnreadNotifications";

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? "/api";

const navItems = [
  { id: "overview",      label: "Bosh sahifa",           segment: "overview",      icon: LayoutDashboard },
  { id: "personal",      label: "Shaxsiy ma'lumotlar",   segment: "personal",      icon: User },
  { id: "participation", label: "Ishtirok ma'lumotlari", segment: "participation", icon: BadgeCheck },
  { id: "teams",         label: "Jamoalarim",            segment: "teams",         icon: Users },
  { id: "applications",  label: "Arizalarim",            segment: "applications",  icon: Files },
  { id: "certificates",  label: "Sertifikatlar",         segment: "certificates",  icon: Award },
  { id: "appeals",       label: "Apellyatsiyalar",        segment: "appeals",       icon: Gavel },
  { id: "roadmap",       label: "Yo'l xaritasi",         segment: "roadmap",       icon: Route },
  { id: "monitoring",    label: "Monitoring",            segment: "monitoring",    icon: Activity },
  { id: "notifications", label: "Bildirishnomalar",      segment: "notifications", icon: Bell },
  { id: "settings",      label: "Sozlamalar",            segment: "settings",      icon: Settings },
];

const roleLabels: Record<string, string> = {
  solo_participant:       "Yakka ishtirokchi",
  team_leader:            "Jamoa rahbari",
  team_member:            "Jamoa a'zosi",
  mentor:                 "Mentor",
  advisor:                "Maslahatchi",
  otm_participant:        "OTM ishtirokchisi",
  independent_participant:"Mustaqil ishtirokchi",
  initiative_member:      "Tashabbuskor",
  participant:            "Ishtirokchi",
};

interface StoredUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  profileCompletion?: number;
}

interface ProfileSidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function ProfileSidebar({ mobileOpen, onMobileClose }: ProfileSidebarProps) {
  const { pathname } = useLocation();
  const { userId } = useParams();

  // Read from localStorage as base
  const storedUser = JSON.parse(localStorage.getItem("profileUser") ?? "null") as StoredUser | null;
  const profileId = userId ?? storedUser?.id;

  // Live profile state loaded from API
  const [profile, setProfile] = useState<{
    firstName: string;
    lastName: string;
    role: string;
    profileCompletion: number;
  }>({
    firstName: storedUser?.firstName ?? "",
    lastName:  storedUser?.lastName  ?? "",
    role: "participant",
    profileCompletion: storedUser?.profileCompletion ?? 0,
  });

  useEffect(() => {
    if (!profileId) return;
    let mounted = true;

    fetch(`${API_BASE_URL}/users/${profileId}/profile`)
      .then((r) => r.ok ? r.json() : null)
      .then((json) => {
        if (!json || !mounted) return;
        const d = json.data;
        setProfile({
          firstName: d.firstName ?? "",
          lastName:  d.lastName  ?? "",
          role: d.role ?? "participant",
          profileCompletion: d.profileCompletion ?? 0,
        });
        // Sync localStorage so Topbar also benefits
        const current = JSON.parse(localStorage.getItem("profileUser") ?? "{}") as Record<string, unknown>;
        localStorage.setItem("profileUser", JSON.stringify({
          ...current,
          firstName: d.firstName,
          lastName:  d.lastName,
          email:     d.email,
          profileCompletion: d.profileCompletion ?? 0,
        }));
      })
      .catch(() => {/* keep defaults */});

    return () => { mounted = false; };
  }, [profileId]);

  const profileBasePath = `/profile/${profileId ?? ""}`.replace(/\/$/, "");
  const profilePath = (segment: string) => `${profileBasePath}/${segment}`;
  const unreadCount = useUnreadNotifications(profileId);
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + "/");

  const initials = `${profile.firstName[0] ?? "?"}${profile.lastName[0] ?? ""}`.toUpperCase();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-[70px] flex items-center gap-3 px-5 border-b border-[var(--p-border)] flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Trophy size={18} className="text-white" />
        </div>
        <div>
          <p className="text-xs font-bold text-white leading-none">Qashqadaryo</p>
          <p className="text-[11px] text-[var(--p-muted)] leading-none mt-0.5">Startup Ligasi</p>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-[var(--p-border)] flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {profile.lastName} {profile.firstName}
            </p>
            <span className="inline-block mt-0.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/20">
              {roleLabels[profile.role] ?? "Ishtirokchi"}
            </span>
          </div>
        </div>

        {/* Profile completion */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] text-[var(--p-muted)]">Profil to'ldirilganligi</span>
            <span className="text-[11px] font-bold text-white">{profile.profileCompletion}%</span>
          </div>
          <div className="h-1.5 bg-[var(--p-bg)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${profile.profileCompletion}%` }}
            />
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-3" aria-label="Kabinet menyusi">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const path = profilePath(item.segment);
            const active = isActive(path);
            const Icon = item.icon;
            const isBell = item.id === "notifications";

            return (
              <li key={item.id}>
                <Link
                  to={path}
                  onClick={onMobileClose}
                  aria-current={active ? "page" : undefined}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium
                    ${active
                      ? "bg-blue-500/15 text-blue-400 border border-blue-500/25 shadow-[0_0_16px_rgba(47,125,246,0.15)]"
                      : "text-[var(--p-text2)] hover:bg-[var(--p-surface)] hover:text-white"}
                  `}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  <span className="flex-1 truncate">{item.label}</span>
                  {isBell && unreadCount > 0 && (
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Active competition card */}
      <div className="p-3 border-t border-[var(--p-border)] flex-shrink-0">
        <div className="rounded-xl bg-[var(--p-surface)] border border-[var(--p-border)] p-3">
          <div className="flex items-center gap-2 mb-2">
            <Trophy size={14} className="text-[var(--p-gold)]" />
            <span className="text-xs font-bold text-white truncate">QSL 2026</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--p-muted)] mb-2">
            <Calendar size={11} />
            <span>Ariza: 1 iyul — 30 avg</span>
          </div>
          <div className="flex items-center gap-1.5 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            <span className="text-[11px] text-green-400 font-medium">Ariza qabuli ochiq</span>
          </div>
          <Link
            to={profilePath("applications")}
            onClick={onMobileClose}
            className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors text-xs font-semibold text-white"
          >
            Ariza topshirish
            <ChevronRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="fixed top-0 left-0 h-screen w-[260px] bg-[var(--p-sidebar)] border-r border-[var(--p-border)] z-40 hidden lg:flex flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-[260px] bg-[var(--p-sidebar)] border-r border-[var(--p-border)]
          z-40 flex flex-col lg:hidden transition-transform duration-300
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        aria-hidden={!mobileOpen}
      >
        <SidebarContent />
      </aside>
    </>
  );
}
