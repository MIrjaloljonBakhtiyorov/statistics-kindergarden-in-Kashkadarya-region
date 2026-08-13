import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, RefreshCcw, ArrowRightLeft, AlertOctagon,
  TrendingUp, Download, BrainCircuit, Filter, ChevronDown,
  Search, Calendar as CalendarIcon, MapPin, Building2,
  Info, ArrowUpRight, ArrowDownRight, MoreHorizontal,
  ChevronRight, ShieldCheck, X, Activity, Zap,
  FileBarChart, Layers, Target, AlertTriangle, Home, Building
} from 'lucide-react';
import { clsx } from 'clsx';

// --- TYPES ---

type ComplianceStatus = 'green' | 'blue' | 'yellow' | 'red';
type KindergartenType = 'all' | 'public' | 'private' | 'home';
type TimeRange = '1' | '3' | '7' | '15' | '30';

interface DayData {
  day: number;
  status: ComplianceStatus;
  label: string;
  icon: any;
  color: string;
  text: string;
  border: string;
  bgLight: string;
  reja: string;
  amalda: string;
  sabab: string;
  jarima: number;
}

// --- CONSTANTS ---

const DISTRICTS = [
  'Qarshi shahri', 'Qarshi tumani', 'Chiroqchi tumani', 'Dehqonobod tumani',
  'G‘uzor tumani', 'Kasbi tumani', 'Kitob tumani', 'Koson tumani',
  'Mirishkor tumani', 'Muborak tumani', 'Nishon tumani', 'Qamashi tumani',
  'Shahrisabz tumani', 'Yakkabog‘ tumani'
];

const COMPLIANCE_KPI = [
  { title: 'Oylik moslik', value: '88.4%', trend: '+2.1%', icon: ShieldCheck, color: 'text-indigo-200', bg: 'bg-indigo-500/10', border: 'border-indigo-400/25' },
  { title: 'Yashil kunlar', value: '19', trend: 'A' , icon: CheckCircle2, color: 'text-emerald-200', bg: 'bg-emerald-500/10', border: 'border-emerald-400/25' },
  { title: 'Ko‘k (Almashgan)', value: '5', trend: 'B', icon: RefreshCcw, color: 'text-blue-200', bg: 'bg-blue-500/10', border: 'border-blue-400/25' },
  { title: 'Sariq (Ingredient)', value: '4', trend: 'C', icon: ArrowRightLeft, color: 'text-amber-200', bg: 'bg-amber-500/10', border: 'border-amber-400/25' },
  { title: 'Qizil (Xato)', value: '3', trend: 'D', icon: AlertOctagon, color: 'text-rose-200', bg: 'bg-rose-500/10', border: 'border-rose-400/25' },
];

COMPLIANCE_KPI[2].value = '4';

const SHARP_GREEN_DAYS = [5, 9, 21];

const CALENDAR_DATA: DayData[] = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  let status: ComplianceStatus = 'green';
  if ([5, 12, 19, 25, 28].includes(day)) status = 'blue';
  if ([8, 15, 22, 29].includes(day)) status = 'yellow';
  if ([10, 18, 27].includes(day)) status = 'red';
  if (SHARP_GREEN_DAYS.includes(day)) status = 'green';

  const details = {
    green: { label: 'To‘liq moslik', icon: CheckCircle2, color: 'bg-emerald-500', text: 'text-emerald-200', border: 'border-emerald-400/30', bgLight: 'bg-emerald-500/10' },
    blue: { label: 'O‘rin almashgan', icon: RefreshCcw, color: 'bg-blue-500', text: 'text-blue-200', border: 'border-blue-400/30', bgLight: 'bg-blue-500/10' },
    yellow: { label: 'Mahsulot almashgan', icon: ArrowRightLeft, color: 'bg-amber-500', text: 'text-amber-200', border: 'border-amber-400/30', bgLight: 'bg-amber-500/10' },
    red: { label: 'Qoidabuzarlik', icon: AlertOctagon, color: 'bg-rose-500', text: 'text-rose-200', border: 'border-rose-400/30', bgLight: 'bg-rose-500/10' },
  };

  return {
    day,
    status,
    ...details[status],
    ...(SHARP_GREEN_DAYS.includes(day) ? {
      color: 'bg-green-600',
      text: 'text-green-200',
      border: 'border-green-400/40',
      bgLight: 'bg-green-500/15',
    } : {}),
    reja: 'Mol go‘shtli palov, vitaminli salat, mevali choy',
    amalda: status === 'red' ? 'Moshxo‘rda, Non, Shakarli choy' : (status === 'yellow' ? 'Baliq (Go‘sht o‘rniga), Salat' : 'Mol go‘shtli palov, vitaminli salat, mevali choy'),
    sabab: status === 'red' ? 'Go‘sht mahsuloti yetib kelmagan' : (status === 'yellow' ? 'Tovuq go‘shti zaxirasi tugagan' : '-'),
    jarima: status === 'red' ? -15 : (status === 'yellow' ? -5 : (status === 'blue' ? -2 : 0))
  };
});

const DISTRICT_RANKING = DISTRICTS.map(name => ({
  name,
  mtts: Math.floor(Math.random() * 100) + 50,
  compliance: Math.floor(Math.random() * 20) + 75,
  green: Math.floor(Math.random() * 15) + 10,
  red: Math.floor(Math.random() * 5),
  rating: (Math.random() * 2 + 7.5).toFixed(1),
  status: 'Faol'
})).sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));

const surfaceClass = 'border border-white/10 bg-[#111615] shadow-[0_20px_55px_rgba(0,0,0,0.24)]';
const inputClass = 'border border-white/10 bg-[#0b1110] text-white placeholder:text-slate-500 focus:outline-none focus:ring-4 focus:ring-emerald-500/10';

// --- COMPONENTS ---

const Tooltip: React.FC<{ data: DayData }> = ({ data }) => (
  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-64 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-all scale-95 group-hover:scale-100 origin-bottom">
    <div className="flex justify-between items-start mb-2">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{data.day}-kun</span>
      <span className={clsx("text-[9px] font-black uppercase px-2 py-0.5 rounded-full", data.color, "text-white")}>{data.label}</span>
    </div>
    <div className="space-y-2">
      <div>
        <p className="text-[9px] font-bold text-slate-500 uppercase">Reja:</p>
        <p className="text-xs font-medium truncate">{data.reja}</p>
      </div>
      <div>
        <p className="text-[9px] font-bold text-slate-500 uppercase">Amalda:</p>
        <p className={clsx("text-xs font-bold truncate", data.status === 'red' ? 'text-rose-400' : 'text-emerald-400')}>{data.amalda}</p>
      </div>
    </div>
    <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
  </div>
);

const DayCard: React.FC<{ data: DayData, onClick: () => void }> = ({ data, onClick }) => {
  return (
    <div className="relative group">
      <motion.div
        whileHover={{ y: -8, scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className={clsx(
          "relative aspect-[4/5] rounded-[28px] border flex flex-col items-center justify-center cursor-pointer transition-all duration-300 p-4 overflow-hidden shadow-[0_16px_36px_rgba(0,0,0,0.18)] group",
          data.bgLight, data.border, "hover:bg-white/10 hover:border-white/20"
        )}
      >
        <div className="absolute top-4 left-5 text-sm font-black text-white">{data.day}</div>
        <div className={clsx("w-10 h-10 rounded-2xl flex items-center justify-center mb-3", data.color)}>
          <data.icon size={22} className="text-white" />
        </div>
        <div className="text-[10px] font-black uppercase tracking-tighter text-center leading-tight text-white">
          {data.label}
        </div>
      </motion.div>
      <Tooltip data={data} />
    </div>
  );
};

export const MenuStatistics = () => {
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState('Barcha tumanlar');
  const [kgType, setKgType] = useState<KindergartenType>('all');
  const [timeRange, setTimeRange] = useState<TimeRange>('30');

  // Faqat bitta filtr ochiq bo'lishi uchun yagona holat
  const [activeDropdown, setActiveDropdown] = useState<'district' | 'type' | 'range' | null>(null);

  const toggleDropdown = (dropdown: 'district' | 'type' | 'range') => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  return (
    <div className="min-h-screen bg-[#08100f] pb-20 font-sans text-white selection:bg-emerald-400 selection:text-slate-950">

      {/* 🧭 PREMIUM HEADER */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b1110]/90 backdrop-blur-2xl">
        <div className="max-w-[1700px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-8">
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="relative group shrink-0">
               <div className="relative w-10 h-10 sm:w-14 sm:h-14 bg-[#111615] rounded-lg sm:rounded-2xl flex items-center justify-center border border-white/10">
                 <FileBarChart className="text-indigo-300 sm:w-7 sm:h-7" size={20} />
               </div>
            </div>
            <div>
              <h1 className="text-lg sm:text-3xl font-black tracking-tight text-white leading-none">Menyu Statistikasi</h1>
              <p className="text-[9px] sm:text-[12px] font-bold text-slate-300 uppercase tracking-[0.1em] mt-1 sm:mt-2 flex items-center gap-1.5 sm:gap-2">
                <Target size={12} className="text-emerald-300 sm:w-3.5 sm:h-3.5" /> Taomnoma muvofiqligi markazi
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-4 w-full lg:w-auto">
             {/* FILTERS */}
             <div className="flex items-center bg-[#111615] p-1 rounded-xl sm:rounded-2xl border border-white/10 relative overflow-hidden">
                {/* District Filter */}
                <div className="relative flex-1 sm:flex-none">
                  <button
                    onClick={() => toggleDropdown('district')}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#0b1110] rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black text-white border border-white/10 hover:bg-white/10 transition-all w-full sm:min-w-[140px] justify-between whitespace-nowrap"
                  >
                    <span className="flex items-center gap-1.5 sm:gap-2 truncate"><MapPin size={14} className="text-emerald-300" /> {selectedDistrict}</span>
                    <ChevronDown size={12} className={clsx("opacity-50 transition-transform", activeDropdown === 'district' && "rotate-180")} />
                  </button>
                </div>

                {/* Type Filter */}
                <div className="relative flex-1 sm:flex-none">
                  <button
                    onClick={() => toggleDropdown('type')}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold text-slate-300 hover:text-white transition-all w-full sm:min-w-[120px] justify-between whitespace-nowrap"
                  >
                    <span className="flex items-center gap-1.5 sm:gap-2 truncate">
                      {kgType === 'all' ? <Layers size={14} /> : <Building size={14} />}
                      {kgType === 'all' ? 'Barcha' : kgType}
                    </span>
                    <ChevronDown size={12} className={clsx("opacity-50 transition-transform", activeDropdown === 'type' && "rotate-180")} />
                  </button>
                </div>
             </div>

            <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-700 text-white rounded-xl text-[10px] sm:text-xs font-black transition-all active:scale-95 group whitespace-nowrap">
              <BrainCircuit size={16} className="group-hover:rotate-12 transition-transform" /> AI TAHLIL
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-10 space-y-8 sm:space-y-12">

        {/* 📊 KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-6">
          {COMPLIANCE_KPI.map((kpi, idx) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              key={kpi.title}
              className={clsx(
                "bg-[#111615] p-4 sm:p-7 rounded-2xl sm:rounded-[32px] border border-white/10 shadow-[0_18px_45px_rgba(0,0,0,0.18)] hover:border-emerald-400/30 transition-all group relative overflow-hidden"
              )}
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-3 sm:mb-4">
                  <div className={clsx("w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 border", kpi.bg, kpi.color, kpi.border)}>
                    <kpi.icon size={18} className="sm:w-6 sm:h-6" strokeWidth={2.5} />
                  </div>
                  <div className="flex items-center text-emerald-500">
                    <TrendingUp size={10} className="mr-1" />
                    <span className="text-[8px] sm:text-[10px] font-bold">{kpi.trend}</span>
                  </div>
                </div>
                <p className="text-[8px] sm:text-[10px] font-black text-slate-300 uppercase tracking-widest mb-0.5 sm:mb-1 truncate">{kpi.title}</p>
                <div className="flex items-baseline gap-1 sm:gap-2">
                  <h3 className="text-lg sm:text-2xl font-black text-white tracking-tight">{kpi.value}</h3>
                  <span className="text-[8px] sm:text-[10px] font-bold text-slate-400">/ {timeRange}k</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 🗓️ MAIN GRID: HEATMAP + INSIGHTS */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 sm:gap-10">
           <div className="xl:col-span-8 space-y-6 sm:space-y-8">
              <div className={`p-5 sm:p-10 rounded-2xl sm:rounded-[36px] ${surfaceClass}`}>
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 sm:mb-10 gap-4 sm:gap-6">
                   <div>
                      <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">{timeRange} kunlik muvofiqlik kalendari</h2>
                      <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-1.5">
                         <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-200 rounded-full text-[8px] sm:text-[9px] font-black uppercase ring-1 ring-indigo-400/20">
                           May 2026
                         </span>
                         <span className="text-[10px] sm:text-xs font-bold text-slate-300 uppercase tracking-widest truncate">{selectedDistrict}</span>
                      </div>
                   </div>

                   <div className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 bg-[#0b1110] rounded-xl sm:rounded-2xl border border-white/10 overflow-x-auto no-scrollbar w-full md:w-auto">
                      {[
                        { label: 'Mos', color: 'bg-emerald-500' },
                        { label: 'O‘zgargan', color: 'bg-blue-500' },
                        { label: 'Xato', color: 'bg-rose-500' }
                      ].map(item => (
                         <div key={item.label} className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                            <div className={clsx("w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full", item.color)} />
                            <span className="text-[8px] sm:text-[9px] font-black uppercase text-slate-200">{item.label}</span>
                         </div>
                      ))}
                   </div>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 sm:gap-6">
                   {CALENDAR_DATA.slice(0, parseInt(timeRange)).map(day => (
                      <DayCard key={day.day} data={day} onClick={() => setSelectedDay(day)} />
                   ))}
                </div>
              </div>
           </div>

           <div className="xl:col-span-4 space-y-8">
              <div className="bg-[#0b1110] p-8 rounded-[36px] text-white border border-white/10 shadow-[0_20px_55px_rgba(0,0,0,0.28)] relative overflow-hidden h-full">
                 <div className="relative z-10 space-y-8">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/10">
                          <Zap size={24} className="text-indigo-400" />
                       </div>
                       <h2 className="text-xl font-black">AI Tahlil</h2>
                    </div>

                    <div className="space-y-4">
                       {[
                         { title: 'Tizimli muammo', text: `${selectedDistrict} hududida ta'minot kechikishi kuzatilmoqda.`, icon: AlertTriangle, color: 'text-amber-400' },
                         { title: 'Reyting', text: 'Sizning hududingiz viloyatda 3-o‘rinda turibdi.', icon: Target, color: 'text-emerald-400' },
                       ].map((insight, i) => (
                          <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-3xl backdrop-blur-xl">
                             <div className="flex items-start gap-3">
                                <insight.icon size={18} className={clsx("mt-1 shrink-0", insight.color)} />
                                <div>
                                   <h4 className={clsx("text-[10px] font-black uppercase mb-1", insight.color)}>{insight.title}</h4>
                                   <p className="text-xs font-medium text-slate-300 leading-relaxed">{insight.text}</p>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>

                    <div className="pt-6 border-t border-white/10">
                        <p className="text-[10px] font-black uppercase text-slate-500 mb-4 tracking-widest text-center">Hududiy taqqoslash</p>
                        <div className="space-y-4">
                           {DISTRICT_RANKING.slice(0, 3).map(d => (
                              <div key={d.name} className="flex items-center justify-between">
                                 <span className="text-xs font-bold text-slate-300">{d.name}</span>
                                 <span className="text-xs font-black text-white">{d.compliance}%</span>
                              </div>
                           ))}
                        </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* 🏆 DISTRICT PERFORMANCE TABLE */}
        <div className={`rounded-[36px] overflow-hidden ${surfaceClass}`}>
           <div className="p-10 border-b border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div>
                 <h2 className="text-2xl font-black text-white tracking-tight">Tumanlar Reytingi</h2>
                 <p className="text-[10px] font-bold text-slate-300 mt-1 uppercase tracking-widest">KPI-based Performance Ranking</p>
              </div>
              <div className="relative">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input type="text" placeholder="Tuman qidirish..." className={`pl-12 pr-6 py-3 rounded-2xl text-xs font-bold w-72 transition-all ${inputClass}`} />
              </div>
           </div>

           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead>
                    <tr className="bg-[#0b1110] text-[10px] font-black text-slate-300 uppercase tracking-widest">
                       <th className="px-10 py-6">Tuman nomi</th>
                       <th className="px-6 py-6 text-center">MTT soni</th>
                       <th className="px-6 py-6">Moslik %</th>
                       <th className="px-6 py-6 text-center">Yashil</th>
                       <th className="px-6 py-6 text-center">Qizil</th>
                       <th className="px-6 py-6 text-center">Reyting</th>
                       <th className="px-10 py-6 text-right">Amal</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-white/10">
                    {DISTRICT_RANKING.map((district, i) => (
                       <tr key={i} className="hover:bg-white/[0.025] transition-colors group">
                          <td className="px-10 py-6">
                             <span className="font-black text-white text-sm">{district.name}</span>
                          </td>
                          <td className="px-6 py-6 text-center">
                             <span className="px-3 py-1 bg-white/5 rounded-lg text-[11px] font-bold text-slate-200 ring-1 ring-white/10">{district.mtts} ta</span>
                          </td>
                          <td className="px-6 py-6">
                             <div className="flex items-center gap-3">
                                <span className="text-xs font-black text-white w-8">{district.compliance}%</span>
                                <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                   <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${district.compliance}%` }} />
                                </div>
                             </div>
                          </td>
                          <td className="px-6 py-6 text-center font-black text-emerald-300 text-xs">{district.green}</td>
                          <td className="px-6 py-6 text-center font-black text-rose-300 text-xs">{district.red}</td>
                          <td className="px-6 py-6 text-center">
                             <div className="inline-flex w-10 h-10 rounded-full border border-indigo-400/25 items-center justify-center text-[11px] font-black text-indigo-200 bg-indigo-500/10">
                                {district.rating}
                             </div>
                          </td>
                          <td className="px-10 py-6 text-right">
                             <button className="text-emerald-300 font-black text-[10px] uppercase tracking-widest hover:underline">
                                BATAFFIL
                             </button>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

      </main>

      {/* MODAL */}
      <AnimatePresence>
         {selectedDay && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
               <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedDay(null)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
               <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-[#111615] w-full max-w-2xl rounded-[36px] shadow-2xl relative z-10 overflow-hidden p-10 border border-white/10 text-white">
                  <div className="flex justify-between items-start mb-8">
                     <div className={clsx("w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-xl", selectedDay.color)}>
                        <selectedDay.icon size={32} />
                     </div>
                     <button onClick={() => setSelectedDay(null)} className="p-3 bg-[#0b1110] rounded-2xl hover:bg-white/10 transition-colors border border-white/10 text-white"><X size={20} /></button>
                  </div>
                  <h2 className="text-3xl font-black mb-2 text-white">{selectedDay.day}-aprel Hisoboti</h2>
                  <p className="text-slate-300 font-medium mb-8 uppercase tracking-widest text-[10px]">{selectedDay.label} • {selectedDistrict}</p>

                  <div className="space-y-6">
                     <div className="p-6 bg-[#0b1110] rounded-3xl space-y-4 border border-white/10">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Menyu rejasi:</p>
                        <p className="text-sm font-bold text-white">{selectedDay.reja}</p>
                     </div>
                     <div className="p-6 bg-indigo-500/10 border border-indigo-400/20 rounded-3xl space-y-4">
                        <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest">Amalda bajarildi:</p>
                        <p className="text-sm font-bold text-white">{selectedDay.amalda}</p>
                     </div>
                  </div>

                  <button className="w-full mt-10 py-5 bg-emerald-600 text-white rounded-[24px] font-black text-[11px] uppercase tracking-widest hover:bg-emerald-500 transition-colors">PDF Hisobotni yuklash</button>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

    </div>
  );
};
