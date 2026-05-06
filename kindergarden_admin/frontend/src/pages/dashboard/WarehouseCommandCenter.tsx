import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, TrendingUp, TrendingDown, AlertTriangle, DollarSign, 
  MapPin, Calendar, Download, Search, Filter, Box, ArrowUpRight, 
  ArrowDownRight, ArrowRightLeft, User, Activity, Zap, BarChart3,
  PieChart as PieChartIcon, BrainCircuit, ShieldAlert, Scale,
  ChevronDown, RefreshCcw, Bell, CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts';
import { clsx } from 'clsx';

// --- MOCK DATA ---

const DISTRICTS = [
  'Qarshi shahri', 'Qarshi tumani', 'Shahrisabz shahri', 'Shahrisabz tumani', 
  'Kitob tumani', 'Koson tumani', 'Muborak tumani', 'G‘uzor tumani', 
  'Nishon tumani', 'Dehqonobod tumani', 'Qamashi tumani', 'Chiroqchi tumani', 'Kasbi tumani'
];

const KPI_DATA = [
  { title: 'Umumiy mahsulotlar', value: '1', unit: 'tonna', trend: '0.1%', isPositive: true, icon: Package, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { title: 'Sarf qilingan', value: '0.5', unit: 'tonna', trend: '0.1%', isPositive: true, icon: ArrowDownRight, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { title: 'Kirim', value: '1', unit: 'tonna', trend: '0.1%', isPositive: true, icon: ArrowUpRight, color: 'text-blue-600', bg: 'bg-blue-50' },
  { title: 'Chiqim', value: '0.5', unit: 'tonna', trend: '0.1%', isPositive: true, icon: ArrowRightLeft, color: 'text-violet-600', bg: 'bg-violet-50' },
  { title: 'Riskdagi mahsulotlar', value: '1', unit: 'tur', trend: '0', isPositive: true, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
  { title: 'Umumiy qiymat', value: '1', unit: 'mln so‘m', trend: '0.1%', isPositive: true, icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-50' },
];

const PRODUCTS = [
  { name: 'Namuna mahsulot', total: 100, used: 10, unit: 'kg', status: 'normal' },
];

const TRANSACTIONS: any[] = [
  { id: 'TRX-001', date: '2026-05-01 09:00', product: 'Namuna', district: 'Qarshi sh.', amount: '10 kg', type: 'Kirim', user: 'Admin' }
];

const TREND_DATA = [
  { name: 'May-1', kirim: 1, chiqim: 0.5 },
];

const PIE_DATA = [
  { name: 'Namuna', value: 1, color: '#6366f1' },
];

const DISTRICT_USAGE = [
  { name: 'Namuna', norma: 1, real: 1 },
];

// --- COMPONENTS ---

const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'normal') return <span className="px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-md text-[10px] font-black uppercase tracking-widest">Normal</span>;
  if (status === 'warning') return <span className="px-2 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-md text-[10px] font-black uppercase tracking-widest">O'rtacha</span>;
  return <span className="px-2 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-md text-[10px] font-black uppercase tracking-widest">Kam qolgan</span>;
};

export const WarehouseCommandCenter = () => {
  const [role, setRole] = useState<'super' | 'tuman' | 'bogcha'>('super');
  const [timeFilter, setTimeFilter] = useState('7 kun');

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      {/* 🧭 HEADER - GLASSMORPHISM */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 shrink-0">
              <Box className="text-white sm:w-6 sm:h-6" size={20} />
            </div>
            <div>
              <h1 className="text-base sm:text-2xl font-black tracking-tight text-slate-900 leading-none">Ombor Markazi</h1>
              <p className="text-[8px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-[0.1em] mt-1 sm:mt-1.5">Viloyat va tumanlar nazorati</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
            {/* Role Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 w-full xs:w-auto overflow-x-auto no-scrollbar">
               {['super', 'tuman', 'bogcha'].map(r => (
                  <button 
                    key={r}
                    onClick={() => setRole(r as any)}
                    className={clsx(
                       "flex-1 xs:flex-none px-3 sm:px-4 py-1.5 sm:py-2 text-[8px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap",
                       role === r ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                     {r}
                  </button>
               ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 w-full xs:w-auto">
              <button className="flex-1 xs:flex-none flex items-center justify-between gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] sm:text-xs font-bold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all shadow-sm whitespace-nowrap">
                <span className="flex items-center gap-1.5 sm:gap-2"><MapPin size={12} className="text-indigo-500 sm:w-3.5 sm:h-3.5" /> Tumanlar</span> <ChevronDown size={12} className="opacity-50 sm:w-3.5 sm:h-3.5" />
              </button>
              
              <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm flex-1 xs:flex-none overflow-x-auto no-scrollbar">
                 {['1 kun', '7 kun', '15 kun', '30 kun'].map(t => (
                    <button 
                      key={t}
                      onClick={() => setTimeFilter(t)}
                      className={clsx(
                         "flex-1 px-2.5 sm:px-3 py-1 sm:py-1.5 text-[8px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap",
                         timeFilter === t ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50"
                      )}
                    >
                       {t}
                    </button>
                 ))}
              </div>
            </div>
            
            <button className="flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] sm:text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
              <Download size={14} className="text-slate-400" /> <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-10 space-y-6 sm:space-y-8">
        
        {/* 📊 SECTION 1: KPI CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-5">
          {KPI_DATA.map((kpi, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={kpi.title} 
              className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="flex justify-between items-start mb-3 sm:mb-4 relative z-10">
                <div className={clsx("w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shadow-inner shrink-0", kpi.bg, kpi.color)}>
                  <kpi.icon size={16} className="sm:w-[18px] sm:h-[18px]" strokeWidth={2.5} />
                </div>
                <span className={clsx(
                  "flex items-center gap-1 text-[7px] sm:text-[9px] font-black tracking-wider px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md",
                  kpi.isPositive ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                )}>
                  {kpi.trend}
                </span>
              </div>
              <div className="relative z-10">
                <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1 truncate">{kpi.title}</p>
                <div className="flex items-baseline gap-1 sm:gap-1.5">
                   <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">{kpi.value}</h3>
                   <span className="text-[8px] sm:text-[10px] font-bold text-slate-500">{kpi.unit}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
          
          {/* LEFT & CENTER COLUMN (Main Content) */}
          <div className="xl:col-span-2 space-y-6 sm:space-y-8">
             
             {/* 📦 SECTION 1 - MAHSULOTLAR GRID */}
             <div className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-slate-200 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                   <div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Real-time Omborxona Holati</h2>
                      <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Mavjud va sarflangan mahsulotlar ulushi</p>
                   </div>
                   <button className="w-full sm:w-auto text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2">
                      Barchasini ko'rish <ArrowRightLeft size={14} />
                   </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                   {PRODUCTS.map(product => {
                      const percentage = product.total > 0 ? (product.used / product.total) * 100 : 0;
                      return (
                         <div key={product.name} className="p-5 sm:p-6 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all group">
                            <div className="flex justify-between items-start mb-4">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-700 border border-slate-100">
                                     <Package size={18} />
                                  </div>
                                  <div>
                                     <h3 className="font-black text-slate-900 text-sm">{product.name}</h3>
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.total} {product.unit} jami</p>
                                  </div>
                               </div>
                               <StatusBadge status={product.status} />
                            </div>

                            <div className="space-y-2.5">
                               <div className="flex justify-between text-[11px] font-bold">
                                  <span className="text-slate-500">Sarflandi: <span className="text-slate-900">{product.used}</span></span>
                                  <span className="text-slate-500">Qoldi: <span className="text-indigo-600">{product.total - product.used}</span></span>
                               </div>
                               <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                                  <div 
                                    className={clsx(
                                       "h-full rounded-full transition-all duration-1000",
                                       percentage > 90 ? "bg-rose-500" : percentage > 70 ? "bg-amber-500" : "bg-emerald-500"
                                    )}
                                    style={{ width: `${percentage}%` }}
                                  />
                               </div>
                            </div>
                         </div>
                      )
                   })}
                </div>
             </div>

             {/* 🔄 SECTION 2 — KIRIM / CHIQIM TRACKING */}
             <div className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                   <div>
                      <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Tranzaksiyalar Jurnali</h2>
                      <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Monitoring jurnali</p>
                   </div>
                   <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:flex-none">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                         <input type="text" placeholder="Qidirish..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                      </div>
                      <button className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-100 shrink-0">
                         <Filter size={16} />
                      </button>
                   </div>
                </div>

                <div className="overflow-x-auto -mx-6 sm:mx-0">
                   <div className="min-w-[600px] px-6 sm:px-0">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              <th className="pb-4 pl-4">ID</th>
                              <th className="pb-4">Sana</th>
                              <th className="pb-4">Mahsulot</th>
                              <th className="pb-4">Tuman</th>
                              <th className="pb-4">Miqdor</th>
                              <th className="pb-4">Tur</th>
                              <th className="pb-4 pr-4 text-right">Mas'ul</th>
                           </tr>
                        </thead>
                        <tbody className="text-sm font-medium">
                           {TRANSACTIONS.map((trx, i) => (
                              <tr key={trx.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                 <td className="py-4 pl-4 font-bold text-indigo-600 text-[11px]">{trx.id}</td>
                                 <td className="py-4 text-slate-500 text-[11px]">{trx.date}</td>
                                 <td className="py-4 font-black text-slate-900 text-xs">{trx.product}</td>
                                 <td className="py-4 text-slate-600 text-xs">{trx.district}</td>
                                 <td className="py-4 font-black text-xs">{trx.amount}</td>
                                 <td className="py-4">
                                    <span className={clsx(
                                       "px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider",
                                       trx.type === 'Kirim' ? "bg-emerald-50 text-emerald-600 border border-emerald-100" :
                                       trx.type === 'Chiqim' ? "bg-rose-50 text-rose-600 border border-rose-100" :
                                       "bg-blue-50 text-blue-600 border border-blue-100"
                                    )}>
                                       {trx.type}
                                    </span>
                                 </td>
                                 <td className="py-4 pr-4 text-right">
                                    <span className="text-[11px] font-bold text-slate-700">{trx.user}</span>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                   </div>
                </div>
             </div>

             {/* 📊 SECTION 4 — CHARTS */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                {/* Bar Chart */}
                <div className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-slate-200 shadow-sm">
                   <h3 className="text-xs sm:text-sm font-black text-slate-900 mb-6 uppercase tracking-wider">Tumanlar bo'yicha sarf</h3>
                   <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                         <BarChart data={DISTRICT_USAGE}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 800 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 800 }} />
                            <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            <Bar dataKey="real" name="Real Sarf" fill="#6366f1" radius={[4, 4, 0, 0]} />
                         </BarChart>
                      </ResponsiveContainer>
                   </div>
                </div>

                {/* Area Chart */}
                <div className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-slate-200 shadow-sm">
                   <h3 className="text-xs sm:text-sm font-black text-slate-900 mb-6 uppercase tracking-wider">Dinamika</h3>
                   <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={TREND_DATA}>
                            <defs>
                              <linearGradient id="colorKirim" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 800 }} />
                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#64748b', fontWeight: 800 }} />
                            <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                            <Area type="monotone" dataKey="kirim" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorKirim)" />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>
                </div>
             </div>

          </div>

          {/* RIGHT COLUMN (AI & Analytics) */}
          <div className="space-y-8">
             
             {/* 🧠 SECTION 6 — AI ANALYTICS PANEL */}
             <div className="bg-slate-900 p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[80px] rounded-full" />
                
                <div className="relative z-10">
                   <div className="flex items-center gap-3 mb-8">
                      <div className="w-11 h-11 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                         <BrainCircuit size={20} className="text-indigo-300" />
                      </div>
                      <div>
                         <h2 className="text-lg sm:text-xl font-black tracking-tight">AI Analitika</h2>
                         <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mt-1">Smart Monitor</p>
                      </div>
                   </div>

                   <div className="space-y-4">
                      {/* Alert 1 */}
                      <div className="bg-white/5 border border-white/10 p-5 rounded-2xl hover:bg-white/10 transition-all">
                         <div className="flex items-start gap-3">
                            <ShieldAlert className="text-slate-400 mt-0.5 shrink-0" size={16} />
                            <div>
                               <p className="text-sm font-black leading-snug text-slate-300">Ogohlantirishlar mavjud emas.</p>
                               <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-wider">Tizim holati: Barqaror</p>
                            </div>
                         </div>
                      </div>
                   </div>

                   <button className="w-full mt-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
                      To'liq tahlil
                   </button>
                </div>
             </div>

             {/* 🔮 SECTION 8 — FORECAST */}
             <div className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-slate-200 shadow-sm">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wider">
                   <Zap className="text-amber-500" size={16} /> Kelgusi prognoz
                </h3>
                
                <div className="space-y-4">
                   <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-md transition-all">
                      <div className="flex items-center gap-3">
                         <div className="w-9 h-9 bg-white rounded-xl shadow-sm flex items-center justify-center text-lg">📦</div>
                         <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ehtiyoj</p>
                            <p className="text-base sm:text-lg font-black text-slate-900">0 tonna</p>
                         </div>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2.5 py-1 rounded-lg tracking-tighter">0%</span>
                   </div>
                </div>
             </div>

             {/* ⚖️ SECTION 11 — CHILD RATIO */}
             <div className="bg-white p-6 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-slate-200 shadow-sm">
                 <h3 className="text-xs sm:text-sm font-black text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wider">
                   <Scale className="text-indigo-500" size={16} /> Jon boshiga sarf
                </h3>
                <div className="relative h-44 flex items-center justify-center">
                   <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                         <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={55} outerRadius={70} paddingAngle={5} dataKey="value">
                           {PIE_DATA.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                         </Pie>
                         <Tooltip />
                      </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-xl sm:text-2xl font-black text-slate-900">1<span className="text-[10px] uppercase ml-0.5">kg</span></p>
                      <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">O'rtacha</p>
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mt-6">
                   {PIE_DATA.map(item => (
                      <div key={item.name} className="flex items-center gap-2">
                         <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                         <span className="text-[9px] font-bold text-slate-500 uppercase truncate">{item.name}</span>
                      </div>
                   ))}
                </div>
             </div>

          </div>
        </div>

      </main>
    </div>
  );
};
