import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ClipboardCheck, 
  Clock3,
  LayoutGrid,
  FlaskConical,
  AlertCircle
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

const KPICard = ({ title, value, meta, icon: Icon, color }: any) => (
  <div className="bg-white/95 p-5 sm:p-6 rounded-2xl border border-emerald-100 shadow-[0_18px_45px_rgba(6,78,59,0.06)] hover:shadow-[0_22px_60px_rgba(6,78,59,0.10)] transition-all duration-300">
    <div className="flex items-start justify-between mb-3 sm:mb-4">
      <div className={`p-2.5 sm:p-3 rounded-xl ${color} bg-opacity-10 ring-1 ring-inset ring-emerald-100`}>
        <Icon className={`${color.replace('bg-', 'text-')} sm:w-5 sm:h-5`} size={18} />
      </div>
      <div className="rounded-full bg-emerald-50 px-2.5 py-1 font-bold text-[10px] sm:text-xs text-brand-emerald border border-emerald-100">
        {meta}
      </div>
    </div>
    <p className="text-brand-muted text-[10px] sm:text-[11px] font-bold uppercase tracking-wider mb-2">{title}</p>
    <div className="flex items-baseline gap-2">
      <h3 className="text-2xl sm:text-3xl font-black text-brand-depth font-sans tracking-tight">{value}</h3>
    </div>
  </div>
);

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

  return (
    <div className="space-y-5 sm:space-y-7 animate-in fade-in slide-in-from-bottom-2 duration-700">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KPICard title="Jami bolalar soni" value={stats?.total || 0} meta="Ro'yxatda" icon={Users} color="bg-brand-primary" />
        <KPICard title="09:30 gacha kelganlar" value={beforeNineCount} meta="Vaqtida" icon={ClipboardCheck} color="bg-brand-emerald" />
        <KPICard title="09:30 dan keyin kelganlar" value={stats?.late || 0} meta="Kechikkan" icon={Clock3} color="bg-brand-amber" />
        <KPICard title="Umumiy guruhlar" value={groups.length} meta="Faol guruhlar" icon={LayoutGrid} color="bg-brand-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <div className="lg:col-span-8">
          <OperationsLog />
        </div>

        <div className="lg:col-span-4 space-y-4 sm:space-y-6">
          <div className="bg-white/95 rounded-2xl p-5 sm:p-6 border border-emerald-100 shadow-[0_18px_45px_rgba(6,78,59,0.06)]">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h4 className="font-sans font-bold text-sm sm:text-base">Bugungi Menu</h4>
              <span className="px-2 py-1 bg-brand-primary/10 text-brand-primary text-[9px] sm:text-[10px] font-bold rounded-full uppercase tracking-tighter">Admin</span>
            </div>
            <div className="space-y-3">
              {menu.length === 0 ? (
                <div className="py-8 text-center text-brand-muted text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border-2 border-dashed border-emerald-100 bg-emerald-50/30 rounded-2xl">
                  Bugun uchun menu kiritilmagan
                </div>
              ) : (
                menu.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2 sm:gap-3">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.meal_name || 'Taom rasmi'} className="w-10 h-10 rounded-lg object-cover border border-brand-border" />
                      ) : (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-white flex items-center justify-center text-brand-primary font-bold text-[9px] sm:text-[10px] border border-brand-border">
                          {MEAL_SHORTS[item.meal_type] || 'OV'}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-brand-depth truncate">{item.meal_name}</p>
                        <p className="text-[8px] sm:text-[9px] text-brand-muted uppercase font-bold tracking-tight">{item.calories} kkal - {MEAL_LABELS[item.meal_type] || item.meal_type}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white/95 rounded-2xl p-5 sm:p-6 border border-emerald-100 shadow-[0_18px_45px_rgba(6,78,59,0.06)]">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h4 className="font-sans font-bold text-sm sm:text-base">Laboratoriya & Sinama</h4>
              <span className="px-2 py-1 bg-brand-emerald/10 text-brand-emerald text-[9px] sm:text-[10px] font-bold rounded-full uppercase tracking-tighter">Analizlar</span>
            </div>
            <div className="space-y-4">
              {stats?.approved_recipes > 0 ? (
                <div className="bg-emerald-50 border border-emerald-100 p-3 sm:p-4 rounded-xl flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
                    <ClipboardCheck size={18} className="sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase">Ovqat retsepti</p>
                    <p className="text-xs sm:text-sm font-bold text-brand-depth">Tasdiqlangan</p>
                  </div>
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-100 p-3 sm:p-4 rounded-2xl flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-amber-500 flex items-center justify-center text-white shrink-0">
                      <AlertCircle size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-amber-600 uppercase">Ovqat retsepti</p>
                      <p className="text-xs sm:text-sm font-bold text-brand-depth">Tasdiqlanmagan</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleApproveMenu}
                    className="px-2.5 py-1 sm:px-3 sm:py-1.5 bg-brand-primary text-white text-[9px] sm:text-[10px] font-black uppercase rounded-lg hover:bg-brand-primary-dark transition-colors shadow-lg shadow-brand-primary/20"
                  >
                    Tasdiqlash
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {samples.length === 0 ? (
                  <div className="py-10 text-center text-brand-muted text-[9px] sm:text-[10px] font-bold uppercase tracking-widest border-2 border-dashed border-emerald-100 bg-emerald-50/30 rounded-2xl">
                    Analizlar mavjud emas
                  </div>
                ) : (
                  samples.map((s, i) => (
                    <div key={i} className="p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-brand-primary/20 transition-all group">
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
              
              <div className="bg-emerald-50/60 p-3 sm:p-4 rounded-2xl flex items-center gap-3 border border-emerald-100 mt-4">
                 <div className="p-1.5 sm:p-2 bg-white rounded-lg border border-brand-border text-brand-emerald shadow-sm shrink-0">
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

