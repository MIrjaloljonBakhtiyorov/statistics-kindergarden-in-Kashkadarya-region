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
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    try {
      localStorage.removeItem('isDemoAuth');
      await signOut(auth);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const formattedTime = time.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = time.toLocaleDateString('uz-UZ', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <header className="h-20 lg:h-24 bg-white/60 backdrop-blur-2xl border-b border-slate-200/40 sticky top-0 z-[80] flex items-center justify-between px-6 sm:px-10 w-full gap-4 transition-all">
      <div className="flex items-center gap-6 overflow-hidden">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-3 text-slate-600 hover:bg-slate-100 rounded-2xl transition-all shrink-0"
        >
          <Menu size={24} />
        </button>

        <div className="hidden sm:flex items-center gap-3 px-5 py-2.5 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 shrink-0 group transition-all hover:bg-indigo-50 hover:shadow-lg hover:shadow-indigo-500/5">
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.6)]"
          />
          <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em] flex items-center gap-2">
            System <span className="hidden md:inline-block">Status: Online</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-8 shrink-0">
        <div className="hidden xl:flex flex-col items-end gap-0.5">
          <div className="flex items-center gap-2 text-slate-900">
            <Clock size={14} className="text-indigo-500" />
            <span className="text-xs font-black tracking-tighter">{formattedTime}</span>
          </div>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{formattedDate}</span>
        </div>

        <div className="h-10 w-[1px] bg-slate-200/60 hidden sm:block"></div>

        <div className="flex items-center gap-4 sm:gap-6">
          <button className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all relative group shadow-sm hover:shadow-indigo-500/10 active:scale-95">
            <Bell size={22} />
            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-rose-500 rounded-full ring-4 ring-white shadow-lg"></span>
          </button>
          
          <div className="flex items-center gap-4 pl-2 group">
            <div className="text-right hidden md:block select-none">
              <span className="block text-sm font-black text-slate-900 leading-none group-hover:text-indigo-600 transition-colors">Mirjalol S.</span>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Super Admin</span>
            </div>
            
            <div className="relative">
              <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-slate-100 to-slate-200 border-2 border-white flex items-center justify-center text-slate-700 transition-all group-hover:scale-110 group-hover:rotate-3 shadow-xl shadow-slate-200/50 group-hover:shadow-indigo-500/10 cursor-pointer overflow-hidden ring-1 ring-slate-200/60">
                <span className="text-xs font-black font-mono">MS</span>
              </div>
            </div>

            <button 
              onClick={handleLogout}
              className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all shadow-sm hover:shadow-rose-500/10 active:scale-95"
              title="Chiqish"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
