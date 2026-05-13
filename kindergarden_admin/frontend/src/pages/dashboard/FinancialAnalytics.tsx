import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { 
  DollarSign, TrendingUp, TrendingDown, AlertTriangle, 
  MapPin, Calendar, Download, Search, Filter, Calculator, 
  PieChart as PieChartIcon, Activity, BrainCircuit, ShieldAlert,
  ArrowUpRight, ArrowDownRight, Users, Scale, Coins, Wallet,
  Building2, Home, School, ChevronDown, Bell, CheckCircle2, Package
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend, ComposedChart
} from 'recharts';
import { clsx } from 'clsx';
import { 
  MARKET_PRICES, 
  TODAY_MENU_FINANCE, 
  DISTRICT_FINANCIAL_DATA, 
  REGION_FINANCIAL_SUMMARY, 
  KINDERGARTEN_TYPE_FINANCE, 
  PRODUCT_ANALYSIS, 
  AI_FINANCIAL_INSIGHTS 
} from '../../lib/financial-data';

// --- MOCK DATA FOR TRENDS ---
const TREND_DATA = [
  { name: 'Dush', reja: 200, real: 195, tejalgan: 5 },
  { name: 'Sesh', reja: 200, real: 185, tejalgan: 15 },
  { name: 'Chor', reja: 200, real: 190, tejalgan: 10 },
  { name: 'Pay', reja: 200, real: 210, tejalgan: -10 },
  { name: 'Juma', reja: 200, real: 180, tejalgan: 20 },
  { name: 'Shan', reja: 100, real: 95, tejalgan: 5 },
];

const KPI_CARDS = [
  { title: 'Viloyat umumiy xarajati', value: (REGION_FINANCIAL_SUMMARY.totalExpenditure / 1000000000).toFixed(1), unit: 'mlrd so‘m', trend: '+4.2%', isPositive: false, icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { title: 'Bugungi ovqat xarajati', value: (REGION_FINANCIAL_SUMMARY.totalExpenditure / 1000000).toFixed(0), unit: 'mln so‘m', trend: '-1.5%', isPositive: true, icon: Calculator, color: 'text-blue-600', bg: 'bg-blue-50' },
  { title: 'Kelmagan bolalar', value: REGION_FINANCIAL_SUMMARY.totalAbsent.toLocaleString(), unit: 'ta', trend: '+120', isPositive: false, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
  { title: 'Tejalgan mablag‘', value: (REGION_FINANCIAL_SUMMARY.totalSaved / 1000000).toFixed(1), unit: 'mln so‘m', trend: '+12%', isPositive: true, icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { title: 'Tejalgan mahsulotlar', value: '6.3', unit: 'tonna', trend: '+0.5t', isPositive: true, icon: Scale, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { title: 'Isrofgarchilik xavfi', value: REGION_FINANCIAL_SUMMARY.wasteAlerts.toString(), unit: 'holat', trend: '-3', isPositive: true, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
];

// --- COMPONENTS ---

const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'normal') return <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-fit"><CheckCircle2 size={12}/> Normal</span>;
  if (status === 'warning') return <span className="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-fit"><AlertTriangle size={12}/> Nazorat</span>;
  if (status === 'critical') return <span className="px-2.5 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-md text-[10px] font-black uppercase tracking-widest flex items-center gap-1 w-fit"><ShieldAlert size={12}/> Isrof xavfi</span>;
  return null;
};

export const FinancialAnalytics = () => {
  const [timeFilter, setTimeFilter] = useState('Bugun');
  const [typeFilter, setTypeFilter] = useState('Barchasi');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 font-sans text-slate-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* 🚨 SECTION 9 — ALERT SYSTEM (TOP LEVEL) */}
      <AnimatePresence>
         {REGION_FINANCIAL_SUMMARY.wasteAlerts > 0 && (
           <motion.div 
             initial={{ height: 0, opacity: 0 }}
             animate={{ height: 'auto', opacity: 1 }}
             className="bg-rose-600 text-white overflow-hidden"
           >
              <div className="max-w-[1600px] mx-auto px-8 py-3 flex items-center justify-between">
                 <div className="flex items-center gap-3 text-sm font-black uppercase tracking-widest">
                    <ShieldAlert size={18} className="animate-bounce" />
                    Tizimda {REGION_FINANCIAL_SUMMARY.wasteAlerts} ta kritik xarajat buzilishlari aniqlandi!
                 </div>
                 <button className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-[10px] font-black uppercase transition-colors">
                    Tekshirish
                 </button>
              </div>
           </motion.div>
         )}
      </AnimatePresence>

      {/* 🧭 HEADER - GLASSMORPHISM */}
      <header className="sticky top-0 z-30 bg-white/70 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
              <Coins className="text-white sm:w-6 sm:h-6" size={20} />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-black tracking-tight text-slate-900 leading-none">Moliyaviy Analitika</h1>
              <p className="text-[8px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-[0.1em] mt-1 sm:mt-1.5">Davomat va taomnoma asosida xarajat tahlili</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full lg:w-auto">
            {/* Filters */}
            <button className="flex items-center justify-between gap-2 px-4 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] sm:text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm whitespace-nowrap">
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-emerald-600" /> Tumanlar</span> <ChevronDown size={12} className="opacity-50" />
            </button>
            
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto no-scrollbar">
               {['Barchasi', 'Public', 'Private', 'Home'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setTypeFilter(t)}
                    className={clsx(
                       "flex-1 px-3 py-1.5 text-[8px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap",
                       typeFilter === t ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                    )}
                  >
                     {t}
                  </button>
               ))}
            </div>

            <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm overflow-x-auto no-scrollbar">
               {['Bugun', '7 kun', '15 kun', '30 kun'].map(t => (
                  <button 
                    key={t}
                    onClick={() => setTimeFilter(t)}
                    className={clsx(
                       "flex-1 px-3 py-1.5 text-[8px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap",
                       timeFilter === t ? "bg-emerald-50 text-emerald-700" : "text-slate-500 hover:bg-slate-50"
                    )}
                  >
                     {t}
                  </button>
               ))}
            </div>
            
            <div className="flex gap-2">
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 bg-slate-900 text-white rounded-xl text-[10px] sm:text-xs font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/20 whitespace-nowrap">
                <BrainCircuit size={14} className="text-emerald-400" /> AI Report
              </button>
              <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 bg-white border border-slate-200 rounded-xl text-[10px] sm:text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all shadow-sm whitespace-nowrap">
                <Download size={14} className="text-slate-400" /> Export
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-10 space-y-6 sm:space-y-10">
        
        {/* 📊 KPI CARDS */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-5">
          {KPI_CARDS.map((kpi, idx) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              key={kpi.title} 
              className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group"
            >
              <div className="flex justify-between items-start mb-3 sm:mb-4 relative z-10">
                <div className={clsx("w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shadow-inner shrink-0", kpi.bg, kpi.color)}>
                  <kpi.icon size={16} className="sm:w-5 sm:h-5" strokeWidth={2.5} />
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

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* LEFT & CENTER COLUMN (Main Content) */}
          <div className="xl:col-span-2 space-y-8">
             
             {/* 💰 SECTION 5 — TEJALGAN MABLAG' HISOBI (Main Focus) */}
             <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 sm:p-10 rounded-[32px] sm:rounded-[48px] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 sm:w-64 h-48 sm:h-64 bg-white/10 blur-3xl rounded-full" />
                
                <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6 sm:gap-10">
                   <div className="space-y-4">
                      <h2 className="text-[10px] sm:text-sm font-black uppercase tracking-[0.2em] text-emerald-100 mb-2">Kunlik Tejalgan Mablag'</h2>
                      <div className="flex items-baseline gap-2 sm:gap-3">
                         <span className="text-3xl sm:text-6xl font-black tracking-tight">{REGION_FINANCIAL_SUMMARY.totalSaved.toLocaleString()}</span>
                         <span className="text-lg sm:text-2xl font-bold text-emerald-200">so'm</span>
                      </div>
                      <p className="text-[11px] sm:text-sm font-medium text-emerald-100 max-w-md leading-relaxed">
                         Bugun <strong className="text-white">{REGION_FINANCIAL_SUMMARY.totalAbsent.toLocaleString()}</strong> nafar bola kelmaganligi sababli xarajatlardan tejaldi.
                      </p>
                   </div>

                   <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 sm:p-8 rounded-2xl sm:rounded-[32px] w-full xl:w-auto">
                      <div className="flex items-center justify-between gap-6 sm:gap-10 mb-4 border-b border-white/10 pb-4">
                         <div>
                            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-200 mb-1">Kelmaganlar</p>
                            <p className="text-xl sm:text-3xl font-black">{REGION_FINANCIAL_SUMMARY.totalAbsent.toLocaleString()}</p>
                         </div>
                         <div className="text-emerald-300 font-black text-xl">×</div>
                         <div>
                            <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-200 mb-1">Xarajat</p>
                            <p className="text-xl sm:text-3xl font-black">{(REGION_FINANCIAL_SUMMARY.avgCostPerChild / 1000).toFixed(0)}k</p>
                         </div>
                      </div>
                      <div className="flex items-center justify-between">
                         <span className="text-[9px] sm:text-[11px] font-bold uppercase tracking-widest text-emerald-200">Tejaldi:</span>
                         <span className="text-lg sm:text-2xl font-black text-emerald-400 bg-white/10 px-3 py-1 rounded-xl">{(REGION_FINANCIAL_SUMMARY.totalSaved / 1000000).toFixed(1)} mln</span>
                      </div>
                   </div>
                </div>
             </div>

             {/* 🛒 SECTION 1 — BAFSIRIL MENYU XARAJATI */}
             <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                   <div>
                      <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">Menyu xarajati tahlili</h2>
                      <p className="text-[8px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">1 bola uchun ingredientlar sarfi</p>
                   </div>
                   <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-widest border border-blue-100 w-fit">
                      Jami: {REGION_FINANCIAL_SUMMARY.avgCostPerChild.toLocaleString()} s
                   </div>
                </div>

                <div className="space-y-8 sm:space-y-12">
                   {TODAY_MENU_FINANCE.map((meal, mIdx) => (
                      <div key={mIdx} className="space-y-4">
                         <div className="flex flex-col xs:flex-row xs:items-center gap-2 sm:gap-4">
                            <span className="px-2.5 py-1 bg-slate-900 text-white text-[8px] sm:text-[10px] font-black uppercase tracking-widest rounded-md w-fit">{meal.meal}</span>
                            <h3 className="text-sm sm:text-base font-black text-slate-800">{meal.dish}</h3>
                            <div className="hidden xs:block h-px flex-1 bg-slate-100" />
                            <span className="text-sm font-black text-blue-600">{meal.totalCost.toLocaleString()} so'm</span>
                         </div>
                         <div className="overflow-x-auto -mx-5 sm:mx-0">
                            <div className="min-w-[500px] px-5 sm:px-0">
                               <table className="w-full text-left">
                                  <thead className="bg-slate-50 text-[8px] sm:text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                     <tr>
                                        <th className="px-4 sm:px-6 py-2.5">Ingredient</th>
                                        <th className="px-4 sm:px-6 py-2.5 text-center">Norma</th>
                                        <th className="px-4 sm:px-6 py-2.5 text-center">Narx</th>
                                        <th className="px-4 sm:px-6 py-2.5 text-right">Jami</th>
                                     </tr>
                                  </thead>
                                  <tbody className="text-[10px] sm:text-xs font-bold text-slate-600">
                                     {meal.ingredients.map((ing, iIdx) => (
                                        <tr key={iIdx} className="border-t border-slate-50 hover:bg-slate-50/50 transition-colors">
                                           <td className="px-4 sm:px-6 py-2.5 text-slate-900">{ing.name}</td>
                                           <td className="px-4 sm:px-6 py-2.5 text-center">{ing.amount} {ing.unit}</td>
                                           <td className="px-4 sm:px-6 py-2.5 text-center text-slate-400">{ing.price.toLocaleString()} s</td>
                                           <td className="px-4 sm:px-6 py-2.5 text-right text-indigo-600">{ing.cost.toLocaleString()} s</td>
                                        </tr>
                                     ))}
                                  </tbody>
                               </table>
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>

             {/* 🏙️ SECTION 2 — TUMANLAR BO'YICHA MOLIYAVIY HISOB */}
             <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                   <div>
                      <h2 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">Tumanlar Moliyaviy Nazorati</h2>
                      <p className="text-[8px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Davomat va xarajatlar tahlili</p>
                   </div>
                   <div className="flex items-center gap-2 w-full sm:w-auto">
                      <div className="relative flex-1 sm:flex-none">
                         <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                         <input type="text" placeholder="Qidirish..." className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500/20" />
                      </div>
                   </div>
                </div>

                <div className="overflow-x-auto -mx-5 sm:mx-0">
                   <div className="min-w-[700px] px-5 sm:px-0">
                     <table className="w-full text-left border-collapse">
                        <thead>
                           <tr className="border-b border-slate-100 text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">
                              <th className="pb-3 pl-2 sm:pl-4">Tuman</th>
                              <th className="pb-3">Jami</th>
                              <th className="pb-3 text-emerald-600">Kelganlar</th>
                              <th className="pb-3 text-rose-500">Kelmagan</th>
                              <th className="pb-3">Xarajat</th>
                              <th className="pb-3 text-indigo-600">Tejalgan</th>
                              <th className="pb-3 pr-2 sm:pr-4">Status</th>
                           </tr>
                        </thead>
                        <tbody className="text-[10px] sm:text-sm font-medium">
                           {DISTRICT_FINANCIAL_DATA.map((dist, i) => (
                              <tr key={dist.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                 <td className="py-3 pl-2 sm:pl-4 font-black text-slate-900">{dist.name}</td>
                                 <td className="py-3 text-slate-500">{dist.totalChildren.toLocaleString()}</td>
                                 <td className="py-3 font-bold text-emerald-600">{(dist.attendedBefore9 + dist.attendedAfter9).toLocaleString()}</td>
                                 <td className="py-3 font-bold text-rose-500">{dist.absent.toLocaleString()}</td>
                                 <td className="py-3 font-black text-slate-900">{(dist.totalDailyCost / 1000000).toFixed(1)}M</td>
                                 <td className="py-3 font-black text-indigo-600 bg-indigo-50/50 px-2 rounded">{(dist.totalSavedAmount / 1000000).toFixed(1)}M</td>
                                 <td className="py-3 pr-2 sm:pr-4">
                                    <StatusBadge status={dist.status} />
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                   </div>
                </div>
             </div>

             {/* ⚖️ SECTION 6 — NORMA VS REAL SARF */}
             <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                 <div className="flex items-center justify-between mb-8">
                   <div>
                      <h2 className="text-xl font-black text-slate-900 tracking-tight">Norma vs Real Sarf tahlili</h2>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">Rejadagi va amaldagi mahsulot sarfi farqi</p>
                   </div>
                </div>

                <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                      <thead>
                         <tr className="border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <th className="pb-4 pl-4">Mahsulot</th>
                            <th className="pb-4">Norma (kg/l)</th>
                            <th className="pb-4">Real sarf (kg/l)</th>
                            <th className="pb-4">Farq %</th>
                            <th className="pb-4">Moliyaviy farq</th>
                            <th className="pb-4 pr-4">Status</th>
                         </tr>
                      </thead>
                      <tbody className="text-sm font-medium">
                         {PRODUCT_ANALYSIS.map((item, i) => (
                            <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                               <td className="py-4 pl-4 font-bold text-slate-900 flex items-center gap-2">
                                  <Package size={14} className="text-slate-400" /> {item.product}
                               </td>
                               <td className="py-4 text-slate-500">{item.norm.toLocaleString()}</td>
                               <td className="py-4 font-bold">{item.real.toLocaleString()}</td>
                               <td className="py-4">
                                  {item.diffPct !== 0 ? (
                                    <span className={clsx(
                                       "px-2 py-1 rounded text-[10px] font-black",
                                       item.diffPct > 0 ? "bg-rose-50 text-rose-600" : "bg-emerald-50 text-emerald-600"
                                    )}>
                                       {item.diffPct > 0 ? '+' : ''}{item.diffPct.toFixed(1)}%
                                    </span>
                                  ) : <span className="text-slate-400">-</span>}
                               </td>
                               <td className="py-4 font-bold text-slate-900">
                                  {item.financialDiff !== 0 ? (
                                     <span className={item.financialDiff > 0 ? "text-rose-600" : "text-emerald-600"}>
                                        {item.financialDiff > 0 ? '+' : ''}{(item.financialDiff / 1000000).toFixed(1)} mln so'm
                                     </span>
                                  ) : '-'}
                               </td>
                               <td className="py-4 pr-4">
                                  <StatusBadge status={item.status} />
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>

          </div>

          {/* RIGHT COLUMN (AI & Analytics & Charts) */}
          <div className="space-y-8">
             
             {/* 🧠 SECTION 8 — AI MOLIYAVIY TAHLIL PANELI */}
             <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-3xl rounded-full pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
                
                <div className="relative z-10">
                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                         <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                            <BrainCircuit size={24} className="text-indigo-400" />
                         </div>
                         <div>
                            <h2 className="text-xl font-black tracking-tight">AI Moliyaviy Tahlil</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 flex items-center gap-1">
                               <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Tizim faol
                            </p>
                         </div>
                      </div>
                      <button className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                         <Bell size={18} className="text-white" />
                      </button>
                   </div>

                   <div className="space-y-4">
                      {AI_FINANCIAL_INSIGHTS.slice(0, 3).map((insight, idx) => (
                         <div key={idx} className={clsx(
                           "p-5 rounded-2xl backdrop-blur-sm border",
                           idx === 1 ? "bg-rose-500/10 border-rose-500/20" : "bg-white/5 border-white/10"
                         )}>
                            <div className="flex items-start gap-3">
                               {idx === 1 ? <ShieldAlert className="text-rose-400 mt-0.5 shrink-0" size={18} /> : <div className="w-2 h-2 rounded-full bg-indigo-400 mt-2" />}
                               <div>
                                  <h4 className={clsx("text-[10px] font-black uppercase tracking-widest mb-1", idx === 1 ? "text-rose-300" : "text-indigo-300")}>{insight.title}</h4>
                                  <p className="text-sm font-medium leading-snug text-slate-200">
                                     {insight.text}
                                  </p>
                               </div>
                            </div>
                         </div>
                      ))}
                   </div>

                   <div className="mt-8 flex gap-3">
                      <button 
                        onClick={() => setIsReportModalOpen(true)}
                        className="flex-1 py-3.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors shadow-lg shadow-indigo-500/30"
                      >
                         Full AI Report
                      </button>
                      <button className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors border border-white/10">
                         Logs
                      </button>
                   </div>
                </div>
             </div>

             {/* 🏪 SECTION 4 — BOZOR NARXLARI PANELI */}
             <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                   <div>
                      <h2 className="text-lg font-black text-slate-900 tracking-tight">Qashqadaryo bozor narxlari</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Real vaqt monitoringi</p>
                   </div>
                   <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                      <Activity size={20} />
                   </div>
                </div>

                <div className="space-y-3">
                   {MARKET_PRICES.slice(0, 6).map((item, idx) => {
                      return (
                         <div key={idx} className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
                            <div className="flex-1">
                               <p className="text-sm font-bold text-slate-900">{item.name}</p>
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">so'm / {item.unit}</p>
                            </div>
                            <div className="text-right mr-4">
                               <p className="text-sm font-black text-slate-900">{item.price.toLocaleString()}</p>
                            </div>
                            <div className="w-16 flex justify-end">
                               {item.trend > 0 ? (
                                  <span className="flex items-center gap-1 text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-1 rounded-md">
                                     <ArrowUpRight size={12}/> {item.trend}%
                                  </span>
                               ) : item.trend < 0 ? (
                                  <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                     <ArrowDownRight size={12}/> {Math.abs(item.trend)}%
                                  </span>
                               ) : (
                                  <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-1 rounded-md uppercase tracking-wider">
                                     Stabil
                                  </span>
                               )}
                            </div>
                         </div>
                      )
                   })}
                </div>
             </div>

             {/* 🏫 SECTION 3 — BOG'CHA TURLARI BO'YICHA STATISTIKA */}
             <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-6">
                 <div className="flex items-center justify-between mb-2">
                   <div>
                      <h2 className="text-lg font-black text-slate-900 tracking-tight">Kategoriyalar kesimida</h2>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Xarajatlar taqsimoti</p>
                   </div>
                </div>

                <div className="space-y-4">
                   {KINDERGARTEN_TYPE_FINANCE.map((type, i) => {
                      const Icon = i === 0 ? School : i === 1 ? Building2 : Home;
                      const color = i === 0 ? '#3b82f6' : i === 1 ? '#8b5cf6' : '#10b981';
                      return (
                        <div key={i} className="p-5 rounded-3xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all group relative overflow-hidden">
                           <div className="absolute top-0 left-0 w-1.5 h-full" style={{ backgroundColor: color }} />
                           <div className="flex items-center gap-4 mb-4">
                              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white shadow-sm border border-slate-100" style={{ color: color }}>
                                 <Icon size={20} />
                              </div>
                              <div>
                                 <h3 className="font-black text-slate-900 text-sm">{type.type}</h3>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{type.kidsCount.toLocaleString()} bola • Avg: {type.avgCost.toLocaleString()} s</p>
                              </div>
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Jami xarajat</p>
                                 <p className="text-lg font-black text-slate-900">{(type.totalCost / 1000000).toFixed(1)}M</p>
                              </div>
                              <div>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tejalgan</p>
                                 <p className="text-lg font-black text-emerald-600">{(type.totalSaved / 1000000).toFixed(1)}M</p>
                              </div>
                           </div>
                        </div>
                      )
                   })}
                </div>

                {/* Donut Chart for types */}
                <div className="mt-8 h-48 relative flex items-center justify-center">
                   <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <PieChart>
                         <Pie
                           data={KINDERGARTEN_TYPE_FINANCE}
                           cx="50%"
                           cy="50%"
                           innerRadius={60}
                           outerRadius={80}
                           paddingAngle={5}
                           dataKey="totalCost"
                        >
                           <Cell fill="#3b82f6" />
                           <Cell fill="#8b5cf6" />
                           <Cell fill="#10b981" />
                         </Pie>
                         <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      </PieChart>
                   </ResponsiveContainer>
                   <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Asosiy ulush</p>
                      <p className="text-xl font-black text-slate-900">Public</p>
                   </div>
                </div>
             </div>

             {/* 📈 SECTION 7 — CHARTS (Trend) */}
             <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm">
                <h3 className="text-sm font-black text-slate-900 mb-6 flex items-center gap-2">
                   <TrendingUp className="text-indigo-500" size={18} /> Reja vs Real Sarf (Haftalik)
                </h3>
                <div className="h-64">
                   <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <ComposedChart data={TREND_DATA}>
                         <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                         <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
                         <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
                         <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                         <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 800, textTransform: 'uppercase' }} />
                         <Bar dataKey="reja" name="Reja (mln)" fill="#e2e8f0" radius={[4, 4, 0, 0]} barSize={20} />
                         <Bar dataKey="real" name="Real Sarf (mln)" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                         <Line type="monotone" dataKey="tejalgan" name="Tejalgan (mln)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                      </ComposedChart>
                   </ResponsiveContainer>
                </div>
             </div>

          </div>
        </div>

        {/* ── 4 Premium KPI ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "Davomat",        value: "94.2%", sub: "Kutilgan: 96%", trend: null,    icon: Activity,   color: "amber",   bg: "bg-amber-50",   iconColor: "text-amber-500" },
            { label: "Kunlik xarajat", value: "185.4 mln", sub: null,        trend: "+4.2%", icon: Calculator, color: "blue",    bg: "bg-blue-50",    iconColor: "text-blue-500" },
            { label: "Tejalgan mablag'", value: "42.8 mln", sub: "Davomat hisobiga", trend: null, icon: Wallet, color: "teal",  bg: "bg-teal-50",    iconColor: "text-teal-500" },
            { label: "O'rtacha ball",   value: "86.4",  sub: "/ 100",         trend: null,    icon: TrendingUp, color: "green",  bg: "bg-emerald-50", iconColor: "text-emerald-500" },
          ].map((k, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center", k.bg, k.iconColor)}>
                  <k.icon size={20} />
                </div>
                {k.trend && (
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-600">{k.trend}</span>
                )}
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">{k.label}</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{k.value}</p>
              {k.sub && <p className="text-[10px] font-bold text-indigo-500 flex items-center gap-1 mt-1"><TrendingUp size={10} /> {k.sub}</p>}
            </motion.div>
          ))}
        </div>

        {/* ── 2 Donut Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[
            {
              title: "Tejalgan mablag' taqsimoti", sub: "Tumanlar kesimida (mln so'm)",
              total: "42.8", totalLabel: "Jami tejалган (mln)",
              data: [
                { name: "Qarshi sh.",     value: 12.4, color: "#6366f1" },
                { name: "Shahrisabz",     value: 8.2,  color: "#10b981" },
                { name: "Kitob",          value: 7.6,  color: "#f59e0b" },
                { name: "Koson",          value: 6.8,  color: "#f43f5e" },
                { name: "Chiroqchi",      value: 7.8,  color: "#8b5cf6" },
              ]
            },
            {
              title: "Oziq-ovqat xarajatlari", sub: "Tumanlar kesimida (mln so'm)",
              total: "217.5", totalLabel: "Jami xarajat (mln)",
              data: [
                { name: "Qarshi sh.",     value: 58.4, color: "#6366f1" },
                { name: "Shahrisabz",     value: 42.2, color: "#10b981" },
                { name: "Kitob",          value: 36.6, color: "#f59e0b" },
                { name: "Koson",          value: 45.8, color: "#f43f5e" },
                { name: "Chiroqchi",      value: 34.5, color: "#8b5cf6" },
              ]
            },
          ].map((chart, ci) => (
            <div key={ci} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                  <PieChartIcon size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">{chart.title}</h3>
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{chart.sub}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="relative h-48 w-48 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chart.data} cx="50%" cy="50%" innerRadius={58} outerRadius={80}
                        paddingAngle={4} dataKey="value" strokeWidth={0} cornerRadius={6}>
                        {chart.data.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 10, border: "none", fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-black text-slate-900">{chart.total}</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest text-center leading-tight">{chart.totalLabel}</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2.5">
                  {chart.data.map((d, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                        <span className="text-[11px] font-bold text-slate-600">{d.name}</span>
                      </div>
                      <span className="text-[11px] font-black text-slate-900">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ── AI Strategik Tavsiyalar ── */}
        <div className="bg-slate-950 rounded-[32px] p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/15 blur-[120px] rounded-full" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                  <BrainCircuit size={28} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-black italic tracking-tight">AI Strategik Tavsiyalar</h3>
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-0.5">Autonomous Governance v4.0</p>
                </div>
              </div>
              <button className="px-5 py-2.5 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-all">
                Batafsil hisobotni yuklash
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { title: "Auditorlar Nazorati",        text: "Chiroqchi va Koson tumanlariga zudlik bilan auditorlar guruhini yuborish va joyida o'rganish.",           icon: ShieldAlert, color: "emerald" },
                { title: "Logistika Optimizatsiyasi",  text: "Logistika provayderini qayta ko'rib chiqish va kechikishlar uchun jarima sanksiyalarini qo'llash.",       icon: TrendingUp,  color: "amber" },
                { title: "Xarajatlarni Boshqarish",   text: "Xususiy bog'chalar uchun xarajatlarni optimallashtirish bo'yicha yangi raqamli metodik qo'llanma.",       icon: Wallet,      color: "indigo" },
                { title: "Biometrik Monitoring",      text: "Raqamli davomatni (Face ID/Biometriya) barcha bog'chalarda majburiy etib belgilash va integratsiya qilish.", icon: Users,       color: "rose" },
              ].map((t, i) => (
                <div key={i} className="flex items-start gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                  <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                    t.color === "emerald" ? "bg-emerald-500/10 text-emerald-400" :
                    t.color === "amber"   ? "bg-amber-500/10 text-amber-400" :
                    t.color === "indigo"  ? "bg-indigo-500/10 text-indigo-400" :
                                           "bg-rose-500/10 text-rose-400")}>
                    <t.icon size={22} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white mb-1">{t.title}</h4>
                    <p className="text-[11px] font-medium text-slate-400 leading-relaxed">{t.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>

      {/* 📄 SECTION 10 — REPORT GENERATOR MODAL */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsReportModalOpen(false)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
             />
             <motion.div 
               initial={{ scale: 0.9, opacity: 0, y: 20 }}
               animate={{ scale: 1, opacity: 1, y: 0 }}
               exit={{ scale: 0.9, opacity: 0, y: 20 }}
               className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative z-10 overflow-hidden"
             >
                <div className="p-10 space-y-8">
                   <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                         <BrainCircuit size={28} />
                      </div>
                      <div>
                         <h2 className="text-2xl font-black text-slate-900 tracking-tight">AI Moliyaviy Hisobot Generator</h2>
                         <p className="text-sm font-medium text-slate-500">Barcha moliyaviy ma'lumotlarni tahlil qilish va PDF yaratish</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Hisobot davri</p>
                         <p className="text-sm font-bold text-slate-900">2026-yil, 27-aprel (Bugun)</p>
                      </div>
                      <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 space-y-2">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tahlil darajasi</p>
                         <p className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                            <CheckCircle2 size={16} /> Chuqurlashtirilgan AI
                         </p>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 ml-2">Hisobot mazmuni:</h4>
                      <div className="grid grid-cols-1 gap-3">
                         {['Tumanlar kesimida xarajatlar', 'Bozor narxlari o\'zgarishi tahlili', 'Norma va real sarf farqi', 'Isrofgarchilik va xavf tahlili', 'AI moliyaviy tavsiyalar'].map(item => (
                            <div key={item} className="flex items-center gap-3 px-5 py-3 bg-white border border-slate-100 rounded-2xl">
                               <div className="w-5 h-5 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center">
                                  <CheckCircle2 size={12} />
                               </div>
                               <span className="text-sm font-bold text-slate-700">{item}</span>
                            </div>
                         ))}
                      </div>
                   </div>

                   <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => setIsReportModalOpen(false)}
                        className="flex-1 py-5 bg-slate-100 text-slate-900 rounded-[24px] font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all"
                      >
                         Bekor qilish
                      </button>
                      <button 
                        onClick={() => {
                           toast.info("Hisobot PDF formatida yuklanmoqda...");
                           setIsReportModalOpen(false);
                        }}
                        className="flex-[2] py-5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-[24px] font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                      >
                         <Download size={18} /> Hisobotni yuklash (.pdf)
                      </button>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
