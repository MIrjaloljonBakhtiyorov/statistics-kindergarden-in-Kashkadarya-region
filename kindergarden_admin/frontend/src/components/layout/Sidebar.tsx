import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  MapPin,
  Utensils,
  BarChart3,
  School,
  Sparkles,
  Bell,
  Settings,
  ShieldCheck,
  Database,
  Wallet,
  TrendingUp,
  X,
  LogOut
} from 'lucide-react';
import { clsx } from 'clsx';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';

const menuItems = [
  { icon: LayoutDashboard, label: "Viloyat statistikasi", path: "/" },
  { icon: MapPin, label: "Tumanlar monitoringi", path: "/districts" },
  { icon: School, label: "Bog'cha boshqaruvi", path: "/kindergartens" },
  { icon: Utensils, label: "Taomnoma nazorati", path: "/menu" },
  { icon: Database, label: "Omborxona Markazi", path: "/warehouse" },
  { icon: Wallet, label: "Moliyaviy statistika", path: "/financial-stats" },
  { icon: TrendingUp, label: "Taomnoma statistikasi", path: "/menu-stats" },
  { icon: BarChart3, label: "Reyting va audit", path: "/rating" },
  { icon: Sparkles, label: "AI xulosalar", path: "/ai-insights" },
  { icon: Bell, label: "Alertlar", path: "/alerts" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const handleLogout = async () => {
    try {
      localStorage.removeItem('isDemoAuth');
      await signOut(auth);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <aside className={clsx(
      "w-72 h-screen bg-[#0b1120] text-slate-400 flex flex-col fixed left-0 top-0 z-[100] transition-transform duration-300 ease-in-out lg:translate-x-0",
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
      <nav className="flex-1 px-4 overflow-hidden">
        <p className="text-[10px] font-black text-slate-600 tracking-[0.3em] uppercase px-3 mb-3">Main Monitor</p>

        <div className="space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
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
                  {item.label === "Alertlar" && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white">12</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-4 pb-6 pt-4 border-t border-white/5 space-y-2">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            clsx(
              "flex items-center gap-3 px-3 py-3 rounded-2xl transition-all duration-200 text-[13px] font-semibold",
              isActive
                ? "bg-indigo-600 text-white"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            )
          }
        >
          <Settings size={18} className="text-slate-500" />
          <span>Sozlamalar</span>
        </NavLink>

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
