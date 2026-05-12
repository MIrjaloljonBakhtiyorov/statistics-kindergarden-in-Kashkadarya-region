import React, { useState } from 'react';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Sector, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from 'recharts';
import { kindergartenTypes, COLORS, kindergartenImages, districts } from '../../constants';
import StatsGrid from './StatsGrid';
import { motion } from 'motion/react';
import { Info, Users, Home, School, Building2, Building, Wallet, TrendingUp, Clock, MapPin, ArrowUpRight, ShieldCheck, BrainCircuit, Target, Lightbulb, Activity } from 'lucide-react';

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
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#00008B" style={{ fontSize: '13px', fontWeight: 900 }}>{`${value} ta`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={16} textAnchor={textAnchor} fill="#00008B" style={{ fontSize: '11px', fontWeight: 700 }}>
        {`(${(percent * 100).toFixed(1)}%)`}
      </text>
    </g>
  );
};

const ViloyatStatistikasi: React.FC<ViloyatStatistikasiProps> = ({ setSelectedMTTType, CustomTooltip }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Bugungi sarflanishi kerak bo'lgan mablag' (jami 3-7 yoshli bolalar)
  const plannedDailyCost = districts.reduce((acc, d) => {
    return acc + (d.details?.totalChildren3to7 || 0) * 27600;
  }, 0);

  // Kelgan bolalar uchun sarflanadigan mablag'
  const totalRegionalDailyCost = districts.reduce((acc, d) => {
    const covered = d.details?.totalCoveredChildren || 0;
    return acc + (Math.round(covered * 0.84) * 27600);
  }, 0);

  // Tejaladigan mablag'
  const savedDailyCost = plannedDailyCost - totalRegionalDailyCost;

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
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-1000">
      {/* Premium Gallery Section - Compact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {kindergartenImages.map((img, index) => (
          <motion.div 
            key={index} 
            whileHover={{ y: -5 }}
            className="group relative overflow-hidden rounded-[1.5rem] shadow-xl aspect-[4/3.5] border-2 border-white"
          >
            <img 
              src={img.url} 
              alt={img.title} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            />
            <div className="absolute inset-0 bg-black/15 opacity-60"></div>
            <div className="absolute inset-0 p-4 flex flex-col justify-end">
              <p className="text-white font-black text-sm uppercase tracking-tighter leading-none">{img.title}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <StatsGrid />

      {/* Main Analysis Section - Pie Chart - Compressed */}
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 group/card relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-slate-100 rounded-full -mr-32 -mt-32 opacity-60 border border-slate-200"></div>
          
          <div className="relative z-10 mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg mb-3">
                <Info className="w-3.5 h-3.5 text-[#003580]" />
                <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest">MTT Turlari bo'yicha tahlil</span>
              </div>
              <h3 className="text-2xl font-bold text-[#003580] uppercase leading-tight">
                QASHQADARYO MTTlari
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-widest">Tashkilotlar taqsimoti va qamrovi</p>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row gap-8 items-center relative z-10">
            <div className="flex-1 w-full h-[320px] relative">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-0 pointer-events-none">
                <p className="text-[30px] font-bold text-[#003580] leading-none">
                  {kindergartenTypes.reduce((acc, curr) => acc + curr.count, 0).toLocaleString()}
                </p>
                <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Jami</p>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    {...({ activeIndex, activeShape: renderActiveShape } as any)}
                    data={kindergartenTypes}
                    innerRadius="60%" 
                    outerRadius="80%" 
                    paddingAngle={5} 
                    dataKey="count"
                    stroke="none"
                    cornerRadius={8}
                    onMouseEnter={onPieEnter}
                    onClick={(data) => setSelectedMTTType(data.payload)}
                  >
                    {kindergartenTypes.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="flex-1 grid grid-cols-2 gap-3">
              {kindergartenTypes.map((type, index) => {
                const color = COLORS[index % COLORS.length];
                const isActive = activeIndex === index;
                const isLast = index === kindergartenTypes.length - 1;
                return (
                  <motion.div
                    key={index}
                    onClick={() => {
                      setActiveIndex(index);
                      setSelectedMTTType(type);
                    }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${isLast ? 'col-span-2' : ''} ${
                      isActive
                        ? 'border-transparent shadow-md'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                    style={{ backgroundColor: isActive ? color : undefined }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : `${color}18` }}
                      >
                        {React.createElement(typeIcons[index % typeIcons.length], {
                          size: 18,
                          color: isActive ? '#fff' : color,
                        })}
                      </div>
                      <div>
                        <p className={`text-[20px] font-bold leading-none ${isActive ? 'text-white' : 'text-[#003580]'}`}>
                          {type.count.toLocaleString()} <span className="text-[14px]">ta</span>
                        </p>
                        <p className={`text-[11px] font-semibold uppercase tracking-wide mt-1 leading-snug ${isActive ? 'text-white/80' : 'text-slate-500'}`}>
                          {type.name}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Tizimli Nazorat va Xarajatlar - Compressed */}
        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-200 relative overflow-hidden shadow-sm">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-slate-100 rounded-full -mr-32 -mt-32 opacity-50 border border-slate-200"></div>
            
            <div className="relative z-10 flex flex-col xl:flex-row xl:items-start justify-between gap-6 mb-8">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1 rounded-lg mb-3 shadow-sm shadow-indigo-100">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-black uppercase tracking-[0.1em]">Moliyaviy Monitoring</span>
                </div>
                <h3 className="text-2xl md:text-4xl font-black text-black tracking-tighter uppercase mb-4 leading-none">Tizimli <span className="text-indigo-600 italic">Nazorat</span></h3>
                <p className="text-sm text-slate-500 font-bold leading-relaxed italic border-l-2 border-indigo-100 pl-4">
                  "Mablag'larning <span className="text-indigo-600 font-black underline decoration-indigo-200 underline-offset-4">maqsadli sarflanishini</span> va iqtisodiy samaradorlikni ta'minlash."
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-[2rem] border border-slate-100 shadow-inner flex flex-col items-center gap-1 shrink-0">
                <p className="text-[9px] font-black text-black uppercase tracking-[0.1em]">Jami kunlik xarajat</p>
<p className="text-xl font-black tracking-tighter text-[#003580]">1.28 <span className="text-sm text-black uppercase">mlrd</span></p>
                <div className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-[9px] font-black">+4.2%</div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {[
                { label: '09:00 gacha kelganlar', value: '192,405', sub: 'nafar', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: '09:00 dan keyin', value: '12,580', sub: 'nafar', icon: Activity, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Umuman kelmaganlar', value: '38,916', sub: 'nafar', icon: Users, color: 'text-rose-600', bg: 'bg-rose-50' },
                { label: 'Bola boshi xarajat', value: '27,600', sub: 'so\'m', icon: Wallet, color: 'text-indigo-600', bg: 'bg-indigo-50' },
              ].map((item, i) => (
                <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col items-center text-center shadow-sm">
                  <div className={`w-10 h-10 ${item.bg} ${item.color} rounded-lg flex items-center justify-center mb-3`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <p className="text-[14px] font-semibold text-slate-500 uppercase tracking-wide mb-2 leading-snug">{item.label}</p>
                  <p className="text-[30px] font-bold text-[#003580] tracking-tight">{item.value}</p>
                  <p className="text-[14px] font-medium text-slate-400 uppercase tracking-wide mt-1">{item.sub}</p>
                </div>
              ))}
            </div>
            
            <div className="mt-10 pt-10 border-t border-slate-100">
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-white">
                {/* Section header */}
                <div className="px-8 pt-7 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-[#003580]" />
                    <h4 className="text-[16px] font-bold text-[#003580] uppercase tracking-widest">Tumanlar bo'yicha bolalar soni</h4>
                  </div>
                  <div className="flex items-center gap-5 text-[12px] font-medium text-slate-500">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm inline-block bg-[#3B82F6]" />9:00 gacha
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm inline-block bg-[#F59E0B]" />9:00 dan keyin
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm inline-block bg-[#EF4444]" />Kelmaganlar
                    </span>
                  </div>
                </div>

                {/* Body: chart + info card */}
                <div className="grid grid-cols-1 xl:grid-cols-[3fr_2fr]">
                  {/* Chart */}
                  <div className="p-6 border-r border-slate-100">
                  <div className="h-[680px] w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <BarChart
                        data={districts.map(d => {
                          const total = d.details?.totalCoveredChildren || 0;
                          return {
                            name: d.name,
                            erta:     Math.round(total * 0.789),
                            kech:     Math.round(total * 0.052),
                            kelmagan: Math.round(total * 0.159),
                          };
                        })}
                        margin={{ top: 10, right: 10, left: 0, bottom: 60 }}
                      >
                        <defs>
                          <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1565C0" />
                            <stop offset="100%" stopColor="#1565C0" />
                          </linearGradient>
                          <linearGradient id="amberGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#F59E0B" />
                            <stop offset="100%" stopColor="#D97706" />
                          </linearGradient>
                          <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#B71C1C" />
                            <stop offset="100%" stopColor="#C62828" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#31435c', fontSize: 10, fontWeight: 600 }}
                          angle={-45}
                          textAnchor="end"
                          interval={0}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                          tickFormatter={(value) => `${value/1000}k`}
                        />
                        <Tooltip
                          cursor={{ fill: 'rgba(0,53,128,0.04)' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-lg space-y-2 min-w-[210px]">
                                  <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest border-b border-slate-100 pb-2">{payload[0].payload.name}</p>
                                  <div className="flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2.5 h-2.5 rounded-sm bg-[#1565C0]" />
                                      <span className="text-[11px] font-medium text-slate-500">9:00 gacha</span>
                                    </div>
                                    <span className="text-[14px] font-bold text-[#003580]">{payload[0].value.toLocaleString()}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2.5 h-2.5 rounded-sm bg-[#F59E0B]" />
                                      <span className="text-[11px] font-medium text-slate-500">9:00 dan keyin</span>
                                    </div>
                                    <span className="text-[14px] font-bold text-[#D97706]">{payload[1].value.toLocaleString()}</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2.5 h-2.5 rounded-sm bg-[#B71C1C]" />
                                      <span className="text-[11px] font-medium text-slate-500">Kelmaganlar</span>
                                    </div>
                                    <span className="text-[14px] font-bold text-[#B71C1C]">{payload[2].value.toLocaleString()}</span>
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="erta"     name="9:00 gacha"     fill="url(#blueGrad)"  stackId="keldi" radius={[0, 0, 2, 2]} barSize={18} />
                        <Bar dataKey="kech"     name="9:00 dan keyin" fill="url(#amberGrad)" stackId="keldi" radius={[4, 4, 0, 0]} barSize={18} />
                        <Bar dataKey="kelmagan" name="Kelmaganlar"    fill="url(#redGrad)"   radius={[4, 4, 2, 2]} barSize={18} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
               </div>

               {/* Right — Premium Card */}
               <div className="flex flex-col min-h-[680px]">
                  {/* Hero — Islom Karimov rasmi */}
                  <div className="relative h-80 shrink-0">
                    <img
                      src="https://www.gazeta.uz/media/img/2017/01/vXKIp814857723652592_b.jpg"
                      alt="Islom Karimov"
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[#003580]/20 via-[#003580]/50 to-[#003580]/95" />
                    <div className="absolute inset-0 p-6 flex flex-col justify-end gap-2">
                      <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full w-fit text-[10px] font-semibold text-white uppercase tracking-widest bg-white/15 border border-white/25">
                        <TrendingUp className="w-3 h-3 text-amber-300" />
                        Birinchi Prezident iqtiboslari
                      </span>
                      <h4 className="text-[22px] font-bold text-white leading-tight">
                        Islom Karimov — <span className="text-amber-300">Farzandlar haqida</span>
                      </h4>
                    </div>
                  </div>

                  {/* Kontent */}
                  <div className="bg-white flex-1 flex flex-col gap-4 p-6">

                    {/* Muallif + 2-rasm */}
                    <div className="flex items-start gap-4 pb-3 border-b border-slate-100">
                      <div className="w-24 h-28 rounded-xl overflow-hidden shrink-0 ring-2 ring-blue-200 shadow-md">
                        <img
                          src="https://islomkarimov.uz/source/Mustaqillik/0V2A3235.JPG"
                          alt="Islom Karimov"
                          className="w-full h-full object-cover object-top"
                        />
                      </div>
                      <div className="flex flex-col justify-center gap-1">
                        <p className="text-[15px] font-bold text-[#003580] leading-tight">Islom Karimov</p>
                        <p className="text-[11px] font-medium text-slate-500 leading-snug">O'zbekiston Respublikasining Birinchi Prezidenti</p>
                        <p className="text-[11px] font-medium text-slate-400">1938 — 2016</p>
                      </div>
                    </div>

                    {/* 1-iqtibos */}
                    <blockquote className="bg-blue-50 border-l-4 border-[#003580] rounded-r-xl pl-4 pr-4 py-3">
                      <p className="text-[12px] text-slate-700 font-medium leading-relaxed italic">
                        "Hali suyagi qotmagan farzandlarimizni o'z holiga tashlab qo'ysak, tarbiyasi, ilmi va ma'naviyati bilan shug'ullanmasak, kelajakda ularning komil insonlar bo'lib yetishmog'iga kim kafolat bera oladi?"
                      </p>
                    </blockquote>

                    {/* 2-iqtibos */}
                    <blockquote className="bg-slate-50 border-l-4 border-amber-400 rounded-r-xl pl-4 pr-4 py-3">
                      <p className="text-[12px] text-slate-700 font-medium leading-relaxed italic">
                        "Bizning farzandlarimiz bizdan ko'ra kuchli, bilimli, dono va albatta baxtli bo'lishlari shart."
                      </p>
                    </blockquote>

                    {/* Statistikalar */}
                    <div className="grid grid-cols-3 gap-2 pt-1">
                      {[
                        { label: "Qamrab olinganlar", value: "243,901" },
                        { label: "Jami MTTlar",       value: "4,439"   },
                        { label: "Qamrov foizi",      value: "71.44%"  },
                      ].map((s, i) => (
                        <div key={i} className="text-center bg-blue-50 border border-blue-100 rounded-xl py-3 px-2">
                          <p className="text-[18px] font-bold text-[#003580] leading-none">{s.value}</p>
                          <p className="text-[9px] font-medium text-slate-500 mt-1 uppercase tracking-wide leading-snug">{s.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
               </div>
                </div>{/* closes grid */}
              </div>{/* closes white container */}
            </div>{/* closes outer mt-10 */}

            {/* Total Daily Cost Analysis — Premium */}
            <div className="mt-12 pt-12 border-t border-slate-100">
              <div className="rounded-2xl overflow-hidden shadow-xl border border-slate-200">

                {/* Dark header */}
                <div className="bg-[#001228] px-8 pt-8 pb-7">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="w-4 h-4 text-amber-300" />
                    <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-widest">Moliyaviy tahlil</span>
                  </div>
                  <h4 className="text-[22px] font-bold text-white leading-tight mb-6">
                    Tumanlar kesimida kunlik xarajatlar
                  </h4>

                  {/* 3 KPI kartalar — dark premium */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="rounded-xl p-5 relative overflow-hidden" style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)'}}>
                      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-[#1565C0]/20 blur-2xl" />
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Bugungi sarflanishi kerak</p>
                      <p className="text-[32px] font-bold text-white leading-none">
                        {(plannedDailyCost / 1000000000).toFixed(2)}
                        <span className="text-[14px] font-semibold text-slate-400 ml-1">mlrd</span>
                      </p>
                      <div className="mt-3 h-1 rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-[#1565C0] w-full" />
                      </div>
                    </div>

                    <div className="rounded-xl p-5 relative overflow-hidden" style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)'}}>
                      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-[#2E7D32]/20 blur-2xl" />
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Kelgan bolalar uchun</p>
                      <p className="text-[32px] font-bold text-[#4ADE80] leading-none">
                        {(totalRegionalDailyCost / 1000000000).toFixed(2)}
                        <span className="text-[14px] font-semibold text-slate-400 ml-1">mlrd</span>
                      </p>
                      <div className="mt-3 h-1 rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-[#4ADE80]"
                          style={{width:`${(totalRegionalDailyCost/plannedDailyCost*100).toFixed(0)}%`}} />
                      </div>
                      <p className="text-[10px] text-[#4ADE80] mt-1 font-semibold">
                        {(totalRegionalDailyCost/plannedDailyCost*100).toFixed(1)}% sarflandi
                      </p>
                    </div>

                    <div className="rounded-xl p-5 relative overflow-hidden" style={{background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.1)'}}>
                      <div className="absolute -right-4 -top-4 w-20 h-20 rounded-full bg-amber-500/20 blur-2xl" />
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Tejaladigan mablag'</p>
                      <p className="text-[32px] font-bold text-amber-300 leading-none">
                        {(savedDailyCost / 1000000000).toFixed(2)}
                        <span className="text-[14px] font-semibold text-slate-400 ml-1">mlrd</span>
                      </p>
                      <div className="mt-3 h-1 rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-amber-400"
                          style={{width:`${(savedDailyCost/plannedDailyCost*100).toFixed(0)}%`}} />
                      </div>
                      <p className="text-[10px] text-amber-300 mt-1 font-semibold">
                        {(savedDailyCost/plannedDailyCost*100).toFixed(1)}% tejaldi
                      </p>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap items-center gap-5 mt-5 text-[12px] font-medium text-slate-400">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm inline-block bg-[#4ADE80]" />Kelgan bolalar xarajati
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-sm inline-block bg-amber-400" />Tejaladigan mablag'
                    </span>
                    <span className="text-[11px] text-slate-500 italic">(birgalikda = rejalashtirilgan jami)</span>
                  </div>
                </div>

                {/* Chart — oq fon */}
                <div className="bg-white p-6">
                  <div className="h-[540px] w-full">
                    <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                      <BarChart
                        data={districts.map(d => {
                          const totalChildren = d.details?.totalChildren3to7 || 0;
                          const coveredChildren = d.details?.totalCoveredChildren || 0;
                          const attending = Math.round(coveredChildren * 0.84);
                          const kelganCost  = attending * 27600;
                          const tejamkorlik = (totalChildren * 27600) - kelganCost;
                          return { name: d.name, kelganCost, tejamkorlik };
                        })}
                        margin={{ top: 15, right: 20, left: 10, bottom: 65 }}
                      >
                        <defs>
                          <linearGradient id="greenPremium" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#22C55E" />
                            <stop offset="100%" stopColor="#16A34A" />
                          </linearGradient>
                          <linearGradient id="amberPremium" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FBBF24" />
                            <stop offset="100%" stopColor="#F59E0B" />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                          dataKey="name"
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                          angle={-45}
                          textAnchor="end"
                          interval={0}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                          tickFormatter={(v) => `${(v / 1000000).toFixed(0)}m`}
                        />
                        <Tooltip
                          cursor={{ fill: 'rgba(0,18,40,0.04)' }}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const kelgan = Number(payload[0]?.value ?? 0);
                              const tejam  = Number(payload[1]?.value ?? 0);
                              const jami   = kelgan + tejam;
                              const pct    = jami ? ((kelgan / jami) * 100).toFixed(1) : '0';
                              return (
                                <div className="bg-[#001228] text-white p-4 rounded-xl shadow-2xl min-w-[220px] space-y-2 border border-white/10">
                                  <p className="text-[11px] font-semibold text-amber-300 uppercase tracking-widest border-b border-white/10 pb-2">
                                    {payload[0].payload.name}
                                  </p>
                                  <div className="flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-white/50" />
                                      <span className="text-[11px] text-slate-400">Rejalashtirilgan</span>
                                    </div>
                                    <span className="text-[13px] font-bold text-white">{(jami / 1000000).toFixed(1)}m</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-[#22C55E]" />
                                      <span className="text-[11px] text-slate-400">Kelgan bolalar</span>
                                    </div>
                                    <span className="text-[13px] font-bold text-[#4ADE80]">{(kelgan / 1000000).toFixed(1)}m</span>
                                  </div>
                                  <div className="flex items-center justify-between gap-6 pt-1 border-t border-white/10">
                                    <div className="flex items-center gap-2">
                                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                                      <span className="text-[11px] text-slate-400">Tejamkorlik</span>
                                    </div>
                                    <span className="text-[13px] font-bold text-amber-300">+{(tejam / 1000000).toFixed(1)}m</span>
                                  </div>
                                  <div className="mt-2 h-1.5 rounded-full bg-white/10 overflow-hidden">
                                    <div className="h-full rounded-full bg-[#22C55E]" style={{width:`${pct}%`}} />
                                  </div>
                                  <p className="text-[10px] text-slate-400 text-right">{pct}% sarflandi</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar dataKey="kelganCost"  fill="url(#greenPremium)"  stackId="s" radius={[0, 0, 3, 3]} barSize={20} />
                        <Bar dataKey="tejamkorlik" fill="url(#amberPremium)"  stackId="s" radius={[5, 5, 0, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Profit & Savings Analysis Section - Fullscreen (100vh) */}
            <div className="mt-6 pt-6 border-t border-slate-100 h-[calc(100vh-4rem)] flex flex-col">
              <div className="grid gap-6 xl:grid-cols-2 flex-1 min-h-0">
                {/* Left Column - District Analytics (Scrollable) */}
                <div className="flex flex-col min-h-0">
                  <div className="flex-1 rounded-[2.5rem] border-2 border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/50 relative overflow-hidden flex flex-col min-h-0">
                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-500"></div>
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-8 shrink-0">
                      <div>
                          <p className="text-sm font-black uppercase tracking-[0.25em] text-emerald-700 flex items-center gap-3 mb-2">
                             <TrendingUp className="w-5 h-5" /> TUMANLAR KESIMIDA FOYDA TAHLILI
                          </p>
                          <h4 className="text-3xl md:text-4xl font-black text-slate-950 leading-tight tracking-tighter">Tumanlararo tejalgan mablag‘lar</h4>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto pr-3 custom-scrollbar space-y-4">
                      {districtAnalytics.map((item, idx) => (
                        <motion.div 
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.01 }}
                          viewport={{ once: true }}
                          key={item.name} 
                          className="group flex flex-col gap-4 rounded-[2rem] border-2 border-slate-100 bg-white/70 p-6 transition-all duration-300 hover:shadow-[0_20px_60px_rgba(16,185,129,0.15)] hover:border-emerald-300 hover:bg-white sm:flex-row sm:items-center sm:justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-6">
                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white group-hover:bg-emerald-500 transition-colors text-xl font-black shadow-lg">{String(item.rank).padStart(2, '0')}</div>
                            <div>
                              <p className="text-xl md:text-2xl font-black uppercase tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors">{item.name}</p>
                              <p className="text-sm font-bold text-slate-400">{item.absent.toLocaleString()} nafar bola</p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5 text-right">
<div className="inline-flex items-center justify-end gap-2 rounded-xl bg-white px-5 py-2.5 text-xl md:text-2xl font-black border border-slate-100 group-hover:border-emerald-100 shadow-sm text-xl font-black tracking-tighter text-[#003580]">
                              +{(item.profit / 1000000).toFixed(1)}m <span className="text-xs text-slate-400 uppercase ml-1">so'm</span>
                            </div>
                            <div className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 justify-end mt-1">
                              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                              Effek: {item.efficiency}%
                            </div>
                          </div>

                          <div className="flex h-10 items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity pr-2">
                            {item.sparkline.map((value, sparkIndex) => (
                              <motion.span
                                initial={{ height: 0 }}
                                whileInView={{ height: `${value * 3.5 + 8}px` }}
                                transition={{ duration: 0.4, delay: sparkIndex * 0.03, ease: "easeOut" }}
                                key={sparkIndex}
                                className="block w-2 rounded-full bg-emerald-500"
                              />
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Overall Profit and AI Monitoring */}
                <div className="flex flex-col gap-6 min-h-0">
                  {/* Overall Profit Chart */}
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="flex-1 min-h-0 relative overflow-hidden rounded-[3rem] bg-[#0B3B2E] p-8 text-white shadow-[0_22px_70px_rgba(0,0,0,0.28)] ring-1 ring-white/10 group flex flex-col justify-between"
                  >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.pattern')] opacity-5" />
                    <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/20 blur-[80px] group-hover:bg-white/30 transition-all duration-1000" />
                    
                    <div className="relative z-10 space-y-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="inline-flex items-center gap-3 rounded-lg bg-white/15 backdrop-blur-xl border border-white/25 px-3 py-1.5 text-[9px] uppercase tracking-[0.15em] text-white shadow-lg">
                          <ArrowUpRight className="w-4 h-4 text-emerald-300" />
                          <span className="font-black">VILOYAT UMUMIY FOYDASI</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h2 className="text-5xl font-black tracking-tighter leading-none">
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

                    <div className="flex-1 min-h-0 mt-6 rounded-[2.5rem] bg-black/25 backdrop-blur-md border-2 border-white/15 p-6 shadow-[0_25px_80px_rgba(0,0,0,0.35)] shadow-inner relative ring-1 ring-white/10 group/chart">
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

                  {/* AI Monitoring Section */}
                  <div className="flex-1 min-h-0 rounded-[3rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/60 relative overflow-hidden group/ai flex flex-col">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-100/50 rounded-full -mr-15 -mt-15 blur-3xl animate-pulse"></div>
                    
                    <div className="relative z-10 flex flex-col gap-2 mb-6 shrink-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-indigo-600 flex items-center gap-2">
                           <BrainCircuit className="w-4 h-4" /> AI TIZIMI
                        </p>
                        <div className="flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                          <span className="relative flex h-1 w-1">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-1 w-1 bg-rose-500"></span>
                          </span>
                          <span className="text-[7px] font-black text-rose-600 uppercase tracking-widest">LIVE</span>
                        </div>
                      </div>
                      <h5 className="text-2xl font-black text-slate-950 leading-tight tracking-tighter">Monitoring va Bashoratlar</h5>
                    </div>

                    <div className="relative z-10 grid gap-3 grid-cols-2 flex-1 min-h-0">
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
                          className={`rounded-2xl p-4 shadow-[0_18px_50px_rgba(2,6,23,0.10)] border-2 border-white/40 backdrop-blur-sm flex flex-col justify-between gap-2 group cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(2,6,23,0.18)] hover:border-white/70`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-md">
                              <item.icon className="w-4 h-4 text-indigo-600" />
                            </div>
                            <span className="px-1.5 py-0.5 bg-white/50 rounded-full text-[7px] font-black uppercase tracking-widest text-slate-500">{item.status}</span>
                          </div>
                          <div>
                            <p className="font-black text-slate-950 uppercase text-[9px] tracking-tight mb-0.5">{item.title}</p>
                            <p className="text-xl font-black tracking-tighter text-[#003580]">{item.value}</p>
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
