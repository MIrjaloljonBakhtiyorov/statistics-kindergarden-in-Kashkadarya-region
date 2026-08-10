import React from 'react';
import { 
  FileText, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle2, 
  Activity,
  Bell,
  User,
  MoreVertical
} from 'lucide-react';
import { motion } from 'framer-motion';

const KPI_THEMES = {
  blue: { from: '#eff6ff', to: '#dbeafe', accent: '#2563eb', soft: '#dbeafe', glow: 'rgba(37,99,235,0.15)' },
  rose: { from: '#fff1f2', to: '#fecdd3', accent: '#e11d48', soft: '#ffe4e6', glow: 'rgba(225,29,72,0.14)' },
  emerald: { from: '#ecfdf5', to: '#bbf7d0', accent: '#059669', soft: '#d1fae5', glow: 'rgba(5,150,105,0.14)' },
  violet: { from: '#f5f3ff', to: '#ddd6fe', accent: '#7c3aed', soft: '#ede9fe', glow: 'rgba(124,58,237,0.15)' },
};

const KPICard = ({ title, value, icon: Icon, theme, trend, helper }: { title: string, value: string | number, icon: any, theme: keyof typeof KPI_THEMES, trend?: string, helper?: string }) => {
  const tone = KPI_THEMES[theme];
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.01 }}
      className="relative min-h-[142px] overflow-hidden rounded-[1.35rem] border p-4 sm:p-5 transition-all"
      style={{
        background: `radial-gradient(circle at 88% 0%, ${tone.accent}24, transparent 8rem), linear-gradient(135deg, ${tone.from}, #fff 50%, ${tone.to})`,
        borderColor: `${tone.accent}30`,
        boxShadow: `0 18px 42px ${tone.glow}`,
      }}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full blur-2xl opacity-35" style={{ background: tone.accent }} />
      <div className="pointer-events-none absolute inset-0 opacity-[0.12]" style={{ backgroundImage: 'radial-gradient(circle, rgba(15,23,42,0.28) 1px, transparent 1px)', backgroundSize: '18px 18px' }} />
      <div className="relative z-10 flex justify-between items-start mb-4">
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-lg ring-4 ring-white/70"
          style={{ background: `linear-gradient(135deg, ${tone.accent}, ${tone.accent}cc)`, boxShadow: `0 14px 26px ${tone.glow}` }}
        >
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span
            className="rounded-full border px-3 py-1.5 text-[10px] font-black uppercase tracking-wider backdrop-blur"
            style={{ backgroundColor: `${tone.soft}cc`, borderColor: `${tone.accent}30`, color: tone.accent }}
          >
            {trend}
          </span>
        )}
      </div>
      <div className="relative z-10">
        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">{title}</p>
        <div className="flex items-end justify-between gap-3">
          <h3 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-none">{value}</h3>
          <span className="h-2 w-14 rounded-full opacity-80" style={{ background: `linear-gradient(90deg, ${tone.accent}, transparent)` }} />
        </div>
        {helper && <p className="mt-2 text-[9px] font-bold uppercase tracking-widest text-slate-400">{helper}</p>}
      </div>
    </motion.div>
  );
};

interface InspectorDashboardProps {
  onNewInspection: () => void;
  audits: any[];
}

export const InspectorDashboard: React.FC<InspectorDashboardProps> = ({ onNewInspection, audits = [] }) => {
  const totalAudits = audits.length;
  const passedAudits = audits.filter((audit) => String(audit.overall_result || '').toUpperCase() === 'PASS').length;
  const failedAudits = audits.filter((audit) => {
    const result = String(audit.overall_result || '').toUpperCase();
    return result === 'FAIL' || result === 'WARNING';
  }).length;
  const passRate = totalAudits > 0 ? Math.round((passedAudits / totalAudits) * 100) : 0;
  const qualityIndex = totalAudits > 0 ? ((passedAudits / totalAudits) * 5).toFixed(1) : '0.0';

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[1.5rem] border border-sky-100 bg-white/88 p-4 sm:p-5 shadow-[0_18px_44px_rgba(14,165,233,0.10)] backdrop-blur-md">
        <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-sky-200/45 blur-3xl" />
        <div className="pointer-events-none absolute bottom-0 left-1/3 h-32 w-72 rounded-full bg-violet-200/35 blur-3xl" />
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-sky-700 mb-2">
            <Activity size={13} /> Sifat nazorati
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight text-center lg:text-left">Audit & Inspeksiya Markazi</h1>
          <p className="text-slate-500 font-bold mt-1.5 flex items-center justify-center lg:justify-start gap-2">
            <Activity size={16} className="text-blue-600" />
            Mustaqil audit va sifat nazorati
          </p>
        </div>
        
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-3 sm:gap-4">
          <div className="relative hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Qidirish..." 
              className="pl-11 pr-4 py-2.5 bg-white/90 border border-sky-100 rounded-2xl w-64 outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-400 transition-all text-sm font-bold"
            />
          </div>
          <button className="p-2.5 bg-white/90 border border-sky-100 rounded-xl sm:rounded-2xl text-slate-600 hover:bg-sky-50 transition-all relative shadow-sm">
            <Bell size={18} className="sm:w-5 sm:h-5" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 sm:w-2 sm:h-2 bg-red-500 rounded-full border-2 border-white" />
          </button>
          <div className="flex items-center gap-2 sm:gap-3 pl-3 sm:pl-4 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <p className="text-xs sm:text-sm font-black text-slate-900">Jasur Akhmedov</p>
              <p className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">Bosh Inspektor</p>
            </div>
            <div className="w-10 h-10 bg-gradient-to-br from-sky-100 to-violet-100 rounded-xl sm:rounded-2xl flex items-center justify-center text-blue-600 border border-sky-100 shadow-sm">
              <User size={20} className="sm:w-6 sm:h-6" />
            </div>
          </div>
        </div>
      </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight">Dastlabki tahlil</h2>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNewInspection}
          className="w-full sm:w-auto bg-gradient-to-r from-sky-600 to-indigo-600 text-white px-6 sm:px-8 py-3 rounded-xl sm:rounded-[1.15rem] font-black text-xs sm:text-sm flex items-center justify-center gap-3 shadow-xl shadow-sky-600/20 transition-all"
        >
          <Plus size={18} className="sm:w-5 sm:h-5" /> YANGI INSPEKSIYA
        </motion.button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        <KPICard 
          title="Jami auditlar" 
          value={totalAudits} 
          icon={FileText} 
          theme="blue" 
          helper="umumiy nazorat"
        />
        <KPICard 
          title="Xatolar" 
          value={failedAudits} 
          icon={AlertTriangle} 
          theme="rose"
          helper="kamchiliklar"
        />
        <KPICard 
          title="Muvaffaqiyatli" 
          value={`${passRate}%`} 
          icon={CheckCircle2} 
          theme="emerald"
          helper="pass ko'rsatkichi"
        />
        <KPICard 
          title="Sifat indeksi" 
          value={`${qualityIndex}/5.0`} 
          icon={Activity} 
          theme="violet"
          helper="o'rtacha baho"
        />
      </div>

      {/* History Table */}
      <div className="bg-white/92 rounded-2xl sm:rounded-[2rem] border border-sky-100 shadow-[0_22px_58px_rgba(14,165,233,0.10)] overflow-hidden backdrop-blur-md">
        <div className="p-6 sm:p-8 border-b border-sky-100 bg-gradient-to-r from-white via-sky-50/55 to-violet-50/45 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-sky-100 to-blue-100 rounded-lg sm:rounded-xl flex items-center justify-center text-blue-600 border border-sky-100">
              <FileText size={16} className="sm:w-5 sm:h-5" />
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight">Inspeksiya tarixi</h3>
          </div>
          <button className="p-2 hover:bg-slate-50 rounded-lg transition-colors text-slate-400">
            <Filter size={18} className="sm:w-5 sm:h-5" />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/80 text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-wider border-b border-sky-100 whitespace-nowrap">
                <th className="px-6 sm:px-8 py-4 sm:py-5">ID & Kategoriya</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5">Natija</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5">Sana</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5 hidden md:table-cell">Mas’ul shaxs</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5">Holat</th>
                <th className="px-6 sm:px-8 py-4 sm:py-5 text-right">Amal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {audits.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-14 sm:py-16 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-3 rounded-[1.5rem] border border-dashed border-sky-100 bg-gradient-to-br from-sky-50/60 to-violet-50/50 p-8">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-2xl flex items-center justify-center text-sky-300 shadow-sm border border-sky-100">
                        <Search size={24} className="sm:w-8 sm:h-8" />
                      </div>
                      <p className="text-slate-700 font-black text-sm">Ma'lumotlar topilmadi</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Yangi inspeksiya yaratilgach shu yerda ko'rinadi</p>
                    </div>
                  </td>
                </tr>
              ) : (
                audits.map((a, i) => (
                  <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-slate-100 rounded-lg sm:rounded-xl flex items-center justify-center text-slate-600 group-hover:bg-blue-600 group-hover:text-white transition-all shrink-0">
                          <FileText size={16} className="sm:w-[18px] sm:h-[18px]" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-slate-900 text-xs sm:text-sm truncate">{a.inspection_id || a.id || '-'}</p>
                          <p className="text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider truncate">{a.inspection_type || 'Umumiy audit'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full shrink-0 ${a.overall_result === 'PASS' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        <span className={`text-[10px] sm:text-xs font-bold ${a.overall_result === 'PASS' ? 'text-emerald-600' : 'text-red-600'} whitespace-nowrap`}>
                          {a.overall_result === 'PASS' ? 'OK' : 'Xato'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                      <p className="text-[10px] sm:text-sm font-medium text-slate-600 whitespace-nowrap">{a.created_at?.split(' ')[0] || '-'}</p>
                    </td>
                    <td className="px-6 sm:px-8 py-4 sm:py-6 hidden md:table-cell">
                      <p className="text-sm font-bold text-slate-900 truncate">{a.created_by || '-'}</p>
                    </td>
                    <td className="px-6 sm:px-8 py-4 sm:py-6">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-[8px] sm:text-[10px] font-black uppercase tracking-wider whitespace-nowrap ${
                        a.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {a.status === 'COMPLETED' ? 'Yopilgan' : 'Faol'}
                      </span>
                    </td>
                    <td className="px-6 sm:px-8 py-4 sm:py-6 text-right">
                      <button className="w-7 h-7 sm:w-8 sm:h-8 inline-flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all">
                        <ChevronRight size={16} className="sm:w-[18px] sm:h-[18px]" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
