import React, { useState } from 'react';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Sector, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area } from 'recharts';
import { kindergartenTypes, COLORS, kindergartenImages, districts } from '../../constants';
import StatsGrid from './StatsGrid';
import { motion, AnimatePresence } from 'motion/react';
import { Info, Users, Home, School, Building2, Building, Wallet, Banknote, TrendingUp, Clock, MapPin, ArrowUpRight, ShieldCheck, CalendarDays, ChevronRight, Layers, DownloadCloud, ArrowRight, Sparkles, BrainCircuit, Target, Lightbulb, Activity, Cpu, Zap } from 'lucide-react';

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
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#334155" style={{ fontSize: '13px', fontWeight: 900 }}>{`${value} ta`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={16} textAnchor={textAnchor} fill="#94a3b8" style={{ fontSize: '11px', fontWeight: 700 }}>
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

  const districtAnalytics = districts.map((d, index) => {
    const totalChildren = d.details?.totalChildren3to7 || 0;
    const coveredChildren = d.details?.totalCoveredChildren || 0;
    const absent = Math.max(0, totalChildren - Math.round(coveredChildren * 0.84));
    const profit = absent * 27600;
    const efficiency = totalChildren ? Math.min(99, Math.max(0, Math.round((absent / totalChildren) * 10000) / 100)) : 0;
    const base = Math.min(10, Math.max(3, Math.round(absent / 1200)));
    const sparkline = [base, Math.max(2, base - 1), base + 1, Math.max(2, base - 2), base + 2, Math.max(2, base - 1)];
    return {
      name: d.name,
      absent,
      profit,
      efficiency,
      sparkline,
      rank: index + 1,
    };
  });

  const regionalTrend = [
    { name: '14 May', profit: 1.4 },
    { name: '15 May', profit: 1.8 },
    { name: '16 May', profit: 2.3 },
    { name: '17 May', profit: 2.8 },
    { name: '18 May', profit: 3.1 },
    { name: '19 May', profit: 3.4 },
    { name: '20 May', profit: 3.74 },
  ];

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
                className="space-y-3"
              >
                <div className="w-12 h-1.5 bg-indigo-500 rounded-full"></div>
                <p className="text-white font-black text-xl md:text-2xl uppercase tracking-tighter leading-none">{img.title}</p>
                <p className="text-indigo-300 text-xs font-bold uppercase tracking-widest">Fotogalereya</p>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      <StatsGrid />

      {/* Main Analysis Section - Pie Chart */}
      <div className="grid grid-cols-1 gap-8 md:gap-10">
        <div className="bg-white p-8 md:p-10 rounded-[3rem] shadow-sm border border-slate-100 group/card relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-50 rounded-full blur-[100px] -mr-48 -mt-48 opacity-50"></div>
          
          <div className="relative z-10 mb-10">
            <div className="inline-flex items-center gap-3 bg-slate-100 px-6 py-3 rounded-2xl mb-4">
              <Info className="w-5 h-5 text-indigo-600" />
              <span className="text-xs font-black text-slate-500 uppercase tracking-widest">MTT Turlari bo'yicha tahlil</span>
            </div>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter uppercase leading-none">
              QASHQADARYO <span className="text-indigo-600">MTTlari</span>
            </h3>
            <p className="text-sm md:text-base text-slate-400 font-bold uppercase tracking-[0.3em] mt-4">Tashkilotlar taqsimoti va qamrovi</p>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row gap-12 items-center relative z-10">
            <div className="flex-1 w-full h-[450px] relative">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                  <Pie 
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    data={kindergartenTypes} 
                    innerRadius="65%" 
                    outerRadius="85%" 
                    paddingAngle={8} 
                    dataKey="count"
                    stroke="none"
                    cornerRadius={12}
                    onMouseEnter={onPieEnter}
                  >
                    {kindergartenTypes.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                        className="filter drop-shadow-lg transition-all duration-500"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                <p className="text-6xl font-black text-slate-950 tracking-tighter">
                  {kindergartenTypes.reduce((acc, curr) => acc + curr.count, 0).toLocaleString()}
                </p>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mt-2">Jami MTTlar</p>
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
              {kindergartenTypes.map((type, index) => {
                const color = COLORS[index % COLORS.length];
                const isActive = activeIndex === index;
                
                return (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.08 }}
                    onClick={() => {
                      setActiveIndex(index);
                      setSelectedMTTType(type);
                    }}
                    className={`p-8 rounded-[2.5rem] border-2 transition-all duration-500 cursor-pointer group/item relative overflow-hidden ${
                      isActive 
                        ? 'bg-slate-950 border-slate-950 shadow-2xl shadow-slate-900/40' 
                        : 'bg-white border-slate-50 hover:border-slate-200 hover:shadow-xl'
                    }`}
                  >
                    {isActive && (
                      <div 
                        className="absolute inset-0 opacity-20 blur-3xl rounded-full" 
                        style={{ backgroundColor: color }}
                      />
                    )}
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-5 mb-6">
                        <div 
                          className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${
                            isActive ? 'text-white' : 'bg-slate-50 text-slate-400 group-hover/item:scale-110'
                          }`}
                          style={{ backgroundColor: isActive ? color : undefined }}
                        >
                          {React.createElement(typeIcons[index % typeIcons.length], { size: 28, strokeWidth: 2.5 })}
                        </div>
                        <div 
                          className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-sm ${
                            isActive ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {type.count.toLocaleString()} ta
                        </div>
                      </div>
                      <h4 className={`text-base font-black uppercase tracking-tight mb-3 leading-tight ${isActive ? 'text-white' : 'text-slate-900'}`}>
                        {type.name}
                      </h4>
                      <p className={`text-sm font-bold ${isActive ? 'text-slate-400' : 'text-slate-500'}`}>
                        {type.children.toLocaleString()} bola qamrovi
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="bg-white p-8 md:p-14 rounded-[4rem] border border-slate-100 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-50/50 rounded-full blur-[120px] -mr-64 -mt-64 opacity-60"></div>
            <div className="absolute left-0 bottom-0 w-96 h-96 bg-emerald-50/40 rounded-full blur-[100px] -ml-32 -mb-32"></div>
            
            <div className="relative z-10 flex flex-col xl:flex-row xl:items-start justify-between gap-16 mb-16">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-4 bg-indigo-600 text-white px-8 py-4 rounded-[2rem] mb-10 shadow-xl shadow-indigo-200 group cursor-pointer hover:bg-indigo-700 transition-all">
                  <TrendingUp className="w-6 h-6 group-hover:scale-125 transition-transform" />
                  <span className="text-base font-black uppercase tracking-[0.2em]">Moliyaviy Monitoring</span>
                  <Zap className="w-4 h-4 text-indigo-300 animate-pulse" />
                </div>
                <h3 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter uppercase mb-10 leading-[0.9]">Tizimli <span className="text-indigo-600 italic">Nazorat</span> va Xarajatlar</h3>
                <p className="text-xl text-slate-500 font-bold leading-relaxed italic pr-12 border-l-4 border-indigo-100 pl-8">
                  "Viloyat bo'ylab MTTlar faoliyatini real vaqt rejimida monitoring qilish orqali mablag'larning <span className="text-indigo-600 font-black underline decoration-indigo-200 underline-offset-8">maqsadli sarflanishini</span> va davomat bilan bog'liq iqtisodiy samaradorlikni ta'minlash."
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-10 shrink-0">
                <div className="bg-slate-50 p-10 rounded-[3.5rem] border border-slate-100 shadow-inner group/total cursor-pointer hover:bg-white hover:shadow-2xl transition-all duration-700">
                  <p className="text-sm font-black text-slate-400 uppercase tracking-[0.3em] mb-4">Jami kunlik xarajat</p>
                  <div className="flex items-baseline gap-4">
                    <p className="text-5xl font-black text-slate-900 tracking-tighter group-hover:text-indigo-600 transition-colors">1.28 <span className="text-xl text-slate-400 uppercase tracking-widest">mlrd</span></p>
                    <div className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-black tracking-widest">+4.2%</div>
                  </div>
                </div>
                <div className="w-24 h-24 bg-indigo-600 text-white rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-indigo-200 hover:rotate-12 transition-transform cursor-pointer">
                  <TrendingUp className="w-12 h-12" />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
              {[
                { label: '09:00 gacha kelganlar', value: '192,405', sub: 'bola', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50', trend: '92%', trendLabel: 'Davomat' },
                { label: '09:00 dan keyin (kechikkan)', value: '12,580', sub: 'bola', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50', trend: '6%', trendLabel: 'Kechikish' },
                { label: 'Umuman kelmaganlar', value: '38,916', sub: 'bola', icon: Users, color: 'text-rose-600', bg: 'bg-rose-50', trend: '18%', trendLabel: 'Kelmagan' },
                { label: 'Bola boshi kunlik xarajat', value: '27,600', sub: 'so\'m', icon: Wallet, color: 'text-indigo-600', bg: 'bg-indigo-50', trend: 'Stabil', trendLabel: 'Tarif' },
              ].map((item, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  className="bg-slate-50/50 p-10 rounded-[3rem] border border-slate-100/50 hover:bg-white hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group/item relative overflow-hidden flex flex-col items-center text-center"
                >
                  <div className={`absolute top-0 right-0 w-24 h-24 ${item.bg} opacity-20 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-700`}></div>
                  
                  <div className={`w-16 h-16 ${item.bg} ${item.color} rounded-2xl flex items-center justify-center mb-10 shadow-sm group-hover:scale-110 transition-transform relative z-10`}>
                    <item.icon className="w-8 h-8" strokeWidth={2.5} />
                  </div>
                  
                  <div className="relative z-10 w-full">
                    <p className="text-sm font-black text-black uppercase tracking-[0.25em] mb-4 leading-relaxed min-h-[2.5rem]">{item.label}</p>
                    <div className="flex items-center justify-center gap-3 mb-6">
                      <p className={`text-3xl lg:text-4xl font-black tracking-tighter ${item.color}`}>{item.value}</p>
                      <span className="text-xs font-black text-black uppercase tracking-widest">{item.sub}</span>
                    </div>
                    
                    <div className="flex items-center justify-center gap-6 pt-6 border-t border-slate-100/50">
                       <span className="text-[11px] font-black text-black uppercase tracking-widest">{item.trendLabel}</span>
                       <span className={`text-sm font-black ${item.color}`}>{item.trend}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="mt-12 grid grid-cols-1 xl:grid-cols-2 gap-16 pt-12 border-t border-slate-100">
               <div className="space-y-10">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-4">
                    <MapPin className="w-5 h-5 text-indigo-600" />
                    Tumanlar bo'yicha bolalar soni
                  </h4>
                  <div className="h-[800px] w-full bg-slate-50/50 p-8 rounded-[3rem] border border-slate-100">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <BarChart 
                        data={districts.map(d => {
                          const total = d.details?.totalCoveredChildren || 0;
                          return { 
                            name: d.name, 
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
                            <stop offset="100%" stopColor="#f51010" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#003170" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#031430', fontSize: 10, fontWeight: 900 }}
                          angle={-45}
                          textAnchor="end"
                          interval={0}
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fill: '#09469b', fontSize: 11, fontWeight: 800 }}
                          tickFormatter={(value) => `${value/1000}k`}
                        />
                        <Tooltip 
                          cursor={{ fill: 'rgba(238, 34, 34, 0.02)' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl border border-white/10 space-y-4">
                                  <p className="text-xs font-black uppercase tracking-widest text-indigo-400 border-b border-white/10 pb-3">{payload[0].payload.name}</p>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between gap-8">
                                      <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-[#2962ff]" />
                                        <span className="text-xs font-bold text-slate-400 uppercase">Kelganlar</span>
                                      </div>
                                      <span className="text-sm font-black text-white">{payload[0].value.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between gap-8">
                                      <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-[#ff0000]" />
                                        <span className="text-xs font-bold text-slate-400 uppercase">Kelmaganlar</span>
                                      </div>
                                      <span className="text-sm font-black text-[#ff5252]">{payload[1].value.toLocaleString()}</span>
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
                          barSize={12}
                        />
                        <Bar 
                          dataKey="kelmagan" 
                          fill="url(#redGrad)" 
                          radius={[4, 4, 0, 0]} 
                          barSize={12}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>
               
               <div className="bg-slate-900 rounded-[3rem] text-white relative overflow-hidden flex flex-col group/efficiency shadow-2xl">
                  <div className="absolute inset-0 z-0">
                    <img 
                      src="https://plus.unsplash.com/premium_photo-1681842143575-03bf1be4c11c?w=1200&auto=format&fit=crop&q=80" 
                      alt="Children drawing" 
                      className="w-full h-full object-cover opacity-40 group-hover/efficiency:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-slate-900/60 to-transparent" />
                  </div>

                  <div className="relative z-10 p-12 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl mb-10 border border-white/10">
                        <Sparkles className="w-6 h-6 text-[#00c853]" />
                        <span className="text-sm font-black uppercase tracking-widest text-white">Ijtimoiy-Iqtisodiy samaradorlik</span>
                      </div>
                      <h4 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-10 leading-none">
                        Kelajak <br/><span className="text-[#00c853]">investitsiyasi</span>
                      </h4>
                      <div className="space-y-8 pr-4">
                        <p className="text-xl font-medium text-slate-100 leading-relaxed italic border-l-4 border-[#00c853] pl-6">
                          "Maktabgacha ta'limga yo'naltirilgan har bir mablag' kelajakda jamiyatga <span className="text-[#00c853] font-black underline decoration-2 underline-offset-4">7 barobar</span> ko'p foyda bo'lib qaytadi."
                        </p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 group-hover/efficiency:bg-white/10 transition-all">
                             <div className="flex items-center gap-4 mb-3">
                               <div className="w-10 h-10 bg-[#00c853]/20 rounded-xl flex items-center justify-center">
                                 <Target className="w-6 h-6 text-[#00c853]" />
                               </div>
                               <span className="text-3xl font-black text-white">40%</span>
                             </div>
                             <p className="text-sm font-bold text-slate-300 uppercase tracking-widest leading-tight">Ta'lim sifati va samaradorlik o'sishi</p>
                          </div>
                          
                          <div className="bg-white/5 backdrop-blur-xl p-6 rounded-3xl border border-white/10 group-hover/efficiency:bg-white/10 transition-all">
                             <div className="flex items-center gap-4 mb-3">
                               <div className="w-10 h-10 bg-indigo-500/20 rounded-xl flex items-center justify-center">
                                 <TrendingUp className="w-6 h-6 text-indigo-400" />
                               </div>
                               <span className="text-3xl font-black text-white">25%</span>
                             </div>
                             <p className="text-sm font-bold text-slate-300 uppercase tracking-widest leading-tight">Ota-onalarning mehnat unumdorligi</p>
                          </div>
                        </div>

                        <p className="text-lg font-bold text-slate-400 leading-relaxed">
                          Ushbu ko'rsatkichlar viloyat bo'yicha inson kapitalini rivojlantirish va iqtisodiy barqarorlikni ta'minlashda strategik ahamiyatga ega.
                        </p>
                      </div>
                    </div>

                    <div className="mt-14 flex items-center justify-between gap-10">
                      <div className="flex -space-x-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                          <div key={i} className="w-14 h-14 rounded-full border-2 border-slate-900 overflow-hidden shadow-2xl hover:scale-110 transition-transform cursor-pointer relative z-[5]">
                            <img src={`https://i.pravatar.cc/150?u=child${i}`} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        <div className="w-14 h-14 rounded-full bg-[#00c853] border-2 border-slate-900 flex items-center justify-center text-sm font-black text-black z-[10] shadow-2xl">
                          +240k
                        </div>
                      </div>
                      <div className="flex items-center gap-4 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                        <div className="w-2 h-2 rounded-full bg-[#00c853] animate-ping" />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-300">Faol qamrov</span>
                      </div>
                    </div>
                  </div>
               </div>
            </div>

            {/* Total Daily Cost Analysis per District */}
            <div className="mt-12 space-y-10 pt-12 border-t border-slate-100">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="max-w-2xl">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-3 mb-4">
                    <Wallet className="w-5 h-5 text-[#2962ff]" />
                    Tumanlar kesimida kunlik xarajatlar tahlili
                  </h4>
                  <p className="text-base text-slate-500 font-bold italic leading-relaxed">
                    "Ushbu grafik jami bolalar uchun mo'ljallangan xarajat va haqiqatda kelgan bolalar uchun sarflangan mablag'ni solishtiradi."
                  </p>
                </div>
                <div className="flex items-center gap-6 shrink-0">
                  <div className="bg-indigo-50 px-6 py-4 rounded-2xl border border-indigo-100">
                    <p className="text-xs font-black text-[#2962ff] uppercase tracking-widest mb-2">Viloyat jami kunlik xarajati</p>
                    <p className="text-2xl font-black text-[#2962ff]">{(totalRegionalDailyCost / 1000000000).toFixed(2)} <span className="text-xs">mlrd so'm</span></p>
                  </div>
                  <div className="bg-green-50 px-6 py-4 rounded-2xl border border-[#00c853]/20">
                    <p className="text-xs font-black text-[#00c853] uppercase tracking-widest mb-2">Markaziy ko'rsatkich</p>
                    <p className="text-2xl font-black text-[#00c853]">27,600 <span className="text-xs">so'm/bola</span></p>
                  </div>
                </div>
              </div>

              <div className="h-[600px] w-full bg-white p-8 rounded-[3rem] border border-slate-100 shadow-inner shadow-slate-50">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                  <BarChart 
                    data={districts.map(d => {
                      const totalChildren = d.details?.totalChildren3to7 || 0;
                      const coveredChildren = d.details?.totalCoveredChildren || 0;
                      const attending = Math.round(coveredChildren * 0.84);
                      return { 
                        name: d.name, 
                        totalCost: totalChildren * 27600,
                        attendingCost: attending * 27600
                      };
                    })}
                    margin={{ top: 20, right: 30, left: 10, bottom: 60 }}
                  >
                    <defs>
                      <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#03df5e" />
                        <stop offset="100%" stopColor="#03df5e" />
                      </linearGradient>
                      <linearGradient id="yellowGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#ffab00" stopOpacity={1} />
                        <stop offset="100%" stopColor="#ffab00" stopOpacity={1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#003870" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#224703', fontSize: 14, fontWeight: 900 }}
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#0065f3', fontSize: 14, fontWeight: 800 }}
                      tickFormatter={(value) => `${(value/1000000).toFixed(1)}m`}
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(214, 6, 6, 0.02)' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          return (
                            <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl border border-white/10 space-y-4">
                              <p className="text-xs font-black uppercase tracking-widest text-indigo-400 border-b border-white/10 pb-3">{payload[0].payload.name}</p>
                              <div className="space-y-2">
                                <div className="flex items-center justify-between gap-8">
                                  <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[#059669]" />
                                    <span className="text-xs font-bold text-slate-400 uppercase">Jami xarajat</span>
                                  </div>
                                  <span className="text-sm font-black text-white">{payload[0].value.toLocaleString()} so'm</span>
                                </div>
                                <div className="flex items-center justify-between gap-8">
                                  <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[#d97706]" />
                                    <span className="text-xs font-bold text-slate-400 uppercase">Kelganlar xarajati</span>
                                  </div>
                                  <span className="text-sm font-black text-[#d97706]">{payload[1].value.toLocaleString()} so'm</span>
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
                      barSize={12}
                    />
                    <Bar 
                      dataKey="attendingCost" 
                      fill="url(#yellowGrad)" 
                      radius={[4, 4, 0, 0]} 
                      barSize={12}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Profit & Savings Analysis Section */}
            <div className="mt-12 pt-12 border-t-2 border-slate-100">
              <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-6">
                  <div className="rounded-[2.5rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500"></div>
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
                      <div>
                          <p className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-700 flex items-center gap-3 mb-2">
                             <TrendingUp className="w-5 h-5" /> TUMANLAR KESIMIDA FOYDA TAHLILI
                          </p>
                          <h4 className="text-2xl md:text-3xl font-black text-slate-950 leading-tight tracking-tighter">Tumanlararo tejalgan mablag‘lar</h4>
                      </div>
                    </div>

                    <div className="max-h-[380px] overflow-y-auto pr-3 custom-scrollbar space-y-3">
                      {districtAnalytics.map((item, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          viewport={{ once: true }}
                          key={item.name} 
                          className="group flex flex-col gap-4 rounded-[1.8rem] border border-slate-100 bg-slate-50/70 p-5 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-300 hover:bg-white sm:flex-row sm:items-center sm:justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white group-hover:bg-emerald-500 transition-colors duration-500 text-sm font-black shadow-lg shadow-emerald-500/20">{String(item.rank).padStart(2, '0')}</div>
                            <div>
                              <p className="text-base font-black uppercase tracking-tight text-slate-950 group-hover:text-emerald-700 transition-colors">{item.name}</p>
                              <p className="text-xs font-bold text-slate-500 mt-1">{item.absent.toLocaleString()} nafar bola</p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1 text-right">
                            <div className="inline-flex items-center justify-end gap-2 rounded-xl bg-white px-4 py-2 text-sm font-black text-emerald-700 shadow-sm border border-slate-100 group-hover:border-emerald-300 transition-colors">
                              +{(item.profit / 1000000).toFixed(1)}m <span className="text-[10px] text-slate-400">so'm</span>
                            </div>
                            <div className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.15em] text-slate-400 justify-end mt-1">
                              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                              Samaradorlik: {item.efficiency}%
                            </div>
                          </div>

                          <div className="flex h-10 items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity pr-2">
                            {item.sparkline.map((value, sparkIndex) => (
                              <motion.span
                                initial={{ height: 0 }}
                                whileInView={{ height: `${value * 4 + 8}px` }}
                                transition={{ duration: 0.6, delay: sparkIndex * 0.08, ease: "easeOut" }}
                                key={sparkIndex}
                                className="block w-2 rounded-full bg-emerald-500 shadow-sm"
                              />
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="relative overflow-hidden rounded-[3rem] bg-gradient-to-br from-emerald-600 via-emerald-700 to-green-800 p-10 text-white shadow-2xl group"
                  >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.pattern')] opacity-5" />
                    <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/20 blur-[80px] group-hover:bg-white/30 transition-all duration-1000" />
                    
                    <div className="relative z-10 space-y-10">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="inline-flex items-center gap-4 rounded-xl bg-white/15 backdrop-blur-xl border border-white/25 px-6 py-3 text-[10px] uppercase tracking-[0.3em] text-white shadow-xl">
                          <ArrowUpRight className="w-5 h-5 text-emerald-300" />
                          <span className="font-black">VILOYAT UMUMIY FOYDASI</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h2 className="text-6xl font-black tracking-tighter leading-none">
                          {(districts.reduce((acc, d) => {
                            const total = d.details?.totalChildren3to7 || 0;
                            const cov = d.details?.totalCoveredChildren || 0;
                            return acc + (total - Math.round(cov * 0.84)) * 27600;
                          }, 0) / 1000000000).toFixed(2)} 
                          <span className="text-2xl font-black text-emerald-300 ml-3 uppercase tracking-tighter">mlrd</span>
                        </h2>
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-emerald-100/80">Kunlik o'rtacha tejamkorlik</p>
                      </div>
                    </div>

                    <div className="mt-10 h-[220px] rounded-[2.5rem] bg-black/20 backdrop-blur-md border border-white/10 p-6 shadow-inner relative group/chart">
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                        <LineChart data={regionalTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="linePremiumVibrant" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0%" stopColor="#6ee7b7" stopOpacity={0.9} />
                              <stop offset="100%" stopColor="#ffffff" stopOpacity={1} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="rgba(255, 255, 255, 0.15)" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 11, fontWeight: 800 }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255, 255, 255, 0.9)', fontSize: 11, fontWeight: 900 }} />
                          <Tooltip 
                            cursor={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 2 }}
                            content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white text-slate-950 p-4 rounded-2xl shadow-2xl">
                                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2">{payload[0].payload.name}</p>
                                  <p className="font-black text-xl">{payload[0].value} <span className="text-xs text-slate-400">mlrd</span></p>
                                </div>
                              );
                            }
                            return null;
                          }} />
                          <Line type="monotone" dataKey="profit" stroke="url(#linePremiumVibrant)" strokeWidth={4} dot={{ r: 4, fill: '#fff' }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  <div className="rounded-[3rem] border border-slate-200 bg-white p-10 shadow-xl shadow-slate-200/60 relative overflow-hidden group/ai">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-100/50 rounded-full -mr-15 -mt-15 blur-3xl animate-pulse"></div>
                    
                    <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-10">
                      <div>
                        <div className="flex items-center gap-3 mb-3">
                          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-600 flex items-center gap-2">
                             <BrainCircuit className="w-5 h-5" /> AI TIZIMI
                          </p>
                          <div className="flex items-center gap-1.5 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-rose-500"></span>
                            </span>
                            <span className="text-[8px] font-black text-rose-600 uppercase tracking-widest">LIVE</span>
                          </div>
                        </div>
                        <h5 className="text-3xl font-black text-slate-950 leading-tight tracking-tighter">Monitoring va Bashoratlar</h5>
                      </div>
                    </div>

                    <div className="relative z-10 grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-2">
                      {[
                        { title: 'Hududiy samaradorlik', value: '+18.6%', color: 'from-emerald-50/50 to-emerald-200/50 border-emerald-200 text-emerald-900', icon: Target, status: 'Oshmoqda' },
                        { title: 'Nazorat zonalari', value: 'Diqqat', color: 'from-amber-50/50 to-amber-100/50 border-amber-200 text-amber-900', icon: ShieldCheck, status: 'Kuzatuv' },
                        { title: 'Resurslar prognozi', value: '15%', color: 'from-sky-50/50 to-sky-200/50 border-sky-200 text-sky-900', icon: Lightbulb, status: 'Bashorat' },
                        { title: 'Tizim barqarorligi', value: '99.9%', color: 'from-indigo-50/50 to-indigo-200/50 border-indigo-200 text-indigo-900', icon: Activity, status: 'Stabil' },
                      ].map((item, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 10 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ y: -3 }}
                          key={idx} 
                          className={`bg-gradient-to-br ${item.color} rounded-3xl p-5 shadow-sm border flex flex-col justify-between gap-4 group cursor-pointer transition-all duration-500 hover:shadow-lg hover:bg-white`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-md">
                              <item.icon className="w-5 h-5 text-indigo-600" />
                            </div>
                            <span className="px-2 py-0.5 bg-white/50 rounded-full text-[8px] font-black uppercase tracking-widest text-slate-500">{item.status}</span>
                          </div>
                          <div>
                            <p className="font-black text-slate-950 uppercase text-[10px] tracking-tight mb-1">{item.title}</p>
                            <p className="text-xl font-black text-slate-950 tracking-tighter">{item.value}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default ViloyatStatistikasi;
