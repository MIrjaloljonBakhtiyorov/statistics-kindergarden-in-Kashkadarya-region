import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Package, TrendingUp, TrendingDown, AlertTriangle, DollarSign,
  MapPin, Download, Search, Filter, Box, ArrowUpRight,
  ArrowDownRight, ArrowRightLeft, Activity, Zap, BarChart3,
  BrainCircuit, ShieldAlert, Scale, ChevronDown, FileText
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { clsx } from 'clsx';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const KPI_DATA = [
  { title: "Umumiy mahsulotlar", value: "1,245.5", unit: "tonna",    trend: "+18.6%", pos: true,  icon: Package,        color: "text-indigo-600", bg: "bg-indigo-50" },
  { title: "Sarf qilingan",      value: "845.2",   unit: "tonna",    trend: "+16.4%", pos: true,  icon: ArrowDownRight, color: "text-emerald-600", bg: "bg-emerald-50" },
  { title: "Kirim",              value: "920.0",   unit: "tonna",    trend: "+18.6%", pos: true,  icon: ArrowUpRight,   color: "text-blue-600",   bg: "bg-blue-50" },
  { title: "Chiqim",             value: "810.5",   unit: "tonna",    trend: "-8.4%",  pos: false, icon: ArrowRightLeft, color: "text-violet-600", bg: "bg-violet-50" },
  { title: "Riskdagi mahsulotlar", value: "12",    unit: "tur",      trend: "+4",     pos: false, icon: AlertTriangle,  color: "text-rose-600",   bg: "bg-rose-50" },
  { title: "Umumiy qiymat",      value: "14.5",    unit: "mln so'm", trend: "-4.4%",  pos: false, icon: DollarSign,     color: "text-amber-600",  bg: "bg-amber-50" },
];

const PRODUCTS = [
  { name: "Guruch",      total: 2400, used: 2300, unit: "kg", status: "normal",  icon: "🍚" },
  { name: "Karbohidrat", total: 3200, used: 2000, unit: "kg", status: "normal",  icon: "🌾" },
  { name: "Baliq",       total: 900,  used: 800,  unit: "kg", status: "warning", icon: "🐟" },
  { name: "Sut",         total: 5000, used: 4000, unit: "lt", status: "normal",  icon: "🥛" },
  { name: "Guruch-2",    total: 4000, used: 3200, unit: "kg", status: "normal",  icon: "🍚" },
  { name: "Tuxum",       total: 4000, used: 3900, unit: "dona", status: "danger", icon: "🥚" },
];

const TRANSACTIONS = [
  { id: "TRX-101", date: "2026-04-07 08:30", product: "Guruch",       district: "Qarshi shahri",     amount: "500 kg",    type: "Kirim",    user: "A. Qodirov" },
  { id: "TRX-102", date: "2026-04-07 08:55", product: "Karbohidrat",  district: "Koson tumani",      amount: "1200 kg",   type: "Chiqim",   user: "B. Aliyev" },
  { id: "TRX-103", date: "2026-04-07 09:40", product: "Sut",          district: "Kitob tumani",      amount: "300 lt",    type: "Transfer", user: "D. Usmonova" },
  { id: "TRX-104", date: "2026-04-07 11:00", product: "Baliq",        district: "Shahrisabz shahri", amount: "150 kg",    type: "Chiqim",   user: "S. Karimov" },
  { id: "TRX-105", date: "2026-04-07 11:30", product: "Tuxum",        district: "Qamashi tumani",    amount: "2000 dona", type: "Kirim",    user: "M. Umarov" },
];

const DISTRICT_USAGE = [
  { name: "Qarshi sh.",   real: 340 },
  { name: "Kitob",        real: 210 },
  { name: "Koson",        real: 280 },
  { name: "Chiroqchi",    real: 195 },
  { name: "G'uzor",       real: 160 },
];

const TREND_DATA = [
  { name: "1-apr",  kirim: 85000,  chiqim: 62000 },
  { name: "5-apr",  kirim: 72000,  chiqim: 58000 },
  { name: "10-apr", kirim: 110000, chiqim: 75000 },
  { name: "15-apr", kirim: 95000,  chiqim: 80000 },
  { name: "20-apr", kirim: 130000, chiqim: 95000 },
  { name: "25-apr", kirim: 115000, chiqim: 70000 },
  { name: "27-apr", kirim: 140000, chiqim: 105000 },
];

const PIE_DATA = [
  { name: "Guruch mahsulotlari", value: 420, color: "#6366f1" },
  { name: "Sut mahsulotlari",    value: 280, color: "#10b981" },
  { name: "Baliqlar",            value: 300, color: "#f59e0b" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  if (status === "normal")  return <span className="px-2 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-[9px] font-black uppercase tracking-widest">Normal</span>;
  if (status === "warning") return <span className="px-2 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-lg text-[9px] font-black uppercase tracking-widest">O'rtacha</span>;
  return                           <span className="px-2 py-1 bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-[9px] font-black uppercase tracking-widest">Kam qolgan</span>;
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export const WarehouseCommandCenter = () => {
  const [role, setRole] = useState<"super" | "tuman" | "bogcha">("super");
  const [timeFilter, setTimeFilter] = useState("7 kun");
  const [search, setSearch] = useState("");

  const filtered = TRANSACTIONS.filter(t =>
    t.product.toLowerCase().includes(search.toLowerCase()) ||
    t.district.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f4f6fb] pb-20 font-sans text-slate-900">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
              <Box className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900 leading-none">Omborxona Markazi</h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Viloyat va tumanlar mahsulotlar nazorati</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Role */}
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              {(["super", "tuman", "bogcha"] as const).map(r => (
                <button key={r} onClick={() => setRole(r)}
                  className={clsx("px-3 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all",
                    role === r ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}>
                  {r}
                </button>
              ))}
            </div>

            {/* District dropdown */}
            <button className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <MapPin size={12} className="text-indigo-500" /> Barcha tumanlar <ChevronDown size={11} className="opacity-50" />
            </button>

            {/* Time filter */}
            <div className="flex bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
              {["1 kun", "7 kun", "15 kun", "30 kun"].map(t => (
                <button key={t} onClick={() => setTimeFilter(t)}
                  className={clsx("px-2.5 py-1 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all whitespace-nowrap",
                    timeFilter === t ? "bg-indigo-50 text-indigo-700" : "text-slate-400 hover:bg-slate-50")}>
                  {t}
                </button>
              ))}
            </div>

            <button className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20">
              <FileText size={13} /> PDF Export
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── KPI Cards ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {KPI_DATA.map((kpi, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className={clsx("w-9 h-9 rounded-xl flex items-center justify-center", kpi.bg, kpi.color)}>
                  <kpi.icon size={17} />
                </div>
                <span className={clsx("text-[9px] font-black px-2 py-0.5 rounded-md",
                  kpi.pos ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600")}>
                  {kpi.trend}
                </span>
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 truncate">{kpi.title}</p>
              <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-slate-900">{kpi.value}</span>
                <span className="text-[9px] font-bold text-slate-400">{kpi.unit}</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Main Grid ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* Left 2/3 */}
          <div className="xl:col-span-2 space-y-6">

            {/* Products grid */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-black text-slate-900">Real-time Omborxona Holati</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Mavjud va sarflangan mahsulotlar ulushi</p>
                </div>
                <button className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors flex items-center gap-1.5">
                  Barchasini ko'rish <ArrowRightLeft size={12} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {PRODUCTS.map(p => {
                  const pct = Math.round((p.used / p.total) * 100);
                  const barColor = pct > 90 ? "bg-rose-500" : pct > 70 ? "bg-amber-400" : "bg-emerald-500";
                  return (
                    <div key={p.name} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-lg">{p.icon}</div>
                          <div>
                            <p className="font-black text-slate-900 text-sm">{p.name}</p>
                            <p className="text-[9px] font-bold text-slate-400 uppercase">{p.total.toLocaleString()} {p.unit} jami</p>
                          </div>
                        </div>
                        <StatusBadge status={p.status} />
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500">
                          <span>Sarflandi: <span className="text-slate-900">{p.used.toLocaleString()}</span></span>
                          <span>Qoldi: <span className="text-indigo-600">{(p.total - p.used).toLocaleString()}</span></span>
                        </div>
                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }}
                            className={clsx("h-full rounded-full", barColor)} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Transactions */}
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-base font-black text-slate-900">Tranzaksiyalar Jurnali</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Kirim va chiqimlar monitoring jurnali</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidirish..."
                      className="pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-300 w-40" />
                  </div>
                  <button className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-400 hover:bg-slate-100 transition-all">
                    <Filter size={14} />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="text-[9px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                      <th className="pb-3 text-left pl-2">Tranzaksiya</th>
                      <th className="pb-3 text-left">Sana</th>
                      <th className="pb-3 text-left">Mahsulot</th>
                      <th className="pb-3 text-left">Tuman</th>
                      <th className="pb-3 text-left">Miqdor</th>
                      <th className="pb-3 text-left">Tur</th>
                      <th className="pb-3 text-right pr-2">Mas'ul</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((t, i) => (
                      <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors text-xs">
                        <td className="py-3 pl-2 font-bold text-indigo-600">{t.id}</td>
                        <td className="py-3 text-slate-400 text-[11px]">{t.date}</td>
                        <td className="py-3 font-black text-slate-900">{t.product}</td>
                        <td className="py-3 text-slate-600">{t.district}</td>
                        <td className="py-3 font-black">{t.amount}</td>
                        <td className="py-3">
                          <span className={clsx("px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider border",
                            t.type === "Kirim"    ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                            t.type === "Chiqim"   ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                    "bg-blue-50 text-blue-600 border-blue-100")}>
                            {t.type}
                          </span>
                        </td>
                        <td className="py-3 pr-2 text-right text-slate-600">{t.user}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Tumanlar bo'yicha sarf (Tonna)</p>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <BarChart data={DISTRICT_USAGE} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontWeight: 700 }} />
                      <YAxis fontSize={9} axisLine={false} tickLine={false} tick={{ fill: "#94a3b8" }} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", fontSize: 11 }} />
                      <Bar dataKey="real" name="Sarf" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Kirim va Chiqim dinamikasi</p>
                <div className="h-52">
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                    <AreaChart data={TREND_DATA} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gKirim" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gChiqim" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" fontSize={9} axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontWeight: 700 }} />
                      <YAxis fontSize={9} axisLine={false} tickLine={false} tick={{ fill: "#94a3b8" }} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 10px 25px rgba(0,0,0,0.1)", fontSize: 11 }} />
                      <Area type="monotone" dataKey="kirim"  name="Kirim"  stroke="#10b981" strokeWidth={2.5} fill="url(#gKirim)" />
                      <Area type="monotone" dataKey="chiqim" name="Chiqim" stroke="#f43f5e" strokeWidth={2.5} fill="url(#gChiqim)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Right 1/3 */}
          <div className="space-y-5">

            {/* AI Analytics */}
            <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/15 blur-[80px] rounded-full" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white/10 rounded-xl border border-white/10 flex items-center justify-center">
                    <BrainCircuit size={18} className="text-indigo-300" />
                  </div>
                  <div>
                    <h3 className="font-black text-base">AI Analitika</h3>
                    <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest">Smart Monitor</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { color: "text-amber-400", bg: "bg-amber-400/10 border-amber-400/20", title: "Chiroqchi tumanida gidrat sarfi me'yordan 65% oshdi.", sub: "Sababi: Taomnoma me'yoridan ortiq qilingan." },
                    { color: "text-rose-400",   bg: "bg-rose-400/10 border-rose-400/20",   title: "Kodit tumanida karbohidrat mahsulot 3 turiga yetdi.", sub: "Zaxiralar 2 ta mahsulot turi uchun kietilmoqda." },
                    { color: "text-blue-400",   bg: "bg-blue-400/10 border-blue-400/20",   title: "Qarshi shahrida mahsulot sarplash samaradorligi 81% ga oshdi.", sub: "Taqqoslaganda: o'tgan oy nisbatan 4% yaxshilandi." },
                  ].map((a, i) => (
                    <div key={i} className={clsx("p-4 rounded-xl border", a.bg)}>
                      <p className="text-[11px] font-bold text-slate-200 leading-snug">{a.title}</p>
                      <p className="text-[9px] text-slate-500 mt-1.5 font-medium">{a.sub}</p>
                    </div>
                  ))}
                </div>

                <button className="w-full mt-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20">
                  To'liq nazorat
                </button>
              </div>
            </div>

            {/* Forecast */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                <Zap size={13} className="text-amber-500" /> Kelgusi 7 kunlik prognoz
              </p>
              <div className="space-y-3">
                {[
                  { icon: "📦", label: "Ehtiyoj bo'yicha", val: "2.4 tonna", trend: "-7%", neg: true },
                  { icon: "🏪", label: "Partnyorlar bo'yicha", val: "4.1 tonna", trend: "8%", neg: false },
                ].map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">{f.icon}</span>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{f.label}</p>
                        <p className="text-base font-black text-slate-900">{f.val}</p>
                      </div>
                    </div>
                    <span className={clsx("text-[10px] font-black px-2 py-0.5 rounded-lg",
                      f.neg ? "bg-rose-50 text-rose-500" : "bg-emerald-50 text-emerald-600")}>
                      {f.trend}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pie chart */}
            <div className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-4">
                <Scale size={13} className="text-indigo-500" /> Bolalar jon boshiga sarf
              </p>
              <div className="relative h-44">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <PieChart>
                    <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={52} outerRadius={70} paddingAngle={4} dataKey="value" strokeWidth={0}>
                      {PIE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 10, border: "none", fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-slate-900">1.2<span className="text-xs font-bold ml-0.5">kg</span></span>
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">O'rtacha</span>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 mt-4">
                {PIE_DATA.map(item => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="text-[10px] font-bold text-slate-500">{item.name}</span>
                    <span className="ml-auto text-[10px] font-black text-slate-700">{item.value} kg</span>
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

export default WarehouseCommandCenter;
