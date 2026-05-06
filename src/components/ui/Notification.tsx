import React from 'react';
import { Bell, X } from 'lucide-react';

interface NotificationProps {
  showNotification: boolean;
  setShowNotification: (show: boolean) => void;
}

const Notification: React.FC<NotificationProps> = ({ showNotification, setShowNotification }) => {
  if (!showNotification) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[999] w-[calc(100%-2rem)] max-w-md">
      <div className="bg-slate-950/95 text-white px-6 py-4 rounded-[2.5rem] shadow-2xl shadow-slate-950/40 flex items-center justify-between gap-4 border border-white/10 ring-1 ring-white/10 backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-3xl flex items-center justify-center bg-gradient-to-br from-violet-500 via-indigo-500 to-fuchsia-500 shadow-lg shadow-fuchsia-500/20">
            <Bell className="h-6 w-6 text-white animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.45em] text-slate-300 mb-1">Bildirishnoma</p>
            <p className="text-sm font-semibold text-white leading-snug">“Afsuski, bu funksiya hozircha faol emas. Keyingi yangilanishda ko‘rsatiladi.”</p>
          </div>
        </div>
        <button 
          onClick={() => setShowNotification(false)}
          className="grid place-items-center w-10 h-10 rounded-2xl bg-white/10 border border-white/10 text-white hover:bg-white/15 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Notification;
