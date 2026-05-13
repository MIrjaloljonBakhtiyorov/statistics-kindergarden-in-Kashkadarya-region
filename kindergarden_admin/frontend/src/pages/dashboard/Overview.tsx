import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Clock, AlertTriangle, ShieldAlert,
  Building2, Home, Filter, TrendingUp, TrendingDown,
  MapPin, X, Zap, Activity
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { clsx } from 'clsx';

const KPI_ROW1 = [
  { title: "Jami bolalar", val: "145,230", trend: 2.5, icon: Users, color: "indigo" },
  { title: "09:00 gacha", val: "135,100", trend: 1.2, icon: Clock, color: "emerald" },
  { title: "09:00 dan keyin", val: "6,500", trend: -1.5, icon: AlertTriangle, color: "amber" },
  { title: "Kelmaganlar", val: "3,630", trend: -0.8, icon: ShieldAlert, color: "rose" },
];

const KPI_ROW2 = [
  { title: "Umumiy bog'chalar", val: "1,240", trend: 0, icon: Building2, color: "violet" },
  { title: "Private", val: "450", trend: 5.2, icon: Home, color: "orange" },
  { title: "Public", val: "600", trend: 0.1, icon: Building2, color: "blue" },
  { title: "Home", val: "190", trend: 3.4, icon: Home, color: "teal" },
];

const DISTRICT_DATA = [
  { name: "Qarshi sh.", jami: 15000, qabul: 13500 },
  { name: "Qarshi t.", jami: 13000, qabul: 11800 },
  { name: "Shahrisabz sh.", jami: 10500, qabul: 9800 },
  { name: "Shahrisabz t.", jami: 9800, qabul: 9100 },
  { name: "Kitob", jami: 9200, qabul: 8400 },
  { name: "Koson", jami: 10800, qabul: 9900 },
  { name: "Muborak", jami: 8500, qabul: 7900 },
  { name: "G'uzor", jami: 7200, qabul: 6600 },
  { name: "Nishon", jami: 7500, qabul: 6900 },
  { name: "Dehqonobod", jami: 6200, qabul: 5700 },
  { name: "Qamashi", jami: 8800, qabul: 8200 },
  { name: "Chiroqchi", jami: 13200, qabul: 12000 },
  { name: "Kasbi", jami: 6800, qabul: 6200 },
  { name: "Mirishkor", jami: 5900, qabul: 5400 },
  { name: "Yakkabog'", jami: 6400, qabul: 5900 },
  { name: "Beshkent", jami: 5600, qabul: 5100 },
];

const PIE_DATA = [
  { name: "Home", value: 190, color: "#10b981" },
  { name: "Private", value: 450, color: "#f59e0b" },
  { name: "Public", value: 600, color: "#6366f1" },
];

const BOTTOM_DISTRICTS = [
  { name: "12-sonli bog'cha", hudud: "Qarshi t.", kechikkan: 12, davomat: 88 },
  { name: "5-sonli bog'cha", hudud: "G'uzor", kechikkan: 8, davomat: 92 },
  { name: "21-sonli bog'cha", hudud: "Nishon", kechikkan: 15, davomat: 85 },
];

const DISTRICT_MONITOR = [
  { name: "Qarshi sh.", davomat: 95 },
  { name: "Qarshi t.", davomat: 92 },
  { name: "Shahrisabz sh.", davomat: 95 },
  { name: "Shahrisabz t.", davomat: 95 },
  { name: "Kitob", davomat: 91 },
  { name: "Koson", davomat: 88 },
  { name: "Muborak", davomat: 97 },
  { name: "G'uzor", davomat: 90 },
  { name: "Nishon", davomat: 91 },
  { name: "Dehqonobod", davomat: 92 },
  { name: "Qamashi", davomat: 93 },
  { name: "Chiroqchi", davomat: 92 },
  { name: "Kasbi", davomat: 90 },
];

const KpiCard = ({ kpi }: { kpi: typeof KPI_ROW1[0] }) => (
  <div className="bg-white border border-slate-100 rounded-2xl p-5 flex flex-col gap-3 shadow-sm relative overflow-hidden">
    <div className="flex justify-between items-start">
      <div className={clsx(
        "w-10 h-10 rounded-xl flex items-center justify-center",
        kpi.color === "indigo" && "bg-indigo-50 text-indigo-500",
        kpi.color === "emerald" && "bg-emerald-50 text-emerald-500",
        kpi.color === "amber" && "bg-amber-50 text-amber-500",
        kpi.color === "rose" && "bg-rose-50 text-rose-500",
        kpi.color === "violet" && "bg-violet-50 text-violet-500",
        kpi.color === "orange" && "bg-orange-50 text-orange-500",
        kpi.color === "blue" && "bg-blue-50 text-blue-500",
        kpi.color === "teal" && "bg-teal-50 text-teal-500",
      )}>
        <kpi.icon size={20} />
      </div>
      <span className={clsx(
        "text-[11px] font-bold flex items-center gap-1",
        kpi.trend > 0 ? "text-emerald-500" : kpi.trend < 0 ? "text-rose-500" : "text-slate-400"
      )}>
        {kpi.trend > 0 ? <TrendingUp size={12} /> : kpi.trend < 0 ? <TrendingDown size={12} /> : null}
        {kpi.trend > 0 ? "+" : ""}{kpi.trend}%
      </span>
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{kpi.title}</p>
      <h3 className="text-2xl font-black text-slate-900 tracking-tight">{kpi.val}</h3>
    </div>
    {/* subtle bg icon */}
    <div className="absolute -bottom-3 -right-3 opacity-5">
      <kpi.icon size={64} />
    </div>
  </div>
);

export const Overview = () => {
  const [showReport, setShowReport] = useState(false);

  return (
    <div className="space-y-6 pb-20 bg-[#f4f6fb] min-h-screen">

      {/* Page Header */}
      <div className="bg-white border border-slate-100 rounded-2xl px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Viloyat statistikasi</h1>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
            Qashqadaryo viloyati bo'yicha monitoring
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Filter size={14} /> Filtr
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
            <Activity size={14} /> Live Report
          </button>
        </div>
      </div>

      {/* KPI Row 1 */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_ROW1.map((kpi, i) => <KpiCard key={i} kpi={kpi} />)}
      </div>

      {/* KPI Row 2 */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_ROW2.map((kpi, i) => <KpiCard key={i} kpi={kpi} />)}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Bar Chart */}
        <div className="lg:col-span-8 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">Tuman kesimida davomat</p>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
              <BarChart data={DISTRICT_DATA} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  fontSize={9}
                  fontWeight={700}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#94a3b8' }}
                />
                <YAxis fontSize={9} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: '11px' }}
                />
                <Bar dataKey="jami" name="Jami" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={14} />
                <Bar dataKey="qabul" name="Qabul" fill="#10b981" radius={[4, 4, 0, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart */}
        <div className="lg:col-span-4 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">Bog'cha turlari</p>
          <div className="flex-1 flex items-center justify-center">
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie
                    data={PIE_DATA}
                    dataKey="value"
                    cx="50%"
                    cy="45%"
                    innerRadius={75}
                    outerRadius={110}
                    paddingAngle={4}
                    strokeWidth={0}
                  >
                    {PIE_DATA.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Pie>
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b' }}>{value}</span>}
                  />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left: AI + District Monitor */}
        <div className="lg:col-span-8 space-y-6">

          {/* AI Analitika */}
          <div className="bg-indigo-700 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={18} className="text-yellow-300" />
              <h3 className="font-black text-base">AI Chuqur Analitika</h3>
            </div>
            <p className="text-sm text-indigo-200 leading-relaxed italic">
              "Ma'lumotlar tahlili: Davlat bog'chalari eng barqaror davomatga ega. Xususiy sektorda kechikishlar oshmoqda. Qarshi va Chiroqchi tumanlarida monitoringni kuchaytirish zarur."
            </p>
          </div>

          {/* Eng past davomat TOP */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Eng past davomat — TOP 5</p>
            <div className="space-y-3">
              {BOTTOM_DISTRICTS.map((item, i) => (
                <div key={i} className="flex items-center gap-4 py-3 border-b border-slate-50 last:border-0">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-xs font-black text-indigo-500">
                    #{i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-slate-900">{item.name}</p>
                    <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin size={9} /> {item.hudud}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-rose-500">{item.kechikkan} kechikkan</p>
                    <p className="text-[10px] font-bold text-slate-400">{item.davomat}% davomat</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Hududiy boshqaruv monitori */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-5">Hududiy boshqaruv monitori</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {DISTRICT_MONITOR.map((d, i) => {
                const barColor = d.davomat >= 93 ? "bg-emerald-500" : d.davomat >= 89 ? "bg-amber-400" : "bg-rose-500";
                return (
                  <div key={i} className="space-y-2">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{d.name}</p>
                    <p className="text-lg font-black text-slate-900">
                      {d.davomat}%
                      <span className="text-[9px] font-black text-slate-400 ml-1">DAVOMAT</span>
                    </p>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${d.davomat}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={clsx("h-full rounded-full", barColor)}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: AI Command Center */}
        <div className="lg:col-span-4 bg-[#0f172a] rounded-2xl p-6 text-white flex flex-col gap-5 shadow-sm">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-indigo-400" />
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">AI Command Center</p>
          </div>

          <div className="space-y-3 flex-1">
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-[9px] font-black text-amber-400 uppercase tracking-widest mb-1">Urgent Alert</p>
              <p className="text-xs font-medium text-slate-300">Qarshi tumanida davomat 4.2% ga pasaydi.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-[9px] font-black text-rose-400 uppercase tracking-widest mb-1">Risk Warning</p>
              <p className="text-xs font-medium text-slate-300">5 ta bog'chada ta'minot xavfi bor.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1">Good News</p>
              <p className="text-xs font-medium text-slate-300">Muborak tumanida davomat 97% ga yetdi.</p>
            </div>
          </div>

          <button
            onClick={() => setShowReport(true)}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20"
          >
            Full Report
          </button>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showReport && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl relative">
              <button onClick={() => setShowReport(false)} className="absolute top-5 right-5 p-2 hover:bg-slate-100 rounded-xl transition-all">
                <X size={18} className="text-slate-400" />
              </button>
              <h3 className="text-xl font-black text-slate-900 mb-1">AI To'liq Hisobot</h3>
              <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-6">May 2026</p>
              <div className="space-y-4">
                {["Davlat", "Xususiy", "Oilaviy"].map(type => (
                  <div key={type} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-3">{type} MTT</p>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="text-center"><p className="text-lg font-black text-emerald-600">142</p><p className="text-[9px] font-black text-slate-400 uppercase">A'lo</p></div>
                      <div className="text-center"><p className="text-lg font-black text-amber-600">86</p><p className="text-[9px] font-black text-slate-400 uppercase">O'rta</p></div>
                      <div className="text-center"><p className="text-lg font-black text-rose-600">12</p><p className="text-[9px] font-black text-slate-400 uppercase">Past</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
