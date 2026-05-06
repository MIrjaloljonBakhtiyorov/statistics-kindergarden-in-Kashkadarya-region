import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, TrendingDown, MapPin, Sparkles, Zap, ShieldCheck, Target, 
  ArrowUpRight, TrendingUp, Activity, Filter, Search, Download, 
  BrainCircuit, ChevronDown, AlertOctagon, Info, AlertTriangle, 
  Building2, Home, ArrowRightLeft, FileBarChart, ChevronRight
} from 'lucide-react';
import { clsx } from 'clsx';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, 
  Cell, PieChart, Pie, LineChart, Line, CartesianGrid 
} from 'recharts';

// --- MOCK DATA ---

const KPI_DATA = [
  { title: "Oylik o'rtacha ball", value: "100", trend: "0.1", type: "score", icon: Activity, color: "text-indigo-600", bg: "bg-indigo-50", sparkline: [100, 100, 100, 100, 100] },
  { title: "TOP 20 bog'chalar", value: "1", trend: "0", type: "neutral", icon: Trophy, color: "text-emerald-600", bg: "bg-emerald-50", sparkline: [1, 1, 1, 1, 1] },
  { title: "Kritik bog'chalar", value: "0", trend: "0", type: "danger", icon: TrendingDown, color: "text-rose-600", bg: "bg-rose-50", sparkline: [0, 0, 0, 0, 0] },
  { title: "Gigiyena xatolari", value: "0", trend: "0", type: "danger", icon: Sparkles, color: "text-amber-600", bg: "bg-amber-50", sparkline: [0, 0, 0, 0, 0] },
  { title: "Taomnoma xatolari", value: "0", trend: "0", type: "success", icon: Target, color: "text-blue-600", bg: "bg-blue-50", sparkline: [0, 0, 0, 0, 0] },
  { title: "Operatsion xatolar", value: "0", trend: "0", type: "success", icon: ShieldCheck, color: "text-purple-600", bg: "bg-purple-50", sparkline: [0, 0, 0, 0, 0] },
];

const TOP_20_DATA: any[] = [
  { rank: 1, name: 'Namuna MTT', district: 'Qarshi sh.', type: 'Davlat', score: 100, penalty: 0, violations: 0, status: 'Excellent', reward: 'Mukofotga tavsiya' }
];

const DISTRICT_PERFORMANCE = [
  { name: 'Qarshi sh.', score: 100, violations: 0 },
  { name: 'Qarshi t.', score: 100, violations: 0 },
  { name: 'Chiroqchi', score: 100, violations: 0 },
  { name: 'Dehqonobod', score: 100, violations: 0 },
  { name: 'G‘uzor', score: 100, violations: 0 },
  { name: 'Kasbi', score: 100, violations: 0 },
  { name: 'Kitob', score: 100, violations: 0 },
  { name: 'Koson', score: 100, violations: 0 },
  { name: 'Mirishkor', score: 100, violations: 0 },
  { name: 'Muborak', score: 100, violations: 0 },
  { name: 'Nishon', score: 100, violations: 0 },
  { name: 'Qamashi', score: 100, violations: 0 },
  { name: 'Shahrisabz', score: 100, violations: 0 },
  { name: 'Yakkabog‘', score: 100, violations: 0 },
];

const VIOLATION_PIE = [
  { name: 'Ma\'lumot yo\'q', value: 100, color: '#e2e8f0' },
];

const CRITICAL_ALERTS: any[] = [];

const MONTHLY_TREND = [
  { day: '1', score: 100 }
];

// --- COMPONENTS ---

const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    'Excellent': 'bg-emerald-50 text-emerald-600 border-emerald-200',
    'Good': 'bg-amber-50 text-amber-600 border-amber-200',
    'Warning': 'bg-orange-50 text-orange-600 border-orange-200',
    'Critical': 'bg-rose-50 text-rose-600 border-rose-200'
  };
  return (
    <span className={clsx("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", colors[status] || colors.Warning)}>
      {status}
    </span>
  );
};

export const RatingAudit = () => {
  const [activeTab, setActiveTab] = useState<'All' | 'Davlat' | 'Xususiy' | 'Oilaviy'>('All');
  const [selectedDistrict, setSelectedDistrict] = useState('Barcha tumanlar');
  const [selectedType, setSelectedType] = useState('Barcha turlari');
  const [activeDropdown, setActiveDropdown] = useState<'district' | 'type' | 'status' | null>(null);

  const DISTRICTS = [
    'Qarshi shahri', 'Qarshi tumani', 'Chiroqchi tumani', 'Dehqonobod tumani', 
    'G‘uzor tumani', 'Kasbi tumani', 'Kitob tumani', 'Koson tumani', 
    'Mirishkor tumani', 'Muborak tumani', 'Nishon tumani', 'Qamashi tumani', 
    'Shahrisabz tumani', 'Yakkabog‘ tumani'
  ];
  const TYPES = ['Davlat', 'Xususiy', 'Oilaviy'];

  const toggleDropdown = (dropdown: 'district' | 'type' | 'status') => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const filteredTop = activeTab === 'All' ? TOP_20_DATA.slice(0, 10) : TOP_20_DATA.filter(t => t.type === activeTab).slice(0, 10);

  return (
    <div className="min-h-screen bg-[#FDFEFF] pb-20 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* 🧭 PREMIUM HEADER */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-2xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="relative group shrink-0">
               <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl sm:rounded-2xl blur opacity-25"></div>
               <div className="relative w-10 h-10 sm:w-14 sm:h-14 bg-white rounded-lg sm:rounded-2xl flex items-center justify-center shadow-xl border border-slate-100">
                 <Trophy className="text-indigo-600 sm:w-6 sm:h-6" size={20} />
               </div>
            </div>
            <div>
              <h1 className="text-base sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 leading-none">Reyting va Audit</h1>
              <p className="text-[8px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1 sm:mt-1.5 flex items-center gap-1.5 sm:gap-2">
                <Target size={10} className="text-indigo-500 sm:w-3 sm:h-3" /> Joriy oy monitoringi
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
             {/* FILTERS */}
             <div className="flex items-center bg-slate-100/50 p-1 rounded-xl sm:rounded-2xl border border-slate-200/50 w-full sm:w-auto gap-1">
                <div className="relative flex-1 sm:flex-none">
                  <button 
                    onClick={() => toggleDropdown('district')}
                    className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white rounded-lg sm:rounded-xl text-[9px] sm:text-[11px] font-black text-slate-700 shadow-sm border border-slate-200/50 hover:bg-slate-50 transition-all w-full sm:min-w-[120px] justify-between whitespace-nowrap"
                  >
                    <span className="truncate">{selectedDistrict}</span>
                    <ChevronDown size={12} className={clsx("opacity-50 transition-transform", activeDropdown === 'district' && "rotate-180")} />
                  </button>
                  <AnimatePresence>
                    {activeDropdown === 'district' && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 w-48 sm:w-56 bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 p-1 sm:p-2"
                      >
                        <div className="max-h-48 sm:max-h-60 overflow-y-auto custom-scrollbar">
                           <button onClick={() => { setSelectedDistrict('Barcha tumanlar'); setActiveDropdown(null); }} className="w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold text-slate-600 hover:bg-indigo-50 rounded-lg transition-all uppercase">Barcha tumanlar</button>
                           {DISTRICTS.map(d => (
                             <button key={d} onClick={() => { setSelectedDistrict(d); setActiveDropdown(null); }} className="w-full text-left px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold text-slate-600 hover:bg-indigo-50 rounded-lg transition-all uppercase">{d}</button>
                           ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="relative flex-1 sm:flex-none">
                  <button 
                    onClick={() => toggleDropdown('type')}
                    className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-[9px] sm:text-[11px] font-bold text-slate-500 hover:text-indigo-600 transition-all w-full sm:min-w-[100px] justify-between whitespace-nowrap"
                  >
                    <span className="truncate">{selectedType}</span>
                    <ChevronDown size={12} className={clsx("opacity-50 transition-transform", activeDropdown === 'type' && "rotate-180")} />
                  </button>
                </div>
             </div>
            
            <div className="relative flex-1 sm:w-40 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input type="text" placeholder="Qidirish..." className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-white border border-slate-200/60 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-sm" />
            </div>

            <div className="flex items-center gap-2 shrink-0">
               <button className="p-2 sm:p-2.5 bg-white border border-slate-200 rounded-lg sm:rounded-xl text-slate-600 hover:text-indigo-600 shadow-sm"><Download size={16} className="sm:w-[18px] sm:h-[18px]" /></button>
               <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2.5 bg-indigo-600 text-white rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                 XULOSA
               </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-10 space-y-6 sm:space-y-10">

        {/* ℹ️ MONTHLY RESET INFO */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-5 bg-indigo-50/50 border border-indigo-100 rounded-xl sm:rounded-3xl">
           <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0"><Info size={16} className="sm:w-[18px] sm:h-[18px]" /></div>
           <p className="text-[10px] sm:text-xs font-medium text-slate-600 leading-relaxed">
             <span className="font-black text-slate-900 block sm:inline mr-1">Oylik Reyting:</span> Har oy boshida barcha bog'chalar reytingi <span className="font-bold text-indigo-600">100 balldan</span> qayta boshlanadi.
           </p>
        </motion.div>

        {/* 📏 SCORING METHODOLOGY */}
        <div className="space-y-4 sm:space-y-6">
           <div className="flex items-center gap-3 px-1 sm:px-2">
              <h3 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">Ballar metodikasi</h3>
           </div>
           
           <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-2 sm:gap-4">
              {[
                { label: 'Taomnoma', penalty: '-20', color: 'indigo' },
                { label: 'Gigiyena', penalty: '-15', color: 'amber' },
                { label: 'Sanitariya', penalty: '-10', color: 'emerald' },
                { label: 'Operatsion', penalty: '-5', color: 'purple' },
                { label: 'Davomat', penalty: '-20', color: 'rose' },
                { label: 'Foto-dalil', penalty: '-5', color: 'blue' },
              ].map((item, i) => (
                <motion.div key={i} whileHover={{ y: -3 }} className="bg-white p-3 sm:p-5 rounded-xl sm:rounded-[24px] border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center">
                   <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 sm:mb-2">{item.label}</p>
                   <span className="text-sm sm:text-lg font-black text-rose-600 bg-rose-50 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full">{item.penalty}</span>
                </motion.div>
              ))}
           </div>
        </div>
        
        {/* 📊 KPI CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-6">
          {KPI_DATA.map((kpi, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
              key={idx} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[32px] border border-slate-100 shadow-sm hover:shadow-xl transition-all relative overflow-hidden group"
            >
              <div className="flex justify-between items-start mb-4 sm:mb-6 relative z-10">
                <div className={clsx("w-8 h-8 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl flex items-center justify-center shadow-inner shrink-0", kpi.bg, kpi.color)}>
                  <kpi.icon size={16} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
                </div>
                <div className="text-[7px] sm:text-[9px] font-black px-1.5 sm:px-2 py-0.5 sm:py-1 bg-slate-50 text-slate-500 rounded-md sm:rounded-lg">Trend {kpi.trend}%</div>
              </div>
              <div className="relative z-10">
                <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1 truncate">{kpi.title}</p>
                <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">{kpi.value}</h3>
              </div>
            </motion.div>
          ))}
        </div>

        {/* 🗓️ MAIN LAYOUT */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-10">
           
           <div className="xl:col-span-8 space-y-6 sm:space-y-10">
              
              {/* SECTION 1: TOP 20 TABLE */}
              <div className="bg-white rounded-2xl sm:rounded-[48px] border border-slate-100 shadow-xl shadow-slate-200/10 overflow-hidden flex flex-col">
                 <div className="p-4 sm:p-10 border-b border-slate-50 flex items-center justify-between">
                    <h2 className="text-base sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2 sm:gap-3">
                       <Trophy className="text-amber-500 sm:w-6 sm:h-6" size={18} /> TOP Reyting
                    </h2>
                    <button className="text-[8px] sm:text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">Barchasi</button>
                 </div>

                 <div className="overflow-x-auto">
                    <div className="min-w-[600px]">
                      <table className="w-full text-left border-collapse">
                         <thead>
                            <tr className="bg-slate-50/50 text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] sm:tracking-[0.2em] border-b border-slate-100">
                               <th className="px-4 sm:px-8 py-3 sm:py-5">O'rin</th>
                               <th className="px-4 sm:px-6 py-3 sm:py-5">Nomi</th>
                               <th className="px-4 sm:px-6 py-3 sm:py-5 text-center">Ball</th>
                               <th className="px-4 sm:px-6 py-3 sm:py-5 text-center">Status</th>
                               <th className="px-4 sm:px-6 py-3 sm:py-5">Tavsiya</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-50">
                            {TOP_20_DATA.map((row, i) => (
                               <tr key={i} className="hover:bg-indigo-50/30 transition-colors group">
                                  <td className="px-4 sm:px-8 py-3 sm:py-4"><div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-slate-50 flex items-center justify-center font-black text-[10px] sm:text-xs text-slate-400">#{row.rank}</div></td>
                                  <td className="px-4 sm:px-6 py-3 sm:py-4">
                                     <p className="font-black text-slate-900 text-[11px] sm:text-xs">{row.name}</p>
                                     <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase mt-0.5">{row.district}</p>
                                  </td>
                                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                                     <span className="text-sm sm:text-base font-black text-slate-900">{row.score}</span>
                                  </td>
                                  <td className="px-4 sm:px-6 py-3 sm:py-4 text-center"><StatusBadge status={row.status} /></td>
                                  <td className="px-4 sm:px-6 py-3 sm:py-4 whitespace-nowrap"><span className="text-[8px] sm:text-[9px] font-black uppercase text-emerald-600 tracking-wider">{row.reward}</span></td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                    </div>
                 </div>
              </div>

              {/* CHARTS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                 <div className="bg-white rounded-2xl sm:rounded-[40px] border border-slate-100 p-4 sm:p-8">
                    <h3 className="text-[10px] sm:text-sm font-black text-slate-900 mb-4 sm:mb-6 uppercase tracking-wider">Tumanlar balli</h3>
                    <div className="h-[200px] sm:h-[250px]">
                       <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={DISTRICT_PERFORMANCE} layout="vertical">
                             <XAxis type="number" domain={[0, 100]} hide />
                             <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 8, fontWeight: 900, fill: '#64748b' }} width={60} />
                             <RechartsTooltip cursor={{ fill: '#f8fafc' }} />
                             <Bar dataKey="score" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={16} />
                          </BarChart>
                       </ResponsiveContainer>
                    </div>
                 </div>

                 <div className="bg-white rounded-2xl sm:rounded-[40px] border border-slate-100 p-4 sm:p-8">
                    <h3 className="text-[10px] sm:text-sm font-black text-slate-900 mb-4 sm:mb-6 uppercase tracking-wider">Xatolar taqsimoti</h3>
                    <div className="h-[200px] sm:h-[250px] relative">
                       <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                             <Pie data={VIOLATION_PIE} cx="50%" cy="50%" innerRadius={40} sm:innerRadius={50} outerRadius={60} sm:outerRadius={70} paddingAngle={4} dataKey="value">
                                {VIOLATION_PIE.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                             </Pie>
                          </PieChart>
                       </ResponsiveContainer>
                       <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                          <span className="text-base sm:text-xl font-black text-slate-900">100%</span>
                       </div>
                    </div>
                 </div>
              </div>

           </div>

           <div className="xl:col-span-4 space-y-6 sm:space-y-10">
              <div className="bg-slate-950 p-6 sm:p-10 rounded-2xl sm:rounded-[48px] text-white shadow-2xl relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-indigo-600/10 blur-[60px] sm:blur-[80px] rounded-full" />
                 <div className="relative z-10">
                    <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                       <div className="w-10 h-10 sm:w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-2xl border border-white/10 shrink-0"><BrainCircuit size={20} className="text-indigo-300 sm:w-6 sm:h-6" /></div>
                       <h2 className="text-base sm:text-xl font-black tracking-tight">AI Audit</h2>
                    </div>

                    <div className="p-4 sm:p-6 bg-white/5 border border-white/10 rounded-xl sm:rounded-[28px] mb-6 sm:mb-8">
                       <p className="text-[11px] sm:text-sm font-medium leading-relaxed text-slate-300 italic">
                          "Tizimda ma'lumotlar kutilmoqda. Ma'lumotlar kiritilgandan so'ng AI avtomatik tahlil va tavsiyalar beradi."
                       </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                       <button className="py-2.5 sm:py-3.5 bg-indigo-600 text-white rounded-lg sm:rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-indigo-500 transition-all">Hisobot</button>
                       <button className="py-2.5 sm:py-3.5 bg-white/10 text-white border border-white/20 rounded-lg sm:rounded-xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all">Audit</button>
                    </div>
                 </div>
              </div>

              <div className="space-y-4 sm:space-y-6">
                 <h3 className="text-base sm:text-lg font-black text-slate-900 px-1 sm:px-2 uppercase tracking-wider flex items-center gap-2"><AlertTriangle size={18} className="text-rose-500 sm:w-5 sm:h-5" /> Ogohlantirishlar</h3>
                 <div className="p-5 sm:p-6 bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-3xl text-center">
                    <p className="text-[9px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest">Hozircha xabarlar yo'q</p>
                 </div>
              </div>
           </div>
        </div>

      </main>
    </div>
  );
};
