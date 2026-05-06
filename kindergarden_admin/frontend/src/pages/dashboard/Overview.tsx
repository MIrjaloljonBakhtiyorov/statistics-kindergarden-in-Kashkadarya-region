import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Clock, AlertTriangle, ShieldAlert, 
  Sparkles, Search, Filter, Activity, 
  Building2, Home, Map as MapIcon, ArrowUpRight, 
  ChevronRight, BarChart3, TrendingUp
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { clsx } from 'clsx';


// MOCK DATA
const KPIs = [
  {title: "Jami bolalar", val: "1", trend: 0.1, icon: Users, color: "indigo"},
  {title: "09:00 gacha", val: "1", trend: 0.1, icon: Clock, color: "emerald"},
  {title: "09:00 dan keyin", val: "0", trend: 0, icon: AlertTriangle, color: "amber"},
  {title: "Kelmaganlar", val: "0", trend: 0, icon: ShieldAlert, color: "rose"},
  {title: "Umumiy bog‘chalar", val: "1", trend: 0, icon: Building2, color: "indigo"},
  {title: "Private", val: "1", trend: 0, icon: Home, color: "indigo"},
  {title: "Public", val: "0", trend: 0, icon: Building2, color: "indigo"},
  {title: "Home", val: "0", trend: 0, icon: Home, color: "indigo"},
];

const DISTRICT_DATA = [
  {name: "Qarshi sh.", jami: 1, gacha9: 1},
  {name: "Qarshi t.", jami: 1, gacha9: 1},
  {name: "Shahrisabz sh.", jami: 1, gacha9: 1},
  {name: "Shahrisabz t.", jami: 1, gacha9: 1},
  {name: "Kitob", jami: 1, gacha9: 1},
  {name: "Koson", jami: 1, gacha9: 1},
  {name: "Muborak", jami: 1, gacha9: 1},
  {name: "G‘uzor", jami: 1, gacha9: 1},
  {name: "Nishon", jami: 1, gacha9: 1},
  {name: "Dehqonobod", jami: 1, gacha9: 1},
  {name: "Qamashi", jami: 1, gacha9: 1},
  {name: "Chiroqchi", jami: 1, gacha9: 1},
  {name: "Kasbi", jami: 1, gacha9: 1},
];

const PIE_DATA = [
  {name: 'Home', value: 1, color: '#10b981'},
  {name: 'Private', value: 1, color: '#f59e0b'},
  {name: 'Public', value: 1, color: '#4f46e5'},
];

const LOW_ATTENDANCE = [
  {name: "Namuna bog'cha", hudud: "N/A", kechikkan: 1, foiz: 99},
];

export const Overview = () => {
  const [showFullReport, setShowFullReport] = useState(false);
  const lastAnalyzed = "--:--";

  const renderFullReport = () => (
    <AnimatePresence>
      {showFullReport && (
        <motion.div initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}} className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div initial={{scale: 0.9}} animate={{scale: 1}} exit={{scale: 0.9}} className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black">AI Chuqur tahlil (Full Report)</h3>
                <button onClick={() => setShowFullReport(false)} className="text-slate-400 hover:text-slate-900 font-bold">Yopish</button>
             </div>
             <div className="space-y-6">
                {['Public', 'Private', 'Home'].map(type => (
                  <div key={type} className="border-b pb-4">
                    <h4 className="font-black text-indigo-700 mb-2">{type} bog'chalar</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="p-3 bg-emerald-50 rounded-xl"><p className="text-[10px] font-bold text-emerald-600">Yaxshi</p><p className="font-black">150</p></div>
                        <div className="p-3 bg-amber-50 rounded-xl"><p className="text-[10px] font-bold text-amber-600">Qoniqarli</p><p className="font-black">50</p></div>
                        <div className="p-3 bg-rose-50 rounded-xl"><p className="text-[10px] font-bold text-rose-600">Qoniqarsiz</p><p className="font-black">10</p></div>
                    </div>
                  </div>
                ))}
             </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 bg-slate-50 min-h-screen text-slate-900">
      
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/50 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white shadow-sm sticky top-0 z-30 gap-4 sm:gap-0">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Viloyat statistikasi</h1>
          <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">Qashqadaryo viloyati bo‘yicha monitoring</p>
        </div>
        <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-white border border-slate-200 rounded-xl text-[10px] sm:text-xs font-bold shadow-sm hover:bg-slate-50">
            <Filter size={14} /> Filtr
          </button>
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] sm:text-xs font-bold hover:bg-indigo-700">
            <Activity size={14} /> Live Report
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {KPIs.slice(0, 4).map((kpi, idx) => (
          <motion.div key={idx} whileHover={{ y: -2 }} className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 sm:p-3 opacity-10">
               <kpi.icon className={clsx("w-10 h-10 sm:w-16 sm:h-16", `text-${kpi.color}-500`)} />
            </div>
            <div className="flex justify-between items-start mb-2 relative z-10">
              <kpi.icon className={clsx("w-4 h-4 sm:w-6 sm:h-6", `text-${kpi.color}-500`)} />
              <span className={clsx("text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full", kpi.trend >= 0 ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50")}>
                {kpi.trend > 0 ? "+" : ""}{kpi.trend}%
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider truncate">{kpi.title}</p>
              <p className="text-lg sm:text-2xl font-black text-slate-900 mt-0.5 sm:mt-1">{kpi.val}</p>
            </div>
          </motion.div>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {KPIs.slice(4, 8).map((kpi, idx) => (
          <motion.div key={idx + 4} whileHover={{ y: -2 }} className="bg-white p-3 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 sm:p-3 opacity-10">
               <kpi.icon className={clsx("w-10 h-10 sm:w-16 sm:h-16", `text-${kpi.color}-500`)} />
            </div>
            <div className="flex justify-between items-start mb-2 relative z-10">
              <kpi.icon className={clsx("w-4 h-4 sm:w-6 sm:h-6", `text-${kpi.color}-500`)} />
              <span className={clsx("text-[8px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full", kpi.trend >= 0 ? "text-emerald-600 bg-emerald-50" : "text-rose-600 bg-rose-50")}>
                {kpi.trend > 0 ? "+" : ""}{kpi.trend}%
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider truncate">{kpi.title}</p>
              <p className="text-lg sm:text-2xl font-black text-slate-900 mt-0.5 sm:mt-1">{kpi.val}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <h3 className="text-[10px] sm:text-xs font-black text-slate-800 uppercase mb-4 sm:mb-6">Tuman kesimida davomat</h3>
          <div className="h-[250px] sm:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DISTRICT_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={8} sm:fontSize={9} axisLine={false} tickLine={false} />
                <YAxis fontSize={8} sm:fontSize={9} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="jami" name="Jami bolalar" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="gacha9" name="09:00 gacha" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center">
          <h3 className="text-[10px] sm:text-xs font-black text-slate-800 uppercase mb-4 sm:mb-6 self-start">Bog‘cha turlari</h3>
          <div className="h-[200px] sm:h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={PIE_DATA} dataKey="value" cx="50%" cy="50%" innerRadius={50} sm:innerRadius={60} outerRadius={70} sm:outerRadius={80} paddingAngle={5}>
                  {PIE_DATA.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
              <span className="text-xl sm:text-2xl font-black">100%</span>
              <span className="text-[7px] sm:text-[8px] font-bold text-slate-400 uppercase">Jami</span>
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-2 sm:mt-4">
              {PIE_DATA.map(item => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{backgroundColor: item.color}} />
                  <span className="text-[8px] sm:text-[9px] font-bold text-slate-500 uppercase">{item.name}</span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Bottom Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 sm:gap-6">
          <div className="bg-white p-5 sm:p-8 rounded-[24px] sm:rounded-[32px] border text-white shadow-sm overflow-hidden bg-gradient-to-r from-indigo-800 to-indigo-950 relative">
             <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-10">
                <Sparkles size={60} sm:size={100} />
             </div>
             <div className="relative z-10">
               <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 rounded-lg sm:rounded-xl flex items-center justify-center backdrop-blur-md border border-white/10">
                    <Sparkles size={16} sm:size={20} className="text-amber-300" />
                  </div>
                  <h4 className="font-black text-base sm:text-xl tracking-tight">AI Chuqur Analitika</h4>
               </div>
               <p className="text-xs sm:text-base font-medium italic text-indigo-100 leading-relaxed max-w-2xl">
                 "Ma'lumotlar tahlili: Tizimda yetarli ma'lumot mavjud emas. Tahlil natijalari ma'lumotlar kiritilgandan so'ng ko'rinadi."
               </p>
               <button 
                 onClick={() => setShowFullReport(true)}
                 className="mt-4 sm:mt-6 px-4 sm:px-6 py-2 sm:py-2.5 bg-white text-indigo-900 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black hover:bg-indigo-50 transition-all active:scale-95 shadow-lg"
               >
                 Batafsil Hisobot
               </button>
             </div>
          </div>
          
          <div className="bg-white rounded-[24px] sm:rounded-[32px] border border-slate-100 p-5 sm:p-8 shadow-sm">
             <h4 className="text-[9px] sm:text-xs font-black text-slate-800 uppercase tracking-widest mb-4 sm:mb-6">Eng past davomat — TOP 5</h4>
             <div className="space-y-2 sm:space-y-3">
               {LOW_ATTENDANCE.map((item, i) => (
                 <div key={i} className="flex justify-between items-center p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                   <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-indigo-100 flex items-center justify-center font-black text-indigo-700 text-[10px] sm:text-xs shrink-0">#{i+1}</div>
                      <div className="overflow-hidden">
                        <p className="text-xs sm:text-sm font-black text-slate-900 truncate">{item.name}</p>
                        <p className="text-[8px] sm:text-[10px] text-slate-400 font-bold uppercase tracking-wider truncate">{item.hudud}</p>
                      </div>
                   </div>
                   <div className="text-right shrink-0">
                     <p className="text-[10px] sm:text-sm font-black text-slate-600">{item.kechikkan} kech.</p>
                     <p className="text-[8px] sm:text-[10px] font-bold text-indigo-500 uppercase">{item.foiz}% davomat</p>
                   </div>
                 </div>
               ))}
             </div>
          </div>
          {/* District Status Strip */}
          <div className="bg-white p-5 sm:p-8 rounded-[32px] sm:rounded-[40px] border border-slate-100 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
                <div>
                  <h4 className="text-sm sm:text-base font-black text-slate-800 uppercase tracking-wider">Hududiy boshqaruv monitori</h4>
                  <p className="text-[8px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Barcha tumanlar kesimida jonli ko'rsatkichlar</p>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                   <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500" /><span className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-tighter">Yaxshi</span></div>
                   <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500" /><span className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-tighter">O'rta</span></div>
                   <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-500" /><span className="text-[8px] sm:text-[9px] font-black text-slate-500 uppercase tracking-tighter">Past</span></div>
                </div>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {DISTRICT_DATA.map((d, i) => {
                  const percentage = d.jami > 0 ? Math.round((d.gacha9/d.jami)*100) : 0;
                  let statusColor = "bg-slate-300";
                  if (d.jami > 0) {
                    if (percentage >= 90) statusColor = "bg-emerald-500";
                    else if (percentage >= 75) statusColor = "bg-amber-500";
                    else statusColor = "bg-rose-500";
                  }
                  
                  return (
                    <div key={i} className="p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 transition-all hover:bg-white hover:shadow-xl hover:-translate-y-1 group">
                       <div className="flex justify-between items-start mb-2">
                          <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest truncate mr-2">{d.name}</p>
                          <span className="text-[10px] sm:text-xs font-black text-slate-900">{percentage}%</span>
                       </div>
                       <div className="mt-2 w-full h-1 sm:h-1.5 bg-slate-200 rounded-full overflow-hidden">
                         <motion.div className={clsx("h-full", statusColor)} initial={{width: 0}} animate={{width: `${percentage}%`}} />
                       </div>
                    </div>
                  );
                })}
              </div>
           </div>
        </div>

        {/* AI Sidebar */}
        <div className="col-span-12 lg:col-span-4 bg-slate-900 border border-slate-800 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 text-white shadow-xl relative overflow-hidden group h-fit">
           <div className="absolute top-0 right-0 p-8 bg-indigo-500/5 blur-3xl w-64 h-64 rounded-full" />
           <h4 className="text-xs sm:text-sm font-black text-indigo-400 uppercase flex items-center gap-2 mb-6 sm:mb-8 relative z-10">
             <TrendingUp size={16} sm:size={18} className="text-indigo-400" /> AI Command Center
           </h4>
           <div className="space-y-3 sm:space-y-4 relative z-10">
             {[
               {label: 'Tizim holati', text: 'Ma\'lumotlar kutilmoqda...'},
               {label: 'Davomat va Qabul', text: 'Bugun yangi ma\'lumotlar kiritilmadi.'},
               {label: 'Taomnoma Nazorati', text: 'Taomnoma ma\'lumotlari kutilmoqda.'},
               {label: 'Ogohlantirish', text: 'Hozircha ogohlantirishlar mavjud emas.'},
             ].map((item, i) => (
                <div key={i} className="p-4 sm:p-5 rounded-2xl sm:rounded-[24px] bg-white/5 border border-white/10 hover:bg-white/10 transition-all group/item">
                  <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 sm:mb-2 group-hover/item:text-indigo-300 transition-colors">{item.label}</p>
                  <p className="text-xs sm:text-sm text-slate-300 font-bold leading-relaxed">{item.text}</p>
                </div>
             ))}
             <button className="w-full mt-2 sm:mt-4 py-3 sm:py-4 bg-indigo-600 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black hover:bg-indigo-700 transition-all active:scale-95 shadow-lg shadow-indigo-600/20 uppercase tracking-widest">Full Report</button>
           </div>
        </div>
      </div>
    </div>
  );
};
