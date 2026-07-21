import React from 'react';
import { ArrowLeft, Bell, CalendarDays, Clock, Menu, LogOut, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '@/shared/theme/theme';

interface TopbarProps {
  onMenuClick: () => void;
}

const notificationRegions = [
  { name: "Qoraqalpog'iston Respublikasi", type: "Respublika", slug: "qoraqalpogiston" },
  { name: "Andijon viloyati", type: "Viloyat", slug: "andijon" },
  { name: "Buxoro viloyati", type: "Viloyat", slug: "buxoro" },
  { name: "Farg'ona viloyati", type: "Viloyat", slug: "fargona" },
  { name: "Jizzax viloyati", type: "Viloyat", slug: "jizzax" },
  { name: "Xorazm viloyati", type: "Viloyat", slug: "xorazm" },
  { name: "Namangan viloyati", type: "Viloyat", slug: "namangan" },
  { name: "Navoiy viloyati", type: "Viloyat", slug: "navoiy" },
  { name: "Qashqadaryo viloyati", type: "Viloyat", slug: "qashqadaryo" },
  { name: "Samarqand viloyati", type: "Viloyat", slug: "samarqand" },
  { name: "Sirdaryo viloyati", type: "Viloyat", slug: "sirdaryo" },
  { name: "Surxondaryo viloyati", type: "Viloyat", slug: "surxondaryo" },
  { name: "Toshkent viloyati", type: "Viloyat", slug: "toshkent-viloyati" },
  { name: "Toshkent shahri", type: "Shahar", slug: "toshkent-shahri" },
];

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [time, setTime] = React.useState(new Date());
  const [isRegionNotificationsOpen, setIsRegionNotificationsOpen] = React.useState(false);

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
    <>
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

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsRegionNotificationsOpen((value) => !value)}
              className={[
                "p-3 rounded-2xl transition-all relative group shadow-sm hover:shadow-indigo-500/10 active:scale-95",
                isRegionNotificationsOpen
                  ? "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100 shadow-indigo-500/10"
                  : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-indigo-300"
              ].join(' ')}
              title="Hududlar"
            >
              <Bell size={22} />
              <span className="absolute right-2.5 top-2.5 h-3 w-3 rounded-full bg-rose-500 shadow-lg ring-4 ring-white"></span>
            </button>
          </div>
          
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
    {isRegionNotificationsOpen && (
      <>
        <button
          type="button"
          className="fixed inset-0 z-[119] cursor-default bg-transparent"
          aria-label="Hududlar oynasini yopish"
          onClick={() => setIsRegionNotificationsOpen(false)}
        />
        <motion.div
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 28 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          role="dialog"
          aria-modal="true"
          aria-label="Hududlar oynasi"
          className="fixed bottom-0 right-0 top-0 z-[120] flex w-full overflow-hidden rounded-[1px] border-l border-slate-200/80 bg-white p-3 shadow-[0_24px_80px_rgba(15,23,42,0.22)] sm:w-[520px]"
        >
          <div className="flex min-h-0 w-full flex-col">
            <div className="shrink-0 rounded-[1px] border border-slate-100 bg-white px-4 py-3 shadow-sm">
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setIsRegionNotificationsOpen(false)}
                  className="inline-flex w-fit items-center gap-2 rounded-[1px] border border-slate-200 bg-white px-3 py-2 text-[11px] font-black uppercase tracking-widest text-slate-600 shadow-sm transition-all hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  <ArrowLeft size={15} />
                  Qaytish
                </button>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">Viloyat statistikasi</p>
                    <h3 className="mt-1 text-sm font-black text-slate-950">Hududni tanlang</h3>
                    <p className="mt-1 text-[11px] font-bold text-slate-500">
                      14 ta hudud: viloyatlar, respublika va Toshkent shahri
                    </p>
                  </div>
                  <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-indigo-600 ring-1 ring-indigo-100">
                    14
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto px-0.5 pb-1 pr-1 custom-scrollbar">
              {notificationRegions.map((region) => {
                const isReady = region.slug === 'qashqadaryo';
                return (
                  <button
                    key={region.name}
                    type="button"
                    onClick={() => {
                      setIsRegionNotificationsOpen(false);
                      navigate(`/admin/region/${region.slug}`);
                    }}
                    className={[
                      "group flex w-full items-start gap-3 rounded-[1px] border px-3 py-3 text-left transition-all duration-200",
                      isReady
                        ? "border-indigo-200 bg-indigo-50/80 shadow-sm shadow-indigo-100"
                        : "border-slate-100 bg-white shadow-sm shadow-slate-100/70 hover:border-indigo-100 hover:bg-slate-50 hover:shadow-md"
                    ].join(' ')}
                  >
                    <div className={[
                      "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[1px] transition-colors",
                      isReady
                        ? "bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100"
                        : "bg-indigo-50 text-indigo-500 group-hover:bg-indigo-600 group-hover:text-white"
                    ].join(' ')}>
                      <MapPin size={15} />
                    </div>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-black leading-tight text-slate-950 group-hover:text-indigo-600">
                        {region.name}
                      </span>
                      <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-slate-400 ring-1 ring-slate-100">
                          {region.type}
                        </span>
                        <span className={isReady
                          ? "rounded-full bg-emerald-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-emerald-600 ring-1 ring-emerald-100"
                          : "rounded-full bg-amber-50 px-2 py-0.5 text-[8px] font-black uppercase tracking-widest text-amber-600 ring-1 ring-amber-100"
                        }>
                          {isReady ? "Ishlaydi" : "Tez kunda"}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </>
    )}
    </>
  );
};
