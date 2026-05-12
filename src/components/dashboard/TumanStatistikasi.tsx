import React, { useState, useMemo } from 'react';
import { districts } from '../../constants';
import KashkadaryaMap from './KashkadaryaMap';
import StatsGrid from './StatsGrid';
import DistrictDetailModal from '../modals/DistrictDetailModal';
import { motion } from 'motion/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Trophy, Medal } from 'lucide-react';

const RANK_COLORS = [
  "#f59e0b", "#94a3b8", "#b45309",
  "#6366f1","#10b981","#0ea5e9","#ec4899","#8b5cf6",
  "#f97316","#14b8a6","#a3e635","#e11d48","#0891b2","#7c3aed","#059669","#d97706",
];

interface TumanStatistikasiProps {
  CustomTooltip?: any;
}

const TumanStatistikasi: React.FC<TumanStatistikasiProps> = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  const ranked = useMemo(() =>
    [...districts]
      .map(d => ({ name: d.name, count: d.count || 0, attendance: d.attendance || 0 }))
      .sort((a, b) => b.count - a.count),
    []
  );

  const totalMTT = ranked.reduce((s, d) => s + d.count, 0);
  const maxCount = ranked[0]?.count || 1;

  return (
    <div className="space-y-8 md:space-y-12">
      <StatsGrid />

      {/* Interactive Map */}
      <div className="w-full">
        <div className="bg-white p-8 md:p-14 rounded-[4rem] shadow-sm border border-slate-100 relative overflow-hidden flex flex-col" style={{ height: "100vh" }}>
          <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full -mr-48 -mt-48 blur-3xl" />
          <div className="relative z-10 flex-1 flex items-center justify-center bg-slate-50/50 rounded-[4rem] border border-slate-100 p-10">
            <KashkadaryaMap
              selectedDistrict={selectedDistrict}
              setSelectedDistrict={setSelectedDistrict}
            />
          </div>
        </div>
      </div>

      {/* ── BOG'CHALAR SONI REYTINGI ── */}
      <div className="rounded-[2rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 border border-amber-100">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-amber-600 mb-0.5">Tumanlar reytingi</p>
              <h3 className="text-[14px] font-black text-slate-900 leading-tight">
                {"Bog'chalar soni bo'yicha tumanlar"}
              </h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-slate-900">
              {totalMTT} <span className="text-sm font-bold text-slate-400">ta MTT</span>
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Viloyat jami</p>
          </div>
        </div>

        {/* top-3 podium */}
        <div className="px-7 pt-6 pb-4 border-b border-slate-50">
          <div className="flex items-end justify-center gap-4">
            {/* 2nd */}
            {ranked[1] && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} viewport={{ once: true }}
                className="flex-1 max-w-[180px] flex flex-col items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ background: "#f1f5f9" }}>
                  <Medal className="w-5 h-5 text-slate-400" />
                </div>
                <div className="w-full rounded-t-2xl flex flex-col items-center justify-end pb-4 pt-3" style={{ height: 110, background: "linear-gradient(180deg,#e2e8f0,#f1f5f9)" }}>
                  <p className="text-xl font-black text-slate-700">{ranked[1].count}</p>
                  <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">ta MTT</p>
                </div>
                <p className="text-xs font-black text-slate-700 text-center mt-2 leading-tight">{ranked[1].name}</p>
              </motion.div>
            )}
            {/* 1st */}
            {ranked[0] && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} viewport={{ once: true }}
                className="flex-1 max-w-[200px] flex flex-col items-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 shadow-lg" style={{ background: "linear-gradient(135deg,#fbbf24,#f59e0b)" }}>
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div className="w-full rounded-t-2xl flex flex-col items-center justify-end pb-4 pt-3 shadow-md" style={{ height: 140, background: "linear-gradient(180deg,#fef3c7,#fde68a)" }}>
                  <p className="text-3xl font-black text-amber-800">{ranked[0].count}</p>
                  <p className="text-[9px] font-bold text-amber-600 uppercase tracking-wide">ta MTT</p>
                </div>
                <p className="text-sm font-black text-slate-900 text-center mt-2 leading-tight">{ranked[0].name}</p>
              </motion.div>
            )}
            {/* 3rd */}
            {ranked[2] && (
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} viewport={{ once: true }}
                className="flex-1 max-w-[180px] flex flex-col items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mb-2" style={{ background: "#fef3c7" }}>
                  <Medal className="w-5 h-5 text-amber-600" />
                </div>
                <div className="w-full rounded-t-2xl flex flex-col items-center justify-end pb-4 pt-3" style={{ height: 90, background: "linear-gradient(180deg,#fef3c7,#fef9c3)" }}>
                  <p className="text-xl font-black text-amber-700">{ranked[2].count}</p>
                  <p className="text-[9px] font-bold text-amber-500 uppercase tracking-wide">ta MTT</p>
                </div>
                <p className="text-xs font-black text-slate-700 text-center mt-2 leading-tight">{ranked[2].name}</p>
              </motion.div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-0 divide-y xl:divide-y-0 xl:divide-x divide-slate-100">
          {/* Bar chart */}
          <div className="p-6" style={{ height: 480 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ranked} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 6" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 14, fontWeight: 600 }} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false}
                  tick={{ fill: "#475569", fontSize: 14, fontWeight: 700 }} width={115} />
                <Tooltip
                  cursor={{ fill: "rgba(245,158,11,0.05)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      const rank = ranked.findIndex(r => r.name === d.name) + 1;
                      return (
                        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
                          <p style={{ fontSize: 9, fontWeight: 800, color: "#f59e0b", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>
                            #{rank} — {d.name}
                          </p>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                            <span style={{ fontSize: 22, fontWeight: 900, color: "#0f172a" }}>{d.count}</span>
                            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>ta MTT</span>
                          </div>
                          <p style={{ fontSize: 9, color: "#94a3b8", marginTop: 3 }}>
                            {((d.count / totalMTT) * 100).toFixed(1)}% jami MTTdan
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]} maxBarSize={18}
                  fill="#6366f1"
                  label={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Ranked list */}
          <div className="p-5 overflow-y-auto custom-scrollbar" style={{ maxHeight: 480 }}>
            <div className="space-y-2">
              {ranked.map((d, i) => {
                const pct = (d.count / maxCount) * 100;
                const color = i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#b45309" : RANK_COLORS[i];
                const sharePct = ((d.count / totalMTT) * 100).toFixed(1);
                return (
                  <motion.div
                    key={d.name}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => setSelectedDistrict(d.name)}
                  >
                    {/* rank badge */}
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[12px] font-black"
                      style={{
                        background: i < 3 ? color + "20" : "#f8fafc",
                        color: i < 3 ? color : "#94a3b8",
                        border: `1px solid ${i < 3 ? color + "30" : "#e2e8f0"}`,
                      }}>
                      {i + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[12px] font-black text-slate-800 truncate">{d.name}</p>
                        <div className="flex items-center gap-2 ml-2 shrink-0">
                          <span className="text-[12px] font-black text-slate-900">{d.count}</span>
                          <span className="text-[12px] font-semibold text-slate-400">ta</span>
                          <span className="text-[12px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: color + "15", color }}>
                            {sharePct}%
                          </span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, delay: i * 0.03, ease: "easeOut" }}
                          viewport={{ once: true }}
                          className="h-full rounded-full"
                          style={{ background: color }}
                        />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <DistrictDetailModal
        district={districts.find(d => d.name === selectedDistrict)}
        onClose={() => setSelectedDistrict(null)}
      />
    </div>
  );
};

export default TumanStatistikasi;
