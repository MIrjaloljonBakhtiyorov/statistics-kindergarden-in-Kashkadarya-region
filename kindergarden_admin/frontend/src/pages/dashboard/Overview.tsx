import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Clock, AlertTriangle, ShieldAlert, 
  Sparkles, Search, Filter, Activity, 
  Building2, Home, Map as MapIcon, ArrowUpRight, 
  ChevronRight, BarChart3, TrendingUp, TrendingDown, MapPin, X
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { clsx } from 'clsx';


// PREMIUM DATA SETS
const KPIs = [
  {title: "Jami kontingent", val: "12,482", trend: 1.2, icon: Users, color: "indigo"},
  {title: "Ertalabki qabul", val: "11,850", trend: 0.8, icon: Clock, color: "emerald"},
  {title: "Kechikkanlar", val: "432", trend: -5.4, icon: AlertTriangle, color: "amber"},
  {title: "Sababsiz kelmaganlar", val: "200", trend: -12.1, icon: ShieldAlert, color: "rose"},
  {title: "Jami muassasalar", val: "842", trend: 0.5, icon: Building2, color: "violet"},
  {title: "Davlat MTT", val: "320", trend: 0, icon: Home, color: "blue"},
  {title: "Nodavlat MTT", val: "522", trend: 2.1, icon: Building2, color: "sky"},
  {title: "Oilaviy MTT", val: "150", trend: 1.4, icon: Home, color: "cyan"},
];

const DISTRICT_DATA = [
  {name: "Qarshi sh.", jami: 4500, gacha9: 4200},
  {name: "Qarshi t.", jami: 3200, gacha9: 3000},
  {name: "Shahrisabz sh.", jami: 2800, gacha9: 2600},
  {name: "Shahrisabz t.", jami: 3500, gacha9: 3300},
  {name: "Kitob", jami: 2400, gacha9: 2200},
  {name: "Koson", jami: 3100, gacha9: 2900},
  {name: "Muborak", jami: 1800, gacha9: 1700},
  {name: "G‘uzor", jami: 2200, gacha9: 2100},
];

const PIE_DATA = [
  {name: 'Davlat', value: 320, color: '#6366f1'},
  {name: 'Nodavlat', value: 522, color: '#0ea5e9'},
  {name: 'Oilaviy', value: 150, color: '#10b981'},
];

const TOP_PERFORMERS = [
  {name: "Prezident MTT", hudud: "Qarshi sh.", foiz: 99.2, status: 'excellent'},
  {name: "Nihol innovatsion", hudud: "Shahrisabz", foiz: 98.5, status: 'excellent'},
  {name: "Gulyalo MTT", hudud: "Kitob", foiz: 97.8, status: 'good'},
];

export const Overview = () => {
  const [showFullReport, setShowFullReport] = useState(false);
  const currentTime = new Date().toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-8 pb-24 bg-[#f8fafc] min-h-screen text-slate-900">
      
      {/* Header Strategy */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Viloyat Statistikasi
            <span className="text-[10px] font-black bg-indigo-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">Live</span>
          </h1>
          <p className="text-sm font-bold text-slate-400 mt-1 flex items-center gap-2">
            <MapIcon size={14} className="text-indigo-500" />
            Qashqadaryo viloyati bo‘yicha real vaqt rejimidagi monitoring
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <Clock size={16} className="text-slate-400" />
            <span className="text-xs font-black text-slate-600 uppercase tracking-wider">Oxirgi yangilanish: {currentTime}</span>
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-[#0f172a] text-white rounded-2xl text-xs font-black hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-95">
            <Activity size={16} /> Eksport (.PDF)
          </button>
        </div>
      </div>

      {/* KPI Grid - Reimagined */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {KPIs.slice(0, 4).map((kpi, idx) => (
          <motion.div 
            key={idx} 
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="group relative bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden"
          >
            <div className={clsx(
              "absolute -top-12 -right-12 w-32 h-32 blur-3xl opacity-20 transition-all duration-500 group-hover:opacity-40",
              `bg-${kpi.color}-500`
            )} />
            
            <div className="flex justify-between items-start mb-6">
              <div className={clsx(
                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3",
                `bg-${kpi.color}-50 text-${kpi.color}-600`
              )}>
                <kpi.icon size={24} />
              </div>
              <div className={clsx(
                "flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-black",
                kpi.trend >= 0 ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50"
              )}>
                {kpi.trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {Math.abs(kpi.trend)}%
              </div>
            </div>
            
            <div>
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.1em] mb-1">{kpi.title}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{kpi.val}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Analytics Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* District Chart Card */}
        <div className="lg:col-span-8 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Hududiy Monitoring</h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Tumanlar kesimida davomat statistikasi</p>
            </div>
            <div className="flex gap-2">
               <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><Search size={18} className="text-slate-400" /></button>
               <button className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><Filter size={18} className="text-slate-400" /></button>
            </div>
          </div>
          
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DISTRICT_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorJami" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGacha9" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} fontWeight={900} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <YAxis fontSize={10} fontWeight={900} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '24px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '20px'
                  }}
                  itemStyle={{ fontWeight: 900, textTransform: 'uppercase', fontSize: '10px' }}
                />
                <Bar dataKey="jami" name="Kontingent" fill="url(#colorJami)" radius={[8, 8, 0, 0]} barSize={24} />
                <Bar dataKey="gacha9" name="Qabul" fill="url(#colorGacha9)" radius={[8, 8, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Distribution Card */}
        <div className="lg:col-span-4 bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col items-center">
          <div className="self-start mb-8">
            <h3 className="text-xl font-black text-slate-900 tracking-tight">Muassasalar</h3>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Tizim bo'yicha taqsimot</p>
          </div>
          
          <div className="h-[280px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={PIE_DATA} 
                  dataKey="value" 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={70} 
                  outerRadius={100} 
                  paddingAngle={8}
                  strokeWidth={0}
                >
                  {PIE_DATA.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span className="text-4xl font-black text-slate-900 tracking-tighter">992</span>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Jami MTT</span>
            </div>
          </div>

          <div className="grid grid-cols-1 w-full gap-3 mt-8">
            {PIE_DATA.map(item => (
              <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}} />
                  <span className="text-xs font-black text-slate-600 uppercase tracking-wider">{item.name}</span>
                </div>
                <span className="text-sm font-black text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Intelligence Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main AI Insights Card */}
        <div className="lg:col-span-8 bg-[#020617] p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 bg-indigo-500 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-indigo-500/40 ring-4 ring-indigo-500/20">
                <Sparkles size={28} className="text-white animate-pulse" />
              </div>
              <div>
                <h4 className="text-2xl font-black tracking-tight">AI Analitik Markaz</h4>
                <p className="text-indigo-400/60 font-black text-[10px] uppercase tracking-[0.3em] mt-1">Smart Management Engine</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] backdrop-blur-md">
                   <p className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-3">Tizim Xulosasi</p>
                   <p className="text-lg font-medium text-slate-200 leading-relaxed italic">
                     "Viloyat bo'yicha davomat barqaror o'sishda (0.8%). Qarshi shahrida resurslar taqsimoti optimallashtirilishi zarur."
                   </p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setShowFullReport(true)} className="flex-1 py-4 bg-indigo-500 text-white rounded-2xl text-xs font-black hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-500/20 uppercase tracking-widest">To'liq Hisobot</button>
                  <button className="px-6 py-4 bg-white/5 border border-white/10 text-white rounded-2xl text-xs font-black hover:bg-white/10 transition-all uppercase tracking-widest"><BarChart3 size={18} /></button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                {[
                  {label: 'Samaradorlik', val: '94%'},
                  {label: 'Xavf darajasi', val: 'Low'},
                  {label: 'Oziq-ovqat', val: '98%'},
                  {label: 'Moliya', val: 'High'},
                ].map((stat, i) => (
                  <div key={i} className="p-5 bg-white/[0.03] border border-white/5 rounded-[2rem] flex flex-col justify-center items-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-xl font-black text-white tracking-tight">{stat.val}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Performers Sidebar */}
        <div className="lg:col-span-4 bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-xl shadow-slate-200/40">
           <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Etalon Muassasalar (TOP)</h4>
           <div className="space-y-4">
             {TOP_PERFORMERS.map((mtt, i) => (
               <div key={i} className="group p-5 bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-2xl hover:border-transparent transition-all duration-500">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-indigo-500 shadow-sm">
                      {i + 1}
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-slate-900 tracking-tighter">{mtt.foiz}%</p>
                      <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Davomat</p>
                    </div>
                  </div>
                  <h5 className="font-black text-slate-800 text-sm mb-1 group-hover:text-indigo-600 transition-colors">{mtt.name}</h5>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <MapPin size={10} /> {mtt.hudud}
                  </p>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* District Status Strip - Mini Cards */}
      <div className="bg-white p-10 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/50">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
            <div>
              <h4 className="text-2xl font-black text-slate-900 tracking-tight">Hududiy Boshqaruv</h4>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Barcha tumanlar kesimida KPI ko'rsatkichlar</p>
            </div>
            <div className="flex gap-4">
               {['#10b981', '#f59e0b', '#ef4444'].map((color, i) => (
                 <div key={i} className="flex items-center gap-2">
                   <div className="w-3 h-3 rounded-full shadow-lg" style={{backgroundColor: color}} />
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{i === 0 ? 'Yuqori' : i === 1 ? 'O\'rta' : 'Past'}</span>
                 </div>
               ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DISTRICT_DATA.map((d, i) => {
              const percentage = d.jami > 0 ? Math.round((d.gacha9/d.jami)*100) : 0;
              let statusColor = "bg-emerald-500";
              if (percentage < 90) statusColor = "bg-amber-500";
              if (percentage < 75) statusColor = "bg-rose-500";
              
              return (
                <div key={i} className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:bg-white hover:shadow-2xl transition-all duration-500 group">
                   <div className="flex justify-between items-center mb-4">
                      <p className="text-xs font-black text-slate-900 uppercase tracking-wider">{d.name}</p>
                      <span className="text-lg font-black text-indigo-600">{percentage}%</span>
                   </div>
                   <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                     <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        className={clsx("h-full shadow-lg", statusColor)} 
                     />
                   </div>
                   <div className="mt-4 flex justify-between text-[9px] font-black text-slate-400 uppercase tracking-widest">
                     <span>Qabul: {d.gacha9}</span>
                     <span>Jami: {d.jami}</span>
                   </div>
                </div>
              );
            })}
          </div>
      </div>

      <AnimatePresence>
        {showFullReport && (
          <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xl flex items-center justify-center p-4">
            <motion.div initial={{scale: 0.9, y: 20}} animate={{scale: 1, y: 0}} exit={{scale: 0.9, y: 20}} className="bg-white rounded-[3.5rem] p-12 max-w-3xl w-full max-h-[85vh] overflow-y-auto shadow-2xl relative">
               <button onClick={() => setShowFullReport(false)} className="absolute top-8 right-8 p-3 hover:bg-slate-100 rounded-2xl transition-all"><X size={24} className="text-slate-400" /></button>
               
               <div className="mb-10">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tight">AI Chuqur Tahlil</h3>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">To'liq tizimli hisobot — 2026-yil May</p>
               </div>
               
               <div className="space-y-10">
                  {['Davlat', 'Nodavlat', 'Oilaviy'].map(type => (
                    <div key={type} className="group">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-1.5 h-8 bg-indigo-500 rounded-full" />
                        <h4 className="text-xl font-black text-slate-800 tracking-tight">{type} MTT Analitikasi</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                          <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100/50">
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">A'lo</p>
                            <p className="text-2xl font-black text-emerald-900">142</p>
                          </div>
                          <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100/50">
                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">O'rta</p>
                            <p className="text-2xl font-black text-amber-900">86</p>
                          </div>
                          <div className="p-6 bg-rose-50 rounded-[2rem] border border-rose-100/50">
                            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest mb-1">Past</p>
                            <p className="text-2xl font-black text-rose-900">12</p>
                          </div>
                      </div>
                    </div>
                  ))}
               </div>

               <div className="mt-12 p-8 bg-[#020617] rounded-[2.5rem] text-white">
                  <h5 className="font-black text-indigo-400 text-xs uppercase tracking-widest mb-3">Strategik Tavsiya</h5>
                  <p className="text-slate-300 font-medium leading-relaxed italic text-sm">
                    "Kelgusi 3 oy davomida nodavlat sektorida davomatni 5% ga oshirish uchun raqamli monitoring tizimini kengaytirish tavsiya etiladi."
                  </p>
               </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
