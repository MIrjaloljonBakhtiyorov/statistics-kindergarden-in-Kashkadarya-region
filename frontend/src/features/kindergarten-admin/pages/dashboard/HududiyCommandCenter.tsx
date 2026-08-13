import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Home, Users, Map, Bell, Search, Filter, Grid, Activity, ChevronRight, TrendingUp, TrendingDown
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { clsx } from 'clsx';
import { toast } from 'sonner';


const TUMANLAR = [
  { name: "Qarshi shahri", children: 10200, kindergartens: 145, attendance: 88 },
  { name: "Qarshi tumani", children: 6800, kindergartens: 112, attendance: 76 },
  { name: "Shahrisabz tumani", children: 7800, kindergartens: 134, attendance: 85 },
  { name: "Kitob tumani", children: 7100, kindergartens: 120, attendance: 84 },
  { name: "Koson tumani", children: 8200, kindergartens: 156, attendance: 80 },
  { name: "Muborak tumani", children: 4000, kindergartens: 64, attendance: 83 },
  { name: "G‘uzor tumani", children: 6200, kindergartens: 98, attendance: 81 },
  { name: "Nishon tumani", children: 4800, kindergartens: 82, attendance: 81 },
  { name: "Dehqonobod tumani", children: 4200, kindergartens: 76, attendance: 80 },
  { name: "Qamashi tumani", children: 7600, kindergartens: 124, attendance: 83 },
  { name: "Chiroqchi tumani", children: 10800, kindergartens: 168, attendance: 81 },
  { name: "Kasbi tumani", children: 6000, kindergartens: 94, attendance: 84 },
  { name: "Mirishkor tumani", children: 5800, kindergartens: 88, attendance: 85 },
  { name: "Yakkabog‘ tumani", children: 7200, kindergartens: 110, attendance: 87 },
];

const getStatusColor = (attendance: number) =>
    attendance >= 90 ? "#22c55e" : attendance >= 75 ? "#f59e0b" : "#ef4444";
const getStatusLabel = (attendance: number) =>
    attendance >= 90 ? "Yaxshi" : attendance >= 75 ? "Qoniqarli" : "Muammo";

const STATS = [
  { title: "Davlat bog‘chalari soni", value: "1,245", trend: "+2% o‘sish", icon: Building2, color: 'text-indigo-300', bg: 'bg-indigo-500/15' },
  { title: "Xususiy bog‘chalar soni", value: "358", trend: "+15% o‘sish", icon: Building2, color: 'text-sky-300', bg: 'bg-sky-500/15' },
  { title: "Oilaviy bog‘chalar soni", value: "890", trend: "-1% kamayish", icon: Home, color: 'text-amber-300', bg: 'bg-amber-500/15' },
];

export const HududiyCommandCenter = () => {
  const [hoveredDistrict, setHoveredDistrict] = useState<typeof TUMANLAR[0] | null>(null);

  return (
    <div className="min-h-screen bg-[#0b0f10] p-4 sm:p-5 space-y-4 text-white">
      <header className="sticky top-2 z-50 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#181b1c] p-4 shadow-[0_18px_42px_rgba(0,0,0,0.24)] lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 text-white shadow-[0_14px_28px_rgba(79,70,229,0.28)]">
              <Grid className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-[18px] font-black leading-tight text-white">Hududiy boshqaruv markazi</h2>
              <div className="mt-1 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Jonli hudud tahlili
              </div>
            </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-white/10 bg-[#101415] p-1">
            <button className="rounded-lg bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-[#101415]">
              Jadval
            </button>
            <button className="rounded-lg px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors hover:text-white">
              Xarita
            </button>
          </div>
          <div className="relative min-w-[220px] flex-1 lg:flex-none">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input type="text" placeholder="Hudud qidirish..." className="h-10 w-full rounded-xl border border-white/10 bg-[#101415] pl-9 pr-4 text-[12px] font-bold text-white outline-none transition-all placeholder:text-slate-500 focus:border-indigo-400/50 focus:ring-2 focus:ring-indigo-500/20" />
          </div>
          <button className="flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-[10px] font-black uppercase tracking-widest text-[#101415] transition-transform active:scale-95">
            <Search className="h-4 w-4" /> Qidirish
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#101415] text-slate-300 transition-colors hover:text-white"><Filter className="w-4 h-4"/></button>
          <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#101415] text-slate-300 transition-colors hover:text-white"><Bell className="w-4 h-4"/></button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="space-y-4">
            {STATS.map((s, i) => (
                <motion.div key={i} whileHover={{y: -2}} className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#181b1c] p-4 shadow-sm">
                    <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent" />
                    <div className="flex items-center gap-3">
                      <div className={clsx("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", s.bg)}><s.icon className={clsx("w-5 h-5", s.color)} /></div>
                      <div className="min-w-0">
                          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-400">{s.title}</p>
                          <p className="mt-1 text-[22px] font-black leading-none text-white">{s.value}</p>
                          <p className={clsx("mt-1 text-[10px] font-bold", s.trend.includes('+') ? 'text-emerald-400' : 'text-rose-400')}>{s.trend}</p>
                      </div>
                    </div>
                </motion.div>
            ))}
          </div>

          {/* Interactive Map */}
          <div className="rounded-2xl border border-white/10 bg-[#181b1c] p-4 shadow-sm flex flex-col items-center">
             <div className="flex justify-between w-full mb-3 gap-3">
                <p className="text-[12px] font-black uppercase tracking-[0.14em] text-white">Hududiy xarita diagnostikasi</p>
                <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-300"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>Faol</div>
             </div>

             <div className="w-full h-64 rounded-xl border border-white/10 bg-[#101415] p-2 relative overflow-hidden">
                <svg viewBox="0 0 500 300" className="w-full h-full">
                    {TUMANLAR.map((d, i) => {
                      // Grid-like cluster arrangement for better visual hierarchy of 13 districts
                      const row = Math.floor(i / 4);
                      const col = i % 4;
                      const x = 50 + col * 100 + (row % 2) * 50;
                      const y = 50 + row * 60;
                      return (
                        <motion.polygon
                            key={d.name}
                            points={`${x},${y} ${x+80},${y+10} ${x+70},${y+70} ${x-10},${y+50}`}
                            fill={getStatusColor(d.attendance)}
                            className="cursor-pointer stroke-[#101415] stroke-2"
                            whileHover={{ scale: 1.05, fill: "#4f46e5" }}
                            onMouseEnter={() => setHoveredDistrict(d)}
                            onMouseLeave={() => setHoveredDistrict(null)}
                            onClick={() => toast.info(`Tuman detailini ochish: ${d.name}`)}
                        />
                      );
                    })}
                </svg>

                {hoveredDistrict && (
                    <div className="absolute top-4 left-4 bg-[#0b0f10] text-white text-[11px] p-3 rounded-xl border border-white/10 shadow-xl z-50 pointer-events-none">
                        <p className="font-black text-[12px] mb-2">{hoveredDistrict.name}</p>
                        <p>Davomat: {hoveredDistrict.attendance}%</p>
                        <p>Bolalar: {hoveredDistrict.children}</p>
                        <p>Bog‘chalar: {hoveredDistrict.kindergartens}</p>
                        <p className="mt-1 font-bold">Holat: {getStatusLabel(hoveredDistrict.attendance)}</p>
                    </div>
                )}
             </div>

            <div className="flex flex-wrap gap-3 mt-3 text-[9px] font-black uppercase tracking-wider text-slate-400">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#22c55e]"/>Yaxshi (≥90%)</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f59e0b]"/>Qoniqarli (75–89%)</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ef4444]"/>Qoniqarsiz (&lt;75%)</div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#181b1c] p-4 shadow-sm flex flex-col items-center justify-center">
             <div className="relative w-40 h-40 min-w-0">
                <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                        <Pie data={[{ value: 245780, full: 300000 }]} dataKey="value" startAngle={90} endAngle={-270} innerRadius={60} outerRadius={70} fill="#f1f5f9" stroke="none">
                             <Cell fill="#6366f1" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-[30px] font-black leading-none text-white">245k</p>
                    <p className="mt-1 text-[9px] font-black text-slate-400 uppercase tracking-widest">Tarbiyalanuvchi</p>
                </div>
             </div>
             <p className="text-[10px] font-black uppercase tracking-wider text-emerald-400 mt-3">+4.5% o‘tgan oyga nisbatan</p>
          </div>
      </div>

      {/* Tumanlar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {TUMANLAR.map((tuman, i) => (
            <motion.div key={i} whileHover={{y: -2}} className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#181b1c] p-4 shadow-sm">
                <div className="absolute inset-x-0 top-0 h-px" style={{ backgroundColor: getStatusColor(tuman.attendance) }} />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-[13px] font-black uppercase tracking-[0.08em] text-white group-hover:text-emerald-200">{tuman.name}</h3>
                    <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-slate-500">Hududiy boshqaruv</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-600 transition-colors group-hover:text-white" />
                </div>
                <div className="mt-4 space-y-2 text-[11px]">
                    <div className="flex justify-between"><span className="font-black uppercase tracking-wider text-slate-400">Bog‘chalar</span> <span className="font-black text-white">{tuman.kindergartens}</span></div>
                    <div className="flex justify-between"><span className="font-black uppercase tracking-wider text-slate-400">Davomat</span> <span className={clsx("font-black", tuman.attendance >=90 ? "text-emerald-400" : tuman.attendance >=75 ? "text-amber-400" : "text-rose-400")}>{tuman.attendance}%</span></div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full" style={{ width: `${tuman.attendance}%`, backgroundColor: getStatusColor(tuman.attendance) }} />
                    </div>
                </div>
            </motion.div>
        ))}
      </div>

      {/* AI Panel */}
      <div className="rounded-2xl border border-white/10 bg-[#181b1c] p-4 text-white shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-300" />
            <h2 className="text-[12px] font-black uppercase tracking-[0.16em]">AI Hududiy Analiz</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <p className="text-[11px] font-semibold leading-relaxed text-slate-300">Qarshi tumanida davomat 76% bo‘lib, qoniqarli, lekin pasayish trendi mavjud.</p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <p className="text-[11px] font-semibold leading-relaxed text-slate-300">Xususiy bog‘chalar soni 15% ga oshgan, oilaviy bog‘chalar esa 1% ga kamaygan.</p>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <p className="text-[11px] font-semibold leading-relaxed text-slate-300">Tarbiyalanuvchilar soni 4.5% ga oshgan, bu tizim yuklamasi ortayotganini ko‘rsatadi.</p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default HududiyCommandCenter;
