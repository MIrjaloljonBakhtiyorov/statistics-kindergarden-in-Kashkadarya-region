import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { districts, COLORS } from '../../constants';
import KashkadaryaMap from './KashkadaryaMap';
import StatsGrid from './StatsGrid';
import { Search, MapPin, ArrowUpDown, Filter, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import DistrictDetailModal from '../modals/DistrictDetailModal';

interface TumanStatistikasiProps {
  CustomTooltip: any;
}

const TumanStatistikasi: React.FC<TumanStatistikasiProps> = ({ CustomTooltip }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'attendance' | 'count'>('attendance');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  const filteredAndSortedDistricts = useMemo(() => {
    return districts
      .filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        const factor = sortOrder === 'asc' ? 1 : -1;
        if (sortBy === 'name') return factor * a.name.localeCompare(b.name);
        return factor * (a[sortBy] - b[sortBy]);
      });
  }, [searchTerm, sortBy, sortOrder]);

  // Sync scroll to table row when selected via map
  useEffect(() => {
    if (selectedDistrict) {
      const element = document.getElementById(`district-item-${selectedDistrict}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedDistrict]);

  const toggleSort = (field: 'name' | 'attendance' | 'count') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-8 md:space-y-12">
      <StatsGrid />

      <div className="w-full">
        {/* Search and Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
           <div className="relative w-full md:w-96 group">
             <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
             <input
               type="text"
               placeholder="Hududni izlash..."
               className="w-full pl-14 pr-6 py-5 bg-white border border-slate-100 rounded-[2rem] shadow-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold text-slate-700"
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
           
           <div className="flex gap-3">
             <button 
               onClick={() => toggleSort('attendance')}
               className={`px-6 py-4 rounded-2xl border flex items-center gap-3 font-black text-xs uppercase tracking-widest transition-all ${sortBy === 'attendance' ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}
             >
               <ArrowUpDown className="h-4 w-4" />
               Davomat
             </button>
             <button 
               onClick={() => toggleSort('count')}
               className={`px-6 py-4 rounded-2xl border flex items-center gap-3 font-black text-xs uppercase tracking-widest transition-all ${sortBy === 'count' ? 'bg-slate-900 border-slate-900 text-white shadow-xl' : 'bg-white border-slate-100 text-slate-500 hover:bg-slate-50'}`}
             >
               <Filter className="h-4 w-4" />
               MTTlar
             </button>
           </div>
        </div>

        {/* Interactive Map - NOW FULL WIDTH */}
        <div className="w-full space-y-8">
          <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-sm border border-slate-100 relative overflow-hidden h-full min-h-[600px] flex flex-col">
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full -mr-48 -mt-48 blur-3xl"></div>
            
            <div className="relative z-10 flex-1 flex items-center justify-center bg-slate-50/50 rounded-[3rem] border border-slate-100 p-8">
              <KashkadaryaMap 
                selectedDistrict={selectedDistrict} 
                setSelectedDistrict={setSelectedDistrict} 
              />
            </div>

            <div className="relative z-10 mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center gap-4 transition-all hover:shadow-md">
                <div className="p-4 bg-indigo-500/10 rounded-2xl">
                  <MapPin className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Viloyat Markazi</p>
                  <p className="text-xl text-slate-900 font-black uppercase tracking-tight">Qarshi shahri</p>
                </div>
              </div>
              <div className="p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex items-center justify-between transition-all hover:shadow-md">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-emerald-500/10 rounded-2xl">
                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">O'sish sur'ati</p>
                    <p className="text-xl text-slate-900 font-black uppercase tracking-tight">+2.4%</p>
                  </div>
                </div>
                <div className="h-12 w-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={[
                      { v: 40 }, { v: 60 }, { v: 50 }, { v: 80 }, { v: 70 }, { v: 95 }
                    ]}>
                      <Area type="monotone" dataKey="v" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* District List - Below Map */}
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredAndSortedDistricts.map((district) => (
            <motion.div
              key={district.name}
              id={`district-item-${district.name}`}
              whileHover={{ y: -5 }}
              onClick={() => setSelectedDistrict(district.name)}
              className={`p-6 rounded-[2.5rem] border transition-all cursor-pointer ${
                selectedDistrict === district.name 
                ? 'bg-slate-900 border-slate-900 shadow-2xl' 
                : 'bg-white border-slate-100 hover:shadow-xl hover:border-indigo-100'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${selectedDistrict === district.name ? 'bg-white/10' : 'bg-indigo-50'}`}>
                   <MapPin className={`w-4 h-4 ${selectedDistrict === district.name ? 'text-white' : 'text-indigo-600'}`} />
                </div>
                <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${selectedDistrict === district.name ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'}`}>
                   Sektor #{(districts.indexOf(district) % 4) + 1}
                </div>
              </div>
              <h5 className={`text-lg font-black uppercase tracking-tighter mb-4 ${selectedDistrict === district.name ? 'text-white' : 'text-slate-900'}`}>
                {district.name}
              </h5>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                   <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedDistrict === district.name ? 'text-white/50' : 'text-slate-400'}`}>Davomat</span>
                   <span className={`text-sm font-black ${selectedDistrict === district.name ? 'text-emerald-400' : 'text-emerald-600'}`}>{district.attendance}%</span>
                </div>
                <div className="flex items-center justify-between">
                   <span className={`text-[10px] font-bold uppercase tracking-widest ${selectedDistrict === district.name ? 'text-white/50' : 'text-slate-400'}`}>MTTlar</span>
                   <span className={`text-sm font-black ${selectedDistrict === district.name ? 'text-white' : 'text-slate-900'}`}>{district.count}</span>
                </div>
              </div>
            </motion.div>
          ))}
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
