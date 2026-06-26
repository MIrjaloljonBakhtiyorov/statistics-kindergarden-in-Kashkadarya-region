import { useState } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import {
  Menu,
  Search,
  HelpCircle,
  Bell,
  Globe,
  ChevronDown,
  User,
  Home,
  LogOut,
  X,
} from "lucide-react";
import { useUnreadNotifications } from "../../hooks/useUnreadNotifications";

interface ProfileTopbarProps {
  onMenuToggle: () => void;
}

interface StoredUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export function ProfileTopbar({ onMenuToggle }: ProfileTopbarProps) {
  const navigate = useNavigate();
  const { userId } = useParams();
  const storedUser = JSON.parse(localStorage.getItem("profileUser") ?? "null") as StoredUser | null;

  const firstName  = storedUser?.firstName ?? "";
  const lastName   = storedUser?.lastName  ?? "";
  const email      = storedUser?.email     ?? "";
  const initials   = `${firstName[0] ?? "?"}${lastName[0] ?? ""}`.toUpperCase();

  const profileBasePath = `/profile/${userId ?? storedUser?.id ?? ""}`.replace(/\/$/, "");
  const profilePath = (segment: string) => `${profileBasePath}/${segment}`;
  const unreadCount = useUnreadNotifications(userId ?? storedUser?.id);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("profileUser");
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-30 h-[70px] bg-[var(--p-bg2)]/95 backdrop-blur-xl border-b border-[var(--p-border)] flex-shrink-0">
      <div className="h-full flex items-center justify-between px-5 gap-4">
        {/* Left */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 hover:bg-[var(--p-surface)] rounded-lg transition-colors"
            aria-label="Menyu"
          >
            <Menu size={20} />
          </button>

          <div className="hidden sm:flex items-center gap-2 bg-[var(--p-surface)] rounded-xl px-4 py-2 border border-[var(--p-border)] flex-1 max-w-sm">
            <Search size={16} className="text-[var(--p-muted)] flex-shrink-0" />
            <input
              type="text"
              placeholder="Kabinet bo'yicha qidirish..."
              className="bg-transparent border-none outline-none text-sm flex-1 text-white placeholder:text-[var(--p-muted)] min-w-0"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            className="p-2 hover:bg-[var(--p-surface)] rounded-lg transition-colors"
            aria-label="Yordam"
            title="Yordam"
          >
            <HelpCircle size={18} className="text-[var(--p-text2)]" />
          </button>

          <Link
            to={profilePath("notifications")}
            className="relative p-2 hover:bg-[var(--p-surface)] rounded-lg transition-colors"
            aria-label={`Bildirishnomalar${unreadCount > 0 ? `, ${unreadCount} ta yangi` : ""}`}
          >
            <Bell size={18} className="text-[var(--p-text2)]" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true" />
            )}
          </Link>

          <button
            className="p-2 hover:bg-[var(--p-surface)] rounded-lg transition-colors"
            aria-label="Til"
            title="Til"
          >
            <Globe size={18} className="text-[var(--p-text2)]" />
          </button>

          {/* Profile dropdown */}
          <div className="relative pl-2 border-l border-[var(--p-border)] ml-1">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-2 hover:bg-[var(--p-surface)] rounded-xl px-2 py-1.5 transition-colors"
              aria-expanded={dropdownOpen}
              aria-haspopup="menu"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {initials || <User size={14} />}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-white leading-tight">
                  {firstName || "Foydalanuvchi"}
                </p>
                <p className="text-[11px] text-[var(--p-muted)] leading-tight">Kabinet</p>
              </div>
              <ChevronDown size={14} className={`text-[var(--p-muted)] transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setDropdownOpen(false)}
                  aria-hidden="true"
                />
                <div
                  className="absolute right-0 top-full mt-2 w-52 bg-[var(--p-surface)] border border-[var(--p-border)] rounded-xl shadow-2xl z-20 overflow-hidden"
                  role="menu"
                >
                  <div className="px-4 py-3 border-b border-[var(--p-border)]">
                    <p className="text-sm font-semibold text-white">{lastName} {firstName}</p>
                    <p className="text-xs text-[var(--p-muted)] truncate">{email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to={profilePath("personal")}
                      onClick={() => setDropdownOpen(false)}
                      role="menuitem"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--p-surface2)] transition-colors text-sm text-[var(--p-text2)] hover:text-white"
                    >
                      <User size={16} />
                      Profil
                    </Link>
                    <Link
                      to="/"
                      onClick={() => setDropdownOpen(false)}
                      role="menuitem"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[var(--p-surface2)] transition-colors text-sm text-[var(--p-text2)] hover:text-white"
                    >
                      <Home size={16} />
                      Bosh sahifaga qaytish
                    </Link>
                  </div>
                  <div className="border-t border-[var(--p-border)] py-1">
                    <button
                      onClick={handleLogout}
                      role="menuitem"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 transition-colors text-sm text-red-400 w-full text-left"
                    >
                      <LogOut size={16} />
                      Chiqish
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
