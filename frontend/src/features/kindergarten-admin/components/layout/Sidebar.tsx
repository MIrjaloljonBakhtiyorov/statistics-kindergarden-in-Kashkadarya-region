import React, { useCallback, useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Utensils,
  BarChart3,
  School,
  Sparkles,
  Bell,
  ClipboardCheck,
  Database,
  Pill,
  Wallet,
  TrendingUp,
  Globe2,
  CreditCard,
  Newspaper,
  Megaphone,
  X,
  LogOut,
  type LucideIcon
} from 'lucide-react';
import { clsx } from 'clsx';
import { apiClient } from '@/shared/api';

interface AdminMenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
  badge?: string;
}

const menuItems: AdminMenuItem[] = [
  { icon: LayoutDashboard, label: "Viloyat statistikasi", path: "" },
  { icon: BarChart3, label: "Tumanlar statistikasi", path: "tuman-stats" },
  { icon: School, label: "MTT boshqaruvi", path: "kindergartens" },
  { icon: ClipboardCheck, label: "MTT inspeksiyasi", path: "kindergarten-inspection" },
  { icon: Utensils, label: "Taomnoma nazorati", path: "menu" },
  { icon: Sparkles, label: "Aqlvoy taomnoma", path: "aqlvoy-chef-menu" },
  { icon: Database, label: "Omborxona", path: "warehouse" },
  { icon: Pill, label: "Dori zaxirasi", path: "medical-stock" },
  { icon: Wallet, label: "Moliya statistikasi", path: "financial-stats" },
  { icon: CreditCard, label: "Obunalar", path: "subscriptions" },
  { icon: TrendingUp, label: "Taomnoma statistikasi", path: "menu-stats" },
  { icon: Globe2, label: "MTT web sahifasi", path: "website-builder" },
  { icon: Newspaper, label: "Yangiliklar", path: "website-news" },
  { icon: Megaphone, label: "Reklama", path: "advertising" },
  { icon: BarChart3, label: "Reyting va audit", path: "rating" },
  { icon: Sparkles, label: "AI xulosalar", path: "ai-insights" },
  { icon: Bell, label: "Alertlar", path: "alerts" },
];

const getAdminPath = (path: string) => (path ? `/admin/${path}` : '/admin');

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [alertCount, setAlertCount] = useState(0);
  const menuRef = useRef<HTMLElement | null>(null);
  const [scrollMetrics, setScrollMetrics] = useState({ top: 14, height: 64, visible: false });

  const updateScrollMetrics = useCallback(() => {
    const menu = menuRef.current;
    if (!menu) return;

    const { scrollTop, scrollHeight, clientHeight } = menu;
    const hasScroll = scrollHeight > clientHeight + 2;
    const trackInset = 14;
    const trackHeight = Math.max(clientHeight - trackInset * 2, 1);
    const thumbHeight = hasScroll
      ? Math.max(54, trackHeight * (clientHeight / scrollHeight))
      : trackHeight;
    const maxScrollTop = Math.max(scrollHeight - clientHeight, 1);
    const maxThumbTop = Math.max(trackHeight - thumbHeight, 0);

    setScrollMetrics({
      visible: hasScroll,
      height: thumbHeight,
      top: trackInset + (scrollTop / maxScrollTop) * maxThumbTop,
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadAlertCount = () => {
      apiClient.get('/kindergartens/alerts', { params: { pageSize: 1 } })
        .then((response) => {
          if (mounted) setAlertCount(Number(response.data?.summary?.total || 0));
        })
        .catch(() => {
          if (mounted) setAlertCount(0);
        });
    };

    loadAlertCount();
    const timer = window.setInterval(loadAlertCount, 30_000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    updateScrollMetrics();
    window.addEventListener('resize', updateScrollMetrics);
    return () => window.removeEventListener('resize', updateScrollMetrics);
  }, [alertCount, updateScrollMetrics]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('isDemoAuth');
      const { signOut } = await import('firebase/auth');
      const { auth } = await import('../../services/firebase');
      await signOut(auth);
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <aside className={clsx(
      "admin-sidebar isolate w-80 h-dvh max-h-dvh overflow-hidden border-r border-sky-200/10 bg-[linear-gradient(180deg,#020617_0%,#07152c_38%,#0b1632_72%,#080e1e_100%)] text-slate-300/80 flex flex-col fixed left-0 top-0 z-[100] transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-[18px_0_54px_rgba(2,6,23,0.34)]",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_14%_0%,rgba(14,165,233,0.11),transparent_34%),radial-gradient(circle_at_92%_18%,rgba(79,70,229,0.12),transparent_35%),radial-gradient(circle_at_45%_92%,rgba(30,64,175,0.08),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-gradient-to-b from-sky-300/28 via-indigo-300/10 to-transparent" />
      <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-sky-200/28 to-transparent" />

      {/* Logo */}
      <div className="sticky top-0 z-30 shrink-0 px-4 pt-4 pb-4 flex items-center justify-between bg-[#020617]/45 backdrop-blur-xl">
        <div className="admin-sidebar-brand-card relative w-full min-w-0 overflow-hidden p-3.5">
          <img
            src="/raqamli-mtt-logo.svg"
            alt="Raqamli MTT"
            className="admin-sidebar-logo"
          />
        </div>
        <button
          onClick={onClose}
          className="lg:hidden ml-2 rounded-xl border border-white/10 bg-white/[0.04] p-2 text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] transition-colors duration-200 hover:bg-white/[0.08] hover:text-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <div className="admin-sidebar-scroll-mask relative flex-1 min-h-0 overflow-hidden">
        <nav
          ref={menuRef}
          onScroll={updateScrollMetrics}
          className="admin-sidebar-menu h-full min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain pb-5 pt-2"
        >
          <div className="space-y-1.5">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={getAdminPath(item.path)}
                end={item.path === ""}
                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                className={({ isActive }) =>
                  clsx(
                    "group relative flex items-center gap-3 px-3.5 py-2.5 rounded-[13px] transition-all duration-200 ease-out text-[13.5px] font-extrabold overflow-hidden",
                    isActive
                      ? "bg-[linear-gradient(135deg,#123766_0%,#243f90_54%,#4c2f9b_100%)] text-white ring-1 ring-sky-100/[0.13]"
                      : "text-slate-300/76 hover:bg-sky-100/[0.052] hover:text-slate-50 hover:ring-1 hover:ring-slate-200/[0.08]"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-sky-300" />}
                    {isActive && <span className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.11),transparent_36%,rgba(255,255,255,0.035))]" />}
                    <span className={clsx(
                      "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] border transition-all duration-200",
                      isActive
                        ? "border-sky-100/[0.18] bg-sky-50/[0.13] text-white"
                        : "border-slate-200/[0.08] bg-slate-100/[0.045] text-slate-500 group-hover:border-sky-200/[0.17] group-hover:bg-sky-300/[0.065] group-hover:text-sky-100"
                    )}>
                      <item.icon size={15} />
                    </span>
                    <span className="relative z-10 min-w-0 flex-1 whitespace-normal break-words leading-snug">{item.label}</span>
                    {item.badge && (
                      <span className={clsx(
                        "relative z-10 ml-auto rounded-full px-2 py-0.5 text-[8px] font-black uppercase tracking-wider",
                        isActive
                          ? "bg-white/15 text-white"
                          : "bg-teal-400/10 text-teal-200 ring-1 ring-teal-300/10"
                      )}>
                        {item.badge}
                      </span>
                    )}
                    {item.label === "Alertlar" && alertCount > 0 && (
                      <span className="relative z-10 ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white shadow-[0_0_14px_rgba(244,63,94,0.42)]">
                        {alertCount > 99 ? '99+' : alertCount}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
        <div className={clsx("admin-sidebar-custom-scrollbar", scrollMetrics.visible && "is-visible")}>
          <span
            style={{
              height: `${scrollMetrics.height}px`,
              transform: `translateY(${scrollMetrics.top}px)`,
            }}
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-10 bg-gradient-to-t from-[#0b1225] via-[#0b1225]/82 to-transparent" />
      </div>

      {/* Bottom */}
      <div className="sticky bottom-0 z-30 shrink-0 px-4 pb-4 pt-3 border-t border-cyan-200/10 bg-[#0b1225]/86 backdrop-blur-xl shadow-[0_-18px_38px_rgba(2,6,23,0.26)]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-[13px] text-[12.5px] font-black text-rose-200 bg-rose-500/[0.08] hover:bg-rose-500/[0.13] hover:text-white transition-all duration-200 border border-rose-300/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_12px_26px_rgba(2,6,23,0.18)]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-rose-500/[0.12] text-rose-200 ring-1 ring-rose-300/[0.12] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
            <LogOut size={14} />
          </span>
          <span>Chiqish</span>
        </button>
      </div>
    </aside>
  );
};
