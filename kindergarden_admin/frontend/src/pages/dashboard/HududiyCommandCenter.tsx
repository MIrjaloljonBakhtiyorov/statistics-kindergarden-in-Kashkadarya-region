import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, Home, Users, Map, Bell, Search, Filter, Grid, Activity, ChevronRight, TrendingUp, TrendingDown 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line 
} from 'recharts';
import { clsx } from 'clsx';


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
  { title: "Davlat bog‘chalari soni", value: "1,245", trend: "+2% o‘sish", icon: Building2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { title: "Xususiy bog‘chalar soni", value: "358", trend: "+15% o‘sish", icon: Building2, color: 'text-blue-500', bg: 'bg-blue-50' },
  { title: "Oilaviy bog‘chalar soni", value: "890", trend: "-1% kamayish", icon: Home, color: 'text-amber-500', bg: 'bg-amber-50' },
];

export const HududiyCommandCenter = () => {
  const [hoveredDistrict, setHoveredDistrict] = useState<typeof TUMANLAR[0] | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 p-6 space-y-6">
      <header className="flex items-center justify-between bg-white p-4 rounded-3xl shadow-sm border border-slate-100 sticky top-2 z-50">
        <div className="flex items-center gap-4">
            <h2 className="text-xl font-black text-indigo-700">Kashkadarya MTT</h2>
            <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full text-xs font-bold text-emerald-700 border border-emerald-100">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /> Real-time Monitoring
            </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input type="text" placeholder="Hudud qidirish..." className="pl-10 pr-4 py-2 rounded-xl bg-slate-50 text-sm focus:ring-2 focus:ring-indigo-500 border border-slate-100" />
          </div>
          <button className="p-2 bg-slate-50 rounded-xl text-slate-600"><Filter className="w-5 h-5"/></button>
          <button className="p-2 bg-slate-50 rounded-xl text-slate-600"><Bell className="w-5 h-5"/></button>
          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-black text-indigo-700">MT</div>
        </div>
      </header>
      
      <h1 className="text-3xl font-black text-slate-900">Hudud monitoringi</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            {STATS.map((s, i) => (
                <motion.div key={i} whileHover={{scale: 1.02}} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
                    <div className={clsx("p-4 rounded-2xl", s.bg)}><s.icon className={clsx("w-8 h-8", s.color)} /></div>
                    <div>
                        <p className="text-xs font-black text-slate-400 uppercase">{s.title}</p>
                        <p className="text-2xl font-black">{s.value}</p>
                        <p className={clsx("text-xs font-bold", s.trend.includes('+') ? 'text-emerald-500' : 'text-rose-500')}>{s.trend}</p>
                    </div>
                </motion.div>
            ))}
          </div>
          
          {/* Interactive Map */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col items-center">
             <div className="flex justify-between w-full mb-4">
                <p className="text-slate-900 font-black">Hududiy xarita diagnostikasi</p>
                <div className="text-[10px] font-bold flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"/>Real vaqt: Faol</div>
             </div>
             
             <div className="w-full h-64 bg-slate-100 rounded-2xl p-2 relative overflow-hidden">
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
                            className="cursor-pointer stroke-white stroke-2"
                            whileHover={{ scale: 1.05, fill: "#4f46e5" }}
                            onMouseEnter={() => setHoveredDistrict(d)}
                            onMouseLeave={() => setHoveredDistrict(null)}
                            onClick={() => toast.info(`Tuman detailini ochish: ${d.name}`)}
                        />
                      );
                    })}
                </svg>
                
                {hoveredDistrict && (
                    <div className="absolute top-4 left-4 bg-slate-900 text-white text-xs p-4 rounded-xl shadow-xl z-50 pointer-events-none">
                        <p className="font-black text-sm mb-2">{hoveredDistrict.name}</p>
                        <p>Davomat: {hoveredDistrict.attendance}%</p>
                        <p>Bolalar: {hoveredDistrict.children}</p>
                        <p>Bog‘chalar: {hoveredDistrict.kindergartens}</p>
                        <p className="mt-1 font-bold">Status: {getStatusLabel(hoveredDistrict.attendance)}</p>
                    </div>
                )}
             </div>

            <div className="flex gap-4 mt-4 text-[10px] font-bold text-slate-500">
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#22c55e]"/>Yaxshi (≥90%)</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#f59e0b]"/>Qoniqarli (75–89%)</div>
                <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ef4444]"/>Qoniqarsiz (&lt;75%)</div>
            </div>
          </div>
          
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 flex flex-col items-center justify-center">
             <div className="relative w-40 h-40">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={[{ value: 245780, full: 300000 }]} dataKey="value" startAngle={90} endAngle={-270} innerRadius={60} outerRadius={70} fill="#f1f5f9" stroke="none">
                             <Cell fill="#6366f1" />
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl font-black">245k</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Tarbiyalanuvchi</p>
                </div>
             </div>
             <p className="text-xs font-bold text-emerald-500 mt-4">+4.5% o‘tgan oyga nisbatan</p>
          </div>
      </div>
      
      {/* Tumanlar Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {TUMANLAR.map((tuman, i) => (
            <motion.div key={i} whileHover={{scale: 1.01}} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group">
                <h3 className="font-black mb-4 group-hover:text-indigo-700">{tuman.name}</h3>
                <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-slate-400">Bog‘chalar:</span> <span className="font-bold">{tuman.kindergartens}</span></div>
                    <div className="flex justify-between"><span className="text-slate-400">Davomat:</span> <span className={clsx("font-bold", tuman.attendance >=90 ? "text-emerald-500" : tuman.attendance >=75 ? "text-amber-500" : "text-rose-500")}>{tuman.attendance}%</span></div>
                </div>
            </motion.div>
        ))}
      </div>
      
      {/* AI Panel */}
      <div className="bg-gradient-to-br from-indigo-900 to-purple-900 p-8 rounded-3xl text-white shadow-2xl">
          <h2 className="text-xl font-black mb-6">AI Hududiy Analiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                <p className="font-bold mb-2">Qarshi tumanida davomat 76% bo‘lib, qoniqarli, lekin pasayish trendi mavjud.</p>
              </div>
              <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                <p className="font-bold mb-2">Xususiy bog‘chalar soni 15% ga oshgan, oilaviy bog‘chalar esa 1% ga kamaygan.</p>
              </div>
              <div className="bg-white/10 p-5 rounded-2xl border border-white/10">
                <p className="font-bold mb-2">Tarbiyalanuvchilar soni 4.5% ga oshgan, bu tizim yuklamasi ortayotganini ko‘rsatadi.</p>
              </div>
          </div>
      </div>
    </div>
  );
};

export default HududiyCommandCenter;
