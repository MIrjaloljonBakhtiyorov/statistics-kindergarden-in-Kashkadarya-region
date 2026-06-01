import React from 'react';
import { Bell, CalendarDays, Clock, Menu, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/shared/theme/theme';

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
      const { signOut } = await import('firebase/auth');
      const { auth } = await import('../../services/firebase');
      await signOut(auth);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const pad = (value: number) => String(value).padStart(2, '0');
  const monthNames = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
  const weekdayNames = ['yakshanba', 'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba'];
  const formattedTime = `${pad(time.getHours())}:${pad(time.getMinutes())}`;
  const formattedSeconds = pad(time.getSeconds());
  const formattedDate = `${pad(time.getDate())} ${monthNames[time.getMonth()]}, ${weekdayNames[time.getDay()]}`;
  const formattedYear = time.getFullYear();

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
          <span className="max-w-[210px] text-[10px] font-black leading-4 text-indigo-600 sm:max-w-[280px] lg:max-w-none">
            Bu qism dasturchi tomonidan ishlab chiqilyapti
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4 sm:gap-8 shrink-0">
        <div className="hidden xl:flex items-center gap-3 rounded-[1.4rem] border border-slate-200/70 bg-white/80 px-3.5 py-2.5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] ring-1 ring-white/70 backdrop-blur-xl dark:border-slate-700/70 dark:bg-slate-900/80 dark:ring-white/5">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/25">
            <Clock size={18} />
            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-400 dark:border-slate-900" />
          </div>
          <div className="min-w-[150px]">
            <div className="flex items-end gap-1.5 leading-none text-slate-950 dark:text-white">
              <span className="text-2xl font-black tabular-nums tracking-tight">{formattedTime}</span>
              <span className="pb-0.5 text-[11px] font-black tabular-nums text-indigo-500">:{formattedSeconds}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-slate-400">
              <CalendarDays size={11} className="text-indigo-400" />
              <span>{formattedDate}</span>
              <span className="text-slate-300">/</span>
              <span>{formattedYear}</span>
            </div>
          </div>
        </div>

        <div className="h-10 w-[1px] bg-slate-200/60 hidden sm:block"></div>

        <div className="flex items-center gap-4 sm:gap-6">
          <ThemeToggle className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all relative group shadow-sm hover:shadow-indigo-500/10 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-300" />

          <button
            onClick={() => navigate('/admin/alerts')}
            className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-2xl transition-all relative group shadow-sm hover:shadow-indigo-500/10 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-300"
            title="Alertlar"
          >
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
