import { Link, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Users, Files, Bell, Plane, Plus,
  CheckCircle, Circle, CalendarDays, ArrowRight,
  TrendingUp, Clock,
} from "lucide-react";
import { ProfileShell } from "../components/layout/ProfileShell";
import { ProfileStatCard } from "../components/ui/ProfileStatCard";
import { ProfileStatusBadge, getApplicationStatusBadge } from "../components/ui/ProfileStatusBadge";
import type { Notification } from "../data/notifications";

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL ?? "/api";
const profileCacheKey = (id: string) => `profile:${id}:overview`;

interface FullUserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  region: string;
  district: string;
  participationType: string;
  avatarUrl?: string;
  profileCompletion: number;
}

interface UserApplication {
  id: string;
  projectName: string;
  direction: string;
  status: "submitted" | "under_review" | "needs_correction" | "accepted" | "rejected";
  createdAt: string;
}

function buildChecklist(user: FullUserProfile) {
  return [
    { label: "Ism-familiya kiritilgan",    done: !!(user.firstName && user.lastName) },
    { label: "Telefon kiritilgan",          done: !!user.phone },
    { label: "Email kiritilgan",            done: !!user.email },
    { label: "Tug'ilgan sana kiritilgan",   done: !!user.birthDate },
    { label: "Yashash viloyati kiritilgan", done: !!user.region },
    { label: "Tuman / shahar kiritilgan",   done: !!user.district },
    { label: "Ishtirok turi tanlangan",     done: !!user.participationType },
    { label: "Profil rasmi yuklangan",      done: !!user.avatarUrl },
  ];
}

export function OverviewPage() {
  const { userId } = useParams();
  const profileUser = JSON.parse(localStorage.getItem("profileUser") ?? "null") as {
    id?: string; firstName?: string; lastName?: string; email?: string; profileCompletion?: number;
  } | null;
  const profileId = userId ?? profileUser?.id;
  const profileBasePath = `/profile/${profileId ?? ""}`.replace(/\/$/, "");
  const profilePath = (segment: string) => `${profileBasePath}/${segment}`;
  const cached = profileId ? readOverviewCache(profileId) : null;
  const localUser = profileUser?.id
    ? ({
        id: profileUser.id,
        firstName: profileUser.firstName ?? "",
        lastName: profileUser.lastName ?? "",
        email: profileUser.email ?? "",
        phone: "",
        birthDate: "",
        region: "",
        district: "",
        participationType: "",
        profileCompletion: profileUser.profileCompletion ?? 0,
      } satisfies FullUserProfile)
    : null;

  const [user, setUser]                   = useState<FullUserProfile | null>(cached?.profile ?? localUser);
  const [applications, setApplications]   = useState<UserApplication[]>(cached?.applications ?? []);
  const [notifications, setNotifications] = useState<Notification[]>(cached?.notifications ?? []);
  const [isLoading, setIsLoading]         = useState(!cached && !localUser);

  useEffect(() => {
    let mounted = true;
    if (!profileId) { setIsLoading(false); return; }

    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/users/${profileId}/overview`, { credentials: "include" });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.error?.message ?? "Profil ma'lumotlari yuklanmadi");

        if (mounted) {
          setUser(json.data.profile);
          setApplications(json.data.applications ?? []);
          setNotifications(json.data.notifications ?? []);
          writeOverviewCache(profileId, json.data);
          syncProfileUser(json.data.profile);
        }

      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [profileId]);

  const unread     = notifications.filter((n) => !n.isRead).length;
  const recentApps = applications.slice(0, 3);
  const checklist  = user ? buildChecklist(user) : [];
  const doneCount  = checklist.filter((c) => c.done).length;

  /* ── Loading ───────────────────────────────────────────── */
  if (isLoading) {
    return (
      <ProfileShell>
        <div className="flex items-center justify-center py-24">
          <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-blue-500" />
        </div>
      </ProfileShell>
    );
  }

  if (!user) {
    return (
      <ProfileShell>
        <div className="text-center py-24">
          <p className="text-red-400 text-sm">Profil ma'lumotlari yuklanmadi</p>
        </div>
      </ProfileShell>
    );
  }

  return (
    <ProfileShell>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">
          Xush kelibsiz, {user.firstName} 👋
        </h1>
        <p className="text-[#aab6c9] text-sm">
          Tanlovdagi ishtirokingiz, arizalaringiz va xabarlaringiz bo'yicha umumiy holat.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <ProfileStatCard
          label="Profil to'ldirilganligi"
          value={`${user.profileCompletion}%`}
          icon={TrendingUp}
          color="blue"
          sub={user.profileCompletion < 100 ? `${100 - user.profileCompletion}% qoldi` : "To'liq ✓"}
        />
        <ProfileStatCard
          label="Arizalarim"
          value={applications.length}
          icon={Files}
          color="cyan"
          sub={
            applications.filter((a) => a.status === "accepted").length > 0
              ? `${applications.filter((a) => a.status === "accepted").length} ta qabul`
              : "Hali yo'q"
          }
        />
        <ProfileStatCard
          label="Yangi xabarlar"
          value={unread}
          icon={Bell}
          color="gold"
          sub="O'qilmagan"
        />
        <ProfileStatCard
          label="Checklist"
          value={`${doneCount}/${checklist.length}`}
          icon={CheckCircle}
          color="purple"
          sub="Profil bo'limlari"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Left column ─────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Quick actions */}
          <div className="bg-[#0a1b30] border border-[rgba(112,145,190,.18)] rounded-2xl p-6">
            <h2 className="text-base font-bold text-white mb-4">Tezkor harakatlar</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                to={profilePath("applications")}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 transition-colors rounded-xl text-sm font-semibold text-white"
              >
                <Plus size={16} />
                Yangi ariza
              </Link>
              <Link
                to={profilePath("teams")}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#07172b] border border-[rgba(112,145,190,.25)] hover:bg-[#0d223b] transition-colors rounded-xl text-sm font-semibold text-[#aab6c9] hover:text-white"
              >
                <Users size={16} />
                Jamoa yaratish
              </Link>
              <Link
                to={profilePath("personal")}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#07172b] border border-[rgba(112,145,190,.25)] hover:bg-[#0d223b] transition-colors rounded-xl text-sm font-semibold text-[#aab6c9] hover:text-white"
              >
                <Plane size={16} />
                Profilni to'ldirish
              </Link>
            </div>
          </div>

          {/* Applications */}
          <div className="bg-[#0a1b30] border border-[rgba(112,145,190,.18)] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white">Arizalar holati</h2>
              <Link
                to={profilePath("applications")}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                Barchasi <ArrowRight size={13} />
              </Link>
            </div>
            <div className="space-y-3">
              {recentApps.map((app) => {
                const badge = getApplicationStatusBadge(app.status);
                return (
                  <div
                    key={app.id}
                    className="flex items-center gap-4 p-4 bg-[#07172b] rounded-xl border border-[rgba(112,145,190,.12)]"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{app.projectName}</p>
                      <p className="text-xs text-[#718096] mt-0.5">
                        {app.direction} · {new Date(app.createdAt).toLocaleDateString("uz-UZ")}
                      </p>
                    </div>
                    <ProfileStatusBadge label={badge.label} variant={badge.variant} />
                  </div>
                );
              })}
              {recentApps.length === 0 && (
                <div className="text-center py-8">
                  <Files size={32} className="mx-auto mb-2 text-[#718096] opacity-50" />
                  <p className="text-sm text-[#718096]">Hali ariza topshirilmagan</p>
                </div>
              )}
            </div>
          </div>

          {/* Application notifications */}
          <div className="bg-[#0a1b30] border border-[rgba(112,145,190,.18)] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-bold text-white">Ariza yangiliklari</h2>
              <Link
                to={profilePath("notifications")}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                Barchasi <ArrowRight size={13} />
              </Link>
            </div>
            {notifications.filter((n) => n.type === "application").length > 0 ? (
              <div className="space-y-3">
                {notifications
                  .filter((n) => n.type === "application")
                  .slice(0, 3)
                  .map((n) => (
                    <div
                      key={n.id}
                      className="flex items-start gap-4 p-4 bg-[#07172b] rounded-xl border border-[rgba(112,145,190,.12)]"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center">
                        <CalendarDays size={18} className="text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white">{n.title}</p>
                        <p className="text-xs text-[#aab6c9] mt-1 line-clamp-2">{n.body}</p>
                        <p className="text-[11px] text-[#718096] mt-1">
                          {new Date(n.createdAt).toLocaleDateString("uz-UZ")}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarDays size={32} className="mx-auto mb-2 text-[#718096] opacity-50" />
                <p className="text-sm text-[#718096]">Hozircha yangilik yo'q</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Right column ─────────────────────────────────── */}
        <div className="space-y-6">

          {/* Profile checklist */}
          <div className="bg-[#0a1b30] border border-[rgba(112,145,190,.18)] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Profilni yakunlang</h2>
              <span className="text-xs font-bold text-blue-400">{user.profileCompletion}%</span>
            </div>
            <div className="h-2 bg-[#07172b] rounded-full overflow-hidden mb-5">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${user.profileCompletion}%` }}
              />
            </div>
            <ul className="space-y-2.5">
              {checklist.map((item) => (
                <li key={item.label} className="flex items-center gap-2.5">
                  {item.done ? (
                    <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                  ) : (
                    <Circle size={16} className="text-[#718096] flex-shrink-0" />
                  )}
                  <span className={`text-xs ${item.done ? "text-[#aab6c9] line-through" : "text-white"}`}>
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to={profilePath("personal")}
              className="mt-5 flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/25 rounded-xl text-xs font-semibold text-blue-400 transition-colors"
            >
              Profilni tahrirlash
              <ArrowRight size={13} />
            </Link>
          </div>

          {/* Recent notifications */}
          <div className="bg-[#0a1b30] border border-[rgba(112,145,190,.18)] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">So'nggi xabarlar</h2>
              <Link
                to={profilePath("notifications")}
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                Barchasi <ArrowRight size={13} />
              </Link>
            </div>
            <ul className="space-y-3">
              {notifications.slice(0, 4).map((n) => (
                <li
                  key={n.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
                    !n.isRead
                      ? "bg-blue-500/8 border-blue-500/20"
                      : "bg-[#07172b] border-[rgba(112,145,190,.1)]"
                  }`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {!n.isRead
                      ? <span className="w-2 h-2 bg-blue-400 rounded-full block" />
                      : <Clock size={14} className="text-[#718096]" />
                    }
                  </div>
                  <div className="min-w-0">
                    <p className={`text-xs font-semibold truncate ${!n.isRead ? "text-white" : "text-[#aab6c9]"}`}>
                      {n.title}
                    </p>
                    <p className="text-[11px] text-[#718096] mt-0.5 line-clamp-2">{n.body}</p>
                  </div>
                </li>
              ))}
              {notifications.length === 0 && (
                <li className="rounded-xl border border-[rgba(112,145,190,.1)] bg-[#07172b] p-4 text-xs text-[#718096]">
                  Hozircha bildirishnoma yo'q.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </ProfileShell>
  );
}

function readOverviewCache(id: string) {
  try {
    const raw = sessionStorage.getItem(profileCacheKey(id));
    if (!raw) return null;
    return JSON.parse(raw) as {
      profile: FullUserProfile;
      applications: UserApplication[];
      notifications: Notification[];
    };
  } catch {
    return null;
  }
}

function writeOverviewCache(id: string, data: {
  profile: FullUserProfile;
  applications: UserApplication[];
  notifications: Notification[];
}) {
  sessionStorage.setItem(profileCacheKey(id), JSON.stringify(data));
}

function syncProfileUser(profile: FullUserProfile) {
  const current = JSON.parse(localStorage.getItem("profileUser") ?? "{}") as Record<string, unknown>;
  localStorage.setItem("profileUser", JSON.stringify({
    ...current,
    id: profile.id,
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    profileCompletion: profile.profileCompletion,
  }));
}
