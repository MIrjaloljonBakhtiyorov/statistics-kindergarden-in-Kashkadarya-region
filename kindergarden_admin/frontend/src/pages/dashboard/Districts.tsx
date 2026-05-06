import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  MapPin, 
  School, 
  Home, 
  Building2, 
  ChevronRight,
  Search,
  Filter,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  ArrowUpRight,
  ShieldAlert,
  LayoutGrid,
  Map as MapIcon
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { DISTRICTS, MOCK_KINDERGARTENS, AI_INSIGHTS, ATTENDANCE_TREND } from '../../lib/mock-data';
import { District, KindergartenType, StatusType } from '../../types';
import { clsx } from 'clsx';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const MiniSparkline = ({ data, color }: { data: any[], color: string }) => (
  <div className="h-8 w-16 flex items-center justify-center">
    <LineChart width={64} height={32} data={data}>
      <Line 
        type="monotone" 
        dataKey="attendance" 
        stroke={color} 
        strokeWidth={2} 
        dot={false} 
        isAnimationActive={false}
      />
    </LineChart>
  </div>
);

const PremiumKPICard = ({ title, value, subtext, trend, icon: Icon, color, sparkData }: any) => {
  const [displayValue, setDisplayValue] = useState("0");
  const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : (typeof value === 'number' ? value : 0);
  const suffix = typeof value === 'string' ? value.replace(/[0-9.,]/g, '') : '';

  useEffect(() => {
    let start = 0;
    const end = numericValue;
    if (start === end) {
      setDisplayValue(value);
      return;
    }

    let totalDuration = 1000;
    let increment = end / (totalDuration / 16);
    
    let timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue((suffix === '%' ? Math.floor(start) : Math.floor(start).toLocaleString()) + suffix);
      }
    }, 16);

    return () => clearInterval(timer);
  }, [value, numericValue, suffix]);

  const colorMap: any = {
    indigo: "from-indigo-500/20 to-indigo-500/5 text-indigo-600 border-indigo-100",
    emerald: "from-emerald-500/20 to-emerald-500/5 text-emerald-600 border-emerald-100",
    rose: "from-rose-500/20 to-rose-500/5 text-rose-600 border-rose-100",
    amber: "from-amber-500/20 to-amber-500/5 text-amber-600 border-amber-100"
  };

  return (
    <motion.div 
      whileHover={{ y: -4, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
      className={clsx(
        "bg-white p-5 rounded-2xl border flex flex-col justify-between transition-all group overflow-hidden relative",
        colorMap[color].split(' ').pop()
      )}
    >
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={clsx("w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-sm", colorMap[color].split(' ').slice(0, 2).join(' '))}>
            <Icon size={20} />
          </div>
          <MiniSparkline data={sparkData} color={color === 'indigo' ? '#4f46e5' : color === 'emerald' ? '#10b981' : color === 'rose' ? '#f43f5e' : '#f59e0b'} />
        </div>
        
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1">{title}</p>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">{displayValue}</h3>
            {trend !== undefined && (
              <span className={clsx("text-[10px] font-bold flex items-center", trend > 0 ? "text-emerald-600" : "text-rose-600")}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
          <p className="text-[10px] font-medium text-slate-400 mt-1">{subtext}</p>
        </div>
      </div>
      <div className={clsx("absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20", 
        color === 'indigo' ? "bg-indigo-500" : color === 'emerald' ? "bg-emerald-500" : color === 'rose' ? "bg-rose-500" : "bg-amber-500"
      )} />
    </motion.div>
  );
};

const DistrictCard = ({ district, onClick }: { district: District, onClick: () => void, key?: React.Key }) => {
  const getStatusConfig = (percentage: number) => {
    if (percentage >= 90) return { icon: TrendingUp, color: 'text-emerald-500', barColor: 'bg-emerald-500', label: 'GOOD' };
    if (percentage >= 75) return { icon: Activity, color: 'text-amber-500', barColor: 'bg-amber-500', label: 'WARNING' };
    return { icon: TrendingDown, color: 'text-rose-500', barColor: 'bg-rose-500', label: 'CRITICAL' };
  };

  const config = getStatusConfig(district.attendancePercentage);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
      className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:border-indigo-200 transition-all cursor-pointer group relative overflow-hidden"
      onClick={onClick}
    >
      {/* Status Indicator */}
      <div className={clsx("absolute top-0 left-0 w-full h-1.5", config.barColor)} />
      
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="text-base font-black text-slate-800 group-hover:text-indigo-600 transition-colors leading-tight tracking-tight uppercase">{district.name}</h3>
          <div className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-widest flex items-center gap-1">
            <MapPin size={8} />
            <span>Hududiy Boshqaruv</span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:border-indigo-100 group-hover:text-indigo-600 transition-all">
          <ChevronRight size={14} />
        </div>
      </div>

      <div className="space-y-5">
        <div className="flex items-end justify-between px-2">
           <div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">MTTlar Soni</p>
              <p className="text-xl font-black text-slate-900">{district.totalMTTs}</p>
           </div>
           <div className="text-right">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Davomat</p>
              <div className="flex items-center gap-1.5 justify-end">
                 <config.icon size={14} className={config.color} />
                 <p className={clsx("text-xl font-black", config.color)}>
                   {district.attendancePercentage}%
                 </p>
              </div>
           </div>
        </div>

        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
           <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${district.attendancePercentage}%` }}
            className={clsx("h-full rounded-full transition-all duration-1000", config.barColor)}
           />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
           <div className="bg-slate-50/80 p-2 rounded-xl text-center">
              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Yaxshi</p>
              <p className="text-[11px] font-black text-emerald-600">{district.attendedBefore9}</p>
           </div>
           <div className="bg-slate-50/80 p-2 rounded-xl text-center">
              <p className="text-[8px] font-black text-slate-400 uppercase mb-1">Xavf</p>
              <p className="text-[11px] font-black text-rose-600">{district.absent}</p>
           </div>
        </div>
      </div>

      <div className={clsx("absolute -right-6 -bottom-6 w-16 h-16 opacity-5 bg-current rounded-full blur-xl", 
        district.attendancePercentage >= 90 ? 'text-emerald-500' : 'text-amber-500'
      )} />
    </motion.div>
  );
};

export const Districts = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [searchTerm, setSearchTerm] = useState("");
  const [aiText, setAiText] = useState("");
  const fullAiText = "Tizim tahlili: Bugun 20 ta yangi bola kiritildi. Yangi MTT muvaffaqiyatli qo‘shildi. Hududlar bo‘yicha oziq-ovqat tayyorlash jarayoni tasdiqlandi.";

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setAiText(fullAiText.slice(0, i));
      i++;
      if (i > fullAiText.length) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  const filteredDistricts = DISTRICTS.filter(d => 
    d.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ["Hudud", "MTTlar Soni", "Jami Bolalar", "Davomat (%)", "Status"];
    const rows = DISTRICTS.map(d => [
      d.name,
      d.totalMTTs,
      d.totalChildren,
      d.attendancePercentage,
      d.status
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "hududlar_monitoringi.csv");
    document.body.appendChild(link);
    link.click();
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text("Kashkadarya MTT Monitoringi - Hududlar Hisoboti", 14, 15);
    
    const tableColumn = ["Hudud", "MTT Soni", "Bolalar", "Davomat (%)", "Status"];
    const tableRows = DISTRICTS.map(d => [
      d.name,
      d.totalMTTs,
      d.totalChildren,
      d.attendancePercentage + "%",
      d.status.toUpperCase()
    ]);

    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 25,
    });
    
    doc.save("mtt_monitoring_hisoboti.pdf");
  };

  const totalChildren = DISTRICTS.reduce((acc, curr) => acc + curr.totalChildren, 0);
  const avgAttendance = Math.round(DISTRICTS.reduce((acc, curr) => acc + curr.attendancePercentage, 0) / DISTRICTS.length);
  const sortedDistrictsByAttendance = [...DISTRICTS].sort((a, b) => b.attendancePercentage - a.attendancePercentage);
  const bestDistrict = sortedDistrictsByAttendance[0];
  const worstDistrict = sortedDistrictsByAttendance[sortedDistrictsByAttendance.length - 1];

  const getStatusConfig = (percentage: number) => {
    if (percentage >= 90) return { icon: TrendingUp, color: 'text-emerald-500', barColor: 'bg-emerald-500', label: 'GOOD' };
    if (percentage >= 75) return { icon: Activity, color: 'text-amber-500', barColor: 'bg-amber-500', label: 'WARNING' };
    return { icon: TrendingDown, color: 'text-rose-500', barColor: 'bg-rose-500', label: 'CRITICAL' };
  };

  const [kindergartenSearch, setKindergartenSearch] = useState("");

  const filteredKindergartens = MOCK_KINDERGARTENS.filter(k => 
    k.name.toLowerCase().includes(kindergartenSearch.toLowerCase()) ||
    k.director.toLowerCase().includes(kindergartenSearch.toLowerCase())
  );

  if (selectedDistrict && !selectedCategory) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setSelectedDistrict(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-all group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Tumanlar ro‘yxatiga qaytish</span>
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedDistrict.name} monitoringi</h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">Hududiy muassasalar tahlili</p>
          </div>
          <div className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
             <div className="text-center px-6 border-r border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Davomat</p>
                <div className="flex items-baseline gap-1">
                   <p className={clsx("text-2xl font-black", selectedDistrict.attendancePercentage > 85 ? "text-emerald-600" : "text-amber-600")}>
                     {selectedDistrict.attendancePercentage}%
                   </p>
                </div>
             </div>
             <div className="text-center px-6">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">MTTlar</p>
                <p className="text-2xl font-black text-slate-900">{selectedDistrict.totalMTTs}</p>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { type: KindergartenType.PUBLIC, icon: Building2, color: 'indigo', count: 45, kids: 4500, attend: 88, desc: 'Davlat maktabgacha ta’lim muassasalari' },
            { type: KindergartenType.PRIVATE, icon: School, color: 'emerald', count: 22, kids: 1200, attend: 92, desc: 'Xususiy va Nodavlat muassasalar' },
            { type: KindergartenType.HOME, icon: Home, color: 'amber', count: 35, kids: 800, attend: 75, desc: 'Oilaviy va uy bog‘chalari' },
          ].map((cat) => (
            <motion.button
              key={cat.type}
              whileHover={{ y: -4, shadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
              onClick={() => setSelectedCategory(cat.type)}
              className="p-8 bg-white rounded-[24px] border border-slate-200 shadow-sm hover:border-indigo-200 transition-all text-left group overflow-hidden relative"
            >
              <div className={clsx(
                "w-14 h-14 rounded-2xl mb-6 flex items-center justify-center transition-all shadow-sm ring-4 ring-slate-50 group-hover:ring-indigo-50",
                cat.color === 'indigo' ? 'bg-indigo-600 text-white shadow-indigo-600/20' :
                cat.color === 'emerald' ? 'bg-emerald-500 text-white shadow-emerald-500/20' :
                'bg-amber-500 text-white shadow-amber-500/20'
              )}>
                <cat.icon size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">{cat.type}</h3>
              <p className="text-xs font-medium text-slate-400 mb-6 leading-relaxed">{cat.desc}</p>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Muassasalar</span>
                  <span className="text-sm font-black text-slate-800">{cat.count} ta</span>
                </div>
                <div className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">O'rtacha Davomat</span>
                  <span className={clsx("text-sm font-black", cat.attend > 85 ? "text-emerald-600" : "text-amber-600")}>
                    {cat.attend}%
                  </span>
                </div>
              </div>
              <div className="mt-8 flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-[0.15em] border-t border-slate-50 pt-6">
                <span>Ruyxatni ko'rish</span>
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
              
              <div className={clsx("absolute -right-8 -bottom-8 w-24 h-24 opacity-5 bg-current rounded-full blur-2xl", 
                cat.color === 'indigo' ? 'text-indigo-600' : cat.color === 'emerald' ? 'text-emerald-600' : 'text-amber-600'
              )} />
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  if (selectedDistrict && selectedCategory) {
    return (
      <div className="space-y-6">
        <button 
          onClick={() => setSelectedCategory(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-black text-[10px] uppercase tracking-widest transition-all group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
          <span>Kategoriyalarga qaytish</span>
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">{selectedCategory} bog‘chalar</h2>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mt-1">{selectedDistrict.name} dagi barcha muassasalar</p>
          </div>
          <div className="flex gap-3">
             <div className="relative group w-64">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Bog'cha nomi..." 
                  value={kindergartenSearch}
                  onChange={(e) => setKindergartenSearch(e.target.value)}
                  className="pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none w-full transition-all"
                />
             </div>
             <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-600 hover:bg-slate-50 transition-all">
                <Filter size={16} />
                <span>Filter</span>
             </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] border-b border-slate-100 bg-slate-50/50">
                  <th className="px-8 py-5">Muassasa nomi & Aloqa</th>
                  <th className="px-4 py-5 text-center">Hudud</th>
                  <th className="px-4 py-5 text-center">Mas'ul Shaxs</th>
                  <th className="px-4 py-5 text-center">Monitoring</th>
                  <th className="px-8 py-5 text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredKindergartens.map((k, i) => (
                  <motion.tr 
                    key={k.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-slate-50 group transition-all"
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-mono text-xs font-bold text-slate-500 group-hover:bg-indigo-50 group-hover:border-indigo-100 group-hover:text-indigo-600 transition-all">
                          {k.id}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-sm tracking-tight">{k.name}</span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{k.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <span className="text-xs font-bold text-slate-600 bg-slate-100/50 px-3 py-1 rounded-lg border border-slate-200/60">{k.district}</span>
                    </td>
                    <td className="px-4 py-5 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-bold text-slate-800">{k.director}</span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Direktor</span>
                      </div>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex flex-col items-center">
                        <div className="flex items-baseline gap-1 mb-1.5">
                          <span className={clsx("text-sm font-black", k.attendancePercentage >= 90 ? "text-emerald-600" : "text-amber-600")}>
                            {k.attendancePercentage}%
                          </span>
                        </div>
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${k.attendancePercentage}%` }}
                            className={clsx(
                              "h-full rounded-full transition-all duration-1000",
                              k.attendancePercentage >= 90 ? "bg-emerald-500" : "bg-amber-500"
                            )}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <button className="px-5 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-lg shadow-slate-900/10 hover:shadow-indigo-600/20 active:scale-95">
                         Detail View
                       </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 pb-20">
      {/* Top Control Bar - Premium Upgrade */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-white/50 backdrop-blur-xl p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] border border-slate-200 shadow-xl shadow-slate-100/30">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-indigo-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30 shrink-0">
             <LayoutGrid size={20} className="sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">Hududiy Command Center</h2>
            <div className="flex items-center gap-2 mt-0.5">
               <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse" />
               <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Region Intelligence</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            <button 
              onClick={() => setSearchTerm("")}
              className="px-3 sm:px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-indigo-100 transition-all border border-indigo-100 whitespace-nowrap"
            >
              Barcha tumanlar
            </button>
            
            <div className="h-6 w-px bg-slate-200" />

            <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200 shrink-0">
               <button 
                onClick={() => setViewMode('grid')}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all",
                  viewMode === 'grid' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-700"
                )}
               >
                  <LayoutGrid size={12} className="sm:w-3.5 sm:h-3.5" />
                  <span>Grid</span>
               </button>
               <button 
                onClick={() => setViewMode('map')}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all",
                  viewMode === 'map' ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:text-slate-700"
                )}
               >
                  <MapIcon size={12} className="sm:w-3.5 sm:h-3.5" />
                  <span>Map</span>
               </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative group w-full sm:w-48 lg:w-64">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <input 
                type="text" 
                placeholder="Hudud qidirish..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl sm:rounded-2xl text-[12px] sm:text-xs font-medium focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none w-full transition-all shadow-sm"
              />
            </div>
            <div className="flex gap-2">
              <button 
                onClick={exportToCSV}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 bg-white border border-slate-200 rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-indigo-600 transition-all shadow-sm flex items-center justify-center gap-2"
              >
                CSV
              </button>
              <button 
                onClick={exportToPDF}
                className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 bg-indigo-600 text-white rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2"
              >
                PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <PremiumKPICard 
          title="Jami bolalar" 
          value={totalChildren.toLocaleString()} 
          subtext="Bugungi ko'rsatkich"
          trend={2.4} 
          icon={Users} 
          color="indigo" 
          sparkData={ATTENDANCE_TREND} 
        />
        <PremiumKPICard 
          title="Avg Davomat" 
          value={`${avgAttendance}%`}
          subtext="Viloyat o'rtacha"
          trend={1.2} 
          icon={TrendingUp} 
          color="emerald" 
          sparkData={[...ATTENDANCE_TREND].reverse()} 
        />
        <PremiumKPICard 
          title="Eng yaxshi" 
          value={bestDistrict.name.split(' ')[0]} 
          subtext={`${bestDistrict.attendancePercentage}% dav.`}
          icon={ArrowUpRight} 
          color="indigo" 
          sparkData={ATTENDANCE_TREND} 
        />
        <PremiumKPICard 
          title="Eng past" 
          value={worstDistrict.name.split(' ')[0]} 
          subtext={`${worstDistrict.attendancePercentage}% dav.`}
          trend={-3.1} 
          icon={TrendingDown} 
          color="rose" 
          sparkData={ATTENDANCE_TREND.map(d => ({ ...d, attendance: d.attendance * 0.8 }))} 
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-4 sm:gap-8">
        {/* Left: District Cards or Map View */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-4 sm:gap-6">
          <AnimatePresence mode="wait">
             {viewMode === 'grid' ? (
                <motion.div 
                  key="grid"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
                >
                  {filteredDistricts.map((district) => (
                    <DistrictCard 
                      key={district.id} 
                      district={district} 
                      onClick={() => setSelectedDistrict(district)} 
                    />
                  ))}
                </motion.div>
             ) : (
                <motion.div 
                  key="map"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white rounded-[24px] sm:rounded-[40px] border border-slate-200 shadow-2xl p-6 sm:p-10 min-h-[400px] sm:min-h-[600px] flex flex-col items-center justify-center relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(79,70,229,0.05),transparent)] pointer-events-none" />
                  <div className="text-center mb-6 sm:mb-10 relative z-10">
                     <h3 className="text-xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">Interactive Map</h3>
                     <p className="text-[8px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] sm:tracking-[0.3em] mt-2 italic">Autonomous Spatial Analysis</p>
                  </div>
                  
                  {/* Stylized Map Mockup */}
                  <div className="relative w-full max-w-2xl aspect-[4/3] flex items-center justify-center p-4 sm:p-8 bg-slate-50/30 rounded-[32px] sm:rounded-[48px] border border-slate-100 shadow-inner group overflow-hidden">
                     <svg viewBox="0 0 800 600" className="w-full h-full drop-shadow-[0_15px_30px_rgba(0,0,0,0.1)]">
                        {[
                          { name: 'Muborak', color: '#10b981', pos: 'M150,150 L250,130 L280,220 L180,240 Z' },
                          { name: 'Koson', color: '#f59e0b', pos: 'M250,130 L380,100 L420,180 L280,220 Z' },
                          { name: 'Qarshi', color: '#10b981', pos: 'M420,180 L550,150 L580,280 L450,320 L280,220 Z' },
                          { name: 'Nishon', color: '#fbbf24', pos: 'M280,220 L450,320 L420,450 L180,420 L180,240 Z' },
                          { name: 'Mirishkor', color: '#f43f5e', pos: 'M50,250 L180,240 L180,420 L80,480 Z' },
                          { name: 'G\'uzor', color: '#10b981', pos: 'M450,320 L580,280 L650,350 L520,420 Z' },
                          { name: 'Dehqonobod', color: '#10b981', pos: 'M520,420 L650,350 L750,450 L600,550 L420,450 Z' },
                          { name: 'Qamashi', color: '#3b82f6', pos: 'M550,150 L700,100 L750,250 L580,280 Z' },
                        ].map((d, i) => (
                          <motion.path 
                            key={i}
                            d={d.pos}
                            fill={d.color}
                            fillOpacity={0.15}
                            stroke={d.color}
                            strokeWidth="2"
                            whileHover={{ fillOpacity: 0.7, scale: 1.01, strokeWidth: 3 }}
                            className="cursor-pointer transition-all"
                          >
                            <title>{d.name}</title>
                          </motion.path>
                        ))}
                     </svg>
                  </div>

                  <div className="mt-8 sm:mt-12 flex flex-wrap justify-center gap-6 sm:gap-10">
                     <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-emerald-500 shadow-lg" />
                        <span className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Optimized</span>
                     </div>
                     <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-amber-500 shadow-lg" />
                        <span className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Warning</span>
                     </div>
                     <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 rounded bg-rose-500 shadow-lg" />
                        <span className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">Critical</span>
                     </div>
                  </div>
                </motion.div>
             )}
          </AnimatePresence>
        </div>

        {/* Right: AI Panel & Alerts */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 sm:gap-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-indigo-900 rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[350px] sm:min-h-[400px]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-transparent to-transparent z-0" />
            
            <div className="relative z-10 w-full">
              <div className="flex items-center justify-between mb-6 sm:mb-10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 bg-indigo-600/50 backdrop-blur-xl border border-white/20 rounded-xl flex items-center justify-center">
                    <Sparkles size={18} sm:size={20} className="text-blue-300 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-black tracking-tight">AI Insights Node</h4>
                    <p className="text-[8px] sm:text-[9px] font-bold text-indigo-300 uppercase tracking-widest">Pulse Analysis</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                  <span className="text-[7px] sm:text-[8px] font-black text-emerald-400 uppercase font-mono tracking-widest">LIVE</span>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
                 <div className="bg-white/5 backdrop-blur-md border border-white/10 p-4 sm:p-5 rounded-xl sm:rounded-2xl relative overflow-hidden group hover:bg-white/10 transition-all">
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                       <ShieldAlert size={12} sm:size={14} className="text-amber-400" />
                       <span className="text-[8px] sm:text-[9px] font-black text-amber-400 uppercase tracking-widest">Threat Check</span>
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-slate-100 leading-relaxed font-mono min-h-[40px] sm:min-h-[48px]">
                      {aiText}<span className="inline-block w-1 h-3 sm:h-4 bg-indigo-400 ml-1 animate-pulse" />
                    </p>
                 </div>

                 <div className="space-y-2 sm:space-y-3">
                   {AI_INSIGHTS.filter(i => i.severity === 'high').map((insight, idx) => (
                     <motion.div 
                      key={insight.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                      className="flex items-start gap-3 sm:gap-4 p-2.5 sm:p-3 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all"
                     >
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full mt-1.5 bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.6)] shrink-0" />
                        <p className="text-[10px] sm:text-[11px] font-medium text-slate-300 leading-tight">{insight.message}</p>
                     </motion.div>
                   ))}
                 </div>
              </div>
            </div>

            <div className="relative z-10 space-y-2 sm:space-y-3 w-full">
               <button className="w-full py-3.5 sm:py-4 bg-white text-indigo-900 font-black text-[10px] sm:text-xs rounded-xl shadow-xl hover:bg-slate-100 transition-all active:scale-[0.98]">
                 DOWNLOAD ANALYTICS
               </button>
               <button className="w-full py-2.5 sm:py-3 bg-indigo-800 text-indigo-100 font-bold text-[9px] sm:text-[10px] rounded-xl hover:bg-indigo-700 transition-all uppercase tracking-widest">
                 System Logs
               </button>
            </div>

            <div className="absolute -right-20 -bottom-20 w-48 sm:w-64 h-48 sm:h-64 bg-indigo-500 opacity-20 blur-[60px] sm:blur-[80px] rounded-full z-0" />
          </motion.div>

          <div className="bg-white rounded-[24px] p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-100/50">
             <div className="flex items-center gap-3 mb-4 sm:mb-6">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                   <Activity size={16} sm:size={18} />
                </div>
                <h4 className="text-[10px] sm:text-xs font-black text-slate-800 uppercase tracking-widest">Performance</h4>
             </div>
             
             <div className="space-y-4 sm:space-y-5">
                {sortedDistrictsByAttendance.slice(0, 3).map(d => (
                  <div key={d.id}>
                    <div className="flex justify-between items-center mb-1.5 sm:mb-2">
                       <span className="text-[9px] sm:text-[10px] font-black text-slate-600 uppercase tracking-widest truncate mr-2">{d.name}</span>
                       <span className="text-[9px] sm:text-[10px] font-black text-emerald-600">{d.attendancePercentage}%</span>
                    </div>
                    <div className="w-full h-1 bg-slate-50 rounded-full overflow-hidden">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${d.attendancePercentage}%` }}
                        className="h-full bg-emerald-500 rounded-full"
                       />
                    </div>
                  </div>
                ))}
             </div>
             
             <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-50">
                <div className="p-3 sm:p-4 bg-indigo-50 rounded-xl sm:rounded-2xl border border-indigo-100">
                   <p className="text-[8px] sm:text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1 text-center">Avg Response Time</p>
                   <p className="text-lg sm:text-xl font-black text-indigo-900 text-center tracking-tighter">1.2s</p>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

