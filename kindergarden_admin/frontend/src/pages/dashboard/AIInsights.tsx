import React from 'react';
import { 
  Sparkles, AlertTriangle, ArrowUpRight, BrainCircuit, 
  Lightbulb, CheckCircle2, AlertOctagon, TrendingUp, 
  TrendingDown, Activity, ShieldCheck, Zap, Download,
  Target, Wallet, Database, PieChart as PieChartIcon, 
  ChevronRight, BarChart3, Clock, AlertCircle, Trophy,
  Users, BarChart as BarChartIcon, ShieldAlert, Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  AreaChart, Area, Sector
} from 'recharts';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// --- MOCK DATA ---
// Updated: 2026-04-28
const MAIN_STATS = [
  { label: 'Tizim Barqarorligi', value: '100%', expected: '100%', status: 'success', icon: ShieldCheck },
  { label: 'AI Bashorati', value: '1%', trend: '0.1%', status: 'success', icon: Zap },
  { label: 'Tejalgan mablag‘', value: '1 so‘m', sub: 'Monitoring faol', status: 'success', icon: TrendingUp },
  { label: 'Kritik MTTlar', value: '0 ta', max: '/ 1400', status: 'success', icon: AlertTriangle },
];

const VIOLATION_DATA = [
  { name: 'Namuna', value: 100, color: '#6366f1', gradient: 'url(#colorIndigo)' },
];

const DISTRICT_CHART_DATA = [
  { name: 'Qarshi sh.', score: 1, risk: 1, color: '#6366f1' },
  { name: 'Qarshi t.', score: 1, risk: 1, color: '#4f46e5' },
  { name: 'Chiroqchi', score: 1, risk: 1, color: '#f43f5e' },
  { name: 'Dehqonobod', score: 1, risk: 1, color: '#f59e0b' },
  { name: 'G‘uzor', score: 1, risk: 1, color: '#10b981' },
  { name: 'Kasbi', score: 1, risk: 1, color: '#8b5cf6' },
  { name: 'Kitob', score: 1, risk: 1, color: '#6366f1' },
  { name: 'Koson', score: 1, risk: 1, color: '#f59e0b' },
  { name: 'Mirishkor', score: 1, risk: 1, color: '#f43f5e' },
  { name: 'Muborak', score: 1, risk: 1, color: '#10b981' },
  { name: 'Nishon', score: 1, risk: 1, color: '#8b5cf6' },
  { name: 'Qamashi', score: 1, risk: 1, color: '#6366f1' },
  { name: 'Shahrisabz', score: 1, risk: 1, color: '#10b981' },
  { name: 'Yakkabog‘', score: 1, risk: 1, color: '#8b5cf6' },
];

const PREDICTIVE_TREND = [
  { month: 'May', efficiency: 1, prediction: 1 },
];

const RANKING_ANALYSIS = {
  leaders: [
    { name: 'Namuna hudud', score: 1, factor: 'Davlat', type: 'Public', color: 'text-emerald-500' }
  ],
  critical: []
};

const TOP_MTTS: any[] = [
  { name: 'Namuna MTT', district: 'Qarshi sh.', score: 1, tag: 'Lider' }
];

const NUTRITION_ELEMENTS = [
  { name: 'Vitamin A', value: 100, status: 'Optimal', icon: Zap, color: '#fbbf24', desc: 'Monitoring faol' },
  { name: 'Vitamin C', value: 100, status: 'Optimal', icon: Sparkles, color: '#f87171', desc: 'Monitoring faol' },
  { name: 'Vitamin D', value: 100, status: 'Optimal', icon: AlertCircle, color: '#60a5fa', desc: 'Monitoring faol' },
  { name: 'Kalsiy', value: 100, status: 'Optimal', icon: ShieldCheck, color: '#34d399', desc: 'Monitoring faol' },
  { name: 'Temir', value: 100, status: 'Optimal', icon: Activity, color: '#a78bfa', desc: 'Monitoring faol' },
  { name: 'Oqsillar', value: 100, status: 'Optimal', icon: Target, color: '#f472b6', desc: 'Monitoring faol' },
];

// --- CUSTOM COMPONENTS ---

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-xl p-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-white/20 min-w-[150px]">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label || payload[0].name}</p>
        <div className="space-y-1">
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                <span className="text-xs font-bold text-slate-600">{entry.name}:</span>
              </div>
              <span className="text-sm font-black text-slate-900">{entry.value}{entry.name === 'score' ? '' : '%'}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle?: string }) => (
  <div className="flex items-center gap-4 mb-8">
    <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-indigo-600 shadow-xl shadow-slate-200/40">
      <Icon size={24} />
    </div>
    <div>
      <h3 className="text-base font-black text-slate-900 uppercase tracking-tight leading-tight">{title}</h3>
      {subtitle && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>}
    </div>
  </div>
);

const RISKS = [
  { title: "Kechikishlar", level: "High", desc: "Ba'zi tumanlarda davomat kech kiritilmoqda." },
  { title: "Xarajatlar", level: "Medium", desc: "Oziq-ovqat narxlari oshishi kutilmoqda." },
  { title: "Gigiyena", level: "Low", desc: "Sanitariya holati bo'yicha kichik kamchiliklar." }
];

export const AIInsights = () => {
  const SMART_ALERTS = [
    { 
      id: 1, 
      time: '--:--',
      title: 'Tizim tayyor', 
      district: 'Barcha hududlar', 
      desc: 'Yangi ma\'lumotlar kiritilishini kutmoqda.', 
      type: 'info',
      insight: 'AI Status: Monitoring faol.'
    }
  ];

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(15, 23, 42); 
    doc.text('AI ANALITIK HISOBOT', 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Sana: ${timestamp}`, 20, 30);
    doc.text('Versiya: v4.0 Autonomous Monitor', 20, 35);
    
    doc.setLineWidth(0.5);
    doc.setDrawColor(226, 232, 240);
    doc.line(20, 40, 190, 40);

    // 1. Umumiy Holat
    doc.setFontSize(14);
    doc.setTextColor(79, 70, 229); 
    doc.text('1. UMUMIY HOLAT', 20, 50);
    doc.setFontSize(11);
    doc.setTextColor(51, 65, 85);
    const summary = 'Tizimda yetarli ma\'lumotlar mavjud emas. Hisobot shakllantirish uchun yangi ma\'lumotlarni kiritish talab etiladi.';
    doc.text(doc.splitTextToSize(summary, 170), 20, 60);

    // 2. Asosiy Ko‘rsatkichlar Table
    doc.setFontSize(14);
    doc.text('2. ASOSIY KO‘RSATKICHLAR', 20, 80);
    (doc as any).autoTable({
      startY: 85,
      head: [['Ko‘rsatkich', 'Qiymat', 'Holat']],
      body: [
        ['Davomat', '0%', 'Noma\'lum'],
        ['Kunlik xarajat', '0 so\'m', 'Noma\'lum'],
        ['Tejalgan mablag‘', '0 so\'m', 'Noma\'lum'],
        ['O‘rtacha ball', '0 / 3000', 'Noma\'lum'],
      ],
      theme: 'grid',
      headStyles: { fillStyle: [79, 70, 229] },
    });

    // 3. Risklar
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('3. KRITIK RISK ANALIZI', 20, finalY);
    doc.setFontSize(11);
    doc.text('Hozircha risklar aniqlanmagan.', 20, finalY + 10);

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text('Ushbu hisobot AI tomonidan avtomatik ravishda shakllantirildi.', 105, 285, { align: 'center' });

    doc.save(`AI_Audit_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#FDFEFF] pb-20 font-sans text-slate-900">
      
      {/* 🧭 HEADER */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-2xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="relative group shrink-0">
               <div className="absolute -inset-1 bg-gradient-to-r from-indigo-900 to-indigo-600 rounded-xl sm:rounded-2xl blur opacity-25"></div>
               <div className="relative w-10 h-10 sm:w-14 sm:h-14 bg-indigo-900 rounded-lg sm:rounded-2xl flex items-center justify-center shadow-xl">
                 <BrainCircuit className="text-indigo-300 sm:w-6 sm:h-6" size={24} />
               </div>
            </div>
            <div>
              <h1 className="text-base sm:text-2xl lg:text-3xl font-black tracking-tight text-slate-900 leading-none italic uppercase">AI Analitika</h1>
              <div className="flex items-center gap-2 sm:gap-3 mt-1 sm:mt-1.5">
                 <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[8px] sm:text-[9px] font-black uppercase tracking-widest">
                   <Clock size={10} className="sm:w-3 sm:h-3" /> {new Date().toLocaleDateString('uz-UZ')}
                 </span>
                 <span className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest hidden xs:inline">v4.0 Autonomous Monitor</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
             <button 
               onClick={handleDownloadPDF}
               className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black hover:bg-slate-50 transition-all shadow-sm uppercase"
             >
               <Download size={14} className="sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Hisobot</span>
             </button>
             <button className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-600/20 active:scale-95 uppercase">
               <Zap size={14} className="text-amber-300 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Scannerlash</span>
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-10 space-y-8 sm:space-y-12">

        {/* 📊 TOP CHARTS SECTION */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 lg:gap-10">
           
           {/* LEFT: PREMIUM BARCHART */}
           <div className="xl:col-span-8 bg-white p-4 sm:p-10 rounded-2xl sm:rounded-[56px] border border-slate-100 shadow-2xl shadow-slate-200/10 relative overflow-hidden group">
              <SectionHeader icon={BarChartIcon} title="Tumanlar tahlili" subtitle="Risk va ballar monitoringi" />
              
              <div className="h-[250px] sm:h-[400px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={DISTRICT_CHART_DATA} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                       <defs>
                          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                             <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="name" fontSize={8} sm:fontSize={9} axisLine={false} tickLine={false} dy={10} />
                       <YAxis fontSize={8} sm:fontSize={9} axisLine={false} tickLine={false} />
                       <Tooltip cursor={{ fill: '#f8fafc', radius: 10 }} content={<CustomTooltip />} />
                       <Bar dataKey="score" fill="url(#barGradient)" radius={[4, 4, 0, 0]} barSize={16} sm:barSize={24} />
                    </BarChart>
                 </ResponsiveContainer>
              </div>
           </div>

           {/* RIGHT: PREMIUM PIECHART */}
           <div className="xl:col-span-4 bg-white p-4 sm:p-10 rounded-2xl sm:rounded-[56px] border border-slate-100 shadow-2xl shadow-slate-200/10 relative overflow-hidden">
              <SectionHeader icon={PieChartIcon} title="Taomnoma" subtitle="Xatolar ulushi" />
              
              <div className="h-[200px] sm:h-[300px] w-full relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                       <Pie data={VIOLATION_DATA} cx="50%" cy="50%" innerRadius={50} sm:innerRadius={60} outerRadius={70} sm:outerRadius={85} paddingAngle={8} dataKey="value" stroke="none" cornerRadius={8}>
                          {VIOLATION_DATA.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                       </Pie>
                       <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                 </ResponsiveContainer>
                 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900">100%</span>
                 </div>
              </div>
           </div>
        </div>

        {/* 📊 KPI CARDS GRID */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
           {MAIN_STATS.map((stat, i) => (
             <motion.div key={i} whileHover={{ y: -5 }} className="bg-white p-4 sm:p-8 rounded-2xl sm:rounded-[44px] border border-slate-100 shadow-sm transition-all relative overflow-hidden">
                <div className="flex flex-col xs:flex-row justify-between items-start gap-3 mb-4 sm:mb-6 relative z-10">
                   <div className={clsx("w-10 h-10 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shadow-xl shrink-0", stat.status === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-indigo-50 text-indigo-600')}>
                      <stat.icon size={20} className="sm:w-6 sm:h-6" />
                   </div>
                   {stat.trend && <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-emerald-50 text-emerald-600 rounded-full text-[8px] sm:text-[9px] font-black uppercase">{stat.trend}</span>}
                </div>
                <div className="relative z-10">
                   <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 sm:mb-1 truncate">{stat.label}</p>
                   <h3 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight truncate">{stat.value}</h3>
                </div>
             </motion.div>
           ))}
        </div>

        {/* 📈 PREDICTIVE ANALYTICS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-10">
           
           {/* Predictive Trend Chart */}
           <div className="md:col-span-2 xl:col-span-8 bg-white p-6 sm:p-10 rounded-[56px] border border-slate-100 shadow-2xl shadow-slate-200/20 relative overflow-hidden group">
              <SectionHeader icon={TrendingUp} title="Samaradorlik Bashorati" subtitle="Kelgusi 3 oylik strategik prognoz (AI Model)" />
              
              <div className="h-[350px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={PREDICTIVE_TREND} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                       <defs>
                          <linearGradient id="colorPredict" x1="0" y1="0" x2="0" y2="1">
                             <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                             <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                       </defs>
                       <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 900, fill: '#64748b' }} />
                       <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }} />
                       <Tooltip content={<CustomTooltip />} />
                       <Area 
                          type="monotone" 
                          dataKey="prediction" 
                          stroke="#6366f1" 
                          strokeWidth={4}
                          fillOpacity={1} 
                          fill="url(#colorPredict)" 
                          strokeDasharray="5 5"
                       />
                       <Area 
                          type="monotone" 
                          dataKey="efficiency" 
                          stroke="#10b981" 
                          strokeWidth={4}
                          fill="transparent"
                       />
                    </AreaChart>
                 </ResponsiveContainer>
              </div>

              <div className="mt-8 flex items-center gap-6">
                 <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-[#10b981] rounded-full" />
                    <span className="text-[10px] font-black uppercase text-slate-500">Haqiqiy holat</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <div className="w-4 h-1 bg-[#6366f1] rounded-full border-dashed" />
                    <span className="text-[10px] font-black uppercase text-slate-500">AI Bashorati</span>
                 </div>
              </div>
           </div>

           {/* AI Smart Alerts */}
           <div className="md:col-span-2 xl:col-span-4 bg-slate-950 p-6 sm:p-10 rounded-[56px] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] rounded-full" />
              <SectionHeader icon={Zap} title="Smart Ogohlantirishlar" subtitle="Real-vaqtdagi AI tahlillari" />
              
              <div className="space-y-6 mt-8 relative z-10">
                 {SMART_ALERTS.map((alert) => (
                    <div key={alert.id} className="p-6 bg-white/10 border border-white/20 rounded-[32px] backdrop-blur-3xl hover:bg-white/20 transition-all group/alert relative overflow-hidden">
                       <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                             <span className={clsx(
                                "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest text-white",
                                alert.type === 'critical' ? 'bg-red-500' : 
                                alert.type === 'warning' ? 'bg-orange-500' : 
                                alert.type === 'info' ? 'bg-blue-500' : 'bg-green-500'
                             )}>
                                {alert.type}
                             </span>
                             <span className="text-[10px] font-black text-indigo-400/80 bg-indigo-500/10 px-2 py-0.5 rounded-lg">{alert.time}</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500">{alert.district}</span>
                       </div>
                       <h4 className="text-sm font-black mb-2 group-hover/alert:text-indigo-400 transition-colors">{alert.title}</h4>
                       <p className="text-xs text-slate-400 leading-relaxed font-medium mb-4">{alert.desc}</p>
                       
                       {alert.insight && (
                         <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                           <p className="text-[10px] font-black text-indigo-300 flex items-center gap-2">
                             <BrainCircuit size={12} /> {alert.insight}
                           </p>
                         </div>
                       )}
                       
                       {/* Subtle animated pulse for live feel */}
                       <div className="absolute top-2 right-2">
                          <div className={clsx(
                             "w-1.5 h-1.5 rounded-full animate-ping",
                             alert.type === 'critical' ? 'bg-[#f43f5e]' : 'bg-[#6366f1]'
                          )} />
                       </div>
                    </div>
                 ))}
              </div>
              
              <button className="w-full mt-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95">
                 Barcha detallarni ko'rish
              </button>
           </div>
        </div>

        {/* 🍎 NUTRITION & VITAMIN ANALYSIS SECTION */}
        <section className="bg-white p-6 sm:p-12 rounded-[64px] border border-slate-100 shadow-2xl shadow-slate-200/20 relative overflow-hidden">
           <SectionHeader icon={BrainCircuit} title="Oziq-ovqat va Vitamin Analizi" subtitle="Har bir element bo'yicha mukammal AI diagnostikasi" />
           
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {NUTRITION_ELEMENTS.map((item, i) => (
                <div key={i} className="p-6 sm:p-8 bg-slate-50/50 rounded-[40px] border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                   <div className="flex justify-between items-start mb-6">
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                         <item.icon size={28} />
                      </div>
                      <span className={clsx(
                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                        item.status === 'Optimal' || item.status === 'A’lo' ? 'bg-emerald-50 text-emerald-600' : 
                        item.status === 'Past' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                      )}>
                        {item.status}
                      </span>
                   </div>
                   <h4 className="text-xl font-black text-slate-900 mb-2">{item.name}</h4>
                   <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">{item.desc}</p>
                   
                   <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                         <span className="text-slate-400">Muvofiqlik darajasi</span>
                         <span className="text-slate-900">{item.value}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                         <motion.div 
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.value}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: item.color }}
                         />
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </section>

        {/* 🏆 REGIONAL LEADERS & RISK ANALYSIS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-10">
           
           {/* Top Performing Districts */}
           <div className="bg-white p-6 sm:p-10 rounded-[56px] border border-slate-100 shadow-2xl shadow-slate-200/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform">
                 <Trophy size={80} className="text-amber-500" />
              </div>
              <SectionHeader icon={Trophy} title="Hududiy Liderlar (TOP 5)" subtitle="Davlat, Xususiy va Oilaviy bog'chalar kesimida" />
              
              <div className="space-y-4">
                 {RANKING_ANALYSIS.leaders.map((leader, i) => (
                    <div key={i} className="flex items-center gap-6 p-5 bg-slate-50 rounded-[32px] border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition-all group/item">
                       <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-xl font-black text-slate-300 group-hover/item:text-emerald-500 transition-colors">
                          {i + 1}
                       </div>
                       <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                             <h4 className="text-base font-black text-slate-900">{leader.name}</h4>
                             <span className="text-xl font-black text-emerald-600">{leader.score}</span>
                          </div>
                          <div className="flex items-center gap-3">
                             <span className={clsx(
                               "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                               leader.type === 'Public' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                               leader.type === 'Private' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-purple-50 text-purple-600 border-purple-100'
                             )}>
                                {leader.factor}
                             </span>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Sparkles size={12} className="text-amber-400" /> 30 kunlik natija
                             </p>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="mt-8 p-6 bg-indigo-50 border border-indigo-100 rounded-3xl">
                 <div className="flex items-center gap-3 mb-2">
                    <BrainCircuit size={20} className="text-indigo-600" />
                    <span className="text-xs font-black uppercase text-indigo-600">AI Tavsiyasi</span>
                 </div>
                 <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
                    "Ushbu tumanlarning oziq-ovqat nazorati modelini butun viloyatga 'Best Practice' sifatida joriy etish tavsiya etiladi."
                 </p>
              </div>
           </div>

           {/* Critical / Need Attention Districts */}
           <div className="bg-white p-6 sm:p-10 rounded-[56px] border border-slate-100 shadow-2xl shadow-slate-200/20 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:-rotate-12 transition-transform">
                 <AlertOctagon size={80} className="text-rose-500" />
              </div>
              <SectionHeader icon={AlertTriangle} title="Kritik Hududlar (TOP 5)" subtitle="E'tibor talab qiluvchi tumanlar va muammolar" />
              
              <div className="space-y-4">
                 {RANKING_ANALYSIS.critical.map((item, i) => (
                    <div key={i} className="flex items-center gap-6 p-5 bg-slate-50 rounded-[32px] border border-slate-100 hover:border-rose-200 hover:bg-rose-50/30 transition-all group/item">
                       <div className="w-12 h-12 rounded-2xl bg-white shadow-lg flex items-center justify-center text-xl font-black text-slate-300 group-hover/item:text-rose-500 transition-colors">
                          !
                       </div>
                       <div className="flex-1">
                          <div className="flex justify-between items-center mb-1">
                             <h4 className="text-base font-black text-slate-900">{item.name}</h4>
                             <span className="text-xl font-black text-rose-600">{item.score}</span>
                          </div>
                          <div className="flex items-center gap-3">
                             <span className={clsx(
                               "px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                               item.type === 'Public' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                               item.type === 'Private' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-purple-50 text-purple-600 border-purple-100'
                             )}>
                                {item.type} Bog'cha
                             </span>
                             <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2">
                                <TrendingDown size={12} className="text-rose-400" /> Muammo: {item.issue}
                             </p>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="mt-8 p-6 bg-rose-50 border border-rose-100 rounded-3xl">
                 <div className="flex items-center gap-3 mb-2">
                    <Zap size={20} className="text-rose-600" />
                    <span className="text-xs font-black uppercase text-rose-600">Tezkor Chora</span>
                 </div>
                 <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
                    "Ushbu hududlarda tizimli monitoring kechikmoqda. Auditorlar guruhini yuborish va raqamli infratuzilmani tekshirish zarur."
                 </p>
              </div>
           </div>
        </div>

        {/* 🚀 ACTION PLAN FOR LOW-PERFORMING MTTS */}
        <section className="bg-white p-6 sm:p-12 rounded-[64px] border border-slate-100 shadow-2xl shadow-slate-200/20 relative overflow-hidden">
           <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-12 gap-6">
              <div>
                 <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <ShieldAlert className="text-rose-500" size={32} /> Past reytingli bog'chalarni "Sog'lomlashtirish" rejasi
                 </h2>
                 <div className="flex items-center gap-3 mt-3">
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                       <Activity size={12} /> 24/7 Real-vaqt monitoringi
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Oxirgi yangilanish: Bugun, {new Date().toLocaleTimeString().slice(0, 5)}</span>
                 </div>
              </div>
              <div className="flex flex-col items-start lg:items-end gap-2">
                 <div className="px-6 py-3 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-black uppercase tracking-widest">
                    Kritik holat: 12 ta bog'cha
                 </div>
                 <p className="text-[9px] font-bold text-slate-400 italic">Har 24 soatda AI tomonidan qayta hisoblanadi</p>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { 
                  step: '01', 
                  title: 'Avtomatik Diagnostika', 
                  desc: 'Reytingi 2100 balldan past bog\'chalar uchun AI algoritmi orqali past ko\'rsatkich sabablarini (oziq-ovqat, davomat, gigiyena) 1 soat ichida aniqlash.',
                  icon: Search,
                  color: 'rose',
                  recommendation: 'Tavsiya: Foto-hisobotlar chastotasini oshirish.'
                },
                { 
                  step: '02', 
                  title: 'Kadrlar Bilimini Yangilash', 
                  desc: 'Muammoli MTT xodimlari uchun AI platformasida maxsus "Blits-kurs" va test sinovlarini masofaviy tarzda 24 soat ichida tashkil etish.',
                  icon: Users,
                  color: 'orange',
                  recommendation: 'Tavsiya: Oshpazlar uchun sanitariya vebinari.'
                },
                { 
                  step: '03', 
                  title: 'Resurslarni Qayta Taqsimlash', 
                  desc: 'Vitamin va ozuqa yetishmovchiligi aniqlangan hududlarga qo\'shni omborlardan zaxiralarni operativ yo\'naltirish (AI Logistika).',
                  icon: Database,
                  color: 'amber',
                  recommendation: 'Tavsiya: Vitamin D zaxirasini 20% ga oshirish.'
                },
                { 
                  step: '04', 
                  title: 'Raqamli Nazoratni Kuchaytirish', 
                  desc: '24 soat davomida har bir jarayonni (ovqat tayyorlash, qabul) onlayn video-tahlil orqali AI nazoratiga o\'tkazish.',
                  icon: Zap,
                  color: 'indigo',
                  recommendation: 'Tavsiya: Face-ID tizimini qayta kalibrlash.'
                },
              ].map((item, i) => (
                <div key={i} className="relative p-6 sm:p-8 bg-slate-50 rounded-[40px] border border-slate-100 hover:bg-white hover:shadow-xl transition-all group">
                   <span className={clsx("text-6xl font-black opacity-5 absolute -top-2 -right-2 group-hover:opacity-10 transition-opacity", `text-${item.color}-500`)}>{item.step}</span>
                   <div className={clsx("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg", `bg-${item.color}-500 text-white`)}>
                      <item.icon size={28} />
                   </div>
                   <h4 className="text-xl font-black text-slate-900 mb-4">{item.title}</h4>
                   <p className="text-sm font-medium text-slate-500 leading-relaxed mb-6">{item.desc}</p>
                   
                   <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm mb-6">
                      <p className={clsx("text-[10px] font-black uppercase tracking-tight", `text-${item.color}-600`)}>
                         {item.recommendation}
                      </p>
                   </div>

                   <button className={clsx("text-[10px] font-black uppercase tracking-widest hover:underline flex items-center gap-2", `text-${item.color}-600`)}>
                      IJRONI BOSHLASH <ArrowUpRight size={14} />
                   </button>
                </div>
              ))}
           </div>

           <div className="mt-12 p-6 sm:p-10 bg-slate-950 rounded-[40px] text-white flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[80px] rounded-full" />
              <div className="flex items-center gap-8 relative z-10">
                 <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center backdrop-blur-xl border border-white/20 shadow-2xl">
                    <BrainCircuit size={40} className="text-indigo-400 animate-pulse" />
                 </div>
                 <div>
                    <h5 className="text-xl font-black italic mb-2">AI Strategik Bashorati:</h5>
                    <p className="text-slate-400 text-base max-w-2xl leading-relaxed">
                       "Agar ushbu bog'chalarda <span className="text-indigo-400">48 soat</span> ichida ijobiy siljish kuzatilmasa, tizim avtomatik ravishda ta'minotchi korxonaga nisbatan 'Kritik' ogohlantirish yuboradi va mudira reytingini 15% ga pasaytiradi."
                    </p>
                 </div>
              </div>
              <div className="flex flex-col gap-3 relative z-10">
                 <button className="px-10 py-5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl transition-all active:scale-95 whitespace-nowrap">
                    Barcha buyruqlarni ijro etish
                 </button>
                 <span className="text-[9px] font-bold text-slate-500 text-center uppercase tracking-widest">Avtomatik rejim yoqilgan</span>
              </div>
           </div>
        </section>

        {/* 💡 STRATEGIC RECOMMENDATIONS */}
        <section className="bg-slate-950 p-6 sm:p-12 lg:p-16 rounded-[64px] text-white shadow-2xl relative overflow-hidden group">
           {/* Futuristic backgrounds */}
           <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-600/20 blur-[150px] rounded-full group-hover:bg-indigo-600/30 transition-all duration-1000" />
           <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-rose-600/10 blur-[120px] rounded-full group-hover:bg-rose-600/20 transition-all duration-1000" />
           
           <div className="relative z-10">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-16 gap-8">
                 <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-3xl rounded-[32px] flex items-center justify-center border border-white/20 shadow-2xl">
                       <Lightbulb size={40} className="text-amber-400 fill-amber-400/20 animate-pulse" />
                    </div>
                    <div>
                       <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black tracking-tight leading-none italic">AI Strategik Tavsiyalar</h2>
                       <p className="text-indigo-400/60 font-black text-xs uppercase tracking-[0.4em] mt-4">Autonomous Governance v4.0</p>
                    </div>
                 </div>
                 <button 
                   onClick={handleDownloadPDF}
                   className="w-full lg:w-auto px-10 py-5 bg-white text-slate-950 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] shadow-2xl hover:bg-indigo-50 active:scale-95 transition-all"
                 >
                    Bataffil Hisobotni Yuklash
                 </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
                 {[
                   { title: 'Auditorlar Nazorati', text: 'Chiroqchi va Koson tumanlariga zudlik bilan auditorlar guruhini yuborish va joyida o‘rganish.', icon: ShieldCheck, color: 'emerald' },
                   { title: 'Logistika Optimizatsiyasi', text: 'Logistika provayderini qayta ko‘rib chiqish va kechikishlar uchun jarima sanksiyalarini qo‘llash.', icon: Zap, color: 'amber' },
                   { title: 'Xarajatlarni Boshqarish', text: 'Xususiy bog‘chalar uchun xarajatlarni optimallashtirish bo‘yicha yangi raqamli metodik qo‘llanma.', icon: Wallet, color: 'indigo' },
                   { title: 'Biometrik Monitoring', text: 'Raqamli davomatni (Face ID/Biometriya) barcha bog‘chalarda majburiy etib belgilash va integratsiya qilish.', icon: Users, color: 'rose' },
                 ].map((tavsiya, i) => (
                   <motion.div 
                     key={i} 
                     whileHover={{ x: 20 }}
                     className="flex flex-col sm:flex-row items-start gap-8 p-6 sm:p-10 bg-white/5 border border-white/10 rounded-[40px] backdrop-blur-xl group/card hover:bg-white/10 transition-all"
                   >
                      <div className={clsx("w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 shadow-2xl transition-all group-hover/card:scale-110", `bg-${tavsiya.color}-500/10 text-${tavsiya.color}-400`)}>
                         <tavsiya.icon size={28} />
                      </div>
                      <div>
                         <h4 className="text-xl font-black text-white mb-3 tracking-tight">{tavsiya.title}</h4>
                         <p className="text-lg font-medium leading-relaxed text-slate-400 group-hover/card:text-slate-200 transition-colors">{tavsiya.text}</p>
                      </div>
                   </motion.div>
                 ))}
              </div>
           </div>
        </section>

      </main>
    </div>
  );
};
