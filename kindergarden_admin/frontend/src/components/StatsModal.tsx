import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search } from 'lucide-react';
import { clsx } from 'clsx';
import { MOCK_KINDERGARTENS } from '../lib/mock-data';

export const StatsModal = ({ isOpen, onClose, type }: { isOpen: boolean, onClose: () => void, type: string | null }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('Barchasi');
  const [sortConfig, setSortConfig] = useState<{ key: string, direction: 'asc' | 'desc' } | null>(null);

  if (!isOpen) return null;

  const districts = ['Barchasi', ...Array.from(new Set(MOCK_KINDERGARTENS.map(k => k.district)))];

  let filtered = MOCK_KINDERGARTENS.filter(k => 
    (selectedDistrict === 'Barchasi' || k.district === selectedDistrict) &&
    k.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (sortConfig) {
    filtered.sort((a, b) => {
      const aVal = sortConfig.key === 'attendance' ? a.attendancePercentage : a.totalChildren;
      const bVal = sortConfig.key === 'attendance' ? b.attendancePercentage : b.totalChildren;
      return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/20 backdrop-blur-sm"
      >
        <motion.div 
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.95 }}
          className="bg-white rounded-[24px] sm:rounded-[32px] p-4 sm:p-8 w-full max-w-6xl shadow-2xl flex flex-col max-h-[95vh] sm:max-h-[90vh]"
        >
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight uppercase">Statistika: {type}</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full shrink-0"><X size={18} className="sm:w-5 sm:h-5" /></button>
          </div>

          <div className="flex flex-col sm:flex-row justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
             <div className="relative w-full sm:w-96">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Bog'cha nomi..." 
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
             </div>
             <select 
              className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-bold appearance-none cursor-pointer"
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
             >
               {districts.map(d => <option key={d}>{d}</option>)}
             </select>
          </div>

          <div className="overflow-auto flex-1 -mx-4 sm:mx-0">
            <div className="min-w-[800px] px-4 sm:px-0">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-white z-10">
                  <tr className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                    <th className="px-4 sm:px-6 py-3 sm:py-4">Bog'cha nomi</th>
                    <th className="px-3 sm:px-4 py-3 sm:py-4">Turi</th>
                    <th className="px-3 sm:px-4 py-3 sm:py-4">Tuman</th>
                    <th className="px-3 sm:px-4 py-3 sm:py-4">Direktor</th>
                    <th className="px-3 sm:px-4 py-3 sm:py-4 text-right">Jami</th>
                    <th className="px-3 sm:px-4 py-3 sm:py-4 text-right">09:00 gacha</th>
                    <th className="px-3 sm:px-4 py-3 sm:py-4 text-right">Kelmagan</th>
                    <th 
                      className="px-4 sm:px-6 py-3 sm:py-4 text-right cursor-pointer hover:text-indigo-600"
                      onClick={() => setSortConfig({ key: 'attendance', direction: sortConfig?.direction === 'desc' ? 'asc' : 'desc' })}
                    >
                      Davomat %
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(k => (
                    <tr key={k.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-slate-900 text-[10px] sm:text-xs">{k.name}</td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-[10px] sm:text-xs font-medium text-slate-500 capitalize">{k.type}</td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-[10px] sm:text-xs font-medium text-slate-500">{k.district}</td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-[10px] sm:text-xs font-medium text-slate-500 truncate max-w-[120px]">{k.director}</td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-[10px] sm:text-xs font-black text-slate-900 text-right">{k.totalChildren}</td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-[10px] sm:text-xs font-black text-emerald-600 text-right">{k.attendedBefore9}</td>
                      <td className="px-3 sm:px-4 py-3 sm:py-4 text-[10px] sm:text-xs font-black text-rose-600 text-right">{k.absent}</td>
                      <td className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs font-black text-slate-900 text-right">{k.attendancePercentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
