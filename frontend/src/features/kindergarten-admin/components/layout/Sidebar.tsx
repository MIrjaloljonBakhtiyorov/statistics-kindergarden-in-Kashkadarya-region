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
    const trackInset = 10;
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
      "admin-sidebar isolate w-[268px] max-w-[calc(100vw-16px)] h-[calc(100dvh-16px)] max-h-[calc(100dvh-16px)] overflow-hidden rounded-[8px] border border-white/[0.06] bg-[#181b1c] text-white flex flex-col fixed left-2 top-2 bottom-2 z-[100] transition-transform duration-300 ease-in-out lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[#181b1c]" />

      {/* Logo */}
      <div className="sticky top-0 z-30 shrink-0 bg-[#181b1c] px-5 pb-3 pt-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] border border-[#00c853]/35 bg-[#102019] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_18px_rgba(0,200,83,0.14)]">
              <span className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-[#00c853] text-[#061811]">
                <ClipboardCheck size={18} strokeWidth={2.8} />
              </span>
            </div>
            <span className="truncate text-[20px] font-black leading-none tracking-normal text-white">
              Raqamli MTT
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden flex h-8 w-8 shrink-0 items-center justify-center rounded-[2.9px] border border-white/10 bg-white/[0.035] text-white transition-colors hover:bg-white/[0.08]"
            aria-label="Menyuni yopish"
          >
            <X size={17} />
          </button>
        </div>
      </div>

      {/* Nav */}
      <div className="admin-sidebar-scroll-mask relative flex-1 min-h-0 overflow-hidden">
        <nav
          ref={menuRef}
          onScroll={updateScrollMetrics}
          className="admin-sidebar-menu h-full min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain pb-4 pt-1 [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          <div className="space-y-0">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={getAdminPath(item.path)}
                end={item.path === ""}
                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                className={({ isActive }) =>
                  clsx(
                    "group relative mx-2 flex min-h-[43px] items-center gap-2.5 rounded-[5px] border-b border-white/[0.055] px-2 py-1.5 text-[13.2px] font-extrabold leading-[1.12] tracking-normal transition-colors duration-200 ease-out",
                    isActive
                      ? "border-[#00c853]/35 bg-[#00c853] text-[#051b0f] shadow-[inset_3px_0_0_#06391f,0_0_18px_rgba(0,200,83,0.22)]"
                      : "text-white hover:bg-white/[0.035]"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <span className={clsx(
                      "relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-[2.9px] text-[#00c853] transition-colors duration-200",
                      isActive
                        ? "bg-[#06391f] text-[#00ff75] ring-1 ring-[#00ff75]/35 shadow-[0_0_14px_rgba(0,200,83,0.26)]"
                        : "group-hover:bg-[#00c853]/12"
                    )}>
                      <item.icon size={17} strokeWidth={2.35} />
                    </span>
                    <span className={clsx(
                      "relative z-10 min-w-0 flex-1 whitespace-normal break-words",
                      isActive
                        ? "text-[#051b0f]"
                        : "text-white drop-shadow-[0_1px_0_rgba(255,255,255,0.1)]"
                    )}>{item.label}</span>
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
                      <span className="relative z-10 ml-auto flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-black text-white shadow-[0_0_14px_rgba(244,63,94,0.65)]">
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
      <div className="sticky bottom-0 z-30 shrink-0 bg-[#181b1c] px-5 pb-5 pt-4">
        <button
          onClick={handleLogout}
          className="flex min-h-[42px] w-full items-center gap-2.5 border-b border-white/[0.055] px-0 py-1.5 text-[13.2px] font-extrabold text-rose-200 transition-colors duration-200 hover:text-white"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-[2.9px] text-[#00c853]">
            <LogOut size={17} strokeWidth={2.35} />
          </span>
          <span>Chiqish</span>
        </button>
      </div>
    </aside>
  );
};
