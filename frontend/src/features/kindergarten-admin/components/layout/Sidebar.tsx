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
  { icon: School, label: "Bog'cha boshqaruvi", path: "kindergartens" },
  { icon: ClipboardCheck, label: "Bog'cha inspeksiyasi", path: "kindergarten-inspection" },
  { icon: Utensils, label: "Taomnoma nazorati", path: "menu" },
  { icon: Sparkles, label: "Aqlvoy oshpaz taomnoma menusi", path: "aqlvoy-chef-menu" },
  { icon: Database, label: "Omborxona Markazi", path: "warehouse" },
  { icon: Pill, label: "Dori-darmon zaxirasi", path: "medical-stock" },
  { icon: Wallet, label: "Moliyaviy statistika", path: "financial-stats" },
  { icon: TrendingUp, label: "Taomnoma statistikasi", path: "menu-stats" },
  { icon: Globe2, label: "Bog'cha web sahifasi", path: "website-builder" },
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
      "w-72 h-screen overflow-hidden border-r border-white/10 bg-[#0b1120] text-slate-400 flex flex-col fixed left-0 top-0 z-[100] transition-transform duration-300 ease-in-out lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>

      {/* Logo */}
      <div className="px-6 pt-7 pb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="font-black text-white text-sm leading-tight tracking-widest uppercase">Raqamli MTT</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Qashqadaryo AI</p>
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
        <nav ref={menuRef} onWheel={handleMenuWheel} className="admin-sidebar-menu absolute inset-y-0 left-0 overflow-hidden pb-6 pt-1">
          <p className="text-[10px] font-black text-slate-600 tracking-[0.3em] uppercase px-3 mb-3">Main Monitor</p>

          <div className="space-y-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={getAdminPath(item.path)}
                end={item.path === ""}
                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                className={({ isActive }) =>
                  clsx(
                    "flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 text-[13px] font-semibold",
                    isActive
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon size={18} className={isActive ? "text-white" : "text-slate-500"} />
                    <span>{item.label}</span>
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
      <div className="shrink-0 px-4 pb-6 pt-4 border-t border-white/5">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-3 rounded-2xl text-[13px] font-semibold text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
        >
          <LogOut size={18} />
          <span>Chiqish</span>
        </button>
      </div>
    </aside>
  );
};
