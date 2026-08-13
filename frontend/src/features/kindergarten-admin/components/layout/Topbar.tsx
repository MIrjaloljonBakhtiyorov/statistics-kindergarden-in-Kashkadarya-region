import React from 'react';
import { ArrowLeft, Bell, CalendarDays, Clock, Menu, LogOut, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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
  const formattedDate = `${pad(time.getDate())} ${monthNames[time.getMonth()]}, ${weekdayNames[time.getDay()]}`.toUpperCase();
  const formattedYear = time.getFullYear();

  return (
    <>
    <div className="h-[77px] shrink-0" />
    <div className="fixed left-1.5 right-1.5 top-1.5 z-[80] bg-[#0b0f10] pb-2 lg:left-[292px] lg:right-2">
    <header className="h-[62px] w-full rounded-[2.9px] border border-[#2a2a2d] bg-[#151515] px-4 text-white shadow-[0_18px_44px_rgba(0,0,0,0.18)]">
      <div className="flex h-full min-w-0 items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3 sm:gap-5 overflow-hidden">
        <button
          onClick={onMenuClick}
          className="lg:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-[2.9px] border border-white/10 bg-white/[0.035] text-slate-200 transition-all hover:bg-white/[0.075] active:scale-95"
          aria-label="Menyuni ochish"
        >
          <Menu size={19} />
        </button>

        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[2.9px] border border-white/10 bg-white/[0.035] text-emerald-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
            <Clock size={16} />
          </div>
          <div className="flex min-w-0 items-baseline gap-1.5 leading-none">
            <span className="text-[18px] font-black tabular-nums tracking-normal text-white sm:text-[19px]">{formattedTime}</span>
            <span className="text-[10px] font-black tabular-nums text-emerald-400">:{formattedSeconds}</span>
          </div>
          <div className="hidden h-8 w-px bg-white/10 sm:block" />
          <div className="hidden min-w-0 items-center gap-2 sm:flex">
            <CalendarDays size={14} className="shrink-0 text-emerald-400" />
            <div className="min-w-0 truncate text-[11px] font-black uppercase tracking-normal text-slate-200">
              <span>{formattedDate}</span>
              <span className="ml-2 text-[10px] text-slate-500">{formattedYear}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3 sm:gap-5">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsRegionNotificationsOpen((value) => !value)}
              className={[
                "relative flex h-11 w-11 items-center justify-center rounded-[2.9px] border border-white/10 bg-white/[0.035] text-slate-200 transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] hover:bg-white/[0.075] active:scale-95",
                isRegionNotificationsOpen
                  ? "text-emerald-300 ring-1 ring-emerald-400/30"
                  : "hover:text-white"
              ].join(' ')}
              title="Hududlar"
            >
              <Bell size={18} />
              <span className="absolute right-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_14px_rgba(244,63,94,0.9)] ring-2 ring-[#151515]"></span>
            </button>
          </div>

          <div className="hidden h-8 w-px bg-white/10 md:block" />

          <div className="flex items-center gap-3 group">
            <div className="hidden items-center gap-6 md:flex select-none">
              <span className="text-[13px] font-black uppercase leading-none tracking-normal text-slate-100">Mister Italiano</span>
              <span className="text-[9px] font-black uppercase leading-none tracking-[0.34em] text-emerald-400">Super Admin</span>
            </div>

            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-[2.9px] border border-white/10 bg-white/[0.035] text-slate-100 transition-all group-hover:bg-white/[0.075] cursor-pointer shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                <span className="text-[11px] font-black uppercase">MI</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex h-10 w-10 items-center justify-center rounded-[2.9px] border border-white/10 bg-white/[0.035] text-slate-200 transition-all hover:bg-white/[0.075] hover:text-rose-300 active:scale-95"
              title="Chiqish"
            >
              <LogOut size={18} />
            </button>
          </div>
      </div>
      </div>
    </header>
    </div>
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
          className="fixed bottom-0 right-0 top-0 z-[120] flex w-full overflow-hidden rounded-[1px] border-l border-white/10 bg-[#121719] p-3 shadow-[0_24px_80px_rgba(0,0,0,0.42)] sm:w-[520px]"
        >
          <div className="flex min-h-0 w-full flex-col">
            <div className="shrink-0 rounded-[1px] border border-white/10 bg-[#181b1c] px-4 py-3 shadow-sm">
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => setIsRegionNotificationsOpen(false)}
                  className="inline-flex w-fit items-center gap-2 rounded-[1px] border border-white/10 bg-[#202425] px-3 py-2 text-[11px] font-black uppercase tracking-widest text-slate-200 shadow-sm transition-all hover:border-emerald-400/40 hover:bg-white/10 hover:text-white"
                >
                  <ArrowLeft size={15} />
                  Qaytish
                </button>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-[9px] font-black uppercase tracking-[0.25em] text-slate-400">Viloyat statistikasi</p>
                    <h3 className="mt-1 text-sm font-black text-white">Hududni tanlang</h3>
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
                        ? "border-emerald-400/25 bg-emerald-500/10 shadow-sm"
                        : "border-white/10 bg-[#181b1c] shadow-sm hover:border-emerald-400/25 hover:bg-white/5 hover:shadow-md"
                    ].join(' ')}
                  >
                    <div className={[
                      "mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-[1px] transition-colors",
                      isReady
                        ? "bg-emerald-500/15 text-emerald-300 shadow-sm ring-1 ring-emerald-400/20"
                        : "bg-white/5 text-emerald-300 group-hover:bg-emerald-500/15 group-hover:text-emerald-200"
                    ].join(' ')}>
                      <MapPin size={15} />
                    </div>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[12px] font-black leading-tight text-white group-hover:text-emerald-200">
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
