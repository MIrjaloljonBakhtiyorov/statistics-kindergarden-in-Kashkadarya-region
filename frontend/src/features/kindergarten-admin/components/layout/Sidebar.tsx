import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Utensils,
  BarChart3,
  School,
  Sparkles,
  Bell,
  ShieldCheck,
  ClipboardCheck,
  Database,
  Pill,
  Wallet,
  TrendingUp,
  Globe2,
  X,
  LogOut
} from 'lucide-react';
import { clsx } from 'clsx';
import { apiClient } from '@/shared/api';

const menuItems = [
  { icon: LayoutDashboard, label: "Viloyat statistikasi", path: "" },
  { icon: BarChart3, label: "Tumanlar statistikasi", path: "tuman-stats" },
  { icon: School, label: "MTT boshqaruvi", path: "kindergartens" },
  { icon: ClipboardCheck, label: "MTT inspeksiyasi", path: "kindergarten-inspection" },
  { icon: Utensils, label: "Taomnoma nazorati", path: "menu" },
  { icon: Sparkles, label: "Aqlvoy taomnoma", path: "aqlvoy-chef-menu" },
  { icon: Database, label: "Omborxona", path: "warehouse" },
  { icon: Pill, label: "Dori zaxirasi", path: "medical-stock" },
  { icon: Wallet, label: "Moliya statistikasi", path: "financial-stats" },
  { icon: TrendingUp, label: "Taomnoma statistikasi", path: "menu-stats" },
  { icon: Globe2, label: "MTT web sahifasi", path: "website-builder" },
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

  const handleMenuWheel = (event: React.WheelEvent<HTMLElement>) => {
    const menu = menuRef.current;
    if (!menu) return;

    const maxScroll = menu.scrollHeight - menu.clientHeight;
    if (maxScroll <= 0) return;

    const nextScroll = Math.max(0, Math.min(maxScroll, menu.scrollTop + event.deltaY));
    if (nextScroll !== menu.scrollTop) {
      event.preventDefault();
      menu.scrollTop = nextScroll;
    }
  };

  return (
    <aside className={clsx(
      "w-80 h-screen overflow-hidden border-r border-white/10 bg-[linear-gradient(180deg,#07111f_0%,#0b1120_42%,#111827_100%)] text-slate-400 flex flex-col fixed left-0 top-0 z-[100] transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-[22px_0_70px_rgba(15,23,42,0.24)]",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_20%_0%,rgba(79,70,229,0.22),transparent_45%),radial-gradient(circle_at_88%_12%,rgba(20,184,166,0.16),transparent_42%)]" />

      {/* Logo */}
      <div className="relative px-6 pt-7 pb-5 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-teal-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/25 ring-1 ring-white/15">
            <ShieldCheck size={23} />
          </div>
          <div className="min-w-0">
            <h1 className="font-black text-white text-base leading-tight tracking-widest uppercase">Raqamli MTT</h1>
            <p className="text-[11px] text-teal-200/70 font-bold uppercase tracking-widest mt-1">Qashqadaryo AI</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-2 text-slate-500 hover:text-white transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav */}
      <div className="admin-sidebar-scroll-mask relative flex-1 min-h-0 overflow-hidden">
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-7 bg-gradient-to-b from-[#0b1120] to-transparent" />
        <nav ref={menuRef} onWheel={handleMenuWheel} className="admin-sidebar-menu absolute inset-x-0 inset-y-0 overflow-hidden pb-6 pt-1">
          <p className="text-[9px] font-black text-slate-600 tracking-[0.32em] uppercase px-4 mb-3">Asosiy menyu</p>

          <div className="space-y-1 px-2">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={getAdminPath(item.path)}
                end={item.path === ""}
                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                className={({ isActive }) =>
                  clsx(
                    "group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 text-[13px] font-bold overflow-hidden",
                    isActive
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25"
                      : "text-slate-400 hover:bg-white/[0.06] hover:text-slate-100"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && <span className="absolute left-0 top-1/2 h-7 w-1 -translate-y-1/2 rounded-r-full bg-teal-300" />}
                    <span className={clsx(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition-all",
                      isActive
                        ? "border-white/15 bg-white/15 text-white"
                        : "border-white/5 bg-white/[0.04] text-slate-500 group-hover:border-white/10 group-hover:text-teal-200"
                    )}>
                      <item.icon size={15} />
                    </span>
                    <span className="min-w-0 flex-1 whitespace-normal break-words leading-snug">{item.label}</span>
                    {item.label === "Alertlar" && alertCount > 0 && (
                      <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white">
                        {alertCount > 99 ? '99+' : alertCount}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-9 bg-gradient-to-t from-[#0b1120] to-transparent" />
      </div>

      {/* Bottom */}
      <div className="relative shrink-0 px-4 pb-5 pt-3 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] font-black text-rose-300 bg-rose-500/[0.06] hover:bg-rose-500/10 hover:text-rose-200 transition-all duration-200 border border-rose-400/10"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 text-rose-300">
            <LogOut size={15} />
          </span>
          <span>Chiqish</span>
        </button>
      </div>
    </aside>
  );
};
