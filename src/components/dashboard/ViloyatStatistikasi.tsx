import React, { useState } from 'react';
import { Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Sector, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area } from 'recharts';
import { kindergartenTypes, COLORS, kindergartenImages, districts } from '../../constants';
import StatsGrid from './StatsGrid';
import { motion } from 'motion/react';
import { Info, Users, Home, School, Building2, Building, Wallet, TrendingUp, Clock, MapPin, ShieldCheck, BrainCircuit, Target, Lightbulb, Activity } from 'lucide-react';

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
            <div className="mt-6 pt-6 border-t border-slate-100 h-[80vh] flex flex-col">
              <div className="grid gap-6 xl:grid-cols-2 flex-1 min-h-0">
                {/* Left Column - District Analytics (Scrollable) */}
                <div className="flex flex-col min-h-0">
                  <div className="flex-1 rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-100/80 relative overflow-hidden flex flex-col min-h-0">
                    {/* Top accent bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500" />

                    {/* Header */}
                    <div className="px-6 pt-7 pb-4 shrink-0 border-b border-slate-100">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-emerald-600 flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4" /> Tumanlar kesimida foyda tahlili
                          </p>
                          <h4 className="text-[18px] font-black text-slate-900 leading-tight">{"Tumanlararo tejalgan mablag’lar"}</h4>
                        </div>
                        <div className="flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-100 px-3 py-1.5">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[11px] font-bold text-emerald-700">{districtAnalytics.length} tuman</span>
                        </div>
                      </div>
                    </div>

                    {/* Scrollable list - 6 items visible, rest scrollable */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 space-y-2" style={{ maxHeight: "80vh" }}>
                      {districtAnalytics.map((item, idx) => (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          viewport={{ once: true }}
                          key={item.name}
                          className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3 transition-all duration-200 hover:bg-white hover:border-emerald-200 hover:shadow-md hover:shadow-emerald-50 cursor-pointer"
                        >
                          {/* Rank + Name */}
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white group-hover:bg-emerald-500 transition-colors text-sm font-black shadow-md">
                              {String(item.rank).padStart(2, "0")}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-black uppercase tracking-tight text-slate-800 group-hover:text-emerald-700 transition-colors truncate">{item.name}</p>
                              <p className="text-xs font-semibold text-slate-400">{item.absent.toLocaleString()} nafar bola</p>
                            </div>
                          </div>

                          {/* Sparkline */}
                          <div className="hidden sm:flex h-8 items-end gap-0.5 opacity-30 group-hover:opacity-90 transition-opacity">
                            {item.sparkline.map((value, sparkIndex) => (
                              <motion.span
                                initial={{ height: 0 }}
                                whileInView={{ height: `${value * 2.5 + 6}px` }}
                                transition={{ duration: 0.4, delay: sparkIndex * 0.03, ease: "easeOut" }}
                                key={sparkIndex}
                                className="block w-1.5 rounded-full bg-emerald-500"
                              />
                            ))}
                          </div>

                          {/* Profit + Efficiency */}
                          <div className="flex flex-col items-end gap-1 shrink-0">
                            <div className="inline-flex items-baseline gap-1 rounded-lg bg-white border border-slate-100 group-hover:border-emerald-100 px-3 py-1.5 shadow-sm">
                              <span className="text-base font-black tracking-tight text-[#003580]">+{(item.profit / 1000000).toFixed(1)}m</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase">so’m</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                              Effek: {item.efficiency}%
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-4 min-h-0">

                  {/* ── VILOYAT UMUMIY FOYDASI ── */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="flex-1 min-h-0 relative overflow-hidden flex flex-col"
                    style={{ borderRadius: 24, background: "linear-gradient(160deg,#071f14 0%,#0a2d1e 50%,#0c3824 100%)" }}
                  >
                    {/* ambient glow */}
                    <div className="pointer-events-none absolute inset-0">
                      <div className="absolute -top-16 -right-16 w-72 h-72 rounded-full" style={{ background: "radial-gradient(circle,rgba(52,211,153,0.22) 0%,transparent 70%)" }} />
                      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full" style={{ background: "radial-gradient(circle,rgba(16,185,129,0.1) 0%,transparent 70%)" }} />
                    </div>

                    {/* header row */}
                    <div className="relative z-10 flex items-center justify-between px-5 pt-5 shrink-0">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: "rgba(52,211,153,0.18)", border: "1px solid rgba(52,211,153,0.25)" }}>
                          <TrendingUp className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-400/60 leading-none mb-0.5">Viloyat</p>
                          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-emerald-300/90 leading-none">Umumiy foyda</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.18)" }}>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-50" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                        </span>
                        <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Live</span>
                      </div>
                    </div>

                    {/* big metric */}
                    <div className="relative z-10 px-5 pt-3 pb-3 shrink-0">
                      <div className="flex items-baseline gap-2 mb-0.5">
                        <span className="font-black text-white leading-none" style={{ fontSize: "3.2rem", letterSpacing: "-0.04em" }}>
                          {(districts.reduce((acc, d) => {
                            const total = d.details?.totalChildren3to7 || 0;
                            const cov = d.details?.totalCoveredChildren || 0;
                            return acc + (total - Math.round(cov * 0.84)) * 27600;
                          }, 0) / 1000000000).toFixed(2)}
                        </span>
                        <span className="text-base font-black text-emerald-400 uppercase tracking-wide pb-1">mlrd so'm</span>
                      </div>
                      <p className="text-[9px] font-semibold uppercase tracking-[0.25em]" style={{ color: "rgba(255,255,255,0.22)" }}>{"Kunlik o'rtacha tejamkorlik"}</p>

                      {/* KPI row */}
                      <div className="grid grid-cols-3 gap-2 mt-3">
                        {[
                          { label: "O'sish", val: "+12.4%", accent: "#34d399", bg: "rgba(52,211,153,0.08)", br: "rgba(52,211,153,0.15)" },
                          { label: "Tumanlar", val: `${districts.length} ta`, accent: "#60a5fa", bg: "rgba(96,165,250,0.08)", br: "rgba(96,165,250,0.15)" },
                          { label: "Samaradorlik", val: "38.2%", accent: "#fbbf24", bg: "rgba(251,191,36,0.08)", br: "rgba(251,191,36,0.15)" },
                        ].map((k, i) => (
                          <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 + i * 0.07 }}
                            style={{ background: k.bg, border: `1px solid ${k.br}`, borderRadius: 14, padding: "8px 12px" }}>
                            <p style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.15em", color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>{k.label}</p>
                            <p style={{ fontSize: 15, fontWeight: 900, color: k.accent, lineHeight: 1 }}>{k.val}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* chart */}
                    <div className="relative z-10 flex-1 min-h-0 px-1 pb-4" style={{ minHeight: 130 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={regionalTrend} margin={{ top: 6, right: 8, left: -22, bottom: 0 }}>
                          <defs>
                            <linearGradient id="pf2" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#34d399" stopOpacity={0.28} />
                              <stop offset="100%" stopColor="#34d399" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="2 8" vertical={false} stroke="rgba(255,255,255,0.04)" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.28)", fontSize: 10, fontWeight: 600 }} dy={5} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: "rgba(255,255,255,0.28)", fontSize: 10, fontWeight: 600 }} />
                          <Tooltip cursor={{ stroke: "rgba(52,211,153,0.18)", strokeWidth: 1 }}
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                return (
                                  <div style={{ background: "#071f14", border: "1px solid rgba(52,211,153,0.25)", borderRadius: 12, padding: "8px 13px", boxShadow: "0 16px 32px rgba(0,0,0,0.5)" }}>
                                    <p style={{ fontSize: 9, fontWeight: 800, color: "#34d399", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 3 }}>{payload[0].payload.name}</p>
                                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                                      <span style={{ fontSize: 20, fontWeight: 900, color: "#fff" }}>{payload[0].value}</span>
                                      <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>mlrd</span>
                                    </div>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Area type="monotone" dataKey="profit" stroke="#34d399" strokeWidth={2.5} fill="url(#pf2)"
                            dot={{ r: 3.5, fill: "#071f14", strokeWidth: 2, stroke: "#34d399" }}
                            activeDot={{ r: 6, fill: "#fff", stroke: "#34d399", strokeWidth: 2 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </motion.div>

                  {/* ── AI MONITORING ── */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
                    className="flex-1 min-h-0 relative overflow-hidden flex flex-col"
                    style={{ borderRadius: 24, background: "#fff", border: "1px solid #e8eaf0" }}
                  >
                    <div className="pointer-events-none absolute top-0 right-0 w-56 h-56 rounded-full" style={{ background: "radial-gradient(circle,rgba(99,102,241,0.08) 0%,transparent 70%)", transform: "translate(30%,-30%)" }} />

                    {/* header */}
                    <div className="relative z-10 flex items-center justify-between px-5 pt-5 pb-4 shrink-0 border-b" style={{ borderColor: "#f1f3f8" }}>
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 border border-indigo-100">
                          <BrainCircuit className="w-4 h-4 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-indigo-500 leading-none mb-0.5">AI Tizimi</p>
                          <p className="text-[15px] font-black text-slate-900 leading-tight tracking-tight">Monitoring va Bashoratlar</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-100">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-70" />
                          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
                        </span>
                        <span className="text-[8px] font-black text-rose-600 uppercase tracking-widest">Live</span>
                      </div>
                    </div>

                    {/* cards grid */}
                    <div className="relative z-10 grid grid-cols-2 gap-3 p-4 flex-1 min-h-0">
                      {[
                        { title: "Hududiy samaradorlik", value: "+18.6%", status: "Oshmoqda", icon: Target, accent: "#059669", bg: "#f0fdf8", br: "#d1fae5", ic: "#10b981" },
                        { title: "Nazorat zonalari", value: "Diqqat", status: "Kuzatuv", icon: ShieldCheck, accent: "#b45309", bg: "#fffbeb", br: "#fde68a", ic: "#f59e0b" },
                        { title: "Resurslar prognozi", value: "15%", status: "Bashorat", icon: Lightbulb, accent: "#0369a1", bg: "#f0f9ff", br: "#bae6fd", ic: "#0ea5e9" },
                        { title: "Tizim barqarorligi", value: "99.9%", status: "Stabil", icon: Activity, accent: "#4338ca", bg: "#eef2ff", br: "#c7d2fe", ic: "#6366f1" },
                      ].map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 8 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
                          transition={{ delay: idx * 0.06 }}
                          style={{ background: item.bg, border: `1px solid ${item.br}`, borderRadius: 16, padding: "14px", cursor: "pointer", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 10 }}
                        >
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 32, height: 32, borderRadius: 10, background: "#fff", border: `1px solid ${item.br}`, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                              <item.icon style={{ width: 15, height: 15, color: item.ic }} />
                            </div>
                            <span style={{ fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.15em", color: item.accent, background: "#fff", border: `1px solid ${item.br}`, borderRadius: 20, padding: "2px 8px" }}>{item.status}</span>
                          </div>
                          <div>
                            <p style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", color: "#64748b", marginBottom: 3 }}>{item.title}</p>
                            <p style={{ fontSize: 22, fontWeight: 900, color: item.accent, letterSpacing: "-0.03em", lineHeight: 1 }}>{item.value}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default ViloyatStatistikasi;
