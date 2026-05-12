import React, { useState } from 'react';
import { districts } from '../../constants';
import KashkadaryaMap from './KashkadaryaMap';
import StatsGrid from './StatsGrid';
import DistrictDetailModal from '../modals/DistrictDetailModal';
import { motion } from 'motion/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { MapPin } from 'lucide-react';

const DISTRICT_AREA = [
  { name: "Qarshi sh.",     area: 100 },
  { name: "Shahrisabz sh.", area: 40 },
  { name: "Qarshi t.",      area: 4450 },
  { name: "Shahrisabz t.",  area: 3420 },
  { name: "Kitob t.",       area: 1790 },
  { name: "Koson t.",       area: 4200 },
  { name: "Muborak t.",     area: 5630 },
  { name: "G'uzor t.",      area: 3180 },
  { name: "Nishon t.",      area: 5290 },
  { name: "Dehqonobod t.",  area: 3510 },
  { name: "Qamashi t.",     area: 4760 },
  { name: "Chiroqchi t.",   area: 3720 },
  { name: "Kasbi t.",       area: 2640 },
  { name: "Mirishkor t.",   area: 5890 },
  { name: "Yakkabog' t.",   area: 2850 },
  { name: "Ko'kdala t.",    area: 3120 },
];

const TOTAL_AREA = DISTRICT_AREA.reduce((s, d) => s + d.area, 0);
const AREA_COLORS = ["#10b981","#059669","#0d9488","#0891b2","#6366f1","#8b5cf6","#ec4899","#f59e0b","#ef4444","#14b8a6","#22d3ee","#a3e635","#fb923c","#f472b6","#818cf8","#34d399"];

interface TumanStatistikasiProps {
  CustomTooltip: any;
}

const TumanStatistikasi: React.FC<TumanStatistikasiProps> = ({ CustomTooltip }) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  return (
    <div className="space-y-8 md:space-y-12">
      <StatsGrid />

      <div className="w-full">
        {/* Interactive Map */}
        <div className="w-full space-y-10">
          <div className="bg-white p-8 md:p-14 rounded-[4rem] shadow-sm border border-slate-100 relative overflow-hidden h-full min-h-[600px] flex flex-col">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
            
            <div className="relative z-10 flex-1 flex items-center justify-center bg-slate-50/50 rounded-[4rem] border border-slate-100 p-10">
              <KashkadaryaMap 
                selectedDistrict={selectedDistrict} 
                setSelectedDistrict={setSelectedDistrict} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Yer maydoni section */}
      <div className="rounded-[2rem] border border-slate-100 bg-white shadow-sm overflow-hidden">
        {/* header */}
        <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100">
              <MapPin className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 mb-0.5">Hududiy tahlil</p>
              <h3 className="text-[18px] font-black text-slate-900 leading-tight">{"Qashqadaryo — yer maydoni tumanlar kesimida"}</h3>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-slate-900">{TOTAL_AREA.toLocaleString()} <span className="text-sm font-bold text-slate-400">km²</span></p>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Umumiy maydon</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-0 divide-y xl:divide-y-0 xl:divide-x divide-slate-100">
          {/* Bar chart */}
          <div className="p-6" style={{ height: 420 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={DISTRICT_AREA} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 6" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 600 }} tickFormatter={v => `${v.toLocaleString()}`} />
                <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#475569", fontSize: 10, fontWeight: 700 }} width={90} />
                <Tooltip
                  cursor={{ fill: "rgba(16,185,129,0.04)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      return (
                        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "10px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
                          <p style={{ fontSize: 10, fontWeight: 800, color: "#10b981", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>{d.name}</p>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                            <span style={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>{d.area.toLocaleString()}</span>
                            <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>km²</span>
                          </div>
                          <p style={{ fontSize: 9, color: "#94a3b8", marginTop: 3 }}>{((d.area / TOTAL_AREA) * 100).toFixed(1)}% umumiy maydondan</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="area" radius={[0, 6, 6, 0]} maxBarSize={20}>
                  {DISTRICT_AREA.map((_, i) => <Cell key={i} fill={AREA_COLORS[i % AREA_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Cards list */}
          <div className="p-5 overflow-y-auto custom-scrollbar" style={{ maxHeight: 420 }}>
            <div className="space-y-2">
              {[...DISTRICT_AREA].sort((a, b) => b.area - a.area).map((d, i) => {
                const pct = (d.area / TOTAL_AREA) * 100;
                const color = AREA_COLORS[DISTRICT_AREA.findIndex(x => x.name === d.name) % AREA_COLORS.length];
                return (
                  <motion.div
                    key={d.name}
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    viewport={{ once: true }}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-[11px] font-black text-slate-400 w-5 shrink-0">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-black text-slate-800 truncate">{d.name}</p>
                        <p className="text-sm font-black text-slate-800 ml-2 shrink-0">{d.area.toLocaleString()} <span className="text-xs font-semibold text-slate-400">km²</span></p>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, delay: i * 0.03, ease: "easeOut" }}
                          viewport={{ once: true }}
                          className="h-full rounded-full"
                          style={{ background: color }}
                        />
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-slate-400 w-10 text-right shrink-0">{pct.toFixed(1)}%</span>
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
