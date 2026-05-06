import React from 'react';
import { Search, Bell, Moon, Sun, HelpCircle, LayoutGrid, Clock, Menu, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';

interface TopbarProps {
  onMenuClick: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
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
    <header className="h-16 lg:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200/60 sticky top-0 z-[80] flex items-center justify-between px-3 sm:px-6 lg:px-8 w-full gap-2">
      <div className="flex items-center gap-1.5 sm:gap-4 overflow-hidden">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-1.5 sm:p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-all shrink-0"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="w-8 h-8 lg:w-10 lg:h-10 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
            <LayoutGrid size={18} className="text-white" />
          </div>
          <div className="hidden xs:block">
            <h1 className="text-[10px] sm:text-xs lg:text-sm font-black text-slate-900 tracking-tight leading-tight">Kashkadarya MTT</h1>
            <p className="text-[8px] sm:text-[9px] lg:text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Boshqaruv</p>
          </div>
        </div>
        
        <div className="hidden lg:block h-8 w-[1px] bg-slate-200 mx-2"></div>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-100 shrink-0">
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
          />
          <span className="text-[9px] font-black text-emerald-700 uppercase tracking-widest flex items-center gap-1">
            Live <span className="hidden md:inline-block">Monitor</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 lg:gap-6 shrink-0">
        <div className="hidden xl:flex items-center gap-2 text-slate-400 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200/60">
          <Clock size={14} className="text-indigo-500" />
          <span className="text-[11px] font-mono font-black text-slate-600 uppercase tracking-tight">24-MAY, 2024 · 09:42</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <button className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all relative group">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
          </button>
          
          <div className="h-6 w-[1px] bg-slate-200 hidden xs:block mx-1"></div>
          
          <div className="flex items-center gap-1.5 sm:gap-3 pl-1 group">
            <div className="text-right hidden md:block">
              <span className="block text-xs font-black text-slate-900 leading-none">Mirjalol S.</span>
              <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Admin</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 transition-all hover:scale-105 hover:border-indigo-200 hover:bg-indigo-50 shadow-sm">
                <span className="text-[10px] sm:text-xs font-black font-mono">MS</span>
              </div>
              <button 
                onClick={handleLogout}
                className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                title="Chiqish"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
