import { useLocation, Link } from "react-router-dom";
import { Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { navigationItems } from "../../data/navigation";

interface AdminSidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
}

export function AdminSidebar({ collapsed, mobileOpen, onToggle, onMobileClose }: AdminSidebarProps) {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/admin") {
      return location.pathname === "/admin";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen bg-[var(--admin-sidebar)] border-r border-[var(--admin-border)]
          transition-all duration-300 z-40 hidden lg:flex flex-col
          ${collapsed ? "w-20" : "w-[280px]"}
        `}
      >
        {/* Logo & Brand */}
        <div className="h-[72px] flex items-center justify-between px-5 border-b border-[var(--admin-border)]">
          {!collapsed && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Trophy size={22} className="text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">Qashqadaryo</h1>
                <p className="text-xs text-[var(--admin-text-muted)]">Startup Ligasi</p>
              </div>
            </div>
          )}
          {collapsed && (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto">
              <Trophy size={22} className="text-white" />
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={onMobileClose}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                    ${active
                      ? "bg-blue-500/15 text-blue-400 border border-blue-500/30 shadow-[0_0_20px_rgba(47,125,246,0.2)]"
                      : "text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface)] hover:text-white"
                    }
                    ${collapsed ? "justify-center" : ""}
                  `}
                  title={collapsed ? item.label : ""}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Competition Selector */}
        {!collapsed && (
          <div className="p-3 border-t border-[var(--admin-border)]">
            <div className="bg-[var(--admin-surface)] rounded-xl p-3 border border-[var(--admin-border)]">
              <div className="flex items-center gap-2">
                <Trophy size={16} className="text-gold-400" />
                <span className="text-xs font-semibold text-white">2026 Tanlov</span>
              </div>
              <p className="text-xs text-[var(--admin-text-muted)] mt-1">Joriy tanlov davri</p>
            </div>
          </div>
        )}

        {/* Collapse Toggle */}
        <button
          onClick={onToggle}
          className="hidden lg:flex items-center justify-center h-12 border-t border-[var(--admin-border)] hover:bg-[var(--admin-surface)] transition-colors"
          aria-label={collapsed ? "Kengaytirish" : "Yig'ish"}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-screen w-[280px] bg-[var(--admin-sidebar)] border-r border-[var(--admin-border)]
          transition-transform duration-300 z-40 flex flex-col lg:hidden
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Logo & Brand */}
        <div className="h-[72px] flex items-center justify-between px-5 border-b border-[var(--admin-border)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Trophy size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white">Qashqadaryo</h1>
              <p className="text-xs text-[var(--admin-text-muted)]">Startup Ligasi</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={onMobileClose}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                    ${active
                      ? "bg-blue-500/15 text-blue-400 border border-blue-500/30"
                      : "text-[var(--admin-text-secondary)] hover:bg-[var(--admin-surface)] hover:text-white"
                    }
                  `}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Competition Selector */}
        <div className="p-3 border-t border-[var(--admin-border)]">
          <div className="bg-[var(--admin-surface)] rounded-xl p-3 border border-[var(--admin-border)]">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-gold-400" />
              <span className="text-xs font-semibold text-white">2026 Tanlov</span>
            </div>
            <p className="text-xs text-[var(--admin-text-muted)] mt-1">Joriy tanlov davri</p>
          </div>
        </div>
      </aside>
    </>
  );
}
