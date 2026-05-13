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
      "w-64 sm:w-72 lg:w-72 h-screen bg-[#020617] text-slate-400 flex flex-col fixed left-0 top-0 border-r border-white/5 z-[100] transition-transform duration-300 ease-in-out lg:translate-x-0",
      isOpen ? "translate-x-0" : "-translate-x-full"
    )}>
      {/* Premium Glow Effect */}
      <div className="absolute top-0 left-0 w-full h-64 bg-indigo-600/5 blur-[100px] pointer-events-none" />
      
      <div className="p-6 sm:p-8 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-500/20 ring-1 ring-white/20">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="font-black text-white text-base leading-tight tracking-tight uppercase">Kashkadarya</h1>
            <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-[0.2em] mt-0.5">Premium ERP</p>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors bg-white/5 rounded-lg"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 py-4 px-4 space-y-1.5 overflow-y-auto custom-scrollbar relative z-10">
        <div className="px-4 py-2">
          <p className="text-[10px] font-black text-slate-500 tracking-[0.3em] uppercase mb-4 opacity-50">Analytics & Control</p>
        </div>
        
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={() => {
              if (window.innerWidth < 1024) onClose();
            }}
            className={({ isActive }) =>
              clsx(
                "group flex items-center gap-3.5 px-4 py-3.5 rounded-2xl transition-all duration-300 border",
                isActive 
                  ? "bg-white/5 border-white/10 text-white shadow-2xl shadow-indigo-500/5" 
                  : "border-transparent hover:bg-white/[0.03] hover:text-slate-200"
              )
            }
          >
            <div className={clsx(
              "w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300",
              "group-hover:bg-indigo-500/10 group-hover:text-indigo-400"
            )}>
              <item.icon size={18} className="transition-transform group-hover:scale-110" />
            </div>
            <span className="text-[13px] font-bold tracking-tight">{item.label}</span>
            {item.label === 'Alertlar' && (
              <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white shadow-lg shadow-rose-500/20">12</span>
            )}
            
            {/* Active Indicator Pin */}
            <div className={clsx(
              "absolute left-0 w-1 h-6 bg-indigo-500 rounded-r-full transition-all duration-300 opacity-0",
              "group-[.active]:opacity-100"
            )} />
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5 bg-black/20 space-y-3 relative z-10">
        <div className="flex items-center gap-3.5 px-4 py-3 bg-white/[0.03] border border-white/5 rounded-2xl group cursor-pointer transition-all hover:bg-white/[0.06]">
           <div className="w-8 h-8 rounded-xl bg-slate-800/50 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
              <Settings size={16} />
           </div>
           <span className="text-[13px] font-bold text-slate-400 group-hover:text-white transition-colors">Sozlamalar</span>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3.5 px-4 py-3 bg-rose-500/5 border border-rose-500/10 rounded-2xl group cursor-pointer transition-all hover:bg-rose-500 hover:text-white shadow-lg hover:shadow-rose-500/20"
        >
           <div className="w-8 h-8 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 group-hover:bg-white/20 group-hover:text-white transition-all">
              <LogOut size={16} />
           </div>
           <span className="text-[13px] font-bold text-rose-500 group-hover:text-white">Chiqish</span>
        </button>
      </div>
    </aside>
  );
};
