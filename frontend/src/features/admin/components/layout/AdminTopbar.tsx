import { Bell, Menu, Search, User } from "lucide-react";

interface AdminTopbarProps {
  onSidebarToggle: () => void;
  onMobileSidebarToggle: () => void;
}

export function AdminTopbar({ onSidebarToggle, onMobileSidebarToggle }: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-30 h-[72px] bg-[var(--admin-bg-secondary)]/95 backdrop-blur-xl border-b border-[var(--admin-border)]">
      <div className="h-full flex items-center justify-between px-6">
        {/* Left: Mobile menu + Search */}
        <div className="flex items-center gap-4 flex-1">
          <button
            onClick={onMobileSidebarToggle}
            className="lg:hidden p-2 hover:bg-[var(--admin-surface)] rounded-lg transition-colors"
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>

          <div className="hidden sm:flex items-center gap-2 bg-[var(--admin-surface)] rounded-lg px-4 py-2 w-full max-w-md border border-[var(--admin-border)]">
            <Search size={18} className="text-[var(--admin-text-muted)]" />
            <input
              type="text"
              placeholder="Qidirish..."
              className="bg-transparent border-none outline-none text-sm flex-1 text-white placeholder:text-[var(--admin-text-muted)]"
            />
            <kbd className="hidden lg:inline-block px-2 py-0.5 text-xs bg-[var(--admin-bg)] rounded border border-[var(--admin-border)] text-[var(--admin-text-muted)]">
              Ctrl K
            </kbd>
          </div>
        </div>

        {/* Right: Notifications + Profile */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button
            className="relative p-2 hover:bg-[var(--admin-surface)] rounded-lg transition-colors"
            aria-label="Bildirishnomalar"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3 pl-3 border-l border-[var(--admin-border)]">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white">Admin</p>
              <p className="text-xs text-[var(--admin-text-muted)]">Super Administrator</p>
            </div>
            <button
              className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center hover:scale-105 transition-transform"
              aria-label="Profil"
            >
              <User size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
