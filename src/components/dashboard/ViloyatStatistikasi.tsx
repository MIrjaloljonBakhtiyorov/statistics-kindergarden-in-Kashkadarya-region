import React, { useState } from 'react';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Sector, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { kindergartenTypes, COLORS, kindergartenImages, districts } from '../../constants';
import StatsGrid from './StatsGrid';
import { motion, AnimatePresence } from 'motion/react';
import { Info, Users, Home, School, Building2, Building, Wallet, Banknote, TrendingUp, Clock, MapPin } from 'lucide-react';

interface ViloyatStatistikasiProps {
  setSelectedMTTType: (type: any) => void;
  CustomTooltip: any;
}

const typeIcons = [School, Building2, Building, Home, Building2];

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 15}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#334155" style={{ fontSize: '12px', fontWeight: 900 }}>{`${value} ta`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#95b5e0" style={{ fontSize: '10px', fontWeight: 700 }}>
        {`(${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};

const ViloyatStatistikasi: React.FC<ViloyatStatistikasiProps> = ({ setSelectedMTTType, CustomTooltip }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const totalRegionalDailyCost = districts.reduce((acc, d) => {
    const covered = d.details?.totalCoveredChildren || 0;
    return acc + (Math.round(covered * 0.84) * 27600);
  }, 0);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  return (
    <div className="space-y-10 md:space-y-16 animate-in fade-in duration-1000">
      {/* Premium Gallery Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kindergartenImages.map((img, index) => (
          <motion.div 
            key={index} 
            whileHover={{ y: -10 }}
            className="group relative overflow-hidden rounded-[2.5rem] shadow-2xl aspect-[4/5] border-4 border-white"
          >
            <img 
              src={img.url} 
              alt={img.title} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>
            <div className="absolute inset-0 p-8 flex flex-col justify-end">
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                className="space-y-2"
              >
                <div className="w-10 h-1 bg-indigo-500 rounded-full"></div>
                <p className="text-white font-black text-lg md:text-xl uppercase tracking-tighter leading-none">{img.title}</p>
                <p className="text-indigo-300 text-[10px] font-bold uppercase tracking-widest">Fotogalereya</p>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      <StatsGrid />

      {/* Financial Analysis Section */}
      <div className="grid grid-cols-1 gap-8">
        {/* Expanded Financial & Attendance Analysis */}
        <div className="bg-white p-10 md:p-12 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[120px] -mr-80 -mt-80 opacity-60" />
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row gap-10 lg:items-center justify-between mb-12">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-xl mb-6">
                  <Banknote className="w-5 h-5 text-indigo-600" />
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Moliyaviy taqsimot va qamrov</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter uppercase mb-6 leading-none">Xarajatlar <span className="text-indigo-600">tahlili</span></h3>
                <p className="text-base text-slate-500 font-bold leading-relaxed italic pr-8">
                  "Ushbu bo'lim viloyatdagi bog'chalarga soat <span className="text-indigo-600">09:00 gacha</span> kelgan va soat <span className="text-rose-500">09:00 dan keyin</span> kelmagan bolalar soni, har bir bola uchun sarflanadigan kunlik xarajatlar hamda ularning ijtimoiy-iqtisodiy foydalari haqida batafsil tahliliy ma'lumot beradi."
                </p>
              </div>

              <div className="flex items-center gap-6 shrink-0">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Jami kunlik xarajat</p>
                  <p className="text-2xl font-black text-slate-900 tracking-tighter">1.2 mlrd <span className="text-xs text-slate-400 uppercase">uzs</span></p>
                </div>
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                  <TrendingUp className="w-8 h-8" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: '09:00 gacha kelganlar', value: '192,405', sub: 'bola', icon: Clock, color: 'text-[#00c853]', bg: 'bg-green-50' },
                { label: '09:00 dan keyin (kechikkanlar)', value: '12,580', sub: 'bola', icon: Users, color: 'text-[#ff6d00]', bg: 'bg-orange-50' },
                { label: 'Umuman kelmaganlar', value: '38,916', sub: 'bola', icon: Info, color: 'text-[#ff0000]', bg: 'bg-red-50' },
                { label: 'Bola boshi kunlik xarajat', value: '27,600', sub: 'so\'m', icon: Wallet, color: 'text-[#2962ff]', bg: 'bg-blue-50' },
              ].map((item, i) => (
                <div key={i} className="bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100/50 hover:bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-500 group/item">
                  <div className={`w-12 h-12 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover/item:scale-110 transition-transform`}>
                    <item.icon className="w-6 h-6" strokeWidth={3} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{item.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className={`text-2xl font-black tracking-tighter ${item.color}`}>{item.value}</p>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.sub}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-12 grid grid-cols-1 xl:grid-cols-2 gap-16 pt-12 border-t border-slate-100">
               <div className="space-y-8">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    Tumanlar bo'yicha bolalar soni
                  </h4>
                  <div className="h-[400px] w-full bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={districts.map(d => {
                          const total = d.details?.totalCoveredChildren || 0;
                          return { 
                            name: d.name.replace(' t.', '').replace(' sh.', ''), 
                            kelgan: Math.round(total * 0.84), 
                            kelmagan: Math.round(total * 0.16)
                          };
                        })} 
                        margin={{ top: 20, right: 20, left: 0, bottom: 60 }}
                      >
                        <defs>
                          <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#2962ff" />
                            <stop offset="100%" stopColor="#0039cb" />
                          </linearGradient>
                          <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#ff0000" />
                            <stop offset="100%" stopColor="#b20000" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#1e293b', fontSize: 8, fontWeight: 900 }}
                          angle={-45}
                          textAnchor="end"
                          interval={0}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#475569', fontSize: 9, fontWeight: 800 }}
                          tickFormatter={(value) => `${value/1000}k`}
                        />
                        <Tooltip 
                          cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-white/10 space-y-3">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-indigo-400 border-b border-white/10 pb-2">{payload[0].payload.name}</p>
                                  <div className="space-y-1">
                                    <div className="flex items-center justify-between gap-6">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#2962ff]" />
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Kelganlar</span>
                                      </div>
                                      <span className="text-xs font-black text-white">{payload[0].value.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-6">
                                      <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-[#ff0000]" />
                                        <span className="text-[9px] font-bold text-slate-400 uppercase">Kelmaganlar</span>
                                      </div>
                                      <span className="text-xs font-black text-[#ff5252]">{payload[1].value.toLocaleString()}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar 
                          dataKey="kelgan" 
                          fill="url(#blueGrad)" 
                          radius={[4, 4, 0, 0]} 
                          barSize={10}
                        />
                        <Bar 
                          dataKey="kelmagan" 
                          fill="url(#redGrad)" 
                          radius={[4, 4, 0, 0]} 
                          barSize={10}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>
               
               <div className="bg-slate-900 rounded-[3rem] text-white relative overflow-hidden flex flex-col group/efficiency shadow-2xl">
                  {/* Children Image/Video Background */}
                  <div className="absolute inset-0 z-0">
                    <img 
                      src="https://plus.unsplash.com/premium_photo-1681842143575-03bf1be4c11c?w=1200&auto=format&fit=crop&q=80" 
                      alt="Children drawing" 
                      className="w-full h-full object-cover opacity-100 group-hover/efficiency:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-slate-900/60 to-transparent" />
                  </div>

                  <div className="relative z-10 p-10 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl mb-6 border border-white/10">
                        <TrendingUp className="w-4 h-4 text-[#00c853]" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-white">Ijtimoiy samaradorlik</span>
                      </div>
                      <h4 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-6 leading-none">
                        Kelajak <span className="text-[#00c853]">investitsiyasi</span>
                      </h4>
                      <p className="text-base font-medium text-slate-100 leading-relaxed pr-8">
                        "Bolalarning o'z vaqtida bog'chaga kelishi ta'lim sifatini <span className="text-[#00c853] font-black">40% ga</span>, ota-onalarning ish unumdorligini esa <span className="text-[#00c853] font-black">25% ga</span> oshirishga xizmat qiladi."
                      </p>
                    </div>

                    <div className="mt-10 flex items-center gap-8">
                      <div className="flex -space-x-3">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 overflow-hidden shadow-xl">
                            <img src={`https://i.pravatar.cc/150?u=child${i}`} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        <div className="w-10 h-10 rounded-full bg-[#00c853] border-2 border-slate-900 flex items-center justify-center text-[9px] font-black text-black">
                          +240k
                        </div>
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Total Daily Cost Analysis per District */}
            <div className="mt-12 space-y-8 pt-12 border-t border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="max-w-2xl">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2 mb-3">
                    <Wallet className="w-4 h-4 text-[#2962ff]" />
                    Tumanlar kesimida kunlik xarajatlar tahlili
                  </h4>
                  <p className="text-sm text-slate-500 font-bold italic leading-relaxed">
                    "Ushbu grafik jami bolalar uchun mo'ljallangan xarajat va haqiqatda kelgan bolalar uchun sarflangan mablag'ni solishtiradi."
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <div className="bg-indigo-50 px-5 py-2.5 rounded-xl border border-indigo-100">
                    <p className="text-[9px] font-black text-[#2962ff] uppercase tracking-widest mb-1">Viloyat jami kunlik xarajati</p>
                    <p className="text-lg font-black text-[#2962ff]">{(totalRegionalDailyCost / 1000000000).toFixed(2)} <span className="text-[9px]">mlrd so'm</span></p>
                  </div>
                  <div className="bg-green-50 px-5 py-2.5 rounded-xl border border-[#00c853]/20">
                    <p className="text-[9px] font-black text-[#00c853] uppercase tracking-widest mb-1">Markaziy ko'rsatkich</p>
                    <p className="text-lg font-black text-[#00c853]">27,600 <span className="text-[9px]">so'm/bola</span></p>
                  </div>
                </div>
              </div>

              <div className="h-[350px] w-full bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-inner shadow-slate-50">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={districts.map(d => {
                      const totalChildren = d.details?.totalChildren3to7 || 0;
                      const coveredChildren = d.details?.totalCoveredChildren || 0;
                      const attending = Math.round(coveredChildren * 0.84);
                      return { 
                        name: d.name.replace(' t.', '').replace(' sh.', ''), 
                        totalCost: totalChildren * 27600,
                        attendingCost: attending * 27600
                      };
                    })}
                    margin={{ top: 20, right: 30, left: 10, bottom: 60 }}
                  >
                    <defs>
                      <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#07662f" />
                        <stop offset="100%" stopColor="#07662f" />
                      </linearGradient>
                      <linearGradient id="yellowGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#b37700" />
                        <stop offset="100%" stopColor="#b37700" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#1e293b', fontSize: 8, fontWeight: 900 }}
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#475569', fontSize: 9, fontWeight: 800 }}
                      tickFormatter={(value) => `${(value/1000000).toFixed(1)}m`}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(0, 0, 0, 0.02)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-white/10 space-y-3">
                              <p className="text-[9px] font-black uppercase tracking-widest text-[#2962ff] border-b border-white/10 pb-2">{payload[0].payload.name}</p>
                              <div className="space-y-1">
                                <div className="flex items-center justify-between gap-6">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#00c853]" />
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Jami xarajat</span>
                                  </div>
                                  <span className="text-xs font-black text-white">{payload[0].value.toLocaleString()} so'm</span>
                                </div>
                                <div className="flex items-center justify-between gap-6">
                                  <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#ffab00]" />
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Kelganlar xarajati</span>
                                  </div>
                                  <span className="text-xs font-black text-[#ffab00]">{payload[1].value.toLocaleString()} so'm</span>
                                </div>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Bar 
                      dataKey="totalCost" 
                      fill="url(#greenGrad)" 
                      radius={[4, 4, 0, 0]} 
                      barSize={10}
                    />
                    <Bar 
                      dataKey="attendingCost" 
                      fill="url(#yellowGrad)" 
                      radius={[4, 4, 0, 0]} 
                      barSize={10}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Profit & Savings Analysis Section */}
            <div className="mt-12 grid grid-cols-1 xl:grid-cols-2 gap-12 pt-12 border-t border-slate-100">
               {/* Left: District Profit List */}
               <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3">
                      <TrendingUp className="w-4 h-4 text-[#00c853]" />
                      Tumanlar kesimida foyda tahlili
                    </h4>
                    <span className="bg-[#00c853] text-white px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border border-[#00c853]">
                      Tejalgan mablag'
                    </span>
                  </div>

                  <div className="bg-slate-50/50 rounded-[2.5rem] border border-slate-100 p-6 max-h-[500px] overflow-y-auto custom-scrollbar space-y-3">
                    {districts.map((d, i) => {
                      const totalChildren = d.details?.totalChildren3to7 || 0;
                      const coveredChildren = d.details?.totalCoveredChildren || 0;
                      const absent = totalChildren - Math.round(coveredChildren * 0.84);
                      const profit = absent * 27600;

                      return (
                        <div key={i} className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between group hover:border-[#00c853]/40 hover:shadow-md transition-all">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-green-50 group-hover:text-[#00c853] transition-colors">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-xs font-black text-slate-700 uppercase tracking-tight">{d.name.replace(' t.', '').replace(' sh.', '')}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{absent.toLocaleString()} kelmagan</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-black text-[#00c853]">+{ (profit / 1000000).toFixed(1) }m</p>
                            <p className="text-[8px] font-black text-slate-400 uppercase">so'm foyda</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
               </div>

               {/* Right: Summary Information */}
               <div className="space-y-8">
                  {/* Total Savings Card */}
                  <div className="bg-gradient-to-br from-[#00c853] to-[#009624] p-10 rounded-[3rem] text-white relative overflow-hidden shadow-xl">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-2xl" />
                    <div className="relative z-10 space-y-6">
                      <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10">
                        <TrendingUp className="w-4 h-4 text-white" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-white">Viloyat bo'yicha umumiy foyda</span>
                      </div>
                      <div>
                        <p className="text-4xl font-black tracking-tighter leading-none">
                          { (districts.reduce((acc, d) => {
                            const total = d.details?.totalChildren3to7 || 0;
                            const cov = d.details?.totalCoveredChildren || 0;
                            return acc + (total - Math.round(cov * 0.84)) * 27600;
                          }, 0) / 1000000000).toFixed(2) } <span className="text-xl opacity-80">mlrd</span>
                        </p>
                        <p className="text-[10px] font-bold text-white uppercase tracking-widest mt-3 opacity-90">Bir kunlik tejalgan mablag'</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Foyda taqsimoti tahlili</h5>
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-slate-500 leading-relaxed italic">
                        "Ushbu ko'rsatkichlar kelmagan bolalar uchun ajratilgan oziq-ovqat va boshqa kunlik sarf-xarajatlarning tejalishi hisobiga shakllanadi."
                      </p>
                      <div className="pt-4 flex items-center gap-4 text-[#00c853]">
                        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
                          <TrendingUp className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">Samaradorlik: +18.4%</span>
                      </div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Analysis Section */}
      <div className="grid grid-cols-1 gap-8 md:gap-10">
        <div className="bg-white p-10 md:p-12 rounded-[3.5rem] shadow-sm border border-slate-100 group/card relative overflow-hidden flex flex-col">
          {/* Background Decoration */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-50 rounded-full blur-[100px] -mr-48 -mt-48 opacity-50"></div>
          
          <div className="relative z-10 mb-12">
            <div className="inline-flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-2xl mb-4">
              <Info className="w-4 h-4 text-indigo-600" />
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">MTT Turlari bo'yicha tahlil</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              QASHQADARYO <span className="text-indigo-600">MTTlari</span>
            </h3>
            <p className="text-sm md:text-lg text-slate-400 font-bold uppercase tracking-[0.3em] mt-4">Tashkilotlar taqsimoti va qamrovi</p>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row gap-12 items-center relative z-10">
            {/* Interactive Pie Chart */}
            <div className="flex-1 w-full h-[400px] md:h-[450px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {COLORS.map((color, i) => (
                      <linearGradient key={i} id={`pieGrad${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} />
                        <stop offset="100%" stopColor={color} stopOpacity={0.7} />
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie 
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={kindergartenTypes} 
                    innerRadius="60%" 
                    outerRadius="80%" 
                    paddingAngle={5} 
                    dataKey="count"
                    stroke="none"
                    cornerRadius={15}
                    onMouseEnter={onPieEnter}
                    onClick={(data) => setSelectedMTTType(data.payload)}
                    className="cursor-pointer focus:outline-none"
                  >
                    {kindergartenTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#pieGrad${index % 5})`} className="hover:opacity-90 transition-opacity" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Central Info Overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-6">
                <motion.span 
                  key={activeIndex}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-6xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none"
                >
                  {kindergartenTypes.reduce((acc, curr) => acc + curr.count, 0).toLocaleString()}
                </motion.span>
                <span className="text-xs md:text-sm font-black text-slate-400 uppercase tracking-[0.4em] mt-4">Jami MTTlar</span>
              </div>
            </div>

            {/* Detailed Legend List */}
            <div className="lg:w-[450px] space-y-4">
              {kindergartenTypes.map((type, index) => {
                const isActive = activeIndex === index;
                const Icon = typeIcons[index % typeIcons.length];
                return (
                  <motion.div 
                    key={type.name}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => setSelectedMTTType(type)}
                    whileHover={{ x: 10 }}
                    className={`w-full flex items-center justify-between p-6 md:p-7 rounded-[2.5rem] border transition-all duration-500 cursor-pointer ${
                      isActive 
                      ? 'bg-white shadow-2xl border-indigo-100 scale-105' 
                      : 'bg-slate-50/50 border-transparent hover:bg-white hover:border-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-6">
                      <div 
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-500 ${isActive ? 'rotate-12' : ''}`}
                        style={{ background: COLORS[index % COLORS.length] }}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <span className={`text-base md:text-lg font-black uppercase tracking-tight leading-tight block ${isActive ? 'text-indigo-600' : 'text-slate-700'}`}>
                          {type.name}
                        </span>
                        <div className="flex items-center gap-4 mt-1.5">
                          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <Users className="w-3.5 h-3.5" /> {type.children.toLocaleString()} bola
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-xl font-black text-slate-900">{type.count}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase">Tashkilot</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViloyatStatistikasi;
