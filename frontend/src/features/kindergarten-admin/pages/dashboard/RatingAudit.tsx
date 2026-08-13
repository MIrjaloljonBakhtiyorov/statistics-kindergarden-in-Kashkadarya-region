import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy, TrendingDown, Sparkles, Target, ShieldCheck,
  Activity, Search, Download, BrainCircuit, AlertTriangle,
  ChevronDown, Info, TrendingUp, Star, AlertOctagon
} from 'lucide-react';
import { clsx } from 'clsx';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid
} from 'recharts';

// ─── Data ─────────────────────────────────────────────────────────────────────

const KPI_ROW1 = [
  { label: "Oylik o'rtacha ball", value: "86.4", icon: Activity,    color: "text-indigo-300", spark: [82,84,85,83,86,87,86] },
  { label: "TOP bog'chalar",       value: "20",   icon: Trophy,      color: "text-emerald-300", spark: [18,19,20,20,20,20,20] },
  { label: "Kritik bog'chalar",    value: "12",   icon: TrendingDown, color: "text-rose-300",   spark: [8,9,10,11,12,12,12] },
  { label: "Gigiyena xatolari",    value: "45",   icon: Sparkles,    color: "text-amber-300",  spark: [30,35,38,40,42,44,45] },
  { label: "Taomnoma xatolari",    value: "28",   icon: Target,      color: "text-blue-300",   spark: [20,22,24,25,26,27,28] },
  { label: "Operatsion xatolar",   value: "15",   icon: ShieldCheck, color: "text-purple-300", spark: [10,11,12,13,14,15,15] },
];

const TOP_20 = [
  { rank: 1, name: "26-sonli Xamroi MTT",   district: "Qarshi shahri",   type: "Davlat",  score: 100, penalty: 0,   violations: 0,  status: "Excellent", reward: "Mukofotga tavsiya" },
  { rank: 2, name: "12-sonli Sarvi MTT",    district: "Kitob tumani",    type: "Davlat",  score: 98,  penalty: -2,  violations: 1,  status: "Excellent", reward: "Mukofotga tavsiya" },
  { rank: 3, name: "20-sonli Karim MTT",    district: "Koson tumani",    type: "Davlat",  score: 92,  penalty: -8,  violations: 3,  status: "Excellent", reward: "Mukofotga tavsiya" },
  { rank: 4, name: "8-sonli Quyoshcha MTT", district: "Qarshi tumani",   type: "Davlat",  score: 88,  penalty: -12, violations: 4,  status: "Good",      reward: "Rag'batlantirish" },
  { rank: 5, name: "8-sonli Navruz MTT",    district: "Kitob tumani",    type: "Davlat",  score: 86,  penalty: -14, violations: 5,  status: "Good",      reward: "Rag'batlantirish" },
  { rank: 6, name: "37-sonli Kamola MTT",   district: "Shahrisabz sh.",  type: "Xususiy", score: 82,  penalty: -18, violations: 7,  status: "Good",      reward: "Kuzatuv" },
  { rank: 7, name: "8-sonli Deyushcha MTT", district: "Chiroqchi t.",    type: "Davlat",  score: 78,  penalty: -22, violations: 8,  status: "Warning",   reward: "Ogohlantirildi" },
  { rank: 8, name: "7-sonli Navruz MTT",    district: "Koson tumani",    type: "Davlat",  score: 72,  penalty: -28, violations: 10, status: "Warning",   status2: "Jarima" },
];

const CATEGORY_TOP = [
  { label: "Barcha",  items: [
    { name: "26-sonli Xamroi MTT", score: 100, color: "bg-emerald-500" },
    { name: "12-sonli Sarvi MTT",  score: 98,  color: "bg-emerald-500" },
    { name: "20-sonli Karim MTT",  score: 92,  color: "bg-emerald-400" },
    { name: "28-sonli Gulsanam MTT", score: 90, color: "bg-emerald-400" },
    { name: "4k-sonli MTT",        score: 89,  color: "bg-amber-400" },
  ]},
];

const VIOLATIONS_CHART = [
  { name: "Taomnoma", value: 28, color: "#6366f1" },
  { name: "Gigiyena",  value: 45, color: "#10b981" },
  { name: "Davomat",   value: 20, color: "#f59e0b" },
  { name: "Sanitariya", value: 15, color: "#f43f5e" },
];

const VIOLATIONS_BAR = [
  { name: "Taomnoma",  bal: 28 },
  { name: "Gigiyena",  bal: 45 },
  { name: "Davomat",   bal: 20 },
  { name: "Sanitariya", bal: 15 },
  { name: "Foto",      bal: 8 },
];

const MONTHLY_TREND = [
  { day: "1",  score: 88 }, { day: "3",  score: 85 }, { day: "5",  score: 82 },
  { day: "7",  score: 84 }, { day: "9",  score: 86 }, { day: "11", score: 88 },
  { day: "13", score: 87 }, { day: "15", score: 84 }, { day: "17", score: 82 },
  { day: "19", score: 86 }, { day: "21", score: 88 }, { day: "23", score: 87 },
  { day: "25", score: 89 }, { day: "27", score: 86 },
];

const CRITICAL_ALERTS = [
  { title: "Al-Xorazmiy",        district: "8-sonli",           points: -45, color: "rose",   label: "JUDA PAST REYTING" },
  { title: "Gulsanam MTT",       district: "Shahrisabz tumani", points: -18, color: "amber",  label: "OGOHLANTIRILDI" },
  { title: "Aloqasiz MTT",       district: "Chiroqchi tumani",  points: -30, color: "rose",   label: "ALOQA YO'Q" },
];

const METHODOLOGY = [
  { label: "Taomnoma", penalty: "-20", color: "indigo" },
  { label: "Gigiyena",  penalty: "-15", color: "amber" },
  { label: "Sanitariya", penalty: "-10", color: "emerald" },
  { label: "Operatsion", penalty: "-5", color: "purple" },
  { label: "Davomat",    penalty: "-20", color: "rose" },
  { label: "Foto-dalil", penalty: "-5",  color: "blue" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = ({ s }: { s: string }) => {
  const cfg: Record<string, string> = {
    Excellent: "bg-emerald-400/10 text-emerald-300 border-emerald-400/25",
    Good:      "bg-sky-400/10 text-sky-300 border-sky-400/25",
    Warning:   "bg-amber-400/10 text-amber-300 border-amber-400/25",
    Critical:  "bg-rose-400/10 text-rose-300 border-rose-400/25",
  };
  return <span className={clsx("px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border", cfg[s] || cfg.Warning)}>{s}</span>;
};

const kpiIconClass = (color: string) => {
  if (color.includes('emerald')) return 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300';
  if (color.includes('rose')) return 'border-rose-400/25 bg-rose-400/10 text-rose-300';
  if (color.includes('amber')) return 'border-amber-400/25 bg-amber-400/10 text-amber-300';
  if (color.includes('blue')) return 'border-sky-400/25 bg-sky-400/10 text-sky-300';
  if (color.includes('purple')) return 'border-violet-400/25 bg-violet-400/10 text-violet-300';
  return 'border-violet-400/25 bg-violet-400/10 text-violet-300';
};

// ─── Main ─────────────────────────────────────────────────────────────────────

export const RatingAudit = () => {
  const [tab, setTab] = useState("Barcha");
  const [search, setSearch] = useState("");

  const filtered = (Array.isArray(TOP_20) ? TOP_20 : []).filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.district.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#08100f] pb-20 font-sans text-white">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#111615]/92 shadow-[0_18px_55px_rgba(0,0,0,0.28)] backdrop-blur-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-3 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#533cff] to-[#00b7a8] border border-white/10 rounded-xl shadow-lg shadow-cyan-950/30 flex items-center justify-center">
              <Trophy className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-lg font-black text-white leading-none">Reyting va Audit Statistikasi</h1>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                Barcha bog'chalar reytingi va jarimalar monitoringi
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button className="flex items-center gap-1.5 px-3 py-2 bg-[#0b1110] border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all">
              Barcha tumanlar <ChevronDown size={12} className="opacity-50" />
            </button>
            <button className="flex items-center gap-1.5 px-3 py-2 bg-[#0b1110] border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all">
              Holat <ChevronDown size={12} className="opacity-50" />
            </button>
            <div className="relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Qidirish..."
                className="pl-8 pr-3 py-2 bg-[#0b1110] border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-emerald-400/20 w-36" />
            </div>
            <button className="p-2 bg-[#0b1110] border border-white/10 rounded-xl text-slate-300 hover:bg-white/10">
              <Download size={15} />
            </button>
            <button className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#533cff] to-[#00b7a8] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-cyan-950/30">
              Xulosa
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 py-5 space-y-5">

        {/* Info banner */}
        <div className="flex items-center gap-3 p-4 bg-violet-400/10 border border-violet-400/25 rounded-2xl">
          <div className="w-8 h-8 rounded-xl bg-violet-400/10 border border-violet-400/25 flex items-center justify-center text-violet-300 shrink-0">
            <Info size={16} />
          </div>
          <p className="text-xs font-medium text-slate-200">
            <span className="font-black text-white">Oylik Reyting: </span>
            Har oy boshida barcha bog'chalar reytingi
            <span className="font-bold text-violet-300"> 100 balldan </span>
            qayta boshlanadi. Xatolar uchun ball ayiriladi.
          </p>
        </div>

        {/* Methodology */}
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Ballarni hisoblash va jarimalar metodikasi</p>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {METHODOLOGY.map((m, i) => (
              <div key={i} className="bg-[#111615] border border-white/10 rounded-2xl p-4 text-center shadow-[0_16px_48px_rgba(0,0,0,0.22)] hover:-translate-y-1 hover:border-rose-400/20 transition-all">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{m.label}</p>
                <span className="text-base font-black text-rose-300">{m.penalty}</span>
              </div>
            ))}
          </div>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          {KPI_ROW1.map((k, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-[#111615] border border-white/10 rounded-2xl p-4 shadow-[0_16px_48px_rgba(0,0,0,0.22)] hover:-translate-y-1 hover:border-emerald-400/20 transition-all">
              <div className="flex justify-between items-start mb-3">
                <div className={clsx("w-9 h-9 rounded-xl border flex items-center justify-center", kpiIconClass(k.color))}>
                  <k.icon size={17} />
                </div>
                {/* mini sparkline */}
                <div className="flex items-end gap-px h-6">
                  {k.spark.map((v, j) => (
                    <div key={j} className="w-1 rounded-sm bg-violet-300/40"
                      style={{ height: `${(v / Math.max(...k.spark)) * 24}px` }} />
                  ))}
                </div>
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 truncate">{k.label}</p>
              <p className="text-xl font-black text-white">{k.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

          {/* Left: TOP 20 + charts */}
          <div className="xl:col-span-8 space-y-5">

            {/* TOP 20 Table */}
            <div className="bg-[#111615] border border-white/10 rounded-2xl shadow-[0_18px_55px_rgba(0,0,0,0.24)] overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
                <h2 className="text-base font-black text-white flex items-center gap-2">
                  <Trophy size={17} className="text-amber-500" /> TOP 20 Bog'chalar Reytingi
                </h2>
                <button className="text-[10px] font-black text-violet-300 uppercase tracking-widest hover:text-white">
                  Barchasini ko'rish
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="bg-[#0b1110] text-[9px] font-black text-slate-300 uppercase tracking-widest border-b border-white/10">
                      <th className="px-5 py-3 text-left">O'rin</th>
                      <th className="px-4 py-3 text-left">Bog'cha nomi</th>
                      <th className="px-4 py-3 text-left">Tuman</th>
                      <th className="px-4 py-3 text-center">Ball</th>
                      <th className="px-4 py-3 text-center">Jarimalar</th>
                      <th className="px-4 py-3 text-center">Xatolar</th>
                      <th className="px-4 py-3 text-center">Holat</th>
                      <th className="px-5 py-3 text-left">Tavsiya</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r, i) => (
                      <tr key={i} className="border-b border-white/10 hover:bg-white/[0.04] transition-colors text-xs">
                        <td className="px-5 py-3">
                          <div className={clsx("w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs",
                            r.rank === 1 ? "bg-amber-400/15 text-amber-300 border border-amber-400/25" :
                            r.rank === 2 ? "bg-slate-400/10 text-slate-200 border border-white/10" :
                            r.rank === 3 ? "bg-orange-400/15 text-orange-300 border border-orange-400/25" : "bg-white/5 text-slate-300 border border-white/10")}>
                            #{r.rank}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-black text-white">{r.name}</td>
                        <td className="px-4 py-3 text-slate-300 text-[11px]">{r.district}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={clsx("text-sm font-black", r.score >= 90 ? "text-emerald-300" : r.score >= 75 ? "text-amber-300" : "text-rose-300")}>
                            {r.score}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-[11px] font-black text-rose-300">{r.penalty}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-[11px] font-bold text-slate-200">{r.violations}</span>
                        </td>
                        <td className="px-4 py-3 text-center"><StatusBadge s={r.status} /></td>
                        <td className="px-5 py-3">
                          <span className={clsx("text-[9px] font-black uppercase tracking-wider",
                            r.reward === "Mukofotga tavsiya" ? "text-emerald-300" :
                            r.reward === "Rag'batlantirish" ? "text-sky-300" : "text-amber-300")}>
                            {r.reward}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Category top + violation bar */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Category */}
              <div className="bg-[#111615] border border-white/10 rounded-2xl p-5 shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
                <div className="flex gap-2 mb-4 flex-wrap">
                  {["Barcha", "Davlat", "Xususiy", "Oilaviy"].map(t => (
                    <button key={t} onClick={() => setTab(t)}
                      className={clsx("px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all",
                        tab === t ? "bg-gradient-to-r from-[#533cff] to-[#00b7a8] text-white" : "bg-[#0b1110] border border-white/10 text-slate-300 hover:bg-white/10")}>
                      {t}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3">Kategoriyalar Top 10</p>
                <div className="space-y-2.5">
                  {CATEGORY_TOP[0].items.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-[10px] font-black text-slate-400 w-4">{i + 1}</span>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-[11px] font-bold text-white">{item.name}</span>
                          <span className="text-[11px] font-black text-white">{item.score}</span>
                        </div>
                        <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className={clsx("h-full rounded-full", item.color)} style={{ width: `${item.score}%` }} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Violations bar */}
              <div className="bg-[#111615] border border-white/10 rounded-2xl p-5 shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Xatolar va muvofiqlik</p>
                <div className="h-52 min-w-0">
                  <ResponsiveContainer width="100%" height={208}>
                    <BarChart data={VIOLATIONS_BAR} layout="vertical" margin={{ left: 10, right: 10 }}>
                      <XAxis type="number" hide />
                      <YAxis dataKey="name" type="category" axisLine={false} tickLine={false}
                        tick={{ fontSize: 10, fontWeight: 700, fill: "#e2e8f0" }} width={70} />
                      <Tooltip contentStyle={{ background: "#111615", color: "#fff", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", fontSize: 11 }} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                      <Bar dataKey="bal" radius={[0, 4, 4, 0]} barSize={18}>
                        {VIOLATIONS_BAR.map((_, i) => (
                          <Cell key={i} fill={["#6366f1","#10b981","#f59e0b","#f43f5e","#8b5cf6"][i]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Pie */}
              <div className="bg-[#111615] border border-white/10 rounded-2xl p-5 shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Qoidabuzarliklar taqsimoti</p>
                <div className="relative h-44 min-w-0">
                  <ResponsiveContainer width="100%" height={176}>
                    <PieChart>
                      <Pie data={VIOLATIONS_CHART} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={4} dataKey="value" strokeWidth={0}>
                        {VIOLATIONS_CHART.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#111615", color: "#fff", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", fontSize: 11 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-black text-white">100%</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  {VIOLATIONS_CHART.map(v => (
                    <div key={v.name} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: v.color }} />
                      <span className="text-[10px] font-bold text-slate-300">{v.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Line trend */}
              <div className="bg-[#111615] border border-white/10 rounded-2xl p-5 shadow-[0_18px_55px_rgba(0,0,0,0.24)]">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-4">Oylik trend (30 kunlik)</p>
                <div className="h-44 min-w-0">
                  <ResponsiveContainer width="100%" height={176}>
                    <LineChart data={MONTHLY_TREND} margin={{ left: -20, right: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.08)" />
                      <XAxis dataKey="day" fontSize={9} axisLine={false} tickLine={false} tick={{ fill: "#cbd5e1", fontWeight: 700 }} />
                      <YAxis fontSize={9} axisLine={false} tickLine={false} tick={{ fill: "#cbd5e1" }} domain={[70, 100]} />
                      <Tooltip contentStyle={{ background: "#111615", color: "#fff", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", fontSize: 11 }} />
                      <Line type="monotone" dataKey="score" name="Ball" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Right: AI + Critical */}
          <div className="xl:col-span-4 space-y-5">

            {/* AI Audit */}
            <div className="bg-[#11182b] border border-white/10 rounded-2xl p-6 text-white shadow-[0_22px_70px_rgba(0,0,0,0.34)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/15 blur-[80px] rounded-full" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-white/10 rounded-xl border border-white/10 flex items-center justify-center">
                    <BrainCircuit size={18} className="text-indigo-300" />
                  </div>
                  <div>
                    <h3 className="font-black text-base">AI Audit Xulosasi</h3>
                    <p className="text-[9px] font-bold text-cyan-300 uppercase tracking-widest">Real-time analysis</p>
                  </div>
                </div>

                <div className="p-4 bg-white/5 border border-white/10 rounded-xl mb-4">
                  <p className="text-[11px] font-medium text-slate-300 leading-relaxed italic">
                    "Shu oyda Shahrisabz tumanida kechikishlar me'yordan 65% oshdi. Koson tumanida taomnoma buzilishlari 3 turiga yetdi. Tezkor choralar ko'rish tavsiya etiladi."
                  </p>
                </div>

                {/* Score indicators */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { label: "Davomat ball",  val: "92.5a", color: "text-emerald-400" },
                    { label: "Taomnoma ball", val: "81.3a",  color: "text-amber-400" },
                  ].map((s, i) => (
                    <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{s.label}</p>
                      <p className={clsx("text-lg font-black", s.color)}>{s.val}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button className="py-2.5 bg-gradient-to-r from-[#533cff] to-[#00b7a8] hover:brightness-110 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                    Hisobot
                  </button>
                  <button className="py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all">
                    Audit berish
                  </button>
                </div>
              </div>
            </div>

            {/* Critical alerts */}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                <AlertOctagon size={13} className="text-rose-300" /> Kritik Ogohlantirishlar
              </p>
              <div className="space-y-3">
                {CRITICAL_ALERTS.map((a, i) => (
                  <div key={i} className={clsx("bg-[#111615] border rounded-2xl p-4 shadow-[0_16px_48px_rgba(0,0,0,0.22)]",
                    a.color === "rose" ? "border-rose-400/25" : "border-amber-400/25")}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className={clsx("text-[9px] font-black uppercase tracking-widest",
                          a.color === "rose" ? "text-rose-300" : "text-amber-300")}>{a.label}</p>
                        <p className="text-sm font-black text-white mt-0.5">{a.title}</p>
                        <p className="text-[10px] text-slate-400 font-medium">{a.district}</p>
                      </div>
                      <span className={clsx("text-sm font-black", a.color === "rose" ? "text-rose-300" : "text-amber-300")}>
                        {a.points}
                      </span>
                    </div>
                    <button className={clsx("text-[9px] font-black uppercase tracking-widest border px-3 py-1.5 rounded-lg transition-all",
                      a.color === "rose"
                        ? "border-rose-400/25 text-rose-300 hover:bg-rose-400/10"
                        : "border-amber-400/25 text-amber-300 hover:bg-amber-400/10")}>
                      Batafsil ko'rish
                    </button>
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
