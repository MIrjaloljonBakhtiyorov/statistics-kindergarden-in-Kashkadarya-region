import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { TrendingUp, Search, ArrowRight, Package, Info } from 'lucide-react';
import { productData, products } from '../constants';

const CustomTooltip = ({ active, payload, label, unit }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-2xl border border-slate-100 min-w-[150px]">
        <p className="font-black text-slate-900 mb-2 border-b border-slate-100 pb-2 text-sm uppercase">{label}</p>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: payload[0].color || payload[0].fill }}></div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{payload[0].name}</span>
          </div>
          <span className="text-sm font-black text-slate-900">{payload[0].value} {unit}</span>
        </div>
      </div>
    );
  }
  return null;
};

export default function MahsulotSarfi() {
  const [activeProduct, setActiveProduct] = useState(products[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = productData
    .filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => (b[activeProduct.id as keyof typeof a] as number) - (a[activeProduct.id as keyof typeof a] as number));

  const totalConsumption = productData.reduce((acc, curr) => acc + (curr[activeProduct.id as keyof typeof curr] as number), 0);
  const averageConsumption = Math.round(totalConsumption / productData.length);

  return (
    <div className="space-y-8 md:space-y-12 animate-in fade-in duration-700">
      {/* Product Category Selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {products.map((p) => {
          const isActive = activeProduct.id === p.id;
          return (
            <motion.button
              key={p.id}
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveProduct(p)}
              className={`relative p-6 rounded-[2.5rem] border transition-all duration-500 text-left overflow-hidden group ${
                isActive 
                ? `bg-gradient-to-br ${p.grad} border-transparent shadow-xl shadow-indigo-200` 
                : 'bg-white border-slate-100 hover:border-indigo-200 shadow-sm'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeGlow"
                  className="absolute inset-0 bg-white/20 blur-2xl rounded-full"
                />
              )}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${
                isActive ? 'bg-white/20' : 'bg-slate-50'
              }`}>
                <p.icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-600'}`} />
              </div>
              <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${isActive ? 'text-white/70' : 'text-slate-400'}`}>
                {p.unit} hisobida
              </p>
              <p className={`text-xl font-black uppercase tracking-tighter ${isActive ? 'text-white' : 'text-slate-900'}`}>
                {p.label}
              </p>
            </motion.button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Consumption Chart */}
        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight uppercase">
                  {activeProduct.label} <span className="text-indigo-600">SARFI</span>
                </h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Hududlararo qiyosiy tahlil</p>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
                  <Package className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-black text-slate-600 uppercase tracking-widest">Jami: {totalConsumption.toLocaleString()} {activeProduct.unit}</span>
                </div>
              </div>
            </div>

            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 800 }}
                    height={40}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 700 }} 
                  />
                  <Tooltip 
                    content={<CustomTooltip unit={activeProduct.unit} />} 
                    cursor={{ fill: '#f8fafc', radius: 10 }} 
                  />
                  <Bar 
                    dataKey={activeProduct.id} 
                    radius={[10, 10, 10, 10]} 
                    barSize={32}
                  >
                    {filteredData.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={activeProduct.color}
                        fillOpacity={1 - (index * 0.04)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick Insights Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className="relative z-10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest mb-2">O'rtacha sarf</p>
                  <p className="text-4xl font-black text-white tracking-tighter">{averageConsumption} <span className="text-lg opacity-50 uppercase">{activeProduct.unit}</span></p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform duration-500">
                  <TrendingUp className="w-8 h-8 text-indigo-400" />
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex items-center justify-between group hover:shadow-xl transition-all duration-500">
              <div className="flex items-center gap-6">
                <div className={`p-5 rounded-2xl bg-gradient-to-br ${activeProduct.grad} shadow-lg group-hover:rotate-12 transition-transform duration-500`}>
                  <activeProduct.icon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Eng yuqori sarf</p>
                  <p className="text-2xl font-black text-slate-900 uppercase tracking-tight">{filteredData[0].name}</p>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-indigo-600 transition-colors" />
            </div>
          </div>
        </div>

        {/* District Ranking Sidebar */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col h-full">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Hududlar</h3>
                <div className="p-2 bg-slate-50 rounded-lg">
                   <Search className="w-4 h-4 text-slate-400" />
                </div>
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Sarf bo'yicha saralangan</p>
            </div>

            <div className="relative mb-6">
              <input 
                type="text" 
                placeholder="Hudud qidirish..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-6 pr-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 text-xs font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all"
              />
            </div>

            <div className="flex-1 overflow-y-auto pr-2 no-scrollbar max-h-[500px] space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredData.map((d, index) => (
                  <motion.div
                    key={d.name}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.03 }}
                    className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-md transition-all group cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          {index + 1}
                        </div>
                        <span className="font-black uppercase tracking-tight text-xs text-slate-900">
                          {d.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900 text-sm">
                          {d[activeProduct.id as keyof typeof d]}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">{activeProduct.unit}</span>
                      </div>
                    </div>
                    {/* Tiny Progress Bar */}
                    <div className="mt-3 w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                       <motion.div 
                         initial={{ width: 0 }}
                         animate={{ width: `${((d[activeProduct.id as keyof typeof d] as number) / (filteredData[0][activeProduct.id as keyof typeof d] as number)) * 100}%` }}
                         className="h-full rounded-full"
                         style={{ backgroundColor: activeProduct.color }}
                       />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50">
              <div className="p-4 bg-indigo-50 rounded-2xl flex items-center gap-4">
                 <Info className="w-5 h-5 text-indigo-600 shrink-0" />
                 <p className="text-[10px] font-bold text-indigo-700 leading-relaxed uppercase tracking-wider">
                   Ma'lumotlar oxirgi 24 soat ichida tizimga kiritilgan hisobotlar asosida shakllantirilgan.
                 </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
