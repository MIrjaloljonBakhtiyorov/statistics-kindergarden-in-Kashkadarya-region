import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  AreaChart, Area,
} from 'recharts';
import { TrendingUp, Search, Package, ChevronUp, ChevronDown } from 'lucide-react';
import { productData, products } from '../constants';

const CustomBarTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a] text-white p-4 rounded-2xl shadow-2xl border border-white/10 min-w-[160px]">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
        <p className="text-2xl font-black tracking-tight">{payload[0].value} <span className="text-sm font-bold text-slate-400">{unit}</span></p>
      </div>
    );
  }
  return null;
};

const CustomAreaTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f172a] text-white p-4 rounded-2xl shadow-2xl border border-white/10 min-w-[160px]">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{label}</p>
        <p className="text-2xl font-black tracking-tight">{payload[0].value} <span className="text-sm font-bold text-slate-400">{unit}</span></p>
      </div>
    );
  }
  return null;
};

export default function MahsulotSarfi() {
  const [activeProduct, setActiveProduct] = useState(products[0]);
  const [searchTerm, setSearchTerm] = useState('');
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');

  const filteredData = productData
    .filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (b[activeProduct.id as keyof typeof a] as number) - (a[activeProduct.id as keyof typeof a] as number));

  const totalConsumption = productData.reduce((acc, curr) => acc + (curr[activeProduct.id as keyof typeof curr] as number), 0);
  const averageConsumption = Math.round(totalConsumption / productData.length);
  const maxVal = filteredData[0]?.[activeProduct.id as keyof typeof filteredData[0]] as number;
  const minVal = filteredData[filteredData.length - 1]?.[activeProduct.id as keyof typeof filteredData[0]] as number;

  const topDistrict = filteredData[0];
  const bottomDistrict = filteredData[filteredData.length - 1];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">

      {/* Product Tabs */}
      <div className="flex gap-2 w-full">
        {products.map((p) => {
          const isActive = activeProduct.id === p.id;
          return (
            <motion.button
              key={p.id}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setActiveProduct(p)}
              className={`relative flex flex-1 items-center gap-2.5 px-4 py-[18px] rounded-2xl border transition-all duration-300 overflow-hidden group ${
                isActive
                  ? `bg-gradient-to-br ${p.grad} border-transparent shadow-md`
                  : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'
              }`}
            >
              <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all duration-300 ${isActive ? 'bg-white/20' : 'bg-slate-50'}`}>
                <p.icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`} />
              </div>
              <div className="text-left">
                <p className={`text-[9px] font-bold uppercase tracking-widest leading-none mb-0.5 ${isActive ? 'text-white/70' : 'text-slate-400'}`}>{p.unit}</p>
                <p className={`text-sm font-black uppercase tracking-tight leading-none ${isActive ? 'text-white' : 'text-slate-900'}`}>{p.label}</p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
        {[
          {
            label: 'Jami sarf',
            value: totalConsumption.toLocaleString(),
            unit: activeProduct.unit,
            icon: Package,
            trend: null,
            dark: true,
            accent: null,
          },
          {
            label: "O'rtacha sarf",
            value: averageConsumption.toLocaleString(),
            unit: activeProduct.unit,
            icon: TrendingUp,
            trend: null,
            dark: false,
            accent: '#3f41db',
          },
          {
            label: 'Eng yuqori',
            value: maxVal?.toLocaleString(),
            unit: activeProduct.unit,
            sub: topDistrict?.name,
            icon: ChevronUp,
            trend: 'up',
            dark: false,
            accent: '#09865d',
          },
          {
            label: 'Eng past',
            value: minVal?.toLocaleString(),
            unit: activeProduct.unit,
            sub: bottomDistrict?.name,
            icon: ChevronDown,
            trend: 'down',
            dark: false,
            accent: '#c42b2b',
          },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`rounded-3xl p-4 border flex flex-col justify-between min-h-[112px] ${
              kpi.dark
                ? 'bg-[#0f172a] border-[#1e293b]'
                : 'bg-white border-slate-100 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <p className={`text-xs font-black uppercase tracking-[0.18em] ${kpi.dark ? 'text-slate-500' : 'text-slate-400'}`}>
                {kpi.label}
              </p>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: kpi.dark ? 'rgba(255,255,255,0.08)' : (kpi.accent ? kpi.accent + '18' : '#f1f5f9') }}
              >
                <kpi.icon
                  className="w-4.5 h-4.5"
                  style={{ color: kpi.dark ? 'rgba(255,255,255,0.4)' : (kpi.accent ?? '#94a3b8') }}
                />
              </div>
            </div>
            <div>
              <p
                className="text-5xl font-black tracking-tighter leading-none"
                style={{ color: kpi.dark ? '#ffffff' : (kpi.accent ?? '#0f172a') }}
              >
                {kpi.value}
              </p>
              <div className="flex items-baseline gap-2 mt-2">
                <span className={`text-sm font-bold uppercase tracking-widest ${kpi.dark ? 'text-slate-500' : 'text-slate-400'}`}>
                  {kpi.unit}
                </span>
                {kpi.sub && (
                  <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    — {kpi.sub}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Chart Panel */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-8 pb-0">
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                  {activeProduct.label} <span className="text-indigo-600">sarfi</span>
                </h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  Hududlararo qiyosiy tahlil
                </p>
              </div>
              {/* Chart type toggle */}
              <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                {(['bar', 'area'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setChartType(type)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                      chartType === type
                        ? 'bg-white shadow-sm text-slate-900 border border-slate-100'
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {type === 'bar' ? 'Ustun' : 'Area'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`${activeProduct.id}-${chartType}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="px-4 pb-8"
            >
              <ResponsiveContainer width="100%" height={320}>
                {chartType === 'bar' ? (
                  <BarChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }} barCategoryGap="30%">
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={activeProduct.color} stopOpacity={1} />
                        <stop offset="100%" stopColor={activeProduct.color} stopOpacity={0.5} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 800 }}
                      height={36}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    />
                    <Tooltip content={<CustomBarTooltip unit={activeProduct.unit} />} cursor={{ fill: '#f8fafc', radius: 8 }} />
                    <Bar dataKey={activeProduct.id} fill={activeProduct.color} radius={[8, 8, 4, 4]} barSize={28}>
                      {filteredData.map((_, i) => (
                        <Cell key={i} fill={activeProduct.color} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={activeProduct.color} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={activeProduct.color} stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 9, fontWeight: 800 }}
                      height={36}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 700 }}
                    />
                    <Tooltip content={<CustomAreaTooltip unit={activeProduct.unit} />} cursor={{ stroke: activeProduct.color, strokeWidth: 1 }} />
                    <Area
                      type="monotone"
                      dataKey={activeProduct.id}
                      stroke={activeProduct.color}
                      strokeWidth={2.5}
                      fill="url(#areaGrad)"
                      dot={{ fill: activeProduct.color, r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: activeProduct.color, strokeWidth: 0 }}
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Ranking Sidebar */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col">
          <div className="p-6 border-b border-slate-50">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-tight">Hududlar</h3>
              <Search className="w-4 h-4 text-slate-300" />
            </div>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sarf bo'yicha saralangan</p>
            <div className="mt-4">
              <input
                type="text"
                placeholder="Qidirish..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-xs font-bold placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-1.5 max-h-[440px]">
            <AnimatePresence mode="popLayout">
              {filteredData.map((d, index) => {
                const val = d[activeProduct.id as keyof typeof d] as number;
                const pct = Math.round((val / maxVal) * 100);
                const isTop = index === 0;
                return (
                  <motion.div
                    key={d.name}
                    layout
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.025 }}
                    className={`p-3.5 rounded-2xl transition-all group cursor-pointer ${
                      isTop
                        ? 'bg-[#0f172a] text-white'
                        : 'bg-slate-50/60 hover:bg-white hover:shadow-sm border border-transparent hover:border-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${
                          isTop ? 'bg-white/15 text-white' : 'bg-white border border-slate-100 text-slate-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600'
                        }`}>
                          {index + 1}
                        </div>
                        <span className={`font-black uppercase tracking-tight text-[11px] ${isTop ? 'text-white' : 'text-slate-800'}`}>
                          {d.name}
                        </span>
                      </div>
                      <span className={`font-black text-sm ${isTop ? 'text-white' : 'text-slate-900'}`}>
                        {val} <span className={`text-[9px] font-bold ${isTop ? 'text-white/50' : 'text-slate-400'}`}>{activeProduct.unit}</span>
                      </span>
                    </div>
                    <div className={`w-full h-1 rounded-full ${isTop ? 'bg-white/15' : 'bg-slate-100'}`}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: index * 0.03 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: isTop ? 'white' : activeProduct.color }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          <div className="p-4 border-t border-slate-50">
            <div className="bg-slate-50 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: activeProduct.color + '20' }}>
                <activeProduct.icon className="w-4 h-4" style={{ color: activeProduct.color }} />
              </div>
              <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                Ma'lumotlar so'nggi hisobotlar asosida shakllantirilgan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {products.map((p, i) => {
          const total = productData.reduce((acc, curr) => acc + (curr[p.id as keyof typeof curr] as number), 0);
          const isActive = p.id === activeProduct.id;
          return (
            <motion.button
              key={p.id}
              onClick={() => setActiveProduct(p)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`p-5 rounded-3xl border text-left transition-all duration-300 ${
                isActive
                  ? `bg-gradient-to-br ${p.grad} border-transparent shadow-md`
                  : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isActive ? 'bg-white/20' : 'bg-slate-50'}`}>
                  <p.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                </div>
                <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-white/70' : 'text-slate-400'}`}>{p.label}</span>
              </div>
              <p className={`text-xl font-black tracking-tight ${isActive ? 'text-white' : 'text-slate-900'}`}>
                {total.toLocaleString()}
              </p>
              <p className={`text-[9px] font-bold uppercase tracking-widest mt-0.5 ${isActive ? 'text-white/60' : 'text-slate-400'}`}>
                Jami {p.unit}
              </p>
            </motion.button>
          );
        })}
      </div>

    </div>
  );
}
