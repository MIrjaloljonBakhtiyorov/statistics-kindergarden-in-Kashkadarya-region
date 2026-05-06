import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
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
  { icon: LayoutDashboard, label: 'Viloyat statistikasi', path: '/' },
  { icon: MapPin, label: 'Tumanlar monitoringi', path: '/districts' },
  { icon: School, label: 'Bog‘cha boshqaruvi', path: '/kindergartens' },
  { icon: Utensils, label: 'Taomnoma nazorati', path: '/menu' },
  { icon: Database, label: 'Omborxona Markazi', path: '/warehouse' },
  { icon: Wallet, label: 'Moliyaviy statistika', path: '/financial-stats' },
  { icon: TrendingUp, label: 'Taomnoma statistikasi', path: '/menu-stats' },
  { icon: BarChart3, label: 'Reyting va audit', path: '/rating' },
  { icon: Sparkles, label: 'AI xulosalar', path: '/ai-insights' },
  { icon: Bell, label: 'Alertlar', path: '/alerts' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

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
      "w-64 sm:w-72 lg:w-64 h-screen bg-[#0f172a] text-slate-400 flex flex-col fixed left-0 top-0 border-r border-[#1e293b] z-[100] transition-transform duration-300 ease-in-out lg:translate-x-0 shadow-2xl shadow-black/50",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      <div className="p-4 sm:p-6 flex items-center justify-between border-b border-[#1e293b]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20 ring-1 ring-white/10">
            <ShieldCheck size={18} className="sm:w-5 sm:h-5" />
          </div>
          <div>
            <h1 className="font-black text-white text-[11px] sm:text-sm leading-tight tracking-[0.02em] uppercase">Kashkadarya</h1>
            <p className="text-[8px] sm:text-[10px] text-indigo-400/60 font-bold uppercase tracking-widest mt-0.5">MTT Management</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 py-6 sm:py-8 px-3 sm:px-4 space-y-1 sm:space-y-1.5 overflow-y-auto custom-scrollbar">
        <p className="px-4 text-[8px] sm:text-[9px] font-black text-slate-600 tracking-[0.2em] uppercase mb-4">Main Monitor</p>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => {
              if (window.innerWidth < 1024) onClose();
            }}
            className={({ isActive }) =>
              clsx(
                "group flex items-center gap-3 px-4 py-2.5 sm:py-3 rounded-xl transition-all duration-200 border border-transparent",
                isActive 
                  ? "bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-600/10 border-white/5 scale-[1.02]" 
                  : "hover:bg-slate-800/50 hover:text-slate-200"
              )
            }
          >
            <item.icon size={16} className={clsx("sm:w-[18px] sm:h-[18px] transition-transform group-hover:scale-110")} />
            <span className="text-[11px] sm:text-xs">{item.label}</span>
            {item.label === 'Alertlar' && (
              <span className="ml-auto bg-rose-500 text-white text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-lg shadow-rose-500/20">12</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 sm:p-6 border-t border-[#1e293b] bg-[#020617]/50 space-y-2">
        <div className="flex items-center gap-3 px-4 py-2 sm:py-2.5 bg-slate-800/40 border border-white/5 rounded-xl group cursor-pointer transition-all hover:bg-slate-800">
           <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-300">
              <Settings size={14} className="sm:w-4 sm:h-4" />
           </div>
           <span className="text-[11px] sm:text-xs font-bold text-slate-300">Sozlamalar</span>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 sm:py-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl group cursor-pointer transition-all hover:bg-rose-500 hover:text-white"
        >
           <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-500 group-hover:bg-white/20 group-hover:text-white">
              <LogOut size={14} className="sm:w-4 sm:h-4" />
           </div>
           <span className="text-[11px] sm:text-xs font-bold text-rose-500 group-hover:text-white">Chiqish</span>
        </button>
      </div>
    </aside>
  );
};
