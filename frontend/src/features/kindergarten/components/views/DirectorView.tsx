import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ClipboardCheck, 
  Clock3,
  LayoutGrid,
  FlaskConical,
  AlertCircle,
  Utensils
} from 'lucide-react';
import { apiClient } from '@/shared/api';
import { OperationsLog } from '../../features/operations/components/OperationsLog';

const MEAL_LABELS: Record<string, string> = {
  BREAKFAST: 'Nonushta',
  LUNCH: 'Tushlik',
  TEA: 'Poldnik',
  DINNER: 'Kechki ovqat',
};

const MEAL_SHORTS: Record<string, string> = {
  BREAKFAST: 'NO',
  LUNCH: 'TU',
  TEA: 'PO',
  DINNER: 'KE',
};

const KPI_THEMES = {
  children: {
    from: '#eff6ff',
    via: '#ffffff',
    to: '#dbeafe',
    accent: '#2563eb',
    badgeBg: '#dbeafe',
    glow: 'rgba(37, 99, 235, 0.16)',
  },
  early: {
    from: '#ecfdf5',
    via: '#ffffff',
    to: '#bbf7d0',
    accent: '#059669',
    badgeBg: '#d1fae5',
    glow: 'rgba(5, 150, 105, 0.16)',
  },
  late: {
    from: '#fff7ed',
    via: '#ffffff',
    to: '#fed7aa',
    accent: '#d97706',
    badgeBg: '#ffedd5',
    glow: 'rgba(217, 119, 6, 0.18)',
  },
  groups: {
    from: '#ecfeff',
    via: '#ffffff',
    to: '#a5f3fc',
    accent: '#0891b2',
    badgeBg: '#cffafe',
    glow: 'rgba(8, 145, 178, 0.16)',
  },
};

const KPICard = ({ title, value, meta, icon: Icon, theme, detail, progress = 0, footer }: any) => {
  const normalizedProgress = Math.max(0, Math.min(100, Math.round(progress)));

  return (
    <div
      className="group relative min-h-[188px] overflow-hidden rounded-[1.35rem] border p-5 sm:p-6 transition-all duration-300 hover:-translate-y-1.5"
      style={{
        background: `
          radial-gradient(circle at 18% 14%, rgba(255,255,255,0.96), transparent 5.8rem),
          radial-gradient(circle at 92% 0%, ${theme.accent}24, transparent 8rem),
          linear-gradient(135deg, ${theme.from} 0%, ${theme.via} 46%, ${theme.to} 100%)
        `,
        borderColor: `${theme.accent}38`,
        boxShadow: `0 18px 44px ${theme.glow}, inset 0 1px 0 rgba(255,255,255,0.88)`,
      }}
    >
      <div
        className="pointer-events-none absolute -right-10 -top-12 h-40 w-40 rounded-full opacity-45 blur-2xl transition-transform duration-500 group-hover:scale-125"
        style={{ background: theme.accent }}
      />
      <div className="pointer-events-none absolute -left-16 bottom-0 h-24 w-44 rotate-[-18deg] rounded-full bg-white/55 blur-xl" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.18]" style={{ backgroundImage: 'radial-gradient(circle, rgba(15,23,42,0.28) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
      <div className="pointer-events-none absolute left-0 top-0 h-full w-1.5" style={{ background: `linear-gradient(180deg, ${theme.accent}, transparent)` }} />

      <div className="relative z-10 flex items-start justify-between gap-3 mb-4">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg ring-4 ring-white/70 transition-transform duration-300 group-hover:rotate-3 group-hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.accent}cc)`,
            boxShadow: `0 14px 26px ${theme.glow}`,
          }}
        >
          <Icon size={21} />
        </div>
        <div
          className="rounded-full border px-3 py-1.5 font-black text-[10px] sm:text-xs backdrop-blur-md"
          style={{
            backgroundColor: `${theme.badgeBg}cc`,
            borderColor: `${theme.accent}38`,
            color: theme.accent,
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
          }}
        >
          {meta}
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider mb-2" style={{ color: '#475569' }}>{title}</p>
        <div className="flex items-end justify-between gap-3">
          <h3 className="text-3xl sm:text-4xl font-black text-brand-depth font-sans tracking-tight leading-none">{value}</h3>
          <span className="rounded-full border bg-white/70 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest" style={{ borderColor: `${theme.accent}28`, color: theme.accent }}>
            {detail}
          </span>
        </div>

        <div className="mt-5 rounded-2xl border bg-white/62 p-3 backdrop-blur-md" style={{ borderColor: `${theme.accent}22` }}>
          <div className="mb-2 flex items-center justify-between gap-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-brand-muted">{footer}</span>
            <span className="text-[10px] font-black" style={{ color: theme.accent }}>{normalizedProgress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200/70">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${normalizedProgress}%`,
                background: `linear-gradient(90deg, ${theme.accent}, ${theme.accent}99)`,
                boxShadow: `0 0 18px ${theme.glow}`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const DirectorView: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [samples, setSamples] = useState<any[]>([]);
  const [menu, setMenu] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const today = new Date().toISOString().split('T')[0];
        const [statsRes, samplesRes, menuRes, groupsRes] = await Promise.all([
          apiClient.get('/attendance/today-stats'),
          apiClient.get('/lab/samples'),
          apiClient.get(`/menu/${today}`),
          apiClient.get('/groups')
        ]);
        setStats(statsRes.data);
        setSamples(samplesRes.data.slice(0, 5));
        setMenu(menuRes.data);
        setGroups(groupsRes.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const handleApproveMenu = async () => {
    try {
      await apiClient.post('/menus/approve-today');
      // Refresh stats
      const statsRes = await apiClient.get('/attendance/today-stats');
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    }
  };


  const beforeNineCount = Math.max((stats?.present || 0) - (stats?.late || 0), 0);
  const totalChildren = stats?.total || 0;
  const presentCount = stats?.present || 0;
  const lateCount = stats?.late || 0;
  const attendanceProgress = totalChildren ? (presentCount / totalChildren) * 100 : 0;
  const earlyProgress = totalChildren ? (beforeNineCount / totalChildren) * 100 : 0;
  const lateProgress = totalChildren ? (lateCount / totalChildren) * 100 : 0;
  const groupProgress = Math.min(100, groups.length * 12);

  return (
    <div className="space-y-5 sm:space-y-7 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KPICard title="Jami bolalar soni" value={totalChildren} meta="Ro'yxatda" icon={Users} theme={KPI_THEMES.children} detail={`${presentCount} keldi`} progress={attendanceProgress} footer="Bugungi davomat" />
        <KPICard title="09:30 gacha kelganlar" value={beforeNineCount} meta="Vaqtida" icon={ClipboardCheck} theme={KPI_THEMES.early} detail="erta" progress={earlyProgress} footer="Vaqtida kelish" />
        <KPICard title="09:30 dan keyin kelganlar" value={lateCount} meta="Kechikkan" icon={Clock3} theme={KPI_THEMES.late} detail="nazorat" progress={lateProgress} footer="Kechikish ulushi" />
        <KPICard title="Umumiy guruhlar" value={groups.length} meta="Faol guruhlar" icon={LayoutGrid} theme={KPI_THEMES.groups} detail="guruh" progress={groupProgress} footer="Guruh faolligi" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <div className="lg:col-span-8">
          <OperationsLog />
        </div>

        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          <div className="relative overflow-hidden bg-white/92 rounded-[1.5rem] p-5 sm:p-6 border border-emerald-100 shadow-[0_20px_52px_rgba(16,185,129,0.10)] backdrop-blur-md">
            <div className="pointer-events-none absolute -right-14 -top-14 h-36 w-36 rounded-full bg-emerald-200/55 blur-3xl" />
            <div className="relative z-10 flex justify-between items-center mb-4 sm:mb-6">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-emerald-600 mb-1">Kunlik taomnoma</p>
                <h4 className="font-sans font-black text-base sm:text-lg text-brand-depth">Bugungi Menu</h4>
              </div>
              <span className="px-3 py-1.5 bg-emerald-50 text-brand-primary text-[9px] sm:text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-100">Admin</span>
            </div>
            <div className="relative z-10 space-y-3">
              {menu.length === 0 ? (
                <div className="relative overflow-hidden py-8 text-center border-2 border-dashed border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-sky-50/55 rounded-2xl">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-500 shadow-sm border border-emerald-100">
                    <Utensils size={22} />
                  </div>
                  <p className="text-brand-muted text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Bugun uchun menu kiritilmagan</p>
                </div>
              ) : (
                menu.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gradient-to-br from-white to-emerald-50/45 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-[0_14px_30px_rgba(16,185,129,0.10)] transition-all">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.meal_name || 'Taom rasmi'} className="w-12 h-12 rounded-xl object-cover border border-white shadow-sm" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-brand-primary font-black text-[9px] sm:text-[10px] border border-emerald-100 shadow-sm">
                          {MEAL_SHORTS[item.meal_type] || 'OV'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-black text-brand-depth leading-snug break-words">{item.meal_name}</p>
                        <p className="text-[8px] sm:text-[9px] text-brand-muted uppercase font-bold tracking-tight">{item.calories} kkal - {MEAL_LABELS[item.meal_type] || item.meal_type}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="relative overflow-hidden bg-white/92 rounded-[1.5rem] p-5 sm:p-6 border border-sky-100 shadow-[0_20px_52px_rgba(14,165,233,0.10)] backdrop-blur-md">
            <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-sky-200/50 blur-3xl" />
            <div className="relative z-10 flex justify-between items-center mb-4 sm:mb-6">
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-sky-600 mb-1">Sifat nazorati</p>
                <h4 className="font-sans font-black text-base sm:text-lg text-brand-depth">Laboratoriya & Sinama</h4>
              </div>
              <span className="px-3 py-1.5 bg-sky-50 text-sky-700 text-[9px] sm:text-[10px] font-black rounded-full uppercase tracking-widest border border-sky-100">Analizlar</span>
            </div>
            <div className="relative z-10 space-y-4">
              {stats?.approved_recipes > 0 ? (
                <div className="bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 p-3 sm:p-4 rounded-2xl flex items-center gap-3 shadow-sm">
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-emerald-500/20 ring-4 ring-white/70">
                    <ClipboardCheck size={18} className="sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase">Ovqat retsepti</p>
                    <p className="text-xs sm:text-sm font-bold text-brand-depth">Tasdiqlangan</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gradient-to-br from-amber-50 to-white border border-amber-100 p-3 sm:p-4 rounded-2xl flex items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-amber-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-amber-500/20 ring-4 ring-white/70">
                      <AlertCircle size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-amber-600 uppercase">Ovqat retsepti</p>
                      <p className="text-xs sm:text-sm font-bold text-brand-depth">Tasdiqlanmagan</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleApproveMenu}
                    className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[9px] sm:text-[10px] font-black uppercase rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
                  >
                    Tasdiqlash
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {samples.length === 0 ? (
                  <div className="py-10 text-center border-2 border-dashed border-sky-100 bg-gradient-to-br from-sky-50/60 to-emerald-50/45 rounded-2xl">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-sky-500 shadow-sm border border-sky-100">
                      <FlaskConical size={22} />
                    </div>
                    <p className="text-brand-muted text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Analizlar mavjud emas</p>
                  </div>
                ) : (
                  samples.map((s, i) => (
                    <div key={i} className="p-3 sm:p-4 bg-gradient-to-br from-white to-sky-50/45 rounded-2xl border border-sky-100 hover:border-sky-200 transition-all group shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-bold text-brand-depth truncate">{s.dish_name}</p>
                          <p className="text-[8px] sm:text-[9px] text-brand-muted font-bold">{new Date(s.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded-lg text-[8px] sm:text-[9px] font-black uppercase border shrink-0 ${
                          s.risk_level === 'NORMAL' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 
                          s.risk_level === 'WARNING' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                          'bg-rose-50 text-rose-600 border-rose-100 animate-pulse'
                        }`}>
                          {s.risk_level === 'NORMAL' ? 'Toza' : s.risk_level}
                        </span>
                      </div>
                      
                      {s.test_results && (
                        <div className="grid grid-cols-3 gap-2 mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-slate-200">
                          <div className="text-center">
                            <p className="text-[7px] font-black text-brand-muted uppercase">pH</p>
                            <p className="text-[9px] sm:text-[10px] font-black text-brand-depth">{s.test_results.ph_level}</p>
                          </div>
                          <div className="text-center border-x border-slate-200">
                            <p className="text-[7px] font-black text-brand-muted uppercase">Bakteriya</p>
                            <p className={`text-[9px] sm:text-[10px] font-black ${s.test_results.bacterial_check === 'PASS' ? 'text-emerald-600' : 'text-rose-500'}`}>
                              {s.test_results.bacterial_check === 'PASS' ? 'OK' : 'XAVF'}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-[7px] font-black text-brand-muted uppercase">Organolep.</p>
                            <p className="text-[9px] sm:text-[10px] font-black text-emerald-600">OK</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50 to-sky-50 p-3 sm:p-4 rounded-2xl flex items-center gap-3 border border-emerald-100 mt-4 shadow-sm">
                 <div className="p-2 bg-white rounded-xl border border-emerald-100 text-brand-emerald shadow-sm shrink-0">
                   <FlaskConical size={16} className="sm:w-4 sm:h-4" />
                 </div>
                 <div className="flex-1 min-w-0">
                   <div className="flex justify-between items-center mb-1">
                     <p className="text-[10px] sm:text-xs font-bold text-brand-depth truncate">Namuna Olish</p>
                     <span className="text-[9px] sm:text-[10px] font-black text-brand-emerald">
                        {samples.length > 0 && menu.length > 0 ? Math.round((samples.length / menu.length) * 100) : 0}%
                     </span>
                   </div>
                   <div className="w-full bg-slate-200 h-1 sm:h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-brand-emerald h-full transition-all duration-1000" 
                        style={{ width: `${samples.length > 0 && menu.length > 0 ? Math.round((samples.length / menu.length) * 100) : 0}%` }}
                      ></div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DirectorView;

