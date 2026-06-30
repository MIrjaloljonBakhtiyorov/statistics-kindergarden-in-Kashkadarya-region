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
      <div className="bg-white text-black px-6 py-4 rounded-[1px] shadow-2xl flex items-center justify-between gap-4 border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-sm flex items-center justify-center bg-slate-100 border border-slate-200">
            <Bell className="h-6 w-6 text-black" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.45em] text-slate-500 mb-1">Bildirishnoma</p>
            <p className="text-sm font-semibold text-black leading-snug">“Afsuski, bu funksiya hozircha faol emas. Keyingi yangilanishda ko‘rsatiladi.”</p>
          </div>
        </div>
        <button 
          onClick={() => setShowNotification(false)}
          className="grid place-items-center w-10 h-10 rounded-sm bg-slate-50 border border-slate-200 text-black hover:bg-slate-100 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default Notification;
